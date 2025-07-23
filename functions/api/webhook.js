const stripe = require('stripe')('sk_test_51RnceePEdl4W6QSBMc4OlzTmMDM7ta64GPMF7kSCdsGUnStPGiJo5fM2h8L49KK01A0WuHHw6W5RwznMogVf3SIj00g99xK482'); // Ta clé secret test Stripe
const endpointSecret = 'whsec_DuqP562WnIttXBoALLVInBjbBbRmcXlS'; // Ton signing secret de Stripe Webhook

const { db } = require('../../src/firebase'); // Ajuste path si besoin (ex. '../../src/firebase')
const { doc, updateDoc } = require('firebase/firestore');

export async function onRequestPost(context) {
  const { request } = context;
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
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
      await updateDoc(doc(db, 'users', userId), { premium: true });
    }
  }

  return new Response('OK', { status: 200 });
}