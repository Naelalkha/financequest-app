import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../context/AuthContext';

const stripePromise = loadStripe('pk_test_51RnceePEdl4W6QSBLwf47mjWRXZHOJbZO4Obw3tCZzocdvRgxFhbthIQt4BjQLHiVr0CCZEz7130mmOCEsHQTHMR007KEVMEbY');

function Premium({ t }) {
  const { user } = useAuth();

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: 'price_1Rncg6PEdl4W6QSBGywxTd6R', quantity: 1 }],
      mode: 'subscription',
      successUrl: window.location.origin + '/dashboard',
      cancelUrl: window.location.origin + '/premium',
    });
    if (error) console.error(error);
  };

  if (user?.premium) return <div className="p-4 text-center">You have premium access!</div>;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gold-500 mb-8">Go Premium</h1>
        <p className="text-gray-300 mb-4">Unlock all quests for 4.99€/month!</p>
        <button
          onClick={handleCheckout}
          className="bg-gold-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors"
        >
          Subscribe Now
        </button>
      </div>
    </div>
  );
}

export default Premium;