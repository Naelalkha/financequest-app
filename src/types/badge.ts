/**
 * Types pour les badges et achievements
 * @description Récompenses débloquées par les joueurs
 */

/**
 * IDs des badges disponibles
 * @description Identifiants uniques pour chaque badge du jeu
 */
export type BadgeId =
    // Progression
    | 'first_quest'
    | 'five_quests'
    | 'ten_quests'
    // Quick wins
    | 'quickwin_first_cancel'
    | 'quickwin_micro_expense'
    // Défis quotidiens
    | 'daily_perfectionist'
    | 'daily_streak_3'
    // Streaks
    | 'streak_7'
    | 'streak_30'
    | 'streak_100'
    // Paliers d'épargne
    | 'milestone_100'
    | 'milestone_500'
    | 'milestone_1000'
    | 'milestone_5000'
    // Maîtrise catégorie
    | 'category_master_pilotage'
    | 'category_master_defense'
    | 'category_master_croissance'
    | 'category_master_strategie';

/** Rareté d'un badge */
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Configuration d'un badge
 * @description Définition complète d'un badge du système de gamification
 */
export interface Badge {
    /** Identifiant unique */
    id: BadgeId;
    /** Clé i18n pour traductions */
    i18nKey: string;
    /** Icône (emoji ou nom d'icône) */
    icon: string;
    /** Niveau de rareté */
    rarity: BadgeRarity;
    /** Bonus XP attribué au déblocage */
    xpBonus: number;
}

/**
 * Badge débloqué par l'utilisateur
 * @description Badge avec date de déblocage
 */
export interface UnlockedBadge extends Badge {
    /** Date de déblocage ISO */
    unlockedAt: string;
}
