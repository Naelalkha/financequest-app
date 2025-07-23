// /api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing userId or email' });
    }

    console.log('Creating checkout session for user:', userId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/premium`,
      customer_email: email,
      metadata: {
        userId: userId, // Important pour le webhook
      },
      client_reference_id: userId, // Backup au cas où
    });

    console.log('Checkout session created:', session.id);

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Create checkout session error:', error);
    return res.status(500).json({ error: error.message });
  }
}