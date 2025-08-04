// /api/create-checkout-session.js - VERSION DEBUG
export default async function handler(req, res) {
  console.log('=== DEBUT CREATE-CHECKOUT-SESSION ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Body:', req.body);
    
    // Test 1: Vérifier si Stripe est importé
    let stripe;
    try {
      const Stripe = await import('stripe');
      console.log('Stripe importé avec succès');
      stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY || 'sk_test_51RnceePEdl4W6QSBMc4OlzTmMDM7ta64GPMF7kSCdsGUnStPGiJo5fM2h8L49KK01A0WuHHw6W5RwznMogVf3SIj00g99xK482');
      console.log('Stripe initialisé');
    } catch (stripeError) {
      console.error('Erreur import Stripe:', stripeError);
      return res.status(500).json({ 
        error: 'Failed to import Stripe',
        details: stripeError.message,
        stack: stripeError.stack
      });
    }

    const { priceId, userId, email } = req.body;
    console.log('Params:', { priceId, userId, email });

    if (!userId || !email || !priceId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { priceId, userId, email }
      });
    }

    console.log('Creating session...');
    
    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'https://financequest-app.vercel.app/dashboard?success=true',
      cancel_url: 'https://financequest-app.vercel.app/premium',
      customer_email: email,
      metadata: {
        userId: userId,
      }
    };
    
    console.log('Session params:', sessionParams);

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('Session created:', session.id);

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('=== ERREUR COMPLETE ===');
    console.error('Message:', error.message);
    console.error('Type:', error.type);
    console.error('Stack:', error.stack);
    console.error('Raw:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      type: error.type,
      // Ne pas exposer le stack en prod
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}