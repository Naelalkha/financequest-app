import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  allQuests,
  getQuestsByCountry as registryGetQuestsByCountry,
  getQuestsByCategory as registryGetQuestsByCategory,
  getFreeQuests as registryGetFreeQuests,
  getPremiumQuests as registryGetPremiumQuests,
  getRecommendedQuests as registryGetRecommendedQuests,
  getQuestById as registryGetQuestById
} from '../features/quests/registry';

/** Quest estimated impact */
export interface QuestEstimatedImpact {
  amount: number;
  period: 'once' | 'day' | 'week' | 'month' | 'year';
}

/** Quest data structure */
export interface Quest {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  country?: string;
  isPremium?: boolean;
  order?: number;
  xp?: number;
  xpReward?: number;
  duration?: number;
  difficulty?: string;
  i18nKey?: string;
  estimatedImpact?: QuestEstimatedImpact;
}

/** Filters for quest queries */
interface QuestFilters {
  category?: string;
  isPremium?: boolean;
  country?: string;
}

/** Return type for useLocalQuests hook */
export interface UseLocalQuestsReturn {
  quests: Quest[];
  loading: boolean;
  error: Error | null;
  userCountry: string;
  getQuestsByCategoryForUser: (category: string) => Quest[];
  getFreeQuestsForUser: () => Quest[];
  getPremiumQuestsForUser: () => Quest[];
  getRecommendedQuestsForUser: (completedQuestIds?: string[], userLevel?: number) => Quest[];
  getQuestByIdForUser: (questId: string) => Quest | null;
  getQuestStats: () => QuestStats;
}

interface QuestStats {
  total: number;
  free: number;
  premium: number;
  global: number;
  countrySpecific: number;
  userCountry: string;
}

// Use registry functions with fallbacks to allQuests
const getQuestsByCountry = (country: string, locale: string): Quest[] => {
  try {
    return registryGetQuestsByCountry(country, locale) as Quest[];
  } catch {
    return (allQuests as Quest[]).filter(q => !q.country || q.country === 'global' || q.country === country);
  }
};

const getQuestsByCategory = (category: string, locale: string, country: string): Quest[] => {
  try {
    return registryGetQuestsByCategory(category, locale, country) as Quest[];
  } catch {
    return (allQuests as Quest[]).filter(q => q.category === category);
  }
};

const getFreeQuests = (locale: string, country: string): Quest[] => {
  try {
    return registryGetFreeQuests(locale, country) as Quest[];
  } catch {
    return (allQuests as Quest[]).filter(q => !q.isPremium);
  }
};

const getPremiumQuests = (locale: string, country: string): Quest[] => {
  try {
    return registryGetPremiumQuests(locale, country) as Quest[];
  } catch {
    return (allQuests as Quest[]).filter(q => q.isPremium);
  }
};

const getRecommendedQuests = (completedQuestIds: string[], userLevel: number, locale: string, country: string): Quest[] => {
  try {
    return registryGetRecommendedQuests(completedQuestIds, userLevel, locale, country) as Quest[];
  } catch {
    return (allQuests as Quest[]).filter(q => !completedQuestIds.includes(q.id)).slice(0, 3);
  }
};

const getQuestById = (id: string, locale: string): Quest | null => {
  try {
    return registryGetQuestById(id, locale) as Quest | null;
  } catch {
    return (allQuests as Quest[]).find(q => q.id === id) || null;
  }
};

/**
 * Custom hook for managing local quests with country support
 */
export const useLocalQuests = (_filters: QuestFilters = {}): UseLocalQuestsReturn => {
  const { user } = useAuth();
  const { i18n } = useTranslation('quests');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get user's country, default to fr-FR
  const userCountry = user?.country || 'fr-FR';

  // Fetch quests based on user's country
  useEffect(() => {
    if (!user) {
      setQuests([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get all quests for user's country (global + country-specific)
      const allQuestsLocal: Quest[] = [];

      // Add global quests
      const globalQuests = getQuestsByCountry('global', i18n.language);
      allQuestsLocal.push(...globalQuests);

      // Add country-specific quests
      if (userCountry !== 'global') {
        const countryQuests = getQuestsByCountry(userCountry, i18n.language);
        allQuestsLocal.push(...countryQuests);
      }

      // Sort by order
      allQuestsLocal.sort((a, b) => (a.order || 999) - (b.order || 999));

      setQuests(allQuestsLocal);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching quests:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      console.error('Failed to load quests');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userCountry, i18n.language]);

  /**
   * Get quests by category for user's country
   * Memoized with useCallback to prevent recreation on every render
   */
  const getQuestsByCategoryForUser = useCallback((category: string): Quest[] => {
    if (!user) return [];

    const globalCategoryQuests = getQuestsByCategory(category, i18n.language, 'global');
    const countryCategoryQuests = getQuestsByCategory(category, i18n.language, userCountry);

    return [...globalCategoryQuests, ...countryCategoryQuests];
  }, [user, i18n.language, userCountry]);

  /**
   * Get free quests for user's country
   */
  const getFreeQuestsForUser = useCallback(() => {
    if (!user) return [];

    const globalFreeQuests = getFreeQuests(i18n.language, 'global');
    const countryFreeQuests = getFreeQuests(i18n.language, userCountry);

    return [...globalFreeQuests, ...countryFreeQuests];
  }, [user, i18n.language, userCountry]);

  /**
   * Get premium quests for user's country
   */
  const getPremiumQuestsForUser = useCallback(() => {
    if (!user) return [];

    const globalPremiumQuests = getPremiumQuests(i18n.language, 'global');
    const countryPremiumQuests = getPremiumQuests(i18n.language, userCountry);

    return [...globalPremiumQuests, ...countryPremiumQuests];
  }, [user, i18n.language, userCountry]);

  /**
   * Get recommended quests for user's country
   */
  const getRecommendedQuestsForUser = useCallback((completedQuestIds: string[] = [], userLevel: number = 1): Quest[] => {
    if (!user) return [];

    const globalRecommended = getRecommendedQuests(completedQuestIds, userLevel, i18n.language, 'global');
    const countryRecommended = getRecommendedQuests(completedQuestIds, userLevel, i18n.language, userCountry);

    // Combine and deduplicate
    const allRecommended = [...globalRecommended, ...countryRecommended];
    const uniqueRecommended = allRecommended.filter((quest, index, self) =>
      index === self.findIndex(q => q.id === quest.id)
    );

    return uniqueRecommended.slice(0, 5); // Return top 5
  }, [user, i18n.language, userCountry]);

  /**
   * Get quest by ID with user's country context
   */
  const getQuestByIdForUser = useCallback((questId: string): Quest | null => {
    if (!user) return null;

    // Try to get from global quests first
    const quest = getQuestById(questId, i18n.language);

    return quest;
  }, [user, i18n.language]);

  /**
   * Get quest statistics for user's country
   * Memoized to prevent recalculation on every render
   */
  const getQuestStats = useCallback((): QuestStats => {
    const total = quests.length;
    const free = quests.filter(q => !q.isPremium).length;
    const premium = quests.filter(q => q.isPremium).length;
    const global = quests.filter(q => !q.country || q.country === 'global').length;
    const countrySpecific = quests.filter(q => q.country === userCountry).length;

    return {
      total,
      free,
      premium,
      global,
      countrySpecific,
      userCountry
    };
  }, [quests, userCountry]);

  // Memoize return object to prevent unnecessary re-renders in consumers
  return useMemo(() => ({
    quests,
    loading,
    error,
    userCountry,
    getQuestsByCategoryForUser,
    getFreeQuestsForUser,
    getPremiumQuestsForUser,
    getRecommendedQuestsForUser,
    getQuestByIdForUser,
    getQuestStats
  }), [
    quests,
    loading,
    error,
    userCountry,
    getQuestsByCategoryForUser,
    getFreeQuestsForUser,
    getPremiumQuestsForUser,
    getRecommendedQuestsForUser,
    getQuestByIdForUser,
    getQuestStats
  ]);
}; 