// /api/webhook.js
import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51RnceePEdl4W6QSBMc4OlzTmMDM7ta64GPMF7kSCdsGUnStPGiJo5fM2h8L49KK01A0WuHHw6W5RwznMogVf3SIj00g99xK482');

// Initialiser Firebase Admin
let app;
if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
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

// Fonction pour lire le body brut
const getRawBody = (req) => {
  return new Promise((resolve, reject) => {
    let bodyChunks = [];
    req.on('data', (chunk) => {
      bodyChunks.push(chunk);
    });
    req.on('end', () => {
      const rawBody = Buffer.concat(bodyChunks).toString('utf8');
      resolve(rawBody);
    });
    req.on('error', reject);
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_DuqP562WnIttXBoALLVInBjbBbRmcXlS';

  if (!sig) {
    console.error('Missing stripe signature');
    return res.status(400).json({ error: 'Missing signature' });
  }

  let event;
  let rawBody;

  try {
    rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log('Webhook event type:', event.type);

  try {
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
          premium: true,
          premiumStartDate: new Date(),
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          stripeSessionId: session.id
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
            premium: false,
            premiumEndDate: new Date()
          });
          console.log(`Premium cancelled for user ${userDoc.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}