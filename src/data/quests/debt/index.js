import { creditScoreBasics } from './credit-score-basics.js';
import { debtAvalanche } from './debt-avalanche.js';

export const debtQuests = [
  creditScoreBasics,
  debtAvalanche
];

export const debtCategory = {
  id: 'debt',
  name: { en: 'Debt Management', fr: 'Gestion de la Dette' },
  description: { 
    en: 'Understand and manage debt effectively',
    fr: 'Comprendre et gérer la dette efficacement'
  },
  icon: 'FaCreditCard',
  color: '#EF4444',
  secondaryColor: '#F87171',
  order: 4,
  difficulty: 'intermediate',
  totalQuests: 2,
  totalXP: 200,
  totalDuration: 35
};

export const getDebtStats = () => {
  return {
    totalQuests: debtQuests.length,
    totalXP: debtQuests.reduce((sum, quest) => sum + quest.xp, 0),
    totalDuration: debtQuests.reduce((sum, quest) => sum + quest.duration, 0),
    averageDifficulty: 'intermediate',
    completionRate: 0.70
  };
};

export const getRecommendedDebtQuests = (completedQuestIds = []) => {
  return debtQuests.filter(quest => !completedQuestIds.includes(quest.id));
};

export { creditScoreBasics, debtAvalanche }; 