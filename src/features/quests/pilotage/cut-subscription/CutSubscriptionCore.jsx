import CutSubscriptionFlow from './CutSubscriptionFlow';
import { trackEvent } from '../../../../utils/analytics';

/**
 * CutSubscriptionCore - Quest Core Configuration
 * 
 * Now uses the new 3-phase Moniyo Protocol flow:
 * PHASE 1: PROTOCOL (Briefing + Tactics)
 * PHASE 2: EXECUTION (Target Selection + Amount)
 * PHASE 3: DEBRIEF (Celebration + Rewards)
 */

const QUEST_ID = 'cut-subscription';

// Validation function for the flow
const validateCutSubscription = (questData) => {
  if (!questData.serviceName) {
    return {
      valid: false,
      message: { fr: 'Sélectionne un abonnement', en: 'Select a subscription' }
    };
  }

  if (!questData.monthlyAmount || questData.monthlyAmount <= 0) {
    return {
      valid: false,
      message: { fr: 'Entre le montant mensuel', en: 'Enter the monthly amount' }
    };
  }

  return { valid: true };
};

// Export the new flow component as the core
export default {
  // ID de la quête
  questId: QUEST_ID,

  // The main flow component (replaces individual steps)
  FlowComponent: CutSubscriptionFlow,

  // Legacy steps array for backward compatibility
  // (The new flow handles everything internally)
  steps: [],

  // Validation
  validate: validateCutSubscription,

  // Completion config
  completionConfig: {
    title: {
      fr: 'Mission accomplie !',
      en: 'Mission accomplished!'
    },
    showImpactButton: true
  },

  // Impact config
  impactConfig: {
    getTitleKey: () => 'cutSubscription.title',
    appendServiceName: true,
    period: 'month',
    initialValues: {}
  },

  // Wrapper config
  wrapperConfig: {
    // No intro needed - the Protocol phase handles it
    showIntro: false,
    // Use full-screen flow mode
    useFlowMode: true
  },

  // Analytics tracking
  trackCompletion: (data) => {
    trackEvent('quest_completed', {
      quest_id: QUEST_ID,
      service_name: data.serviceName,
      monthly_amount: data.monthlyAmount,
      annual_impact: data.annualAmount
    });
  }
};

// Also export the flow component directly
export { default as CutSubscriptionFlow } from './CutSubscriptionFlow';
