/**
 * Insight Data - Statistics & Facts for Micro Expenses Quest
 * 
 * Quest 02: TRAQUE INVISIBLE
 * Enriched data for social proof, tactics, and calculations
 */

// ===== SOCIAL PROOF CAROUSEL (Protocol Screen) =====
export const socialProofSlides = {
    fr: [
        {
            id: 'volume',
            title: 'FUITE MENSUELLE',
            badge: 'VOLUME',
            badgeColor: 'amber',
            stat: '72€',
            text: "dépensés en moyenne par mois par les 18-26 ans pour les repas hors domicile. Soit 864€/an en autopilote.",
            source: 'Republik Retail 2024'
        },
        {
            id: 'frequency',
            title: 'TAUX DE REGRET',
            badge: 'FRÉQUENCE',
            badgeColor: 'orange',
            stat: '68%',
            text: "des Millennials regrettent au moins un achat impulsif fait sous influence.",
            source: 'Bankrate 2023'
        },
        {
            id: 'impact',
            title: 'IMPACT CRÉDIT',
            badge: 'IMPACT',
            badgeColor: 'red',
            stat: '3 MOIS',
            text: "de relevés bancaires scrutés par les banques pour évaluer ton reste à vivre avant un crédit.",
            source: 'Pratique Bancaire FR'
        }
    ],
    en: [
        {
            id: 'volume',
            title: 'MONTHLY LEAK',
            badge: 'VOLUME',
            badgeColor: 'amber',
            stat: '€72',
            text: "spent on average per month by 18-26 year olds on eating out. That's €864/year on autopilot.",
            source: 'Republik Retail 2024'
        },
        {
            id: 'frequency',
            title: 'REGRET RATE',
            badge: 'FREQUENCY',
            badgeColor: 'orange',
            stat: '68%',
            text: "of Millennials regret at least one impulse purchase made under influence.",
            source: 'Bankrate 2023'
        },
        {
            id: 'impact',
            title: 'CREDIT IMPACT',
            badge: 'IMPACT',
            badgeColor: 'red',
            stat: '3 MONTHS',
            text: "of bank statements scrutinized by banks to assess your 'rest to live' before a loan.",
            source: 'FR Banking Practice'
        }
    ]
};

// ===== PRO TIPS / TACTICS (Protocol Screen) =====
export const proTips = {
    fr: [
        {
            id: 'trigger',
            title: 'IDENTIFIE LE DÉCLENCHEUR',
            iconName: 'Zap',
            body: "Tu n'achètes pas un café, tu achètes une pause. Identifie l'émotion (stress, fatigue) qui précède l'achat pour la pirater."
        },
        {
            id: 'life-hours',
            title: 'CALCUL EN HEURES DE VIE',
            iconName: 'Clock',
            body: "Ce menu Uber Eats à 20€ ? C'est 2 heures de ton travail net. Demande-toi toujours : **'Est-ce que ce burger vaut 2h de ma vie ?'**"
        },
        {
            id: 'substitution',
            title: 'LA RÈGLE DE SUBSTITUTION',
            iconName: 'RefreshCw',
            body: "Ne te prive pas, sois malin. Café Starbuck (5€) → Thermos stylé (0.50€). Uber (15€) → Podcast + Marche (0€)."
        }
    ],
    en: [
        {
            id: 'trigger',
            title: 'IDENTIFY THE TRIGGER',
            iconName: 'Zap',
            body: "You're not buying a coffee, you're buying a break. Identify the emotion (stress, fatigue) that precedes the purchase to hack it."
        },
        {
            id: 'life-hours',
            title: 'CALCULATE IN LIFE HOURS',
            iconName: 'Clock',
            body: "That €20 Uber Eats order? That's 2 hours of your net work. Always ask yourself: **'Is this burger worth 2h of my life?'**"
        },
        {
            id: 'substitution',
            title: 'THE SUBSTITUTION RULE',
            iconName: 'RefreshCw',
            body: "Don't deprive yourself, be smart. Starbucks coffee (€5) → Stylish thermos (€0.50). Uber (€15) → Podcast + Walk (€0)."
        }
    ]
};

// ===== EXPENSE CATEGORIES (Execution Screen - Target Selector) =====
// Using Lucide icon names for consistent, neutral styling
export const expenseCategories = [
    { id: 'coffee', iconName: 'Coffee', defaultAmount: 3 },
    { id: 'snack', iconName: 'Utensils', defaultAmount: 5 },
    { id: 'tobacco', iconName: 'Flame', defaultAmount: 12 },
    { id: 'uber', iconName: 'Car', defaultAmount: 20 },
    { id: 'bar', iconName: 'Beer', defaultAmount: 25 },
    { id: 'other', iconName: 'Plus', defaultAmount: 10 },
];

export const expenseCategoryLabels = {
    fr: {
        coffee: 'Café',
        snack: 'Snack',
        tobacco: 'Vape/Tabac',
        uber: 'Uber & Eats',
        bar: 'Bar/Party',
        other: 'Autre'
    },
    en: {
        coffee: 'Coffee',
        snack: 'Snack',
        tobacco: 'Vape/Tobacco',
        uber: 'Uber & Eats',
        bar: 'Bar/Party',
        other: 'Other'
    }
};

// ===== 5-YEAR EQUIVALENTS (Based on compound value) =====
export const get5YearEquivalent = (amount, locale = 'fr') => {
    const equivalents = {
        fr: [
            { maxAmount: 3000, icon: '🎧', text: 'Des AirPods Max' },
            { maxAmount: 6000, icon: '📱', text: 'Un iPhone Pro Max' },
            { maxAmount: 10000, icon: '🏍️', text: 'Un scooter électrique' },
            { maxAmount: 15000, icon: '⌚', text: 'Une Rolex Oyster' },
            { maxAmount: 25000, icon: '🚗', text: 'Une citadine neuve' },
            { maxAmount: 40000, icon: '🏠', text: "Apport pour un appart à 400k€" },
            { maxAmount: 60000, icon: '🏎️', text: "Une Tesla Model 3" },
            { maxAmount: 80000, icon: '💎', text: "Un an sabbatique" },
            { maxAmount: Infinity, icon: '🚀', text: "Liberté financière en vue" }
        ],
        en: [
            { maxAmount: 3000, icon: '🎧', text: 'AirPods Max' },
            { maxAmount: 6000, icon: '📱', text: 'An iPhone Pro Max' },
            { maxAmount: 10000, icon: '🏍️', text: 'An electric scooter' },
            { maxAmount: 15000, icon: '⌚', text: 'A Rolex Oyster' },
            { maxAmount: 25000, icon: '🚗', text: 'A new city car' },
            { maxAmount: 40000, icon: '🏠', text: 'Deposit for a €400k apartment' },
            { maxAmount: 60000, icon: '🏎️', text: 'A Tesla Model 3' },
            { maxAmount: 80000, icon: '💎', text: 'A sabbatical year' },
            { maxAmount: Infinity, icon: '🚀', text: 'Financial freedom in sight' }
        ]
    };

    const list = equivalents[locale] || equivalents.fr;
    const match = list.find(item => amount <= item.maxAmount);
    return match || list[list.length - 1];
};

// Keep old function for backwards compatibility
export const get10YearEquivalent = get5YearEquivalent;

// ===== COMPOUND INTEREST PROJECTION =====
export const calculateCompoundGrowth = (dailyAmount, years = 5, rate = 0.07) => {
    // Convert daily to monthly (× 30)
    const monthlyAmount = dailyAmount * 30;
    const monthlyRate = rate / 12;
    const months = years * 12;
    const fv = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return Math.round(fv);
};

// ===== PROJECTION CALCULATIONS =====
export const calculateProjections = (dailyAmount, years = 5, rate = 0.07) => {
    const monthly = dailyAmount * 30;
    const yearly = dailyAmount * 365;
    const fiveYear = calculateCompoundGrowth(dailyAmount, years, rate);

    return {
        daily: dailyAmount,
        monthly,
        yearly,
        tenYear: fiveYear, // Keep property name for compatibility
        equivalent: get5YearEquivalent(fiveYear)
    };
};

// ===== CONCRETE IMPACT (Debrief Screen) =====
export const getConcreteImpact = (yearlyAmount, locale = 'fr') => {
    const impacts = {
        fr: [
            {
                maxAmount: 500,
                icon: '☕',
                text: "C'est **{value} cafés** premium gratuits par an.",
                compute: (amt) => ({ value: Math.floor(amt / 5) })
            },
            {
                maxAmount: 1000,
                icon: '🎧',
                text: "C'est des **AirPods Pro** tous les 6 mois.",
                compute: () => ({})
            },
            {
                maxAmount: 2000,
                icon: '✈️',
                text: "C'est **un voyage en Europe** chaque année.",
                compute: () => ({})
            },
            {
                maxAmount: 3500,
                icon: '💻',
                text: "C'est un **MacBook Air** par an.",
                compute: () => ({})
            },
            {
                maxAmount: 5000,
                icon: '📈',
                text: "C'est **{value} actions Apple** par an.",
                compute: (amt) => ({ value: Math.floor(amt / 180) })
            },
            {
                maxAmount: Infinity,
                icon: '🚀',
                text: "C'est un **investissement majeur** annuel.",
                compute: () => ({})
            }
        ],
        en: [
            {
                maxAmount: 500,
                icon: '☕',
                text: "That's **{value} premium coffees** free per year.",
                compute: (amt) => ({ value: Math.floor(amt / 5) })
            },
            {
                maxAmount: 1000,
                icon: '🎧',
                text: "That's **AirPods Pro** every 6 months.",
                compute: () => ({})
            },
            {
                maxAmount: 2000,
                icon: '✈️',
                text: "That's **a trip to Europe** every year.",
                compute: () => ({})
            },
            {
                maxAmount: 3500,
                icon: '💻',
                text: "That's a **MacBook Air** per year.",
                compute: () => ({})
            },
            {
                maxAmount: 5000,
                icon: '📈',
                text: "That's **{value} Apple shares** per year.",
                compute: (amt) => ({ value: Math.floor(amt / 180) })
            },
            {
                maxAmount: Infinity,
                icon: '🚀',
                text: "That's a **major investment** each year.",
                compute: () => ({})
            }
        ]
    };

    const list = impacts[locale] || impacts.fr;
    const match = list.find(item => yearlyAmount <= item.maxAmount);

    if (!match) return { icon: '💰', text: '' };

    // Compute dynamic values
    const computed = match.compute(yearlyAmount);
    let finalText = match.text;

    // Replace placeholders
    Object.entries(computed).forEach(([key, value]) => {
        finalText = finalText.replace(`{${key}}`, value);
    });

    return { icon: match.icon, text: finalText };
};

export default {
    socialProofSlides,
    proTips,
    expenseCategories,
    expenseCategoryLabels,
    get10YearEquivalent,
    calculateCompoundGrowth,
    calculateProjections,
    getConcreteImpact
};
