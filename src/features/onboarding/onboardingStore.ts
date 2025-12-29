/**
 * 🎯 Onboarding Store - Refactored for new flow
 * Manages onboarding state, steps, and user preferences
 * Persists to localStorage for anonymous users
 * 
 * New Flow:
 * 1. SCAN - Hook émotionnel avec stats animées
 * 2. PAIN_POINT - Choix du problème principal
 * 3. COMPLETED - Dashboard avec spotlight
 */

const ONBOARDING_KEY = 'moniyo-onboarding';
const ONBOARDING_DATA_KEY = 'moniyo-onboarding-data';

// Onboarding steps - New "Hook & Choose" format
export const ONBOARDING_STEPS = {
  SCAN: 'scan',                           // Écran 1: LE SCAN (hook émotionnel)
  PAIN_POINT: 'pain-point',               // Écran 2: CHOIX DU PAIN POINT
  COMPLETED: 'completed'
};

// Pain point options mapping to quests
export const PAIN_POINT_MISSIONS = {
  subscriptions: 'cut-subscription',      // LA PURGE
  micro: 'micro-expenses',                // DÉTOX EXPRESS
  contracts: 'micro-expenses',            // RENÉGOCIATION (fallback)
  unknown: 'micro-expenses',              // LE DIAGNOSTIC (fallback)
};

const STEP_ORDER = [
  ONBOARDING_STEPS.SCAN,
  ONBOARDING_STEPS.PAIN_POINT,
  ONBOARDING_STEPS.COMPLETED
];

/**
 * Get default onboarding state
 */
const getDefaultState = () => ({
  currentStep: ONBOARDING_STEPS.SCAN,
  stepIndex: 0,
  completed: false,
  startedAt: null,
  completedAt: null,
  notificationsEnabled: false,
  selectedPainPoint: null,  // 'subscriptions' | 'micro' | 'contracts' | 'unknown'
  selectedMissionId: null,  // Quest ID based on pain point
});

/**
 * Load state from localStorage
 */
const loadState = () => {
  if (typeof window === 'undefined') return getDefaultState();

  try {
    const saved = localStorage.getItem(ONBOARDING_KEY);
    if (saved) {
      return { ...getDefaultState(), ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load onboarding state:', e);
  }

  return getDefaultState();
};

/**
 * Save state to localStorage
 */
const saveState = (state) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save onboarding state:', e);
  }
};

// In-memory state
let currentState = loadState();

export const onboardingStore = {
  /**
   * Get current state
   */
  getState: () => ({ ...currentState }),

  /**
   * Check if user has completed onboarding
   */
  hasCompletedOnboarding: () => {
    return currentState.completed;
  },

  /**
   * Get current step
   */
  getCurrentStep: () => currentState.currentStep,

  /**
   * Get current step index (0-based)
   */
  getStepIndex: () => currentState.stepIndex,

  /**
   * Get total steps count (excluding completed)
   */
  getTotalSteps: () => STEP_ORDER.length - 1,

  /**
   * Start onboarding
   */
  startOnboarding: () => {
    currentState = {
      ...getDefaultState(),
      startedAt: new Date().toISOString(),
    };
    saveState(currentState);
    return currentState;
  },

  /**
   * Go to next step
   */
  nextStep: () => {
    const currentIndex = STEP_ORDER.indexOf(currentState.currentStep);
    const nextIndex = Math.min(currentIndex + 1, STEP_ORDER.length - 1);
    const nextStep = STEP_ORDER[nextIndex];

    currentState = {
      ...currentState,
      currentStep: nextStep,
      stepIndex: nextIndex,
      completed: nextStep === ONBOARDING_STEPS.COMPLETED,
      completedAt: nextStep === ONBOARDING_STEPS.COMPLETED ? new Date().toISOString() : null,
    };

    saveState(currentState);
    return currentState;
  },

  /**
   * Go to previous step
   */
  prevStep: () => {
    const currentIndex = STEP_ORDER.indexOf(currentState.currentStep);
    const prevIndex = Math.max(currentIndex - 1, 0);

    currentState = {
      ...currentState,
      currentStep: STEP_ORDER[prevIndex],
      stepIndex: prevIndex,
    };

    saveState(currentState);
    return currentState;
  },

  /**
   * Go to specific step
   */
  goToStep: (step) => {
    const stepIndex = STEP_ORDER.indexOf(step);
    if (stepIndex === -1) return currentState;

    currentState = {
      ...currentState,
      currentStep: step,
      stepIndex,
    };

    saveState(currentState);
    return currentState;
  },

  /**
   * Mark onboarding as completed
   */
  completeOnboarding: () => {
    currentState = {
      ...currentState,
      currentStep: ONBOARDING_STEPS.COMPLETED,
      stepIndex: STEP_ORDER.length - 1,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    saveState(currentState);
    return currentState;
  },

  /**
   * Set notifications preference
   */
  setNotificationsEnabled: (enabled) => {
    currentState = {
      ...currentState,
      notificationsEnabled: enabled,
    };
    saveState(currentState);
    return currentState;
  },

  /**
   * Set selected pain point and corresponding mission
   */
  setSelectedPainPoint: (painPoint) => {
    const missionId = PAIN_POINT_MISSIONS[painPoint] || 'micro-expenses';
    currentState = {
      ...currentState,
      selectedPainPoint: painPoint,
      selectedMissionId: missionId,
    };
    saveState(currentState);
    return currentState;
  },

  /**
   * Get selected mission ID based on pain point
   */
  getSelectedMissionId: () => {
    return currentState.selectedMissionId || 'micro-expenses';
  },

  /**
   * Get selected pain point
   */
  getSelectedPainPoint: () => {
    return currentState.selectedPainPoint;
  },

  /**
   * Reset onboarding (for testing/debugging)
   */
  resetOnboarding: () => {
    currentState = getDefaultState();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ONBOARDING_KEY);
      localStorage.removeItem(ONBOARDING_DATA_KEY);
    }
    return currentState;
  },

  /**
   * Check if can go back
   */
  canGoBack: () => {
    return currentState.stepIndex > 0 && !currentState.completed;
  },

  /**
   * Check if on last step before completion
   */
  isLastStep: () => {
    return currentState.currentStep === ONBOARDING_STEPS.PAIN_POINT;
  },
};

export default onboardingStore;
