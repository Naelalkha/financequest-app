import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Coffee, Utensils, Flame, Car, Beer, Plus, ChevronRight, Zap, Music, Headphones, Plane, Smartphone, Bike, Minus, Scissors, X, Wallet } from 'lucide-react';
import {
    expenseCategories,
    expenseCategoryLabels,
    frequencyOptions,
    frequencyLabels,
    calculateProjectionsWithFrequency
} from '../insightData';
import { Slider } from '../../../../../components/ui';
import { haptic } from '../../../../../utils/haptics';

/**
 * ExecutionScreen - Phase 2: "L'EFFET CUMULÉ"
 * 
 * 2-STEP NARRATIVE FLOW:
 * Step 1: "LA RÉVÉLATION" - Configure + See the shocking result
 * Step 2: "LE CHOIX DU DÉFI" - Pick your challenge level
 * 
 * NAVIGATION: Controlled by parent (MicroExpensesFlow) for uniform header behavior
 */

// Icon map for Lucide components
const ICON_MAP = {
    Coffee,
    Utensils,
    Flame,
    Car,
    Beer,
    Plus
};

// Difficulty stars component
const DifficultyStars = ({ level, color }) => {
    const stars = level === 'easy' ? 1 : level === 'medium' ? 2 : 3;
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3].map((i) => (
                <span
                    key={i}
                    className={`text-xs ${i <= stars ? color : 'text-neutral-700'}`}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

// Concrete reward icon based on amount - EXPORTED for reuse
export const getConcreteRewardIcon = (amount, locale = 'fr') => {
    const labels = {
        fr: {
            streaming: '1 an de streaming',
            airpods: 'Des AirPods Pro',
            trip: 'Un week-end à Barcelone',
            iphone: 'Un iPhone',
            vespa: 'Un scooter Vespa'
        },
        en: {
            streaming: '1 year of streaming',
            airpods: 'AirPods Pro',
            trip: 'A weekend in Barcelona',
            iphone: 'An iPhone',
            vespa: 'A Vespa scooter'
        }
    };
    const L = labels[locale] || labels.fr;

    if (amount < 150) return { icon: <Music className="w-5 h-5 text-yellow-400" />, text: L.streaming };
    if (amount < 400) return { icon: <Headphones className="w-5 h-5 text-yellow-400" />, text: L.airpods };
    if (amount < 1000) return { icon: <Plane className="w-5 h-5 text-yellow-400" />, text: L.trip };
    if (amount < 2000) return { icon: <Smartphone className="w-5 h-5 text-yellow-400" />, text: L.iphone };
    return { icon: <Bike className="w-5 h-5 text-yellow-400" />, text: L.vespa };
};

const ExecutionScreen = ({ data = {}, onUpdate, onNext, step, setStep }) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Scroll ref for smooth navigation
    const scrollRef = useRef(null);

    // Local state
    const [selectedCategoryId, setSelectedCategoryId] = useState(data.categoryId || null);
    const [unitPrice, setUnitPrice] = useState(data.unitPrice || 5);
    const [selectedFrequencyId, setSelectedFrequencyId] = useState(data.frequencyId || 'weekdays');
    const [selectedActionLevel, setSelectedActionLevel] = useState(null);
    const [customName, setCustomName] = useState(data.customName || '');

    // Animated counter - tracks previous value for smooth transitions
    const [animatedAmount, setAnimatedAmount] = useState(0);
    const [hasRevealed, setHasRevealed] = useState(false);
    const previousAmountRef = useRef(0);

    // Get category and frequency labels
    const categoryLabels = expenseCategoryLabels[locale] || expenseCategoryLabels.fr;
    const freqLabels = frequencyLabels[locale] || frequencyLabels.fr;

    // Get selected frequency
    const selectedFrequency = useMemo(() =>
        frequencyOptions.find(f => f.id === selectedFrequencyId) || frequencyOptions[1],
        [selectedFrequencyId]
    );

    // Calculate projections
    const projections = useMemo(() =>
        calculateProjectionsWithFrequency(unitPrice, selectedFrequency.timesPerWeek, 5, 0.07, locale),
        [unitPrice, selectedFrequency.timesPerWeek, locale]
    );

    // Animate counter when amount changes - smooth transition between values
    useEffect(() => {
        if (selectedCategoryId && projections.yearly > 0) {
            const target = projections.yearly;
            const start = previousAmountRef.current;
            const difference = target - start;

            // Quick animation if just updating, longer for first reveal
            const duration = start === 0 ? 800 : 300;
            const steps = start === 0 ? 30 : 15;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                if (step >= steps) {
                    setAnimatedAmount(target);
                    previousAmountRef.current = target;
                    clearInterval(timer);
                    setHasRevealed(true);
                } else {
                    // Ease-out animation
                    const progress = step / steps;
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setAnimatedAmount(Math.round(start + difference * eased));
                }
            }, duration / steps);

            return () => clearInterval(timer);
        }
    }, [selectedCategoryId, projections.yearly]);

    // Handlers
    const handleCategorySelect = useCallback((category) => {
        haptic.medium();
        // Reset animation only on first category selection
        if (!selectedCategoryId) {
            setAnimatedAmount(0);
            previousAmountRef.current = 0;
        }
        setSelectedCategoryId(category.id);
        setUnitPrice(category.defaultAmount);
        setCustomName(categoryLabels[category.id]);
        setHasRevealed(false);
    }, [categoryLabels, selectedCategoryId]);

    const handleFrequencySelect = useCallback((freq) => {
        haptic.light();
        setSelectedFrequencyId(freq.id);
    }, []);

    const handleSliderChange = useCallback((value) => {
        setUnitPrice(value);
    }, []);

    const handleActionLevelSelect = useCallback((actionId) => {
        haptic.medium();
        setSelectedActionLevel(actionId);
    }, []);

    // Go to challenge step
    const goToChallenge = useCallback(() => {
        haptic.heavy();
        setStep('challenge');
    }, [setStep]);

    // Note: Back navigation is handled by parent via Header Back Button

    // Validation
    const canProceedToChallenge = selectedCategoryId && unitPrice > 0;
    const canComplete = selectedActionLevel !== null;

    // Handle final completion
    const handleComplete = useCallback(() => {
        haptic.success();

        const category = expenseCategories.find(c => c.id === selectedCategoryId);
        const displayName = categoryLabels[category?.id] || customName;

        // Find the selected action config to get the correct multiplier
        const selectedConfig = actionConfig.find(c => c.id === selectedActionLevel);

        // Calculate savings using the SAME logic as the display
        const yearlySavings = Math.round(projections.yearly * (selectedConfig?.multiplier || 1));
        const monthlySavings = Math.round(yearlySavings / 12);

        onUpdate({
            categoryId: selectedCategoryId,
            category: category,
            expenseName: displayName,
            unitPrice,
            frequencyId: selectedFrequencyId,
            timesPerWeek: selectedFrequency.timesPerWeek,
            weeklyAmount: projections.weekly,
            monthlyAmount: projections.monthly,
            yearlyAmount: projections.yearly,
            fiveYearAmount: projections.fiveYear,
            actionLevel: selectedActionLevel,
            actionSavings: monthlySavings,
            yearlySavings: yearlySavings,
            yearlyEquivalent: projections.yearlyEquivalent,
            fiveYearEquivalent: projections.fiveYearEquivalent,
            customName,
            dailyAmount: Math.round(yearlySavings / 365),
            tenYearAmount: projections.fiveYear
        });
        onNext();
    }, [selectedCategoryId, categoryLabels, customName, unitPrice, selectedFrequencyId, selectedFrequency, projections, selectedActionLevel, onUpdate, onNext]);

    // Action level config - defined here to be accessible in handleComplete
    const actionConfig = [
        {
            id: 'optimizer',
            multiplier: 0.25,
            labelFr: 'RÉDUIRE',
            labelEn: 'REDUCE',
            descFr: 'Diminue ta fréquence de 25%',
            descEn: 'Reduce your frequency by 25%'
        },
        {
            id: 'strategist',
            multiplier: 0.5,
            labelFr: 'DIVISER',
            labelEn: 'HALVE',
            descFr: 'Coupe ta dépense en deux',
            descEn: 'Cut your expense in half'
        },
        {
            id: 'radical',
            multiplier: 1,
            labelFr: 'STOPPER',
            labelEn: 'STOP',
            descFr: 'Stop total',
            descEn: 'Completely eliminate this expense'
        }
    ];

    // Labels
    const labels = {
        fr: {
            // Step 1: Target
            revelationTitle: 'CIBLE',
            revelationSubtitle: 'Configure ta dépense',
            priceLabel: 'Prix unitaire',
            frequencyLabel: 'Fréquence',
            resultLabel: 'ÇA TE COÛTE',
            perYear: '/ an',
            equivalent: 'C\'est',
            thrownAway: 'jeté par la fenêtre chaque année.',
            revelationCta: 'CHOISIR MA STRATÉGIE',
            // Step 2: Challenge
            challengeTitle: 'DÉFI',
            challengeSubtitle: 'Choisis ta stratégie',
            yourExpense: 'Ta dépense',
            challengeCta: 'ACTIVER LA STRATÉGIE',
            back: 'Retour'
        },
        en: {
            revelationTitle: 'TARGET',
            revelationSubtitle: 'Configure your expense',
            priceLabel: 'Unit price',
            frequencyLabel: 'Frequency',
            resultLabel: 'THIS COSTS YOU',
            perYear: '/ year',
            equivalent: 'That\'s',
            thrownAway: 'thrown out the window every year.',
            revelationCta: 'CHOOSE MY STRATEGY',
            challengeTitle: 'CHALLENGE',
            challengeSubtitle: 'Choose your strategy',
            yourExpense: 'Your expense',
            challengeCta: 'ACTIVATE STRATEGY',
            back: 'Back'
        }
    };
    const L = labels[locale] || labels.fr;

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: LA RÉVÉLATION (New Design)
    // ═══════════════════════════════════════════════════════════════
    if (step === 'revelation') {
        return (
            <div className="h-full flex flex-col">
                <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col p-6 pt-2 pb-32">

                        {/* CATEGORY GRID (2 rows x 3 columns) */}
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {expenseCategories.map((category) => {
                                const IconComponent = ICON_MAP[category.iconName];
                                const isSelected = selectedCategoryId === category.id;

                                return (
                                    <motion.button
                                        key={category.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCategorySelect(category)}
                                        className={`
                                            h-16 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200
                                            ${isSelected
                                                ? 'bg-volt text-black border-volt shadow-[0_0_15px_rgba(226,255,0,0.4)]'
                                                : 'bg-neutral-900 text-neutral-400 border-neutral-800 active:bg-neutral-800'
                                            }
                                        `}
                                    >
                                        {IconComponent && (
                                            <IconComponent className={`w-6 h-6 ${isSelected ? 'text-black' : 'text-neutral-400'}`} />
                                        )}
                                        <span className={`font-mono text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-black' : 'text-neutral-400'}`}>
                                            {categoryLabels[category.id]}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* PRICE INPUT (Slider + Big Number) */}
                        <div className="mb-5 w-full">
                            <div className="flex justify-between items-end mb-3 px-1">
                                <label className="font-mono text-[11px] text-neutral-500 uppercase tracking-wide">
                                    {L.priceLabel}
                                </label>
                                <div className="flex items-baseline">
                                    <span className="font-sans font-bold text-white text-sm mr-1">€</span>
                                    <motion.span
                                        key={unitPrice}
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        className="text-3xl font-sans font-bold text-white"
                                    >
                                        {unitPrice.toFixed(2)}
                                    </motion.span>
                                </div>
                            </div>
                            <div className="slider-container">
                                <Slider
                                    value={unitPrice || 1}
                                    onChange={handleSliderChange}
                                    min={1}
                                    max={25}
                                    step={0.5}
                                    hapticOnChange={true}
                                    hapticOnSnap={true}
                                />
                            </div>
                        </div>

                        {/* FREQUENCY CHIPS - Grid 2 rows */}
                        <div className="mb-6 w-full">
                            <label className="font-mono text-[11px] text-neutral-500 uppercase tracking-wide mb-3 block px-1">
                                {L.frequencyLabel}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {frequencyOptions.map((freq) => {
                                    const isSelected = selectedFrequencyId === freq.id;
                                    return (
                                        <motion.button
                                            key={freq.id}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleFrequencySelect(freq)}
                                            className={`
                                                py-2.5 rounded-xl font-mono text-[11px] font-bold border transition-all
                                                ${isSelected
                                                    ? 'bg-volt text-black border-volt shadow-[0_0_12px_rgba(226,255,0,0.25)]'
                                                    : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                                                }
                                            `}
                                        >
                                            {freqLabels[freq.labelKey]}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* LIVE PROJECTION CARD */}
                        <AnimatePresence>
                            {selectedCategoryId && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className="w-full bg-neutral-900/60 border border-white/5 rounded-2xl p-6 backdrop-blur-[20px]"
                                >
                                    <div className="flex flex-col items-center">
                                        {/* Label */}
                                        <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-wide mb-1">
                                            {L.resultLabel}
                                        </span>

                                        {/* BIG NUMBER */}
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <motion.span
                                                key={animatedAmount}
                                                className="text-5xl font-black text-white tracking-tighter"
                                            >
                                                €{animatedAmount.toLocaleString('fr-FR')}
                                            </motion.span>
                                            <span className="text-sm font-mono text-neutral-500">{L.perYear}</span>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px w-full bg-neutral-800 mb-4" />

                                        {/* Concrete Reward Badge - Redesigned as Info (not CTA) */}
                                        {hasRevealed && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.15, duration: 0.25 }}
                                                className="flex flex-col items-center gap-1 mt-1"
                                            >
                                                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wide">
                                                    {L.equivalent}
                                                </span>
                                                <div className="flex items-center gap-2 text-volt">
                                                    {/* Clone icon to enforce size without modifying data file */}
                                                    <div className="w-5 h-5 flex items-center justify-center">
                                                        {getConcreteRewardIcon(projections.yearly, locale).icon}
                                                    </div>
                                                    <span className="font-sans font-bold uppercase text-sm">
                                                        {getConcreteRewardIcon(projections.yearly, locale).text}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                    <motion.button
                        key="cta-revelation"
                        whileTap={canProceedToChallenge ? { scale: 0.97 } : {}}
                        onClick={goToChallenge}
                        disabled={!canProceedToChallenge}
                        className={`
                            w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px]
                            cta-ios-fix ${canProceedToChallenge ? 'cta-active' : 'cta-inactive'}
                            ${canProceedToChallenge
                                ? 'bg-volt text-black border-black'
                                : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                            }
                        `}
                    >
                        <span className="cta-content cta-content-animate">
                            {L.revelationCta}
                            <ChevronRight className="w-5 h-5" />
                        </span>
                    </motion.button>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: LE CHOIX DU DÉFI (Clean Design)
    // ═══════════════════════════════════════════════════════════════

    // Icon map for action levels
    const actionIconMap = {
        optimizer: <Minus className="w-6 h-6" />,
        strategist: <Scissors className="w-6 h-6" />,
        radical: <X className="w-6 h-6" />
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col p-6 pt-2 pb-32">

                    {/* Recap Card - Context */}
                    <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Wallet className="w-5 h-5 text-neutral-500" />
                                <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wide">{L.yourExpense}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="font-mono text-xl font-bold text-white">
                                    €{projections.yearly.toLocaleString('fr-FR')}
                                </span>
                                <span className="text-xs text-neutral-500">{L.perYear}</span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="my-5">
                        <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
                    </div>

                    {/* ===== 3 ACTION LEVELS ===== */}
                    <div className="space-y-3">
                        {actionConfig.map((config, index) => {
                            const isSelected = selectedActionLevel === config.id;
                            const yearlySavings = Math.round(projections.yearly * config.multiplier);

                            return (
                                <motion.button
                                    key={config.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.06, duration: 0.25 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleActionLevelSelect(config.id)}
                                    className={`
                                        w-full rounded-2xl border transition-all text-left
                                        ${isSelected
                                            ? 'bg-neutral-900 border-volt shadow-[0_0_20px_rgba(226,255,0,0.2)]'
                                            : 'bg-neutral-900 border-neutral-800 active:bg-neutral-800'
                                        }
                                    `}
                                >
                                    <div className="p-4 flex items-center gap-4">
                                        {/* Icon Circle */}
                                        <div className={`
                                            w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                            ${isSelected
                                                ? 'bg-volt text-black'
                                                : 'bg-neutral-800 text-neutral-400'
                                            }
                                        `}>
                                            {actionIconMap[config.id]}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`font-mono text-sm font-bold uppercase ${isSelected ? 'text-volt' : 'text-white'}`}>
                                                    {locale === 'fr' ? config.labelFr : config.labelEn}
                                                </span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="font-mono text-lg font-bold text-volt">
                                                        +€{yearlySavings.toLocaleString('fr-FR')}
                                                    </span>
                                                    <span className="text-[11px] text-neutral-500">{L.perYear}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-neutral-500">
                                                {locale === 'fr' ? config.descFr : config.descEn}
                                            </p>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                <motion.button
                    key="cta-challenge"
                    whileTap={canComplete ? { scale: 0.97 } : {}}
                    onClick={handleComplete}
                    disabled={!canComplete}
                    className={`
                        w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px]
                        cta-ios-fix ${canComplete ? 'cta-active' : 'cta-inactive'}
                        ${canComplete
                            ? 'bg-volt text-black border-black'
                            : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                        }
                    `}
                >
                    <span className="cta-content cta-content-animate">
                        <Zap className="w-5 h-5" />
                        {L.challengeCta}
                    </span>
                </motion.button>
            </div>
        </div>
    );
};

export default ExecutionScreen;
