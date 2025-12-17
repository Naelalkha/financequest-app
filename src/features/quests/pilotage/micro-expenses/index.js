/**
 * Micro Expenses Quest - Moniyo Protocol
 * 
 * Quest 02: L'EFFET CUMULÉ (ex TRAQUE INVISIBLE)
 * 
 * 3-Phase Quest Flow:
 * - PROTOCOL: Briefing + Tactics (ProtocolScreen)
 * - EXECUTION: Calculator + Challenge Selection (ExecutionScreen)
 * - DEBRIEF: Celebration + Goal Confirmation (DebriefScreen)
 * 
 * Architecture:
 * - MicroExpensesFlow: Main controller, handles navigation & state
 * - screens/*: Individual phase components
 * - insightData.js: Static data (slides, categories, calculations)
 * - metadata.js: Quest metadata for catalog
 */

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORTS
// ═══════════════════════════════════════════════════════════════

// Main flow component (use this for quest integration)
export { default as MicroExpensesFlow } from './MicroExpensesFlow';

// Quest metadata for catalog/listing
export { default as microExpensesQuest } from './metadata';

// ═══════════════════════════════════════════════════════════════
// SCREENS (for advanced use cases only)
// ═══════════════════════════════════════════════════════════════

export { default as ProtocolScreen } from './screens/ProtocolScreen';
export { default as ExecutionScreen } from './screens/ExecutionScreen';
export { default as DebriefScreen } from './screens/DebriefScreen';

// ═══════════════════════════════════════════════════════════════
// DATA & UTILITIES
// ═══════════════════════════════════════════════════════════════

export {
    // Static content
    socialProofSlides,
    proTips,
    expenseCategories,
    expenseCategoryLabels,
    frequencyOptions,
    frequencyLabels,
    
    // Calculation utilities
    calculateCompoundGrowth,
    calculateProjectionsWithFrequency,
    get5YearEquivalent,
    getYearlyEquivalent,
    getConcreteImpact,
    
    // Legacy (deprecated)
    get10YearEquivalent,
    calculateProjections,
    calculateActionLevelSavings
} from './insightData';
