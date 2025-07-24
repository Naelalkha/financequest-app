import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../context/AuthContext';
import { FaCrown, FaCheck, FaRocket, FaTrophy, FaShieldAlt, FaGem, FaStar, FaBolt, FaArrowLeft, FaCoins } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RnceePEdl4W6QSBLwf47mjWRXZHOJbZO4Obw3tCZzocdvRgxFhbthIQt4BjQLHiVr0CCZEz7130mmOCEsHQTHMR007KEVMEbY');

function Premium({ t, currentLang }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({ points: 0, level: 'Novice', badges: [] });
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setIsPremium(data.premium || false);
          setUserStats({
            points: data.points || 0,
            level: data.level || 'Novice',
            badges: data.badges || []
          });
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
    };

    checkPremiumStatus();
  }, [user]);

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
      
      if (session.error) {
        throw new Error(session.error);
      }

      const stripe = await stripePromise;
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });
      
      if (error) {
        console.error('Stripe error:', error);
        alert(currentLang === 'fr' ? 'Erreur : ' + error.message : 'Error: ' + error.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(currentLang === 'fr' ? 'Échec du paiement' : 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const premiumFeatures = [
    {
      icon: FaCoins,
      title: 'Unlimited Quests',
      description: 'Access to all 50+ premium quests',
      color: 'text-blue-500'
    },
    {
      icon: FaGem,
      title: 'Exclusive Badges',
      description: '15+ exclusive premium badges',
      color: 'text-purple-500'
    },
    {
      icon: FaRocket,
      title: 'Advanced Tracking',
      description: 'Detailed analytics and insights',
      color: 'text-green-500'
    },
    {
      icon: FaShieldAlt,
      title: 'Priority Support',
      description: '24/7 priority customer support',
      color: 'text-yellow-500'
    },
    {
      icon: FaBolt,
      title: 'Offline Mode',
      description: 'Complete quests without internet',
      color: 'text-red-500'
    },
    {
      icon: FaTrophy,
      title: 'Custom Goals',
      description: 'Set and track personal financial goals',
      color: 'text-orange-500'
    }
  ];

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gold-900 via-yellow-900 to-gold-800 p-4">
        <Link to="/dashboard" className="inline-flex items-center text-gold-200 hover:text-white mb-6 transition-colors">
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-gold-800/50 to-yellow-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gold-400/30">
            <FaCrown className="text-8xl text-gold-400 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-bold text-gold-300 mb-4">You're Premium!</h2>
            <p className="text-xl text-gold-200 mb-8">Enjoy unlimited access to all quests!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gold-800/30 p-6 rounded-lg border border-gold-400/20">
                <FaCoins className="text-3xl text-gold-400 mx-auto mb-3" />
                <h3 className="font-bold text-gold-300">Unlimited Quests</h3>
                <p className="text-gold-200 text-sm">All premium content unlocked</p>
              </div>
              <div className="bg-gold-800/30 p-6 rounded-lg border border-gold-400/20">
                <FaGem className="text-3xl text-purple-400 mx-auto mb-3" />
                <h3 className="font-bold text-gold-300">Exclusive Badges</h3>
                <p className="text-gold-200 text-sm">{userStats.badges.length} badges earned</p>
              </div>
              <div className="bg-gold-800/30 p-6 rounded-lg border border-gold-400/20">
                <FaTrophy className="text-3xl text-yellow-400 mx-auto mb-3" />
                <h3 className="font-bold text-gold-300">Level {userStats.level}</h3>
                <p className="text-gold-200 text-sm">{userStats.points} total points</p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center gap-4">
              <Link 
                to="/quests"
                className="bg-gold-500 hover:bg-gold-400 text-gray-900 px-8 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
              >
                Continue Learning
              </Link>
              <Link 
                to="/dashboard"
                className="bg-transparent border border-gold-400 text-gold-300 hover:bg-gold-400 hover:text-gray-900 px-8 py-3 rounded-lg font-bold transition-all duration-300"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <Link to="/dashboard" className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors">
        <FaArrowLeft className="mr-2" />
        Back to Dashboard
      </Link>

      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FaCrown className="text-8xl text-gold-500 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-yellow-300 mb-4">
            Go Premium
          </h1>
          <p className="text-xl text-gray-300 mb-8">Unlock unlimited quests and exclusive features</p>
          
          {/* Stats Preview */}
          <div className="flex justify-center items-center gap-8 text-sm text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <FaStar className="text-red-500" />
              <span>10,000+ satisfied users</span>
            </div>
            <div className="flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBolt className="text-blue-500" />
              <span>Instant access</span>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border-2 border-gold-500 bg-gold-900/20 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-gold-500 to-yellow-500 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                🔥 Most Popular
              </div>
            </div>
            
            <div className="text-center mb-6 mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">Monthly</h3>
              <div className="text-4xl font-bold text-gold-500 mb-2">
                {currentLang === 'fr' ? '4,99€' : '$4.99'}
                <span className="text-lg text-gray-400">/month</span>
              </div>
              <p className="text-gray-400">Perfect for mastering your finances</p>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold-500 to-yellow-500 text-gray-900 py-4 rounded-lg font-bold hover:from-gold-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  Processing...
                </div>
              ) : (
                'Subscribe Now'
              )}
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-gray-700">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Premium Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-700/50 p-6 rounded-lg hover:bg-gray-700/70 transition-all duration-300 group">
                <feature.icon className={`text-4xl ${feature.color} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`} />
                <h3 className="text-lg font-bold text-white text-center mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-center text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="text-center bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Why Choose Premium?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="text-lg font-bold text-gold-400 mb-3">🚀 Accelerated Learning</h3>
              <p className="text-gray-300">Premium quests are designed by financial experts to fast-track your money mastery.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gold-400 mb-3">💡 Exclusive Content</h3>
              <p className="text-gray-300">Access advanced strategies and insider tips not available in free content.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gold-400 mb-3">📊 Personal Analytics</h3>
              <p className="text-gray-300">Track your progress with detailed insights and personalized recommendations.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gold-400 mb-3">🎯 Goal Achievement</h3>
              <p className="text-gray-300">Set custom financial goals and get step-by-step guidance to achieve them.</p>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-400">
            <p>🔒 30-day money-back guarantee • Cancel anytime • Secure payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Premium;