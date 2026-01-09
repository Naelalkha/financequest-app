import { FaCheckCircle, FaCoins } from 'react-icons/fa';
import icon from './assets/icon.png';

/**
 * Budget 50/30/20 Quest - Metadata
 *
 * Architecture scalable avec i18n séparé
 * Les traductions sont dans /locales/{lang}/quests.json sous la clé 'budget503020'
 */
export const budget503020Quest = {
  id: 'budget-50-30-20',
  category: 'budget',
  country: 'fr-FR',
  difficulty: 'beginner',
  duration: 6,
  xp: 120,
  xpReward: 120, // Pour SmartMissionModal
  isPremium: false,
  starterPack: true,
  order: 3,

  // Clé i18n pour les traductions centralisées
  i18nKey: 'budget503020',

  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'Moniyo Team',
    tags: ['starter', 'budget', 'planning', 'savings'],
    relatedQuests: ['micro-expenses', 'cut-subscription'],
    averageCompletionTime: 6,
    completionRate: 0.85,
    userRating: 4.8,
    featured: true
  },

  // Impact financier estimé
  estimatedImpact: {
    amount: 200,
    period: 'month'
  },

  icons: {
    main: icon,
    steps: [FaCheckCircle, FaCoins]
  },

  colors: {
    primary: '#10B981',    // Emerald (épargne)
    secondary: '#059669',
    accent: '#34D399',
    background: 'from-emerald-50 to-green-50',
    darkBackground: 'from-emerald-900/20 to-green-900/20'
  },

  rewards: {
    badge: 'budget_architect',
    unlocks: []
  }
};

export default budget503020Quest;
