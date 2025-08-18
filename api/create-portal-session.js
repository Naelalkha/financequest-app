// /api/create-portal-session.js
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

const db = app ? getFirestore(app) : null;
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

    // Utiliser l'userId du token Firebase, pas du body
    const userId = userToken.uid;

    // Initialiser Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Récupérer le customerId depuis Firestore
    if (!db) {
      return res.status(500).json({ error: 'Firestore not initialized' });
    }

    let customerId;
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      const userData = userDoc.data();
      customerId = userData.stripeCustomerId;
    } catch (err) {
      console.error('Error fetching user from Firestore:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    if (!customerId) {
      return res.status(404).json({ error: 'Stripe customer not found for user' });
    }

    // Vérifier que le customer existe
    try {
      await stripe.customers.retrieve(customerId);
    } catch (customerError) {
      console.error('Customer not found:', customerError);
      return res.status(404).json({ 
        error: 'Customer not found',
        customerId: customerId
      });
    }

    // Créer la session du portail client
    const returnUrl = `${process.env.ORIGIN || 'https://financequest-app.vercel.app'}/premium`;
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return res.status(200).json({ 
      url: portalSession.url,
      sessionId: portalSession.id
    });

  } catch (error) {
    console.error('Portal session error:', error.message);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
} 