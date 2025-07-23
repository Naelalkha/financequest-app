// /api/webhook.js (pour Vercel, dans le dossier /api à la racine)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialiser Firebase Admin une seule fois
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

// Config pour désactiver le bodyParser de Vercel
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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Missing stripe signature or webhook secret');
    return res.status(400).json({ error: 'Missing configuration' });
  }

  let event;
  let rawBody;

  try {
    // Récupérer le body brut
    rawBody = await getRawBody(req);
    
    // Vérifier la signature Stripe
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Log l'event type
  console.log('Webhook event type:', event.type);

  // Gérer les événements
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        
        // Récupérer le userId depuis metadata ou client_reference_id
        const userId = session.metadata?.userId || session.client_reference_id;
        
        if (!userId) {
          console.error('No userId found in session metadata');
          return res.status(400).json({ error: 'No userId in metadata' });
        }

        console.log(`Activating premium for user: ${userId}`);

        // Mettre à jour l'utilisateur dans Firestore
        await db.collection('users').doc(userId).update({ 
          premium: true,
          premiumStartDate: admin.firestore.FieldValue.serverTimestamp(),
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          stripeSessionId: session.id
        });
        
        console.log(`Premium activated for user ${userId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        try {
          // Trouver l'utilisateur par stripeSubscriptionId
          const usersSnapshot = await db.collection('users')
            .where('stripeSubscriptionId', '==', subscription.id)
            .limit(1)
            .get();
          
          if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            await userDoc.ref.update({ 
              premium: false,
              premiumEndDate: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Premium cancelled for user ${userDoc.id}`);
          }
        } catch (error) {
          console.error('Error handling subscription cancellation:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Retourner une réponse de succès
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}