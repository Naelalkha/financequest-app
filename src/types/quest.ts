/**
 * Types pour les quêtes Moniyo
 * @description Architecture de quêtes actionnables orientées économies réelles
 */

import type { Category } from './category';
import type { BadgeId } from './badge';

/** Difficulté d'une quête */
export type QuestDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** Statut d'une quête pour un utilisateur */
export type QuestStatus = 'locked' | 'available' | 'in_progress' | 'completed';

/** Période pour le calcul d'impact */
export type ImpactPeriod = 'day' | 'week' | 'month' | 'year';

/**
 * Métadonnées de quête
 * @description Informations supplémentaires sur une quête (stats, tags, etc.)
 */
export interface QuestMetadata {
    version: string;
    lastUpdated: string;
    author: string;
    tags: string[];
    relatedQuests: string[];
    averageCompletionTime: number;
    completionRate: number;
    userRating: number;
    featured: boolean;
}

/**
 * Couleurs thématiques d'une quête
 * @description Palette de couleurs pour le theming de la quête
 */
export interface QuestColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    darkBackground: string;
}

/**
 * Récompenses de quête
 * @description Badge et déblocages gagnés à la complétion
 */
export interface QuestRewards {
    badge: BadgeId | null;
    unlocks: string[];
}

/**
 * Impact financier estimé
 * @description Économies potentielles générées par la quête
 */
export interface EstimatedImpact {
    amount: number;
    period: ImpactPeriod;
}

/**
 * Placement de quête dans différentes vues
 */
export interface QuestPlacement {
    starterPack?: {
        order: number;
    };
    category?: {
        order: number;
    };
}

/**
 * Interface principale de quête
 * @description Représente une quête actionnable dans l'app Moniyo
 */
export interface Quest {
    /** Identifiant unique (ex: 'cut-subscription') */
    id: string;
    /** Catégorie principale */
    category: Category;
    /** Code pays (ex: 'fr-FR', 'global') */
    country: string;
    /** Niveau de difficulté */
    difficulty: QuestDifficulty;
    /** Durée estimée en minutes */
    duration: number;
    /** Points d'expérience gagnés */
    xp: number;
    /** Quête premium (payante) */
    isPremium: boolean;
    /** Incluse dans le pack de démarrage */
    starterPack: boolean;
    /** Ordre d'affichage */
    order: number;
    /** Clé i18n pour traductions */
    i18nKey: string;
    /** Métadonnées supplémentaires */
    metadata: QuestMetadata;
    /** Impact financier estimé */
    estimatedImpact: EstimatedImpact;
    /** Icônes (main + steps) */
    icons: {
        main: string;
        // TODO: Type plus précis pour les icônes React
        steps: unknown[];
    };
    /** Couleurs thématiques */
    colors: QuestColors;
    /** Récompenses */
    rewards: QuestRewards;
    /** Placement dans les différentes vues */
    placement?: QuestPlacement;
}

/**
 * Quête localisée avec textes traduits
 */
export interface LocalizedQuest extends Quest {
    title: string;
    description: string;
    briefing?: string;
}
