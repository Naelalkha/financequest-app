/**
 * Insight Data - Statistics & Facts for Micro Expenses Quest
 * 
 * Quest 02: L'EFFET CUMULÉ (anciennement TRAQUE INVISIBLE)
 * Enriched data for social proof, tactics, and calculations
 * 
 * NOUVELLE LOGIQUE: Prix Unitaire x Fréquence (au lieu de montant/jour)
 */

// ===== FREQUENCY OPTIONS (Execution Screen) =====
export const frequencyOptions = [
    { id: 'daily', timesPerWeek: 7, labelKey: 'daily' },
    { id: 'weekdays', timesPerWeek: 5, labelKey: 'weekdays' },
    { id: '3x', timesPerWeek: 3, labelKey: '3x' },
    { id: '2x', timesPerWeek: 2, labelKey: '2x' },
    { id: '1x', timesPerWeek: 1, labelKey: '1x' },
];

export const frequencyLabels = {
    fr: {
        daily: 'Tous les jours',
        weekdays: 'En semaine (5j)',
        '3x': '3x / semaine',
        '2x': 'Week-end (2j)',
        '1x': '1x / semaine',
    },
    en: {
        daily: 'Every day',
        weekdays: 'Weekdays (5d)',
        '3x': '3x / week',
        '2x': 'Weekend (2d)',
        '1x': 'Occasional (1x)',
    }
};

// ===== SOCIAL PROOF CAROUSEL (Protocol Screen) =====
export const socialProofSlides = {
    fr: [
        {
            id: 'volume',
            title: 'FUITE MENSUELLE',
            badge: 'VOLUME',
            badgeColor: 'amber',
            stat: '72€',
            text: "dépensés en moyenne par mois en livraison et café. Soit 864€/an en autopilote.",
            source: 'Republik Retail 2024'
        },
        {
            id: 'latte-factor',
            title: 'LE LATTE FACTOR',
            badge: 'IMPACT',
            badgeColor: 'orange',
            stat: '170 000€',
            text: "5€/jour investis à 7%/an pendant 30 ans. C'est le \"Latte Factor\" — le vrai prix de tes cafés.",
            source: 'David Bach'
        },
        {
            id: 'blindspot',
            title: 'ANGLE MORT',
            badge: 'FRÉQUENCE',
            badgeColor: 'red',
            stat: '1 sur 4',
            text: "des Français n'a pas d'idée précise de ses dépenses mensuelles. Les petits montants passent sous le radar.",
            source: 'Étude Banque de France'
        }
    ],
    en: [
        {
            id: 'volume',
            title: 'MONTHLY LEAK',
            badge: 'VOLUME',
            badgeColor: 'amber',
            stat: '€72',
            text: "spent on average per month on delivery and coffee. That's €864/year on autopilot.",
            source: 'Republik Retail 2024'
        },
        {
            id: 'latte-factor',
            title: 'THE LATTE FACTOR',
            badge: 'IMPACT',
            badgeColor: 'orange',
            stat: '€170,000',
            text: "€5/day invested at 7%/year for 30 years. That's the \"Latte Factor\" — the real cost of your coffees.",
            source: 'David Bach'
        },
        {
            id: 'blindspot',
            title: 'BLIND SPOT',
            badge: 'FREQUENCY',
            badgeColor: 'red',
            stat: '1 in 4',
            text: "French people have no clear idea of their monthly expenses. Small amounts fly under the radar.",
            source: 'Banque de France Study'
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
            title: 'CALCULE EN HEURES DE VIE',
            iconName: 'Clock',
            body: "Ce menu Uber Eats à 20€ ? C'est 2 heures de ton travail net. Demande-toi toujours : **'Est-ce que ce burger vaut 2h de ma vie ?'**"
        },
        {
            id: 'substitution',
            title: 'SUBSTITUE MALIN',
            iconName: 'RefreshCw',
            body: "Ne te prive pas, sois malin. Café Starbuck (5€) → Thermos maison (0.50€). Livraison repas (15€) → Cuisine maison (5€)."
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
            title: 'SMART SUBSTITUTE',
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
        uber: 'Uber Eats',
        bar: 'Bar/Party',
        other: 'Autre'
    },
    en: {
        coffee: 'Coffee',
        snack: 'Snack',
        tobacco: 'Vape/Tobacco',
        uber: 'Uber Eats',
        bar: 'Bar/Party',
        other: 'Other'
    }
};

// ===== YEARLY EQUIVALENTS (Concrete tangible rewards) =====
export const getYearlyEquivalent = (yearlyAmount, locale = 'fr') => {
    const equivalents = {
        fr: [
            { maxAmount: 150, icon: '🎧', text: 'Des écouteurs sans fil' },
            { maxAmount: 300, icon: '🎧', text: 'Une paire d\'AirPods Pro' },
            { maxAmount: 500, icon: '🎮', text: 'Une Nintendo Switch' },
            { maxAmount: 800, icon: '👟', text: 'Des sneakers de luxe' },
            { maxAmount: 1200, icon: '📱', text: 'Un iPhone 14' },
            { maxAmount: 1800, icon: '✈️', text: 'Un aller-retour New York' },
            { maxAmount: 2500, icon: '💻', text: 'Un MacBook Air' },
            { maxAmount: 4000, icon: '🛵', text: 'Un scooter Vespa' },
            { maxAmount: 6000, icon: '🏝️', text: 'Un mois de vacances' },
            { maxAmount: Infinity, icon: '🚀', text: 'Un investissement majeur' }
        ],
        en: [
            { maxAmount: 150, icon: '🎧', text: 'Wireless earbuds' },
            { maxAmount: 300, icon: '🎧', text: 'AirPods Pro' },
            { maxAmount: 500, icon: '🎮', text: 'A Nintendo Switch' },
            { maxAmount: 800, icon: '👟', text: 'Designer sneakers' },
            { maxAmount: 1200, icon: '📱', text: 'An iPhone 14' },
            { maxAmount: 1800, icon: '✈️', text: 'A round-trip to New York' },
            { maxAmount: 2500, icon: '💻', text: 'A MacBook Air' },
            { maxAmount: 4000, icon: '🛵', text: 'A Vespa scooter' },
            { maxAmount: 6000, icon: '🏝️', text: 'A month of vacation' },
            { maxAmount: Infinity, icon: '🚀', text: 'A major investment' }
        ]
    };

    const list = equivalents[locale] || equivalents.fr;
    const match = list.find(item => yearlyAmount <= item.maxAmount);
    return match || list[list.length - 1];
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

// ===== ACTION LEVELS =====
// NOTE: The authoritative action level config is now in ExecutionScreen.jsx (actionConfig)
// This legacy data is kept for reference but multipliers here are DIFFERENT (they represent
// the % of expense KEPT, not the % SAVED). Use ExecutionScreen.actionConfig for calculations.
// 
// ExecutionScreen.actionConfig multipliers (% SAVED):
// - optimizer: 0.25 (save 25%)
// - strategist: 0.5 (save 50%)  
// - radical: 1 (save 100%)
export const actionLevels = {
    fr: [
        {
            id: 'optimizer',
            level: 'Facile',
            title: 'L\'OPTIMISATEUR',
            description: 'Réduire la fréquence',
            icon: '🎯'
        },
        {
            id: 'strategist',
            level: 'Moyen',
            title: 'LE STRATÈGE',
            description: 'Changer la méthode',
            icon: '🧠'
        },
        {
            id: 'radical',
            level: 'Difficile',
            title: 'LE RADICAL',
            description: 'Arrêter complètement',
            icon: '⚡'
        }
    ],
    en: [
        {
            id: 'optimizer',
            level: 'Easy',
            title: 'THE OPTIMIZER',
            description: 'Reduce frequency',
            icon: '🎯'
        },
        {
            id: 'strategist',
            level: 'Medium',
            title: 'THE STRATEGIST',
            description: 'Change the method',
            icon: '🧠'
        },
        {
            id: 'radical',
            level: 'Hard',
            title: 'THE RADICAL',
            description: 'Stop completely',
            icon: '⚡'
        }
    ]
};

// ===== COMPOUND INTEREST PROJECTION =====
export const calculateCompoundGrowth = (monthlyAmount, years = 5, rate = 0.07) => {
    const monthlyRate = rate / 12;
    const months = years * 12;
    const fv = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return Math.round(fv);
};

// ===== NEW: PROJECTION WITH FREQUENCY =====
/**
 * Calculate projections based on unit price × frequency
 * @param {number} unitPrice - Price per item (e.g., 3.50€ for a coffee)
 * @param {number} timesPerWeek - How many times per week (1-7)
 * @param {number} years - Years for compound projection (default 5)
 * @param {number} rate - Annual return rate (default 7%)
 * @param {string} locale - Locale for equivalents (default 'fr')
 */
export const calculateProjectionsWithFrequency = (unitPrice, timesPerWeek, years = 5, rate = 0.07, locale = 'fr') => {
    // Weekly cost
    const weekly = unitPrice * timesPerWeek;
    // Monthly cost (4.33 weeks per month on average)
    const monthly = Math.round(weekly * 4.33);
    // Yearly cost (52 weeks)
    const yearly = Math.round(weekly * 52);
    // 5-year compound projection
    const fiveYear = calculateCompoundGrowth(monthly, years, rate);

    return {
        unitPrice,
        timesPerWeek,
        weekly,
        monthly,
        yearly,
        fiveYear,
        // Yearly equivalent (tangible reward)
        yearlyEquivalent: getYearlyEquivalent(yearly, locale),
        // 5-year equivalent (bigger dreams)
        fiveYearEquivalent: get5YearEquivalent(fiveYear, locale)
    };
};

// ===== LEGACY: PROJECTION CALCULATIONS (for backwards compatibility) =====
export const calculateProjections = (dailyAmount, years = 5, rate = 0.07) => {
    const monthly = dailyAmount * 30;
    const yearly = dailyAmount * 365;
    const fiveYear = calculateCompoundGrowth(monthly, years, rate);

    return {
        daily: dailyAmount,
        monthly,
        yearly,
        tenYear: fiveYear, // Keep property name for compatibility
        equivalent: get5YearEquivalent(fiveYear)
    };
};

/**
 * @deprecated Use actionConfig in ExecutionScreen.jsx instead.
 * This function uses outdated multiplier logic and is kept only for backwards compatibility.
 * The authoritative savings calculation is: yearlySavings = projections.yearly * actionConfig.multiplier
 */
export const calculateActionLevelSavings = (monthlyAmount, locale = 'fr') => {
    console.warn('calculateActionLevelSavings is deprecated. Use actionConfig in ExecutionScreen.jsx');
    const levels = actionLevels[locale] || actionLevels.fr;

    // Simplified version - just return level info without calculations
    return levels.map(level => ({
        ...level,
        savings: 0,
        yearlySavings: 0,
        newMonthly: monthlyAmount
    }));
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
    frequencyOptions,
    frequencyLabels,
    actionLevels,
    getYearlyEquivalent,
    get5YearEquivalent,
    get10YearEquivalent,
    calculateCompoundGrowth,
    calculateProjections,
    calculateProjectionsWithFrequency,
    calculateActionLevelSavings,
    getConcreteImpact
};
