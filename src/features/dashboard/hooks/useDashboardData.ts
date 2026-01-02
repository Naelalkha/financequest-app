/**
 * useDashboardData - Custom hook for dashboard Firestore data fetching
 *
 * Extracts all data fetching logic from DashboardView to:
 * - Reduce component complexity
 * - Enable better caching and reuse
 * - Prevent unnecessary re-renders
 */

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { getUserDailyChallenge } from '../../../services/dailyChallenge';
import { useAuth } from '../../../contexts/AuthContext';

/** User data from Firestore */
export interface UserData {
    photoURL?: string;
    currency?: string;
    currentStreak?: number;
    streaks?: number;
}

/** Quest progress entry */
export interface QuestProgress {
    status: 'active' | 'completed' | 'pending';
    progress: number;
    completedAt?: Date;
    score: number;
}

/** Daily challenge data */
export interface DailyChallenge {
    questId?: string;
    questTitle?: string;
    status?: string;
    rewards?: {
        xp?: number;
        savings?: string | number;
    };
}

/** Return type for the hook */
export interface DashboardData {
    userData: UserData | null;
    userProgress: Record<string, QuestProgress>;
    dailyChallenge: DailyChallenge | null;
    loading: boolean;
    refetch: () => Promise<void>;
}

/**
 * Fetches and caches dashboard data from Firestore
 * Single source of truth for dashboard data
 */
export function useDashboardData(): DashboardData {
    const { user } = useAuth();
    const { i18n } = useTranslation();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [userProgress, setUserProgress] = useState<Record<string, QuestProgress>>({});
    const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch user document
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                setUserData(userSnap.data() as UserData);
            }

            // Fetch user quest progress
            const progressQuery = query(
                collection(db, 'userQuests'),
                where('userId', '==', user.uid)
            );
            const progressSnapshot = await getDocs(progressQuery);
            const progress: Record<string, QuestProgress> = {};
            progressSnapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                progress[data.questId] = {
                    status: data.status,
                    progress: data.progress || 0,
                    completedAt: data.completedAt,
                    score: data.score || 0
                };
            });
            setUserProgress(progress);

            // Fetch or generate daily challenge
            try {
                const challenge = await getUserDailyChallenge(user.uid, i18n.language || 'fr');
                setDailyChallenge(challenge);
            } catch (err) {
                console.error('❌ Error with daily challenge:', err);
                setDailyChallenge(null);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [user, i18n.language]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        userData,
        userProgress,
        dailyChallenge,
        loading,
        refetch: fetchDashboardData
    };
}

export default useDashboardData;
