import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Coffee, Utensils, Flame, Car, Beer, Plus } from 'lucide-react';
import { expenseCategories, expenseCategoryLabels, calculateProjections } from '../insightData';
import { Slider } from '../../../../../components/ui';
import { haptic } from '../../../../../utils/haptics';
import { SPRING } from '../../../../../styles/animationConstants';

/**
 * ExecutionScreen - Phase 2: "L'AMPLIFICATEUR TEMPOREL"
 * 
 * Quest 02: TRAQUE INVISIBLE
 * Features:
 * - Icon grid with Lucide icons (neutral style)
 * - Scale effect on selected item
 * - Slider/input for daily cost (fixed width)
 * - Live projections: monthly, yearly, 5-year compound
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

const ExecutionScreen = ({ data = {}, onUpdate, onNext }) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Local state
    const [selectedCategoryId, setSelectedCategoryId] = useState(data.categoryId || null);
    const [dailyAmount, setDailyAmount] = useState(data.dailyAmount || 0);
    const [customName, setCustomName] = useState(data.customName || '');

    // Get category labels
    const categoryLabels = expenseCategoryLabels[locale] || expenseCategoryLabels.fr;

    // Calculate projections
    const projections = calculateProjections(dailyAmount);

    // Handle category selection with haptic
    const handleCategorySelect = useCallback((category) => {
        haptic.medium();
        setSelectedCategoryId(category.id);
        setDailyAmount(category.defaultAmount);
        setCustomName(categoryLabels[category.id]);
    }, [categoryLabels]);

    // Handle slider change (haptic is built into Slider component)
    const handleSliderChange = useCallback((value) => {
        setDailyAmount(value);
    }, []);

    // Handle direct input
    const handleInputChange = (e) => {
        const value = e.target.value;
        setDailyAmount(parseFloat(value) || 0);
    };

    // Validation
    const isValid = selectedCategoryId && dailyAmount > 0;

    // Handle next with haptic feedback
    const handleNext = useCallback(() => {
        haptic.success();
        
        const category = expenseCategories.find(c => c.id === selectedCategoryId);
        const displayName = categoryLabels[category?.id] || customName;

        onUpdate({
            categoryId: selectedCategoryId,
            category: category,
            expenseName: displayName,
            dailyAmount,
            monthlyAmount: projections.monthly,
            yearlyAmount: projections.yearly,
            tenYearAmount: projections.tenYear,
            equivalent: projections.equivalent,
            customName
        });
        onNext();
    }, [selectedCategoryId, categoryLabels, customName, dailyAmount, projections, onUpdate, onNext]);

    // Labels
    const labels = {
        fr: {
            title: 'CIBLE LA FUITE',
            perDay: '/ jour',
            monthly: 'Au Mois',
            yearly: 'À l\'Année',
            fiveYear: 'POTENTIEL 5 ANS',
            fiveYearDesc: 'Placé en bourse (moy. 7%/an)',
            cta: 'ÉLIMINER CETTE DÉPENSE'
        },
        en: {
            title: 'TARGET THE LEAK',
            perDay: '/ day',
            monthly: 'Monthly',
            yearly: 'Yearly',
            fiveYear: '5-YEAR POTENTIAL',
            fiveYearDesc: 'Invested in stocks (avg. 7%/yr)',
            cta: 'ELIMINATE THIS EXPENSE'
        }
    };
    const currentLabels = labels[locale] || labels.fr;

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex flex-col h-full">
                <div className="text-center mb-6">
                    {/* Title */}
                    <h3 className="font-mono text-xs text-neutral-500 tracking-[0.2em] uppercase mb-6">
                        {currentLabels.title}
                    </h3>

                    {/* ===== ITEM SELECTOR GRID (3 cols, Lucide icons) ===== */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {expenseCategories.map((category) => {
                            const IconComponent = ICON_MAP[category.iconName];
                            const isSelected = selectedCategoryId === category.id;

                            return (
                                <motion.button
                                    key={category.id}
                                    animate={{
                                        scale: isSelected ? 1.05 : 1,
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={SPRING.snappy}
                                    onClick={() => handleCategorySelect(category)}
                                    className={`
                                        py-4 rounded-xl border flex flex-col items-center justify-center gap-2 transform-gpu
                                        ${isSelected
                                            ? 'bg-volt text-black border-volt shadow-[0_0_20px_rgba(226,255,0,0.4)] z-10'
                                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 active:bg-neutral-800'
                                        }
                                    `}
                                >
                                    {IconComponent && (
                                        <motion.div
                                            animate={{ 
                                                rotate: isSelected ? [0, -8, 8, 0] : 0,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <IconComponent className={`w-6 h-6 ${isSelected ? 'text-black' : 'text-neutral-400'}`} />
                                        </motion.div>
                                    )}
                                    <span className={`font-mono text-[9px] font-bold uppercase tracking-wide ${isSelected ? 'text-black' : 'text-neutral-400'}`}>
                                        {categoryLabels[category.id]}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* ===== PRICE INPUT + SLIDER ===== */}
                    <div className="mb-8">
                        {/* Big Amount Display - Fixed width container */}
                        <div className="flex items-baseline justify-center gap-2 mb-6">
                            <input
                                type="number"
                                value={dailyAmount || ''}
                                onChange={handleInputChange}
                                placeholder="0"
                                className="w-28 bg-transparent text-center text-6xl font-mono font-bold text-white placeholder-neutral-800 focus:outline-none caret-volt transform-gpu"
                                style={{ caretColor: '#E2FF00' }}
                            />
                            <span 
                                className={`text-4xl font-sans font-bold transition-colors duration-200 ${dailyAmount > 0 ? 'text-white' : 'text-neutral-700'}`}
                            >
                                €
                            </span>
                            <span className="font-mono text-base text-neutral-500">{currentLabels.perDay}</span>
                        </div>

                        {/* Premium Slider with haptics */}
                        <div className="px-2">
                            <Slider
                                value={dailyAmount || 0}
                                onChange={handleSliderChange}
                                min={1}
                                max={50}
                                step={0.5}
                                hapticOnChange={true}
                                hapticOnSnap={true}
                            />
                        </div>
                    </div>

                    {/* ===== LIVE PROJECTION COUNTERS ===== */}
                    <AnimatePresence>
                        {dailyAmount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-3"
                            >
                                {/* Monthly */}
                                <div className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-white/5">
                                    <span className="font-mono text-[10px] text-neutral-400 uppercase">{currentLabels.monthly}</span>
                                    <span className="font-mono text-sm font-bold text-white">{projections.monthly.toFixed(0)} €</span>
                                </div>

                                {/* Yearly */}
                                <div className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-white/5">
                                    <span className="font-mono text-[10px] text-neutral-400 uppercase">{currentLabels.yearly}</span>
                                    <span className="font-mono text-sm font-bold text-white">{projections.yearly.toFixed(0)} €</span>
                                </div>

                                {/* 5-Year Hero Card */}
                                <div 
                                    className={`flex justify-between items-center p-4 rounded-xl border border-volt/30 bg-volt/10 transform-gpu transition-shadow duration-300 ${
                                        dailyAmount > 20 
                                            ? 'shadow-[0_0_30px_rgba(226,255,0,0.25)]' 
                                            : 'shadow-[0_0_15px_rgba(226,255,0,0.1)]'
                                    }`}
                                >
                                    <div className="text-left">
                                        <span className="font-mono text-[10px] text-volt font-bold uppercase block mb-1">
                                            {currentLabels.fiveYear}
                                        </span>
                                        <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider block">
                                            {currentLabels.fiveYearDesc}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className="font-mono text-2xl font-black text-volt block transform-gpu"
                                            style={{ textShadow: '0 0 20px rgba(226, 255, 0, 0.5)' }}
                                        >
                                            {projections.tenYear.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                                        </span>
                                    </div>
                                </div>

                                {/* Equivalent Object Badge */}
                                {projections.equivalent && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex justify-center"
                                    >
                                        <div className="inline-flex items-center gap-2 bg-black/50 rounded-full px-4 py-2 border border-volt/20">
                                            <span className="text-xl">{projections.equivalent.icon}</span>
                                            <span className="font-sans text-sm text-volt font-medium">
                                                {projections.equivalent.text}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer: CTA */}
            <div className="mt-auto pt-6">
                <motion.button
                    animate={{ 
                        scale: 1,
                    }}
                    whileTap={isValid ? { scale: 0.97 } : {}}
                    transition={SPRING.snappy}
                    onClick={handleNext}
                    disabled={!isValid}
                    className={`
                        w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 transform-gpu
                        ${isValid
                            ? 'bg-volt text-black cursor-pointer shadow-[0_0_25px_rgba(226,255,0,0.35)]'
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
