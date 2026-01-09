/**
 * Anti-Overdraft Quest - Metadata
 *
 * L'ANTI-DÉCOUVERT : Calcule ton RAV et active tes garde-fous
 * Les traductions sont dans /locales/{lang}/quests.json sous la clé 'antiOverdraft'
 */
export const antiOverdraftQuest = {
  id: 'anti-overdraft',
  category: 'budget',
  country: 'fr-FR',
  difficulty: 'beginner',
  duration: 6,
  xp: 100,
  isPremium: false,
  starterPack: false,
  order: 4,

  // Clé i18n pour les traductions centralisées
  i18nKey: 'antiOverdraft',

  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'Moniyo Team',
    tags: ['budget', 'protection', 'overdraft', 'savings', 'rav'],
    relatedQuests: ['budget-50-30-20'],
    averageCompletionTime: 6,
  },

  // Impact financier estimé (moyenne des stratégies)
  estimatedImpact: {
    amount: 45,
    period: 'month'
  },

  colors: {
    primary: '#EF4444',    // Rouge (protection/alerte)
    secondary: '#DC2626',
    accent: '#F87171',
    background: 'from-red-50 to-orange-50',
    darkBackground: 'from-red-900/20 to-orange-900/20'
  },

  rewards: {
    badge: 'security_shield',
    unlocks: []
  }
};

export default antiOverdraftQuest;
