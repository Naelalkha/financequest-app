import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, TrendingUp, Zap, Flame, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateCompoundGrowth } from '../insightData';

import { getConcreteRewardIcon } from './ExecutionScreen';

/**
 * DebriefScreen - Phase 3: Goal Confirmation
 * 
 * Quest 02: L'EFFET CUMULÉ
 * REDESIGNED for consistency:
 * - Same scroll layout as other screens
 * - Honest wording (it's an OBJECTIVE, not achieved yet)
 * - Unified card styles (neutral with accent colors on numbers)
 * - Lucide icons instead of emojis
 */
const DebriefScreen = ({
    data = {},
    xpReward = 120,
    currentStreak = 1,
    onComplete
}) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Get data from execution phase
    const yearlySavings = data.yearlySavings || data.yearlyAmount || (data.dailyAmount * 365) || 0;
    const monthlySavings = data.actionSavings || data.monthlyAmount || Math.round(yearlySavings / 12);
    const fiveYearAmount = data.fiveYearAmount || data.tenYearAmount || calculateCompoundGrowth(monthlySavings, 5, 0.07);
    
    // Get concrete icon for display (consistent with ExecutionScreen)
    const concreteIcon = getConcreteRewardIcon(yearlySavings, locale);
    const yearlyEquivalent = data.yearlyEquivalent || null;

    // Animation states
    const [animatedSavings, setAnimatedSavings] = useState(0);
    const [showContent, setShowContent] = useState(false);

    // Trigger confetti and counter on mount
    useEffect(() => {
        // Celebration confetti
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

        // Counting animation
        const end = Math.round(yearlySavings);
        const duration = 1000;
        const increment = end / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                setAnimatedSavings(end);
                clearInterval(timer);
                setTimeout(() => setShowContent(true), 200);
            } else {
                setAnimatedSavings(Math.round(current));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [yearlySavings]);

    // Labels - FINAL WORDING
    const labels = {
        fr: {
            pageTitle: 'IMPACT',
            pageSubtitle: 'Potentiel débloqué',
            goalLabel: 'GAIN ANNUEL ESTIMÉ',
            subtitle: 'Chaque mois compte.',
            equivalent: 'CONCRÈTEMENT',
            monthlyLabel: 'PAR MOIS',
            projectionLabel: 'POTENTIEL 5 ANS',
            projectionDesc: 'Si réinvesti à 7%/an',
            xpLabel: 'RÉCOMPENSES',
            cta: 'MISSION ACCOMPLIE'
        },
        en: {
            pageTitle: 'IMPACT',
            pageSubtitle: 'Potential unlocked',
            goalLabel: 'ESTIMATED YEARLY GAIN',
            subtitle: 'Every month counts.',
            equivalent: 'IN REAL TERMS',
            monthlyLabel: 'PER MONTH',
            projectionLabel: '5-YEAR POTENTIAL',
            projectionDesc: 'If reinvested at 7%/year',
            xpLabel: 'REWARDS',
            cta: 'MISSION ACCOMPLISHED'
        }
    };
    const L = labels[locale] || labels.fr;

    return (
        <div className="h-full flex flex-col">
            {/* Scrollable Content - Same structure as other screens */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 pt-2 pb-32">

                    {/* ===== HERO SECTION ===== */}
                    <div className="text-center mb-8 pt-4">
                        
                        {/* Label */}
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                            className="font-mono text-[10px] text-neutral-500 uppercase tracking-wide mb-2 block"
                >
                            {L.goalLabel}
                </motion.span>

                        {/* HERO NUMBER */}
                <motion.h2
                            initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, ease: 'backOut', delay: 0.15 }}
                            className="text-5xl md:text-6xl font-black text-volt tracking-tighter"
                            style={{ textShadow: '0 0 30px rgba(226, 255, 0, 0.5)' }}
                >
                            +{animatedSavings.toLocaleString('fr-FR')} €
                </motion.h2>

                        {/* Subtitle - HONEST */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="text-sm text-neutral-500 mt-2"
                >
                            {L.subtitle}
                </motion.p>
                    </div>

                    {/* ===== CARDS - Unified Style ===== */}
                <AnimatePresence>
                        {showContent && (
                            <div className="space-y-3">

                                {/* Card 1: Equivalent Value */}
                            <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
                            >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-volt/10 flex items-center justify-center flex-shrink-0">
                                            {concreteIcon.icon}
                                </div>
                                        <div className="flex-1 text-left">
                                            <span className="block font-mono text-[10px] text-neutral-500 uppercase font-bold mb-1">
                                                {L.equivalent}
                                    </span>
                                    <span className="text-sm font-bold text-white block leading-tight">
                                                {concreteIcon.text}
                                    </span>
                                        </div>
                                </div>
                            </motion.div>

                                {/* Card 2: Monthly + Projection (Combined) */}
                            <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: 0.04 }}
                                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
                            >
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800">
                                <div className="flex items-center gap-3">
                                            <TrendingUp className="w-5 h-5 text-neutral-500" />
                                            <span className="font-mono text-[10px] text-neutral-400 uppercase">
                                                {L.monthlyLabel}
                                    </span>
                                </div>
                                        <span className="font-mono text-xl font-bold text-white">
                                    +{monthlySavings.toLocaleString('fr-FR')} €
                                </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Icon: Volt Yellow for Wow Effect */}
                                            <Sparkles className="w-5 h-5 text-volt" />
                                            <div className="text-left">
                                                {/* Label: White & Bold to distinguish from monthly line */}
                                                <div className="font-mono text-[10px] text-white font-bold uppercase">
                                                    {L.projectionLabel}
                                                </div>
                                                {/* Subtext: Lighter gray for accessibility */}
                                                <div className="font-mono text-[9px] text-neutral-400">
                                                    {L.projectionDesc}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="font-mono text-lg font-bold text-emerald-400">
                                            +{fiveYearAmount.toLocaleString('fr-FR')} €
                                        </span>
                                    </div>
                            </motion.div>

                                {/* Card 3: Rewards (XP + Streak) */}
                            <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: 0.08 }}
                                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
                                >
                                    <span className="block font-mono text-[10px] text-neutral-500 uppercase font-bold mb-3">
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
                                                SÉRIE
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

            {/* Footer CTA - Same as other screens */}
            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800">
                <motion.button
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                        type: 'spring', 
                        stiffness: 400, 
                        damping: 25,
                        delay: 0.6
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onComplete}
                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,255,0,0.3)] transition-all"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    {L.cta}
                </motion.button>
            </div>
        </div>
    );
};

export default DebriefScreen;
