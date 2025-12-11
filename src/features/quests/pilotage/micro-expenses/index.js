/**
 * Micro Expenses Quest - Moniyo Protocol
 * 
 * Quest 02: TRAQUE INVISIBLE
 * 3-Phase Quest Flow:
 * - PROTOCOL: Briefing + Tactics
 * - EXECUTION: "L'Amplificateur Temporel" Calculator
 * - DEBRIEF: Celebration + Rewards
 */

// Main flow component
export { default as MicroExpensesFlow } from './MicroExpensesFlow';

// Individual screens (for direct use if needed)
export { default as ProtocolScreen } from './screens/ProtocolScreen';
export { default as ExecutionScreen } from './screens/ExecutionScreen';
export { default as DebriefScreen } from './screens/DebriefScreen';

// Quest metadata and core config
export { default as microExpensesQuest } from './metadata';

// Insight data for stats and lifestyle comparisons
export {
    socialProofSlides,
    proTips,
    expenseCategories,
    expenseCategoryLabels,
    get10YearEquivalent,
    calculateCompoundGrowth,
    calculateProjections,
    getConcreteImpact
} from './insightData';
