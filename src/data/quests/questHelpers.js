// Cache pour performance
const questCache = new Map();

/**
 * Localise une quête selon la langue
 * @param {Object} quest - La quête à localiser
 * @param {string} lang - La langue (en/fr)
 * @returns {Object} - La quête localisée
 */
export const localizeQuest = (quest, lang = 'en') => {
  if (!quest) return null;

  const localized = {
    ...quest,
    title: quest.content?.[lang]?.title || quest[`title_${lang}`] || quest.title_en || (typeof quest.title === 'object' ? quest.title[lang] || quest.title.en : quest.title),
    description: quest.content?.[lang]?.description || quest[`description_${lang}`] || quest.description_en || (typeof quest.description === 'object' ? quest.description[lang] || quest.description.en : quest.description),
    longDescription: quest.content?.[lang]?.longDescription || quest[`longDescription_${lang}`] || quest.longDescription_en,
    objectives: quest.content?.[lang]?.objectives || quest[`objectives_${lang}`] || quest.objectives_en || quest.objectives,
    prerequisites: quest.content?.[lang]?.prerequisites || quest[`prerequisites_${lang}`] || quest.prerequisites_en || quest.prerequisites,
    whatYouWillLearn: quest.content?.[lang]?.whatYouWillLearn || quest[`whatYouWillLearn_${lang}`] || quest.whatYouWillLearn_en,
    realWorldApplication: quest.content?.[lang]?.realWorldApplication || quest[`realWorldApplication_${lang}`] || quest.realWorldApplication_en
  };

  // Localiser les steps
  if (quest.steps) {
    localized.steps = quest.steps.map(step => {
      const localizedStep = { ...step };
      
      // Localiser les propriétés de base
      if (step.content?.[lang]) {
        // Pour les étapes avec contenu structuré (comme action challenges)
        const localizedContent = step.content[lang];
        Object.assign(localizedStep, localizedContent);
        
        // S'assurer que le titre est correctement défini
        if (localizedContent.title) {
          localizedStep.title = localizedContent.title;
        }
        
        // Pour les étapes de type action, s'assurer que le contenu est localisé
        if (step.type === 'action' && step.content && typeof step.content === 'object') {
          localizedStep.content = localizedContent;
        }
      } else {
        // Fallback vers l'ancien format avec gestion des objets
        localizedStep.title = step[`title_${lang}`] || step.title_en || (typeof step.title === 'object' ? step.title[lang] || step.title.en : step.title);
        localizedStep.content = step[`content_${lang}`] || step.content_en || (typeof step.content === 'object' ? step.content[lang] || step.content.en : step.content);
        localizedStep.question = step[`question_${lang}`] || step.question_en || (typeof step.question === 'object' ? step.question[lang] || step.question.en : step.question);
        localizedStep.explanation = step[`explanation_${lang}`] || step.explanation_en || (typeof step.explanation === 'object' ? step.explanation[lang] || step.explanation.en : step.explanation);
        localizedStep.hint = step[`hint_${lang}`] || step.hint_en || (typeof step.hint === 'object' ? step.hint[lang] || step.hint.en : step.hint);
        localizedStep.options = step[`options_${lang}`] || step.options_en || (typeof step.options === 'object' ? step.options[lang] || step.options.en : step.options);
        localizedStep.funFact = step[`funFact_${lang}`] || step.funFact_en || (typeof step.funFact === 'object' ? step.funFact[lang] || step.funFact.en : step.funFact);
      }
      
      // Gestion spéciale pour les étapes avec title en objet {en, fr}
      if (typeof step.title === 'object' && step.title[lang]) {
        localizedStep.title = step.title[lang];
      }
      
      // Gestion spéciale pour les étapes avec content en objet {en, fr}
      if (typeof step.content === 'object' && step.content[lang]) {
        const localizedContent = step.content[lang];
        
        // Pour les étapes info, extraire le texte
        if (step.type === 'info') {
          localizedStep.content = localizedContent.text || localizedContent.description || localizedContent.content || 'No content available';
        } else {
          // Pour les autres types, garder la structure complète
          localizedStep.content = localizedContent;
        }
      }
      
      // Gestion spéciale pour les étapes avec title en objet {en, fr} (cas des quêtes existantes)
      if (typeof step.title === 'object' && step.title[lang]) {
        localizedStep.title = step.title[lang];
      }
      
      // Gestion spéciale pour les étapes avec content en objet {en, fr} (cas des quêtes existantes)
      if (typeof step.content === 'object' && step.content[lang] && step.type === 'info') {
        const localizedContent = step.content[lang];
        localizedStep.content = localizedContent.text || localizedContent.description || localizedContent.content || 'No content available';
      }
      


      return localizedStep;
    });
  }

  return localized;
};

/**
 * Valide la structure d'une quête
 * @param {Object} quest - La quête à valider
 * @returns {Object} - Résultat de validation
 */
export const validateQuest = (quest) => {
  const errors = [];
  const warnings = [];

  // Vérifications obligatoires
  if (!quest.id) errors.push('Quest ID is required');
  if (!quest.category) errors.push('Quest category is required');
  if (!quest.content?.en?.title && !quest.title_en) errors.push('English title is required');
  if (!quest.content?.en?.description && !quest.description_en) errors.push('English description is required');
  if (!quest.steps || quest.steps.length === 0) errors.push('Quest must have at least one step');

  // Vérifications recommandées
  if (!quest.content?.fr) warnings.push('French content is recommended');
  if (!quest.metadata) warnings.push('Metadata is recommended');
  if (!quest.rewards) warnings.push('Rewards are recommended');

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Enrichit une quête avec les valeurs par défaut
 * @param {Object} quest - La quête à enrichir
 * @returns {Object} - La quête enrichie
 */
export const enrichQuestWithDefaults = (quest) => {
  const enriched = {
    ...quest,
    difficulty: quest.difficulty || 'beginner',
    duration: quest.duration || 15,
    xp: quest.xp || 100,
    isPremium: quest.isPremium || false,
    order: quest.order || 999,
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      author: 'FinanceQuest Team',
      tags: [],
      relatedQuests: [],
      averageCompletionTime: quest.duration || 15,
      completionRate: 0.8,
      userRating: 4.5,
      ...quest.metadata
    },
    icons: {
      main: null,
      steps: [],
      ...quest.icons
    },
    colors: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: '#FBBF24',
      ...quest.colors
    },
    rewards: {
      badge: null,
      unlocks: [],
      bonusXP: {
        firstTime: 0,
        speedBonus: 0,
        perfectScore: 0
      },
      ...quest.rewards
    },
    analytics: {
      trackingEvents: ['quest_started', 'step_completed'],
      kpis: {
        targetCompletionRate: 0.8,
        targetSatisfaction: 4.5
      },
      ...quest.analytics
    }
  };

  return enriched;
};

/**
 * Calcule les statistiques d'une quête
 * @param {Object} quest - La quête
 * @returns {Object} - Les statistiques
 */
export const getQuestStats = (quest) => {
  if (!quest) return null;

  const totalSteps = quest.steps?.length || 0;
  const quizSteps = quest.steps?.filter(step => 
    step.type === 'quiz' || step.type === 'multiple_choice'
  ).length || 0;
  const actionSteps = quest.steps?.filter(step => 
    step.type === 'action'
  ).length || 0;

  return {
    totalSteps,
    quizSteps,
    actionSteps,
    infoSteps: totalSteps - quizSteps - actionSteps,
    estimatedTime: quest.duration || 15,
    totalXP: quest.xp || 100,
    difficulty: quest.difficulty || 'beginner'
  };
};

/**
 * Calcule le temps total pour plusieurs quêtes
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
 * Exporte les quêtes pour Firestore
 * @param {Array} quests - Les quêtes à exporter
 * @returns {Array} - Format Firestore
 */
export const exportForFirestore = (quests) => {
  return quests.map(quest => ({
    id: quest.id,
    category: quest.category,
    difficulty: quest.difficulty,
    duration: quest.duration,
    xp: quest.xp,
    isPremium: quest.isPremium,
    order: quest.order,
    metadata: quest.metadata,
    content: quest.content,
    rewards: quest.rewards,
    analytics: quest.analytics,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
};

/**
 * Génère un ID unique pour une quête
 * @param {string} title - Le titre de la quête
 * @returns {string} - ID unique
 */
export const generateQuestId = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

/**
 * Vérifie si une quête est complétée
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