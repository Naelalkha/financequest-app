/**
 * Budget 50/30/20 Quest - Moniyo Protocol
 *
 * 3-Phase Quest Flow:
 * - PROTOCOL: Context + Method
 * - EXECUTION: Income Input + Budget Split + Diagnosis
 * - DEBRIEF: Impact + Rewards
 */

// Main flow component
export { default as Budget503020Flow } from './Budget503020Flow';

// Individual screens (for direct use if needed)
export { default as ProtocolScreen } from './screens/ProtocolScreen';
export { default as ExecutionScreen } from './screens/ExecutionScreen';
export { default as DebriefScreen } from './screens/DebriefScreen';

// Quest metadata and core config
export { default as budget503020Quest } from './metadata';

// Insight data for stats and calculations
export {
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
    get5YearEquivalent
} from './insightData';
