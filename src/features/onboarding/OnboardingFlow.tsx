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

interface PainPointOption {
    id: string;
    missionId: string;
    missionName: string;
}

// Screen transition variants
const screenVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
    }),
};

const OnboardingFlow: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(ONBOARDING_STEPS.SCAN);
    const [direction, setDirection] = useState(1);

    // Use background context to set theme
    const { setBackgroundMode } = useBackground();

    useEffect(() => {
        setBackgroundMode('macro', { blur: true, blurAmount: 1, patternOpacity: 0.1 });
        return () => setBackgroundMode('macro');
    }, [setBackgroundMode]);

    // Initialize onboarding state
    useEffect(() => {
        if (onboardingStore.hasCompletedOnboarding()) {
            navigate('/dashboard', { replace: true });
            return;
        }

        const state = onboardingStore.startOnboarding();
        setCurrentStep(state.currentStep);
    }, [navigate]);

    // Handle moving to next step
    const handleNext = useCallback(() => {
        setDirection(1);
        const state = onboardingStore.nextStep();

        if (state.currentStep === ONBOARDING_STEPS.COMPLETED) {
            onboardingStore.completeOnboarding();
            navigate('/dashboard?firstRun=true', { replace: true });
            return;
        }

        setCurrentStep(state.currentStep);
    }, [navigate]);

    // Handle skipping onboarding
    const handleSkip = useCallback(() => {
        onboardingStore.completeOnboarding();
        navigate('/dashboard', { replace: true });
    }, [navigate]);

    // Handle pain point selection
    const handlePainPointSelect = useCallback((_option: PainPointOption) => {
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
