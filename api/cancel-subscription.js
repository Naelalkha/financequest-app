// /api/cancel-subscription.js
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialiser Firebase Admin
let app;
if (!getApps().length) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.error('FIREBASE_SERVICE_ACCOUNT is not defined');
      throw new Error('Firebase service account not configured');
    }
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    app = initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export default async function handler(req, res) {
  console.log('=== DEBUT CANCEL-SUBSCRIPTION ===');
  console.log('Method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier que Firebase est initialisé
    if (!app) {
      throw new Error('Firebase not initialized');
    }

    console.log('Body:', req.body);
    const { subscriptionId, userId } = req.body;

    if (!subscriptionId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { subscriptionId, userId }
      });
    }

    // Initialiser Stripe
    let stripe;
    try {
      const Stripe = await import('stripe');
      console.log('Stripe importé avec succès');
      stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY || 'sk_test_51RnceePEdl4W6QSBMc4OlzTmMDM7ta64GPMF7kSCdsGUnStPGiJo5fM2h8L49KK01A0WuHHw6W5RwznMogVf3SIj00g99xK482');
      console.log('Stripe initialisé');
    } catch (stripeError) {
      console.error('Erreur import Stripe:', stripeError);
      return res.status(500).json({ 
        error: 'Failed to import Stripe',
        details: stripeError.message
      });
    }

    console.log('Cancelling subscription:', subscriptionId);

    // Annuler l'abonnement dans Stripe
    const cancelledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true // Annuler à la fin de la période actuelle
    });

    console.log('Subscription cancelled in Stripe:', cancelledSubscription.id);

    // Calculer la date de fin (fin de la période actuelle)
    const endDate = new Date(cancelledSubscription.current_period_end * 1000);

    // Mettre à jour Firebase
    await db.collection('users').doc(userId).update({
      isPremium: true, // Garder premium jusqu'à la fin de la période
      premiumEndDate: endDate.toISOString(),
      subscriptionCancelled: true,
      cancellationDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });

    console.log('User updated in Firebase with end date:', endDate);

    return res.status(200).json({ 
      success: true,
      message: 'Subscription cancelled successfully',
      endDate: endDate.toISOString(),
      subscriptionId: cancelledSubscription.id
    });

  } catch (error) {
    console.error('=== ERREUR COMPLETE ===');
    console.error('Message:', error.message);
    console.error('Type:', error.type);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      type: error.type,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 