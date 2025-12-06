import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Zap, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * DebriefScreen - Phase 3: Celebration & Rewards
 * 
 * Animated counter, pulse glow, staggered reward cards
 */
const DebriefScreen = ({
    data = {},
    xpReward = 140,
    currentStreak = 1,
    xpProgress = 75,
    onComplete
}) => {
    const { t, i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Calculate annual impact
    const annualImpact = data.annualAmount || (data.monthlyAmount * 12) || 0;

    // Animation states
    const [animatedSavings, setAnimatedSavings] = useState(0);
    const [showRewards, setShowRewards] = useState(false);

    // Calculate dynamic XP based on savings
    const calculatedXp = Math.floor(annualImpact / 2) + 100;

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
                setShowRewards(true);
            } else {
                setAnimatedSavings(Math.round(current));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [annualImpact]);

    // Translations
    const labels = {
        fr: {
            impactLabel: 'IMPACT ANNUEL',
            perYear: '/AN',
            xpLabel: 'XP RÉCOLTÉS',
            xpSublabel: 'Progression niveau',
            streakLabel: 'SÉRIE ACTIVE',
            streakSublabel: 'Keep the momentum',
            cta: 'MISSION ACCOMPLIE'
        },
        en: {
            impactLabel: 'ANNUAL IMPACT',
            perYear: '/YEAR',
            xpLabel: 'XP EARNED',
            xpSublabel: 'Level progression',
            streakLabel: 'ACTIVE STREAK',
            streakSublabel: 'Keep the momentum',
            cta: 'MISSION ACCOMPLISHED'
        }
    };
    const currentLabels = labels[locale] || labels.fr;

    return (
        <div className="h-full flex flex-col">
            {/* Main content - centered */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

                {/* Background pulse glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-volt/20 rounded-full blur-[80px] animate-pulse" />

                {/* Big Number */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'backOut' }}
                    className="relative z-10 mb-8"
                >
                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.3em] mb-2 block">
                        {currentLabels.impactLabel}
                    </span>
                    <h2 className="text-6xl md:text-7xl font-black text-volt tracking-tighter text-glow-volt">
                        +€{animatedSavings}
                    </h2>
                    <span className="font-mono text-sm text-neutral-400 uppercase mt-1 block">
                        {currentLabels.perYear}
                    </span>
                </motion.div>

                {/* LOOT CARDS (Staggered) */}
                <AnimatePresence>
                    {showRewards && (
                        <div className="w-full space-y-3 relative z-10">
                            {/* Card 1: XP */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0, duration: 0.5 }}
                                className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                        <Zap className="w-5 h-5 text-volt fill-volt" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-sm">{currentLabels.xpLabel}</div>
                                        {/* Mini progress bar */}
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
                                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-sm">{currentLabels.streakLabel}</div>
                                        <div className="font-mono text-[9px] text-neutral-500">{currentLabels.streakSublabel}</div>
                                    </div>
                                </div>
                                <span className="font-mono text-xl font-bold text-orange-500">+1</span>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer: CTA */}
            <div className="p-6 bg-[#0A0A0A] border-t border-neutral-800">
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onComplete}
                    className="w-full bg-volt text-black font-black font-sans py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-volt-glow"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    {currentLabels.cta}
                </motion.button>
            </div>
        </div>
    );
};

export default DebriefScreen;
