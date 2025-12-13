import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaApple } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react';
import { realityCheckPills } from '../insightData';
import { haptic } from '../../../../../utils/haptics';
import { SPRING } from '../../../../../styles/animationConstants';

/**
 * ExecutionScreen - Phase 2: Target Selection & Amount Input
 * 
 * Features:
 * - Service selection grid with icons
 * - Dynamic Reality Check pill based on selected service
 * - Custom name input for "Other"
 * - Giant amount input with frequency toggle
 */

// SERVICE OPTIONS (Prices: France December 2024 - base tier)
const SUBSCRIPTION_SERVICES = [
    { id: 'netflix', name: 'Netflix', icon: 'N', color: 'text-red-500', defaultPrice: 14.99 },      // Standard
    { id: 'spotify', name: 'Spotify', icon: 'S', color: 'text-green-500', defaultPrice: 12.14 },    // Premium Individuel (2025)
    { id: 'prime', name: 'Prime', icon: 'P', color: 'text-blue-400', defaultPrice: 6.99 },          // Mensuel
    { id: 'apple', name: 'Apple', icon: '', color: 'text-gray-300', defaultPrice: 19.95, useAppleIcon: true }, // Apple One Famille (2025)
    { id: 'disney', name: 'Disney+', icon: 'D+', color: 'text-blue-600', defaultPrice: 10.99 },     // Standard
    { id: 'other', name: { fr: 'Autre', en: 'Other' }, icon: '?', color: 'text-white', defaultPrice: 0, isCustom: true },
];

const ExecutionScreen = ({ data = {}, onUpdate, onNext, onBack }) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;
    const inputRef = useRef(null);
    const customNameRef = useRef(null);

    // Local state
    const [selectedServiceId, setSelectedServiceId] = useState(data.subscription?.id || null);
    const [customName, setCustomName] = useState(data.customName || '');
    const [price, setPrice] = useState(data.monthlyAmount?.toString() || '');
    const [frequency, setFrequency] = useState(data.frequency || 'MONTHLY');

    // Get reality check pill for selected service
    const realityChecks = realityCheckPills[locale] || realityCheckPills.fr;
    const currentRealityCheck = selectedServiceId
        ? (realityChecks[selectedServiceId] || realityChecks.default)
        : null;

    // Auto-focus input after selection
    useEffect(() => {
        if (selectedServiceId) {
            const service = SUBSCRIPTION_SERVICES.find(s => s.id === selectedServiceId);
            if (service?.isCustom && customNameRef.current) {
                customNameRef.current.focus();
            } else if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [selectedServiceId]);

    // Handle service selection with haptic
    const handleServiceSelect = useCallback((service) => {
        haptic.medium();
        setSelectedServiceId(service.id);
        if (!service.isCustom) {
            setPrice(service.defaultPrice.toString());
            setCustomName(service.name);
        } else {
            setPrice('');
            setCustomName('');
        }
    }, []);

    // Handle price change
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

    // Calculate impact
    const rawPrice = parseFloat(price) || 0;
    const annualSavings = frequency === 'MONTHLY' ? rawPrice * 12 : rawPrice;
    const monthlyEquivalent = frequency === 'YEARLY' ? rawPrice / 12 : rawPrice;

    // Validation
    const selectedService = SUBSCRIPTION_SERVICES.find(s => s.id === selectedServiceId);
    const isCustomValid = !selectedService?.isCustom || (selectedService?.isCustom && customName.trim().length > 0);
    const isValid = selectedServiceId && rawPrice > 0 && isCustomValid;

    // Handle next with haptic
    const handleNext = useCallback(() => {
        haptic.success();
        
        const service = SUBSCRIPTION_SERVICES.find(s => s.id === selectedServiceId);
        const displayName = service?.isCustom ? customName : getServiceDisplayName(service);

        onUpdate({
            subscription: service,
            serviceName: displayName,
            monthlyAmount: monthlyEquivalent,
            annualAmount: annualSavings,
            frequency,
            customName
        });
        onNext();
    }, [selectedServiceId, customName, monthlyEquivalent, annualSavings, frequency, onUpdate, onNext]);

    // Labels
    const labels = {
        fr: {
            title: 'QUELLE DÉPENSE ?',
            customPlaceholder: 'Nom du service...',
            perMonth: '/MOIS',
            perYear: '/AN',
            impactFeedback: `💰 Soit ${annualSavings.toFixed(2)} € par an récupérés`,
            cta: 'VALIDER LE BUTIN'
        },
        en: {
            title: 'WHICH EXPENSE?',
            customPlaceholder: 'Service name...',
            perMonth: '/MONTH',
            perYear: '/YEAR',
            impactFeedback: `💰 That's ${annualSavings.toFixed(2)} € recovered per year`,
            cta: 'CONFIRM THE LOOT'
        }
    };
    const currentLabels = labels[locale] || labels.fr;

    return (
        <div className="h-full flex flex-col">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                <div className="text-center">
                    {/* Title */}
                    <h3 className="font-mono text-xs text-zinc-500 tracking-[0.2em] uppercase mb-6">
                        {currentLabels.title}
                    </h3>

                    {/* ===== SERVICE GRID ===== */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        {SUBSCRIPTION_SERVICES.map((service) => {
                            const isSelected = selectedServiceId === service.id;
                            return (
                                <motion.button
                                    key={service.id}
                                    animate={{ 
                                        scale: isSelected ? 1.05 : 1,
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={SPRING.snappy}
                                    onClick={() => handleServiceSelect(service)}
                                    className={`
                                        h-14 rounded-xl border flex flex-col items-center justify-center gap-1 transform-gpu
                                        ${isSelected
                                            ? 'bg-volt text-black border-volt shadow-[0_0_15px_rgba(226,255,0,0.4)] z-10'
                                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 active:bg-zinc-800'
                                        }
                                    `}
                                >
                                    <motion.div
                                        animate={{ 
                                            rotate: isSelected ? [0, -8, 8, 0] : 0,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {service.useAppleIcon ? (
                                            <FaApple className={`text-lg ${isSelected ? 'text-black' : service.color}`} />
                                        ) : (
                                            <span className={`font-black text-lg ${isSelected ? 'text-black' : service.color}`}>
                                                {service.icon}
                                            </span>
                                        )}
                                    </motion.div>
                                    <span className="font-mono text-[8px] font-bold uppercase tracking-wide">
                                        {getServiceDisplayName(service)}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* ===== REALITY CHECK PILL ===== */}
                    <AnimatePresence>
                        {currentRealityCheck && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 inline-flex items-center gap-2">
                                    <span className="font-mono text-lg font-black text-yellow-400">
                                        {currentRealityCheck.stat}
                                    </span>
                                    <span className="font-sans text-xs text-zinc-400">
                                        {currentRealityCheck.text}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ===== CUSTOM NAME INPUT ===== */}
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
                                    placeholder={currentLabels.customPlaceholder}
                                    className="w-full max-w-[280px] bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-center text-white font-sans text-sm placeholder-zinc-600 focus:outline-none focus:border-volt transition-colors"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ===== GIANT AMOUNT INPUT ===== */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="relative mb-2 mt-8"
                    >
                        {/* Service name tag */}
                        <AnimatePresence>
                            {selectedServiceId && customName && !selectedService?.isCustom && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute -top-5 left-0 w-full text-center"
                                >
                                    <span className="font-mono text-[9px] text-volt bg-volt/10 px-2 py-0.5 rounded border border-volt/20 uppercase">
                                        {customName}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main input row */}
                        <div className="flex items-baseline justify-center gap-1">
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="decimal"
                                value={price}
                                onChange={handlePriceChange}
                                placeholder="00.00"
                                className="w-full max-w-[200px] bg-transparent text-center text-6xl font-mono font-bold text-white placeholder-zinc-800 focus:outline-none caret-volt"
                                style={{ caretColor: '#E2FF00' }}
                            />
                            <span className={`text-4xl font-sans font-bold transition-colors ${price ? 'text-white' : 'text-zinc-700'}`}>
                                €
                            </span>
                        </div>
                    </motion.div>

                    {/* ===== FREQUENCY PILLS ===== */}
                    <div className="flex justify-center gap-2 mb-6">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            transition={SPRING.snappy}
                            onClick={() => {
                                haptic.light();
                                if (frequency !== 'MONTHLY' && rawPrice > 0) {
                                    setPrice((rawPrice / 12).toFixed(2));
                                }
                                setFrequency('MONTHLY');
                            }}
                            className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-bold border ${frequency === 'MONTHLY'
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-600'
                                }`}
                        >
                            {currentLabels.perMonth}
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            transition={SPRING.snappy}
                            onClick={() => {
                                haptic.light();
                                if (frequency !== 'YEARLY' && rawPrice > 0) {
                                    setPrice((rawPrice * 12).toFixed(2));
                                }
                                setFrequency('YEARLY');
                            }}
                            className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-bold border ${frequency === 'YEARLY'
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-600'
                                }`}
                        >
                            {currentLabels.perYear}
                        </motion.button>
                    </div>

                    {/* ===== REAL-TIME IMPACT FEEDBACK ===== */}
                    <AnimatePresence>
                        {rawPrice > 0 && frequency === 'MONTHLY' && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="font-mono text-xs text-zinc-400"
                            >
                                {currentLabels.impactFeedback}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer: CTA */}
            <div className="p-6 bg-black border-t border-zinc-800">
                <motion.button
                    animate={{ scale: 1 }}
                    whileTap={isValid ? { scale: 0.97 } : {}}
                    transition={SPRING.snappy}
                    onClick={handleNext}
                    disabled={!isValid}
                    className={`
                        w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 transform-gpu
                        ${isValid
                            ? 'bg-volt text-black cursor-pointer shadow-[0_0_25px_rgba(226,255,0,0.35)]'
                            : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                        }
                    `}
                >
                    {currentLabels.cta}
                </motion.button>
            </div>
        </div>
    );
};

export default ExecutionScreen;
