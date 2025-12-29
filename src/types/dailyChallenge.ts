/**
 * Types pour les défis quotidiens
 * @description Défis générés quotidiennement pour maintenir l'engagement
 */

/**
 * Types de défis quotidiens
 */
export type DailyChallengeType =
    | 'quiz_master'
    | 'speed_runner'
    | 'perfectionist'
    | 'streak_keeper'
    | 'category_explorer';

/**
 * Exigences d'un défi
 * @description Conditions à remplir pour valider le défi
 */
export interface ChallengeRequirements {
    /** Description lisible */
    description: string;
    /** Type de cible (perfect_score, completion_time, etc.) */
    target: string;
    /** Valeur cible */
    value: number | string;
}

/**
 * Récompenses d'un défi quotidien
 */
export interface DailyChallengeRewards {
    /** XP gagné */
    xp: number;
    /** Progression streak */
    streak: number;
    /** Badge débloqué (si applicable) */
    badge: string | null;
}

/** Statut d'un défi quotidien */
export type DailyChallengeStatus = 'active' | 'completed' | 'expired';

/**
 * Défi quotidien
 * @description Généré quotidiennement pour chaque utilisateur
 */
export interface DailyChallenge {
    /** ID unique (format: daily_YYYY-MM-DD_seed) */
    id: string;
    /** Type de défi */
    type: DailyChallengeType;
    /** ID de la quête associée */
    questId: string;
    /** Titre de la quête (localisé) */
    questTitle: string;
    /** Date du défi (YYYY-MM-DD) */
    date: string;
    /** Seed de génération */
    seed: number;
    /** Récompenses */
    rewards: DailyChallengeRewards;
    /** Exigences */
    requirements: ChallengeRequirements;
    /** Date d'expiration ISO */
    expiresAt: string;
    /** UID utilisateur */
    userId?: string;
    /** Statut actuel */
    status?: DailyChallengeStatus;
    /** Progression (0-100) */
    progress?: number;
    /** Date de création ISO */
    createdAt?: string;
    /** Date de début ISO */
    startedAt?: string;
    /** Date de complétion ISO */
    completedAt?: string | null;
}

/**
 * Données de complétion pour validation
 */
export interface ChallengeCompletionData {
    completed: boolean;
    score?: number;
    duration?: number;
    mistakes?: number;
    streakMaintained?: boolean;
    category?: string;
}

/**
 * Statistiques de défis quotidiens
 */
export interface DailyChallengeStats {
    totalCompleted: number;
    currentStreak: number;
    longestStreak: number;
    totalXP: number;
}
