const stripe = require('stripe')('sk_test_51RnceePEdl4W6QSBMc4OlzTmMDM7ta64GPMF7kSCdsGUnStPGiJo5fM2h8L49KK01A0WuHHw6W5RwznMogVf3SIj00g99xK482'); // Ta clé secret test Stripe
const endpointSecret = 'whsec_DuqP562WnIttXBoALLVInBjbBbRmcXlS'; // Ton signing secret de Stripe Webhook

// Import Firebase (ajuste path si functions/ est à racine)
const { db } = require('../src/firebase'); // Si functions/ à racine, ajuste à '../../src/firebase'
const { doc, updateDoc } = require('firebase/firestore');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const userId = session.metadata.userId;
    if (userId) {
      await updateDoc(doc(db, 'users', userId), { premium: true });
    }
  }

  return { statusCode: 200, body: 'OK' };
};