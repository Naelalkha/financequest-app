import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * ExecutionScreen - Phase 2: Target Selection & Amount Input
 * 
 * Clean Kill List grid with letter icons + Giant centered input
 */

// THE KILL LIST - Simpler, text-based styling
const SUBSCRIPTION_SERVICES = [
    { id: 'netflix', name: 'Netflix', icon: 'N', color: 'text-red-600', defaultPrice: 13.49 },
    { id: 'spotify', name: 'Spotify', icon: 'S', color: 'text-green-500', defaultPrice: 10.99 },
    { id: 'prime', name: 'Prime', icon: 'P', color: 'text-blue-400', defaultPrice: 6.99 },
    { id: 'apple', name: 'Apple', icon: '', color: 'text-gray-300', defaultPrice: 16.99 },
    { id: 'disney', name: 'Disney+', icon: 'D+', color: 'text-blue-600', defaultPrice: 8.99 },
    { id: 'other', name: 'Autre', icon: '?', color: 'text-white', defaultPrice: 0, isCustom: true },
];

const ExecutionScreen = ({ data = {}, onUpdate, onNext }) => {
    const { t, i18n } = useTranslation('quests');
    const locale = i18n.language;
    const inputRef = useRef(null);

    // Local state
    const [selectedServiceId, setSelectedServiceId] = useState(data.subscription?.id || null);
    const [customName, setCustomName] = useState(data.customName || '');
    const [price, setPrice] = useState(data.monthlyAmount?.toString() || '');
    const [frequency, setFrequency] = useState(data.frequency || 'MONTHLY');

    // Auto-focus input after selection
    useEffect(() => {
        if (selectedServiceId && inputRef.current) {
            inputRef.current.focus();
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

    // Calculate impact
    const rawPrice = parseFloat(price) || 0;
    const annualSavings = frequency === 'MONTHLY' ? rawPrice * 12 : rawPrice;
    const monthlyEquivalent = frequency === 'YEARLY' ? rawPrice / 12 : rawPrice;

    // Validation
    const isValid = selectedServiceId && rawPrice > 0;

    // Handle next
    const handleNext = () => {
        const service = SUBSCRIPTION_SERVICES.find(s => s.id === selectedServiceId);
        onUpdate({
            subscription: service,
            serviceName: service?.isCustom ? customName : service?.name,
            monthlyAmount: monthlyEquivalent,
            annualAmount: annualSavings,
            frequency,
            customName
        });
        onNext();
    };

    // Translations
    const labels = {
        fr: {
            title: 'IDENTIFIE LA CIBLE',
            perMonth: '/MOIS',
            perYear: '/AN',
            impactFeedback: `Soit ${annualSavings.toFixed(2)}€ par an d'impact`,
            cta: 'ÉLIMINER LA DÉPENSE'
        },
        en: {
            title: 'IDENTIFY THE TARGET',
            perMonth: '/MONTH',
            perYear: '/YEAR',
            impactFeedback: `That's €${annualSavings.toFixed(2)} per year impact`,
            cta: 'ELIMINATE EXPENSE'
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-mono text-xs text-neutral-500 tracking-[0.2em] uppercase mb-6"
                    >
                        {currentLabels.title}
                    </motion.h3>

                    {/* KILL LIST GRID */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-3 gap-3 mb-8"
                    >
                        {SUBSCRIPTION_SERVICES.map((service, index) => (
                            <motion.button
                                key={service.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.05 * index }}
                                onClick={() => handleServiceSelect(service)}
                                className={`
                  h-14 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200
                  ${selectedServiceId === service.id
                                        ? 'bg-volt text-black border-volt shadow-[0_0_15px_rgba(226,255,0,0.4)] scale-105 z-10'
                                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800'
                                    }
                `}
                            >
                                <span className={`font-black text-lg ${selectedServiceId === service.id ? 'text-black' : service.color}`}>
                                    {service.icon}
                                </span>
                                <span className="font-mono text-[8px] font-bold uppercase tracking-wide">
                                    {service.name}
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* GIANT INPUT */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative mb-2"
                    >
                        {/* Service name tag */}
                        <AnimatePresence>
                            {selectedServiceId && customName && (
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
                            <span className={`text-3xl font-sans font-bold transition-colors ${price ? 'text-white' : 'text-neutral-700'}`}>
                                €
                            </span>
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="decimal"
                                value={price}
                                onChange={handlePriceChange}
                                placeholder="00.00"
                                className="w-full max-w-[280px] bg-transparent text-center text-7xl font-mono font-bold text-white placeholder-neutral-800 focus:outline-none caret-volt"
                                style={{ caretColor: '#E2FF00' }}
                            />
                        </div>
                    </motion.div>

                    {/* FREQUENCY PILLS */}
                    <div className="flex justify-center gap-2 mb-6">
                        <button
                            onClick={() => setFrequency('MONTHLY')}
                            className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-bold border transition-all ${frequency === 'MONTHLY'
                                    ? 'bg-white text-black border-white'
                                    : 'bg-transparent text-neutral-600 border-neutral-800 hover:border-neutral-600'
                                }`}
                        >
                            {currentLabels.perMonth}
                        </button>
                        <button
                            onClick={() => setFrequency('YEARLY')}
                            className={`px-4 py-1.5 rounded-full font-mono text-[10px] font-bold border transition-all ${frequency === 'YEARLY'
                                    ? 'bg-white text-black border-white'
                                    : 'bg-transparent text-neutral-600 border-neutral-800 hover:border-neutral-600'
                                }`}
                        >
                            {currentLabels.perYear}
                        </button>
                    </div>

                    {/* REAL-TIME IMPACT FEEDBACK */}
                    <AnimatePresence>
                        {rawPrice > 0 && frequency === 'MONTHLY' && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="font-mono text-xs text-neutral-400"
                            >
                                {currentLabels.impactFeedback}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer: CTA */}
            <div className="p-6 bg-[#0A0A0A] border-t border-neutral-800">
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: isValid ? 1.02 : 1 }}
                    whileTap={{ scale: isValid ? 0.98 : 1 }}
                    onClick={handleNext}
                    disabled={!isValid}
                    className={`
            w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 transition-all
            ${isValid
                            ? 'bg-black text-white border border-volt/50 hover:bg-volt hover:text-black hover:border-transparent cursor-pointer'
                            : 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed'
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
