/**
 * 🎯 Onboarding Store
 * Simple localStorage-based store to track onboarding completion
 * This persists even for anonymous users
 */

const ONBOARDING_KEY = 'moniyo-onboarding-completed';

export const onboardingStore = {
  /**
   * Check if user has completed onboarding
   */
  hasCompletedOnboarding: () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  },

  /**
   * Mark onboarding as completed
   */
  completeOnboarding: () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ONBOARDING_KEY, 'true');
  },

  /**
   * Reset onboarding (for testing/debugging)
   */
  resetOnboarding: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ONBOARDING_KEY);
  },
};

export default onboardingStore;
