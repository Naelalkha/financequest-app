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

async function updateSubscriptionData(userId, subscription) {
  if (!userId || !subscription) return;
  
  const { db } = initAdmin();
  
  // Déterminer le statut exact avec plus de précision
  let premiumStatus = subscription.status;
  let isPremium = false;
  
  switch(subscription.status) {
    case 'active':
      isPremium = true;
      premiumStatus = 'active';
      break;
    case 'trialing':
      isPremium = true;
      premiumStatus = 'trialing';
      break;
    case 'past_due':
      isPremium = true; // Accès maintenu temporairement
      premiumStatus = 'past_due';
      break;
    case 'incomplete':
      isPremium = false;
      premiumStatus = 'incomplete';
      break;
    case 'incomplete_expired':
      isPremium = false;
      premiumStatus = 'expired';
      break;
    case 'canceled':
      isPremium = false;
      premiumStatus = 'canceled';
      break;
    case 'unpaid':
      isPremium = false;
      premiumStatus = 'unpaid';
      break;
    default:
      isPremium = false;
      premiumStatus = subscription.status;
  }
  
  // Si annulé mais toujours dans la période payée
  if (subscription.cancel_at_period_end && subscription.current_period_end) {
    const periodEnd = new Date(subscription.current_period_end * 1000);
    if (periodEnd > new Date()) {
      isPremium = true;
      premiumStatus = 'canceling';
    }
  }
  
  const updateData = {
    isPremium: isPremium,
    premiumStatus: premiumStatus,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer,
    currentPeriodEnd: subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    trialEnd: subscription.trial_end 
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    canceledAt: subscription.canceled_at 
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    // Nouveau : sauver la prochaine tentative de paiement
    nextPaymentAttempt: subscription.next_pending_invoice_item_invoice
      ? new Date(subscription.next_pending_invoice_item_invoice * 1000).toISOString()
      : null,
    lastWebhookUpdate: new Date().toISOString(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  console.log('💾 Updating subscription data:', {
    userId,
    isPremium,
    premiumStatus,
    currentPeriodEnd: updateData.currentPeriodEnd,
    trialEnd: updateData.trialEnd
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
          
          await db.collection('users').doc(userId).set({
            isPremium: false,
            premiumStatus: 'canceled',
            currentPeriodEnd: subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : new Date().toISOString(),
            canceledAt: new Date().toISOString(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
        
        break;
      }
      
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        
        console.log('⏰ Trial ending in 3 days for user:', userId);
        
        if (userId) {
          const { db } = initAdmin();
          
          await db.collection('users').doc(userId).set({
            trialEndingSoon: true,
            trialEndReminder: new Date().toISOString(),
            lastWebhookUpdate: new Date().toISOString(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          
          console.log('📧 Should send trial ending reminder email');
        }
        
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        console.log('💰 Payment succeeded for subscription:', subscriptionId);
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;
          
          if (userId) {
            // Utiliser updateSubscriptionData pour avoir toutes les infos à jour
            await updateSubscriptionData(userId, subscription);
            
            // Ajouter info spécifique au paiement réussi
            const { db } = initAdmin();
            await db.collection('users').doc(userId).set({
              lastPaymentDate: new Date().toISOString(),
              lastPaymentAmount: invoice.amount_paid / 100, // Convertir de cents
              lastInvoiceId: invoice.id
            }, { merge: true });
            
            console.log('✅ Payment recorded for user');
          }
        }
        
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        console.log('❌ Payment failed for subscription:', subscriptionId);
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;
          
          if (userId) {
            const { db } = initAdmin();
            
            await db.collection('users').doc(userId).set({
              isPremium: true, // Encore accès temporairement
              premiumStatus: 'past_due',
              lastPaymentFailure: new Date().toISOString(),
              paymentFailureReason: invoice.last_payment_error?.message || 'Payment failed',
              nextRetryAt: invoice.next_payment_attempt 
                ? new Date(invoice.next_payment_attempt * 1000).toISOString()
                : null,
              lastWebhookUpdate: new Date().toISOString(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('⚠️ User marked as past_due after payment failure');
          }
        }
        
        break;
      }
      
      case 'payment_method.attached': {
        const paymentMethod = event.data.object;
        const customerId = paymentMethod.customer;
        
        console.log('💳 Payment method attached to customer:', customerId);
        
        // Récupérer l'userId depuis le customerId stocké dans users
        const { db } = initAdmin();
        const usersSnapshot = await db.collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get();
        
        if (!usersSnapshot.empty) {
          const userId = usersSnapshot.docs[0].id;
          
          await db.collection('users').doc(userId).set({
            hasPaymentMethod: true,
            lastPaymentMethodUpdate: new Date().toISOString(),
            paymentMethodType: paymentMethod.type,
            paymentMethodLast4: paymentMethod.card?.last4 || null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          
          console.log('✅ Payment method status updated for user');
        }
        
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