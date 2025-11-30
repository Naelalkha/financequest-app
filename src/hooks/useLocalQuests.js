import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { cutSubscriptionQuest } from '../features/quests/registry';
import { toast } from 'react-toastify';

// Temporary: Simple quest helpers until full registry is implemented
// Only return the quest for 'global' to avoid duplicates
const getQuestsByCountry = (country) => country === 'global' ? [cutSubscriptionQuest] : [];
const getQuestsByCategory = () => [cutSubscriptionQuest];
const getFreeQuests = () => [cutSubscriptionQuest];
const getPremiumQuests = () => [];
const getRecommendedQuests = () => [cutSubscriptionQuest];
const getQuestById = (id) => id === cutSubscriptionQuest.id ? cutSubscriptionQuest : null;

/**
 * Custom hook for managing local quests with country support
 */
export const useLocalQuests = (filters = {}) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation('quests');
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      let allQuests = [];

      // Add global quests
      const globalQuests = getQuestsByCountry('global', i18n.language);
      allQuests.push(...globalQuests);

      // Add country-specific quests
      if (userCountry !== 'global') {
        const countryQuests = getQuestsByCountry(userCountry, i18n.language);
        allQuests.push(...countryQuests);
      }

      // Sort by order
      allQuests.sort((a, b) => (a.order || 999) - (b.order || 999));

      setQuests(allQuests);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching quests:', err);
      setError(err);
      setLoading(false);
      toast.error(t('errors.quest_load_failed') || 'Failed to load quests');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userCountry, i18n.language]);

  /**
   * Get quests by category for user's country
   */
  const getQuestsByCategoryForUser = (category) => {
    if (!user) return [];

    const globalCategoryQuests = getQuestsByCategory(category, i18n.language, 'global');
    const countryCategoryQuests = getQuestsByCategory(category, i18n.language, userCountry);

    return [...globalCategoryQuests, ...countryCategoryQuests];
  };

  /**
   * Get free quests for user's country
   */
  const getFreeQuestsForUser = () => {
    if (!user) return [];

    const globalFreeQuests = getFreeQuests(i18n.language, 'global');
    const countryFreeQuests = getFreeQuests(i18n.language, userCountry);

    return [...globalFreeQuests, ...countryFreeQuests];
  };

  /**
   * Get premium quests for user's country
   */
  const getPremiumQuestsForUser = () => {
    if (!user) return [];

    const globalPremiumQuests = getPremiumQuests(i18n.language, 'global');
    const countryPremiumQuests = getPremiumQuests(i18n.language, userCountry);

    return [...globalPremiumQuests, ...countryPremiumQuests];
  };

  /**
   * Get recommended quests for user's country
   */
  const getRecommendedQuestsForUser = (completedQuestIds = [], userLevel = 1) => {
    if (!user) return [];

    const globalRecommended = getRecommendedQuests(completedQuestIds, userLevel, i18n.language, 'global');
    const countryRecommended = getRecommendedQuests(completedQuestIds, userLevel, i18n.language, userCountry);

    // Combine and deduplicate
    const allRecommended = [...globalRecommended, ...countryRecommended];
    const uniqueRecommended = allRecommended.filter((quest, index, self) =>
      index === self.findIndex(q => q.id === quest.id)
    );

    return uniqueRecommended.slice(0, 5); // Return top 5
  };

  /**
   * Get quest by ID with user's country context
   */
  const getQuestByIdForUser = (questId) => {
    if (!user) return null;

    // Try to get from global quests first
    let quest = getQuestById(questId, i18n.language);

    // If not found in global, try country-specific
    if (!quest && userCountry !== 'global') {
      // This would require a modification to getQuestById to support country filtering
      // For now, we'll return the global quest if found
    }

    return quest;
  };

  /**
   * Get quest statistics for user's country
   */
  const getQuestStats = () => {
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
  };

  return {
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
  };
}; 