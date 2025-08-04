import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import posthog from 'posthog-js';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setLoading(false);
      setSubscription(null);
      setIsActive(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const subscriptionData = {
          isPremium: userData.isPremium || false,
          premiumStartDate: userData.premiumStartDate ? new Date(userData.premiumStartDate) : null,
          premiumEndDate: userData.premiumEndDate ? new Date(userData.premiumEndDate) : null,
          stripeCustomerId: userData.stripeCustomerId,
          stripeSubscriptionId: userData.stripeSubscriptionId,
          stripeSessionId: userData.stripeSessionId,
          plan: userData.plan || 'monthly'
        };

        // Vérifier si l'abonnement est expiré et mettre à jour Firebase si nécessaire
        const now = new Date();
        if (subscriptionData.isPremium && subscriptionData.premiumEndDate && subscriptionData.premiumEndDate <= now) {
          console.log('Subscription expired, updating Firebase...');
          await updateDoc(userRef, {
            isPremium: false,
            lastUpdated: new Date().toISOString()
          });
          
          // Mettre à jour les données locales
          subscriptionData.isPremium = false;
        }
        
        setSubscription(subscriptionData);
        
        // Vérifier si l'abonnement est actif
        const isCurrentlyActive = subscriptionData.isPremium && 
          (!subscriptionData.premiumEndDate || subscriptionData.premiumEndDate > now);
        setIsActive(isCurrentlyActive);
        
        // Calculer les jours restants
        if (subscriptionData.premiumEndDate && subscriptionData.premiumEndDate > now) {
          const diffTime = subscriptionData.premiumEndDate - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysRemaining(diffDays);
        } else {
          setDaysRemaining(0);
        }

        console.log('Subscription loaded:', subscriptionData);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };



  const reactivateSubscription = async () => {
    if (!user) return false;

    try {
      setLoading(true);
      
      // Rediriger vers la page premium pour réactiver
      window.location.href = '/premium';
      
      return true;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return 'none';
    if (!subscription.isPremium) return 'inactive';
    if (daysRemaining > 0) return 'active';
    return 'expired';
  };

  const getStatusColor = () => {
    const status = getSubscriptionStatus();
    switch (status) {
      case 'active': return 'text-green-400';
      case 'expired': return 'text-red-400';
      case 'inactive': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    const status = getSubscriptionStatus();
    switch (status) {
      case 'active': return `Active (${daysRemaining} days remaining)`;
      case 'expired': return 'Expired';
      case 'inactive': return 'Inactive';
      default: return 'No subscription';
    }
  };

  return {
    subscription,
    loading,
    isActive,
    daysRemaining,
    reactivateSubscription,
    getSubscriptionStatus,
    getStatusColor,
    getStatusText,
    refresh: loadSubscription
  };
}; 