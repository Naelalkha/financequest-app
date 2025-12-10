/**
 * [QUEST_NAME] Quest - Metadata
 * 
 * TODO: Replace all [PLACEHOLDERS]
 */

export default {
    // ===== IDENTIFIERS =====
    id: '[quest-id]',           // Unique ID (kebab-case)
    i18nKey: '[questKey]',      // Key in quests.json

    // ===== CATEGORIZATION =====
    category: 'pilotage',       // pilotage | croissance | defense | strategie
    country: 'fr-FR',
    difficulty: 'beginner',     // beginner | intermediate | advanced

    // ===== REWARDS =====
    xp: 100,
    duration: 5,                // Estimated minutes

    // ===== FLAGS =====
    isPremium: false,
    starterPack: false,
    order: 10,

    // ===== METADATA =====
    metadata: {
        version: '1.0.0',
        author: 'Moniyo Team',
        tags: ['[tag1]', '[tag2]'],
        relatedQuests: [],
        averageCompletionTime: 5,
        completionRate: 0.85,
        userRating: 4.5,
        featured: false
    },

    // ===== IMPACT =====
    // Determines what cards show in DebriefScreen:
    // - 'savings': Shows ConcreteImpact + CompoundCard (recurring savings)
    // - 'earnings': Shows ConcreteImpact + CompoundCard (recurring income)
    // - 'one-time': Shows ConcreteImpact only (one-time € gain)
    // - 'none': Shows only XP + Streak (no monetary impact)
    estimatedImpact: {
        type: 'none',           // 'savings' | 'earnings' | 'one-time' | 'none'
        amount: 0,              // Monetary impact (0 if type = 'none')
        period: null,           // 'month' | 'year' | 'one-time' | null
    },

    // ===== VISUALS =====
    // icons: {
    //     main: require('./assets/icon.png'),
    // },

    colors: {
        primary: '#E2FF00',     // Volt yellow as default
        secondary: '#1A1A1A',
        accent: '#FFFFFF',
        background: 'from-neutral-900 to-black',
        darkBackground: 'from-neutral-900/20 to-black/20'
    },

    // ===== PHASES =====
    phases: [
        'BRIEFING',
        'EXECUTION',
        'DEBRIEF'
    ],

    // ===== REWARDS =====
    rewards: {
        badge: null,            // Badge ID to unlock
        unlocks: []             // Quest IDs to unlock
    }
};
