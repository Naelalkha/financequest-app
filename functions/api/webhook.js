// functions/api/webhook.js
const stripe = require('stripe')('sk_test_51RnceePEdl4W6QSBMc4OlzTmMDM7ta64GPMF7kSCdsGUnStPGiJo5fM2h8L49KK01A0WuHHw6W5RwznMogVf3SIj00g99xK482');
const endpointSecret = 'whsec_DuqP562WnIttXBoALLVInBjbBbRmcXlS';

const admin = require('firebase-admin');

// Initialiser Firebase Admin seulement si ce n'est pas déjà fait
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

const db = admin.firestore();

module.exports = async (context, request) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  const sig = request.headers.get('stripe-signature');
  
  if (!sig) {
    console.error('No stripe signature found');
    return new Response('No signature', { status: 400 });
  }

  let event;
  let rawBody;

  try {
    // Récupérer le body brut pour la vérification de signature
    rawBody = await request.text();
    
    // Construire l'event Stripe avec vérification de signature
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Log l'event type pour debug
  console.log('Webhook event type:', event.type);

  // Gérer l'event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      
      // Récupérer le userId depuis les metadata
      const userId = session.metadata?.userId;
      
      if (!userId) {
        console.error('No userId found in session metadata');
        return new Response('No userId in metadata', { status: 400 });
      }

      try {
        // Mettre à jour l'utilisateur dans Firestore
        await db.collection('users').doc(userId).update({ 
          premium: true,
          premiumStartDate: admin.firestore.Timestamp.now(),
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription
        });
        
        console.log(`Updated premium status for user ${userId}`);
      } catch (error) {
        console.error('Error updating user:', error);
        return new Response('Error updating user', { status: 500 });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      // Gérer l'annulation d'abonnement
      const subscription = event.data.object;
      
      try {
        // Trouver l'utilisateur par stripeSubscriptionId
        const usersSnapshot = await db.collection('users')
          .where('stripeSubscriptionId', '==', subscription.id)
          .limit(1)
          .get();
        
        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await userDoc.ref.update({ 
            premium: false,
            premiumEndDate: admin.firestore.Timestamp.now()
          });
          console.log(`Cancelled premium for user ${userDoc.id}`);
        }
      } catch (error) {
        console.error('Error handling subscription cancellation:', error);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Retourner une réponse 200 pour confirmer la réception
  return new Response('Webhook received', { 
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
};