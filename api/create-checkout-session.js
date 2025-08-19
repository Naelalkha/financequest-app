// /api/create-checkout-session.js
// Version corrigée avec import firebase-admin fixé

import Stripe from 'stripe';
import admin from 'firebase-admin'; // Import par défaut, pas avec *

// Log de démarrage
console.log('=== FUNCTION COLD START ===');
console.log('Environment check:');
console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Present' : 'MISSING');
console.log('- VITE_FIREBASE_SERVICE_ACCOUNT:', process.env.VITE_FIREBASE_SERVICE_ACCOUNT ? `Present (${process.env.VITE_FIREBASE_SERVICE_ACCOUNT.length} chars)` : 'MISSING');
console.log('- VITE_STRIPE_PRICE_MONTHLY:', process.env.VITE_STRIPE_PRICE_MONTHLY || 'MISSING');
console.log('- VITE_STRIPE_PRICE_YEARLY:', process.env.VITE_STRIPE_PRICE_YEARLY || 'MISSING');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Variable globale pour éviter les réinitialisations
let adminApp = null;

// Helper pour parser le service account
function parseServiceAccount() {
  const raw = process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('VITE_FIREBASE_SERVICE_ACCOUNT is not defined');
  }

  console.log('Service Account raw length:', raw.length);
  console.log('First 50 chars:', raw.substring(0, 50));
  
  let serviceAccount;
  
  // Essai 1: JSON direct
  try {
    serviceAccount = JSON.parse(raw);
    console.log('Service Account parsed as direct JSON');
  } catch (e1) {
    console.log('Direct JSON parse failed:', e1.message);
    
    // Essai 2: Base64
    try {
      const decoded = Buffer.from(raw, 'base64').toString('utf8');
      serviceAccount = JSON.parse(decoded);
      console.log('Service Account parsed as base64');
    } catch (e2) {
      console.log('Base64 parse failed:', e2.message);
      
      // Essai 3: Peut-être que c'est échappé
      try {
        const unescaped = raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        serviceAccount = JSON.parse(unescaped);
        console.log('Service Account parsed as escaped JSON');
      } catch (e3) {
        console.log('Escaped JSON parse failed:', e3.message);
        throw new Error('Could not parse service account in any format');
      }
    }
  }
  
  // Vérifier que le service account a les champs requis
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.error('Service account missing required fields:', {
      has_project_id: !!serviceAccount.project_id,
      has_private_key: !!serviceAccount.private_key,
      has_client_email: !!serviceAccount.client_email
    });
    throw new Error('Service account is missing required fields');
  }
  
  // Nettoyer la private key
  if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  
  console.log('Service Account validated:', {
    project_id: serviceAccount.project_id,
    client_email: serviceAccount.client_email
  });
  
  return serviceAccount;
}

// Init Firebase Admin
function initAdmin() {
  // Si déjà initialisé, retourner l'instance existante
  if (adminApp) {
    return {
      db: adminApp.firestore(),
      auth: adminApp.auth(),
    };
  }
  
  // Vérifier si une app existe déjà (au cas où)
  try {
    const apps = admin.apps || [];
    if (apps.length > 0) {
      console.log('Firebase Admin already initialized');
      adminApp = apps[0];
      return {
        db: adminApp.firestore(),
        auth: adminApp.auth(),
      };
    }
  } catch (e) {
    console.log('No existing Firebase apps');
  }
  
  // Parser et initialiser
  const serviceAccount = parseServiceAccount();
  
  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin init error:', error);
    throw error;
  }
  
  return {
    db: adminApp.firestore(),
    auth: adminApp.auth(),
  };
}

function setCORS(res, origin) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getOrigin(req) {
  const origin = req.headers.origin || 'https://financequest-app.vercel.app';
  console.log('Request origin:', origin);
  return origin;
}

export default async function handler(req, res) {
  console.log('\n=== REQUEST START ===');
  console.log('Method:', req.method);
  console.log('Path:', req.url);
  console.log('Headers:', {
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? 'Present' : 'Missing',
    'origin': req.headers.origin
  });
  
  const origin = getOrigin(req);
  setCORS(res, origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return res.status(204).end();
  }
  
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Test Stripe first
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    
    // IMPORTANT: Vérifier le mismatch test/live
    const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
    const priceMonthly = process.env.VITE_STRIPE_PRICE_MONTHLY;
    const priceYearly = process.env.VITE_STRIPE_PRICE_YEARLY;
    
    console.log('Stripe mode:', isTestMode ? 'TEST' : 'LIVE');
    console.log('Price IDs:', { monthly: priceMonthly, yearly: priceYearly });
    
    // ERREUR CRITIQUE: Tu utilises des clés de TEST avec des price IDs de PRODUCTION !
    if (isTestMode) {
      // En mode test, on doit utiliser des price IDs de test
      // Tu dois créer des produits de TEST dans Stripe Dashboard
      console.error('CRITICAL: Using TEST Stripe key but price IDs look like production!');
      console.error('You need to create TEST products in Stripe Dashboard (test mode)');
      
      // Pour l'instant, on continue mais ça va échouer
      return res.status(503).json({ 
        error: 'Stripe configuration mismatch',
        details: 'Test mode active but using production price IDs. Please create test products in Stripe Dashboard.',
        solution: 'Go to Stripe Dashboard, switch to TEST mode, create products with 4.99€/month and 39.99€/year prices, then update VITE_STRIPE_PRICE_MONTHLY and VITE_STRIPE_PRICE_YEARLY in Vercel'
      });
    }

    // Get auth token
    const authHeader = req.headers.authorization || '';
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Missing authorization header',
        code: 'NO_AUTH_HEADER'
      });
    }
    
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    
    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    console.log('Token extracted, length:', token.length);

    // Initialize Firebase Admin
    console.log('Initializing Firebase Admin...');
    const { db, auth } = initAdmin();
    
    // Verify token
    console.log('Verifying Firebase token...');
    let decoded;
    try {
      decoded = await auth.verifyIdToken(token);
      console.log('Token verified successfully for uid:', decoded.uid);
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return res.status(401).json({ 
        error: 'Token verification failed',
        code: verifyError.code || 'TOKEN_VERIFY_ERROR',
        details: verifyError.message
      });
    }
    
    const userId = decoded.uid;
    const userEmail = decoded.email;
    console.log('User:', { userId, email: userEmail });

    // Parse request body
    const body = req.body || {};
    const plan = body.plan === 'yearly' ? 'yearly' : 'monthly';
    const priceId = plan === 'yearly' ? priceYearly : priceMonthly;
    
    if (!priceId) {
      throw new Error(`Price ID not configured for plan: ${plan}`);
    }
    
    console.log('Creating checkout for:', { plan, priceId });

    // Check/create user in Firestore
    let stripeCustomerId;
    try {
      const userRef = db.collection('users').doc(userId);
      const userSnap = await userRef.get();
      
      if (userSnap.exists) {
        stripeCustomerId = userSnap.data().stripeCustomerId;
        console.log('User exists in Firestore, customerId:', stripeCustomerId || 'none');
      } else {
        console.log('Creating new user in Firestore');
        await userRef.set({
          email: userEmail,
          createdAt: admin.FieldValue.serverTimestamp(),
        });
      }
    } catch (firestoreError) {
      console.error('Firestore error (non-fatal):', firestoreError);
      // Continue without customer ID
    }

    // Create Stripe checkout session
    console.log('Creating Stripe checkout session...');
    const sessionConfig = {
      mode: 'subscription',
      line_items: [{ 
        price: priceId, 
        quantity: 1 
      }],
      client_reference_id: userId,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId: userId,
          plan: plan,
          app: 'financequest-pwa'
        },
      },
      success_url: `${origin}/premium?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium`,
      metadata: {
        userId: userId,
        plan: plan
      }
    };

    if (stripeCustomerId) {
      sessionConfig.customer = stripeCustomerId;
    } else if (userEmail) {
      sessionConfig.customer_email = userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log('Checkout session created:', session.id);

    return res.status(200).json({ 
      sessionId: session.id,
      success: true
    });
    
  } catch (error) {
    console.error('=== ERROR CAUGHT ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Determiner le type d'erreur pour un meilleur message
    if (error.message && error.message.includes('STRIPE_SECRET_KEY')) {
      return res.status(503).json({ 
        error: 'Payment system not configured',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }
    
    if (error.message && error.message.includes('service account')) {
      return res.status(503).json({ 
        error: 'Authentication system misconfigured',
        code: 'FIREBASE_CONFIG_ERROR'
      });
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        error: 'Invalid payment configuration',
        code: 'STRIPE_CONFIG_ERROR',
        details: error.message
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}