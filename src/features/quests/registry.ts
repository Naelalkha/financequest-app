/**
 * QUÊTES ACTIONNABLES - Index principal
 * 
 * Nouvelles quêtes orientées action et économies réelles
 * Remplace le système éducatif par des actions concrètes
 */

import { cutSubscriptionQuest } from './pilotage/cut-subscription/metadata.js';
import { microExpensesQuest } from './pilotage/micro-expenses/metadata.js';

// ========================================
// TYPES
// ========================================

/** Quest difficulty levels */
export type QuestDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** Quest category types */
export type QuestCategory = 'budget' | 'savings' | 'debt' | 'investing' | 'income' | 'planning' | 'pilotage' | 'defense' | 'growth' | 'strategy';

/** Quest estimated impact */
export interface QuestEstimatedImpact {
  amount: number;
  period: 'once' | 'day' | 'week' | 'month' | 'year';
}

/** Quest placement configuration */
export interface QuestPlacement {
  starterPack?: {
    order?: number;
  };
}

/** Quest metadata interface */
export interface Quest {
  id: string;
  title?: string;
  description?: string;
  category: QuestCategory;
  difficulty?: QuestDifficulty;
  duration?: number;
  xp?: number;
  xpReward?: number;
  isPremium?: boolean;
  starterPack?: boolean;
  country?: string;
  availableIn?: string[];
  prerequisites?: string[];
  estimatedImpact?: QuestEstimatedImpact;
  placement?: QuestPlacement;
  order?: number;
  i18nKey?: string;
  tags?: string[];
  iconType?: string;
}

/** User profile for quest filtering */
export interface UserProfile {
  isPremium?: boolean;
  completedQuestIds?: string[];
  country?: string;
  level?: number | string;
}

/** Quest stats */
export interface QuestsStats {
  total: number;
  free: number;
  premium: number;
  starter: number;
  totalPotentialImpact: number;
  byCategory: Array<{ category: string; count: number; impact: number }>;
  byDifficulty: Array<{ difficulty: string; count: number }>;
}

// ========================================
// EXPORT INDIVIDUEL
// ========================================

export { cutSubscriptionQuest };
export { microExpensesQuest };


// ========================================
// COLLECTIONS
// ========================================

/**
 * Toutes les quêtes actives
 */
export const allQuests: Quest[] = [
  cutSubscriptionQuest as Quest,
  microExpensesQuest as Quest,
  // Les prochaines quêtes seront ajoutées ici
];

/**
 * Quêtes du Starter Pack
 * Affichées en premier, optimisées pour quick wins
 */
export const starterPackQuests: Quest[] = allQuests
  .filter(q => q.starterPack === true)
  .sort((a, b) => (a.placement?.starterPack?.order || 999) - (b.placement?.starterPack?.order || 999));

/**
 * Alias pour compatibilité
 */
export const getStarterPackQuests = (locale: string = 'fr'): (Quest | null)[] => {
  return starterPackQuests.map(quest => getLocalizedQuest(quest.id, locale));
};

/**
 * Quêtes gratuites
 */
export const freeQuests: Quest[] = allQuests.filter(q => q.isPremium === false);

/**
 * Quêtes premium
 */
export const premiumQuests: Quest[] = allQuests.filter(q => q.isPremium === true);

/**
 * Quêtes par catégorie
 */
export const questsByCategory: Record<string, Quest[]> = {
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
export const questsByDifficulty: Record<string, Quest[]> = {
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
 */
export const getQuestsByCountry = (country: string = 'fr-FR', locale: string = 'fr'): (Quest | null)[] => {
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
 */
export const getQuestById = (questId: string, locale: string | null = null): Quest | null => {
  const quest = allQuests.find(q => q.id === questId) || null;

  // Si locale fournie, retourner version localisée
  if (quest && locale) {
    return getLocalizedQuest(questId, locale);
  }

  return quest;
};

/**
 * Récupère le contenu localisé d'une quête
 *
 * Note: Avec le nouveau format i18nKey, les traductions sont dans les fichiers i18n.
 * Cette fonction retourne simplement la quête. Utilisez useLocalizedQuest() dans les composants React.
 */
export const getLocalizedQuest = (questId: string, locale: string = 'fr'): Quest | null => {
  const quest = getQuestById(questId);
  if (!quest) return null;

  // Pour les quêtes avec i18nKey, retourner la quête telle quelle
  // Les traductions seront chargées par useLocalizedQuest() dans les composants
  return quest;
};

/**
 * Récupère les quêtes par catégorie (avec support pays)
 */
export const getQuestsByCategory = (
  category: string,
  locale: string = 'fr',
  country: string | null = null
): Quest[] => {
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
    .filter((q): q is Quest => q !== null)
    .sort((a, b) => (a.order || 999) - (b.order || 999));
};

/**
 * Récupère les quêtes gratuites (avec support pays)
 * @param {string} locale - Locale
 * @param {string} country - Code pays (optionnel)
 * @returns {Array} - Quêtes gratuites
 */
export const getFreeQuests = (locale: string = 'fr', country: string | null = null): (Quest | null)[] => {
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
export const getPremiumQuests = (locale: string = 'fr', country: string | null = null): (Quest | null)[] => {
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
export const calculateQuestAnnualImpact = (quest: Quest | null): number => {
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
export const calculateTotalPotentialImpact = (): number => {
  return allQuests.reduce((total, quest) => {
    return total + calculateQuestAnnualImpact(quest);
  }, 0);
};

/**
 * Filtre les quêtes disponibles pour un utilisateur
 */
export const getAvailableQuests = (
  userProfile: UserProfile = {},
  locale: string = 'fr-FR'
): Quest[] => {
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
export const getRecommendedQuests = (
  arg1: UserProfile | string[] = {},
  arg2: number | string = 3,
  arg3: string = 'fr',
  arg4: string | null = null
): Quest[] => {
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

