/**
 * Catégories de quêtes - Les 4 piliers stratégiques Moniyo
 * @description Chaque quête appartient à une catégorie qui définit son objectif principal
 */

/**
 * Catégorie de quête
 * - pilotage: Gestion budget & dépenses quotidiennes
 * - defense: Protection & épargne de sécurité
 * - croissance: Investissement & revenus
 * - strategie: Planification long terme
 * - budget: Alias legacy pour pilotage
 */
export type Category =
    | 'pilotage'
    | 'defense'
    | 'croissance'
    | 'strategie'
    | 'budget';

/** Labels localisés pour les catégories */
export const CATEGORY_LABELS: Record<Category, { fr: string; en: string }> = {
    pilotage: { fr: 'Pilotage', en: 'Budget Control' },
    defense: { fr: 'Défense', en: 'Defense' },
    croissance: { fr: 'Croissance', en: 'Growth' },
    strategie: { fr: 'Stratégie', en: 'Strategy' },
    budget: { fr: 'Budget', en: 'Budget' }
};

/** Icônes des catégories (noms Lucide) */
export const CATEGORY_ICONS: Record<Category, string> = {
    pilotage: 'Gauge',
    defense: 'Shield',
    croissance: 'TrendingUp',
    strategie: 'Target',
    budget: 'Wallet'
};

/** Couleurs des catégories */
export const CATEGORY_COLORS: Record<Category, string> = {
    pilotage: '#3B82F6',  // Blue
    defense: '#10B981',   // Green
    croissance: '#F59E0B', // Amber
    strategie: '#8B5CF6', // Purple
    budget: '#3B82F6'     // Blue (alias)
};
