import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Zap, Flame, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getConcreteImpact, calculateCompoundGrowth } from '../insightData';

/**
 * DebriefScreen - Phase 3: Celebration & Rewards
 * 
 * Features:
 * - Animated counter for annual impact
 * - Concrete Impact card with emoji icon
 * - XP and Streak reward cards
 */
const DebriefScreen = ({
    data = {},
    xpReward = 140,
    currentStreak = 1,
    xpProgress = 75,
    onComplete
}) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Calculate annual impact
    const annualImpact = data.annualAmount || (data.monthlyAmount * 12) || 0;
    const monthlyAmount = data.monthlyAmount || (data.annualAmount / 12) || 0;

    // Calculate compound growth (10 years at 7%)
    const compoundGrowth = calculateCompoundGrowth(monthlyAmount, 10, 0.07);

    // Get concrete impact (includes icon emoji and text)
    const concreteImpact = getConcreteImpact(annualImpact, locale);


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
            colors: ['#E2FF00', '#FFFFFF', '#FFD700'],
            startVelocity: 35,
            gravity: 1.2,
            scalar: 1.1,
            ticks: 150
        });

        // Counting animation
        const end = Math.round(annualImpact);
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
    }, [annualImpact]);

    // Helper to render bold text marked with **
    const renderWithBold = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="text-yellow-400">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    // Labels
    const labels = {
        fr: {
            impactLabel: 'IMPACT ANNUEL',
            perYear: '/AN',
            realWorldValue: 'IMPACT CONCRET',
            xpLabel: 'XP RÉCOLTÉS',
            streakLabel: 'SÉRIE ACTIVE',
            streakSublabel: 'Continue sur ta lancée !',
            compoundLabel: 'POTENTIEL 10 ANS',
            compoundDesc: 'Placé à 7%/an pendant 10 ans',
            cta: 'CLÔTURER LA MISSION'
        },
        en: {
            impactLabel: 'ANNUAL IMPACT',
            perYear: '/YEAR',
            realWorldValue: 'REAL WORLD VALUE',
            xpLabel: 'XP EARNED',
            streakLabel: 'ACTIVE STREAK',
            streakSublabel: 'Keep the momentum!',
            compoundLabel: '10-YEAR POTENTIAL',
            compoundDesc: 'If reinvested at 7%/year',
            cta: 'CLOSE MISSION'
        }
    };
    const currentLabels = labels[locale] || labels.fr;

    return (
        <div className="h-full flex flex-col">
            {/* Main content - centered */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

                {/* Background pulse glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-volt/20 rounded-full blur-[80px] animate-pulse" />

                {/* ===== BIG NUMBER ===== */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'backOut' }}
                    className="relative z-10 mb-4"
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

                {/* ===== CONCRETE IMPACT CARD ===== */}
                <AnimatePresence>
                    {showImpactCard && concreteImpact.text && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, ease: 'backOut' }}
                            className="w-full mb-8 relative z-10"
                        >
                            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 flex items-center gap-4 text-left">
                                {/* Icon Circle - uses emoji from insightData */}
                                <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center flex-shrink-0 border border-yellow-400/30">
                                    <span className="text-xl">{concreteImpact.icon}</span>
                                </div>

                                {/* Content */}
                                <div>
                                    <span className="block font-mono text-[9px] text-yellow-600 uppercase font-bold mb-0.5">
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
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.5 }}
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
                                                transition={{ delay: 0.3, duration: 0.8 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <span className="font-mono text-xl font-bold text-white">+{calculatedXp}</span>
                            </motion.div>

                            {/* Card 2: Streak */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                        <Flame className="w-5 h-5 text-blue-500 fill-blue-500" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-sm">{currentLabels.streakLabel}</div>
                                        <div className="font-mono text-[9px] text-neutral-500">{currentLabels.streakSublabel}</div>
                                    </div>
                                </div>
                                <span className="font-mono text-xl font-bold text-blue-500">+1</span>
                            </motion.div>

                            {/* Card 3: Compound Growth (10 years) */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="bg-gradient-to-r from-emerald-900/30 to-neutral-900/80 border border-emerald-800/30 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-900/50 flex items-center justify-center border border-emerald-700/50">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-sm">{currentLabels.compoundLabel}</div>
                                        <div className="font-mono text-[9px] text-neutral-500">{currentLabels.compoundDesc}</div>
                                    </div>
                                </div>
                                <span className="font-mono text-xl font-bold text-emerald-400">+€{compoundGrowth.toLocaleString()}</span>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer: CTA */}
            <div className="p-6 bg-black border-t border-neutral-800">
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
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
