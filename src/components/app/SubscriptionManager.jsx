import React, { useState } from 'react';
import { FaCrown, FaCalendarAlt, FaCreditCard } from 'react-icons/fa';
import { useSubscription } from '../../hooks/useSubscription';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const SubscriptionManager = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { 
    subscription, 
    loading
  } = useSubscription();

  const handleManageSubscription = () => {
    if (!user) {
      toast.error(t('auth.login_required') || 'Please login to manage subscription');
      return;
    }

    // Rediriger directement vers le portail Stripe configuré
    window.open('https://billing.stripe.com/p/login/test_28E14p0n96mxbd0aiLcjS00', '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <FaCrown className="text-4xl text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          {t('subscription.no_subscription') || 'No Active Subscription'}
        </h3>
        <p className="text-gray-400 mb-4">
          {t('subscription.upgrade_message') || 'Upgrade to Premium to unlock all features'}
        </p>
        <button
          onClick={() => window.location.href = '/premium'}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all"
        >
          {t('subscription.upgrade_now') || 'Upgrade Now'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaCrown className="text-2xl text-yellow-400" />
          <div>
            <h3 className="text-xl font-semibold text-white">
              {t('subscription.title') || 'Premium Subscription'}
            </h3>
            <p className="text-green-400 text-sm">
              {t('subscription.active') || 'Active'}
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          ACTIVE
        </div>
      </div>

      {/* Subscription Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaCalendarAlt className="text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">
              {t('subscription.start_date') || 'Start Date'}
            </span>
          </div>
          <p className="text-white">
            {formatDate(subscription.premiumStartDate)}
          </p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaCreditCard className="text-blue-400" />
            <span className="text-sm font-medium text-gray-300">
              {t('subscription.plan') || 'Plan'}
            </span>
          </div>
          <p className="text-white capitalize">
            {subscription.plan}
          </p>
        </div>
      </div>

      {/* Manage Subscription Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleManageSubscription}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
        >
          <div className="flex items-center justify-center gap-2">
            <FaCreditCard />
            {t('subscription.manage_subscription') || 'Manage Subscription'}
          </div>
        </button>
      </div>
    </div>
  );
};

export default SubscriptionManager; 