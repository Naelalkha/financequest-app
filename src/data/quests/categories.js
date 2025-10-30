import { FaCalculator, FaPiggyBank, FaChartLine, FaCreditCard, FaRoute, FaShieldAlt, FaFileInvoiceDollar } from 'react-icons/fa';

export const categories = {
  budgeting: {
    id: 'budgeting',
    name: { en: 'Budget', fr: 'Budget' },
    description: { 
      en: 'Master the art of managing your money and tracking expenses',
      fr: 'Maîtrisez l\'art de gérer votre argent et de suivre vos dépenses'
    },
    icon: FaCalculator,
    color: '#3B82F6',
    secondaryColor: '#60A5FA',
    order: 1,
    difficulty: 'beginner',
    totalQuests: 8, // Updated to include global + country-specific quests
    totalXP: 800,
    totalDuration: 120
  },
  saving: {
    id: 'saving',
    name: { en: 'Saving', fr: 'Épargne' },
    description: { 
      en: 'Build wealth through smart saving strategies and emergency funds',
      fr: 'Construisez votre richesse grâce à des stratégies d\'épargne intelligentes'
    },
    icon: FaPiggyBank,
    color: '#10B981',
    secondaryColor: '#34D399',
    order: 2,
    difficulty: 'beginner',
    totalQuests: 2,
    totalXP: 200,
    totalDuration: 30
  },
  credit: {
    id: 'credit',
    name: { en: 'Credit', fr: 'Crédit' },
    description: { 
      en: 'Understand and manage credit effectively',
      fr: 'Comprendre et gérer le crédit efficacement'
    },
    icon: FaCreditCard,
    color: '#EF4444',
    secondaryColor: '#F87171',
    order: 3,
    difficulty: 'intermediate',
    totalQuests: 2,
    totalXP: 250,
    totalDuration: 40
  },
  investing: {
    id: 'investing',
    name: { en: 'Investing', fr: 'Investissement' },
    description: { 
      en: 'Grow your money through various investment strategies',
      fr: 'Faites croître votre argent grâce à diverses stratégies d\'investissement'
    },
    icon: FaChartLine,
    color: '#F59E0B',
    secondaryColor: '#FBBF24',
    order: 4,
    difficulty: 'intermediate',
    totalQuests: 4,
    totalXP: 500,
    totalDuration: 75
  },
  taxes: {
    id: 'taxes',
    name: { en: 'Taxes', fr: 'Fiscalité' },
    description: { 
      en: 'Understand taxes and optimize your tax situation',
      fr: 'Comprendre les impôts et optimiser votre situation fiscale'
    },
    icon: FaFileInvoiceDollar,
    color: '#8B5CF6',
    secondaryColor: '#A78BFA',
    order: 5,
    difficulty: 'advanced',
    totalQuests: 5,
    totalXP: 600,
    totalDuration: 90
  },
  protect: {
    id: 'protect',
    name: { en: 'Protection', fr: 'Protection' },
    description: { 
      en: 'Protect your assets and plan for the future',
      fr: 'Protégez vos actifs et planifiez votre avenir'
    },
    icon: FaShieldAlt,
    color: '#10B981',
    secondaryColor: '#34D399',
    order: 6,
    difficulty: 'advanced',
    totalQuests: 3,
    totalXP: 350,
    totalDuration: 60
  }
};

export const categoryOrder = ['budgeting', 'saving', 'credit', 'investing', 'taxes', 'protect'];

export const getCategoryById = (categoryId) => {
  return categories[categoryId] || null;
};

export const getCategoryStats = () => {
  return Object.values(categories).map(category => ({
    id: category.id,
    name: category.name,
    totalQuests: category.totalQuests,
    totalXP: category.totalXP,
    totalDuration: category.totalDuration,
    color: category.color
  }));
}; 