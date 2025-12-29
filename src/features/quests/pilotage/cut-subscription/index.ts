/**
 * Cut Subscription Quest - Moniyo Protocol
 * 
 * 3-Phase Quest Flow:
 * - PROTOCOL: Briefing + Tactics
 * - EXECUTION: Target Selection + Amount
 * - DEBRIEF: Celebration + Rewards
 */

// Main flow component
export { default as CutSubscriptionFlow } from './CutSubscriptionFlow';

// Individual screens (for direct use if needed)
export { default as ProtocolScreen } from './screens/ProtocolScreen';
export { default as ExecutionScreen } from './screens/ExecutionScreen';
export { default as DebriefScreen } from './screens/DebriefScreen';

// Quest metadata and core config
export { default as cutSubscriptionQuest } from './metadata';

// Insight data for stats and lifestyle comparisons
export {
    socialProofSlides,
    proTips,
    realityCheckPills,
    getConcreteImpact,
    calculateCompoundGrowth
} from './insightData';
