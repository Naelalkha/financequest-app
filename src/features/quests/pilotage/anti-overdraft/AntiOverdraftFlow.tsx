import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, ArrowLeft } from 'lucide-react';
import ProtocolScreen from './screens/ProtocolScreen';
import ExecutionScreen from './screens/ExecutionScreen';
import DebriefScreen from './screens/DebriefScreen';
import { trackEvent } from '../../../../utils/analytics';
import { fullscreenVariants, TRANSITIONS, EASE } from '../../../../styles/animationConstants';
import { haptic } from '../../../../utils/haptics';
import { calculateTotalImpact } from './insightData';

/** Quest metadata */
interface QuestMeta {
  id?: string;
  xp?: number;
  xpReward?: number;
  title?: string;
}

/** User progress data */
interface UserProgressData {
  streak?: number;
  xpProgress?: number;
  [key: string]: unknown;
}

/** Completion result data */
interface CompletionResult {
  questId: string;
  revenus: number;
  chargesFixes: number;
  rav: number;
  ravRatio: number;
  riskLevel: string;
  selectedStrategies: string[];
  totalImpact: number;
  annualSavings: number;
  xpEarned: number;
  completedAt: string;
}

/** Props for AntiOverdraftFlow */
interface AntiOverdraftFlowProps {
  quest?: QuestMeta;
  onComplete: (result: CompletionResult) => void;
  onClose: () => void;
  userProgress?: UserProgressData;
}

/**
 * AntiOverdraftFlow - Main 3-Phase Quest Flow Controller
 *
 * Quest: L'ANTI-DÉCOUVERT
 * Flow: CONTEXTE → MÉTHODE → DIAGNOSTIC → STRATÉGIE → ACTION → IMPACT
 */

// Custom transition for main screens
const mainScreenVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

const AntiOverdraftFlow: React.FC<AntiOverdraftFlowProps> = ({
    quest = {},
    onComplete,
    onClose,
    userProgress = {}
}) => {
    const { t, i18n } = useTranslation(['quests', 'common']);
    const locale = i18n.language;

    // Phase state
    const [phase, setPhase] = useState('PROTOCOL');

    // Internal navigation states
    const [protocolPage, setProtocolPage] = useState(0); // 0 = Contexte, 1 = Méthode
    const [executionStep, setExecutionStep] = useState('diagnostic'); // 'diagnostic', 'strategy', 'action'

    // Quest data state
    const [questData, setQuestData] = useState({
        revenus: 2500,
        chargesFixes: 1500,
        rav: 1000,
        ravRatio: 0.4,
        riskLevel: 'CONFORT' as string,
        selectedStrategies: [] as string[],
        totalImpact: 0,
        ...userProgress
    });

    // Phase labels
    const phaseLabels = {
        PROTOCOL: { fr: 'L\'ANTI-DÉCOUVERT', en: 'OVERDRAFT SHIELD' },
        EXECUTION: { fr: 'L\'ANTI-DÉCOUVERT', en: 'OVERDRAFT SHIELD' },
        DEBRIEF: { fr: 'L\'ANTI-DÉCOUVERT', en: 'OVERDRAFT SHIELD' }
    };

    // Step titles
    const getStepTitle = () => {
        if (phase === 'PROTOCOL') {
            if (protocolPage === 0) return { fr: 'CONTEXTE', en: 'CONTEXT' };
            return { fr: 'MÉTHODE', en: 'METHOD' };
        }
        if (phase === 'EXECUTION') {
            if (executionStep === 'diagnostic') return { fr: 'DIAGNOSTIC', en: 'DIAGNOSIS' };
            if (executionStep === 'strategy') return { fr: 'STRATÉGIE', en: 'STRATEGY' };
            if (executionStep === 'action') return { fr: 'ACTION', en: 'ACTION' };
            return { fr: 'DIAGNOSTIC', en: 'DIAGNOSIS' };
        }
        return { fr: 'IMPACT', en: 'IMPACT' };
    };

    // Progress bar width - 6 steps total
    const getProgressWidth = () => {
        if (phase === 'PROTOCOL') {
            return protocolPage === 0 ? '16%' : '33%';
        }
        if (phase === 'EXECUTION') {
            if (executionStep === 'diagnostic') return '50%';
            if (executionStep === 'strategy') return '66%';
            if (executionStep === 'action') return '83%';
            return '50%';
        }
        return '100%'; // DEBRIEF
    };
    const progressWidth = getProgressWidth();

    // Update quest data
    const handleUpdateData = useCallback((newData: Partial<typeof questData>) => {
        setQuestData(prev => ({ ...prev, ...newData }));
    }, []);

    // NAVIGATION HANDLERS

    // Back Button Logic
    const handleBack = useCallback(() => {
        haptic.light();

        if (phase === 'PROTOCOL' && protocolPage === 1) {
            setProtocolPage(0);
        } else if (phase === 'EXECUTION') {
            if (executionStep === 'action') {
                setExecutionStep('strategy');
            } else if (executionStep === 'strategy') {
                setExecutionStep('diagnostic');
            } else {
                setPhase('PROTOCOL');
                setProtocolPage(1);
            }
        }
    }, [phase, protocolPage, executionStep]);

    // Forward Logic
    const goToExecution = useCallback(() => {
        haptic.medium();
        trackEvent('quest_phase_completed', {
            quest_id: 'anti-overdraft',
            phase: 'PROTOCOL'
        });
        setPhase('EXECUTION');
        setExecutionStep('diagnostic');
    }, []);

    const goToDebrief = useCallback(() => {
        haptic.heavy();
        trackEvent('quest_phase_completed', {
            quest_id: 'anti-overdraft',
            phase: 'EXECUTION',
            rav: questData.rav,
            risk_level: questData.riskLevel,
            strategies_count: questData.selectedStrategies.length
        });
        setPhase('DEBRIEF');
    }, [questData.rav, questData.riskLevel, questData.selectedStrategies]);

    // Check if Back button should be shown
    const showBackButton = (phase === 'PROTOCOL' && protocolPage === 1) || (phase === 'EXECUTION');

    // Final completion
    const handleComplete = () => {
        console.log('[AntiOverdraftFlow] handleComplete called');
        console.log('[AntiOverdraftFlow] questData:', questData);

        const totalImpact = calculateTotalImpact(questData.selectedStrategies);
        const annualImpact = totalImpact * 12;
        const xpEarned = quest.xp || 100;

        console.log('[AntiOverdraftFlow] Calling onComplete with:', { totalImpact, annualImpact, xpEarned });

        trackEvent('quest_completed', {
            quest_id: 'anti-overdraft',
            rav: questData.rav,
            risk_level: questData.riskLevel,
            strategies: questData.selectedStrategies,
            annual_impact: annualImpact
        });

        onComplete({
            questId: 'anti-overdraft',
            revenus: questData.revenus,
            chargesFixes: questData.chargesFixes,
            rav: questData.rav,
            ravRatio: questData.ravRatio,
            riskLevel: questData.riskLevel,
            selectedStrategies: questData.selectedStrategies,
            totalImpact,
            annualSavings: annualImpact,
            xpEarned,
            completedAt: new Date().toISOString()
        });
    };

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-[#050505]"
            style={{
                background: 'radial-gradient(circle at 50% 30%, #111111 0%, #050505 60%, #000000 100%)'
            }}
            {...fullscreenVariants.enter}
            transition={TRANSITIONS.overlayEntry}
        >
            {/* Texture Overlay */}
            <div
                className="fixed top-0 left-0 w-full h-screen opacity-[0.03] pointer-events-none z-[1]"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zzM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                }}
            />

            {/* Main Container */}
            <motion.div
                {...fullscreenVariants.content}
                transition={{ duration: TRANSITIONS.modalEntry.duration, ease: EASE.outExpo }}
                className="w-full h-full min-h-screen bg-transparent overflow-hidden relative flex flex-col z-10"
            >

                {/* Progress Bar */}
                <div className="absolute left-0 h-1 bg-neutral-800 w-full z-50" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
                    <motion.div
                        className="h-full bg-volt transition-all duration-500 ease-out shadow-[0_0_10px_rgba(226,255,0,0.4)]"
                        initial={{ width: '0%' }}
                        animate={{ width: progressWidth }}
                    />
                </div>

                {/* Header */}
                <div
                    className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-40"
                    style={{
                        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.75rem)',
                        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%)',
                        backdropFilter: 'blur(1px)',
                        WebkitBackdropFilter: 'blur(1px)'
                    }}
                >
                    <div className="flex items-center gap-4">
                        {/* Back Button */}
                        <AnimatePresence mode="popLayout">
                            {showBackButton && (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, scale: 0.8, x: -8 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, x: -8 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 25,
                                        opacity: { duration: 0.15 },
                                        layout: { duration: 0.3, ease: "easeOut" }
                                    }}
                                    onClick={handleBack}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors active:scale-95"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <motion.div layout className="overflow-hidden">
                            {/* Breadcrumb */}
                            <span className="font-mono text-[11px] text-volt tracking-wide uppercase block">
                                {phaseLabels[phase]?.[locale] || phaseLabels[phase]?.fr}
                            </span>
                            {/* Step Title */}
                            <div className="h-9 mt-1 overflow-hidden pt-2 -mt-1">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`${phase}-${protocolPage}-${executionStep}-title-wrapper`}
                                        className="h-full"
                                    >
                                        <motion.h2
                                            initial={{ y: '100%' }}
                                            animate={{ y: 0 }}
                                            exit={{ y: '-150%' }}
                                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                            className="font-sans font-black text-2xl text-white leading-none tracking-tight"
                                            style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.4)' }}
                                        >
                                            {getStepTitle()[locale] || getStepTitle().fr}
                                        </motion.h2>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-white/10"
                        aria-label={t('common:close')}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-hidden relative" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 7rem)' }}>
                    <AnimatePresence mode="wait">
                        {phase === 'PROTOCOL' && (
                            <motion.div
                                key="protocol"
                                variants={mainScreenVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                className="h-full quest-screen"
                            >
                                <ProtocolScreen
                                    onNext={goToExecution}
                                    page={protocolPage}
                                    setPage={setProtocolPage}
                                />
                            </motion.div>
                        )}

                        {phase === 'EXECUTION' && (
                            <motion.div
                                key="execution"
                                variants={mainScreenVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                className="h-full quest-screen"
                            >
                                <ExecutionScreen
                                    data={questData}
                                    onUpdate={handleUpdateData}
                                    onNext={goToDebrief}
                                    step={executionStep}
                                    setStep={setExecutionStep}
                                />
                            </motion.div>
                        )}

                        {phase === 'DEBRIEF' && (
                            <motion.div
                                key="debrief"
                                variants={mainScreenVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="h-full quest-screen"
                            >
                                <DebriefScreen
                                    data={questData}
                                    xpReward={quest.xp || 100}
                                    currentStreak={userProgress.streak ?? 1}
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

export default AntiOverdraftFlow;
