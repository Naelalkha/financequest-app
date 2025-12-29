/**
 * Types pour l'utilisateur et sa progression
 * @description Modèles de données utilisateur stockés dans Firestore
 */

import type { BadgeId } from './badge';

/**
 * Paliers d'épargne atteints
 * @description Mapping montant → date ISO de déblocage
 */
export interface MilestoneRecord {
    [milestone: string]: string;
}

/**
 * Données de gamification utilisateur
 * @description Progression XP, niveau, badges et paliers
 */
export interface UserGamification {
    /** XP total accumulé */
    xpTotal: number;
    /** Niveau actuel */
    level: number;
    /** XP requis pour le prochain niveau */
    nextLevelXP: number;
    /** Paliers d'épargne débloqués */
    milestones: MilestoneRecord;
    /** IDs des badges débloqués */
    badges: BadgeId[];
    /** Dernière mise à jour */
    updatedAt: Date | null;
}

/**
 * Statut de progression sur une quête
 */
export interface QuestProgress {
    status: 'in_progress' | 'completed';
    completedAt?: string;
    score?: number;
}

/**
 * Progression utilisateur sur les quêtes
 * @description Map questId → statut de progression
 */
export interface UserProgress {
    [questId: string]: QuestProgress;
}

/**
 * Statut d'abonnement premium
 */
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trialing';

/**
 * Profil utilisateur complet
 * @description Document principal /users/{uid} dans Firestore
 */
export interface UserProfile {
    /** UID Firebase */
    uid: string;
    /** Email */
    email: string;
    /** Nom d'affichage */
    displayName?: string;
    /** URL avatar */
    photoURL?: string;
    /** Accès premium */
    isPremium: boolean;
    /** Statut d'abonnement */
    subscriptionStatus?: SubscriptionStatus;
    /** Expiration abonnement ISO */
    subscriptionExpiresAt?: string;
    /** XP total */
    xpTotal: number;
    /** Données de gamification */
    gamification: UserGamification;
    /** Streak actuel (jours consécutifs) */
    currentStreak: number;
    /** Meilleur streak */
    longestStreak: number;
    /** Nombre de défis quotidiens complétés */
    dailyChallengesCompleted: number;
    /** Dernier défi quotidien complété */
    lastDailyChallenge?: string;
    /** Date de création */
    createdAt: Date;
    /** Dernière mise à jour */
    updatedAt: Date;
}

/**
 * Résultat de mise à jour gamification
 * @description Retourné après complétion de quête/défi
 */
export interface GamificationUpdateResult {
    xpGained: number;
    newXP: number;
    level: number;
    oldLevel: number;
    newBadges: BadgeId[];
    levelUp: boolean;
}
