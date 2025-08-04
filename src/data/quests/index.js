// Import des catégories
import { budgetingQuests } from './budgeting/index.js';
import { savingQuests } from './saving/index.js';
import { investingQuests } from './investing/index.js';
import { debtQuests } from './debt/index.js';
import { planningQuests } from './planning/index.js';

// Import des helpers et catégories
import { categories, categoryOrder } from './categories.js';
import { 
  localizeQuest, 
  validateQuest, 
  enrichQuestWithDefaults,
  getQuestStats,
  calculateTotalTime,
  exportForFirestore,
  generateQuestId,
  isQuestCompleted,
  calculateQuestProgress
} from './questHelpers.js';

// Combine toutes les quêtes
export const allQuests = [
  ...budgetingQuests,
  ...savingQuests,
  ...investingQuests,
  ...debtQuests,
  ...planningQuests
];

// Cache pour performance
const questCache = new Map();

/**
 * Récupère une quête par son ID
 * @param {string} questId - ID de la quête
 * @param {string} lang - Langue (en/fr)
 * @returns {Object|null} - La quête localisée ou null
 */
export const getQuestById = (questId, lang = 'en') => {
  // Vérifier le cache
  const cacheKey = `${questId}_${lang}`;
  if (questCache.has(cacheKey)) {
    return questCache.get(cacheKey);
  }

  // Chercher la quête
  const quest = allQuests.find(q => q.id === questId);
  if (!quest) return null;

  // Localiser et enrichir
  const localizedQuest = localizeQuest(quest, lang);
  const enrichedQuest = enrichQuestWithDefaults(localizedQuest);

  // Mettre en cache
  questCache.set(cacheKey, enrichedQuest);
  return enrichedQuest;
};

/**
 * Récupère les quêtes par catégorie
 * @param {string} category - Catégorie
 * @param {string} lang - Langue (en/fr)
 * @returns {Array} - Quêtes de la catégorie
 */
export const getQuestsByCategory = (category, lang = 'en') => {
  const categoryQuests = allQuests.filter(quest => quest.category === category);
  return categoryQuests.map(quest => localizeQuest(quest, lang));
};

/**
 * Récupère les quêtes gratuites
 * @param {string} lang - Langue (en/fr)
 * @returns {Array} - Quêtes gratuites
 */
export const getFreeQuests = (lang = 'en') => {
  const freeQuests = allQuests.filter(quest => !quest.isPremium);
  return freeQuests.map(quest => localizeQuest(quest, lang));
};

/**
 * Récupère les quêtes premium
 * @param {string} lang - Langue (en/fr)
 * @returns {Array} - Quêtes premium
 */
export const getPremiumQuests = (lang = 'en') => {
  const premiumQuests = allQuests.filter(quest => quest.isPremium);
  return premiumQuests.map(quest => localizeQuest(quest, lang));
};

/**
 * Récupère les quêtes recommandées
 * @param {Array} completedQuestIds - IDs des quêtes complétées
 * @param {number} userLevel - Niveau utilisateur
 * @param {string} lang - Langue (en/fr)
 * @returns {Array} - Quêtes recommandées
 */
export const getRecommendedQuests = (completedQuestIds = [], userLevel = 1, lang = 'en') => {
  const availableQuests = allQuests.filter(quest => 
    !completedQuestIds.includes(quest.id) && 
    !quest.isPremium
  );

  // Trier par difficulté et popularité
  const recommended = availableQuests
    .sort((a, b) => {
      // Priorité aux quêtes populaires
      const aPopularity = a.metadata?.userRating || 4.0;
      const bPopularity = b.metadata?.userRating || 4.0;
      
      if (aPopularity !== bPopularity) {
        return bPopularity - aPopularity;
      }
      
      // Puis par ordre
      return a.order - b.order;
    })
    .slice(0, 5); // Top 5

  return recommended.map(quest => localizeQuest(quest, lang));
};

/**
 * Récupère les statistiques globales
 * @returns {Object} - Statistiques
 */
export const getGlobalQuestStats = () => {
  const totalQuests = allQuests.length;
  const totalXP = allQuests.reduce((sum, quest) => sum + quest.xp, 0);
  const totalDuration = allQuests.reduce((sum, quest) => sum + quest.duration, 0);
  const freeQuests = allQuests.filter(quest => !quest.isPremium).length;
  const premiumQuests = allQuests.filter(quest => quest.isPremium).length;

  return {
    totalQuests,
    totalXP,
    totalDuration,
    freeQuests,
    premiumQuests,
    categories: categoryOrder.length,
    averageCompletionRate: 0.82,
    averageUserRating: 4.6
  };
};

/**
 * Récupère une quête de manière asynchrone (pour lazy loading)
 * @param {string} questId - ID de la quête
 * @param {string} lang - Langue (en/fr)
 * @returns {Promise<Object>} - La quête
 */
export const getQuestByIdAsync = async (questId, lang = 'en') => {
  // Simulation de lazy loading
  return new Promise((resolve) => {
    setTimeout(() => {
      const quest = getQuestById(questId, lang);
      resolve(quest);
    }, 100);
  });
};

/**
 * Récupère les métriques d'une quête
 * @param {string} questId - ID de la quête
 * @returns {Object} - Métriques
 */
export const getQuestAnalytics = (questId) => {
  const quest = allQuests.find(q => q.id === questId);
  if (!quest) return null;

  return {
    questId,
    stats: getQuestStats(quest),
    analytics: quest.analytics,
    metadata: quest.metadata
  };
};

/**
 * Valide toutes les quêtes
 * @returns {Object} - Résultats de validation
 */
export const validateAllQuests = () => {
  const results = allQuests.map(quest => ({
    questId: quest.id,
    ...validateQuest(quest)
  }));

  const validQuests = results.filter(r => r.isValid);
  const invalidQuests = results.filter(r => !r.isValid);

  return {
    total: results.length,
    valid: validQuests.length,
    invalid: invalidQuests.length,
    details: results
  };
};

// Export des helpers
export { 
  localizeQuest,
  validateQuest,
  enrichQuestWithDefaults,
  getQuestStats,
  calculateTotalTime,
  exportForFirestore,
  generateQuestId,
  isQuestCompleted,
  calculateQuestProgress
};

// Export des catégories
export { categories, categoryOrder };

// Export des quêtes individuelles pour compatibilité
export { budgetBasics } from './budgeting/budget-basics.js'; 