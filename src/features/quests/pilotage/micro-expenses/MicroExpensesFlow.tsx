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

/**
 * MicroExpensesFlow - Main 3-Phase Quest Flow Controller
 * 
 * Quest 02: L'EFFET CUMULÉ
 * Features:
 * - Centralized navigation state (Protocol pages & Execution steps)
 * - Uniform Header with smart Back Button
 */
// Custom transition for main screens (fade only for stability)
const mainScreenVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

const MicroExpensesFlow = ({
    quest = {},
    onComplete,
    onClose,
    userProgress = {}
}) => {
    const { t, i18n } = useTranslation(['quests', 'common']);
    const locale = i18n.language;

    // Phase state
    const [phase, setPhase] = useState('PROTOCOL');

    // Internal navigation states (lifted up to control Header Back Button)
    const [protocolPage, setProtocolPage] = useState(0); // 0 = Context, 1 = Method
    const [executionStep, setExecutionStep] = useState('revelation'); // 'revelation' or 'challenge'

    // Quest data state
    const [questData, setQuestData] = useState({
        categoryId: null,
        category: null,
        expenseName: '',
        unitPrice: 0,
        frequencyId: 'weekdays',
        timesPerWeek: 5,
        weeklyAmount: 0,
        monthlyAmount: 0,
        yearlyAmount: 0,
        fiveYearAmount: 0,
        actionLevel: null,
        actionSavings: 0,
        yearlySavings: 0,
        yearlyEquivalent: null,
        fiveYearEquivalent: null,
        dailyAmount: 0,
        tenYearAmount: 0,
        equivalent: null,
        customName: '',
        ...userProgress
    });

    // Phase labels (fil d'Ariane - petit jaune)
    const phaseLabels = {
        PROTOCOL: { fr: 'TRAQUE INVISIBLE', en: 'INVISIBLE HUNT' },
        EXECUTION: { fr: 'TRAQUE INVISIBLE', en: 'INVISIBLE HUNT' },
        DEBRIEF: { fr: 'TRAQUE INVISIBLE', en: 'INVISIBLE HUNT' }
    };

    // Step titles (ÉNORME blanc - action du moment)
    const getStepTitle = () => {
        if (phase === 'PROTOCOL') {
            if (protocolPage === 0) return { fr: 'CONTEXTE', en: 'CONTEXT' };
            return { fr: 'MÉTHODE', en: 'METHOD' };
        }
        if (phase === 'EXECUTION') {
            if (executionStep === 'revelation') return { fr: 'CIBLE', en: 'TARGET' };
            return { fr: 'STRATÉGIE', en: 'STRATEGY' };
        }
        return { fr: 'IMPACT', en: 'IMPACT' };
    };

    // Step subtitles (moyen gris - instruction)
    const getStepSubtitle = () => {
        // All subtitles removed for cleaner mobile UI
        return { fr: '', en: '' };
    };

    // Progress bar width - 5 steps total (20% each)
    const getProgressWidth = () => {
        if (phase === 'PROTOCOL') {
            return protocolPage === 0 ? '20%' : '40%';
        }
        if (phase === 'EXECUTION') {
            return executionStep === 'revelation' ? '60%' : '80%';
        }
        return '100%'; // DEBRIEF
    };
    const progressWidth = getProgressWidth();

    // Update quest data
    const handleUpdateData = useCallback((newData) => {
        setQuestData(prev => ({ ...prev, ...newData }));
    }, []);

    // NAVIGATION HANDLERS

    // 1. Back Button Logic
    const handleBack = useCallback(() => {
        haptic.light();

        if (phase === 'PROTOCOL' && protocolPage === 1) {
            setProtocolPage(0);
        } else if (phase === 'EXECUTION') {
            if (executionStep === 'challenge') {
                setExecutionStep('revelation');
            } else {
                setPhase('PROTOCOL');
                setProtocolPage(1); // Go back to end of protocol
            }
        }
    }, [phase, protocolPage, executionStep]);

    // 2. Forward Logic
    const goToExecution = useCallback(() => {
        haptic.medium();
        trackEvent('quest_phase_completed', {
            quest_id: 'micro-expenses',
            phase: 'PROTOCOL'
        });
        setPhase('EXECUTION');
        setExecutionStep('revelation'); // Reset to start of execution
    }, []);

    const goToDebrief = useCallback(() => {
        haptic.heavy();
        trackEvent('quest_phase_completed', {
            quest_id: 'micro-expenses',
            phase: 'EXECUTION',
            expense: questData.expenseName,
            dailyAmount: questData.dailyAmount
        });
        setPhase('DEBRIEF');
    }, [questData.expenseName, questData.dailyAmount]);

    const goBackToProtocol = useCallback(() => { // Legacy prop compatibility
        haptic.light();
        setPhase('PROTOCOL');
    }, []);

    // Check if Back button should be shown
    const showBackButton = (phase === 'PROTOCOL' && protocolPage === 1) || (phase === 'EXECUTION');

    // Final completion
    const handleComplete = () => {
        trackEvent('quest_completed', {
            quest_id: 'micro-expenses',
            expense: questData.expenseName,
            unit_price: questData.unitPrice,
            frequency: questData.frequencyId,
            action_level: questData.actionLevel,
            monthly_savings: questData.actionSavings,
            yearly_savings: questData.yearlySavings,
            five_year_potential: questData.fiveYearAmount
        });

        onComplete({
            questId: 'micro-expenses',
            expenseName: questData.expenseName,
            unitPrice: questData.unitPrice,
            frequencyId: questData.frequencyId,
            timesPerWeek: questData.timesPerWeek,
            actionLevel: questData.actionLevel,
            monthlySavings: questData.actionSavings,
            yearlySavings: questData.yearlySavings,
            fiveYearPotential: questData.fiveYearAmount,
            yearlyEquivalent: questData.yearlyEquivalent,
            dailyAmount: questData.dailyAmount,
            monthlyAmount: questData.monthlyAmount,
            yearlyAmount: questData.yearlyAmount,
            tenYearAmount: questData.tenYearAmount,
            xpEarned: quest.xp || 120,
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
            {/* Texture Overlay (Micro Mode) - Pattern extends to top, covers 100vh, visible behind header */}
            <div
                className="fixed top-0 left-0 w-full h-screen opacity-[0.03] pointer-events-none z-[1]"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zzM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                }}
            />

            {/* Main Container - Fullscreen */}
            <motion.div
                {...fullscreenVariants.content}
                transition={{ duration: TRANSITIONS.modalEntry.duration, ease: EASE.outExpo }}
                className="w-full h-full min-h-screen bg-transparent overflow-hidden relative flex flex-col z-10"
            >

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-1 bg-neutral-800 w-full z-50">
                    <motion.div
                        className="h-full bg-volt transition-all duration-500 ease-out shadow-[0_0_10px_rgba(226,255,0,0.4)]"
                        initial={{ width: '0%' }}
                        animate={{ width: progressWidth }}
                    />
                </div>

                {/* Header - Tactical Glass Effect: Floating above pattern with very light gradient + backdrop blur */}
                <div
                    className="absolute top-0 left-0 w-full p-6 pt-8 flex justify-between items-center z-40"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 60%, transparent 100%)',
                        backdropFilter: 'blur(1px)',
                        WebkitBackdropFilter: 'blur(1px)'
                    }}
                >
                    <div className="flex items-center gap-4">
                        {/* UNIFORM BACK BUTTON */}
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
                            {/* Fil d'Ariane - petit jaune */}
                            <span className="font-mono text-[11px] text-volt tracking-wide uppercase block">
                                {phaseLabels[phase]?.[locale] || phaseLabels[phase]?.fr}
                            </span>
                            {/* Titre de l'étape - ÉNORME blanc - Animated */}
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
                            {/* Instruction - moyen gris - Animated */}
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={`${phase}-${protocolPage}-${executionStep}-subtitle`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15, delay: 0.05 }}
                                    className="font-mono text-[11px] text-neutral-400 tracking-wide uppercase mt-1"
                                >
                                    {getStepSubtitle()[locale] || getStepSubtitle().fr}
                                </motion.p>
                            </AnimatePresence>
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

                {/* Content Body - Padding top to account for absolute header */}
                <div className="flex-1 overflow-hidden relative pt-32">
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
                                    // Control internal state from parent
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
                                    // Control internal state from parent
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
                                    xpReward={quest.xp || 120}
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

export default MicroExpensesFlow;
