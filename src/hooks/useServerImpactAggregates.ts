/**
 * Hook personnalisé pour récupérer les agrégats d'impact serveur
 * Lit les agrégats calculés par l'API Vercel depuis /users/{uid}
 * Déclenche automatiquement un recalcul si les données sont "stale"
 */

import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSavingsEvents } from './useSavingsEvents';
import {
  recalculateImpactAggregates,
  areAggregatesStale
} from '../services/impactAggregates';

/**
 * Hook pour gérer les agrégats d'impact serveur avec recalcul automatique
 * @returns {{
 *   impactAnnualEstimated: number | null,
 *   impactAnnualVerified: number | null,
 *   proofsVerifiedCount: number | null,
 *   lastImpactRecalcAt: string | null,
 *   loading: boolean,
 *   syncing: boolean,
 *   error: string | null,
 *   manualRecalculate: () => Promise<void>
 * }}
 */
export const useServerImpactAggregates = () => {
  const { user } = useAuth();
  const [serverImpact, setServerImpact] = useState<number | null>(null);
  const [impactAnnualVerified, setImpactAnnualVerified] = useState<number | null>(null);
  const [proofsVerifiedCount, setProofsVerifiedCount] = useState<number | null>(null);
  const [lastImpactRecalcAt, setLastImpactRecalcAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local fallback using direct impact events calculation
  const { events, loadEvents } = useSavingsEvents();
  const [localImpact, setLocalImpact] = useState(0);

  // Ref pour éviter les recalculs multiples
  const recalcTriggered = useRef(false);

  // Load events for fallback calculation
  useEffect(() => {
    if (user) {
      loadEvents({ limitCount: 50 });
    }
  }, [user, loadEvents]);

  // Calculate local impact from events
  useEffect(() => {
    if (events.length === 0) {
      setLocalImpact(0);
      return;
    }

    let total = 0;
    events.forEach((event) => {
      // Annualize: month events * 12
      total += event.amount * (event.period === 'month' ? 12 : 1);
    });

    setLocalImpact(total);
  }, [events]);

  useEffect(() => {
    if (!user) {
      // Pas d'utilisateur → reset
      setServerImpact(0);
      setImpactAnnualVerified(0);
      setProofsVerifiedCount(0);
      setLastImpactRecalcAt(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const userRef = doc(db, 'users', user.uid);

    // Écouter les changements en temps réel
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();

        setServerImpact(userData.impactAnnualEstimated ?? 0);
        setImpactAnnualVerified(userData.impactAnnualVerified ?? 0);
        setProofsVerifiedCount(userData.proofsVerifiedCount ?? 0);
        setLastImpactRecalcAt(userData.lastImpactRecalcAt || null);
        setLoading(false);

        // Vérifier si les agrégats sont stale (> 6h)
        if (areAggregatesStale(userData.lastImpactRecalcAt) && !recalcTriggered.current) {
          console.log('📊 Aggregates are stale, triggering recalculation...');
          recalcTriggered.current = true;
          setSyncing(true);

          // Recalculer en arrière-plan
          try {
            await recalculateImpactAggregates('on_open');
            console.log('✅ Aggregates recalculated successfully');
          } catch (err) {
            console.warn('⚠️ Background recalculation failed (non-blocking):', err);
          } finally {
            setSyncing(false);
          }
        }
      } else {
        // Document utilisateur n'existe pas encore
        setServerImpact(0);
        setImpactAnnualVerified(0);
        setProofsVerifiedCount(0);
        setLastImpactRecalcAt(null);
        setLoading(false);
      }
    }, (err: Error) => {
      console.error('❌ Error fetching impact aggregates:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  /**
   * Recalcule manuellement les agrégats (pour le bouton "Recalculer")
   */
  const manualRecalculate = async () => {
    if (!user || syncing) return;

    console.log('🔄 Manual recalculation triggered');
    setSyncing(true);
    setError(null);

    try {
      await recalculateImpactAggregates('manual_button');
      console.log('✅ Manual recalculation completed');
    } catch (err) {
      console.error('❌ Manual recalculation failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSyncing(false);
    }
  };

  // Use the maximum of server or local impact for best accuracy
  const impactAnnualEstimated = Math.max(serverImpact || 0, localImpact);

  return {
    impactAnnualEstimated,
    impactAnnualVerified,
    proofsVerifiedCount,
    lastImpactRecalcAt,
    loading,
    syncing,
    error,
    manualRecalculate,
  };
};

