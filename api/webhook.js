// /api/webhook.js
// Version corrigée avec currentPeriodEnd toujours sauvegardé

import Stripe from 'stripe';
import admin from 'firebase-admin';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Parse service account
function parseServiceAccount() {
  const raw = process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('Missing VITE_FIREBASE_SERVICE_ACCOUNT');
  
  try {
    const json = JSON.parse(raw);
    if (json.private_key?.includes('\\n')) {
      json.private_key = json.private_key.replace(/\\n/g, '\n');
    }
    return json;
  } catch {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    const json = JSON.parse(decoded);
    if (json.private_key?.includes('\\n')) {
      json.private_key = json.private_key.replace(/\\n/g, '\n');
    }
    return json;
  }
}

// Initialize Firebase Admin once
let adminApp = null;
let db = null;

function initAdmin() {
  if (adminApp && db) return { db };
  
  try {
    if (admin.apps && admin.apps.length > 0) {
      adminApp = admin.apps[0];
      db = admin.firestore();
      return { db };
    }
  } catch (e) {
    // No existing app
  }
  
  const sa = parseServiceAccount();
  adminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key,
    }),
  });
  
  db = admin.firestore();
  return { db };
}

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Fonction helper pour sauvegarder les données d'abonnement
async function updateSubscriptionData(userId, subscription) {
  if (!userId || !subscription) return;
  
  const { db } = initAdmin();
  
  // Déterminer le statut exact
  let premiumStatus = subscription.status;
  let isPremium = false;
  
  if (subscription.status === 'canceled') {
    // Abonnement complètement terminé
    isPremium = false;
    premiumStatus = 'canceled';
  } else if (subscription.cancel_at_period_end) {
    // Abonnement annulé mais encore actif jusqu'à la fin
    isPremium = true;
    premiumStatus = 'canceling';
  } else if (['trialing', 'active'].includes(subscription.status)) {
    // Abonnement actif normal
    isPremium = true;
    premiumStatus = subscription.status;
  }
  
  const updateData = {
    isPremium: isPremium,
    premiumStatus: premiumStatus,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer,
    // TOUJOURS sauvegarder currentPeriodEnd
    currentPeriodEnd: subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    // Sauvegarder aussi trial_end si en période d'essai
    trialEnd: subscription.trial_end 
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    canceledAt: subscription.canceled_at 
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    lastWebhookUpdate: new Date().toISOString(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  console.log('💾 Updating subscription data:', {
    userId,
    isPremium,
    premiumStatus,
    currentPeriodEnd: updateData.currentPeriodEnd
  });
  
  await db.collection('users').doc(userId).set(updateData, { merge: true });
  
  console.log('✅ Subscription data updated successfully');
}

export default async function handler(req, res) {
  console.log('🔔 Webhook received:', req.method);
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('❌ Missing STRIPE_WEBHOOK_SECRET!');
    return res.status(500).send('Webhook secret not configured');
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    console.error('❌ No stripe-signature header');
    return res.status(400).send('No signature');
  }

  let event;
  
  try {
    const rawBody = await buffer(req);
    const bodyString = rawBody.toString('utf8');
    event = stripe.webhooks.constructEvent(bodyString, sig, webhookSecret);
    console.log('✅ Signature verified! Event:', event.type);
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('📦 Processing event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        console.log('🎉 Checkout completed!');
        console.log('Session:', {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          client_reference_id: session.client_reference_id,
          payment_status: session.payment_status
        });
        
        const userId = session.client_reference_id || session.metadata?.userId;
        
        if (!userId) {
          console.error('❌ No userId found');
          return res.status(200).send('No userId');
        }
        
        if (session.subscription) {
          console.log('📊 Fetching subscription details...');
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          
          // Utiliser la fonction helper qui sauvegarde toujours currentPeriodEnd
          await updateSubscriptionData(userId, subscription);
        }
        
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        
        console.log('📊 Subscription event:', {
          type: event.type,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: subscription.current_period_end
        });
        
        if (userId) {
          await updateSubscriptionData(userId, subscription);
        } else {
          console.log('⚠️ No userId in subscription metadata');
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        
        console.log('❌ Subscription deleted for user:', userId);
        
        if (userId) {
          const { db } = initAdmin();
          
          // Quand l'abonnement est supprimé, on garde l'info de quand ça s'est terminé
          await db.collection('users').doc(userId).set({
            isPremium: false,
            premiumStatus: 'canceled',
            currentPeriodEnd: subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : new Date().toISOString(), // Si pas de date, c'est terminé maintenant
            canceledAt: new Date().toISOString(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
        
        break;
      }
      
      // Événement quand l'essai va se terminer (optionnel)
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object;
        console.log('⏰ Trial will end soon for subscription:', subscription.id);
        // Tu peux envoyer un email de rappel ici
        break;
      }
      
      default:
        console.log('⏭️ Unhandled event:', event.type);
    }
    
    return res.status(200).json({ received: true });
    
  } catch (err) {
    console.error('❌ Processing error:', err);
    return res.status(500).send('Processing error');
  }
}