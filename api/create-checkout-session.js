import Stripe from 'stripe';

// Vérifier que la clé Stripe est définie
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vérifier que la clé Stripe est définie
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not defined');
    return res.status(500).json({ 
      error: 'Stripe configuration missing',
      details: 'STRIPE_SECRET_KEY environment variable is not set'
    });
  }

  try {
    const { priceId, variant, questId, userId } = req.body;

    if (!priceId || !variant || !questId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: priceId, variant, questId, userId' 
      });
    }

    // Créer la session Stripe avec la variante dans les métadonnées
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      metadata: { 
        variant,
        questId,
        userId,
        priceId
      },
      success_url: `${process.env.ORIGIN || 'https://financequest-app.vercel.app'}/premium?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.ORIGIN || 'https://financequest-app.vercel.app'}/premium`,
      client_reference_id: userId,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}