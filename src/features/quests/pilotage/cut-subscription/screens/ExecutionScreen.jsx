import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaApple } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react';
import { realityCheckPills } from '../insightData';

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

    // Handle service selection
    const handleServiceSelect = (service) => {
        setSelectedServiceId(service.id);
        if (!service.isCustom) {
            setPrice(service.defaultPrice.toString());
            setCustomName(service.name);
        } else {
            setPrice('');
            setCustomName('');
        }
    };

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

    // Handle next
    const handleNext = () => {
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
    };

    // Labels
    const labels = {
        fr: {
            title: 'QUELLE DÉPENSE ?',
            customPlaceholder: 'Nom du service...',
            perMonth: '/MOIS',
            perYear: '/AN',
            impactFeedback: `💰 Soit ${annualSavings.toFixed(2)}€ par an récupérés`,
            cta: 'VALIDER LE BUTIN'
        },
        en: {
            title: 'WHICH EXPENSE?',
            customPlaceholder: 'Service name...',
            perMonth: '/MONTH',
            perYear: '/YEAR',
            impactFeedback: `💰 That's €${annualSavings.toFixed(2)} recovered per year`,
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
                    <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="font-mono text-xs text-zinc-500 tracking-[0.2em] uppercase mb-6"
                    >
                        {currentLabels.title}
                    </motion.h3>

                    {/* ===== SERVICE GRID ===== */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="grid grid-cols-3 gap-3 mb-5"
                    >
                        {SUBSCRIPTION_SERVICES.map((service, index) => (
                            <motion.button
                                key={service.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2, delay: 0.02 * index }}
                                onClick={() => handleServiceSelect(service)}
                                className={`
                                    h-14 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200
                                    ${selectedServiceId === service.id
                                        ? 'bg-volt text-black border-volt shadow-[0_0_15px_rgba(226,255,0,0.4)] scale-105 z-10'
                                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'
                                    }
                                `}
                            >
                                {service.useAppleIcon ? (
                                    <FaApple className={`text-lg ${selectedServiceId === service.id ? 'text-black' : service.color}`} />
                                ) : (
                                    <span className={`font-black text-lg ${selectedServiceId === service.id ? 'text-black' : service.color}`}>
                                        {service.icon}
                                    </span>
                                )}
                                <span className="font-mono text-[8px] font-bold uppercase tracking-wide">
                                    {getServiceDisplayName(service)}
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>

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
                        className="relative mb-2"
                    >
                        {/* Service name tag */}
                        <AnimatePresence>
                            {selectedServiceId && customName && !selectedService?.isCustom && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute -top-4 left-0 w-full text-center"
                                >
                                    <span className="font-mono text-[9px] text-volt bg-volt/10 px-2 py-0.5 rounded border border-volt/20 uppercase">
                                        {customName}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main input row */}
                        <div className="flex items-baseline justify-center gap-1">
                            <span className={`text-3xl font-sans font-bold transition-colors ${price ? 'text-white' : 'text-zinc-700'}`}>
                                €
                            </span>
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="decimal"
                                value={price}
                                onChange={handlePriceChange}
                                placeholder="00.00"
                                className="w-full max-w-[280px] bg-transparent text-center text-7xl font-mono font-bold text-white placeholder-zinc-800 focus:outline-none caret-volt"
                                style={{ caretColor: '#E2FF00' }}
                            />
                        </div>
                    </motion.div>

                    {/* ===== FREQUENCY PILLS ===== */}
                    <div className="flex justify-center gap-2 mb-6">
                        <button
                            onClick={() => {
                                if (frequency !== 'MONTHLY' && rawPrice > 0) {
                                    // Convert from yearly to monthly
                                    setPrice((rawPrice / 12).toFixed(2));
                                }
                                setFrequency('MONTHLY');
                            }}
                            className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-bold border transition-all ${frequency === 'MONTHLY'
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-600'
                                }`}
                        >
                            {currentLabels.perMonth}
                        </button>
                        <button
                            onClick={() => {
                                if (frequency !== 'YEARLY' && rawPrice > 0) {
                                    // Convert from monthly to yearly
                                    setPrice((rawPrice * 12).toFixed(2));
                                }
                                setFrequency('YEARLY');
                            }}
                            className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-bold border transition-all ${frequency === 'YEARLY'
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-600'
                                }`}
                        >
                            {currentLabels.perYear}
                        </button>
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    whileHover={{ scale: isValid ? 1.02 : 1 }}
                    whileTap={{ scale: isValid ? 0.98 : 1 }}
                    onClick={handleNext}
                    disabled={!isValid}
                    className={`
                        w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 transition-all
                        ${isValid
                            ? 'bg-volt text-black hover:bg-white cursor-pointer shadow-[0_0_20px_rgba(226,255,0,0.3)]'
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
