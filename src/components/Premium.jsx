import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../context/AuthContext';
import { FaCrown, FaCheck } from 'react-icons/fa';

const stripePromise = loadStripe('pk_test_51RnceePEdl4W6QSBLwf47mjWRXZHOJbZO4Obw3tCZzocdvRgxFhbthIQt4BjQLHiVr0CCZEz7130mmOCEsHQTHMR007KEVMEbY');

function Premium({ t }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1Rncg6PEdl4W6QSBGywxTd6R',
          userId: user.uid,
          email: user.email
        }),
      });

      const session = await response.json();
      const stripe = await stripePromise;
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });
      
      if (error) {
        console.error('Stripe error:', error);
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  if (user?.premium) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <FaCrown className="text-6xl text-gold-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gold-500 mb-2">You're Premium!</h2>
          <p className="text-gray-300">Enjoy unlimited access to all quests!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gold-500 mb-8 text-center">Go Premium</h1>
        
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="text-center mb-8">
            <FaCrown className="text-6xl text-gold-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Unlock Everything</h2>
            <p className="text-3xl font-bold text-gold-500">4.99€<span className="text-lg text-gray-400">/month</span></p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-gray-300">
              <FaCheck className="text-green-500 mr-3" />
              Access to all premium quests
            </li>
            <li className="flex items-center text-gray-300">
              <FaCheck className="text-green-500 mr-3" />
              Exclusive badges and rewards
            </li>
            <li className="flex items-center text-gray-300">
              <FaCheck className="text-green-500 mr-3" />
              Advanced financial strategies
            </li>
            <li className="flex items-center text-gray-300">
              <FaCheck className="text-green-500 mr-3" />
              Priority support
            </li>
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className={`w-full bg-gold-500 text-gray-900 px-6 py-4 rounded-lg font-semibold transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gold-400 hover:scale-105'
            }`}
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm">
          Cancel anytime. Secure payment via Stripe.
        </p>
      </div>
    </div>
  );
}

export default Premium;