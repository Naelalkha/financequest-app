import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Zap, Flame, TrendingUp, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getConcreteImpact, calculateCompoundGrowth } from '../insightData';

/**
 * DebriefScreen - Phase 3: Celebration & Rewards
 * 
 * Quest 02: TRAQUE INVISIBLE
 * Features:
 * - Animated impact counter
 * - Concrete Impact card
 * - XP and Streak reward cards
 * - Success message: "Cible verrouillée"
 * - CTA: "VALIDER CETTE ÉCONOMIE"
 */
const DebriefScreen = ({
    data = {},
    xpReward = 120,
    currentStreak = 1,
    xpProgress = 75,
    onComplete
}) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Get data from execution phase
    const yearlyAmount = data.yearlyAmount || (data.dailyAmount * 365) || 0;
    const fiveYearAmount = data.tenYearAmount || calculateCompoundGrowth(data.dailyAmount || 0, 5, 0.07);
    const expenseName = data.expenseName || data.customName || '';

    // Get concrete impact
    const concreteImpact = getConcreteImpact(yearlyAmount, locale);

    // Animation states
    const [animatedSavings, setAnimatedSavings] = useState(0);
    const [showImpactCard, setShowImpactCard] = useState(false);
    const [showRewards, setShowRewards] = useState(false);

    // Use XP from quest metadata (passed as xpReward prop)
    const calculatedXp = xpReward;

    // Trigger confetti and counter on mount
    useEffect(() => {
        // Volt-colored confetti
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#E2FF00', '#FFFFFF', '#F59E0B'],
            startVelocity: 35,
            gravity: 1.2,
            scalar: 1.1,
            ticks: 150
        });

        // Counting animation
        const end = Math.round(yearlyAmount);
        const duration = 1000;
        const increment = end / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                setAnimatedSavings(end);
                clearInterval(timer);
                // Show impact card first
                setTimeout(() => setShowImpactCard(true), 300);
                // Then show rewards
                setTimeout(() => setShowRewards(true), 600);
            } else {
                setAnimatedSavings(Math.round(current));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [yearlyAmount]);

    // Helper to render bold text marked with **
    const renderWithBold = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="text-amber-400">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    // Labels
    const labels = {
        fr: {
            successBadge: 'CIBLE VERROUILLÉE',
            successMessage: 'Tu viens de localiser une fuite de budget.',
            impactLabel: 'ÉCONOMIE ANNUELLE POTENTIELLE',
            perYear: '/AN',
            realWorldValue: 'IMPACT CONCRET',
            xpLabel: 'XP RÉCOLTÉS',
            streakLabel: 'SÉRIE ACTIVE',
            streakSublabel: 'Continue sur ta lancée !',
            fiveYearLabel: 'POTENTIEL 5 ANS',
            fiveYearDesc: 'Si réinvesti à 7%/an',
            expenseTracked: 'DÉPENSE IDENTIFIÉE',
            cta: 'VALIDER CETTE ÉCONOMIE'
        },
        en: {
            successBadge: 'TARGET LOCKED',
            successMessage: 'You just located a budget leak.',
            impactLabel: 'POTENTIAL ANNUAL SAVINGS',
            perYear: '/YEAR',
            realWorldValue: 'REAL WORLD VALUE',
            xpLabel: 'XP EARNED',
            streakLabel: 'ACTIVE STREAK',
            streakSublabel: 'Keep the momentum!',
            fiveYearLabel: '5-YEAR POTENTIAL',
            fiveYearDesc: 'If reinvested at 7%/year',
            expenseTracked: 'EXPENSE IDENTIFIED',
            cta: 'VALIDATE THIS SAVING'
        }
    };
    const currentLabels = labels[locale] || labels.fr;

    return (
        <div className="h-full flex flex-col">
            {/* Main content - centered */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

                {/* Background pulse glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] animate-pulse" />

                {/* ===== SUCCESS BADGE ===== */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: 'backOut' }}
                    className="mb-4 relative z-10"
                >
                    <div className="inline-flex items-center gap-2 bg-volt/10 border border-volt/30 rounded-full px-4 py-2">
                        <Target className="w-4 h-4 text-volt" />
                        <span className="font-mono text-[10px] text-volt font-bold uppercase tracking-widest">
                            {currentLabels.successBadge}
                        </span>
                    </div>
                </motion.div>

                {/* ===== BIG NUMBER ===== */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'backOut', delay: 0.1 }}
                    className="relative z-10 mb-2"
                >
                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.3em] mb-2 block">
                        {currentLabels.impactLabel}
                    </span>
                    <h2 className="text-6xl md:text-7xl font-black text-volt tracking-tighter" style={{ textShadow: '0 0 30px rgba(226, 255, 0, 0.5)' }}>
                        +€{animatedSavings}
                    </h2>
                    <span className="font-mono text-sm text-neutral-400 uppercase mt-1 block">
                        {currentLabels.perYear}
                    </span>
                </motion.div>

                {/* Success message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-neutral-400 mb-6 relative z-10"
                >
                    {currentLabels.successMessage}
                </motion.p>

                {/* ===== EXPENSE TRACKED BADGE ===== */}
                <AnimatePresence>
                    {showImpactCard && expenseName && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.25 }}
                            className="mb-4 relative z-10"
                        >
                            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
                                <span className="font-mono text-[9px] text-amber-600 uppercase">
                                    {currentLabels.expenseTracked}:
                                </span>
                                <span className="font-sans text-sm font-bold text-white">
                                    {expenseName}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ===== CONCRETE IMPACT CARD ===== */}
                <AnimatePresence>
                    {showImpactCard && concreteImpact.text && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="w-full mb-6 relative z-10"
                        >
                            <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 flex items-center gap-4 text-left">
                                {/* Icon Circle */}
                                <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center flex-shrink-0 border border-amber-400/30">
                                    <span className="text-xl">{concreteImpact.icon}</span>
                                </div>

                                {/* Content */}
                                <div>
                                    <span className="block font-mono text-[9px] text-amber-600 uppercase font-bold mb-0.5">
                                        {currentLabels.realWorldValue}
                                    </span>
                                    <span className="text-sm font-bold text-white block leading-tight">
                                        {renderWithBold(concreteImpact.text)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ===== LOOT CARDS ===== */}
                <AnimatePresence>
                    {showRewards && (
                        <div className="w-full space-y-3 relative z-10">
                            {/* Card 1: XP */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.25 }}
                                className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                        <Zap className="w-5 h-5 text-volt fill-volt" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-sm">{currentLabels.xpLabel}</div>
                                        <div className="w-24 h-1 bg-neutral-800 rounded-full mt-1.5 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-volt"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${xpProgress}%` }}
                                                transition={{ delay: 0.2, duration: 0.6 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <span className="font-mono text-xl font-bold text-white">+{calculatedXp}</span>
                            </motion.div>

                            {/* Card 2: Streak */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.25, delay: 0.05 }}
                                className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-sm">{currentLabels.streakLabel}</div>
                                        <div className="font-mono text-[9px] text-neutral-500">{currentLabels.streakSublabel}</div>
                                    </div>
                                </div>
                                <span className="font-mono text-xl font-bold text-orange-500">+1</span>
                            </motion.div>

                            {/* Card 3: 5-Year Potential */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.25, delay: 0.1 }}
                                className="bg-gradient-to-r from-emerald-900/30 to-neutral-900/80 border border-emerald-800/30 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-900/50 flex items-center justify-center border border-emerald-700/50">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-sm">{currentLabels.fiveYearLabel}</div>
                                        <div className="font-mono text-[9px] text-neutral-500">{currentLabels.fiveYearDesc}</div>
                                    </div>
                                </div>
                                <span className="font-mono text-xl font-bold text-emerald-400">+€{fiveYearAmount.toLocaleString()}</span>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer: CTA */}
            <div className="p-6 bg-black border-t border-neutral-800">
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onComplete}
                    className="w-full bg-volt text-black font-black font-sans py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,255,0,0.3)]"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    {currentLabels.cta}
                </motion.button>
            </div>
        </div>
    );
};

export default DebriefScreen;
