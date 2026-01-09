import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle2, Zap, Flame, Shield, TrendingUp,
    ArrowRightCircle, Bell, Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
    strategies,
    calculateTotalImpact,
    countProtectionStrategies,
    RISK_LEVELS,
    type RiskLevel
} from '../insightData';
import { haptic } from '../../../../../utils/haptics';

/** Quest data from execution phase */
interface QuestData {
  revenus?: number;
  chargesFixes?: number;
  rav?: number;
  ravRatio?: number;
  riskLevel?: string;
  selectedStrategies?: string[];
  totalImpact?: number;
  [key: string]: unknown;
}

/** Props for DebriefScreen */
interface DebriefScreenProps {
  data?: QuestData;
  xpReward?: number;
  currentStreak?: number;
  onComplete: () => void;
}

// Icon map for strategies
const ICON_MAP: Record<string, React.ElementType> = {
    ArrowRightCircle,
    Bell,
    Calendar,
    Shield,
};

/**
 * DebriefScreen - Phase 3: Impact Confirmation
 *
 * Shows:
 * - Risk level (before state)
 * - Selected strategies
 * - Total annual impact
 * - XP + Badge rewards
 */
const DebriefScreen: React.FC<DebriefScreenProps> = ({
    data = {},
    xpReward = 100,
    currentStreak = 1,
    onComplete
}) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Get data
    const selectedStrategies = data.selectedStrategies || [];
    const totalImpact = calculateTotalImpact(selectedStrategies);
    const annualImpact = totalImpact * 12;
    const protectionCount = countProtectionStrategies(selectedStrategies);
    const riskLevel = (data.riskLevel || 'OK') as RiskLevel;
    const riskConfig = RISK_LEVELS[riskLevel];

    // Get selected strategy details
    const selectedStrategyDetails = strategies.filter(s => selectedStrategies.includes(s.id));

    // Animation states
    const [animatedAmount, setAnimatedAmount] = useState(0);
    const [showContent, setShowContent] = useState(false);

    // Trigger confetti and counter on mount
    useEffect(() => {
        haptic.success();

        // Celebration confetti (if has impact or protection strategies)
        if (totalImpact > 0 || protectionCount > 0) {
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
        const end = annualImpact;
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
    }, [annualImpact, totalImpact, protectionCount]);

    // Labels
    const labels = {
        fr: {
            heroLabelImpact: 'ÉCONOMIES ANNUELLES ESTIMÉES',
            heroLabelProtection: 'PROTECTION ACTIVÉE',
            riskLabel: 'TON NIVEAU DE RISQUE',
            strategiesLabel: 'STRATÉGIES ACTIVÉES',
            rewardsLabel: 'RÉCOMPENSES',
            streakLabel: 'SÉRIE',
            badgeName: 'BOUCLIER',
            cta: 'TERMINER',
            perYear: '/an',
            protectionActive: 'garde-fous actifs'
        },
        en: {
            heroLabelImpact: 'ESTIMATED ANNUAL SAVINGS',
            heroLabelProtection: 'PROTECTION ACTIVATED',
            riskLabel: 'YOUR RISK LEVEL',
            strategiesLabel: 'ACTIVATED STRATEGIES',
            rewardsLabel: 'REWARDS',
            streakLabel: 'STREAK',
            badgeName: 'SHIELD',
            cta: 'FINISH',
            perYear: '/year',
            protectionActive: 'active safeguards'
        }
    };
    const L = labels[locale] || labels.fr;

    // Determine hero display mode
    const hasMonetaryImpact = totalImpact > 0;

    return (
        <div className="h-full flex flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 pt-2 pb-32">

                    {/* HERO SECTION */}
                    <div className="text-center mb-8 pt-4">

                        {hasMonetaryImpact ? (
                            <>
                                {/* Label */}
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="font-mono text-[12px] text-neutral-500 uppercase tracking-wide mb-2 block"
                                >
                                    {L.heroLabelImpact}
                                </motion.span>

                                {/* HERO NUMBER - VOLT */}
                                <motion.h2
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.4, ease: 'backOut', delay: 0.15 }}
                                    className="text-5xl md:text-6xl font-black text-volt tracking-tighter"
                                    style={{ textShadow: '0 0 30px rgba(226, 255, 0, 0.5)' }}
                                >
                                    +{animatedAmount.toLocaleString('fr-FR')} €
                                </motion.h2>

                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="font-mono text-sm text-neutral-400 block mt-1"
                                >
                                    {L.perYear}
                                </motion.span>
                            </>
                        ) : (
                            <>
                                {/* Protection Mode */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4"
                                >
                                    <Shield className="w-10 h-10 text-blue-400" />
                                </motion.div>

                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.15 }}
                                    className="font-mono text-[12px] text-neutral-500 uppercase tracking-wide mb-2 block"
                                >
                                    {L.heroLabelProtection}
                                </motion.span>

                                <motion.h2
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.4, ease: 'backOut', delay: 0.2 }}
                                    className="text-3xl font-black text-blue-400"
                                >
                                    {protectionCount} {L.protectionActive}
                                </motion.h2>
                            </>
                        )}
                    </div>

                    {/* CARDS */}
                    <AnimatePresence>
                        {showContent && (
                            <div className="space-y-3">

                                {/* Card 1: Risk Level */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className={`${riskConfig.bgClass} border ${riskConfig.borderClass} rounded-2xl p-4 backdrop-blur-[20px]`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className={`w-5 h-5 ${riskConfig.colorClass}`} />
                                            <span className="font-mono text-[11px] text-neutral-400 uppercase">
                                                {L.riskLabel}
                                            </span>
                                        </div>
                                        <span className={`font-mono text-lg font-bold ${riskConfig.colorClass}`}>
                                            {riskConfig.emoji} {locale === 'en' ? riskConfig.labelEn : riskConfig.labelFr}
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Card 2: Selected Strategies */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: 0.04 }}
                                    className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                                >
                                    <span className="block font-mono text-[11px] text-neutral-500 uppercase font-bold mb-3">
                                        {L.strategiesLabel}
                                    </span>
                                    <div className="space-y-2">
                                        {selectedStrategyDetails.map(strategy => {
                                            const IconComponent = ICON_MAP[strategy.iconName] || Shield;
                                            return (
                                                <div key={strategy.id} className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-volt/10 flex items-center justify-center">
                                                        <IconComponent className="w-4 h-4 text-volt" />
                                                    </div>
                                                    <span className="text-sm text-white flex-1">
                                                        {locale === 'en' ? strategy.labelEn : strategy.labelFr}
                                                    </span>
                                                    <span className={`font-mono text-xs ${strategy.isProtection ? 'text-blue-400' : 'text-emerald-400'}`}>
                                                        {strategy.isProtection ? '🛡️' : `+${strategy.monthlyImpact}€/m`}
                                                    </span>
                                                </div>
                                            );
                                        })}
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
                                        {L.rewardsLabel}
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
};

export default DebriefScreen;
