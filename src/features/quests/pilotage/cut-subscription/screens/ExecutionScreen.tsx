import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaApple } from 'react-icons/fa';
import { ChevronRight, Zap, Wallet, ExternalLink, ChevronDown, RefreshCw, Users, X } from 'lucide-react';
import { haptic } from '../../../../../utils/haptics';
import {
    STRATEGY_OPTIONS,
    SERVICE_STRATEGIES,
    CANCELLATION_LINKS,
    calculateStrategySavings
} from '../insightData';

/**
 * ExecutionScreen - Phase 2: "LA PURGE"
 * 
 * 3-STEP NARRATIVE FLOW:
 * Step 1: "LA RÉVÉLATION" - Select subscription + See the shocking result
 * Step 2: "LE CHOIX DU DÉFI" - Pick your strategy (4 options based on service)
 * Step 3: "L'ACTION" - Link to cancel + Confirm done
 * 
 * NAVIGATION: Controlled by parent (CutSubscriptionFlow) for uniform header behavior
 */

// SERVICE OPTIONS (Prices: France fin 2025 - plans standards)
const SUBSCRIPTION_SERVICES = [
    { id: 'netflix', name: 'Netflix', icon: 'N', color: 'text-red-500', defaultPrice: 14.99 },
    { id: 'spotify', name: 'Spotify', icon: 'S', color: 'text-green-500', defaultPrice: 10.99 },
    { id: 'prime', name: 'Prime', icon: 'P', color: 'text-blue-400', defaultPrice: 6.99 },
    { id: 'apple', name: 'Apple', icon: '', color: 'text-gray-300', defaultPrice: 22.95, useAppleIcon: true },
    { id: 'disney', name: 'Disney+', icon: 'D+', color: 'text-blue-600', defaultPrice: 10.99 },
    { id: 'other', name: { fr: 'Autre', en: 'Other' }, icon: '?', color: 'text-white', defaultPrice: 0, isCustom: true },
];

// Strategy icons mapping (Lucide icons like micro-expenses)
const STRATEGY_ICONS: Record<string, React.ReactNode> = {
    downgrade: <ChevronDown className="w-6 h-6" />,
    rotation: <RefreshCw className="w-6 h-6" />,
    partage: <Users className="w-6 h-6" />,
    stopper: <X className="w-6 h-6" />
};

// Type for strategy with calculated savings
interface StrategyWithSavings {
    id: 'downgrade' | 'rotation' | 'partage' | 'stopper';
    icon: string;
    labelFr: string;
    labelEn: string;
    descFr: string;
    descEn: string;
    savings: number;
    serviceConfig?: { price?: number; labelFr: string; labelEn: string };
}

// Props interface
interface ExecutionScreenProps {
    data?: {
        subscription?: { id: string } | null;
        customName?: string;
        monthlyAmount?: number;
        [key: string]: unknown;
    };
    onUpdate: (data: object) => void;
    onNext: () => void;
    step: string;
    setStep: (step: string) => void;
}

const ExecutionScreen = ({ data = {}, onUpdate, onNext, step, setStep }: ExecutionScreenProps) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;
    const inputRef = useRef<HTMLInputElement>(null);
    const customNameRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Local state
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(data.subscription?.id || null);
    const [customName, setCustomName] = useState(data.customName || '');
    const [price, setPrice] = useState(data.monthlyAmount?.toString() || '');
    const [selectedStrategy, setSelectedStrategy] = useState<StrategyWithSavings | null>(null);

    // Animated counter
    const [animatedAmount, setAnimatedAmount] = useState(0);
    const [hasRevealed, setHasRevealed] = useState(false);
    const previousAmountRef = useRef(0);

    // Calculate impact
    const rawPrice = parseFloat(price) || 0;
    const annualSavings = rawPrice * 12;

    // Get available strategies for selected service
    const availableStrategies = useMemo((): StrategyWithSavings[] => {
        if (!selectedServiceId) return [];
        const serviceConfig = SERVICE_STRATEGIES[selectedServiceId] || SERVICE_STRATEGIES.other;
        const strategies: StrategyWithSavings[] = [];

        // Order: DOWNGRADE, ROTATION, PARTAGE, STOPPER
        if (serviceConfig.downgrade) {
            strategies.push({
                ...STRATEGY_OPTIONS.downgrade,
                serviceConfig: serviceConfig.downgrade,
                savings: calculateStrategySavings(selectedServiceId, 'downgrade', rawPrice)
            });
        }
        if (serviceConfig.rotation) {
            strategies.push({
                ...STRATEGY_OPTIONS.rotation,
                savings: calculateStrategySavings(selectedServiceId, 'rotation', rawPrice)
            });
        }
        if (serviceConfig.partage) {
            strategies.push({
                ...STRATEGY_OPTIONS.partage,
                serviceConfig: serviceConfig.partage,
                savings: calculateStrategySavings(selectedServiceId, 'partage', rawPrice)
            });
        }
        // STOPPER is always available
        strategies.push({
            ...STRATEGY_OPTIONS.stopper,
            savings: calculateStrategySavings(selectedServiceId, 'stopper', rawPrice)
        });

        return strategies;
    }, [selectedServiceId, rawPrice]);

    // Animate counter on change
    useEffect(() => {
        if (selectedServiceId && annualSavings > 0) {
            const target = Math.round(annualSavings);
            const start = previousAmountRef.current;
            const difference = target - start;

            const duration = start === 0 ? 800 : 300;
            const steps = start === 0 ? 30 : 15;
            let stepCount = 0;

            const timer = setInterval(() => {
                stepCount++;
                if (stepCount >= steps) {
                    setAnimatedAmount(target);
                    previousAmountRef.current = target;
                    clearInterval(timer);
                    setHasRevealed(true);
                } else {
                    const progress = stepCount / steps;
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setAnimatedAmount(Math.round(start + difference * eased));
                }
            }, duration / steps);

            return () => clearInterval(timer);
        }
    }, [selectedServiceId, annualSavings]);

    // Auto-focus for custom service
    useEffect(() => {
        if (selectedServiceId && step === 'revelation') {
            const service = SUBSCRIPTION_SERVICES.find(s => s.id === selectedServiceId);
            if (service?.isCustom && customNameRef.current) {
                customNameRef.current.focus();
            }
        }
    }, [selectedServiceId, step]);

    // Handlers
    const handleServiceSelect = useCallback((service) => {
        haptic.medium();
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
        setSelectedStrategy(null);
    }, [selectedServiceId]);

    const handlePriceChange = (e) => {
        const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
        setPrice(value);
    };

    const getServiceDisplayName = (service) => {
        if (typeof service.name === 'object') {
            return service.name[locale] || service.name.fr;
        }
        return service.name;
    };

    const handleStrategySelect = useCallback((strategy) => {
        haptic.medium();
        setSelectedStrategy(strategy);
    }, []);

    const goToChallenge = useCallback(() => {
        haptic.heavy();
        setStep('challenge');
    }, [setStep]);

    const goToAction = useCallback(() => {
        haptic.heavy();
        setStep('action');
    }, [setStep]);

    // Handle final completion
    const handleComplete = useCallback(() => {
        if (!selectedStrategy) return;

        haptic.success();

        const service = SUBSCRIPTION_SERVICES.find(s => s.id === selectedServiceId);
        const displayName = service?.isCustom ? customName : getServiceDisplayName(service);

        onUpdate({
            subscription: service,
            serviceName: displayName,
            monthlyAmount: Math.round(selectedStrategy.savings / 12),
            annualAmount: selectedStrategy.savings,
            strategyId: selectedStrategy.id,
            strategyLabel: locale === 'fr' ? selectedStrategy.labelFr : selectedStrategy.labelEn,
            frequency: 'MONTHLY',
            customName
        });
        onNext();
    }, [selectedServiceId, customName, selectedStrategy, locale, onUpdate, onNext]);

    // Validation
    const selectedService = SUBSCRIPTION_SERVICES.find(s => s.id === selectedServiceId);
    const isCustomValid = !selectedService?.isCustom || (selectedService?.isCustom && customName.trim().length > 0);
    const canProceedToChallenge = selectedServiceId && rawPrice > 0 && isCustomValid;
    const canProceedToAction = selectedStrategy !== null;

    // Labels
    const labels = {
        fr: {
            priceLabel: 'MONTANT MENSUEL',
            resultLabel: 'ÇA TE COÛTE',
            perYear: '/ an',
            revelationCta: 'CHOISIR MA STRATÉGIE',
            yourSubscription: 'TON ABONNEMENT',
            challengeCta: 'ACTIVER LA STRATÉGIE',
            customPlaceholder: 'Nom du service...',
            actionTitle: 'PASSE À L\'ACTION',
            actionCta: 'VOIR MON IMPACT',
            openLink: 'Ouvrir'
        },
        en: {
            priceLabel: 'MONTHLY AMOUNT',
            resultLabel: 'THIS COSTS YOU',
            perYear: '/ year',
            revelationCta: 'CHOOSE MY STRATEGY',
            yourSubscription: 'YOUR SUBSCRIPTION',
            challengeCta: 'ACTIVATE STRATEGY',
            customPlaceholder: 'Service name...',
            actionTitle: 'TAKE ACTION',
            actionCta: 'SEE MY IMPACT',
            openLink: 'Open'
        }
    };
    const L = labels[locale] || labels.fr;

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: LA RÉVÉLATION
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
                                            h-16 rounded-2xl border flex flex-col items-center justify-center gap-1.5 selectable-card
                                            ${isSelected
                                                ? 'bg-volt text-black border-volt selectable-card--active'
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

                        {/* PRICE INPUT */}
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
                                        <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-wide mb-1">
                                            {L.resultLabel}
                                        </span>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <motion.span
                                                key={Math.round(animatedAmount)}
                                                className="text-5xl font-black text-white tracking-tighter"
                                            >
                                                {Math.round(animatedAmount).toLocaleString('fr-FR')} €
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
    // STEP 2: LE CHOIX DU DÉFI (4 nouvelles options dynamiques)
    // ═══════════════════════════════════════════════════════════════
    if (step === 'challenge') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col p-6 pt-2 pb-32">

                        {/* Recap Card - Context with service name */}
                        <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Wallet className="w-5 h-5 text-neutral-500" />
                                    <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wide">
                                        {L.yourSubscription} {selectedService?.isCustom ? customName.toUpperCase() : (typeof selectedService?.name === 'string' ? selectedService.name.toUpperCase() : selectedService?.name?.fr?.toUpperCase())}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-mono text-xl font-bold text-white">
                                        {Math.round(annualSavings).toLocaleString('fr-FR')} €
                                    </span>
                                    <span className="text-xs text-neutral-500">{L.perYear}</span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="my-5">
                            <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
                        </div>

                        {/* ===== 4 STRATEGY OPTIONS ===== */}
                        <div className="space-y-3">
                            {availableStrategies.map((strategy, index) => {
                                const isSelected = selectedStrategy?.id === strategy.id;

                                return (
                                    <motion.button
                                        key={strategy.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.06, duration: 0.25 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleStrategySelect(strategy)}
                                        className={`
                                            w-full rounded-2xl border text-left selectable-card
                                            ${isSelected
                                                ? 'bg-neutral-900 border-volt selectable-card--active'
                                                : 'bg-neutral-900 border-neutral-800 active:bg-neutral-800'
                                            }
                                        `}
                                    >
                                        <div className="p-4 flex items-center gap-4">
                                            {/* Icon Circle (Lucide icons like micro-expenses) */}
                                            <div className={`
                                                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                                ${isSelected
                                                    ? 'bg-volt text-black'
                                                    : 'bg-neutral-800 text-neutral-400'
                                                }
                                            `}>
                                                {STRATEGY_ICONS[strategy.id]}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`font-mono text-sm font-bold uppercase ${isSelected ? 'text-volt' : 'text-white'}`}>
                                                        {locale === 'fr' ? strategy.labelFr : strategy.labelEn}
                                                    </span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="font-mono text-lg font-bold text-volt">
                                                            +{strategy.savings.toLocaleString('fr-FR')} €
                                                        </span>
                                                        <span className="text-[11px] text-neutral-500">{L.perYear}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-neutral-500">
                                                    {(() => {
                                                        // Cas spécial : Downgrade avec pub (Netflix, Disney+)
                                                        if (strategy.id === 'downgrade' && strategy.serviceConfig?.labelFr?.toLowerCase().includes('pub')) {
                                                            return locale === 'fr'
                                                                ? `Switch vers l'offre Pub`
                                                                : `Switch to Ads plan`;
                                                        }
                                                        // Cas spécial : Spotify Free
                                                        if (strategy.id === 'downgrade' && strategy.serviceConfig?.labelFr?.toLowerCase().includes('free')) {
                                                            return locale === 'fr'
                                                                ? `Passe en Free (avec pubs)`
                                                                : `Switch to Free (with ads)`;
                                                        }
                                                        // Cas spécial : Apple Individuel
                                                        if (strategy.id === 'downgrade' && strategy.serviceConfig?.labelFr?.toLowerCase().includes('individuel')) {
                                                            return locale === 'fr'
                                                                ? `Passe en Individuel (${strategy.serviceConfig.price?.toFixed(2)}€)`
                                                                : `Switch to Individual (${strategy.serviceConfig.price?.toFixed(2)}€)`;
                                                        }
                                                        // Cas spécial : Partage avec prix
                                                        if (strategy.id === 'partage' && strategy.serviceConfig?.price) {
                                                            return locale === 'fr'
                                                                ? `Ajoute un membre (${strategy.serviceConfig.price.toFixed(2)}€/pers)`
                                                                : `Add a member (${strategy.serviceConfig.price.toFixed(2)}€/person)`;
                                                        }
                                                        // Cas standard avec serviceConfig
                                                        if (strategy.serviceConfig) {
                                                            return locale === 'fr'
                                                                ? `${strategy.descFr.split(' ')[0]} ${strategy.serviceConfig.labelFr} (${strategy.serviceConfig.price?.toFixed(2) || '0'}€)`
                                                                : `${strategy.descEn.split(' ')[0]} ${strategy.serviceConfig.labelEn} (${strategy.serviceConfig.price?.toFixed(2) || '0'}€)`;
                                                        }
                                                        // Fallback
                                                        return locale === 'fr' ? strategy.descFr : strategy.descEn;
                                                    })()}
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
                        whileTap={canProceedToAction ? { scale: 0.97 } : {}}
                        onClick={goToAction}
                        disabled={!canProceedToAction}
                        className={`
                            w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px]
                            cta-ios-fix ${canProceedToAction ? 'cta-active' : 'cta-inactive'}
                            ${canProceedToAction
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
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: L'ACTION (Refonte complète - Design premium + Guide)
    // ═══════════════════════════════════════════════════════════════
    const serviceIdForLinks = selectedServiceId || 'other';
    const cancellationInfo = CANCELLATION_LINKS[serviceIdForLinks] || CANCELLATION_LINKS.other;
    const serviceLogo = SUBSCRIPTION_SERVICES.find(s => s.id === selectedServiceId);

    // Protocoles simplifiés - Ce qu'on fait UNE FOIS sur le site
    const PROTOCOLS: Record<string, Record<string, string[]>> = {
        netflix: {
            downgrade: [
                'Va dans "Gérer l\'abonnement"',
                'Sélectionne "Essentiel avec pub"'
            ],
            rotation: [
                'Va dans "Gérer l\'abonnement"',
                'Clique sur "Annuler"',
                'Réabonne-toi quand tu veux'
            ],
            partage: [
                'Va dans "Gérer les accès"',
                'Clique sur "Ajouter un membre"',
                'Vous payez 5.99€ chacun'
            ],
            stopper: [
                'Va dans "Gérer l\'abonnement"',
                'Clique sur "Annuler l\'abonnement"'
            ]
        },
        spotify: {
            downgrade: [
                'Va dans "Gérer l\'abonnement"',
                'Clique sur "Annuler Premium"',
                'Tu passes en Free automatiquement'
            ],
            partage: [
                'Va dans "Gérer l\'abonnement"',
                'Sélectionne "Duo" ou "Famille"',
                'Vous payez moins cher chacun'
            ],
            stopper: [
                'Va dans "Gérer l\'abonnement"',
                'Clique sur "Annuler l\'abonnement"'
            ]
        },
        prime: {
            rotation: [
                'Va dans "Gérer mon abonnement"',
                'Clique sur "Mettre fin"',
                'Réabonne-toi quand tu en as besoin'
            ],
            stopper: [
                'Va dans "Gérer mon abonnement"',
                'Clique sur "Mettre fin à l\'abonnement"'
            ]
        },
        apple: {
            downgrade: [
                'Clique sur "Abonnements"',
                'Sélectionne "Apple One"',
                'Passe à "Individuel"'
            ],
            stopper: [
                'Clique sur "Abonnements"',
                'Sélectionne "Apple One"',
                'Clique sur "Annuler"'
            ]
        },
        disney: {
            downgrade: [
                'Va dans "Gérer l\'abonnement"',
                'Sélectionne "Standard avec pub"'
            ],
            rotation: [
                'Va dans "Gérer l\'abonnement"',
                'Clique sur "Annuler"',
                'Réabonne-toi quand tu veux'
            ],
            stopper: [
                'Va dans "Gérer l\'abonnement"',
                'Clique sur "Annuler l\'abonnement"'
            ]
        },
        other: {
            rotation: [
                'Cherche "Gérer" ou "Abonnement"',
                'Annule ton abonnement',
                'Réabonne-toi selon tes besoins'
            ],
            stopper: [
                'Cherche "Gérer" ou "Abonnement"',
                'Confirme l\'annulation'
            ]
        }
    };

    const getActionSteps = (): string[] => {
        const serviceId = selectedServiceId || 'other';
        const strategyId = selectedStrategy?.id || 'stopper';

        // Fallback: si le protocole n'existe pas pour ce service, utiliser other
        const serviceProtocols = PROTOCOLS[serviceId] || PROTOCOLS.other;
        return serviceProtocols[strategyId] || PROTOCOLS.other.stopper;
    };

    const actionSteps = getActionSteps();

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col p-6 pt-4 pb-32">


                    {/* Premium Service Card - Sleek Design */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/50 via-neutral-900 to-black border border-white/10 rounded-3xl p-6 backdrop-blur-[20px] mb-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)]"
                    >
                        <div className="flex flex-col items-center relative z-10">
                            {/* Service Icon - Circle */}
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-neutral-900/50 shadow-inner border border-white/10 ${serviceLogo?.color}`}>
                                {serviceLogo?.useAppleIcon ? (
                                    <FaApple className="text-4xl" />
                                ) : (
                                    <span className="font-black text-4xl tracking-tight">
                                        {serviceLogo?.icon}
                                    </span>
                                )}
                            </div>

                            {/* Service Name */}
                            <h3 className="font-sans font-bold text-2xl text-white mb-4 tracking-tight">
                                {customName || getServiceDisplayName(serviceLogo)}
                            </h3>

                            {/* Strategy Badge */}
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-neutral-900 border border-white/10 rounded-full mb-6 shadow-sm">
                                <div className="text-volt">
                                    {STRATEGY_ICONS[selectedStrategy?.id || 'stopper']}
                                </div>
                                <span className="font-mono text-xs font-bold uppercase text-neutral-300">
                                    {locale === 'fr' ? selectedStrategy?.labelFr : selectedStrategy?.labelEn}
                                </span>
                            </div>

                            {/* Separator Line */}
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

                            {/* BIG SAVINGS - The reward */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-volt tracking-tighter drop-shadow-[0_0_20px_rgba(226,255,0,0.15)]">
                                    +{selectedStrategy?.savings?.toLocaleString('fr-FR') || 0} €
                                </span>
                                <span className="text-sm font-mono text-neutral-500">{L.perYear}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* PROTOCOLE Section - Lien + Steps intégrés */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="px-2"
                    >
                        {/* Label PROTOCOLE */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-neutral-800" />
                            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.2em]">
                                {locale === 'fr' ? 'PROTOCOLE' : 'PROTOCOL'}
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-neutral-800" />
                        </div>

                        {/* Action Link - Ouvrir [Service] */}
                        {cancellationInfo.url ? (
                            <a
                                href={cancellationInfo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between px-5 py-4 bg-neutral-900 border border-white/20 rounded-xl text-white hover:border-volt hover:bg-neutral-800 action-link mb-6"
                            >
                                <div className="flex items-center gap-3">
                                    <ExternalLink className="w-5 h-5 text-neutral-400" />
                                    <span className="font-sans font-medium text-sm">
                                        {locale === 'fr'
                                            ? `Ouvrir ${customName || getServiceDisplayName(serviceLogo)}`
                                            : `Open ${customName || getServiceDisplayName(serviceLogo)}`}
                                    </span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-neutral-500" />
                            </a>
                        ) : (
                            <div
                                className="px-5 py-4 bg-neutral-900/60 border border-neutral-800 rounded-xl text-center mb-6 action-link"
                            >
                                <p className="font-mono text-sm text-neutral-400">
                                    {locale === 'fr'
                                        ? `Recherche "${customName}" sur Google`
                                        : `Search "${customName}" on Google`}
                                </p>
                            </div>
                        )}

                        {/* Numbered Steps */}
                        <div className="space-y-5">
                            {actionSteps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 + index * 0.08 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                        <span className="font-mono text-xs font-bold text-neutral-400">{index + 1}</span>
                                    </div>
                                    <p className="text-sm text-neutral-300 leading-relaxed font-medium">{step}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                <motion.button
                    key="cta-action"
                    whileTap={{ scale: 0.97 }}
                    onClick={handleComplete}
                    className="w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] bg-volt text-black border-black cta-ios-fix cta-active"
                >
                    <span className="cta-content cta-content-animate">
                        <Zap className="w-5 h-5" />
                        {L.actionCta}
                    </span>
                </motion.button>
            </div>
        </div>
    );
};

export default ExecutionScreen;
