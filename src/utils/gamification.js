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

/**
 * Calcule le niveau et l'XP requis pour le suivant
 */
export function computeLevel(xpTotal = 0) {
  let level = 1;

  // Trouver le niveau actuel
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xpTotal >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }

  // XP requis pour le niveau suivant
  const nextLevelXP = LEVEL_THRESHOLDS[level] || null;
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
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
export function checkMilestones(totalAnnual = 0, currentMilestones = {}) {
  const newMilestones = [];

  IMPACT_MILESTONES.forEach(threshold => {
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
export function getNextMilestone(totalAnnual = 0) {
  for (const threshold of IMPACT_MILESTONES) {
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
export function calculateQuestXP(quest, score = null) {
  const difficulty = quest.difficulty || 'beginner';
  let xp = XP_REWARDS.quest[difficulty] || XP_REWARDS.quest.beginner;

  // Bonus quiz si score >= 80%
  if (score !== null && score >= 80) {
    xp += XP_REWARDS.quiz_bonus;
  }

  return xp;
}

/**
 * Calcule l'XP gagné pour un savings event
 */
export function calculateSavingsXP(event, source = 'manual') {
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
export function checkBadges(context = {}, currentBadges = []) {
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

  const newBadges = [];

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
export function groupSavingsByCategory(savingsEvents = [], questsById = {}) {
  const categoryMap = {};

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
export function countCompletedQuests(userProgress = {}, quests = []) {
  let total = 0;
  let starterCount = 0;
  const completedIds = [];

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
export function hasQuickWinSavings(savingsEvents = []) {
  return savingsEvents.some(event =>
    event.source === 'quick_win' ||
    event.questId === 'cut-subscription' ||
    event.title?.toLowerCase().includes('quick win')
  );
}

/**
 * Formate le badge pour l'affichage
 */
export function formatBadge(badgeId, lang = 'en', unlockedAt = null) {
  const badge = BADGES[badgeId];
  if (!badge) {
    return {
      id: badgeId,
      name: badgeId,
      description: '',
      icon: '🏆',
      color: '#9CA3AF',
      unlocked: !!unlockedAt,
      unlockedAt,
    };
  }

  return {
    id: badge.id,
    name: badge.name[lang] || badge.name.en,
    description: badge.description[lang] || badge.description.en,
    icon: badge.icon,
    color: badge.color,
    unlocked: !!unlockedAt,
    unlockedAt,
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



