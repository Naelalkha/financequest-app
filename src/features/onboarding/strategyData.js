/**
 * 🎯 Strategic Archetypes Data
 * 
 * Defines the three financial strategy vectors for onboarding calibration.
 * Each strategy represents a different approach to financial optimization.
 */

import { ShieldOff, Zap, TrendingUp } from 'lucide-react';

/**
 * Calculate compound interest for 10 years at 7% annual return
 * @param {number} monthlyAmount - Monthly contribution
 * @returns {number} - Total value after 10 years
 */
const calculateCompoundGrowth = (monthlyAmount) => {
    const annualRate = 0.07;
    const years = 10;
    const monthlyRate = annualRate / 12;
    const months = years * 12;

    // Future Value of Annuity formula: PMT × ((1 + r)^n - 1) / r
    const futureValue = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return Math.round(futureValue);
};

/**
 * Strategic archetypes for financial optimization
 */
export const STRATEGIES = [
    {
        id: 'defense',
        title: "STOPPER L'HÉMORRAGIE",
        subtitle: 'Optimisation des charges fixes & variables.',
        icon: ShieldOff,
        impactMonthly: 150,
        impactAnnual: 1800,
        impact10Years: calculateCompoundGrowth(150), // ~26,000€
        color: '#EF4444', // Red for defense/stopping
        gradient: 'from-red-500/20 to-red-900/5',
        concreteBenefit: "Un apport immobilier ou une voiture neuve tous les 5 ans.",
    },
    {
        id: 'offense',
        title: 'RÉVEILLER LE CAPITAL',
        subtitle: "Activation de l'épargne dormante.",
        icon: Zap,
        impactMonthly: 250,
        impactAnnual: 3000,
        impact10Years: calculateCompoundGrowth(250), // ~43,000€
        color: '#E2FF00', // Neon Yellow (brand)
        gradient: 'from-[#E2FF00]/20 to-[#E2FF00]/5',
        concreteBenefit: "3 mois de loyer payés par tes intérêts chaque année.",
    },
    {
        id: 'expansion',
        title: 'MAXIMISER LES REVENUS',
        subtitle: 'Carrière, Négociation & Side Business.',
        icon: TrendingUp,
        impactMonthly: 300,
        impactAnnual: 3600,
        impact10Years: calculateCompoundGrowth(300), // ~52,000€
        color: '#22C55E', // Green for growth
        gradient: 'from-emerald-500/20 to-emerald-900/5',
        concreteBenefit: "2 années de liberté totale. Tu ne dépends plus d'un seul patron.",
    },
];

/**
 * Get strategy by ID
 * @param {string} id - Strategy ID
 * @returns {object|undefined} - Strategy object
 */
export const getStrategyById = (id) => STRATEGIES.find((s) => s.id === id);

/**
 * Format currency for display
 * @param {number} value - Numeric value
 * @returns {string} - Formatted string with spaces
 */
export const formatCurrency = (value) => {
    return value.toLocaleString('fr-FR').replace(/,/g, ' ');
};

export default STRATEGIES;
