/**
 * useDashboardQuests - Custom hook for quest filtering and memoization
 *
 * Memoizes expensive quest filtering operations to prevent
 * unnecessary recalculations on every render
 */

import { useMemo } from 'react';
import { Quest } from '../../../hooks/useLocalQuests';
import { QuestProgress } from './useDashboardData';

export interface QuestWithProgress extends Quest {
    progress: number;
}

export interface DashboardQuestsData {
    activeQuestIds: string[];
    completedQuestIds: string[];
    activeQuests: QuestWithProgress[];
    completedQuests: Quest[];
    availableQuests: Quest[];
}

/**
 * Memoizes quest filtering based on user progress
 * Prevents Object.entries recalculations on every render
 */
export function useDashboardQuests(
    quests: Quest[] | undefined,
    userProgress: Record<string, QuestProgress>
): DashboardQuestsData {
    // Memoize active quest IDs
    const activeQuestIds = useMemo(() => {
        return Object.entries(userProgress)
            .filter(([_, p]) => p?.status === 'active' && (p?.progress || 0) > 0)
            .map(([id]) => id);
    }, [userProgress]);

    // Memoize completed quest IDs
    const completedQuestIds = useMemo(() => {
        return Object.entries(userProgress)
            .filter(([_, p]) => p?.status === 'completed')
            .map(([id]) => id);
    }, [userProgress]);

    // Memoize active quests with progress
    const activeQuests = useMemo(() => {
        return (quests || [])
            .filter(q => activeQuestIds.includes(q.id))
            .map(q => ({
                ...q,
                progress: userProgress[q.id]?.progress || 0
            }));
    }, [quests, activeQuestIds, userProgress]);

    // Memoize completed quests
    const completedQuests = useMemo(() => {
        return (quests || []).filter(q => completedQuestIds.includes(q.id));
    }, [quests, completedQuestIds]);

    // Memoize available quests (not completed)
    const availableQuests = useMemo(() => {
        return (quests || []).filter(q => !completedQuestIds.includes(q.id));
    }, [quests, completedQuestIds]);

    return {
        activeQuestIds,
        completedQuestIds,
        activeQuests,
        completedQuests,
        availableQuests
    };
}

export default useDashboardQuests;
