// /api/create-checkout-session.js
// Vercel Serverless Function (Node 18+)

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

function getOrigin(req) {
  return (
    req.headers?.origin ||
    process.env.FRONTEND_URL ||
    'http://localhost:5173'
  );
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8') || '{}';
  try { return JSON.parse(raw); } catch { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = await readJsonBody(req);
    const origin = getOrigin(req);

    // Ne fais pas confiance au priceId venant du client.
    // Mappe le plan côté serveur -> ENV.
    const plan = (body.plan === 'yearly' || body.plan === 'monthly') ? body.plan : 'monthly';
    const priceId = plan === 'yearly'
      ? process.env.VITE_STRIPE_PRICE_YEARLY
      : process.env.VITE_STRIPE_PRICE_MONTHLY;

    if (!priceId) {
      return res.status(400).json({ error: 'Missing Stripe price id in env' });
    }

    const userId = body.userId || '';   // UID Firebase (obligatoire pour bien mapper)
    const email  = body.email  || '';   // Email (facilite la création du customer)

    // Session Checkout avec essai gratuit 7 jours
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      client_reference_id: userId || undefined,
      allow_promotion_codes: true,

      // 👉 Essai gratuit 7 jours via Checkout
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId,
          plan,
          app: 'financequest-pwa'
        },
      },

      // Par défaut, Checkout collecte la carte même avec trial (meilleure conversion post-trial).
      // Si tu veux NE PAS collecter la CB pendant le trial, dé-commente :
      // payment_method_collection: 'if_required',

      success_url: `${origin}/premium?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium`,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return res.status(500).json({ error: 'Failed to create session' });
  }
}