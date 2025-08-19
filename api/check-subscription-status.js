// /api/check-subscription-status.js
// Endpoint de réconciliation pour synchroniser Stripe <-> Firebase
// Utile si webhook échoue ou pour vérification manuelle

import Stripe from 'stripe';
import * as admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Init Firebase Admin
function initAdmin() {
  if (!admin.apps.length) {
    const raw = process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('Missing VITE_FIREBASE_SERVICE_ACCOUNT');
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(raw);
    } catch {
      throw new Error('Invalid VITE_FIREBASE_SERVICE_ACCOUNT JSON');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return {
    db: admin.firestore(),
    auth: admin.auth(),
  };
}

function setCORS(res, origin) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getOrigin(req) {
  return process.env.ORIGIN || req.headers.origin || 'http://localhost:5173';
}

export default async function handler(req, res) {
  const origin = getOrigin(req);
  setCORS(res, origin);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing auth token' });

    const { db, auth } = initAdmin();
    const decoded = await auth.verifyIdToken(token);
    const userId = decoded.uid;

    console.log('Manual subscription check for user:', userId);

    // Récupérer les données utilisateur
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};

    // Option 1: subscriptionId fourni dans la requête
    const { subscriptionId } = req.body || {};
    
    // Option 2: utiliser le subscriptionId stocké
    const subIdToCheck = subscriptionId || userData.stripeSubscriptionId;
    
    if (!subIdToCheck) {
      // Pas d'abonnement à vérifier
      console.log('No subscription to check for user:', userId);
      return res.status(200).json({ 
        isActive: false,
        status: 'no_subscription',
        message: 'No subscription found for this user'
      });
    }

    // Vérifier avec Stripe
    let subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(subIdToCheck);
    } catch (stripeError) {
      if (stripeError.type === 'StripeInvalidRequestError') {
        // L'abonnement n'existe plus sur Stripe
        console.log('Subscription not found on Stripe, cleaning up:', subIdToCheck);
        
        // Nettoyer Firebase
        await userRef.set({
          isPremium: false,
          premiumStatus: 'canceled',
          stripeSubscriptionId: admin.firestore.FieldValue.delete(),
          currentPeriodEnd: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        
        return res.status(200).json({ 
          isActive: false,
          status: 'not_found',
          message: 'Subscription not found on Stripe'
        });
      }
      throw stripeError;
    }
    
    console.log('Stripe subscription status:', {
      id: subscription.id,
      status: subscription.status,
      customer: subscription.customer
    });
    
    // Vérifier que l'abonnement appartient bien à cet utilisateur
    const isOwner = 
      subscription.metadata?.userId === userId ||
      userData.stripeCustomerId === subscription.customer;
    
    if (!isOwner && subscriptionId) {
      // Si l'ID a été fourni manuellement et ne correspond pas
      console.error('Subscription ownership mismatch');
      return res.status(403).json({ error: 'Subscription does not belong to user' });
    }
    
    // Déterminer le statut
    const isActive = ['trialing', 'active'].includes(subscription.status);
    
    // Toujours synchroniser Firebase avec Stripe (source de vérité)
    const updatePayload = {
      isPremium: isActive,
      premiumStatus: subscription.status,
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    console.log('Syncing Firebase with Stripe:', { userId, isActive });
    await userRef.set(updatePayload, { merge: true });
    
    // Sauvegarder le mapping customer
    if (subscription.customer) {
      await db.collection('stripe_customers').doc(subscription.customer).set(
        { userId, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    }

    return res.status(200).json({ 
      isActive,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      synced: true
    });

  } catch (err) {
    console.error('check-subscription-status error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}