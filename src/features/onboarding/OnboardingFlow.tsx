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
import { DURATION, EASE } from '../../styles/animationConstants';

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

// Fade out variant for completion transition
const completionVariants = {
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const OnboardingFlow: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(ONBOARDING_STEPS.SCAN);
    const [direction, setDirection] = useState(1);
    const [isExiting, setIsExiting] = useState(false);

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

    // Smooth exit transition before navigation
    const performSmoothExit = useCallback((targetUrl: string) => {
        setIsExiting(true);
        onboardingStore.completeOnboarding();

        // Wait for fade out animation to complete before navigating
        setTimeout(() => {
            navigate(targetUrl, { replace: true });
        }, DURATION.medium * 1000); // Convert to ms
    }, [navigate]);

    // Handle moving to next step
    const handleNext = useCallback(() => {
        setDirection(1);
        const state = onboardingStore.nextStep();

        if (state.currentStep === ONBOARDING_STEPS.COMPLETED) {
            performSmoothExit('/dashboard?firstRun=true');
            return;
        }

        setCurrentStep(state.currentStep);
    }, [performSmoothExit]);

    // Handle skipping onboarding
    const handleSkip = useCallback(() => {
        performSmoothExit('/dashboard');
    }, [performSmoothExit]);

    // Handle pain point selection
    const handlePainPointSelect = useCallback((_option: PainPointOption) => {
        performSmoothExit('/dashboard?firstRun=true');
    }, [performSmoothExit]);

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
        <motion.div
            className="fixed inset-0 bg-transparent overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{
                duration: DURATION.medium,
                ease: EASE.premium
            }}
        >
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
        </motion.div>
    );
};

export default OnboardingFlow;
