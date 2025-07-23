const stripe = require('stripe')('sk_test_51RnceePEdl4W6QSBMc4OlzTmMDM7ta64GPMF7kSCdsGUnStPGiJo5fM2h8L49KK01A0WuHHw6W5RwznMogVf3SIj00g99xK482'); // Ta clé secret test Stripe
const endpointSecret = 'whsec_DuqP562WnIttXBoALLVInBjbBbRmcXlS'; // Ton signing secret de Stripe Webhook
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
});
const db = admin.firestore();

module.exports = async (context, request) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const sig = request.headers.get('stripe-signature');
  const body = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    if (userId) {
      await db.collection('users').doc(userId).update({ premium: true });
      console.log(`Updated premium for user ${userId}`);
    }
  }

  return new Response('OK', { status: 200 });
};