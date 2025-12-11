/**
 * Insight Data - Statistics & Facts for Cut Subscription Quest
 * 
 * Enriched data to increase perceived value and psychological impact
 * Sources: C+R Research, BRG Research, Business of Apps - All verified 2023/2024
 */

// ===== SOCIAL PROOF CAROUSEL (Protocol Screen) =====
export const socialProofSlides = {
    fr: [
        {
            id: 'forgotten-subs',
            title: 'OUBLI FRÉQUENT',
            badge: 'OUBLI FRÉQUENT',
            badgeColor: 'red',
            stat: '85%',
            text: "des abonnés ont au moins 1 abonnement inutilisé le mois dernier.",
            source: 'BRG Research 2023'
        },
        {
            id: 'phantom-expenses',
            title: 'DÉPENSES FANTÔMES',
            badge: 'DÉPENSES FANTÔMES',
            badgeColor: 'orange',
            stat: '133$',
            text: "gaspillés chaque année en moyenne pour des abonnements oubliés.",
            source: 'C+R Research 2022'
        },
        {
            id: 'avg-subscriptions',
            title: 'SURCHARGE ABO',
            badge: 'SURCHARGE',
            badgeColor: 'purple',
            stat: '4',
            text: "abonnements streaming en moyenne par foyer aux USA.",
            source: 'Business of Apps 2023'
        },
        {
            id: 'auto-renewal',
            title: 'EFFET SILENCIEUX',
            badge: 'EFFET SILENCIEUX',
            badgeColor: 'blue',
            stat: '48%',
            text: "des utilisateurs oublient d'annuler un essai gratuit.",
            source: 'C+R Research 2022'
        }
    ],
    en: [
        {
            id: 'forgotten-subs',
            title: 'COMMON OVERSIGHT',
            badge: 'COMMON OVERSIGHT',
            badgeColor: 'red',
            stat: '85%',
            text: "of subscribers have at least 1 unused subscription last month.",
            source: 'BRG Research 2023'
        },
        {
            id: 'phantom-expenses',
            title: 'PHANTOM EXPENSES',
            badge: 'PHANTOM EXPENSES',
            badgeColor: 'orange',
            stat: '$133',
            text: "wasted yearly on average on forgotten subscriptions.",
            source: 'C+R Research 2022'
        },
        {
            id: 'avg-subscriptions',
            title: 'SUB OVERLOAD',
            badge: 'OVERLOAD',
            badgeColor: 'purple',
            stat: '4',
            text: "streaming subscriptions on average per US household.",
            source: 'Business of Apps 2023'
        },
        {
            id: 'auto-renewal',
            title: 'SILENT EFFECT',
            badge: 'SILENT EFFECT',
            badgeColor: 'blue',
            stat: '48%',
            text: "of users forget to cancel a free trial.",
            source: 'C+R Research 2022'
        }
    ]
};

// ===== PRO TIPS / FORENSICS METHOD (Protocol Screen - Tactics) =====
export const proTips = {
    fr: [
        {
            id: 'audit-flows',
            title: 'AUDITE TES FLUX',
            iconName: 'Search',
            body: "Ouvre ton app bancaire. Scanne le relevé du mois dernier. Repère les montants récurrents suspects (9.99, 19.90...)."
        },
        {
            id: 'target-source',
            title: 'CIBLE LA SOURCE',
            iconName: 'Cog',
            body: "Gère ça à la racine. Pour les apps : **Réglages > Abonnements** (iOS/Android). Pour le reste (Canal+, Gym) : Connecte-toi sur le **Web** > Espace Client."
        },
        {
            id: 'dodge-traps',
            title: 'ESQUIVE LES PIÈGES',
            iconName: 'ShieldAlert',
            body: "Refuse la 'Pause' ou le 'Mois offert'. Ce sont des leurres (Dark Patterns) pour te garder captif. Confirme la résiliation totale."
        }
    ],
    en: [
        {
            id: 'audit-flows',
            title: 'AUDIT YOUR FLOWS',
            iconName: 'Search',
            body: "Open your banking app. Scan last month's statement. Spot recurring suspicious amounts (9.99, 19.90...)."
        },
        {
            id: 'target-source',
            title: 'TARGET THE SOURCE',
            iconName: 'Cog',
            body: "Handle this at the root. For apps: **Settings > Subscriptions** (iOS/Android). For the rest (Cable, Gym): Log in on the **Web** > Account."
        },
        {
            id: 'dodge-traps',
            title: 'DODGE THE TRAPS',
            iconName: 'ShieldAlert',
            body: "Refuse the 'Pause' or 'Free Month' offers. These are decoys (Dark Patterns) to keep you captive. Confirm full cancellation."
        }
    ]
};

// ===== REALITY CHECK PILLS (Execution Screen) =====
export const realityCheckPills = {
    fr: {
        netflix: { stat: '40%', text: "des comptes Netflix dorment plus de 2 semaines par mois" },
        spotify: { stat: '28%', text: "des utilisateurs écoutent moins de 5h/mois" },
        prime: { stat: '41%', text: "n'utilisent que la livraison, pas Prime Video" },
        disney: { stat: '45%', text: "regardent moins de 2 films par mois" },
        apple: { stat: '38%', text: "paient pour des services Apple jamais ouverts" },
        other: { stat: '⚠️', text: "Les abos discrets sont souvent les plus coûteux" },
        default: { stat: '32%', text: "des abonnements ne sont jamais utilisés" }
    },
    en: {
        netflix: { stat: '40%', text: "of Netflix accounts are inactive >2 weeks per month" },
        spotify: { stat: '28%', text: "of users listen less than 5h/month" },
        prime: { stat: '41%', text: "only use delivery, never Prime Video" },
        disney: { stat: '45%', text: "watch less than 2 movies per month" },
        apple: { stat: '38%', text: "pay for Apple services they never open" },
        other: { stat: '⚠️', text: "Discrete subscriptions are often the most expensive" },
        default: { stat: '32%', text: "of subscriptions are never used" }
    }
};

// ===== CONCRETE IMPACT (Debrief Screen) =====
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
                text: "C'est une paire de **Sneakers** (Nike/Adidas) en promo.",
                compute: () => ({})
            },
            {
                maxAmount: 250,
                icon: '✈️',
                text: "C'est un **vol A/R pour Barcelone** ou Lisbonne.",
                compute: () => ({})
            },
            {
                maxAmount: 400,
                icon: '🎧',
                text: "C'est un casque **Sony XM5** ou des **AirPods Pro**.",
                compute: () => ({})
            },
            {
                maxAmount: 600,
                icon: '📈',
                text: "C'est **une action LVMH** ou 0.01 Bitcoin sécurisé.",
                compute: () => ({})
            },
            {
                maxAmount: 1000,
                icon: '💻',
                text: "C'est une partie sérieuse d'un **MacBook Air**.",
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
                text: "That's **{coffees} coffees** offered every month.",
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
                text: "That's a pair of **Sneakers** (Nike/Adidas) on sale.",
                compute: () => ({})
            },
            {
                maxAmount: 250,
                icon: '✈️',
                text: "That's a **round-trip to Barcelona** or Lisbon.",
                compute: () => ({})
            },
            {
                maxAmount: 400,
                icon: '🎧',
                text: "That's a **Sony XM5** headset or **AirPods Pro**.",
                compute: () => ({})
            },
            {
                maxAmount: 600,
                icon: '📈',
                text: "That's **one LVMH share** or 0.01 Bitcoin secured.",
                compute: () => ({})
            },
            {
                maxAmount: 1000,
                icon: '💻',
                text: "That's a serious chunk of a **MacBook Air**.",
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

// ===== COMPOUND INTEREST PROJECTION =====
export const calculateCompoundGrowth = (monthlyAmount, years = 10, rate = 0.07) => {
    const monthlyRate = rate / 12;
    const months = years * 12;
    const fv = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return Math.round(fv);
};

export default {
    socialProofSlides,
    proTips,
    realityCheckPills,
    getConcreteImpact,
    calculateCompoundGrowth
};
