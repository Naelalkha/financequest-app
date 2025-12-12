/**
 * Insight Data - Content & Statistics for [QUEST_NAME] Quest
 * 
 * Ce fichier contient tout le contenu textuel localisé de la quête.
 * Chaque section est bilingue (fr/en).
 * 
 * INSTRUCTIONS:
 * 1. Copier ce fichier vers insightData.js
 * 2. Remplir chaque section avec le contenu pertinent
 * 3. Vérifier les sources des statistiques
 */

// =====================================================
// SOCIAL PROOF CAROUSEL (ProtocolScreen)
// Slides de statistiques pour convaincre l'utilisateur
// =====================================================
export const socialProofSlides = {
    fr: [
        {
            id: 'stat-1',
            title: 'TITRE DU SLIDE',           // Ex: 'OUBLI FRÉQUENT'
            badge: 'LABEL BADGE',              // Ex: 'ALERTE'
            badgeColor: 'red',                 // red | orange | purple | blue | green
            stat: '85%',                       // Statistique principale (gros chiffre)
            text: "Description de la statistique avec contexte.",
            source: 'Source Research 2023'     // Citer la source
        },
        {
            id: 'stat-2',
            title: 'DEUXIÈME STAT',
            badge: 'INFO',
            badgeColor: 'orange',
            stat: '120€',
            text: "Autre statistique pertinente pour la quête.",
            source: 'Source Research 2023'
        },
        {
            id: 'stat-3',
            title: 'TROISIÈME STAT',
            badge: 'INSIGHT',
            badgeColor: 'purple',
            stat: '4',
            text: "Troisième point clé pour renforcer le message.",
            source: 'Source Research 2023'
        }
    ],
    en: [
        {
            id: 'stat-1',
            title: 'SLIDE TITLE',
            badge: 'BADGE LABEL',
            badgeColor: 'red',
            stat: '85%',
            text: "Statistic description with context.",
            source: 'Source Research 2023'
        },
        {
            id: 'stat-2',
            title: 'SECOND STAT',
            badge: 'INFO',
            badgeColor: 'orange',
            stat: '€120',
            text: "Another relevant statistic for the quest.",
            source: 'Source Research 2023'
        },
        {
            id: 'stat-3',
            title: 'THIRD STAT',
            badge: 'INSIGHT',
            badgeColor: 'purple',
            stat: '4',
            text: "Third key point to reinforce the message.",
            source: 'Source Research 2023'
        }
    ]
};

// =====================================================
// PRO TIPS / TACTICS (ProtocolScreen - Timeline)
// Conseils actionnables avec icônes Lucide
// =====================================================
export const proTips = {
    fr: [
        {
            id: 'tip-1',
            title: 'PREMIÈRE ACTION',
            iconName: 'Search',                // Nom de l'icône Lucide
            body: "Description de l'action avec **texte en gras** pour les éléments clés."
        },
        {
            id: 'tip-2',
            title: 'DEUXIÈME ACTION',
            iconName: 'Cog',
            body: "Autre conseil pratique avec **instructions précises** pour l'utilisateur."
        },
        {
            id: 'tip-3',
            title: 'TROISIÈME ACTION',
            iconName: 'ShieldAlert',
            body: "Dernier conseil avec **mise en garde** si nécessaire."
        }
    ],
    en: [
        {
            id: 'tip-1',
            title: 'FIRST ACTION',
            iconName: 'Search',
            body: "Action description with **bold text** for key elements."
        },
        {
            id: 'tip-2',
            title: 'SECOND ACTION',
            iconName: 'Cog',
            body: "Another practical tip with **precise instructions** for the user."
        },
        {
            id: 'tip-3',
            title: 'THIRD ACTION',
            iconName: 'ShieldAlert',
            body: "Last tip with **warning** if needed."
        }
    ]
};

/**
 * ICÔNES LUCIDE RECOMMANDÉES:
 * 
 * - Search      : Recherche, audit
 * - Cog         : Paramètres, configuration
 * - ShieldAlert : Alerte, mise en garde
 * - Target      : Objectif, cible
 * - Zap         : Action rapide, énergie
 * - TrendingUp  : Croissance, progression
 * - PiggyBank   : Épargne, économies
 * - Calculator  : Calcul, chiffres
 * - Calendar    : Temps, planification
 * - CheckCircle : Validation, completion
 */

// =====================================================
// REALITY CHECK PILLS (ExecutionScreen - optionnel)
// Micro-statistiques contextuelles par option
// =====================================================
export const realityCheckPills = {
    fr: {
        option1: { stat: '40%', text: "Statistique contextuelle pour l'option 1" },
        option2: { stat: '28%', text: "Statistique contextuelle pour l'option 2" },
        other: { stat: '⚠️', text: "Statistique par défaut pour les autres options" },
        default: { stat: '32%', text: "Statistique générique si aucune correspondance" }
    },
    en: {
        option1: { stat: '40%', text: "Contextual statistic for option 1" },
        option2: { stat: '28%', text: "Contextual statistic for option 2" },
        other: { stat: '⚠️', text: "Default statistic for other options" },
        default: { stat: '32%', text: "Generic statistic if no match" }
    }
};

// =====================================================
// CONCRETE IMPACT (DebriefScreen)
// Visualisation de l'impact en termes concrets
// =====================================================
export const getConcreteImpact = (amount, locale = 'fr') => {
    const impacts = {
        fr: [
            {
                maxAmount: 30,
                icon: '☕',
                text: "C'est **{coffees} cafés** offerts chaque mois.",
                compute: (amt) => ({ coffees: Math.floor(amt / 4) })
            },
            {
                maxAmount: 60,
                icon: '🍽️',
                text: "C'est **un dîner au restaurant** pour 2.",
                compute: () => ({})
            },
            {
                maxAmount: 120,
                icon: '👟',
                text: "C'est une paire de **Sneakers** en promo.",
                compute: () => ({})
            },
            {
                maxAmount: 250,
                icon: '✈️',
                text: "C'est un **vol A/R** pour une capitale européenne.",
                compute: () => ({})
            },
            {
                maxAmount: 500,
                icon: '🎧',
                text: "C'est un casque **Sony XM5** ou des **AirPods Pro**.",
                compute: () => ({})
            },
            {
                maxAmount: Infinity,
                icon: '🚀',
                text: "C'est un **investissement majeur** ou un voyage de rêve.",
                compute: () => ({})
            }
        ],
        en: [
            {
                maxAmount: 30,
                icon: '☕',
                text: "That's **{coffees} coffees** every month.",
                compute: (amt) => ({ coffees: Math.floor(amt / 4) })
            },
            {
                maxAmount: 60,
                icon: '🍽️',
                text: "That's **a restaurant dinner** for 2.",
                compute: () => ({})
            },
            {
                maxAmount: 120,
                icon: '👟',
                text: "That's a pair of **Sneakers** on sale.",
                compute: () => ({})
            },
            {
                maxAmount: 250,
                icon: '✈️',
                text: "That's a **round-trip flight** to a European capital.",
                compute: () => ({})
            },
            {
                maxAmount: 500,
                icon: '🎧',
                text: "That's a **Sony XM5** headset or **AirPods Pro**.",
                compute: () => ({})
            },
            {
                maxAmount: Infinity,
                icon: '🚀',
                text: "That's a **major investment** or a dream trip.",
                compute: () => ({})
            }
        ]
    };

    const list = impacts[locale] || impacts.fr;
    const match = list.find(item => amount <= item.maxAmount);

    if (!match) return { icon: '💰', text: '' };

    // Compute dynamic values
    const computed = match.compute(amount);
    let finalText = match.text;

    // Replace placeholders
    Object.entries(computed).forEach(([key, value]) => {
        finalText = finalText.replace(`{${key}}`, value);
    });

    return { icon: match.icon, text: finalText };
};

// =====================================================
// COMPOUND INTEREST PROJECTION (DebriefScreen)
// Calcul de la projection sur X années avec intérêts composés
// =====================================================
export const calculateCompoundGrowth = (monthlyAmount, years = 10, rate = 0.07) => {
    const monthlyRate = rate / 12;
    const months = years * 12;
    const fv = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return Math.round(fv);
};

// =====================================================
// EXPORT PAR DÉFAUT
// =====================================================
export default {
    socialProofSlides,
    proTips,
    realityCheckPills,
    getConcreteImpact,
    calculateCompoundGrowth
};
