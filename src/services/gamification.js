/**
 * 🎮 Gamification Service
 * Service pour mettre à jour les données de gamification dans Firestore
 */

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import {
  computeLevel,
  checkMilestones,
  checkBadges,
  calculateQuestXP,
  calculateSavingsXP,
  groupSavingsByCategory,
  countCompletedQuests,
  hasQuickWinSavings,
} from '../utils/gamification';
import { trackEvent } from '../utils/analytics';

/**
 * Met à jour la gamification après qu'une quête soit complétée
 */
export async function updateGamificationOnQuestComplete(userId, context = {}) {
  if (!userId) return null;

  try {
    const {
      quest,
      score = null,
      userProgress = {},
      allQuests = [],
    } = context;

    // Récupérer le doc utilisateur
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.warn('User doc not found');
      return null;
    }

    const userData = userSnap.data();
    const currentXP = userData.xpTotal || 0;
    const currentGamif = userData.gamification || {};
    const currentBadges = currentGamif.badges || [];

    // Calculer XP gagné
    const xpGained = calculateQuestXP(quest, score);
    const newXP = currentXP + xpGained;

    // Calculer nouveau niveau
    const { level, nextLevelXP } = computeLevel(newXP);
    const oldLevel = computeLevel(currentXP).level;

    // Vérifier nouveaux badges
    const questStats = countCompletedQuests(userProgress, allQuests);
    const newBadgesContext = {
      completedQuestsCount: questStats.total,
      starterQuestsCompleted: questStats.starterCount,
      completedQuestIds: questStats.completedIds,
      level,
    };
    const newBadges = checkBadges(newBadgesContext, currentBadges);

    // Mettre à jour Firestore
    await updateDoc(userRef, {
      xpTotal: newXP,
      'gamification.xpTotal': newXP,
      'gamification.level': level,
      'gamification.nextLevelXP': nextLevelXP,
      'gamification.badges': [...currentBadges, ...newBadges],
      'gamification.updatedAt': serverTimestamp(),
    });

    // Analytics
    if (xpGained > 0) {
      trackEvent('xp_earned', { source: 'quest', amount: xpGained, quest_id: quest.id });
    }

    if (level > oldLevel) {
      trackEvent('level_up', { level, xp_total: newXP });
      // Toast désactivé - animations intégrées à implémenter
    }

    newBadges.forEach(badgeId => {
      trackEvent('badge_unlocked', { badge_id: badgeId });
      // Toast géré par le composant BadgeNotification si nécessaire
    });

    return {
      xpGained,
      newXP,
      level,
      oldLevel,
      newBadges,
      levelUp: level > oldLevel,
    };

  } catch (error) {
    console.error('Error updating gamification on quest complete:', error);
    return null;
  }
}

/**
 * Met à jour la gamification après un changement de savings event
 */
export async function updateGamificationOnSavingsChange(userId, context = {}) {
  if (!userId) return null;

  try {
    const {
      totalAnnualImpact = 0,
      savingsEvents = [],
      questsById = {},
      userProgress = {},
      allQuests = [],
      eventSource = 'manual',
      currentStreak = 0,
    } = context;

    // Récupérer le doc utilisateur
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.warn('User doc not found');
      return null;
    }

    const userData = userSnap.data();
    const currentXP = userData.xpTotal || 0;
    const currentGamif = userData.gamification || {};
    const currentMilestones = currentGamif.milestones || {};
    const currentBadges = currentGamif.badges || [];

    // Vérifier nouveaux paliers
    const newMilestones = checkMilestones(totalAnnualImpact, currentMilestones);
    const updatedMilestones = { ...currentMilestones };
    newMilestones.forEach(milestone => {
      updatedMilestones[String(milestone)] = new Date().toISOString();
    });

    // Vérifier nouveaux badges
    const savingsByCategory = groupSavingsByCategory(savingsEvents, questsById);
    const questStats = countCompletedQuests(userProgress, allQuests);
    const hasQuickWin = hasQuickWinSavings(savingsEvents);
    
    const { level } = computeLevel(currentXP);

    const badgesContext = {
      completedQuestsCount: questStats.total,
      starterQuestsCompleted: questStats.starterCount,
      totalAnnualImpact,
      currentStreak,
      savingsEventsByCategory: savingsByCategory,
      completedQuestIds: questStats.completedIds,
      level,
      hasQuickWinEvent: hasQuickWin,
    };
    const newBadges = checkBadges(badgesContext, currentBadges);

    // Mettre à jour Firestore
    await updateDoc(userRef, {
      'gamification.milestones': updatedMilestones,
      'gamification.badges': [...currentBadges, ...newBadges],
      'gamification.updatedAt': serverTimestamp(),
    });

    // Analytics
    // Analytics & Notifications
    if (newMilestones.length > 0) {
      // Find the highest milestone
      const highestMilestone = Math.max(...newMilestones);
      
      // Track each milestone
      newMilestones.forEach(milestone => {
        trackEvent('milestone_unlocked', { amount: milestone, impact_total: totalAnnualImpact });
      });

      // Toast désactivé - animations intégrées à implémenter
    }

    newBadges.forEach(badgeId => {
      trackEvent('badge_unlocked', { badge_id: badgeId });
    });

    return {
      newMilestones,
      newBadges,
      totalAnnualImpact,
    };

  } catch (error) {
    console.error('Error updating gamification on savings change:', error);
    return null;
  }
}

/**
 * Récupère les données de gamification d'un utilisateur
 */
export async function getUserGamification(userId) {
  if (!userId) return null;

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data();
    const xpTotal = userData.xpTotal || 0;
    const gamification = userData.gamification || {};

    return {
      xpTotal,
      level: gamification.level || 1,
      nextLevelXP: gamification.nextLevelXP || 300,
      milestones: gamification.milestones || {},
      badges: gamification.badges || [],
      updatedAt: gamification.updatedAt || null,
    };

  } catch (error) {
    console.error('Error getting user gamification:', error);
    return null;
  }
}



