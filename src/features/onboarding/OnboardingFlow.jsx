/**
 * 🎮 OnboardingFlow - Main Onboarding Orchestrator
 * 
 * New "Hook & Choose" format - 2 screens:
 * 1. ScanScreen - "LE SCAN" (Hook émotionnel)
 * 2. PainPointScreen - "LE CHOIX" (Personnalisation)
 * → Then navigate to Dashboard with spotlight
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useBackground } from '../../contexts/BackgroundContext';
import { onboardingStore, ONBOARDING_STEPS } from './onboardingStore';
import {
  ScanScreen,
  PainPointScreen,
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
  const [currentStep, setCurrentStep] = useState(ONBOARDING_STEPS.SCAN);
  const [direction, setDirection] = useState(1);

  // Use background context to set theme
  const { setBackgroundMode } = useBackground();

  useEffect(() => {
    // Use macro background with subtle blur and increased pattern opacity for onboarding
    setBackgroundMode('macro', { blur: true, blurAmount: 1, patternOpacity: 0.1 });
    return () => setBackgroundMode('macro');
  }, [setBackgroundMode]);

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

    // If completed, navigate to dashboard with firstRun flag
    if (state.currentStep === ONBOARDING_STEPS.COMPLETED) {
      onboardingStore.completeOnboarding();
      navigate('/dashboard?firstRun=true', { replace: true });
      return;
    }

    setCurrentStep(state.currentStep);
  }, [navigate]);

  // Handle skipping onboarding
  const handleSkip = useCallback(() => {
    // Mark as completed and go to dashboard without spotlight
    onboardingStore.completeOnboarding();
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  // Handle pain point selection
  const handlePainPointSelect = useCallback((option) => {
    // PainPointScreen already saved the selection via onboardingStore
    // Now complete onboarding and go to dashboard with spotlight
    onboardingStore.completeOnboarding();
    navigate('/dashboard?firstRun=true', { replace: true });
  }, [navigate]);

  // Render current screen based on step
  const renderScreen = () => {
    switch (currentStep) {
      case ONBOARDING_STEPS.SCAN:
        return <ScanScreen onNext={handleNext} onSkip={handleSkip} />;

      case ONBOARDING_STEPS.PAIN_POINT:
        return <PainPointScreen onNext={handlePainPointSelect} onSkip={handleSkip} />;

      default:
        return <ScanScreen onNext={handleNext} onSkip={handleSkip} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
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
