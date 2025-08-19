// /api/webhook.js
// Version finale corrigée - FieldValue correct

import Stripe from 'stripe';
import admin from 'firebase-admin';

// IMPORTANT: Désactiver le body parser de Vercel
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

// Buffer helper pour lire le raw body
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
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
    
    console.log('📝 Raw body length:', rawBody.length);
    console.log('🔐 Signature present:', !!sig);
    console.log('🔑 Secret starts with:', webhookSecret.substring(0, 10));
    
    event = stripe.webhooks.constructEvent(bodyString, sig, webhookSecret);
    console.log('✅ Signature verified! Event:', event.type);
    
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Initialize Firebase
  const { db } = initAdmin();

  console.log('📦 Processing event:', event.type);
  console.log('Event ID:', event.id);

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
          payment_status: session.payment_status,
          status: session.status
        });
        
        const userId = session.client_reference_id || session.metadata?.userId;
        
        if (!userId) {
          console.error('❌ No userId found');
          return res.status(200).send('No userId');
        }
        
        console.log('👤 UserId:', userId);
        
        if (session.subscription) {
          console.log('📊 Fetching subscription details...');
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          
          console.log('Subscription status:', subscription.status);
          
          // IMPORTANT: isPremium = true pour "trialing" ET "active"
          const isPremium = ['trialing', 'active'].includes(subscription.status);
          
          const updateData = {
            isPremium: isPremium,
            premiumStatus: subscription.status,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer,
            currentPeriodEnd: subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            lastWebhookUpdate: new Date().toISOString(),
            // CORRECTION ICI : admin.firestore.FieldValue au lieu de admin.FieldValue
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          console.log('💾 Updating user with:', {
            ...updateData,
            updatedAt: 'serverTimestamp'
          });
          
          await db.collection('users').doc(userId).set(updateData, { merge: true });
          
          console.log('✅ User updated successfully!');
          console.log(`✨ isPremium set to: ${isPremium} (status: ${subscription.status})`);
        } else {
          console.log('⚠️ No subscription in session');
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
          userId: userId
        });
        
        if (userId) {
          const isPremium = ['trialing', 'active'].includes(subscription.status);
          
          await db.collection('users').doc(userId).set({
            isPremium: isPremium,
            premiumStatus: subscription.status,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer,
            currentPeriodEnd: subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            // CORRECTION ICI AUSSI
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          
          console.log(`✅ User ${userId} updated: isPremium=${isPremium}`);
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        
        console.log('❌ Subscription canceled for user:', userId);
        
        if (userId) {
          await db.collection('users').doc(userId).set({
            isPremium: false,
            premiumStatus: 'canceled',
            // CORRECTION ICI AUSSI
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
        
        break;
      }
      
      default:
        console.log('⏭️ Unhandled event:', event.type);
    }
    
    return res.status(200).json({ received: true });
    
  } catch (err) {
    console.error('❌ Processing error:', err);
    console.error('Stack:', err.stack);
    return res.status(500).send('Processing error');
  }
}