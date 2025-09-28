// Starter pack de quêtes recommandées selon les objectifs et le niveau de l'utilisateur

export const getStarterPack = (goals, level, country) => {
  const starterQuests = [];
  
  // Quêtes de base pour tous les nouveaux utilisateurs
  const basicQuests = [
    'budget-basics', // Pour tout le monde
    'basic-banking', // Pour tout le monde
  ];
  
  // Ajouter les quêtes de base
  starterQuests.push(...basicQuests);
  
  // Quêtes spécifiques selon les objectifs (alignées sur les 5 catégories)
  if (goals.includes('budgeting')) {
    starterQuests.push('expense-tracking');
    if (level !== 'novice') {
      starterQuests.push('side-hustle-finance');
    }
  }
  
  if (goals.includes('saving')) {
    starterQuests.push('emergency-fund-101');
    if (level === 'intermediate' || level === 'advanced') {
      starterQuests.push('saving-strategies');
    }
  }
  
  if (goals.includes('debt')) {
    starterQuests.push('credit-score-basics');
    if (level !== 'novice') {
      starterQuests.push('debt-avalanche');
    }
  }
  
  if (goals.includes('investing')) {
    if (level === 'novice') {
      starterQuests.push('investing-basics');
    } else {
      starterQuests.push('investing-basics');
      starterQuests.push('real-estate-basics');
    }
    
    if (level === 'advanced') {
      starterQuests.push('crypto-intro');
    }
  }
  
  if (goals.includes('planning')) {
    starterQuests.push('money-mindset');
    if (level === 'intermediate' || level === 'advanced') {
      starterQuests.push('insurance-essentials');
    }
    if (level === 'advanced') {
      starterQuests.push('fire-movement');
      starterQuests.push('tax-optimization');
    }
  }
  
  // Ajouter des quêtes spécifiques au pays
  if (country === 'fr-FR') {
    // Quêtes spécifiques à la France
    if (goals.includes('saving')) {
      starterQuests.push('livret-a');
    }
    if (goals.includes('budgeting') && level !== 'novice') {
      starterQuests.push('pel');
    }
    if (goals.includes('planning') && level === 'advanced') {
      starterQuests.push('retraite-france');
    }
  } else if (country === 'en-US') {
    // Quêtes spécifiques aux USA
    if (goals.includes('investing')) {
      starterQuests.push('401k-basics');
      if (level !== 'novice') {
        starterQuests.push('roth-ira');
      }
    }
  }
  
  // Quêtes avancées générales (si planning n'est pas sélectionné)
  if (level === 'advanced' && !goals.includes('planning')) {
    starterQuests.push('tax-optimization');
    starterQuests.push('fire-movement');
  }
  
  // Quêtes intermédiaires générales (si planning n'est pas sélectionné)
  if ((level === 'intermediate' || level === 'advanced') && !goals.includes('planning')) {
    starterQuests.push('insurance-essentials');
    starterQuests.push('money-mindset');
  }
  
  // Retourner un set unique de quêtes (éviter les doublons)
  return [...new Set(starterQuests)];
};

// Note: Les quêtes du starter pack sont maintenant simplement stockées comme IDs
// dans le profil utilisateur (starterPackQuests). La progression réelle sera
// créée quand l'utilisateur commence une quête via le système userQuests existant.
