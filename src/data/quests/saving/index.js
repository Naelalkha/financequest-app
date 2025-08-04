import { emergencyFund101 } from './emergency-fund-101.js';
import { savingStrategies } from './saving-strategies.js';

export const savingQuests = [
  emergencyFund101,
  savingStrategies
];

export const savingCategory = {
  id: 'saving',
  name: { en: 'Saving', fr: 'Épargne' },
  description: { 
    en: 'Build wealth through smart saving strategies and emergency funds',
    fr: 'Construisez votre richesse grâce à des stratégies d\'épargne intelligentes'
  },
  icon: 'FaPiggyBank',
  color: '#10B981',
  secondaryColor: '#34D399',
  order: 2,
  difficulty: 'beginner',
  totalQuests: 2,
  totalXP: 200,
  totalDuration: 45
};

export const getSavingStats = () => {
  return {
    totalQuests: savingQuests.length,
    totalXP: savingQuests.reduce((sum, quest) => sum + quest.xp, 0),
    totalDuration: savingQuests.reduce((sum, quest) => sum + quest.duration, 0),
    averageDifficulty: 'beginner',
    completionRate: 0.85
  };
};

export const getRecommendedSavingQuests = (completedQuestIds = []) => {
  return savingQuests.filter(quest => !completedQuestIds.includes(quest.id));
};

export { emergencyFund101, savingStrategies }; 