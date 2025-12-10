import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Shared components
import {
    QuestContainer,
    QuestProgressBar,
    QuestHeader,
    useQuestPhase
} from '../../shared';

// Screens
import BriefingScreen from './screens/BriefingScreen';
import ExecutionScreen from './screens/ExecutionScreen';
import DebriefScreen from './screens/DebriefScreen';

// Quest metadata
import metadata from './metadata';

/**
 * [QUEST_NAME] Flow - Main Quest Controller
 * 
 * Uses the shared useQuestPhase hook for flexible phase management
 */
const TemplateFlow = ({
    quest = {},
    onComplete,
    onClose,
    userProgress = {}
}) => {
    const { i18n } = useTranslation();
    const locale = i18n.language;

    // Phase management (uses phases from metadata)
    const {
        currentPhase,
        currentIndex,
        totalPhases,
        progress,
        goNext,
        goBack,
        isLast
    } = useQuestPhase(metadata.phases);

    // Quest data state
    const [questData, setQuestData] = useState({
        ...userProgress
    });

    // Update quest data
    const handleUpdateData = useCallback((newData) => {
        setQuestData(prev => ({ ...prev, ...newData }));
    }, []);

    // Final completion
    const handleComplete = () => {
        onComplete({
            questId: metadata.id,
            ...questData,
            completedAt: new Date().toISOString()
        });
    };

    // Phase labels
    const phaseLabels = {
        BRIEFING: { fr: 'PHASE 01 // PROTOCOLE', en: 'PHASE 01 // PROTOCOL' },
        EXECUTION: { fr: 'PHASE 02 // EXÉCUTION', en: 'PHASE 02 // EXECUTION' },
        DEBRIEF: { fr: 'PHASE 03 // DÉBRIEFING', en: 'PHASE 03 // DEBRIEF' }
    };

    const phaseTitles = {
        BRIEFING: { fr: 'BRIEFING', en: 'BRIEFING' },
        EXECUTION: { fr: 'SÉLECTION CIBLE', en: 'TARGET SELECTION' },
        DEBRIEF: { fr: 'RAPPORT DE MISSION', en: 'MISSION REPORT' }
    };

    // Screen transition variants
    const screenVariants = {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 }
    };

    return (
        <QuestContainer onClose={onClose}>
            {/* Progress Bar */}
            <QuestProgressBar
                progress={progress}
                totalSteps={totalPhases}
                currentStep={currentIndex}
            />

            {/* Header */}
            <QuestHeader
                phaseLabel={phaseLabels[currentPhase]?.[locale] || phaseLabels[currentPhase]?.fr}
                title={phaseTitles[currentPhase]?.[locale] || phaseTitles[currentPhase]?.fr}
                onClose={onClose}
            />

            {/* Screen Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPhase}
                    variants={screenVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="flex-1 overflow-hidden"
                >
                    {currentPhase === 'BRIEFING' && (
                        <BriefingScreen
                            onNext={goNext}
                        />
                    )}

                    {currentPhase === 'EXECUTION' && (
                        <ExecutionScreen
                            data={questData}
                            onUpdate={handleUpdateData}
                            onNext={goNext}
                            onBack={goBack}
                        />
                    )}

                    {currentPhase === 'DEBRIEF' && (
                        <DebriefScreen
                            data={questData}
                            onComplete={handleComplete}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </QuestContainer>
    );
};

export default TemplateFlow;
