/**
 * 🎮 Onboarding Feature Index
 * Main exports for the onboarding module
 */

// Main flow component
export { default as OnboardingFlow } from './OnboardingFlow';

// Store and utilities
export { onboardingStore, ONBOARDING_STEPS } from './onboardingStore';

// Individual screens (for direct access if needed)
export {
  InitScreen,
  TutorialScreen,
  RanksScreen,
  NotificationsScreen,
  TransitionScreen,
} from './screens';

// Legacy placeholder (can be removed after full implementation)
export { default as PlaceholderOnboarding } from './PlaceholderOnboarding';
