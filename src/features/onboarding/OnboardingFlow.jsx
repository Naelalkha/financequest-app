/**
 * 🎮 OnboardingFlow - Main Onboarding Orchestrator
 * 
 * Manages the flow through all 4 onboarding screens + transition:
 * 1. InitScreen - "SYSTEM ONLINE" (Hook)
 * 2. TutorialScreen - "CIBLER. ÉLIMINER." (Interactive mini-tuto)
 * 3. RanksScreen - "MONTE EN GRADE" (Gamification promise)
 * 4. NotificationsScreen - "CANAL SÉCURISÉ" (Permissions)
 * 5. TransitionScreen - Warp animation to Dashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { onboardingStore, ONBOARDING_STEPS } from './onboardingStore';
import {
  InitScreen,
  TutorialScreen,
  RanksScreen,
  NotificationsScreen,
  TransitionScreen,
} from './screens';

// Screen transition variants
const screenVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(ONBOARDING_STEPS.INIT);
  const [direction, setDirection] = useState(1);
  const [showTransition, setShowTransition] = useState(false);

  // Initialize onboarding state
  useEffect(() => {
    // If already completed, redirect to dashboard
    if (onboardingStore.hasCompletedOnboarding()) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Start fresh onboarding
    const state = onboardingStore.startOnboarding();
    setCurrentStep(state.currentStep);
  }, [navigate]);

  // Handle moving to next step
  const handleNext = useCallback(() => {
    setDirection(1);
    const state = onboardingStore.nextStep();
    setCurrentStep(state.currentStep);
  }, []);

  // Handle onboarding completion
  const handleComplete = useCallback(() => {
    // Mark as completed
    onboardingStore.completeOnboarding();
    
    // Show transition screen
    setShowTransition(true);
  }, []);

  // Handle transition complete - navigate to dashboard
  const handleTransitionComplete = useCallback(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  // Handle notifications step completion (final step before completion)
  const handleNotificationsComplete = useCallback((notificationsEnabled) => {
    onboardingStore.setNotificationsEnabled(notificationsEnabled);
    handleComplete();
  }, [handleComplete]);

  // Render current screen based on step
  const renderScreen = () => {
    // If showing transition, render that instead
    if (showTransition) {
      return <TransitionScreen onComplete={handleTransitionComplete} />;
    }

    switch (currentStep) {
      case ONBOARDING_STEPS.INIT:
        return <InitScreen onNext={handleNext} />;
      
      case ONBOARDING_STEPS.TUTORIAL:
        return <TutorialScreen onNext={handleNext} />;
      
      case ONBOARDING_STEPS.RANKS:
        return <RanksScreen onNext={handleNext} />;
      
      case ONBOARDING_STEPS.NOTIFICATIONS:
        return <NotificationsScreen onComplete={handleNotificationsComplete} />;
      
      case ONBOARDING_STEPS.COMPLETED:
        // Should have transitioned already, but fallback
        return <TransitionScreen onComplete={handleTransitionComplete} />;
      
      default:
        return <InitScreen onNext={handleNext} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={showTransition ? 'transition' : currentStep}
          custom={direction}
          variants={screenVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
