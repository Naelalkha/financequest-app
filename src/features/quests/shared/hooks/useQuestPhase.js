import { useState, useCallback } from 'react';

/**
 * useQuestPhase - Flexible phase management hook
 * 
 * Supports variable number of phases (2 to N)
 * 
 * @param {string[]} phases - Array of phase IDs (e.g., ['BRIEFING', 'EXECUTION', 'DEBRIEF'])
 * @returns {object} Phase state and navigation functions
 * 
 * @example
 * // 3-phase quest
 * const { currentPhase, progress, goNext, goBack } = useQuestPhase(['BRIEFING', 'EXECUTION', 'DEBRIEF']);
 * 
 * // 5-phase quest
 * const { currentPhase, goTo } = useQuestPhase(['BRIEFING', 'ELIGIBILITY', 'CHOICE', 'DOCS', 'DEBRIEF']);
 */
const useQuestPhase = (phases = ['BRIEFING', 'EXECUTION', 'DEBRIEF']) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentPhase = phases[currentIndex];
    const totalPhases = phases.length;

    // Progress as percentage (useful for progress bar)
    const progress = ((currentIndex + 1) / totalPhases) * 100;

    // Progress width string for CSS
    const progressWidth = `${progress}%`;

    // Navigate to next phase
    const goNext = useCallback(() => {
        if (currentIndex < totalPhases - 1) {
            setCurrentIndex(prev => prev + 1);
            return true;
        }
        return false; // Already at last phase
    }, [currentIndex, totalPhases]);

    // Navigate to previous phase
    const goBack = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            return true;
        }
        return false; // Already at first phase
    }, [currentIndex]);

    // Navigate to specific phase by ID
    const goTo = useCallback((phaseId) => {
        const index = phases.findIndex(p => p === phaseId);
        if (index !== -1) {
            setCurrentIndex(index);
            return true;
        }
        return false; // Phase not found
    }, [phases]);

    // Reset to first phase
    const reset = useCallback(() => {
        setCurrentIndex(0);
    }, []);

    return {
        // Current state
        currentPhase,
        currentIndex,
        totalPhases,
        progress,
        progressWidth,

        // Position checks
        isFirst: currentIndex === 0,
        isLast: currentIndex === totalPhases - 1,

        // Navigation
        goNext,
        goBack,
        goTo,
        reset,

        // Phase info
        phases,
        getPhaseLabel: (index) => phases[index] || null
    };
};

export default useQuestPhase;
