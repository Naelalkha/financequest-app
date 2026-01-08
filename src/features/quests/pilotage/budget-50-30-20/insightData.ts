/**
 * Insight Data - Statistics & Facts for Budget 50/30/20 Quest
 *
 * Quest: BUDGET 50/30/20
 * "Installe le système de répartition des millionnaires"
 *
 * Data for social proof, tactics, and calculations
 */

// ===== BUDGET PERCENTAGES (Fixed 50/30/20) =====
export const BUDGET_SPLIT = {
    needs: 0.5,      // 50% - Besoins (loyer, courses, transport, factures)
    wants: 0.3,      // 30% - Envies (shopping, loisirs)
    savings: 0.2     // 20% - Épargne/Investissement
};

// ===== SOCIAL PROOF CAROUSEL (Protocol Screen) =====
export const socialProofSlides = {
    fr: [
        {
            id: 'blind-spot',
            title: 'ANGLE MORT',
            badge: 'RÉALITÉ',
            badgeColor: 'amber',
            stat: '60%',
            text: "des Français ont une vision floue de leurs dépenses mensuelles.",
            source: 'Étude Banque de France 2023'
        },
        {
            id: 'wealth-gap',
            title: 'L\'EFFET BOULE DE NEIGE',
            badge: 'IMPACT',
            badgeColor: 'emerald',
            stat: '3x',
            text: "plus de capital à 40 ans en épargnant 50€/mois régulièrement.",
            source: 'INSEE Patrimoine 2023'
        },
        {
            id: 'millionaire-rule',
            title: 'LA RÈGLE D\'OR',
            badge: 'MÉTHODE',
            badgeColor: 'volt',
            stat: '50/30/20',
            text: "Le ratio de répartition le plus simple. Besoins. Envies. Épargne.",
            source: 'The Millionaire Next Door'
        }
    ],
    en: [
        {
            id: 'blind-spot',
            title: 'BLIND SPOT',
            badge: 'REALITY',
            badgeColor: 'amber',
            stat: '60%',
            text: "of French people have a blurry vision of their monthly expenses.",
            source: 'Banque de France Study 2023'
        },
        {
            id: 'wealth-gap',
            title: 'THE SNOWBALL EFFECT',
            badge: 'IMPACT',
            badgeColor: 'emerald',
            stat: '3x',
            text: "more capital at 40 by saving 50€/month regularly.",
            source: 'INSEE Wealth 2023'
        },
        {
            id: 'millionaire-rule',
            title: 'THE GOLDEN RULE',
            badge: 'METHOD',
            badgeColor: 'volt',
            stat: '50/30/20',
            text: "The simplest allocation ratio. Needs. Wants. Savings.",
            source: 'The Millionaire Next Door'
        }
    ]
};

// ===== PRO TIPS / TACTICS (Protocol Screen) =====
export const proTips = {
    fr: [
        {
            id: 'identify',
            title: 'SCANNE TES FLUX',
            iconName: 'Wallet',
            body: "Note ton revenu net mensuel (après impôts). C'est ta base de calcul. **Un seul chiffre** suffit pour commencer."
        },
        {
            id: 'apply',
            title: 'APPLIQUE LE RATIO',
            iconName: 'Calculator',
            body: "Divise automatiquement : **50% besoins**, **30% envies**, **20% épargne**. Pas de négociation. C'est la règle."
        },
        {
            id: 'compare',
            title: 'DIAGNOSTIQUE L\'ÉCART',
            iconName: 'Target',
            body: "Où en es-tu vraiment ? L'écart entre l'idéal et le réel te montre **où agir en priorité**."
        }
    ],
    en: [
        {
            id: 'identify',
            title: 'SCAN YOUR FLOWS',
            iconName: 'Wallet',
            body: "Note your net monthly income (after taxes). That's your calculation base. **One number** is all you need to start."
        },
        {
            id: 'apply',
            title: 'APPLY THE RATIO',
            iconName: 'Calculator',
            body: "Divide automatically: **50% needs**, **30% wants**, **20% savings**. No negotiation. It's the rule."
        },
        {
            id: 'compare',
            title: 'DIAGNOSE THE GAP',
            iconName: 'Target',
            body: "Where are you really? The gap between ideal and real shows you **where to act first**."
        }
    ]
};

// ===== ENVELOPE CATEGORIES =====
export const envelopeCategories = {
    needs: {
        id: 'needs',
        percentage: 50,
        iconName: 'Home',
        colorClass: 'text-blue-400',
        bgClass: 'bg-blue-500/20'
    },
    wants: {
        id: 'wants',
        percentage: 30,
        iconName: 'Heart',
        colorClass: 'text-pink-400',
        bgClass: 'bg-pink-500/20'
    },
    savings: {
        id: 'savings',
        percentage: 20,
        iconName: 'PiggyBank',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/20'
    }
};

export const envelopeLabels = {
    fr: {
        needs: 'BESOINS',
        wants: 'ENVIES',
        savings: 'ÉPARGNE'
    },
    en: {
        needs: 'NEEDS',
        wants: 'WANTS',
        savings: 'SAVINGS'
    }
};

// ===== BUDGET CALCULATION =====
export interface BudgetSplit {
    needs: number;
    wants: number;
    savings: number;
    total: number;
}

/**
 * Calculate the ideal budget split based on income
 */
export const calculateBudgetSplit = (monthlyIncome: number): BudgetSplit => {
    return {
        needs: Math.round(monthlyIncome * BUDGET_SPLIT.needs),
        wants: Math.round(monthlyIncome * BUDGET_SPLIT.wants),
        savings: Math.round(monthlyIncome * BUDGET_SPLIT.savings),
        total: monthlyIncome
    };
};

/**
 * Calculate annual savings based on monthly savings
 */
export const calculateAnnualSavings = (monthlySavings: number): number => {
    return monthlySavings * 12;
};

// ===== COMPOUND INTEREST PROJECTION =====
/**
 * Calculate compound growth over years
 * @param monthlyAmount - Monthly investment amount
 * @param years - Number of years (default 5)
 * @param rate - Annual return rate (default 7%)
 */
export const calculateCompoundGrowth = (monthlyAmount: number, years: number = 5, rate: number = 0.07): number => {
    const monthlyRate = rate / 12;
    const months = years * 12;
    const fv = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return Math.round(fv);
};

// ===== DIAGNOSIS SYSTEM =====
export type DiagnosisStatus = 'balanced' | 'warning' | 'critical';

export interface CategoryDiagnosis {
    category: string;
    ideal: number;
    actual: number;
    delta: number;
    deltaPercent: number;
    status: DiagnosisStatus;
}

/**
 * Get diagnosis for a single category
 */
export const getCategoryDiagnosis = (
    category: string,
    ideal: number,
    actual: number
): CategoryDiagnosis => {
    const delta = actual - ideal;
    const deltaPercent = ideal > 0 ? Math.round((delta / ideal) * 100) : 0;

    let status: DiagnosisStatus = 'balanced';

    if (category === 'savings') {
        // For savings: below ideal is bad
        if (deltaPercent < -20) status = 'critical';
        else if (deltaPercent < -10) status = 'warning';
    } else {
        // For needs/wants: above ideal is bad
        if (deltaPercent > 20) status = 'critical';
        else if (deltaPercent > 10) status = 'warning';
    }

    return {
        category,
        ideal,
        actual,
        delta,
        deltaPercent,
        status
    };
};

/**
 * Get full budget diagnosis
 */
export const getBudgetDiagnosis = (
    idealBudget: BudgetSplit,
    actualBudget: { needs: number; wants: number; savings: number }
): CategoryDiagnosis[] => {
    return [
        getCategoryDiagnosis('needs', idealBudget.needs, actualBudget.needs),
        getCategoryDiagnosis('wants', idealBudget.wants, actualBudget.wants),
        getCategoryDiagnosis('savings', idealBudget.savings, actualBudget.savings)
    ];
};

// ===== CONCRETE IMPACT =====
export const getConcreteImpact = (yearlySavings: number, locale: string = 'fr') => {
    const impacts = {
        fr: [
            {
                maxAmount: 600,
                icon: '✈️',
                iconName: 'Plane',
                text: "C'est **un weekend city-trip** chaque année."
            },
            {
                maxAmount: 1200,
                icon: '📱',
                iconName: 'Smartphone',
                text: "C'est **un iPhone dernier cri** par an."
            },
            {
                maxAmount: 2400,
                icon: '🏝️',
                iconName: 'Palmtree',
                text: "C'est **une semaine de vacances** chaque année."
            },
            {
                maxAmount: 6000,
                icon: '🏠',
                iconName: 'Home',
                text: "C'est **un apport pour un investissement**."
            },
            {
                maxAmount: Infinity,
                icon: '🚀',
                iconName: 'Rocket',
                text: "C'est **la liberté financière à portée**."
            }
        ],
        en: [
            {
                maxAmount: 600,
                icon: '✈️',
                iconName: 'Plane',
                text: "That's **a city-trip weekend** every year."
            },
            {
                maxAmount: 1200,
                icon: '📱',
                iconName: 'Smartphone',
                text: "That's **the latest iPhone** every year."
            },
            {
                maxAmount: 2400,
                icon: '🏝️',
                iconName: 'Palmtree',
                text: "That's **a week of vacation** every year."
            },
            {
                maxAmount: 6000,
                icon: '🏠',
                iconName: 'Home',
                text: "That's **a deposit for an investment**."
            },
            {
                maxAmount: Infinity,
                icon: '🚀',
                iconName: 'Rocket',
                text: "That's **financial freedom within reach**."
            }
        ]
    };

    const list = impacts[locale] || impacts.fr;
    const match = list.find(item => yearlySavings <= item.maxAmount);
    return match || list[list.length - 1];
};

// ===== 5-YEAR EQUIVALENTS =====
export const get5YearEquivalent = (amount: number, locale: string = 'fr') => {
    const equivalents = {
        fr: [
            { maxAmount: 5000, icon: '📱', text: "Un iPhone Pro Max" },
            { maxAmount: 10000, icon: '🏍️', text: "Un scooter électrique" },
            { maxAmount: 20000, icon: '🚗', text: "Une citadine neuve" },
            { maxAmount: 40000, icon: '🏠', text: "Apport pour un appart" },
            { maxAmount: 60000, icon: '🏎️', text: "Une Tesla Model 3" },
            { maxAmount: Infinity, icon: '💎', text: "Liberté financière" }
        ],
        en: [
            { maxAmount: 5000, icon: '📱', text: "An iPhone Pro Max" },
            { maxAmount: 10000, icon: '🏍️', text: "An electric scooter" },
            { maxAmount: 20000, icon: '🚗', text: "A new city car" },
            { maxAmount: 40000, icon: '🏠', text: "Apartment deposit" },
            { maxAmount: 60000, icon: '🏎️', text: "A Tesla Model 3" },
            { maxAmount: Infinity, icon: '💎', text: "Financial freedom" }
        ]
    };

    const list = equivalents[locale] || equivalents.fr;
    const match = list.find(item => amount <= item.maxAmount);
    return match || list[list.length - 1];
};

// ===== RECOVERY POTENTIAL (GAP CALCULATION) =====
/**
 * Calculate the recovery potential (gap between ideal and actual savings)
 * @param idealSavings - Ideal savings (20% of income)
 * @param actualSavings - Actual current savings
 * @returns Recovery potential (always >= 0)
 */
export const calculateRecoveryPotential = (
    idealSavings: number,
    actualSavings: number
): number => {
    const gap = idealSavings - actualSavings;
    return Math.max(0, gap);
};

/**
 * Check if user is already above target savings
 * @param actualSavings - Actual current savings
 * @param idealSavings - Ideal savings (20% of income)
 * @returns true if actual >= ideal
 */
export const isAboveTarget = (
    actualSavings: number,
    idealSavings: number
): boolean => {
    return actualSavings >= idealSavings;
};

// ===== DEFAULT EXPORT =====
export default {
    BUDGET_SPLIT,
    socialProofSlides,
    proTips,
    envelopeCategories,
    envelopeLabels,
    calculateBudgetSplit,
    calculateAnnualSavings,
    calculateCompoundGrowth,
    getCategoryDiagnosis,
    getBudgetDiagnosis,
    getConcreteImpact,
    get5YearEquivalent,
    calculateRecoveryPotential,
    isAboveTarget
};
