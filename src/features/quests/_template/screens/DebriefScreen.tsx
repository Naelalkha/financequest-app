/**
 * DebriefScreen - Phase 3: Celebration & Rewards
 * 
 * Template pour l'écran de débriefing
 * 
 * STRUCTURE STANDARD:
 * 1. Badge de succès (ex: "CIBLE VERROUILLÉE")
 * 2. Chiffre héro (gain annuel en vert néon)
 * 3. Subtitle satisfaisant
 * 4. Cartes de récompenses (Impact, XP, Streak, Projection)
 * 5. CTA: Clôturer la mission
 * 
 * CARTES CONDITIONNELLES (selon estimatedImpact.type dans metadata):
 * - 'savings' / 'earnings': Impact + Compound + XP/Streak
 * - 'one-time': Impact + XP/Streak
 * - 'none': XP/Streak uniquement
 * 
 * INSTRUCTIONS:
 * 1. Adapter les labels selon ta quête
 * 2. Personnaliser le badge de succès
 * 3. Ajuster les cartes affichées selon le type d'impact
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

// [TODO: Importer les fonctions d'impact depuis insightData.js]
import { getConcreteImpact, calculateCompoundGrowth } from '../insightData';

const DebriefScreen = ({
    data = {},
    xpReward = 100,
    currentStreak = 1,
    onComplete
}) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // =====================================================
    // CALCULATIONS
    // [TODO: Adapter selon les données de ta quête]
    // =====================================================
    const annualImpact = data.calculatedImpact || data.annualAmount || (data.amount * 12) || 0;
    const monthlyAmount = data.amount || (data.annualAmount / 12) || 0;

    // Calculate compound growth (5 years at 7%)
    const fiveYearGrowth = calculateCompoundGrowth(monthlyAmount, 5, 0.07);

    // Get concrete impact (includes icon emoji and text)
    const concreteImpact = getConcreteImpact(annualImpact, locale);

    // =====================================================
    // ANIMATION STATES
    // =====================================================
    const [animatedSavings, setAnimatedSavings] = useState(0);
    const [showCards, setShowCards] = useState(false);

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
                // Show cards after counting animation
                setTimeout(() => setShowCards(true), 300);
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
                return <span key={i} className="text-amber-400">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    // =====================================================
    // LABELS (bilingue)
    // [TODO: Personnaliser les textes selon ta quête]
    // =====================================================
    const labels = {
        fr: {
            successBadge: 'MISSION ACCOMPLIE',        // [TODO: Personnaliser]
            badgeIcon: Target,                         // [TODO: Choisir icône]
            impactLabel: 'GAIN ANNUEL',
            subtitle: 'Tu viens de réaliser une action concrète.',  // [TODO: Personnaliser]
            realWorldValue: 'IMPACT CONCRET',
            fiveYearLabel: 'POTENTIEL 5 ANS',
            fiveYearDesc: 'Si réinvesti à 7%/an',
            cta: 'CLÔTURER LA MISSION'
        },
        en: {
            successBadge: 'MISSION COMPLETE',
            badgeIcon: Target,
            impactLabel: 'ANNUAL GAIN',
            subtitle: 'You just took a concrete action.',
            realWorldValue: 'REAL WORLD VALUE',
            fiveYearLabel: '5-YEAR POTENTIAL',
            fiveYearDesc: 'If reinvested at 7%/year',
            cta: 'CLOSE MISSION'
        }
    };
    const currentLabels = labels[locale] || labels.fr;
    const BadgeIcon = currentLabels.badgeIcon;

    // =====================================================
    // RENDER
    // =====================================================
    return (
        <div className="h-full flex flex-col">
            {/* Main content - centered */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

                {/* Background pulse glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-volt/20 rounded-full blur-[80px] animate-pulse" />

                {/* ===== SUCCESS BADGE ===== */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: 'backOut' }}
                    className="mb-4 relative z-10"
                >
                    <div className="inline-flex items-center gap-2 bg-volt/10 border border-volt/30 rounded-full px-4 py-2">
                        <BadgeIcon className="w-4 h-4 text-volt" />
                        <span className="font-mono text-[10px] text-volt font-bold uppercase tracking-widest">
                            {currentLabels.successBadge}
                        </span>
                    </div>
                </motion.div>

                {/* ===== TITLE (small gray) ===== */}
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.3em] mb-2 block relative z-10"
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

                            {/* Card 1: Impact Concret (Gold Frame) */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-4 flex items-center gap-4 text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                                    <span className="text-xl">🚀</span>
                                </div>
                                <div>
                                    <span className="block font-mono text-[9px] text-amber-500 uppercase font-bold mb-0.5">
                                        {currentLabels.realWorldValue}
                                    </span>
                                    <span className="text-sm font-bold text-white block leading-tight">
                                        {renderWithBold(concreteImpact.text)}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Card 2: XP + Série (White Frame, 50/50 Split) */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.05 }}
                                className="bg-neutral-900/80 border border-neutral-700 rounded-xl p-4 flex items-stretch"
                            >
                                {/* XP Side */}
                                <div className="flex-1 flex items-center justify-center gap-2 border-r border-neutral-700 pr-4">
                                    <span className="text-xl">⚡️</span>
                                    <span className="font-mono text-lg font-bold text-white">+{xpReward} XP</span>
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
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="bg-neutral-900/80 border border-neutral-700 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">📈</span>
                                    <div className="text-left">
                                        <div className="font-bold text-white text-sm">{currentLabels.fiveYearLabel}</div>
                                        <div className="font-mono text-[9px] text-neutral-500">{currentLabels.fiveYearDesc}</div>
                                    </div>
                                </div>
                                <span className="font-mono text-xl font-bold text-emerald-400">+{fiveYearGrowth.toLocaleString('fr-FR')} €</span>
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
