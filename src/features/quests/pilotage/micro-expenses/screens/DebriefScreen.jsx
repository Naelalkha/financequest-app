import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getConcreteImpact, calculateCompoundGrowth, actionLevels } from '../insightData';

/**
 * DebriefScreen - Phase 3: Celebration & Rewards
 * 
 * Quest 02: L'EFFET CUMULÉ
 * Updated to show savings based on selected action level:
 * - Badge: 💰 ÉCONOMIE VERROUILLÉE
 * - Hero: Big savings number (based on action level)
 * - Action level badge
 * - Card 1 (Gold): What you can afford
 * - Card 2 (White): XP + Streak
 * - Card 3 (White): 5-year potential
 */
const DebriefScreen = ({
    data = {},
    xpReward = 120,
    currentStreak = 1,
    onComplete
}) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Get data from execution phase - now uses yearlySavings from action level
    const yearlySavings = data.yearlySavings || data.yearlyAmount || (data.dailyAmount * 365) || 0;
    const monthlySavings = data.actionSavings || data.monthlyAmount || Math.round(yearlySavings / 12);
    const fiveYearAmount = data.fiveYearAmount || data.tenYearAmount || calculateCompoundGrowth(monthlySavings, 5, 0.07);
    
    // Get selected action level info
    const selectedActionId = data.actionLevel || 'radical';
    const currentActionLevels = actionLevels[locale] || actionLevels.fr;
    const selectedAction = currentActionLevels.find(a => a.id === selectedActionId) || currentActionLevels[2];

    // Get concrete impact based on yearly savings (not total expense)
    const concreteImpact = getConcreteImpact(yearlySavings, locale);
    
    // Get yearly equivalent from data if available
    const yearlyEquivalent = data.yearlyEquivalent || null;

    // Animation states
    const [animatedSavings, setAnimatedSavings] = useState(0);
    const [showCards, setShowCards] = useState(false);

    // Use XP from quest metadata (passed as xpReward prop)
    const calculatedXp = xpReward;

    // Trigger confetti and counter on mount
    useEffect(() => {
        // Volt-colored confetti - more particles for radical level
        const particleCount = selectedActionId === 'radical' ? 120 : selectedActionId === 'strategist' ? 100 : 80;
        
        confetti({
            particleCount,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#E2FF00', '#FFFFFF', '#10B981', '#F59E0B'],
            startVelocity: 40,
            gravity: 1.1,
            scalar: 1.2,
            ticks: 180
        });

        // Counting animation
        const end = Math.round(yearlySavings);
        const duration = 1200;
        const increment = end / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                setAnimatedSavings(end);
                clearInterval(timer);
                // Show cards after counting animation
                setTimeout(() => setShowCards(true), 300);
            } else {
                setAnimatedSavings(Math.round(current));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [yearlySavings, selectedActionId]);

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
            pageTitle: 'OBJECTIF',
            pageSubtitle: 'Économie débloquée',
            impactLabel: 'TU RÉCUPÈRES',
            subtitle: 'Cet argent t\'appartient désormais.',
            realWorldValue: 'CE QUE TU PEUX T\'OFFRIR',
            monthlyGain: 'GAIN MENSUEL',
            fiveYearLabel: 'POTENTIEL 5 ANS',
            fiveYearDesc: 'Si réinvesti à 7%/an',
            cta: 'VALIDER MON OBJECTIF'
        },
        en: {
            pageTitle: 'OBJECTIVE',
            pageSubtitle: 'Savings unlocked',
            impactLabel: 'YOU RECOVER',
            subtitle: 'This money is now yours.',
            realWorldValue: 'WHAT YOU CAN AFFORD',
            monthlyGain: 'MONTHLY GAIN',
            fiveYearLabel: '5-YEAR POTENTIAL',
            fiveYearDesc: 'If reinvested at 7%/year',
            cta: 'VALIDATE MY GOAL'
        }
    };
    const currentLabels = labels[locale] || labels.fr;

    return (
        <div className="h-full flex flex-col">
            {/* Main content - centered */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

                {/* Background pulse glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] animate-pulse" />

                {/* ===== ACTION LEVEL BADGE ===== */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'backOut' }}
                    className="mb-4 relative z-10"
                >
                    <div className="inline-flex items-center gap-2 bg-volt/10 border border-volt/30 rounded-full px-4 py-2">
                        <span className="text-lg">{selectedAction.icon}</span>
                        <span className="font-mono text-[10px] text-volt font-bold uppercase tracking-wide">
                            {selectedAction.title}
                        </span>
                    </div>
                </motion.div>

                {/* ===== LABEL ===== */}
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="font-mono text-[10px] text-neutral-500 uppercase tracking-wide mb-2 block relative z-10"
                >
                    {currentLabels.impactLabel}
                </motion.span>

                {/* ===== HERO NUMBER (huge neon green) ===== */}
                <motion.h2
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'backOut', delay: 0.15 }}
                    className="text-6xl md:text-7xl font-black text-volt tracking-tighter relative z-10"
                    style={{ textShadow: '0 0 40px rgba(226, 255, 0, 0.6)' }}
                >
                    +&nbsp;{animatedSavings.toLocaleString('fr-FR')}&nbsp;€
                </motion.h2>

                {/* ===== SUBTITLE ===== */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-neutral-400 mt-2 mb-6 relative z-10"
                >
                    {currentLabels.subtitle}
                </motion.p>

                {/* ===== CARDS ===== */}
                <AnimatePresence>
                    {showCards && (
                        <div className="w-full space-y-3 relative z-10">

                            {/* Card 1: What You Can Afford (Gold Frame) */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 text-left"
                            >
                                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                                    <span className="text-2xl">{yearlyEquivalent?.icon || concreteImpact.icon || '🎁'}</span>
                                </div>
                                <div className="flex-1">
                                    <span className="block font-mono text-[9px] text-amber-500 uppercase font-bold mb-0.5">
                                        {currentLabels.realWorldValue}
                                    </span>
                                    <span className="text-sm font-bold text-white block leading-tight">
                                        {yearlyEquivalent?.text || renderWithBold(concreteImpact.text)}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Card 1.5: Monthly Gain */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.03 }}
                                className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold">
                                        {currentLabels.monthlyGain}
                                    </span>
                                </div>
                                <span className="font-mono text-xl font-bold text-emerald-400">
                                    +{monthlySavings.toLocaleString('fr-FR')} €
                                </span>
                            </motion.div>

                            {/* Card 2: XP + Série (White Frame, 50/50 Split) */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.06 }}
                                className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex items-stretch"
                            >
                                {/* XP Side */}
                                <div className="flex-1 flex items-center justify-center gap-2 border-r border-neutral-700 pr-4">
                                    <span className="text-xl">⚡️</span>
                                    <span className="font-mono text-lg font-bold text-white">+{calculatedXp} XP</span>
                                </div>
                                {/* Streak Side */}
                                <div className="flex-1 flex items-center justify-center gap-2 pl-4">
                                    <span className="text-xl">🔥</span>
                                    <span className="font-mono text-lg font-bold text-white">SÉRIE</span>
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
                                        className="font-mono text-sm font-bold text-orange-500 bg-orange-500/20 px-2 py-0.5 rounded"
                                    >
                                        +1
                                    </motion.span>
                                </div>
                            </motion.div>

                            {/* Card 3: Potentiel 5 ans (White Frame) */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.09 }}
                                className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">📈</span>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-sm">{currentLabels.fiveYearLabel}</div>
                                        <div className="font-mono text-[9px] text-neutral-500">{currentLabels.fiveYearDesc}</div>
                                    </div>
                                </div>
                                <span className="font-mono text-xl font-bold text-emerald-400">+{fiveYearAmount.toLocaleString('fr-FR')} €</span>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer: CTA */}
            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800">
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onComplete}
                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,255,0,0.3)] transition-all"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    {currentLabels.cta}
                </motion.button>
            </div>
        </div>
    );
};

export default DebriefScreen;
