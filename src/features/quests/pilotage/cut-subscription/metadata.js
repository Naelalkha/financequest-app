import { FaTrash, FaCheckCircle, FaCoins } from 'react-icons/fa';
import CutSubscriptionCore from './CutSubscriptionCore';

/**
 * Cut Subscription Quest - Metadata
 * 
 * Architecture scalable avec i18n séparé
 * Les traductions sont dans /locales/{lang}/quests.json sous la clé 'cutSubscription'
 */
export const cutSubscriptionQuest = {
  id: 'cut-subscription',
  category: 'budget',
  country: 'fr-FR',
  difficulty: 'beginner',
  duration: 6,
  xp: 140,
  isPremium: false,
  starterPack: true,
  order: 1,

  // ✅ Clé i18n pour les traductions centralisées
  i18nKey: 'cutSubscription',

  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['starter', 'subscription', 'budgeting', 'quickwin', 'actionnable'],
    relatedQuests: [],
    averageCompletionTime: 6,
    completionRate: 0.90,
    userRating: 4.9,
    featured: true
  },

  // Impact financier estimé
  estimatedImpact: {
    amount: 15,
    period: 'month'
  },

  icons: {
    main: FaTrash,
    steps: [FaCheckCircle, FaCoins]
  },

  colors: {
    primary: '#DC2626',
    secondary: '#B91C1C',
    accent: '#EF4444',
    background: 'from-red-50 to-orange-50',
    darkBackground: 'from-red-900/20 to-orange-900/20'
  },

  rewards: {
    badge: 'quickwin_first_cancel',
    unlocks: []
  },

  // React Core component contient les steps
  core: CutSubscriptionCore
};

export default cutSubscriptionQuest;

