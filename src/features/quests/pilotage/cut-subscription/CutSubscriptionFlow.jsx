import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, ArrowLeft } from 'lucide-react';
import ProtocolScreen from './screens/ProtocolScreen';
import ExecutionScreen from './screens/ExecutionScreen';
import DebriefScreen from './screens/DebriefScreen';
import { trackEvent } from '../../../../utils/analytics';
import useLocalizedQuest from '../../../../hooks/useLocalizedQuest';
import { fullscreenVariants, TRANSITIONS, EASE, SPRING, screenVariants } from '../../../../styles/animationConstants';
import { haptic } from '../../../../utils/haptics';

/**
 * CutSubscriptionFlow - Main 3-Phase Quest Flow Controller
 * 
 * Clean tactical UI matching the Moniyo Protocol design
 */
const CutSubscriptionFlow = ({
    quest = {},
    onComplete,
    onClose,
    userProgress = {}
}) => {
    const { t, i18n } = useTranslation(['quests', 'common']);
    const locale = i18n.language;

    // Get localized quest with codename
    const localizedQuest = useLocalizedQuest(quest);

    // Phase state
    const [phase, setPhase] = useState('PROTOCOL');

    // Quest data state
    const [questData, setQuestData] = useState({
        subscription: null,
        serviceName: '',
        monthlyAmount: 0,
        annualAmount: 0,
        frequency: 'MONTHLY',
        customName: '',
        ...userProgress
    });

    // Phase labels
    const phaseLabels = {
        PROTOCOL: { fr: 'PHASE 01 // PROTOCOLE', en: 'PHASE 01 // PROTOCOL' },
        EXECUTION: { fr: 'PHASE 02 // EXÉCUTION', en: 'PHASE 02 // EXECUTION' },
        DEBRIEF: { fr: 'PHASE 03 // DÉBRIEFING', en: 'PHASE 03 // DEBRIEF' }
    };

    const phaseTitles = {
        PROTOCOL: { fr: 'BRIEFING', en: 'BRIEFING' },
        EXECUTION: { fr: 'SÉLECTION CIBLE', en: 'TARGET SELECTION' },
        DEBRIEF: { fr: 'RAPPORT DE MISSION', en: 'MISSION REPORT' }
    };

    // Progress bar width
    const progressWidth = phase === 'PROTOCOL' ? '33%' : phase === 'EXECUTION' ? '66%' : '100%';

    // Update quest data
    const handleUpdateData = useCallback((newData) => {
        setQuestData(prev => ({ ...prev, ...newData }));
    }, []);

    // Phase transitions with haptic feedback
    const goToExecution = useCallback(() => {
        haptic.medium();
        trackEvent('quest_phase_completed', {
            quest_id: 'cut-subscription',
            phase: 'PROTOCOL'
        });
        setPhase('EXECUTION');
    }, []);

    const goToDebrief = useCallback(() => {
        haptic.heavy();
        trackEvent('quest_phase_completed', {
            quest_id: 'cut-subscription',
            phase: 'EXECUTION',
            service: questData.serviceName,
            amount: questData.monthlyAmount
        });
        setPhase('DEBRIEF');
    }, [questData.serviceName, questData.monthlyAmount]);

    const goBackToProtocol = useCallback(() => {
        haptic.light();
        setPhase('PROTOCOL');
    }, []);

    // Final completion
    const handleComplete = () => {
        trackEvent('quest_completed', {
            quest_id: 'cut-subscription',
            service: questData.serviceName,
            monthly_amount: questData.monthlyAmount,
            annual_impact: questData.annualAmount
        });

        onComplete({
            questId: 'cut-subscription',
            serviceName: questData.serviceName,
            monthlyAmount: questData.monthlyAmount,
            annualAmount: questData.annualAmount || (questData.monthlyAmount * 12),
            xpEarned: quest.xp || 140,
            completedAt: new Date().toISOString()
        });
    };

    // Use optimized screen variants from constants
    // screenVariants.slideForward is imported from animationConstants

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
                                variants={screenVariants.slideForward}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={SPRING.smooth}
                                className="h-full"
                            >
                                <ProtocolScreen onNext={goToExecution} />
                            </motion.div>
                        )}

                        {phase === 'EXECUTION' && (
                            <motion.div
                                key="execution"
                                variants={screenVariants.slideForward}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={SPRING.smooth}
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
                                variants={screenVariants.fadeScale}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={SPRING.bouncy}
                                className="h-full"
                            >
                                <DebriefScreen
                                    data={questData}
                                    xpReward={quest.xp || 140}
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

export { default as ProtocolScreen } from './screens/ProtocolScreen';
export { default as ExecutionScreen } from './screens/ExecutionScreen';
export { default as DebriefScreen } from './screens/DebriefScreen';

export default CutSubscriptionFlow;
