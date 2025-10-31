import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook pour récupérer les agrégats d'impact depuis le user document
 * Ces agrégats sont calculés côté serveur par la Cloud Function
 * 
 * @returns {Object} { impactAnnualEstimated, impactAnnualVerified, proofsVerifiedCount, loading }
 */
export const useImpactAggregates = () => {
  const { user } = useAuth();
  const [aggregates, setAggregates] = useState({
    impactAnnualEstimated: 0,
    impactAnnualVerified: 0,
    proofsVerifiedCount: 0,
    lastRecalcAt: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Écouter en temps réel les changements du user document
    const userRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAggregates({
            impactAnnualEstimated: data.impactAnnualEstimated || 0,
            impactAnnualVerified: data.impactAnnualVerified || 0,
            proofsVerifiedCount: data.proofsVerifiedCount || 0,
            lastRecalcAt: data.lastImpactRecalcAt || null,
          });
        } else {
          // User document n'existe pas encore
          setAggregates({
            impactAnnualEstimated: 0,
            impactAnnualVerified: 0,
            proofsVerifiedCount: 0,
            lastRecalcAt: null,
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to impact aggregates:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return {
    ...aggregates,
    loading,
  };
};

