/**
 * 🎮 Configuration Gamification
 * Définit les niveaux, paliers d'impact et badges
 */

/** Badge definition interface */
export interface BadgeDefinition {
  id: string;
  name: {
    en: string;
    fr: string;
  };
  description: {
    en: string;
    fr: string;
  };
  icon: string;
  color: string;
  criterion: string;
}

/**
 * Seuils d'XP pour chaque niveau (L1 = 0, L2 = 300, etc.)
 * Progression douce avec incréments croissants
 */
export const LEVEL_THRESHOLDS: readonly number[] = [
  0,     // L1
  300,   // L2
  700,   // L3
  1200,  // L4
  1800,  // L5
  2500,  // L6
  3300,  // L7
  4200,  // L8
  5200,  // L9
  6300,  // L10
  7500,  // L11
  8800,  // L12
  10200, // L13
  11700, // L14
  13300, // L15
  15000, // L16
  16800, // L17
  18700, // L18
  20700, // L19
  22800, // L20
] as const;

/**
 * Paliers d'impact (€/an)
 */
export const IMPACT_MILESTONES: readonly number[] = [100, 250, 500, 1000, 1500, 2000, 5000, 10000] as const;

/**
 * XP gagnés par action
 */
export const XP_REWARDS = {
  // Quêtes (par difficulté)
  quest: {
    beginner: 75,
    intermediate: 120,
    advanced: 180,
  },
  // Bonus quiz (score >= 80%)
  quiz_bonus: 30,
  // Ajout d'économie depuis une quête
  impact_from_quest: 20,
  // Bonus quand événement vérifié
  impact_verified: 30,
  // Défi du jour
  daily_challenge: 40,
  // Streak (par jour au-delà du 2e)
  streak_daily: 10,
  // Cap journalier max pour XP
  daily_cap: 250,
} as const;

/**
 * Définition des badges
 */
export const BADGES: Record<string, BadgeDefinition> = {
  starter_pack_finisher: {
    id: 'starter_pack_finisher',
    name: {
      en: 'Starter Pack Finisher',
      fr: 'Pack de démarrage terminé',
    },
    description: {
      en: 'Complete all 3 Starter Pack quests',
      fr: 'Terminer les 3 quêtes du Starter Pack',
    },
    icon: '🏁',
    color: '#10B981', // green
    criterion: 'Complete 3 starter quests',
  },
  quickwin_done: {
    id: 'quickwin_done',
    name: {
      en: 'Quick Win',
      fr: 'Gain rapide',
    },
    description: {
      en: 'Save your first money via Quick Win',
      fr: 'Enregistrer ta première économie via Quick Win',
    },
    icon: '⚡',
    color: '#F59E0B', // amber
    criterion: 'Create first savings event from quick win',
  },
  impact_1k: {
    id: 'impact_1k',
    name: {
      en: '€1K Impact',
      fr: 'Impact 1000€',
    },
    description: {
      en: 'Reach +€1,000/year in savings',
      fr: 'Atteindre +1 000€/an d\'économies',
    },
    icon: '💰',
    color: '#EF4444', // red
    criterion: 'Total annual impact >= 1000',
  },
  consistency_7: {
    id: 'consistency_7',
    name: {
      en: '7-Day Streak',
      fr: 'Série de 7 jours',
    },
    description: {
      en: 'Stay active for 7 consecutive days',
      fr: 'Rester actif pendant 7 jours consécutifs',
    },
    icon: '🔥',
    color: '#F97316', // orange
    criterion: 'Current streak >= 7',
  },
  category_specialist: {
    id: 'category_specialist',
    name: {
      en: 'Category Specialist',
      fr: 'Spécialiste de catégorie',
    },
    description: {
      en: 'Save 3 times in the same category',
      fr: 'Enregistrer 3 économies dans la même catégorie',
    },
    icon: '🎯',
    color: '#8B5CF6', // purple
    criterion: '3 savings events in same category',
  },
  tax_optimizer: {
    id: 'tax_optimizer',
    name: {
      en: 'Tax Optimizer',
      fr: 'Optimiseur fiscal',
    },
    description: {
      en: 'Complete tax rate quest and add savings',
      fr: 'Terminer la quête taux de prélèvement et ajouter l\'impact',
    },
    icon: '📊',
    color: '#3B82F6', // blue
    criterion: 'Complete adjust-tax-rate quest + add impact',
  },
  first_quest: {
    id: 'first_quest',
    name: {
      en: 'First Steps',
      fr: 'Premiers pas',
    },
    description: {
      en: 'Complete your first quest',
      fr: 'Terminer ta première quête',
    },
    icon: '🚀',
    color: '#06B6D4', // cyan
    criterion: 'Complete any quest',
  },
  impact_500: {
    id: 'impact_500',
    name: {
      en: '€500 Impact',
      fr: 'Impact 500€',
    },
    description: {
      en: 'Reach +€500/year in savings',
      fr: 'Atteindre +500€/an d\'économies',
    },
    icon: '💵',
    color: '#10B981', // green
    criterion: 'Total annual impact >= 500',
  },
  level_5: {
    id: 'level_5',
    name: {
      en: 'Level 5 Reached',
      fr: 'Niveau 5 atteint',
    },
    description: {
      en: 'Reach level 5',
      fr: 'Atteindre le niveau 5',
    },
    icon: '⭐',
    color: '#FBBF24', // yellow
    criterion: 'Level >= 5',
  },
  level_10: {
    id: 'level_10',
    name: {
      en: 'Level 10 Master',
      fr: 'Maître niveau 10',
    },
    description: {
      en: 'Reach level 10',
      fr: 'Atteindre le niveau 10',
    },
    icon: '👑',
    color: '#A855F7', // purple
    criterion: 'Level >= 10',
  },
};

/**
 * Ordre d'affichage des badges (les plus importants en premier)
 */
export const BADGE_DISPLAY_ORDER: readonly string[] = [
  'level_10',
  'level_5',
  'impact_1k',
  'impact_500',
  'tax_optimizer',
  'starter_pack_finisher',
  'consistency_7',
  'category_specialist',
  'quickwin_done',
  'first_quest',
] as const;

/**
 * Contraintes anti-triche
 */
export const GAMIFICATION_LIMITS = {
  // Minimum pour qu'un savings event compte pour l'XP
  min_amount_monthly: 5,
  min_amount_yearly: 50,
  // Max events impact comptés pour XP par jour
  max_impact_events_per_day: 3,
  // Cap XP journalier
  daily_xp_cap: 250,
} as const;
