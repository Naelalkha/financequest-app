const stripe = require('stripe')('sk_test_51RnceePEdl4W6QSBMc4OlzTmMDM7ta64GPMF7kSCdsGUnStPGiJo5fM2h8L49KK01A0WuHHw6W5RwznMogVf3SIj00g99xK482'); // Ta clé secret test Stripe
const endpointSecret = 'whsec_DuqP562WnIttXBoALLVInBjbBbRmcXlS'; // Ton signing secret de Stripe Webhook
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) // Env var JSON
});
const db = admin.firestore();

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
      const userRef = db.collection('users').doc(userId);
      await userRef.update({ premium: true });
    }
  }

  return { statusCode: 200, body: 'OK' };
};