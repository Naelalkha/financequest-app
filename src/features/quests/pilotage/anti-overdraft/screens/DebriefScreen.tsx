import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    CheckCircle2, Zap, Flame, Shield, TrendingUp,
    ArrowRightLeft, Bell, Calendar,
    AlertTriangle, AlertCircle, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
    strategies,
    calculateAvoidedFees,
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
    ArrowRightLeft,
    Bell,
    Calendar,
    Shield,
};

// Icon map for risk levels (Lucide icons instead of emojis)
const RISK_ICON_MAP: Record<string, React.ElementType> = {
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    Sparkles,
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
    const riskLevel = (data.riskLevel || 'OK') as RiskLevel;
    const riskConfig = RISK_LEVELS[riskLevel];

    // Impact calculation: avoided fees based on risk level
    const avoidedFees = calculateAvoidedFees(riskLevel, selectedStrategies);

    // Get selected strategy details
    const selectedStrategyDetails = strategies.filter(s => selectedStrategies.includes(s.id));

    // Animation state
    const [showContent, setShowContent] = useState(false);

    // Trigger confetti on mount
    useEffect(() => {
        haptic.success();

        // Celebration confetti (if has strategies selected)
        if (selectedStrategies.length > 0) {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#E2FF00', '#FFFFFF', '#171717'],
                startVelocity: 35,
                gravity: 1.2,
                scalar: 1.1,
                ticks: 150
            });
        }

        // Show content after hero animation
        const timer = setTimeout(() => setShowContent(true), 600);
        return () => clearTimeout(timer);
    }, [selectedStrategies.length]);

    // Labels
    const labels = {
        fr: {
            heroLabel: 'PROTECTIONS ACTIVÉES',
            heroSubtitle: 'sur cette mission',
            feesLabel: 'FRAIS POTENTIELLEMENT ÉVITÉS',
            feesDisclaimer: '*estimation basée sur ton profil de risque',
            riskLabel: 'TON NIVEAU DE RISQUE',
            strategiesLabel: 'TES PROTECTIONS',
            rewardsLabel: 'RÉCOMPENSES',
            streakLabel: 'SÉRIE',
            cta: 'TERMINER',
            perYear: '/an*'
        },
        en: {
            heroLabel: 'PROTECTIONS ACTIVATED',
            heroSubtitle: 'on this mission',
            feesLabel: 'POTENTIALLY AVOIDED FEES',
            feesDisclaimer: '*estimate based on your risk profile',
            riskLabel: 'YOUR RISK LEVEL',
            strategiesLabel: 'YOUR PROTECTIONS',
            rewardsLabel: 'REWARDS',
            streakLabel: 'STREAK',
            cta: 'FINISH',
            perYear: '/year*'
        }
    };
    const L = labels[locale] || labels.fr;

    return (
        <div className="h-full flex flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 pt-2 pb-32">

                    {/* HERO SECTION - Nombre de protections (FACTUEL) */}
                    <div className="text-center mb-8 pt-4">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="font-mono text-xs text-neutral-500 uppercase tracking-wider block"
                        >
                            {L.heroLabel}
                        </motion.span>

                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, ease: 'backOut', delay: 0.15 }}
                            className="text-6xl font-black text-volt mt-2 block"
                            style={{ textShadow: '0 0 30px rgba(226, 255, 0, 0.5)' }}
                        >
                            {selectedStrategies.length}
                        </motion.span>

                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-neutral-400 text-sm mt-1 block"
                        >
                            {L.heroSubtitle}
                        </motion.span>
                    </div>

                    {/* CARDS */}
                    <AnimatePresence>
                        {showContent && (
                            <div className="space-y-3">

                                {/* Card 0: Frais évités (SECONDAIRE - spéculatif) */}
                                {avoidedFees > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                                    >
                                        <span className="block font-mono text-[11px] text-neutral-500 uppercase mb-2">
                                            {L.feesLabel}
                                        </span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm text-neutral-400">
                                                {locale === 'en' ? 'up to' : 'jusqu\'à'}
                                            </span>
                                            <span className="text-2xl font-bold text-white">
                                                {avoidedFees} €
                                            </span>
                                            <span className="text-sm text-neutral-500">{L.perYear}</span>
                                        </div>
                                        <p className="text-xs text-neutral-600 mt-2">
                                            {L.feesDisclaimer}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Card 1: Risk Level */}
                                {(() => {
                                    const RiskIcon = RISK_ICON_MAP[riskConfig.iconName] || CheckCircle2;
                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25, delay: avoidedFees > 0 ? 0.04 : 0 }}
                                            className={`${riskConfig.bgClass} ${riskConfig.borderClass} rounded-2xl p-4 backdrop-blur-[20px]`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <TrendingUp className={`w-5 h-5 ${riskConfig.colorClass}`} />
                                                    <span className="font-mono text-[11px] text-neutral-400 uppercase">
                                                        {L.riskLabel}
                                                    </span>
                                                </div>
                                                <span className={`font-mono text-lg font-bold flex items-center gap-2 ${riskConfig.colorClass}`}>
                                                    <RiskIcon className="w-5 h-5" />
                                                    {locale === 'en' ? riskConfig.labelEn : riskConfig.labelFr}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })()}

                                {/* Card 2: Selected Strategies */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: avoidedFees > 0 ? 0.08 : 0.04 }}
                                    className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                                >
                                    <span className="block font-mono text-[11px] text-neutral-500 uppercase font-bold mb-3">
                                        {L.strategiesLabel}
                                    </span>
                                    <div className="space-y-3">
                                        {selectedStrategyDetails.map(strategy => {
                                            const IconComponent = ICON_MAP[strategy.iconName] || Shield;
                                            return (
                                                <div key={strategy.id} className="flex items-center gap-3">
                                                    {/* Icône seule en volt */}
                                                    <IconComponent className="w-5 h-5 text-volt flex-shrink-0" />
                                                    <span className="text-sm text-white">
                                                        {locale === 'en' ? strategy.labelEn : strategy.labelFr}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>

                                {/* Card 3: Rewards (XP + Streak) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: avoidedFees > 0 ? 0.12 : 0.08 }}
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
                        console.log('[DebriefScreen] TERMINER clicked');
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
