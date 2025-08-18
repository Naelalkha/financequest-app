// /api/check-subscription-status.js
// Vercel Serverless Function (Node 18+)

import Stripe from 'stripe';
import * as admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// --- Helpers: init Firebase Admin ---
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
    // 1) Vérifier le token Firebase
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing auth token' });

    const { db, auth } = initAdmin();
    const decoded = await auth.verifyIdToken(token);
    const userId = decoded.uid;

    // 2) Lire le body
    const body = req.body || {};
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Missing subscription ID' });
    }

    // 3) Vérifier le statut de l'abonnement avec Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // 4) Vérifier si l'abonnement appartient à l'utilisateur
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};
    
    if (userData.stripeSubscriptionId !== subscriptionId) {
      return res.status(403).json({ error: 'Subscription does not belong to user' });
    }

    // 5) Déterminer si l'abonnement est actif
    const isActive = ['trialing', 'active'].includes(subscription.status);
    
    // 6) Mettre à jour Firestore si nécessaire
    if (isActive && !userData.isPremium) {
      await userRef.set({
        isPremium: true,
        premiumStatus: subscription.status,
        stripeCustomerId: subscription.customer,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    return res.status(200).json({ 
      isActive,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end
    });

  } catch (err) {
    console.error('check-subscription-status error:', err);
    
    if (err.type === 'StripeInvalidRequestError') {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
