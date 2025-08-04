import { moneyMindset } from './money-mindset.js';
import { retirementPlanning } from './retirement-planning.js';
import { taxOptimization } from './tax-optimization.js';
import { insuranceEssentials } from './insurance-essentials.js';
import { fireMovement } from './fire-movement.js';

export const planningQuests = [
  moneyMindset,
  retirementPlanning,
  taxOptimization,
  insuranceEssentials,
  fireMovement
];

export const planningCategory = {
  id: 'planning',
  name: { en: 'Financial Planning', fr: 'Planification Financière' },
  description: { 
    en: 'Long-term financial planning and wealth building',
    fr: 'Planification financière à long terme et construction de richesse'
  },
  icon: 'FaRoute',
  color: '#8B5CF6',
  secondaryColor: '#A78BFA',
  order: 5,
  difficulty: 'advanced',
  totalQuests: 5,
  totalXP: 500,
  totalDuration: 100
};

export const getPlanningStats = () => {
  return {
    totalQuests: planningQuests.length,
    totalXP: planningQuests.reduce((sum, quest) => sum + quest.xp, 0),
    totalDuration: planningQuests.reduce((sum, quest) => sum + quest.duration, 0),
    averageDifficulty: 'advanced',
    completionRate: 0.65
  };
};

export const getRecommendedPlanningQuests = (completedQuestIds = []) => {
  return planningQuests.filter(quest => !completedQuestIds.includes(quest.id));
};

export { moneyMindset, retirementPlanning, taxOptimization, insuranceEssentials, fireMovement }; 