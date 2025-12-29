/**
 * 🎮 useGamification Hook
 * Hook React pour récupérer et suivre les données de gamification
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot, FirestoreError } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserGamification, UserGamificationData } from '../../../services/gamification';

/** Return type for useGamification hook */
export interface UseGamificationReturn {
  gamification: UserGamificationData | null;
  loading: boolean;
  error: string | null;
}

export const useGamification = (): UseGamificationReturn => {
  const { user } = useAuth();
  const [gamification, setGamification] = useState<UserGamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Écouter les changements en temps réel
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const gamificationData: UserGamificationData = {
            xpTotal: data.xpTotal || 0,
            level: data.gamification?.level || 1,
            nextLevelXP: data.gamification?.nextLevelXP || 300,
            milestones: data.gamification?.milestones || {},
            badges: data.gamification?.badges || [],
            updatedAt: data.gamification?.updatedAt || null,
          };

          setGamification(gamificationData);
        } else {
          // Doc n'existe pas encore, initialiser avec valeurs par défaut
          setGamification({
            xpTotal: 0,
            level: 1,
            nextLevelXP: 300,
            milestones: {},
            badges: [],
            updatedAt: null,
          });
        }
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error('Error fetching gamification:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return {
    gamification,
    loading,
    error,
  };
};
