// functions/api/create-checkout-session.js
const stripe = require('stripe')('sk_test_51RnceePEdl4W6QSBMc4OlzTmMDM7ta64GPMF7kSCdsGUnStPGiJo5fM2h8L49KK01A0WuHHw6W5RwznMogVf3SIj00g99xK482');

module.exports = async (context, request) => {
  if (request.method === 'OPTIONS') {
    return new Response('OK', { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { priceId, userId, email } = body;

    if (!userId || !email) {
      return new Response(JSON.stringify({ error: 'Missing userId or email' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'https://financequest.vercel.app'}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://financequest.vercel.app'}/premium`,
      customer_email: email,
      metadata: {
        userId: userId, // IMPORTANT: On passe le userId dans les metadata
      },
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Create session error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};