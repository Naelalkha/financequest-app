import { FaCheckCircle, FaCoins } from 'react-icons/fa';
import icon from './assets/icon.png';

/**
 * Micro Expenses Quest - Metadata
 * 
 * Quest 02: TRAQUE INVISIBLE
 * Architecture scalable avec i18n séparé
 * Les traductions sont dans /locales/{lang}/quests.json sous la clé 'microExpenses'
 */
export const microExpensesQuest = {
    id: 'micro-expenses',
    category: 'budget',
    country: 'fr-FR',
    difficulty: 'beginner',
    duration: 5,
    xp: 120,
    isPremium: false,
    starterPack: true,
    order: 2,

    // ✅ Clé i18n pour les traductions centralisées
    i18nKey: 'microExpenses',

    metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        author: 'FinanceQuest Team',
        tags: ['starter', 'micro-expenses', 'budgeting', 'awareness', 'actionnable'],
        relatedQuests: ['cut-subscription'],
        averageCompletionTime: 5,
        completionRate: 0.85,
        userRating: 4.8,
        featured: true
    },

    // Impact financier estimé (basé sur réduction moyenne de micro-dépenses)
    estimatedImpact: {
        amount: 150,
        period: 'month'
    },

    icons: {
        main: icon,
        steps: [FaCheckCircle, FaCoins]
    },

    colors: {
        primary: '#F59E0B',
        secondary: '#D97706',
        accent: '#FBBF24',
        background: 'from-amber-50 to-orange-50',
        darkBackground: 'from-amber-900/20 to-orange-900/20'
    },

    rewards: {
        badge: 'micro_hunter',
        unlocks: []
    }
};

export default microExpensesQuest;
