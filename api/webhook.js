// /api/webhook.js
// Vercel Serverless Function (Node 18+)
// Vérifie la signature + met à jour Firestore: isPremium pendant trial/active

import Stripe from 'stripe';
import * as admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

function parseServiceAccount() {
  const raw = process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('Missing VITE_FIREBASE_SERVICE_ACCOUNT');
  try {
    // JSON direct
    const json = JSON.parse(raw);
    if (json.private_key?.includes('\\n')) {
      json.private_key = json.private_key.replace(/\\n/g, '\n');
    }
    return json;
  } catch {
    // Peut-être base64
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    const json = JSON.parse(decoded);
    if (json.private_key?.includes('\\n')) {
      json.private_key = json.private_key.replace(/\\n/g, '\n');
    }
    return json;
  }
}

if (!admin.apps.length) {
  const sa = parseServiceAccount();
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key,
    }),
  });
}

const db = admin.firestore();

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

// Utilitaires Firestore
async function saveStripeCustomerLink(customerId, userId) {
  if (!customerId || !userId) return;
  await db.collection('stripe_customers').doc(customerId).set(
    { userId, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
}

async function findUserIdByCustomer(customerId) {
  if (!customerId) return null;
  const snap = await db.collection('stripe_customers').doc(customerId).get();
  return snap.exists ? snap.data().userId : null;
}

async function setPremiumForUser(userId, data) {
  if (!userId) return;
  const ref = db.collection('users').doc(userId);
  // isPremium = TRUE si trialing ou active
  const isPremium = ['trialing', 'active'].includes(data.status || '');
  const payload = {
    isPremium,
    premiumStatus: data.status || null,
    stripeCustomerId: data.customer || null,
    stripeSubscriptionId: data.subscriptionId || null,
    currentPeriodEnd: data.current_period_end
      ? new Date(data.current_period_end * 1000).toISOString()
      : null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await ref.set(payload, { merge: true });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return res.status(500).send('Server misconfigured');
  }

  let event;
  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // 1) Session de checkout terminée : on mappe le customer <-> user et on met Premium si besoin
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const userId = session.client_reference_id || null;

        if (customerId && userId) {
          await saveStripeCustomerLink(customerId, userId);
        }

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const uidFromMeta = sub.metadata?.userId || userId || (await findUserIdByCustomer(sub.customer));
          await saveStripeCustomerLink(sub.customer, uidFromMeta);

          await setPremiumForUser(uidFromMeta, {
            status: sub.status,
            customer: sub.customer,
            subscriptionId: sub.id,
            current_period_end: sub.current_period_end,
          });
        }
        break;
      }

      // 2) Création/MàJ de l’abonnement : source de vérité pour l’accès
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const uidFromMeta = sub.metadata?.userId || (await findUserIdByCustomer(sub.customer));
        await saveStripeCustomerLink(sub.customer, uidFromMeta);

        await setPremiumForUser(uidFromMeta, {
          status: sub.status,
          customer: sub.customer,
          subscriptionId: sub.id,
          current_period_end: sub.current_period_end,
        });
        break;
      }

      // 3) Suppression d’abonnement : retirer l’accès
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const uidFromMeta = sub.metadata?.userId || (await findUserIdByCustomer(sub.customer));
        await setPremiumForUser(uidFromMeta, {
          status: 'canceled',
          customer: sub.customer,
          subscriptionId: sub.id,
          current_period_end: sub.current_period_end,
        });
        break;
      }

      // (Optionnel) Paiement échoué : tu peux marquer un flag, envoyer un email, etc.
      case 'invoice.payment_failed': {
        // const invoice = event.data.object;
        // const customerId = invoice.customer;
        // const userId = await findUserIdByCustomer(customerId);
        // -> notifier user, etc. (ne coupe pas l’accès tant que la sub n’est pas canceled)
        break;
      }

      default:
        // console.log('Unhandled event type:', event.type);
        break;
    }

    return res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).send('Webhook handler error');
  }
}