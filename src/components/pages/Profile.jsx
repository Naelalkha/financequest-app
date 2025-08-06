import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaUser, FaCrown, FaCog, FaGlobe } from 'react-icons/fa';

import { toast } from 'react-toastify';
import Button from '../common/Button';
import Card from '../common/Card';
import LanguageToggle from '../LanguageToggle';
import SubscriptionManager from '../SubscriptionManager';
import LoadingSpinner from '../common/LoadingSpinner';

const Profile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { t, currentLang } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingCountry, setUpdatingCountry] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Use the user data from the auth context
      setUserData(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(user);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour gérer votre abonnement');
      return;
    }

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: user.stripeCustomerId || user.uid
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        // Fallback vers le portail direct
        window.open('https://billing.stripe.com/p/login/test_28E14p0n96mxbd0aiLcjS00', '_blank');
      }
    } catch (error) {
      console.error('Erreur portail Stripe:', error);
      // Fallback vers le portail direct
      window.open('https://billing.stripe.com/p/login/test_28E14p0n96mxbd0aiLcjS00', '_blank');
    }
  };

  const handleCountryChange = async (newCountry) => {
    if (!user || updatingCountry) return;
    
    setUpdatingCountry(true);
    try {
      // Use updateUserProfile to update the global user state
      await updateUserProfile({
        country: newCountry
      });
      
      // Update local state as well
      setUserData(prev => ({
        ...prev,
        country: newCountry
      }));
      
      toast.success('Pays mis à jour avec succès !');
    } catch (error) {
      console.error('Error updating country:', error);
      toast.error('Erreur lors de la mise à jour du pays');
    } finally {
      setUpdatingCountry(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header Section - Style Dashboard */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 px-4 pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="mb-6 animate-fadeIn text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl font-bold text-gray-900">
                {userData?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {userData?.isPremium && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                  <FaCrown className="text-gray-900 text-sm" />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Profil
            </h1>
            <p className="text-gray-400">
              {userData?.displayName || user?.email?.split('@')[0]}
            </p>
          </div>


        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Account Information */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaUser className="text-yellow-400" />
            Informations du compte
          </h2>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nom d'affichage</label>
                <p className="text-white font-medium">{userData?.displayName || 'Non défini'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Membre depuis</label>
                <p className="text-white font-medium">
                  {userData?.createdAt ? new Date(userData.createdAt.toDate?.() || userData.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Langue</label>
                <p className="text-white font-medium">{currentLang === 'fr' ? 'Français' : 'English'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pays</label>
                <div className="flex items-center gap-3">
                  <p className="text-white font-medium">
                    {userData?.country === 'fr-FR' ? '🇫🇷 France' : userData?.country === 'en-US' ? '🇺🇸 United States' : 'Non défini'}
                  </p>
                  <button
                    onClick={() => handleCountryChange(userData?.country === 'fr-FR' ? 'en-US' : 'fr-FR')}
                    disabled={updatingCountry}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updatingCountry ? '...' : 'Changer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '300ms' }}>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaCog className="text-blue-400" />
            Préférences
          </h2>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium mb-1">Langue de l'interface</p>
                <p className="text-sm text-gray-400">Choisissez votre langue préférée</p>
              </div>
              <LanguageToggle />
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium mb-1 flex items-center gap-2">
                    <FaGlobe className="text-green-400" />
                    Pays pour les quêtes
                  </p>
                  <p className="text-sm text-gray-400">Détermine quelles quêtes spécifiques au pays vous voyez</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">
                    {userData?.country === 'fr-FR' ? '🇫🇷 France' : userData?.country === 'en-US' ? '🇺🇸 United States' : 'Non défini'}
                  </span>
                  <select
                    value={userData?.country || 'fr-FR'}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    disabled={updatingCountry}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                  >
                    <option value="fr-FR">🇫🇷 France</option>
                    <option value="en-US">🇺🇸 United States</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaCrown className="text-yellow-400" />
            Abonnement
          </h2>
          
          {!userData?.isPremium ? (
            // Upsell Card for non-premium users
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 shadow-lg text-center">
              <FaCrown className="text-5xl text-yellow-300 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Passez Premium !
              </h3>
              <p className="text-purple-100 mb-6">
                Débloquez toutes les quêtes, les défis exclusifs et bien plus encore.
              </p>
              <Link
                to="/premium"
                className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <FaCrown />
                Passer Premium
              </Link>
            </div>
          ) : (
            // Premium status for premium users
            <SubscriptionManager />
          )}
        </div>

        {/* Actions */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '500ms' }}>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Actions du compte</h3>
            <div className="space-y-3">
              <button
                onClick={logout}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;