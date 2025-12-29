// Starter pack de quêtes recommandées selon les objectifs et le niveau de l'utilisateur
// IMPORTANT: Le starter pack contient exactement 3 quêtes GRATUITES

export const getStarterPack = (goals, level, country) => {
  const allPossibleQuests = [];
  
  // Quêtes de base obligatoires (toujours gratuites et adaptées aux débutants)
  const mandatoryQuests = [
    'budget-basics', // Fondamental pour tous
  ];
  
  // Pool de quêtes gratuites par objectif
  const freeQuestsByGoal = {
    budgeting: ['expense-tracking', 'basic-banking'],
    saving: ['emergency-fund-101', 'saving-strategies'],
    credit: ['credit-score-basics'],
    investing: ['investing-basics'],
    protect: ['money-mindset']
  };
  
  // Pool de quêtes gratuites spécifiques au pays
  const countrySpecificFreeQuests = {
    'fr-FR': {
      saving: ['livret-a'],
    },
    'en-US': {
      investing: ['401k-basics'],
    }
  };
  
  // Ajouter la quête obligatoire
  allPossibleQuests.push(...mandatoryQuests);
  
  // Ajouter des quêtes selon les objectifs prioritaires
  const primaryGoal = goals[0]; // Objectif principal
  if (primaryGoal && freeQuestsByGoal[primaryGoal]) {
    const goalQuests = freeQuestsByGoal[primaryGoal];
    // Prendre la première quête de l'objectif principal
    if (goalQuests.length > 0) {
      allPossibleQuests.push(goalQuests[0]);
    }
  }
  
  // Ajouter une quête d'un objectif secondaire si disponible
  if (goals.length > 1) {
    const secondaryGoal = goals[1];
    if (secondaryGoal && freeQuestsByGoal[secondaryGoal]) {
      const goalQuests = freeQuestsByGoal[secondaryGoal];
      if (goalQuests.length > 0) {
        allPossibleQuests.push(goalQuests[0]);
      }
    }
  }
  
  // Si on n'a pas encore 3 quêtes, ajouter des quêtes générales recommandées
  const generalFreeQuests = [
    'basic-banking',
    'expense-tracking',
    'emergency-fund-101',
    'credit-score-basics',
    'money-mindset'
  ];
  
  // Enlever les doublons
  const uniqueQuests = [...new Set(allPossibleQuests)];
  
  // S'assurer qu'on a exactement 3 quêtes
  if (uniqueQuests.length < 3) {
    // Ajouter des quêtes générales jusqu'à atteindre 3
    for (const quest of generalFreeQuests) {
      if (!uniqueQuests.includes(quest)) {
        uniqueQuests.push(quest);
        if (uniqueQuests.length === 3) break;
      }
    }
  } else if (uniqueQuests.length > 3) {
    // Si on a trop de quêtes, prendre les 3 premières
    return uniqueQuests.slice(0, 3);
  }
  
  return uniqueQuests;
};

// Note: Les quêtes du starter pack sont maintenant simplement stockées comme IDs
// dans le profil utilisateur (starterPackQuests). La progression réelle sera
// créée quand l'utilisateur commence une quête via le système userQuests existant.
