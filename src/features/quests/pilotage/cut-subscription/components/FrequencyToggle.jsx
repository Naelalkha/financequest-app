import { motion } from 'framer-motion';

/**
 * FrequencyToggle - Pill-style frequency selector
 * 
 * @param {Object} props
 * @param {('month'|'year')} props.value - Current selected frequency
 * @param {Function} props.onChange - Callback with 'month' or 'year'
 * @param {string} props.locale - 'fr' or 'en'
 */
const FrequencyToggle = ({ value = 'month', onChange, locale = 'fr' }) => {
    const labels = {
        fr: { month: '/MOIS', year: '/AN' },
        en: { month: '/MONTH', year: '/YEAR' }
    };

    const options = [
        { key: 'month', label: labels[locale]?.month || '/MONTH' },
        { key: 'year', label: labels[locale]?.year || '/YEAR' }
    ];

    return (
        <div className="flex items-center justify-center gap-2 p-1 bg-white/5 rounded-full border border-white/10">
            {options.map((option) => {
                const isSelected = value === option.key;

                return (
                    <motion.button
                        key={option.key}
                        onClick={() => onChange(option.key)}
                        whileTap={{ scale: 0.95 }}
                        className={`
              relative px-6 py-2 rounded-full font-mono text-sm font-bold uppercase tracking-wider
              transition-colors duration-200
              ${isSelected
                                ? 'text-black'
                                : 'text-gray-400 hover:text-white'
                            }
            `}
                    >
                        {/* Active background */}
                        {isSelected && (
                            <motion.div
                                layoutId="frequency-active"
                                className="absolute inset-0 bg-volt rounded-full"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            />
                        )}

                        {/* Label */}
                        <span className="relative z-10">{option.label}</span>
                    </motion.button>
                );
            })}
        </div>
    );
};

export default FrequencyToggle;
