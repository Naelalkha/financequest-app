import { useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle2, TrendingUp, Zap, Flame, Sparkles, Target, Info,
    Plane, Smartphone, Palmtree, Home, Rocket, Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getConcreteImpact, calculateCompoundGrowth } from '../insightData';
import { haptic } from '../../../../../utils/haptics';

// Map iconName to Lucide icon component
const ICON_MAP: Record<string, React.ElementType> = {
    Plane,
    Smartphone,
    Palmtree,
    Home,
    Rocket,
    Gift, // fallback
};

const getIconComponent = (iconName?: string): React.ElementType => {
    if (!iconName) return Gift;
    return ICON_MAP[iconName] || Gift;
};

/** Quest data from execution phase */
interface QuestData {
  monthlyIncome?: number;
  idealSavings?: number;
  actualSavings?: number;
  didDiagnosis?: boolean;
  fiveYearProjection?: number;
  hasCommitted?: boolean;
  recoveryPotential?: number;
  userAboveTarget?: boolean;
  [key: string]: unknown;
}

/** Props for DebriefScreen */
interface DebriefScreenProps {
  data?: QuestData;
  xpReward?: number;
  currentStreak?: number;
  hasCommitted?: boolean;
  recoveryPotential?: number;
  onComplete: () => void;
}

/**
 * DebriefScreen - Phase 3: Impact Confirmation
 *
 * Quest: BUDGET 50/30/20
 * VERSION A (hasCommitted = true):
 * - Shows annual recovery potential in volt
 * - Concrete impact equivalent
 * - 5-year projection
 * - 120 XP + Badge + Streak
 *
 * VERSION B (hasCommitted = false):
 * - Shows savings goal (not volt)
 * - Info card about retaking the quest
 * - 80 XP + Badge (no streak)
 */
const DebriefScreen: React.FC<DebriefScreenProps> = ({
    data = {},
    xpReward = 120,
    currentStreak = 1,
    hasCommitted = false,
    recoveryPotential = 0,
    onComplete
}) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Detect if user is already above target (recoveryPotential = 0)
    const isAboveTarget = hasCommitted && recoveryPotential === 0;

    // Get actual savings from data for "above target" case
    const actualSavings = data.actualSavings || 0;

    // Get data from execution phase - use recoveryPotential for committed users
    // If above target, use actualSavings instead
    const monthlyAmount = isAboveTarget
        ? actualSavings
        : (hasCommitted ? recoveryPotential : (data.idealSavings || 0));
    const yearlyAmount = monthlyAmount * 12;
    const fiveYearAmount = isAboveTarget
        ? calculateCompoundGrowth(actualSavings, 5, 0.07)
        : (hasCommitted
            ? calculateCompoundGrowth(recoveryPotential, 5, 0.07)
            : (data.fiveYearProjection || calculateCompoundGrowth(data.idealSavings || 0, 5, 0.07)));

    // Get concrete impact for display (use actualSavings if above target)
    const concreteImpact = getConcreteImpact(yearlyAmount, locale);

    // Animation states
    const [animatedAmount, setAnimatedAmount] = useState(0);
    const [showContent, setShowContent] = useState(false);

    // Trigger confetti and counter on mount
    useEffect(() => {
        // Celebration haptic feedback
        haptic.success();

        // Celebration confetti (only if committed and has impact)
        if (hasCommitted && yearlyAmount > 0) {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#E2FF00', '#FFFFFF', '#10B981'],
                startVelocity: 35,
                gravity: 1.2,
                scalar: 1.1,
                ticks: 150
            });
        }

        // Counting animation
        const end = Math.round(hasCommitted ? yearlyAmount : monthlyAmount);
        const duration = 1000;
        const increment = end / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                setAnimatedAmount(end);
                clearInterval(timer);
                setTimeout(() => setShowContent(true), 200);
            } else {
                setAnimatedAmount(Math.round(current));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [yearlyAmount, monthlyAmount, hasCommitted]);

    // Helper to render bold text marked with **
    const renderWithBold = (text: string): ReactNode[] => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="text-white font-semibold">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    // Labels - VERSION A (committed) vs VERSION B (not committed) vs VERSION C (above target)
    const labels = {
        fr: {
            // VERSION A - Committed with potential
            goalLabelA: 'GAIN ANNUEL ESTIMÉ',
            subheaderA: 'POTENTIEL DÉBLOQUÉ',
            equivalent: 'CONCRÈTEMENT',
            monthlyLabel: 'PAR MOIS',
            projectionLabel: 'POTENTIEL 5 ANS',
            projectionDesc: 'Si investi à 7%/an',
            xpLabel: 'RÉCOMPENSES',
            badgeLabel: 'Badge',
            badgeName: 'ARCHITECTE',
            streakLabel: 'SÉRIE',
            cta: 'TERMINER',

            // VERSION B - Not committed
            goalLabelB: 'TON OBJECTIF D\'ÉPARGNE',
            subheaderB: 'OBJECTIF DÉFINI',
            retakeInfo: 'Quand tu seras prêt à t\'engager, refais la mission pour débloquer l\'impact.',
            perMonth: '/mois',

            // VERSION C - Above target (potential = 0)
            goalLabelC: 'TON ÉPARGNE ACTUELLE',
            subheaderC: 'Objectif atteint',
            aboveTargetMessage: 'Tu épargnes déjà au-dessus de l\'objectif 50/30/20.',
            currentMonthlyLabel: 'ÉPARGNE MENSUELLE'
        },
        en: {
            // VERSION A - Committed with potential
            goalLabelA: 'ESTIMATED YEARLY GAIN',
            subheaderA: 'POTENTIAL UNLOCKED',
            equivalent: 'IN REAL TERMS',
            monthlyLabel: 'PER MONTH',
            projectionLabel: '5-YEAR POTENTIAL',
            projectionDesc: 'If invested at 7%/year',
            xpLabel: 'REWARDS',
            badgeLabel: 'Badge',
            badgeName: 'ARCHITECT',
            streakLabel: 'STREAK',
            cta: 'FINISH',

            // VERSION B - Not committed
            goalLabelB: 'YOUR SAVINGS GOAL',
            subheaderB: 'GOAL DEFINED',
            retakeInfo: 'When you\'re ready to commit, retake the mission to unlock the impact.',
            perMonth: '/month',

            // VERSION C - Above target (potential = 0)
            goalLabelC: 'YOUR CURRENT SAVINGS',
            subheaderC: 'Goal achieved',
            aboveTargetMessage: 'You\'re already saving above the 50/30/20 target.',
            currentMonthlyLabel: 'MONTHLY SAVINGS'
        }
    };
    const L = labels[locale] || labels.fr;

    // VERSION A: User committed - show full impact
    if (hasCommitted) {
        return (
            <div className="h-full flex flex-col">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 pt-2 pb-32">

                        {/* HERO SECTION */}
                        <div className="text-center mb-8 pt-4">

                            {/* Badge "Objectif atteint" si above target */}
                            {isAboveTarget && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className="inline-flex items-center gap-2 bg-volt/20 border border-volt/30 rounded-full px-4 py-1.5 mb-4"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-volt" />
                                    <span className="font-mono text-xs text-volt font-bold uppercase">
                                        {L.subheaderC}
                                    </span>
                                </motion.div>
                            )}

                            {/* Label */}
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="font-mono text-[12px] text-neutral-500 uppercase tracking-wide mb-2 block"
                            >
                                {isAboveTarget ? L.goalLabelC : L.goalLabelA}
                            </motion.span>

                            {/* HERO NUMBER - VOLT */}
                            <motion.h2
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.4, ease: 'backOut', delay: 0.15 }}
                                className="text-5xl md:text-6xl font-black text-volt tracking-tighter"
                                style={{ textShadow: '0 0 30px rgba(226, 255, 0, 0.5)' }}
                            >
                                {isAboveTarget ? '' : '+'}{animatedAmount.toLocaleString('fr-FR')} €
                                {isAboveTarget && <span className="text-2xl text-volt/70">/an</span>}
                            </motion.h2>

                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="font-mono text-sm text-neutral-400 block mt-1"
                            >
                                {isAboveTarget ? L.aboveTargetMessage : 'Chaque mois compte.'}
                            </motion.span>
                        </div>

                        {/* CARDS */}
                        <AnimatePresence>
                            {showContent && (
                                <div className="space-y-3">

                                    {/* Card 1: Equivalent Value */}
                                    {(() => {
                                        const IconComponent = getIconComponent(concreteImpact.iconName);
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-volt/10 flex items-center justify-center flex-shrink-0">
                                                        <IconComponent className="w-6 h-6 text-volt" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <span className="block font-mono text-[11px] text-neutral-500 uppercase font-bold mb-1">
                                                            {L.equivalent}
                                                        </span>
                                                        <span className="text-sm font-bold text-white block leading-tight">
                                                            {renderWithBold(concreteImpact.text)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })()}

                                    {/* Card 2: Monthly + Projection */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, delay: 0.04 }}
                                        className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                                    >
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800">
                                            <div className="flex items-center gap-3">
                                                <TrendingUp className="w-5 h-5 text-neutral-500" />
                                                <span className="font-mono text-[11px] text-neutral-400 uppercase">
                                                    {isAboveTarget ? L.currentMonthlyLabel : L.monthlyLabel}
                                                </span>
                                            </div>
                                            <span className="font-mono text-xl font-bold text-volt">
                                                {isAboveTarget ? '' : '+'}{monthlyAmount.toLocaleString('fr-FR')} €
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Sparkles className="w-5 h-5 text-volt" />
                                                <div className="text-left">
                                                    <div className="font-mono text-[11px] text-white font-bold uppercase">
                                                        {L.projectionLabel}
                                                    </div>
                                                    <div className="font-mono text-[10px] text-neutral-400">
                                                        {L.projectionDesc}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="font-mono text-lg font-bold text-emerald-400">
                                                +{fiveYearAmount.toLocaleString('fr-FR')} €
                                            </span>
                                        </div>
                                    </motion.div>

                                    {/* Card 3: Rewards (XP + Badge + Streak) */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, delay: 0.08 }}
                                        className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                                    >
                                        <span className="block font-mono text-[11px] text-neutral-500 uppercase font-bold mb-3">
                                            {L.xpLabel}
                                        </span>
                                        <div className="flex items-center">
                                            {/* XP */}
                                            <div className="flex-1 flex items-center justify-center gap-2 border-r border-neutral-800 pr-4">
                                                <Zap className="w-5 h-5 text-volt" />
                                                <span className="font-mono text-lg font-bold text-white">
                                                    +{xpReward} XP
                                                </span>
                                            </div>
                                            {/* Streak */}
                                            <div className="flex-1 flex items-center justify-center gap-2 pl-4">
                                                <Flame className="w-5 h-5 text-orange-500" />
                                                <span className="font-mono text-lg font-bold text-white">
                                                    {L.streakLabel}
                                                </span>
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 25 }}
                                                    className="font-mono text-sm font-bold text-orange-500 bg-orange-500/20 px-2 py-0.5 rounded"
                                                >
                                                    +1
                                                </motion.span>
                                            </div>
                                        </div>
                                    </motion.div>

                                </div>
                            )}
                        </AnimatePresence>

                    </div>
                </div>

                {/* Footer CTA */}
                <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                            haptic.heavy();
                            onComplete();
                        }}
                        className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] border-black cta-ios-fix cta-active"
                    >
                        <span className="cta-content cta-content-animate">
                            <CheckCircle2 className="w-5 h-5" />
                            {L.cta}
                        </span>
                    </motion.button>
                </div>
            </div>
        );
    }

    // VERSION B: User did not commit - show goal only, no impact
    return (
        <div className="h-full flex flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 pt-2 pb-32">

                    {/* HERO SECTION */}
                    <div className="text-center mb-8 pt-4">

                        {/* Label */}
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="font-mono text-[12px] text-neutral-500 uppercase tracking-wide mb-2 block"
                        >
                            {L.goalLabelB}
                        </motion.span>

                        {/* HERO NUMBER - WHITE (not volt) */}
                        <motion.h2
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, ease: 'backOut', delay: 0.15 }}
                            className="text-5xl md:text-6xl font-black text-white tracking-tighter"
                        >
                            {animatedAmount.toLocaleString('fr-FR')} €
                            <span className="text-2xl text-neutral-400">{L.perMonth}</span>
                        </motion.h2>

                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="font-mono text-sm text-neutral-400 block mt-1"
                        >
                            Tu sais ce que tu dois viser.
                        </motion.span>
                    </div>

                    {/* CARDS */}
                    <AnimatePresence>
                        {showContent && (
                            <div className="space-y-3">

                                {/* Card 1: Info - Retake quest */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0">
                                            <Info className="w-5 h-5 text-neutral-400" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <span className="text-sm text-neutral-300 block leading-relaxed">
                                                {L.retakeInfo}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Card 2: Rewards (XP + Badge only, no streak) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: 0.04 }}
                                    className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                                >
                                    <span className="block font-mono text-[11px] text-neutral-500 uppercase font-bold mb-3">
                                        {L.xpLabel}
                                    </span>
                                    <div className="flex items-center">
                                        {/* XP */}
                                        <div className="flex-1 flex items-center justify-center gap-2 border-r border-neutral-800 pr-4">
                                            <Zap className="w-5 h-5 text-volt" />
                                            <span className="font-mono text-lg font-bold text-white">
                                                +{xpReward} XP
                                            </span>
                                        </div>
                                        {/* Badge */}
                                        <div className="flex-1 flex items-center justify-center gap-2 pl-4">
                                            <Target className="w-5 h-5 text-emerald-400" />
                                            <span className="font-mono text-sm font-bold text-emerald-400">
                                                {L.badgeName}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                            </div>
                        )}
                    </AnimatePresence>

                </div>
            </div>

            {/* Footer CTA */}
            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                        haptic.heavy();
                        onComplete();
                    }}
                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] border-black cta-ios-fix cta-active"
                >
                    <span className="cta-content cta-content-animate">
                        <CheckCircle2 className="w-5 h-5" />
                        {L.cta}
                    </span>
                </motion.button>
            </div>
        </div>
    );
};

export default DebriefScreen;
