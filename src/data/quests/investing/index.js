import { investingBasics } from './investing-basics.js';
import { cryptoIntro } from './crypto-intro.js';
import { realEstateBasics } from './real-estate-basics.js';

export const investingQuests = [
  investingBasics,
  cryptoIntro,
  realEstateBasics
];

export const investingCategory = {
  id: 'investing',
  name: { en: 'Investing', fr: 'Investissement' },
  description: { 
    en: 'Grow your money through various investment strategies',
    fr: 'Faites croître votre argent grâce à diverses stratégies d\'investissement'
  },
  icon: 'FaChartLine',
  color: '#F59E0B',
  secondaryColor: '#FBBF24',
  order: 3,
  difficulty: 'intermediate',
  totalQuests: 3,
  totalXP: 300,
  totalDuration: 60
};

export const getInvestingStats = () => {
  return {
    totalQuests: investingQuests.length,
    totalXP: investingQuests.reduce((sum, quest) => sum + quest.xp, 0),
    totalDuration: investingQuests.reduce((sum, quest) => sum + quest.duration, 0),
    averageDifficulty: 'intermediate',
    completionRate: 0.75
  };
};

export const getRecommendedInvestingQuests = (completedQuestIds = []) => {
  return investingQuests.filter(quest => !completedQuestIds.includes(quest.id));
};

export { investingBasics, cryptoIntro, realEstateBasics }; 