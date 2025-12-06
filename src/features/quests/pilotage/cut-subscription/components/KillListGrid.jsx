import { motion } from 'framer-motion';
import { FaVideo, FaMusic, FaAmazon, FaApple, FaQuestion, FaTv } from 'react-icons/fa';


/**
 * KillListGrid - Tactical subscription selection grid
 * 
 * @param {Object} props
 * @param {string|null} props.selectedId - Currently selected subscription ID
 * @param {Function} props.onSelect - Callback with subscription object
 * @param {string} props.locale - 'fr' or 'en'
 */

const SUBSCRIPTION_OPTIONS = [
    {
        id: 'netflix',
        name: 'Netflix',
        icon: FaVideo,
        avgPrice: 13.49,
        color: '#E50914',
        bgGradient: 'from-red-600 to-red-700'
    },
    {
        id: 'spotify',
        name: 'Spotify',
        icon: FaMusic,
        avgPrice: 10.99,
        color: '#1DB954',
        bgGradient: 'from-green-500 to-green-600'
    },
    {
        id: 'prime',
        name: 'Prime',
        icon: FaAmazon,
        avgPrice: 6.99,
        color: '#00A8E1',
        bgGradient: 'from-blue-500 to-blue-600'
    },
    {
        id: 'disney',
        name: 'Disney+',
        icon: FaTv,
        avgPrice: 8.99,
        color: '#113CCF',
        bgGradient: 'from-blue-600 to-indigo-700'
    },
    {
        id: 'apple',
        name: 'Apple',
        icon: FaApple,
        avgPrice: 6.99,
        color: '#A2AAAD',
        bgGradient: 'from-gray-500 to-gray-600'
    },
    {
        id: 'other',
        name: 'Autre',
        nameEn: 'Other',
        icon: FaQuestion,
        avgPrice: 0,
        color: '#525252',
        bgGradient: 'from-neutral-600 to-neutral-700',
        isCustom: true
    },
];

const KillListGrid = ({ selectedId = null, onSelect, locale = 'fr' }) => {
    return (
        <div className="grid grid-cols-3 gap-3">
            {SUBSCRIPTION_OPTIONS.map((subscription, index) => {
                const Icon = subscription.icon;
                const isSelected = selectedId === subscription.id;
                const displayName = locale === 'en' && subscription.nameEn
                    ? subscription.nameEn
                    : subscription.name;

                return (
                    <motion.button
                        key={subscription.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect(subscription)}
                        className={`
              relative aspect-square rounded-2xl border-2 p-3
              flex flex-col items-center justify-center gap-2
              transition-all duration-200 backdrop-blur-sm
              ${isSelected
                                ? 'bg-volt/10 border-volt shadow-[0_0_20px_rgba(226,255,0,0.3)]'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }
            `}
                    >
                        {/* Selection ring */}
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute inset-0 rounded-2xl border-2 border-volt"
                                style={{ boxShadow: '0 0 15px rgba(226, 255, 0, 0.4)' }}
                            />
                        )}

                        {/* Icon container */}
                        <div
                            className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                bg-gradient-to-br ${subscription.bgGradient}
                ${isSelected ? 'shadow-lg' : ''}
              `}
                        >
                            <Icon className="text-white text-lg" />
                        </div>

                        {/* Name */}
                        <span className={`
              text-xs font-bold uppercase tracking-wide
              ${isSelected ? 'text-volt' : 'text-white'}
            `}>
                            {displayName}
                        </span>

                        {/* Price hint (not for "other") */}
                        {!subscription.isCustom && (
                            <span className={`
                text-[10px] font-mono
                ${isSelected ? 'text-volt/70' : 'text-gray-500'}
              `}>
                                ~{subscription.avgPrice}€
                            </span>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
};

export { SUBSCRIPTION_OPTIONS };
export default KillListGrid;
