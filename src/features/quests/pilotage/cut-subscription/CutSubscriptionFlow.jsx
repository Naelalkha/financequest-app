import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import ProtocolScreen from './screens/ProtocolScreen';
import ExecutionScreen from './screens/ExecutionScreen';
import DebriefScreen from './screens/DebriefScreen';
import { trackEvent } from '../../../../utils/analytics';

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
        EXECUTION: { fr: 'EXÉCUTION', en: 'EXECUTION' },
        DEBRIEF: { fr: 'DÉBRIEFING', en: 'DEBRIEF' }
    };

    // Progress bar width
    const progressWidth = phase === 'PROTOCOL' ? '33%' : phase === 'EXECUTION' ? '66%' : '100%';

    // Update quest data
    const handleUpdateData = useCallback((newData) => {
        setQuestData(prev => ({ ...prev, ...newData }));
    }, []);

    // Phase transitions
    const goToExecution = () => {
        trackEvent('quest_phase_completed', {
            quest_id: 'cut-subscription',
            phase: 'PROTOCOL'
        });
        setPhase('EXECUTION');
    };

    const goToDebrief = () => {
        trackEvent('quest_phase_completed', {
            quest_id: 'cut-subscription',
            phase: 'EXECUTION',
            service: questData.serviceName,
            amount: questData.monthlyAmount
        });
        setPhase('DEBRIEF');
    };

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

    // Screen transition variants
    const screenVariants = {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">

            {/* Main Container */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'backOut' }}
                className="w-full max-w-md h-[90vh] max-h-[850px] bg-[#0A0A0A] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
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
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50">
                    <div>
                        <span className="font-mono text-[9px] text-volt tracking-[0.2em] uppercase animate-pulse">
                            {phaseLabels[phase]?.[locale] || phaseLabels[phase]?.fr}
                        </span>
                        <h2 className="font-sans font-bold text-lg text-white leading-none mt-1">
                            {phaseTitles[phase]?.[locale] || phaseTitles[phase]?.fr}
                        </h2>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                        aria-label={t('common:close')}
                    >
                        <X className="w-4 h-4" />
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
        </div>
    );
};

export { default as ProtocolScreen } from './screens/ProtocolScreen';
export { default as ExecutionScreen } from './screens/ExecutionScreen';
export { default as DebriefScreen } from './screens/DebriefScreen';

export default CutSubscriptionFlow;
