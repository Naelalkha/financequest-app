/**
 * QUEST HELPERS - Utilitaires pour les quêtes actionnables
 * Compatible avec la nouvelle structure de quêtes
 */

/**
 * Localise une quête selon la langue
 * Adapté pour la nouvelle structure avec content.{lang}
 * 
 * @param {Object} quest - La quête à localiser
 * @param {string} lang - La langue (en/fr)
 * @returns {Object} - La quête localisée
 */
export const localizeQuest = (quest, lang = 'fr') => {
  if (!quest) return null;

  // Normaliser la langue (fr-FR → fr, en-US → en)
  const normalizedLang = lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';

  // Pour les nouvelles quêtes avec structure content.{lang}
  if (quest.content && quest.content[normalizedLang]) {
    const localizedContent = quest.content[normalizedLang];
    
    return {
      ...quest,
      title: localizedContent.title,
      subtitle: localizedContent.subtitle,
      description: localizedContent.description,
      tagline: localizedContent.tagline,
      objectives: localizedContent.objectives,
      content: localizedContent, // Inclure tout le contenu localisé
      locale: normalizedLang
    };
  }

  // Fallback pour anciennes quêtes (compatibilité avec format archivé)
  const localized = {
    ...quest,
    title: quest[`title_${normalizedLang}`] || quest.title_en || quest.title,
    description: quest[`description_${normalizedLang}`] || quest.description_en || quest.description,
    objectives: quest[`objectives_${normalizedLang}`] || quest.objectives_en || quest.objectives,
    prerequisites: quest[`prerequisites_${normalizedLang}`] || quest.prerequisites_en || quest.prerequisites,
    locale: normalizedLang
  };

  // Localiser les steps si présents (anciennes quêtes)
  if (quest.steps && Array.isArray(quest.steps)) {
    localized.steps = quest.steps.map(step => {
      const localizedStep = { ...step };
      
      // Localiser les propriétés de base
      localizedStep.title = step[`title_${normalizedLang}`] || step.title_en || step.title;
      localizedStep.content = step[`content_${normalizedLang}`] || step.content_en || step.content;
      localizedStep.description = step[`description_${normalizedLang}`] || step.description_en || step.description;
      localizedStep.question = step[`question_${normalizedLang}`] || step.question_en || step.question;
      localizedStep.explanation = step[`explanation_${normalizedLang}`] || step.explanation_en || step.explanation;
      localizedStep.hint = step[`hint_${normalizedLang}`] || step.hint_en || step.hint;
      localizedStep.options = step[`options_${normalizedLang}`] || step.options_en || step.options;
      localizedStep.funFact = step[`funFact_${normalizedLang}`] || step.funFact_en || step.funFact;
      localizedStep.prompt = step[`prompt_${normalizedLang}`] || step.prompt_en || step.prompt;
      localizedStep.instruction = step[`instruction_${normalizedLang}`] || step.instruction_en || step.instruction;
      
      // Localiser les propriétés spécifiques aux types de steps
      localizedStep.items = step[`items_${normalizedLang}`] || step.items_en || step.items;
      
      // Si items existe et n'est pas encore localisé, s'assurer qu'il est dans le bon format
      if (localizedStep.items && Array.isArray(localizedStep.items)) {
        localizedStep.items = localizedStep.items.map(item => {
          // Si c'est déjà un objet avec id et text, localiser le text si nécessaire
          if (typeof item === 'object' && item.id) {
            return {
              ...item,
              text: item[`text_${normalizedLang}`] || item.text_en || item.text
            };
          }
          // Si c'est juste une string, la convertir en objet
          if (typeof item === 'string') {
            return {
              id: `item-${Math.random().toString(36).substr(2, 9)}`,
              text: item,
              xp: 5
            };
          }
          return item;
        });
      }
      
      localizedStep.services = step[`services_${normalizedLang}`] || step.services_en || step.services;
      localizedStep.errors = step[`errors_${normalizedLang}`] || step.errors_en || step.errors;
      localizedStep.help = step[`help_${normalizedLang}`] || step.help_en || step.help;
      localizedStep.skipCTA = step[`skipCTA_${normalizedLang}`] || step.skipCTA_en || step.skipCTA;
      
      // Localiser les actions si présentes
      if (step.actions && Array.isArray(step.actions)) {
        localizedStep.actions = step.actions.map(action => ({
          ...action,
          label: action[`label_${normalizedLang}`] || action.label_en || action.label
        }));
      }
      
      return localizedStep;
    });
  }

  return localized;
};

/**
 * Récupère le contenu localisé d'un step spécifique
 * Pour les nouvelles quêtes actionnables
 * 
 * @param {Object} quest - La quête
 * @param {string} stepId - L'ID du step
 * @param {string} lang - La langue
 * @returns {Object} - Le contenu du step localisé
 */
export const getLocalizedStepContent = (quest, stepId, lang = 'fr') => {
  if (!quest || !stepId) return null;

  const normalizedLang = lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  
  // Pour les nouvelles quêtes
  if (quest.content && quest.content[normalizedLang] && quest.content[normalizedLang].steps) {
    return quest.content[normalizedLang].steps[stepId] || null;
  }

  // Fallback pour anciennes quêtes
  const step = quest.steps?.find(s => s.id === stepId);
  if (!step) return null;

  return {
    title: step[`title_${normalizedLang}`] || step.title_en || step.title,
    content: step[`content_${normalizedLang}`] || step.content_en || step.content,
    ...step
  };
};

/**
 * Récupère un CTA localisé
 * 
 * @param {Object} quest - La quête
 * @param {string} ctaKey - La clé du CTA (ex: 'start', 'continue')
 * @param {string} lang - La langue
 * @returns {string} - Le texte du CTA
 */
export const getLocalizedCTA = (quest, ctaKey, lang = 'fr') => {
  const normalizedLang = lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  
  if (quest.content && quest.content[normalizedLang] && quest.content[normalizedLang].cta) {
    return quest.content[normalizedLang].cta[ctaKey] || ctaKey;
  }
  
  return ctaKey;
};

/**
 * Valide la structure d'une quête actionnable
 * 
 * @param {Object} quest - La quête à valider
 * @returns {Object} - Résultat de validation
 */
export const validateQuest = (quest) => {
  const errors = [];
  const warnings = [];

  // Vérifications obligatoires
  if (!quest.id) errors.push('Quest ID is required');
  if (!quest.type) errors.push('Quest type is required');
  if (!quest.category) errors.push('Quest category is required');
  
  // Vérifier le contenu localisé
  if (!quest.content) {
    errors.push('Quest content is required');
  } else {
    if (!quest.content.fr) warnings.push('French content is recommended');
    if (!quest.content.en) warnings.push('English content is recommended');
    
    // Vérifier les champs essentiels dans chaque langue
    ['fr', 'en'].forEach(lang => {
      if (quest.content[lang]) {
        if (!quest.content[lang].title) errors.push(`${lang} title is required`);
        if (!quest.content[lang].description) warnings.push(`${lang} description is recommended`);
      }
    });
  }

  // Vérifier les steps
  if (!quest.steps || quest.steps.length === 0) {
    errors.push('Quest must have at least one step');
  }

  // Vérifier l'impact estimé pour les quêtes actionnables
  if (quest.type === 'action' && !quest.estimatedImpact) {
    warnings.push('Estimated impact is recommended for action quests');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Calcule l'impact annuel d'une quête
 * 
 * @param {Object} quest - La quête
 * @returns {number} - Impact annuel en euros
 */
export const calculateAnnualImpact = (quest) => {
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
 * Formate le montant d'impact pour l'affichage
 * 
 * @param {Object} quest - La quête
 * @param {string} lang - La langue
 * @returns {string} - Texte formaté (ex: "+€156/an")
 */
export const formatImpactAmount = (quest, lang = 'fr') => {
  if (!quest?.estimatedImpact) return '';
  
  const annual = calculateAnnualImpact(quest);
  const currency = quest.estimatedImpact.currency || 'EUR';
  const symbol = currency === 'EUR' ? '€' : '$';
  
  const periodText = lang === 'fr' ? '/an' : '/yr';
  
  return `+${symbol}${annual}${periodText}`;
};

/**
 * Calcule les statistiques d'une quête
 * 
 * @param {Object} quest - La quête
 * @returns {Object} - Les statistiques
 */
export const getQuestStats = (quest) => {
  if (!quest) return null;

  const totalSteps = quest.steps?.length || 0;
  const actionSteps = quest.steps?.filter(step => 
    step.type === 'action' || step.type === 'checklist' || step.type === 'select_amount'
  ).length || 0;

  return {
    totalSteps,
    actionSteps,
    infoSteps: totalSteps - actionSteps,
    estimatedTime: quest.duration || 15,
    totalXP: quest.xp || 100,
    difficulty: quest.difficulty || 'beginner',
    estimatedImpact: calculateAnnualImpact(quest),
    isPremium: quest.isPremium || false
  };
};

/**
 * Vérifie si une quête est disponible pour un utilisateur
 * 
 * @param {Object} quest - La quête
 * @param {Object} userProfile - Le profil utilisateur
 * @returns {boolean} - True si disponible
 */
export const isQuestAvailable = (quest, userProfile = {}) => {
  const { isPremium = false, completedQuestIds = [], country = 'fr-FR' } = userProfile;
  
  // Vérifier premium
  if (quest.isPremium && !isPremium) return false;
  
  // Vérifier si déjà complétée
  if (completedQuestIds.includes(quest.id)) return false;
  
  // Vérifier le pays (si spécifié)
  if (quest.country && quest.country !== country) {
    if (!quest.availableIn || !quest.availableIn.includes(country)) {
      return false;
    }
  }
  
  // Vérifier les prérequis
  if (quest.prerequisites && quest.prerequisites.length > 0) {
    const hasPrerequisites = quest.prerequisites.every(prereqId =>
      completedQuestIds.includes(prereqId)
    );
    if (!hasPrerequisites) return false;
  }
  
  return true;
};

/**
 * Vérifie si une quête est complétée
 * 
 * @param {string} questId - ID de la quête
 * @param {Object} userProgress - Progrès utilisateur
 * @returns {boolean} - True si complétée
 */
export const isQuestCompleted = (questId, userProgress) => {
  if (!userProgress || !userProgress.quests) return false;
  return userProgress.quests[questId]?.status === 'completed';
};

/**
 * Calcule le progrès d'une quête
 * 
 * @param {string} questId - ID de la quête
 * @param {Object} userProgress - Progrès utilisateur
 * @param {Object} quest - La quête
 * @returns {number} - Pourcentage de progrès (0-100)
 */
export const calculateQuestProgress = (questId, userProgress, quest) => {
  if (!userProgress || !quest) return 0;
  
  const questProgress = userProgress.quests?.[questId];
  if (!questProgress) return 0;

  const totalSteps = quest.steps?.length || 1;
  const completedSteps = questProgress.completedSteps || 0;
  
  return Math.round((completedSteps / totalSteps) * 100);
};

/**
 * Génère un ID unique pour une quête
 * 
 * @param {string} title - Le titre de la quête
 * @returns {string} - ID unique
 */
export const generateQuestId = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, ''); // Enlever les tirets au début/fin
};

/**
 * Calcule le temps total pour plusieurs quêtes
 * 
 * @param {Array} questIds - IDs des quêtes
 * @param {Array} allQuests - Toutes les quêtes disponibles
 * @returns {number} - Temps total en minutes
 */
export const calculateTotalTime = (questIds, allQuests) => {
  return questIds.reduce((total, questId) => {
    const quest = allQuests.find(q => q.id === questId);
    return total + (quest?.duration || 0);
  }, 0);
};

/**
 * Formate la durée pour l'affichage
 * 
 * @param {number} minutes - Durée en minutes
 * @param {string} lang - Langue
 * @returns {string} - Texte formaté (ex: "5-8 min")
 */
export const formatDuration = (minutes, lang = 'fr') => {
  if (!minutes) return '';
  
  const unit = lang === 'fr' ? 'min' : 'min';
  
  // Si c'est un nombre avec plage (ex: "5-8")
  if (typeof minutes === 'string' && minutes.includes('-')) {
    return `${minutes} ${unit}`;
  }
  
  return `${minutes} ${unit}`;
};

/**
 * Récupère la couleur de difficulté
 * 
 * @param {string} difficulty - Niveau de difficulté
 * @returns {string} - Couleur Tailwind
 */
export const getDifficultyColor = (difficulty) => {
  const colors = {
    beginner: 'text-green-600',
    intermediate: 'text-yellow-600',
    advanced: 'text-orange-600',
    expert: 'text-red-600'
  };
  
  return colors[difficulty] || colors.beginner;
};

/**
 * Récupère le badge de catégorie
 * 
 * @param {string} category - Catégorie
 * @returns {string} - Emoji/icône
 */
export const getCategoryIcon = (category) => {
  const icons = {
    budget: '💰',
    savings: '🏦',
    debt: '💳',
    investing: '📈',
    income: '💵',
    planning: '📊',
    quickwin: '⚡'
  };
  
  return icons[category] || '📋';
};

// Export par défaut
export default {
  localizeQuest,
  getLocalizedStepContent,
  getLocalizedCTA,
  validateQuest,
  calculateAnnualImpact,
  formatImpactAmount,
  getQuestStats,
  isQuestAvailable,
  isQuestCompleted,
  calculateQuestProgress,
  generateQuestId,
  calculateTotalTime,
  formatDuration,
  getDifficultyColor,
  getCategoryIcon
};

