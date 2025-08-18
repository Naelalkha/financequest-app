// /api/webhook.js
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Vérifier la clé Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialiser Firebase Admin
let app;
if (!getApps().length) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error('Firebase service account not configured');
    }
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    app = initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

// Config pour désactiver le bodyParser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Fonction pour lire le body brut (retourne un Buffer)
const getRawBody = (req) => {
  return new Promise((resolve, reject) => {
    let bodyChunks = [];
    req.on('data', (chunk) => {
      bodyChunks.push(chunk);
    });
    req.on('end', () => {
      // Retourner le Buffer directement, pas de toString()
      const rawBody = Buffer.concat(bodyChunks);
      resolve(rawBody);
    });
    req.on('error', reject);
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier que Firebase est initialisé
    if (!app) {
      throw new Error('Firebase not initialized');
    }

    const sig = req.headers['stripe-signature'];
    
    // Vérifier le secret webhook
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not defined');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!sig) {
      console.error('Missing stripe signature');
      return res.status(400).json({ error: 'Missing signature' });
    }

    let event;
    let rawBody;

    try {
      rawBody = await getRawBody(req);
      // Utiliser le Buffer directement pour constructEvent
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    console.log('Webhook event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        
        const userId = session.metadata?.userId || session.client_reference_id;
        
        if (!userId) {
          console.error('No userId found in session metadata');
          return res.status(400).json({ error: 'No userId in metadata' });
        }

        console.log(`Activating premium for user: ${userId}`);

        await db.collection('users').doc(userId).update({ 
          isPremium: true,
          premiumStartDate: new Date().toISOString(),
          premiumEndDate: null, // Pas de date de fin pour un abonnement actif
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          stripeSessionId: session.id,
          subscriptionCancelled: false,
          lastUpdated: new Date().toISOString()
        });
        
        console.log(`Premium activated for user ${userId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        const usersSnapshot = await db.collection('users')
          .where('stripeSubscriptionId', '==', subscription.id)
          .limit(1)
          .get();
        
        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await userDoc.ref.update({ 
            isPremium: false,
            premiumEndDate: new Date().toISOString(),
            subscriptionDeleted: true,
            lastUpdated: new Date().toISOString()
          });
          console.log(`Premium cancelled for user ${userDoc.id}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        const usersSnapshot = await db.collection('users')
          .where('stripeSubscriptionId', '==', subscription.id)
          .limit(1)
          .get();
        
        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          const updates = {
            lastUpdated: new Date().toISOString()
          };

          // Si l'abonnement est annulé à la fin de la période
          if (subscription.cancel_at_period_end) {
            const endDate = new Date(subscription.current_period_end * 1000);
            updates.premiumEndDate = endDate.toISOString();
            updates.subscriptionCancelled = true;
            console.log(`Subscription cancelled for user ${userDoc.id}, ends at ${endDate}`);
          }

          // Si l'abonnement est réactivé
          if (!subscription.cancel_at_period_end && subscription.status === 'active') {
            updates.premiumEndDate = null;
            updates.subscriptionCancelled = false;
            console.log(`Subscription reactivated for user ${userDoc.id}`);
          }

          await userDoc.ref.update(updates);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
    });
  }
}