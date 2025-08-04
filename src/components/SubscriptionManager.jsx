import React, { useState } from 'react';
import { FaCrown, FaCalendarAlt, FaCreditCard, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useSubscription } from '../hooks/useSubscription';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';

const SubscriptionManager = () => {
  const { t } = useLanguage();
  const { 
    subscription, 
    loading, 
    isActive, 
    daysRemaining, 
    cancelSubscription, 
    reactivateSubscription,
    getSubscriptionStatus,
    getStatusColor,
    getStatusText
  } = useSubscription();
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelSubscription = async () => {
    setCancelling(true);
    
    try {
      const success = await cancelSubscription();
      
      if (success) {
        toast.success(t('subscription.cancelled_success') || 'Subscription cancelled successfully');
        setShowCancelConfirm(false);
      } else {
        toast.error(t('subscription.cancel_failed') || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error(t('subscription.cancel_failed') || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
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

  const status = getSubscriptionStatus();

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
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === 'active' ? 'bg-green-500/20 text-green-400' :
          status === 'expired' ? 'bg-red-500/20 text-red-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {status.toUpperCase()}
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

        {subscription.premiumEndDate && (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaTimes className="text-red-400" />
              <span className="text-sm font-medium text-gray-300">
                {t('subscription.end_date') || 'End Date'}
              </span>
            </div>
            <p className="text-white">
              {formatDate(subscription.premiumEndDate)}
            </p>
          </div>
        )}

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

        {subscription.stripeSubscriptionId && (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaCheck className="text-green-400" />
              <span className="text-sm font-medium text-gray-300">
                {t('subscription.subscription_id') || 'Subscription ID'}
              </span>
            </div>
            <p className="text-white text-sm font-mono">
              {subscription.stripeSubscriptionId.slice(-8)}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {status === 'active' && !subscription.subscriptionCancelled && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {t('subscription.cancel') || 'Cancel Subscription'}
          </button>
        )}

        {status === 'expired' && (
          <button
            onClick={reactivateSubscription}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:from-yellow-500 hover:to-orange-600 transition-all"
          >
            {t('subscription.reactivate') || 'Reactivate Subscription'}
          </button>
        )}

        {subscription.subscriptionCancelled && (
          <div className="flex-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-400" />
              <span className="text-yellow-400 text-sm">
                {t('subscription.cancelled_notice') || 'Subscription will end at the end of the current period'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">
              {t('subscription.confirm_cancel') || 'Cancel Subscription?'}
            </h3>
            <p className="text-gray-400 mb-6">
              {t('subscription.cancel_warning') || 'Your subscription will remain active until the end of the current billing period. You can reactivate it anytime.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                disabled={cancelling}
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                disabled={cancelling}
              >
                {cancelling ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('common.processing') || 'Processing...'}
                  </div>
                ) : (
                  t('subscription.confirm_cancel_yes') || 'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager; 