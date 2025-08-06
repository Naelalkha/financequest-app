import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  getQuestsByCountry, 
  getQuestsByCategory, 
  getFreeQuests, 
  getPremiumQuests,
  getRecommendedQuests,
  getQuestById
} from '../data/quests/index.js';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing local quests with country support
 */
export const useLocalQuests = (filters = {}) => {
  const { user } = useAuth();
  const { t, currentLang } = useLanguage();
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
      const globalQuests = getQuestsByCountry('global', currentLang);
      allQuests.push(...globalQuests);
      
      // Add country-specific quests
      if (userCountry !== 'global') {
        const countryQuests = getQuestsByCountry(userCountry, currentLang);
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
  }, [user, userCountry, currentLang, t]);

  /**
   * Get quests by category for user's country
   */
  const getQuestsByCategoryForUser = (category) => {
    if (!user) return [];
    
    const globalCategoryQuests = getQuestsByCategory(category, currentLang, 'global');
    const countryCategoryQuests = getQuestsByCategory(category, currentLang, userCountry);
    
    return [...globalCategoryQuests, ...countryCategoryQuests];
  };

  /**
   * Get free quests for user's country
   */
  const getFreeQuestsForUser = () => {
    if (!user) return [];
    
    const globalFreeQuests = getFreeQuests(currentLang, 'global');
    const countryFreeQuests = getFreeQuests(currentLang, userCountry);
    
    return [...globalFreeQuests, ...countryFreeQuests];
  };

  /**
   * Get premium quests for user's country
   */
  const getPremiumQuestsForUser = () => {
    if (!user) return [];
    
    const globalPremiumQuests = getPremiumQuests(currentLang, 'global');
    const countryPremiumQuests = getPremiumQuests(currentLang, userCountry);
    
    return [...globalPremiumQuests, ...countryPremiumQuests];
  };

  /**
   * Get recommended quests for user's country
   */
  const getRecommendedQuestsForUser = (completedQuestIds = [], userLevel = 1) => {
    if (!user) return [];
    
    const globalRecommended = getRecommendedQuests(completedQuestIds, userLevel, currentLang, 'global');
    const countryRecommended = getRecommendedQuests(completedQuestIds, userLevel, currentLang, userCountry);
    
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
    let quest = getQuestById(questId, currentLang);
    
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

/**
 * Hook for single quest details with country support
 */
export const useLocalQuestDetail = (questId) => {
  const { user } = useAuth();
  const { currentLang } = useLanguage();
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user's country, default to fr-FR
  const userCountry = user?.country || 'fr-FR';

  useEffect(() => {
    if (!questId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try to get quest from global first
      let questData = getQuestById(questId, currentLang);
      
      // If not found in global, try country-specific
      if (!questData && userCountry !== 'global') {
        // Get all quests for the user's country
        const globalQuests = getQuestsByCountry('global', currentLang);
        const countryQuests = getQuestsByCountry(userCountry, currentLang);
        const allQuests = [...globalQuests, ...countryQuests];
        
        questData = allQuests.find(q => q.id === questId);
      }
      
      if (!questData) {
        setError('Quest not found');
        setLoading(false);
        return;
      }

      setQuest(questData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching quest detail:', err);
      setError(err);
      setLoading(false);
    }
  }, [questId, user, currentLang, userCountry]);

  return {
    quest,
    loading,
    error
  };
}; 