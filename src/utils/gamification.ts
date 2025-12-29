/**
 * 🎮 Gamification Helpers
 * Fonctions pures pour calculer niveaux, paliers et badges
 */

import {
  LEVEL_THRESHOLDS,
  IMPACT_MILESTONES,
  XP_REWARDS,
  BADGES,
  GAMIFICATION_LIMITS,
} from '../config/gamification';

/** Level calculation result */
export interface LevelData {
  level: number;
  xpTotal: number;
  currentLevelXP: number;
  nextLevelXP: number | null;
  xpForNextLevel?: number | null; // Alias for nextLevelXP
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  progress: number;
}

/** Next milestone info */
export interface NextMilestone {
  amount: number;
  remaining: number;
}

/** Quest data for XP calculation */
export interface QuestForXP {
  xp?: number;
  xpReward?: number;
  difficulty?: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
}

/** Savings event data */
export interface SavingsEvent {
  amount?: number;
  period?: 'month' | 'year';
  source?: string;
  verified?: boolean;
  questId?: string;
  title?: string;
}

/** Badge check context */
export interface BadgeContext {
  completedQuestsCount?: number;
  starterQuestsCompleted?: number;
  totalAnnualImpact?: number;
  currentStreak?: number;
  savingsEventsByCategory?: Record<string, number>;
  completedQuestIds?: string[];
  level?: number;
  hasQuickWinEvent?: boolean;
}

/** User progress entry */
interface UserProgressEntry {
  completed?: boolean;
}

/** Quest with metadata */
interface QuestWithMeta {
  id: string;
  starterPack?: boolean;
  tags?: string[];
  category?: string;
}

/** Milestone status */
export interface MilestoneStatus {
  amount: number;
  reached: boolean;
  unlocked: boolean;
  unlockedAt: Date | null;
}

/** Formatted badge */
export interface FormattedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt: Date | null;
  criterion?: string;
}

/**
 * Calcule le niveau et l'XP requis pour le suivant
 */
export function computeLevel(xpTotal: number = 0): LevelData {
  let level = 1;

  // Trouver le niveau actuel
  for (let i = (LEVEL_THRESHOLDS as number[]).length - 1; i >= 0; i--) {
    if (xpTotal >= (LEVEL_THRESHOLDS as number[])[i]) {
      level = i + 1;
      break;
    }
  }

  // XP requis pour le niveau suivant
  const nextLevelXP = (LEVEL_THRESHOLDS as number[])[level] || null;
  const currentLevelXP = (LEVEL_THRESHOLDS as number[])[level - 1] || 0;
  const xpInCurrentLevel = xpTotal - currentLevelXP;
  const xpNeededForNext = nextLevelXP ? nextLevelXP - xpTotal : 0;

  return {
    level,
    xpTotal,
    currentLevelXP,
    nextLevelXP,
    xpInCurrentLevel,
    xpNeededForNext,
    progress: nextLevelXP ? (xpInCurrentLevel / (nextLevelXP - currentLevelXP)) * 100 : 100,
  };
}

/**
 * Vérifie quels paliers d'impact ont été franchis
 * Retourne les nouveaux paliers non encore dans currentMilestones
 */
export function checkMilestones(totalAnnual: number = 0, currentMilestones: Record<string, boolean | Date> = {}): number[] {
  const newMilestones: number[] = [];

  (IMPACT_MILESTONES as number[]).forEach(threshold => {
    const key = String(threshold);
    // Si le palier est franchi et pas encore débloqué
    if (totalAnnual >= threshold && !currentMilestones[key]) {
      newMilestones.push(threshold);
    }
  });

  return newMilestones;
}

/**
 * Retourne le prochain palier non atteint
 */
export function getNextMilestone(totalAnnual: number = 0): NextMilestone | null {
  for (const threshold of IMPACT_MILESTONES as number[]) {
    if (totalAnnual < threshold) {
      return {
        amount: threshold,
        remaining: threshold - totalAnnual,
      };
    }
  }
  return null; // Tous les paliers sont atteints
}

/**
 * Calcule l'XP gagné pour une quête complétée
 */
export function calculateQuestXP(quest: QuestForXP, score: number | null = null): number {
  // Prioritize quest.xp from metadata if defined
  let xp = quest.xp || quest.xpReward;

  // Fallback to difficulty-based XP if not defined
  if (!xp) {
    const difficulty = quest.difficulty || 'beginner';
    const rewards = XP_REWARDS as unknown as { quest: Record<string, number>; quiz_bonus: number };
    xp = rewards.quest[difficulty] || rewards.quest.beginner;
  }

  // Bonus quiz si score >= 80%
  if (score !== null && score >= 80) {
    const rewards = XP_REWARDS as unknown as { quiz_bonus: number };
    xp += rewards.quiz_bonus || 0;
  }

  return xp;
}

/**
 * Calcule l'XP gagné pour un savings event
 */
export function calculateSavingsXP(event: SavingsEvent, source: string = 'manual'): number {
  // Vérifier le montant minimum
  const amount = event.amount || 0;
  const period = event.period || 'month';

  const minAmount = period === 'month'
    ? GAMIFICATION_LIMITS.min_amount_monthly
    : GAMIFICATION_LIMITS.min_amount_yearly;

  if (amount < minAmount) {
    return 0; // Trop petit, pas d'XP
  }

  let xp = 0;

  // XP si l'event vient d'une quête
  if (source === 'quest' || event.source === 'quest') {
    xp += XP_REWARDS.impact_from_quest;
  }

  // Bonus si vérifié
  if (event.verified === true) {
    xp += XP_REWARDS.impact_verified;
  }

  return xp;
}

/**
 * Vérifie quels badges ont été débloqués
 * Retourne les IDs des nouveaux badges
 */
export function checkBadges(context: BadgeContext = {}, currentBadges: string[] = []): string[] {
  const {
    completedQuestsCount = 0,
    starterQuestsCompleted = 0,
    totalAnnualImpact = 0,
    currentStreak = 0,
    savingsEventsByCategory = {},
    completedQuestIds = [],
    level = 1,
    hasQuickWinEvent = false,
  } = context;

  const newBadges: string[] = [];

  // first_quest
  if (!currentBadges.includes('first_quest') && completedQuestsCount >= 1) {
    newBadges.push('first_quest');
  }

  // starter_pack_finisher
  if (!currentBadges.includes('starter_pack_finisher') && starterQuestsCompleted >= 3) {
    newBadges.push('starter_pack_finisher');
  }

  // quickwin_done
  if (!currentBadges.includes('quickwin_done') && hasQuickWinEvent) {
    newBadges.push('quickwin_done');
  }

  // impact_500
  if (!currentBadges.includes('impact_500') && totalAnnualImpact >= 500) {
    newBadges.push('impact_500');
  }

  // impact_1k
  if (!currentBadges.includes('impact_1k') && totalAnnualImpact >= 1000) {
    newBadges.push('impact_1k');
  }

  // consistency_7
  if (!currentBadges.includes('consistency_7') && currentStreak >= 7) {
    newBadges.push('consistency_7');
  }

  // category_specialist (au moins 3 économies dans une même catégorie)
  if (!currentBadges.includes('category_specialist')) {
    const hasSpecialist = Object.values(savingsEventsByCategory).some(count => count >= 3);
    if (hasSpecialist) {
      newBadges.push('category_specialist');
    }
  }

  // tax_optimizer (quête adjust-tax-rate complétée + impact ajouté)
  if (!currentBadges.includes('tax_optimizer')) {
    const hasTaxQuest = completedQuestIds.includes('adjust-tax-rate');
    const hasTaxImpact = totalAnnualImpact >= 100; // Approximatif, peut être affiné
    if (hasTaxQuest && hasTaxImpact) {
      newBadges.push('tax_optimizer');
    }
  }

  // level_5
  if (!currentBadges.includes('level_5') && level >= 5) {
    newBadges.push('level_5');
  }

  // level_10
  if (!currentBadges.includes('level_10') && level >= 10) {
    newBadges.push('level_10');
  }

  return newBadges;
}

/**
 * Groupe les savings events par catégorie
 * Retourne un objet { category: count }
 */
export function groupSavingsByCategory(
  savingsEvents: SavingsEvent[] = [],
  questsById: Record<string, QuestWithMeta> = {}
): Record<string, number> {
  const categoryMap: Record<string, number> = {};

  savingsEvents.forEach(event => {
    let category = 'uncategorized';

    // Si source=quest + questId, chercher la catégorie
    if (event.source === 'quest' && event.questId) {
      const quest = questsById[event.questId];
      if (quest && quest.category) {
        category = quest.category;
      }
    }

    categoryMap[category] = (categoryMap[category] || 0) + 1;
  });

  return categoryMap;
}

/**
 * Compte les quêtes complétées (avec filtres)
 */
export function countCompletedQuests(
  userProgress: Record<string, UserProgressEntry> = {},
  quests: QuestWithMeta[] = []
): { total: number; starterCount: number; completedIds: string[] } {
  let total = 0;
  let starterCount = 0;
  const completedIds: string[] = [];

  quests.forEach(quest => {
    const progress = userProgress[quest.id];
    if (progress && progress.completed === true) {
      total++;
      completedIds.push(quest.id);

      if (quest.starterPack === true || quest.tags?.includes('starter')) {
        starterCount++;
      }
    }
  });

  return { total, starterCount, completedIds };
}

/**
 * Vérifie s'il y a des quick win events
 */
export function hasQuickWinSavings(savingsEvents: SavingsEvent[] = []): boolean {
  return savingsEvents.some(event =>
    event.source === 'quick_win' ||
    event.questId === 'cut-subscription' ||
    event.title?.toLowerCase().includes('quick win')
  );
}

/**
 * Formate le badge pour l'affichage
 */
export function formatBadge(
  badgeId: string,
  lang: string = 'en',
  unlockedAt: Date | string | boolean | null | undefined = null
): FormattedBadge {
  const badge = BADGES[badgeId];
  const unlockedDate = unlockedAt instanceof Date ? unlockedAt :
    (typeof unlockedAt === 'string' ? new Date(unlockedAt) : null);

  if (!badge) {
    return {
      id: badgeId,
      name: badgeId,
      description: '',
      icon: '🏆',
      color: '#9CA3AF',
      unlocked: !!unlockedAt,
      unlockedAt: unlockedDate,
    };
  }

  return {
    id: badge.id,
    name: badge.name[lang as 'en' | 'fr'] || badge.name.en,
    description: badge.description[lang as 'en' | 'fr'] || badge.description.en,
    icon: badge.icon,
    color: badge.color,
    unlocked: !!unlockedAt,
    unlockedAt: unlockedDate,
    criterion: badge.criterion,
  };
}

/**
 * Calcule le pourcentage de progression vers un palier
 */
export function getMilestoneProgress(totalAnnual = 0) {
  const next = getNextMilestone(totalAnnual);
  if (!next) return { progress: 100, reached: IMPACT_MILESTONES.length };

  // Trouver le palier précédent
  const reachedMilestones = IMPACT_MILESTONES.filter(m => totalAnnual >= m);
  const previousMilestone = reachedMilestones.length > 0
    ? reachedMilestones[reachedMilestones.length - 1]
    : 0;

  const progress = ((totalAnnual - previousMilestone) / (next.amount - previousMilestone)) * 100;

  return {
    progress: Math.min(100, Math.max(0, progress)),
    reached: reachedMilestones.length,
    total: IMPACT_MILESTONES.length,
    next: next.amount,
    remaining: next.remaining,
    previous: previousMilestone,
  };
}

/**
 * Retourne tous les paliers avec leur statut
 */
export function getAllMilestonesStatus(totalAnnual = 0, currentMilestones = {}) {
  return IMPACT_MILESTONES.map(threshold => {
    const key = String(threshold);
    const reached = totalAnnual >= threshold;
    const unlocked = !!currentMilestones[key];
    const unlockedAt = currentMilestones[key] !== true ? currentMilestones[key] : null;

    return {
      amount: threshold,
      reached,
      unlocked,
      unlockedAt,
    };
  });
}



