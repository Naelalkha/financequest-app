import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * SubscriptionManager - Manage user subscriptions
 */
const SubscriptionManager = () => {
    const { user } = useAuth();
    const { t } = useTranslation('profile');
    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        if (user) {
            loadSubscription();
        }
    }, [user]);

    const loadSubscription = async () => {
        try {
            setLoading(true);
            const functions = getFunctions();
            const getSubscription = httpsCallable(functions, 'getSubscription');
            const result = await getSubscription();
            setSubscription(result.data);
        } catch (error) {
            console.error('Error loading subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm(t('profile.subscription.confirm_cancel') || 'Are you sure you want to cancel?')) {
            return;
        }

        try {
            setLoading(true);
            const functions = getFunctions();
            const cancelSubscription = httpsCallable(functions, 'cancelSubscription');
            await cancelSubscription();
            await loadSubscription();
        } catch (error) {
            console.error('Error canceling subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-volt border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
                <p className="text-gray-400">{t('profile.subscription.no_active') || 'No active subscription'}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 space-y-4">
            <div>
                <h3 className="text-lg font-bold text-white mb-2">
                    {t('profile.subscription.title') || 'Your Subscription'}
                </h3>
                <p className="text-gray-400">
                    {t('profile.subscription.status') || 'Status'}: <span className="text-volt">{subscription.status}</span>
                </p>
                {subscription.cancelAtPeriodEnd && (
                    <p className="text-orange-400 mt-2">
                        {t('profile.subscription.canceling') || 'Cancels at period end'}
                    </p>
                )}
            </div>

            {!subscription.cancelAtPeriodEnd && (
                <button
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                >
                    {t('profile.subscription.cancel_button') || 'Cancel Subscription'}
                </button>
            )}
        </div>
    );
};

export default SubscriptionManager;
