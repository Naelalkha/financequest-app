// /api/create-portal-session.js
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialise Firebase Admin une seule fois
let app;
if (!getApps().length) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.error('FIREBASE_SERVICE_ACCOUNT is not defined');
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

export default async function handler(req, res) {
  console.log('=== DEBUT CREATE-PORTAL-SESSION ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Body:', req.body);
    const { userId, customerId: customerIdInput } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Initialiser Stripe
    let stripe;
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51RnceePEdl4W6QSBMc4OlzTmMDM7ta64GPMF7kSCdsGUnStPGiJo5fM2h8L49KK01A0WuHHw6W5RwznMogVf3SIj00g99xK482';
      console.log('Using Stripe secret key:', stripeSecretKey.substring(0, 20) + '...');
      
      stripe = new Stripe(stripeSecretKey);
      console.log('Stripe initialisé avec succès');
    } catch (stripeError) {
      console.error('Erreur initialisation Stripe:', stripeError);
      return res.status(500).json({ 
        error: 'Failed to initialize Stripe',
        details: stripeError.message
      });
    }

    // Résoudre le customerId depuis Firestore si non fourni
    let customerId = customerIdInput;
    if (!customerId) {
      if (!db) {
        return res.status(500).json({ error: 'Firestore not initialized' });
      }
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
    }

    if (!customerId) {
      return res.status(404).json({ error: 'Stripe customer not found for user' });
    }

    console.log('Creating portal session for customer:', customerId);

    // Vérifier que le customer existe
    try {
      const customer = await stripe.customers.retrieve(customerId);
      console.log('Customer found:', customer.id, customer.email);
    } catch (customerError) {
      console.error('Customer not found:', customerError);
      return res.status(404).json({ 
        error: 'Customer not found',
        customerId: customerId
      });
    }

    // Créer la session du portail client
    const returnUrl = `${process.env.ORIGIN || 'https://financequest-app.vercel.app'}/premium`;
    console.log('Return URL:', returnUrl);
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log('Portal session created successfully:', portalSession.id);
    console.log('Portal URL:', portalSession.url);

    return res.status(200).json({ 
      url: portalSession.url,
      sessionId: portalSession.id
    });

  } catch (error) {
    console.error('=== ERREUR COMPLETE ===');
    console.error('Message:', error.message);
    console.error('Type:', error.type);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      type: error.type,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 