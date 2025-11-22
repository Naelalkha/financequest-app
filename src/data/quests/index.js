/**
 * QUÊTES ACTIONNABLES - Index principal
 * 
 * Nouvelles quêtes orientées action et économies réelles
 * Remplace le système éducatif par des actions concrètes
 */

import cutSubscriptionQuest from './cut-subscription-v1.js';
import { localizeQuest } from './questHelpers.js';

// ========================================
// EXPORT INDIVIDUEL
// ========================================

export { cutSubscriptionQuest };

// Export des helpers
export { localizeQuest };

// ========================================
// COLLECTIONS
// ========================================

/**
 * Toutes les quêtes actives
 */
export const allQuests = [
  cutSubscriptionQuest,
  // Les prochaines quêtes seront ajoutées ici
];

/**
 * Quêtes du Starter Pack
 * Affichées en premier, optimisées pour quick wins
 */
export const starterPackQuests = allQuests
  .filter(q => q.starterPack === true)
  .sort((a, b) => (a.placement?.starterPack?.order || 999) - (b.placement?.starterPack?.order || 999));

/**
 * Alias pour compatibilité
 */
export const getStarterPackQuests = (locale = 'fr') => {
  return starterPackQuests.map(quest => getLocalizedQuest(quest.id, locale));
};

/**
 * Quêtes gratuites
 */
export const freeQuests = allQuests.filter(q => q.isPremium === false);

/**
 * Quêtes premium
 */
export const premiumQuests = allQuests.filter(q => q.isPremium === true);

/**
 * Quêtes par catégorie
 */
export const questsByCategory = {
  budget: allQuests.filter(q => q.category === 'budget'),
  savings: allQuests.filter(q => q.category === 'savings'),
  debt: allQuests.filter(q => q.category === 'debt'),
  investing: allQuests.filter(q => q.category === 'investing'),
  income: allQuests.filter(q => q.category === 'income'),
  planning: allQuests.filter(q => q.category === 'planning'),
};

/**
 * Quêtes par difficulté
 */
export const questsByDifficulty = {
  beginner: allQuests.filter(q => q.difficulty === 'beginner'),
  intermediate: allQuests.filter(q => q.difficulty === 'intermediate'),
  advanced: allQuests.filter(q => q.difficulty === 'advanced'),
  expert: allQuests.filter(q => q.difficulty === 'expert'),
};

// ========================================
// HELPERS
// ========================================

/**
 * Récupère les quêtes par pays (compatibilité avec ancien système)
 * @param {string} country - Code pays (fr-FR, en-US, global)
 * @param {string} locale - Locale pour localisation
 * @returns {Array} - Quêtes disponibles pour ce pays
 */
export const getQuestsByCountry = (country = 'fr-FR', locale = 'fr') => {
  return allQuests
    .filter(quest => {
      // Si la quête n'a pas de restriction de pays, elle est disponible partout
      if (!quest.country) return true;
      
      // Si on cherche les quêtes globales
      if (country === 'global') {
        return !quest.country || quest.country === 'global';
      }
      
      // Vérifier si la quête est disponible dans ce pays
      if (quest.country === country) return true;
      if (quest.availableIn && quest.availableIn.includes(country)) return true;
      
      return false;
    })
    .map(quest => getLocalizedQuest(quest.id, locale));
};

/**
 * Récupère une quête par son ID
 * @param {string} questId - ID de la quête
 * @param {string} locale - Locale optionnelle pour localisation directe
 * @returns {Object|null} - La quête (localisée si locale fournie)
 */
export const getQuestById = (questId, locale = null) => {
  const quest = allQuests.find(q => q.id === questId) || null;
  
  // Si locale fournie, retourner version localisée
  if (quest && locale) {
    return getLocalizedQuest(questId, locale);
  }
  
  return quest;
};

/**
 * Récupère le contenu localisé d'une quête
 * Utilise localizeQuest de questHelpers qui gère les deux formats
 */
export const getLocalizedQuest = (questId, locale = 'fr') => {
  const quest = getQuestById(questId);
  if (!quest) return null;
  
  // Utiliser localizeQuest qui gère à la fois l'ancien format (content.{lang})
  // et le nouveau format (title_fr, title_en au niveau racine)
  return localizeQuest(quest, locale);
};

/**
 * Récupère les quêtes par catégorie (avec support pays)
 * @param {string} category - Catégorie
 * @param {string} locale - Locale
 * @param {string} country - Code pays (optionnel)
 * @returns {Array} - Quêtes de cette catégorie
 */
export const getQuestsByCategory = (category, locale = 'fr', country = null) => {
  let quests = allQuests.filter(q => q.category === category);
  
  // Filtrer par pays si spécifié
  if (country) {
    quests = quests.filter(quest => {
      if (!quest.country) return true;
      if (country === 'global') return !quest.country || quest.country === 'global';
      if (quest.country === country) return true;
      if (quest.availableIn && quest.availableIn.includes(country)) return true;
      return false;
    });
  }
  
  return quests
    .map(quest => getLocalizedQuest(quest.id, locale))
    .sort((a, b) => (a.order || 999) - (b.order || 999));
};

/**
 * Récupère les quêtes gratuites (avec support pays)
 * @param {string} locale - Locale
 * @param {string} country - Code pays (optionnel)
 * @returns {Array} - Quêtes gratuites
 */
export const getFreeQuests = (locale = 'fr', country = null) => {
  let quests = allQuests.filter(q => !q.isPremium);
  
  // Filtrer par pays si spécifié
  if (country) {
    quests = quests.filter(quest => {
      if (!quest.country) return true;
      if (country === 'global') return !quest.country || quest.country === 'global';
      if (quest.country === country) return true;
      if (quest.availableIn && quest.availableIn.includes(country)) return true;
      return false;
    });
  }
  
  return quests.map(quest => getLocalizedQuest(quest.id, locale));
};

/**
 * Récupère les quêtes premium (avec support pays)
 * @param {string} locale - Locale
 * @param {string} country - Code pays (optionnel)
 * @returns {Array} - Quêtes premium
 */
export const getPremiumQuests = (locale = 'fr', country = null) => {
  let quests = allQuests.filter(q => q.isPremium);
  
  // Filtrer par pays si spécifié
  if (country) {
    quests = quests.filter(quest => {
      if (!quest.country) return true;
      if (country === 'global') return !quest.country || quest.country === 'global';
      if (quest.country === country) return true;
      if (quest.availableIn && quest.availableIn.includes(country)) return true;
      return false;
    });
  }
  
  return quests.map(quest => getLocalizedQuest(quest.id, locale));
};

/**
 * Calcule l'impact annuel d'une quête
 */
export const calculateQuestAnnualImpact = (quest) => {
  if (!quest?.estimatedImpact) return 0;
  
  const { amount, period } = quest.estimatedImpact;
  
  switch (period) {
    case 'month':
      return amount * 12;
    case 'year':
      return amount;
    case 'week':
      return amount * 52;
    case 'day':
      return amount * 365;
    case 'once':
    default:
      return amount;
  }
};

/**
 * Calcule l'impact total potentiel de toutes les quêtes
 */
export const calculateTotalPotentialImpact = () => {
  return allQuests.reduce((total, quest) => {
    return total + calculateQuestAnnualImpact(quest);
  }, 0);
};

/**
 * Filtre les quêtes disponibles pour un utilisateur
 * @param {Object} userProfile - Profil utilisateur (premium, completedQuests, etc.)
 * @param {string} locale - Locale (fr-FR, en-US, etc.)
 */
export const getAvailableQuests = (userProfile = {}, locale = 'fr-FR') => {
  const { isPremium = false, completedQuestIds = [], country = 'fr-FR' } = userProfile;
  
  return allQuests.filter(quest => {
    // Filtre premium
    if (quest.isPremium && !isPremium) return false;
    
    // Filtre déjà complétées
    if (completedQuestIds.includes(quest.id)) return false;
    
    // Filtre pays (si spécifié)
    if (quest.country && quest.country !== country) {
      // Vérifier si disponible dans d'autres pays
      if (!quest.availableIn || !quest.availableIn.includes(country)) {
        return false;
      }
    }
    
    // Filtre prerequisites
    if (quest.prerequisites && quest.prerequisites.length > 0) {
      const hasPrerequisites = quest.prerequisites.every(prereqId =>
        completedQuestIds.includes(prereqId)
      );
      if (!hasPrerequisites) return false;
    }
    
    return true;
  });
};

/**
 * Recommande les prochaines quêtes pour un utilisateur
 * Signatures multiples pour compatibilité :
 * - (userProfile, limit) - Nouveau format
 * - (completedQuestIds, userLevel, locale, country) - Ancien format (useLocalQuests)
 * 
 * @param {Object|Array} arg1 - userProfile ou completedQuestIds
 * @param {number|string} arg2 - limit ou userLevel
 * @param {string} arg3 - locale (ancien format)
 * @param {string} arg4 - country (ancien format)
 * @returns {Array} - Quêtes recommandées
 */
export const getRecommendedQuests = (arg1 = {}, arg2 = 3, arg3 = 'fr', arg4 = null) => {
  let available;
  let locale = 'fr';
  let limit = 3;
  
  // Déterminer le format d'appel
  if (Array.isArray(arg1)) {
    // Ancien format : (completedQuestIds, userLevel, locale, country)
    const completedQuestIds = arg1;
    const userLevel = arg2;
    locale = arg3 || 'fr';
    const country = arg4;
    limit = 3; // Limite fixe pour ancien format
    
    // Créer un userProfile compatible
    const userProfile = {
      completedQuestIds,
      level: userLevel,
      country: country || 'fr-FR'
    };
    
    available = getAvailableQuests(userProfile, locale);
    
    // Filtrer par pays si spécifié
    if (country) {
      available = available.filter(quest => {
        if (!quest.country) return true;
        if (country === 'global') return !quest.country || quest.country === 'global';
        if (quest.country === country) return true;
        if (quest.availableIn && quest.availableIn.includes(country)) return true;
        return false;
      });
    }
  } else {
    // Nouveau format : (userProfile, limit)
    const userProfile = arg1;
    limit = arg2 || 3;
    available = getAvailableQuests(userProfile);
  }
  
  // Prioriser :
  // 1. Starter pack d'abord
  // 2. Impact le plus élevé
  // 3. Durée la plus courte
  
  return available
    .sort((a, b) => {
      // Starter pack en premier
      if (a.starterPack && !b.starterPack) return -1;
      if (!a.starterPack && b.starterPack) return 1;
      
      // Puis par impact annuel
      const impactA = calculateQuestAnnualImpact(a);
      const impactB = calculateQuestAnnualImpact(b);
      if (impactA !== impactB) return impactB - impactA;
      
      // Puis par durée (les plus courtes d'abord)
      return (a.duration || 999) - (b.duration || 999);
    })
    .slice(0, limit);
};

/**
 * Stats sur les quêtes
 */
export const getQuestsStats = () => {
  return {
    total: allQuests.length,
    free: freeQuests.length,
    premium: premiumQuests.length,
    starter: starterPackQuests.length,
    totalPotentialImpact: calculateTotalPotentialImpact(),
    byCategory: Object.entries(questsByCategory).map(([cat, quests]) => ({
      category: cat,
      count: quests.length,
      impact: quests.reduce((sum, q) => sum + calculateQuestAnnualImpact(q), 0)
    })),
    byDifficulty: Object.entries(questsByDifficulty).map(([diff, quests]) => ({
      difficulty: diff,
      count: quests.length
    }))
  };
};

// ========================================
// EXPORT PAR DÉFAUT
// ========================================

export default {
  allQuests,
  starterPackQuests,
  getStarterPackQuests,
  freeQuests,
  premiumQuests,
  questsByCategory,
  questsByDifficulty,
  getQuestById,
  getLocalizedQuest,
  localizeQuest,
  getQuestsByCountry,
  getQuestsByCategory,
  getFreeQuests,
  getPremiumQuests,
  calculateQuestAnnualImpact,
  calculateTotalPotentialImpact,
  getAvailableQuests,
  getRecommendedQuests,
  getQuestsStats
};

