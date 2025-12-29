/**
 * [QUEST_NAME]Flow - Main 3-Phase Quest Flow Controller
 * 
 * Template pour nouvelles quêtes Moniyo Protocol
 * 
 * INSTRUCTIONS:
 * 1. Copier ce fichier vers [QuestName]Flow.jsx
 * 2. Remplacer tous les [PLACEHOLDER] par les vraies valeurs
 * 3. Adapter questData selon les données collectées
 * 4. Personnaliser les phases si nécessaire
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, ArrowLeft } from 'lucide-react';

// Screens - [TODO: Rename imports]
import ProtocolScreen from './screens/ProtocolScreen';
import ExecutionScreen from './screens/ExecutionScreen';
import DebriefScreen from './screens/DebriefScreen';

// Utils
import { trackEvent } from '../../../../utils/analytics';
import useLocalizedQuest from '../../../../hooks/useLocalizedQuest';
import { fullscreenVariants, TRANSITIONS, EASE } from '../../../../styles/animationConstants';

// Metadata
import metadata from './metadata';

const TemplateFlow = ({
    quest = {},
    onComplete,
    onClose,
    userProgress = {}
}) => {
    const { t, i18n } = useTranslation(['quests', 'common']);
    const locale = i18n.language;

    // Get localized quest with codename
    const localizedQuest = useLocalizedQuest(quest);

    // =====================================================
    // PHASE STATE
    // =====================================================
    // Options: 'PROTOCOL', 'EXECUTION', 'DEBRIEF'
    // Pour ajouter une phase: ajouter une entrée ici + condition dans le render
    const [phase, setPhase] = useState('PROTOCOL');

    // =====================================================
    // QUEST DATA STATE
    // [TODO: Adapter selon les données que ta quête collecte]
    // =====================================================
    const [questData, setQuestData] = useState({
        // Exemple pour une quête de type "sélection"
        selectedOption: null,
        optionName: '',
        amount: 0,
        calculatedImpact: 0,
        // Ajouter les champs spécifiques à ta quête ici
        ...userProgress
    });

    // =====================================================
    // PHASE LABELS (bilingue)
    // =====================================================
    const phaseLabels = {
        PROTOCOL: { fr: 'PHASE 01 // PROTOCOLE', en: 'PHASE 01 // PROTOCOL' },
        EXECUTION: { fr: 'PHASE 02 // EXÉCUTION', en: 'PHASE 02 // EXECUTION' },
        DEBRIEF: { fr: 'PHASE 03 // DÉBRIEFING', en: 'PHASE 03 // DEBRIEF' }
        // [TODO: Ajouter d'autres phases si nécessaire]
    };

    const phaseTitles = {
        PROTOCOL: { fr: 'BRIEFING', en: 'BRIEFING' },
        EXECUTION: { fr: 'SÉLECTION', en: 'SELECTION' },  // [TODO: Personnaliser]
        DEBRIEF: { fr: 'RAPPORT DE MISSION', en: 'MISSION REPORT' }
    };

    // =====================================================
    // PROGRESS BAR
    // [TODO: Adapter si plus de 3 phases]
    // =====================================================
    const progressWidth = phase === 'PROTOCOL' ? '33%'
        : phase === 'EXECUTION' ? '66%'
            : '100%';

    // =====================================================
    // DATA UPDATE HANDLER
    // =====================================================
    const handleUpdateData = useCallback((newData) => {
        setQuestData(prev => ({ ...prev, ...newData }));
    }, []);

    // =====================================================
    // PHASE TRANSITIONS
    // =====================================================
    const goToExecution = () => {
        trackEvent('quest_phase_completed', {
            quest_id: metadata.id,
            phase: 'PROTOCOL'
        });
        setPhase('EXECUTION');
    };

    const goToDebrief = () => {
        trackEvent('quest_phase_completed', {
            quest_id: metadata.id,
            phase: 'EXECUTION',
            // [TODO: Ajouter les données pertinentes]
            option: questData.optionName,
            amount: questData.amount
        });
        setPhase('DEBRIEF');
    };

    const goBackToProtocol = () => {
        setPhase('PROTOCOL');
    };

    // =====================================================
    // FINAL COMPLETION
    // =====================================================
    const handleComplete = () => {
        trackEvent('quest_completed', {
            quest_id: metadata.id,
            // [TODO: Ajouter les métriques de completion]
            option: questData.optionName,
            amount: questData.amount,
            impact: questData.calculatedImpact
        });

        onComplete({
            questId: metadata.id,
            // [TODO: Retourner les données pertinentes]
            optionName: questData.optionName,
            amount: questData.amount,
            calculatedImpact: questData.calculatedImpact,
            xpEarned: quest.xp || metadata.xp,
            completedAt: new Date().toISOString()
        });
    };

    // =====================================================
    // SCREEN TRANSITION VARIANTS
    // =====================================================
    const screenVariants = {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 }
    };

    // =====================================================
    // RENDER
    // =====================================================
    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black"
            {...fullscreenVariants.enter}
            transition={TRANSITIONS.overlayEntry}
        >
            {/* Main Container - Fullscreen */}
            <motion.div
                {...fullscreenVariants.content}
                transition={{ duration: TRANSITIONS.modalEntry.duration, ease: EASE.outExpo }}
                className="w-full h-full min-h-screen bg-[#0A0A0A] overflow-hidden relative flex flex-col"
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-1 bg-neutral-800 w-full z-50">
                    <motion.div
                        className="h-full bg-volt transition-all duration-500 ease-out shadow-[0_0_10px_rgba(226,255,0,0.4)]"
                        initial={{ width: '0%' }}
                        animate={{ width: progressWidth }}
                    />
                </div>

                {/* Header - Compact */}
                <div className="p-6 pt-8 border-b border-white/5 flex justify-between items-center bg-black/50">
                    <div className="flex items-center gap-4">
                        {/* Back arrow for middle phases */}
                        {phase !== 'PROTOCOL' && phase !== 'DEBRIEF' && (
                            <button
                                onClick={goBackToProtocol}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors active:scale-95"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div>
                            <span className="font-mono text-[10px] text-volt tracking-[0.2em] uppercase animate-pulse">
                                {phaseLabels[phase]?.[locale] || phaseLabels[phase]?.fr}
                            </span>
                            {/* Codename as main header, fallback to phase title */}
                            <h2 className="font-sans font-bold text-xl text-white leading-none mt-1">
                                {localizedQuest?.codename || phaseTitles[phase]?.[locale] || phaseTitles[phase]?.fr}
                            </h2>
                        </div>
                    </div>

                    {/* Close button - Larger for fullscreen */}
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-white/10"
                        aria-label={t('common:close')}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {phase === 'PROTOCOL' && (
                            <motion.div
                                key="protocol"
                                variants={screenVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.25 }}
                                className="h-full"
                            >
                                <ProtocolScreen onNext={goToExecution} />
                            </motion.div>
                        )}

                        {phase === 'EXECUTION' && (
                            <motion.div
                                key="execution"
                                variants={screenVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.25 }}
                                className="h-full"
                            >
                                <ExecutionScreen
                                    data={questData}
                                    onUpdate={handleUpdateData}
                                    onNext={goToDebrief}
                                    onBack={goBackToProtocol}
                                />
                            </motion.div>
                        )}

                        {phase === 'DEBRIEF' && (
                            <motion.div
                                key="debrief"
                                variants={screenVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.25 }}
                                className="h-full"
                            >
                                <DebriefScreen
                                    data={questData}
                                    xpReward={quest.xp || metadata.xp}
                                    currentStreak={userProgress.streak || 1}
                                    xpProgress={userProgress.xpProgress || 75}
                                    onComplete={handleComplete}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

// =====================================================
// EXPORTS
// =====================================================
export { default as ProtocolScreen } from './screens/ProtocolScreen';
export { default as ExecutionScreen } from './screens/ExecutionScreen';
export { default as DebriefScreen } from './screens/DebriefScreen';

export default TemplateFlow;
