import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Plane, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

// Shared reward cards
import { XPCard, StreakCard, CompoundCard, ConcreteImpactCard } from '../../../shared';

// Quest metadata (for impact type)
import metadata from '../metadata';

/**
 * DebriefScreen - Final Phase: Celebration & Rewards
 * 
 * Adapts display based on metadata.estimatedImpact.type:
 * - 'savings'/'earnings': ConcreteImpact + XP + Streak + Compound
 * - 'one-time': ConcreteImpact + XP + Streak (no Compound)
 * - 'none': XP + Streak only (+ optional Badge)
 */
const DebriefScreen = ({
    data = {},
    xpReward = 100,
    badgeUnlocked = null,       // Optional badge ID
    onComplete
}) => {
    const { i18n } = useTranslation();
    const locale = i18n.language;

    // Get impact type from metadata
    const impactType = metadata.estimatedImpact?.type || 'none';
    const hasMonetaryImpact = impactType !== 'none';
    const hasCompoundGrowth = impactType === 'savings' || impactType === 'earnings';

    // Calculate values from data (if monetary quest)
    const annualImpact = data.annualAmount || (data.monthlyAmount * 12) || 0;

    // Animation states
    const [showRewards, setShowRewards] = useState(false);

    // Trigger confetti on mount
    useEffect(() => {
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#E2FF00', '#FFFFFF', '#FFD700']
        });

        // Show rewards after delay
        setTimeout(() => setShowRewards(true), 500);
    }, []);

    // Labels
    const labels = {
        fr: {
            successTitle: 'MISSION RÉUSSIE',
            impactLabel: 'IMPACT CONCRET',
            impactText: hasMonetaryImpact
                ? `Tu économises **${annualImpact}€** par an !`
                : "Tu as accompli cette étape avec succès !",
            badgeLabel: 'BADGE DÉBLOQUÉ',
            cta: 'CLÔTURER LA MISSION'
        },
        en: {
            successTitle: 'MISSION COMPLETE',
            impactLabel: 'REAL IMPACT',
            impactText: hasMonetaryImpact
                ? `You're saving **€${annualImpact}** per year!`
                : "You've successfully completed this step!",
            badgeLabel: 'BADGE UNLOCKED',
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

                {/* Success Title */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'backOut' }}
                    className="relative z-10 mb-8"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-volt/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-volt" />
                    </div>
                    <h2 className="text-2xl font-black text-white">
                        {currentLabels.successTitle}
                    </h2>
                </motion.div>

                {/* Reward Cards */}
                <AnimatePresence>
                    {showRewards && (
                        <div className="w-full space-y-3 relative z-10">

                            {/* Concrete Impact Card (only for monetary quests) */}
                            {hasMonetaryImpact && (
                                <ConcreteImpactCard
                                    icon={Plane}
                                    label={currentLabels.impactLabel}
                                    text={currentLabels.impactText}
                                    delay={0}
                                />
                            )}

                            {/* Badge Card (for non-monetary quests that unlock badges) */}
                            {!hasMonetaryImpact && badgeUnlocked && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 0, duration: 0.4 }}
                                    className="bg-purple-400/5 border border-purple-400/20 rounded-xl p-4 flex items-center gap-4 text-left mb-4"
                                >
                                    <div className="w-10 h-10 rounded-full bg-purple-400/10 flex items-center justify-center flex-shrink-0 border border-purple-400/30">
                                        <Award className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <span className="block font-mono text-[9px] text-purple-600 uppercase font-bold mb-0.5">
                                            {currentLabels.badgeLabel}
                                        </span>
                                        <span className="text-sm font-bold text-white block leading-tight">
                                            {badgeUnlocked}
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            {/* XP Card (always shown) */}
                            <XPCard
                                xp={xpReward}
                                label={locale === 'fr' ? 'XP RÉCOLTÉS' : 'XP EARNED'}
                                delay={hasMonetaryImpact ? 0.1 : 0}
                            />

                            {/* Streak Card (always shown) */}
                            <StreakCard
                                streak={1}
                                label={locale === 'fr' ? 'SÉRIE ACTIVE' : 'ACTIVE STREAK'}
                                sublabel={locale === 'fr' ? 'Continue sur ta lancée !' : 'Keep the momentum!'}
                                delay={hasMonetaryImpact ? 0.2 : 0.1}
                            />

                            {/* Compound Growth Card (only for recurring savings/earnings) */}
                            {hasCompoundGrowth && annualImpact > 0 && (
                                <CompoundCard
                                    amount={Math.round(annualImpact * 1.07 ** 10 * 10 / 12)} // Rough compound calc
                                    label={locale === 'fr' ? 'POTENTIEL 10 ANS' : '10-YEAR POTENTIAL'}
                                    sublabel={locale === 'fr' ? 'Placé à 7%/an pendant 10 ans' : 'Invested at 7%/year for 10 years'}
                                    delay={0.3}
                                />
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer: CTA */}
            <div className="p-6 bg-black border-t border-neutral-800">
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
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
