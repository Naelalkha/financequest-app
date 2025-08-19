// /api/create-checkout-session.js
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
    // 1) IMPORTANT: Vérifier le token Firebase pour obtenir le vrai userId
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      console.error('Missing auth token in create-checkout-session');
      return res.status(401).json({ error: 'Missing auth token' });
    }

    const { db, auth } = initAdmin();
    const decoded = await auth.verifyIdToken(token);
    const userId = decoded.uid; // Le vrai userId depuis Firebase
    const userEmail = decoded.email;

    console.log('Creating checkout session for user:', { userId, email: userEmail });

    // 2) Lire le body pour le plan
    const body = req.body || {};
    const plan = (body.plan === 'yearly' || body.plan === 'monthly') ? body.plan : 'monthly';
    const priceId = plan === 'yearly'
      ? process.env.VITE_STRIPE_PRICE_YEARLY
      : process.env.VITE_STRIPE_PRICE_MONTHLY;

    if (!priceId) {
      console.error('Missing Stripe price id in env');
      return res.status(400).json({ error: 'Missing Stripe price id in env' });
    }

    // 3) Créer ou récupérer le customer Stripe
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};
    
    let stripeCustomerId = userData.stripeCustomerId;
    
    // Si pas de customer, on le créera via Checkout
    if (!stripeCustomerId) {
      console.log('No existing Stripe customer, will be created by Checkout');
    }

    // 4) Créer la session Checkout avec le userId dans les metadata
    const sessionConfig = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: userId, // IMPORTANT: Le userId Firebase
      allow_promotion_codes: true,
      
      // Essai gratuit 7 jours
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId: userId, // IMPORTANT: Aussi dans les metadata de la subscription
          plan: plan,
          app: 'financequest-pwa'
        },
      },

      success_url: `${origin}/premium?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium`,
      
      // Metadata de la session elle-même
      metadata: {
        userId: userId,
        plan: plan
      }
    };

    // Si on a déjà un customer, on le réutilise
    if (stripeCustomerId) {
      sessionConfig.customer = stripeCustomerId;
      console.log('Using existing Stripe customer:', stripeCustomerId);
    } else {
      // Sinon on demande à Stripe de créer un nouveau customer avec l'email
      sessionConfig.customer_email = userEmail || undefined;
      console.log('Creating new Stripe customer with email:', userEmail);
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Checkout session created:', {
      sessionId: session.id,
      userId: userId,
      customerId: stripeCustomerId || 'will be created',
      plan: plan
    });

    return res.status(200).json({ sessionId: session.id });
    
  } catch (err) {
    console.error('create-checkout-session error:', err);
    
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    if (err.code === 'auth/argument-error') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(500).json({ error: 'Failed to create session' });
  }
}