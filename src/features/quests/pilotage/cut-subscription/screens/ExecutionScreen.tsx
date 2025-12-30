import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaApple } from 'react-icons/fa';
import { ChevronRight, Zap, Wallet, X, Scissors, Minus } from 'lucide-react';
import { haptic } from '../../../../../utils/haptics';

/**
 * ExecutionScreen - Phase 2: "LA PURGE"
 * 
 * 2-STEP NARRATIVE FLOW:
 * Step 1: "LA RÉVÉLATION" - Select subscription + See the shocking result
 * Step 2: "LE CHOIX DU DÉFI" - Pick your challenge level
 * 
 * NAVIGATION: Controlled by parent (CutSubscriptionFlow) for uniform header behavior
 */

// SERVICE OPTIONS (Prices: France fin 2025 - plans standards)
const SUBSCRIPTION_SERVICES = [
    { id: 'netflix', name: 'Netflix', icon: 'N', color: 'text-red-500', defaultPrice: 14.99 },      // Standard sans pub (FR 2025)
    { id: 'spotify', name: 'Spotify', icon: 'S', color: 'text-green-500', defaultPrice: 10.99 },    // Premium Individuel (FR 2025)
    { id: 'prime', name: 'Prime', icon: 'P', color: 'text-blue-400', defaultPrice: 6.99 },          // Prime mensuel FR
    { id: 'apple', name: 'Apple', icon: '', color: 'text-gray-300', defaultPrice: 22.95, useAppleIcon: true }, // Apple One Famille (FR 2025)
    { id: 'disney', name: 'Disney+', icon: 'D+', color: 'text-blue-600', defaultPrice: 10.99 },     // Standard (FR 2025)
    { id: 'other', name: { fr: 'Autre', en: 'Other' }, icon: '?', color: 'text-white', defaultPrice: 0, isCustom: true },
];

const ExecutionScreen = ({ data = {}, onUpdate, onNext, step, setStep }) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;
    const inputRef = useRef(null);
    const customNameRef = useRef(null);

    // Scroll ref for smooth navigation
    const scrollRef = useRef(null);

    // Local state
    const [selectedServiceId, setSelectedServiceId] = useState(data.subscription?.id || null);
    const [customName, setCustomName] = useState(data.customName || '');
    const [price, setPrice] = useState(data.monthlyAmount?.toString() || '');
    const [selectedActionLevel, setSelectedActionLevel] = useState(null);

    // Animated counter - tracks previous value for smooth transitions
    const [animatedAmount, setAnimatedAmount] = useState(0);
    const [hasRevealed, setHasRevealed] = useState(false);
    const previousAmountRef = useRef(0);

    // Calculate impact - toujours en mensuel
    const rawPrice = parseFloat(price) || 0;
    const annualSavings = rawPrice * 12;

    // Animate counter when amount changes - smooth transition between values (arrondi)
    useEffect(() => {
        if (selectedServiceId && annualSavings > 0) {
            const target = Math.round(annualSavings);
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
    }, [selectedServiceId, annualSavings]);

    // Auto-focus only for custom service (needs name input)
    // For services with pre-filled prices, keep keyboard closed - user taps if they want to modify
    useEffect(() => {
        if (selectedServiceId && step === 'revelation') {
            const service = SUBSCRIPTION_SERVICES.find(s => s.id === selectedServiceId);
            if (service?.isCustom && customNameRef.current) {
                customNameRef.current.focus();
            }
            // No auto-focus for price input - user taps if they want to modify
        }
    }, [selectedServiceId, step]);

    // Handlers
    const handleServiceSelect = useCallback((service) => {
        haptic.medium();
        // Reset animation only on first service selection
        if (!selectedServiceId) {
            setAnimatedAmount(0);
            previousAmountRef.current = 0;
        }
        setSelectedServiceId(service.id);
        if (!service.isCustom) {
            setPrice(service.defaultPrice.toString());
            setCustomName(service.name);
        } else {
            setPrice('');
            setCustomName('');
        }
        setHasRevealed(false);
    }, [selectedServiceId]);

    const handlePriceChange = (e) => {
        const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
        setPrice(value);
    };

    // Get display name for service
    const getServiceDisplayName = (service) => {
        if (typeof service.name === 'object') {
            return service.name[locale] || service.name.fr;
        }
        return service.name;
    };

    const handleActionLevelSelect = useCallback((actionId) => {
        haptic.medium();
        setSelectedActionLevel(actionId);
    }, []);

    // Go to challenge step
    const goToChallenge = useCallback(() => {
        haptic.heavy();
        setStep('challenge');
    }, [setStep]);

    // Validation
    const selectedService = SUBSCRIPTION_SERVICES.find(s => s.id === selectedServiceId);
    const isCustomValid = !selectedService?.isCustom || (selectedService?.isCustom && customName.trim().length > 0);
    const canProceedToChallenge = selectedServiceId && rawPrice > 0 && isCustomValid;
    const canComplete = selectedActionLevel !== null;

    // Handle final completion
    const handleComplete = useCallback(() => {
        haptic.success();

        const service = SUBSCRIPTION_SERVICES.find(s => s.id === selectedServiceId);
        const displayName = service?.isCustom ? customName : getServiceDisplayName(service);

        // Find the selected action config to get the correct multiplier
        const selectedConfig = actionConfig.find(c => c.id === selectedActionLevel);

        // Calculate savings using the SAME logic as the display
        const yearlySavings = Math.round(annualSavings * (selectedConfig?.multiplier || 1));
        const monthlySavings = Math.round(yearlySavings / 12);

        onUpdate({
            subscription: service,
            serviceName: displayName,
            monthlyAmount: monthlySavings,
            annualAmount: yearlySavings,
            frequency: 'MONTHLY',
            customName
        });
        onNext();
    }, [selectedServiceId, customName, annualSavings, selectedActionLevel, onUpdate, onNext]);

    // Action level config - defined here to be accessible in handleComplete
    const actionConfig = [
        {
            id: 'optimizer',
            multiplier: 0.25,
            labelFr: 'RÉDUIRE',
            labelEn: 'REDUCE',
            descFr: 'Diminue ton abonnement de 25%',
            descEn: 'Reduce your subscription by 25%'
        },
        {
            id: 'strategist',
            multiplier: 0.5,
            labelFr: 'DIVISER',
            labelEn: 'HALVE',
            descFr: 'Coupe ton abonnement en deux',
            descEn: 'Cut your subscription in half'
        },
        {
            id: 'radical',
            multiplier: 1,
            labelFr: 'STOPPER',
            labelEn: 'STOP',
            descFr: 'Annulation totale',
            descEn: 'Complete cancellation'
        }
    ];

    // Labels
    const labels = {
        fr: {
            // Step 1: Target
            revelationTitle: 'CIBLE',
            revelationSubtitle: 'Configure ton abonnement',
            priceLabel: 'MONTANT MENSUEL',
            resultLabel: 'ÇA TE COÛTE',
            perYear: '/ an',
            equivalent: 'C\'est',
            thrownAway: 'jeté par la fenêtre chaque année.',
            revelationCta: 'CHOISIR MA STRATÉGIE',
            // Step 2: Challenge
            challengeTitle: 'DÉFI',
            challengeSubtitle: 'Choisis ta stratégie',
            yourSubscription: 'Ton abonnement',
            challengeCta: 'ACTIVER LA STRATÉGIE',
            back: 'Retour',
            customPlaceholder: 'Nom du service...'
        },
        en: {
            revelationTitle: 'TARGET',
            revelationSubtitle: 'Configure your subscription',
            priceLabel: 'MONTHLY AMOUNT',
            resultLabel: 'THIS COSTS YOU',
            perYear: '/ year',
            equivalent: 'That\'s',
            thrownAway: 'thrown out the window every year.',
            revelationCta: 'CHOOSE MY STRATEGY',
            challengeTitle: 'CHALLENGE',
            challengeSubtitle: 'Choose your strategy',
            yourSubscription: 'Your subscription',
            challengeCta: 'ACTIVATE STRATEGY',
            back: 'Back',
            customPlaceholder: 'Service name...'
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

                        {/* SERVICE GRID (2 rows x 3 columns) */}
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {SUBSCRIPTION_SERVICES.map((service) => {
                                const isSelected = selectedServiceId === service.id;

                                return (
                                    <motion.button
                                        key={service.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleServiceSelect(service)}
                                        className={`
                                            h-16 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200
                                            ${isSelected
                                                ? 'bg-volt text-black border-volt shadow-[0_0_15px_rgba(226,255,0,0.4)]'
                                                : 'bg-neutral-900 text-neutral-400 border-neutral-800 active:bg-neutral-800'
                                            }
                                        `}
                                    >
                                        {service.useAppleIcon ? (
                                            <FaApple className={`text-xl ${isSelected ? 'text-black' : service.color}`} />
                                        ) : (
                                            <span className={`font-black text-xl ${isSelected ? 'text-black' : service.color}`}>
                                                {service.icon}
                                            </span>
                                        )}
                                        <span className={`font-mono text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-black' : 'text-neutral-400'}`}>
                                            {getServiceDisplayName(service)}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* CUSTOM NAME INPUT */}
                        <AnimatePresence>
                            {selectedService?.isCustom && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-4"
                                >
                                    <input
                                        ref={customNameRef}
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder={L.customPlaceholder}
                                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-center text-white font-sans text-sm placeholder-neutral-600 focus:outline-none focus:border-volt transition-colors"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* PRICE INPUT (Giant Number) */}
                        <div className="mb-5 w-full">
                            <label className="font-mono text-[11px] text-neutral-500 uppercase tracking-wide mb-4 block text-center">
                                {L.priceLabel}
                            </label>
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="decimal"
                                    value={price}
                                    onChange={handlePriceChange}
                                    placeholder="00.00"
                                    className="w-full max-w-[200px] bg-transparent text-center text-5xl font-mono font-bold text-white placeholder-neutral-800 focus:outline-none caret-volt"
                                    style={{ caretColor: '#E2FF00' }}
                                />
                                <span className="text-4xl font-sans font-bold text-white">€</span>
                            </div>
                        </div>

                        {/* LIVE PROJECTION CARD */}
                        <AnimatePresence>
                            {selectedServiceId && rawPrice > 0 && (
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

                                        {/* BIG NUMBER - Arrondi à l'entier */}
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <motion.span
                                                key={Math.round(animatedAmount)}
                                                className="text-5xl font-black text-white tracking-tighter"
                                            >
                                                €{Math.round(animatedAmount).toLocaleString('fr-FR')}
                                            </motion.span>
                                            <span className="text-sm font-mono text-neutral-500">{L.perYear}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800">
                    <motion.button
                        key="cta-revelation"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        whileTap={canProceedToChallenge ? { scale: 0.97 } : {}}
                        onClick={goToChallenge}
                        disabled={!canProceedToChallenge}
                        className={`
                            w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 transition-all border-[3px]
                            ${canProceedToChallenge
                                ? 'bg-volt text-black border-black shadow-volt-glow-strong'
                                : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                            }
                        `}
                    >
                        {L.revelationCta}
                        <ChevronRight className="w-5 h-5" />
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
                                <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wide">{L.yourSubscription}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="font-mono text-xl font-bold text-white">
                                    €{annualSavings.toLocaleString('fr-FR')}
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
                            const yearlySavings = Math.round(annualSavings * config.multiplier);

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
            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800">
                <motion.button
                    key="cta-challenge"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    whileTap={canComplete ? { scale: 0.97 } : {}}
                    onClick={handleComplete}
                    disabled={!canComplete}
                    className={`
                        w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 transition-all border-[3px]
                        ${canComplete
                            ? 'bg-volt text-black border-black shadow-volt-glow-strong'
                            : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                        }
                    `}
                >
                    <Zap className="w-5 h-5" />
                    {L.challengeCta}
                </motion.button>
            </div>
        </div>
    );
};

export default ExecutionScreen;
