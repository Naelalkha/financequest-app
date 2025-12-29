/**
 * [QUEST_NAME] Quest - Metadata
 * 
 * Template de configuration pour nouvelles quêtes
 * 
 * INSTRUCTIONS:
 * 1. Copier ce fichier vers metadata.js
 * 2. Remplacer tous les [PLACEHOLDER] par les vraies valeurs
 * 3. Adapter les couleurs et icônes selon l'identité de la quête
 */

// Icons (optionnel) - Décommenter si besoin
// import { FaCheckCircle, FaCoins } from 'react-icons/fa';
// import icon from './assets/icon.png';

export const templateQuest = {
    // =====================================================
    // IDENTIFIANTS (obligatoire)
    // =====================================================
    id: '[quest-id]',           // Unique ID en kebab-case (ex: 'track-expenses')
    i18nKey: '[questKey]',      // Clé dans quests.json (ex: 'trackExpenses')

    // =====================================================
    // CATÉGORISATION
    // =====================================================
    category: 'pilotage',       // pilotage | croissance | defense | strategie
    country: 'fr-FR',           // Localisation principale
    difficulty: 'beginner',     // beginner | intermediate | advanced

    // =====================================================
    // RÉCOMPENSES & DURÉE
    // =====================================================
    xp: 100,                    // Points d'expérience gagnés
    duration: 5,                // Durée estimée en minutes

    // =====================================================
    // FLAGS DE VISIBILITÉ
    // =====================================================
    isPremium: false,           // Quête premium uniquement
    starterPack: false,         // Incluse dans le starter pack
    order: 10,                  // Ordre d'affichage (plus petit = plus haut)

    // =====================================================
    // MÉTADONNÉES ENRICHIES
    // =====================================================
    metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        author: 'Moniyo Team',
        tags: ['[tag1]', '[tag2]', '[tag3]'],  // 3-5 tags pertinents
        relatedQuests: [],                      // IDs de quêtes liées
        averageCompletionTime: 5,               // Minutes (mesuré)
        completionRate: 0.85,                   // Taux de completion (0-1)
        userRating: 4.5,                        // Note utilisateur (1-5)
        featured: false                         // Mise en avant sur le dashboard
    },

    // =====================================================
    // IMPACT FINANCIER ESTIMÉ
    // Détermine les cartes affichées dans DebriefScreen
    // =====================================================
    estimatedImpact: {
        /**
         * TYPE D'IMPACT:
         * - 'savings'   : Économies récurrentes → Affiche ConcreteImpact + CompoundCard
         * - 'earnings'  : Revenus récurrents → Affiche ConcreteImpact + CompoundCard
         * - 'one-time'  : Gain unique → Affiche ConcreteImpact uniquement
         * - 'none'      : Pas d'impact € → Affiche XP + Streak seulement
         */
        type: 'savings',
        amount: 0,              // Montant estimé (€)
        /**
         * PÉRIODE:
         * - 'month'     : Économie mensuelle
         * - 'year'      : Économie annuelle
         * - 'one-time'  : Gain unique
         * - null        : Pas de période (si type = 'none')
         */
        period: 'month'
    },

    // =====================================================
    // VISUELS
    // Décommenter et adapter selon les besoins
    // =====================================================
    /*
    icons: {
        main: icon,                    // Icône principale 3D
        steps: [FaCheckCircle, FaCoins] // Icônes des étapes
    },
    */

    colors: {
        primary: '#E2FF00',     // Volt yellow (défaut Moniyo)
        secondary: '#1A1A1A',   // Noir profond
        accent: '#FFFFFF',      // Blanc
        background: 'from-neutral-900 to-black',
        darkBackground: 'from-neutral-900/20 to-black/20'
    },

    // =====================================================
    // RÉCOMPENSES DE COMPLETION
    // =====================================================
    rewards: {
        badge: null,            // ID du badge à débloquer (ex: 'budget_master')
        unlocks: []             // IDs des quêtes à débloquer après completion
    }
};

export default templateQuest;
