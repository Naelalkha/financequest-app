// /api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51RnceePEdl4W6QSBMc4OlzTmMDM7ta64GPMF7kSCdsGUnStPGiJo5fM2h8L49KK01A0WuHHw6W5RwznMogVf3SIj00g99xK482');

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

    // Validation
    if (!userId || !email) {
      console.error('Missing required fields:', { userId, email });
      return res.status(400).json({ error: 'Missing userId or email' });
    }

    if (!priceId) {
      console.error('Missing priceId');
      return res.status(400).json({ error: 'Missing priceId' });
    }

    console.log('Creating checkout session for:', { userId, email, priceId });

    // Vérifier si Stripe est bien configuré
    if (!process.env.STRIPE_SECRET_KEY && !stripe) {
      console.warn('Using hardcoded Stripe key - configure STRIPE_SECRET_KEY env var');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://financequest-app.vercel.app'}/dashboard?success=true`,
      cancel_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://financequest-app.vercel.app'}/premium`,
      customer_email: email,
      metadata: {
        userId: userId,
      },
      client_reference_id: userId,
    });

    console.log('Checkout session created successfully:', session.id);

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe error details:', {
      message: error.message,
      type: error.type,
      statusCode: error.statusCode,
      raw: error.raw
    });

    // Retourner un message d'erreur plus détaillé
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message,
      // En dev seulement - ne pas exposer en prod
      debug: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}