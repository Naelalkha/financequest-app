// /api/create-checkout-session.js
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialiser Firebase Admin une seule fois
let app;
if (!getApps().length) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error('Firebase service account not configured');
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    app = initializeApp({ credential: cert(serviceAccount) });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
} else {
  app = getApps()[0];
}

const auth = app ? getAuth(app) : null;

// Fonction pour vérifier le token Firebase
async function verifyFirebaseToken(authHeader) {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  
  const token = authHeader.substring(7);
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token');
  }
}

export default async function handler(req, res) {
  // CORS headers - restreint en production
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.ORIGIN || 'https://financequest-app.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173', 'https://financequest-app.vercel.app'];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier la clé Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not defined');
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    // Authentifier l'utilisateur
    let userToken;
    try {
      userToken = await verifyFirebaseToken(req.headers.authorization);
    } catch (authError) {
      console.error('Authentication failed:', authError.message);
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Initialiser Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { priceId, plan } = req.body;
    
    // Utiliser les données du token Firebase, pas du body
    const userId = userToken.uid;
    const email = userToken.email;

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId' });
    }

    if (!email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    const origin = process.env.ORIGIN || 'https://financequest-app.vercel.app';

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${origin}/premium?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium`,
      customer_email: email,
      metadata: {
        userId: userId,
        priceId: priceId,
        plan: plan || 'monthly'
      },
      subscription_data: {
        trial_period_days: 7
      }
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error.message);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
}