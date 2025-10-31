const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Trigger automatique : recalcule les agrégats d'impact
 * à chaque création/modification/suppression d'un savingsEvent
 * 
 * Calcule :
 * - impactAnnualEstimated : total annualisé de toutes les économies
 * - impactAnnualVerified : total annualisé des économies vérifiées
 * - proofsVerifiedCount : nombre d'événements vérifiés
 */
exports.aggregateSavingsImpact = functions.firestore
  .document('users/{uid}/savingsEvents/{eventId}')
  .onWrite(async (change, context) => {
    const uid = context.params.uid;

    try {
      // Récupérer tous les savingsEvents de l'utilisateur
      const eventsSnapshot = await db
        .collection('users')
        .doc(uid)
        .collection('savingsEvents')
        .get();

      let sumEstimated = 0;
      let sumVerified = 0;
      let countVerified = 0;

      // Parcourir tous les événements et calculer les totaux
      eventsSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Vérifier que les données sont valides
        if (!data || typeof data.amount !== 'number' || data.amount <= 0) {
          console.warn(`Invalid savings event data for ${uid}/${doc.id}`);
          return;
        }

        // Annualiser le montant selon la période
        const annual = data.amount * (data.period === 'month' ? 12 : 1);
        
        // Ajouter au total estimé
        sumEstimated += annual;

        // Si vérifié, ajouter au total vérifié
        if (data.verified === true) {
          sumVerified += annual;
          countVerified += 1;
        }
      });

      // Mettre à jour le document user avec les agrégats
      await db.collection('users').doc(uid).update({
        impactAnnualEstimated: Math.round(sumEstimated * 100) / 100, // Arrondir à 2 décimales
        impactAnnualVerified: Math.round(sumVerified * 100) / 100,
        proofsVerifiedCount: countVerified,
        lastImpactRecalcAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Aggregates updated for user ${uid}:`, {
        estimated: sumEstimated,
        verified: sumVerified,
        count: countVerified,
      });

      return null;
    } catch (error) {
      console.error(`❌ Error aggregating savings for user ${uid}:`, error);
      throw error;
    }
  });

/**
 * Callable Function : recalcule manuellement les agrégats d'un utilisateur
 * Utile pour le backfill ou le debugging
 * 
 * Usage : 
 * const recompute = functions.httpsCallable('recomputeUserImpact');
 * await recompute({ uid: 'user-id' });
 */
exports.recomputeUserImpact = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to call this function.'
    );
  }

  const uid = data.uid || context.auth.uid;

  // Si uid différent de l'utilisateur connecté, vérifier les droits admin
  if (uid !== context.auth.uid) {
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const isAdmin = userDoc.data()?.isAdmin === true;
    
    if (!isAdmin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can recompute impact for other users.'
      );
    }
  }

  try {
    // Récupérer tous les savingsEvents
    const eventsSnapshot = await db
      .collection('users')
      .doc(uid)
      .collection('savingsEvents')
      .get();

    let sumEstimated = 0;
    let sumVerified = 0;
    let countVerified = 0;

    eventsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      if (!data || typeof data.amount !== 'number' || data.amount <= 0) {
        return;
      }

      const annual = data.amount * (data.period === 'month' ? 12 : 1);
      sumEstimated += annual;

      if (data.verified === true) {
        sumVerified += annual;
        countVerified += 1;
      }
    });

    // Mettre à jour
    await db.collection('users').doc(uid).update({
      impactAnnualEstimated: Math.round(sumEstimated * 100) / 100,
      impactAnnualVerified: Math.round(sumVerified * 100) / 100,
      proofsVerifiedCount: countVerified,
      lastImpactRecalcAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      uid,
      estimated: sumEstimated,
      verified: sumVerified,
      count: countVerified,
    };
  } catch (error) {
    console.error(`❌ Error recomputing impact for user ${uid}:`, error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

