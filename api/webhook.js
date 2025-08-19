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
  if (!customerId || !userId) {
    console.log('Cannot save customer link, missing data:', { customerId, userId });
    return;
  }
  console.log('Saving customer link:', { customerId, userId });
  await db.collection('stripe_customers').doc(customerId).set(
    { userId, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
}

async function findUserIdByCustomer(customerId) {
  if (!customerId) return null;
  const snap = await db.collection('stripe_customers').doc(customerId).get();
  const userId = snap.exists ? snap.data().userId : null;
  console.log('Found userId by customer:', { customerId, userId });
  return userId;
}

async function setPremiumForUser(userId, data) {
  if (!userId) {
    console.error('Cannot set premium: no userId provided');
    return;
  }
  
  const ref = db.collection('users').doc(userId);
  
  // Vérifier si l'utilisateur existe
  const userSnap = await ref.get();
  if (!userSnap.exists) {
    console.error('User document does not exist:', userId);
    // Créer le document utilisateur s'il n'existe pas
    await ref.set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  
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
  
  console.log('Setting premium for user:', { 
    userId, 
    isPremium, 
    status: data.status, 
    subscriptionId: data.subscriptionId 
  });
  
  await ref.set(payload, { merge: true });
  
  console.log('Premium status updated successfully for user:', userId);
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

  console.log('Received webhook event:', event.type);

  try {
    switch (event.type) {
      // 1) Session de checkout terminée
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const userId = session.client_reference_id || session.metadata?.userId || null;

        console.log('Checkout session completed:', { 
          sessionId: session.id, 
          customerId, 
          subscriptionId, 
          userId,
          metadata: session.metadata 
        });

        if (!userId) {
          console.error('No userId found in checkout session!');
          // Essayer de retrouver via l'email
          if (session.customer_email) {
            try {
              const userRecord = await admin.auth().getUserByEmail(session.customer_email);
              if (userRecord) {
                console.log('Found user by email:', userRecord.uid);
                const foundUserId = userRecord.uid;
                
                // Sauvegarder le lien et mettre à jour premium
                if (customerId && foundUserId) {
                  await saveStripeCustomerLink(customerId, foundUserId);
                }
                
                if (subscriptionId) {
                  const sub = await stripe.subscriptions.retrieve(subscriptionId);
                  await setPremiumForUser(foundUserId, {
                    status: sub.status,
                    customer: sub.customer,
                    subscriptionId: sub.id,
                    current_period_end: sub.current_period_end,
                  });
                }
              }
            } catch (e) {
              console.error('Could not find user by email:', e);
            }
          }
        } else {
          // On a le userId, on procède normalement
          if (customerId && userId) {
            await saveStripeCustomerLink(customerId, userId);
          }

          if (subscriptionId) {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            console.log('Retrieved subscription:', { 
              id: sub.id, 
              status: sub.status,
              trial_end: sub.trial_end,
              metadata: sub.metadata 
            });
            
            // Toujours utiliser le userId de la session en priorité
            const finalUserId = userId || sub.metadata?.userId;
            
            if (finalUserId) {
              await setPremiumForUser(finalUserId, {
                status: sub.status,
                customer: sub.customer,
                subscriptionId: sub.id,
                current_period_end: sub.current_period_end,
              });
            } else {
              console.error('No userId found for subscription!');
            }
          }
        }
        break;
      }

      // 2) Création/MàJ de l'abonnement
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        console.log('Subscription event:', { 
          type: event.type,
          id: sub.id, 
          status: sub.status,
          metadata: sub.metadata 
        });
        
        // Chercher le userId depuis les metadata ou le mapping customer
        let userId = sub.metadata?.userId;
        
        if (!userId) {
          userId = await findUserIdByCustomer(sub.customer);
        }
        
        if (!userId) {
          console.error('Cannot find userId for subscription:', sub.id);
          // Essayer de retrouver via l'email du customer
          try {
            const customer = await stripe.customers.retrieve(sub.customer);
            if (customer.email) {
              const userRecord = await admin.auth().getUserByEmail(customer.email);
              if (userRecord) {
                userId = userRecord.uid;
                console.log('Found user by customer email:', userId);
                await saveStripeCustomerLink(sub.customer, userId);
              }
            }
          } catch (e) {
            console.error('Could not find user by customer email:', e);
          }
        }
        
        if (userId) {
          await setPremiumForUser(userId, {
            status: sub.status,
            customer: sub.customer,
            subscriptionId: sub.id,
            current_period_end: sub.current_period_end,
          });
        }
        break;
      }

      // 3) Suppression d'abonnement
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log('Subscription deleted:', { 
          id: sub.id,
          metadata: sub.metadata 
        });
        
        let userId = sub.metadata?.userId || (await findUserIdByCustomer(sub.customer));
        
        if (userId) {
          await setPremiumForUser(userId, {
            status: 'canceled',
            customer: sub.customer,
            subscriptionId: sub.id,
            current_period_end: sub.current_period_end,
          });
        }
        break;
      }

      // 4) Trial will end (optionnel - pour notifier l'utilisateur)
      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object;
        console.log('Trial will end soon:', sub.id);
        // Tu peux envoyer un email de rappel ici
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
        break;
    }

    return res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).send('Webhook handler error');
  }
}