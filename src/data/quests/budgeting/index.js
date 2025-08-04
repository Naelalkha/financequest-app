// Import toutes les quêtes de la catégorie budgeting
import { budgetBasics } from './budget-basics.js';
import { expenseTracking } from './expense-tracking.js';
import { basicBanking } from './basic-banking.js';
import { sideHustleFinance } from './side-hustle-finance.js';

// Export groupé
export const budgetingQuests = [
  budgetBasics,
  expenseTracking,
  basicBanking,
  sideHustleFinance
];

// Re-export pour compatibilité
export { budgetBasics, expenseTracking, basicBanking, sideHustleFinance };

// Métadonnées de catégorie
export const budgetingCategory = {
  id: 'budgeting',
  name: { en: 'Budgeting', fr: 'Budget' },
  description: { 
    en: 'Master the art of managing your money and tracking expenses',
    fr: 'Maîtrisez l\'art de gérer votre argent et de suivre vos dépenses'
  },
  icon: 'FaCalculator',
  color: '#3B82F6',
  secondaryColor: '#60A5FA',
  order: 1,
  difficulty: 'beginner',
  totalQuests: 4,
  totalXP: 450,
  totalDuration: 80
};

// Fonctions utilitaires spécifiques à la catégorie
export const getBudgetingStats = () => {
  return {
    totalQuests: budgetingQuests.length,
    totalXP: budgetingQuests.reduce((sum, quest) => sum + quest.xp, 0),
    totalDuration: budgetingQuests.reduce((sum, quest) => sum + quest.duration, 0),
    averageDifficulty: 'beginner',
    completionRate: 0.85
  };
};

export const getRecommendedBudgetingQuests = (completedQuestIds = []) => {
  return budgetingQuests.filter(quest => !completedQuestIds.includes(quest.id));
}; 