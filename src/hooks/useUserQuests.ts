/**
 * useUserQuests Hook
 * Fetches user's quest progress from Firestore in real-time
 */

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { trackEvent } from '../utils/analytics';

/** User quest data structure */
interface UserQuest {
    id: string;
    userId?: string;
    questId?: string;
    status?: string;
    progress?: number;
    completedAt?: Timestamp;
    updatedAt?: Timestamp;
    [key: string]: unknown;
}

export const useUserQuests = (userId: string | null) => {
    const [quests, setQuests] = useState<UserQuest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setQuests([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Real-time listener for user's quests
        const questsQuery = query(
            collection(db, 'userQuests'),
            where('userId', '==', userId)
        );

        const unsubscribe = onSnapshot(
            questsQuery,
            (snapshot) => {
                const userQuests: UserQuest[] = [];
                snapshot.forEach((docSnap) => {
                    userQuests.push({
                        id: docSnap.id,
                        ...docSnap.data()
                    } as UserQuest);
                });

                // Sort by most recent first
                userQuests.sort((a, b) => {
                    const aTime = a.updatedAt?.toMillis() || 0;
                    const bTime = b.updatedAt?.toMillis() || 0;
                    return bTime - aTime;
                });

                setQuests(userQuests);
                setLoading(false);
            },
            (err: Error) => {
                console.error('Error fetching user quests:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId]);

    // Complete a quest
    const completeQuest = async (questId: string) => {
        if (!userId) return;

        try {
            const questDocId = `${userId}_${questId}`;
            const questRef = doc(db, 'userQuests', questDocId);

            await updateDoc(questRef, {
                status: 'completed',
                completedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                progress: 100
            });

            trackEvent('quest_completed', { questId });
        } catch (error) {
            console.error('Error completing quest:', error);
            throw error;
        }
    };

    return {
        quests,
        loading,
        error,
        completeQuest
    };
};
