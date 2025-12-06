import { motion } from 'framer-motion';
import { Zap, Flame } from 'lucide-react';

/**
 * RewardCard - Glassmorphism reward display with optional progress bar
 * 
 * @param {Object} props
 * @param {('xp'|'streak')} props.type - Card type
 * @param {number} props.value - Reward value
 * @param {string} props.label - Card label
 * @param {string} props.sublabel - Secondary label
 * @param {number} props.progress - Progress percentage (0-100) for XP bar
 * @param {number} props.index - Animation stagger index
 */
const RewardCard = ({
    type = 'xp',
    value = 0,
    label = '',
    sublabel = '',
    progress = 0,
    index = 0
}) => {
    const Icon = type === 'xp' ? Zap : Flame;
    const iconColor = type === 'xp' ? 'text-volt fill-volt' : 'text-orange-500 fill-orange-500';
    const iconBg = type === 'xp' ? 'bg-volt/20' : 'bg-orange-500/20';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay: 0.8 + (index * 0.2),
                duration: 0.5,
                ease: 'backOut'
            }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4"
        >
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4">
                {/* Icon */}
                <motion.div
                    className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: type === 'streak' ? [0, 5, -5, 0] : 0
                    }}
                    transition={{
                        delay: 1 + (index * 0.2),
                        duration: 0.5
                    }}
                >
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">{label}</span>
                        <motion.span
                            className="font-mono text-lg font-bold text-volt"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2 + (index * 0.2) }}
                        >
                            +{value}{type === 'xp' ? ' XP' : ''}
                        </motion.span>
                    </div>

                    {/* Sublabel */}
                    {sublabel && (
                        <span className="text-xs text-gray-500 font-mono">{sublabel}</span>
                    )}

                    {/* Progress bar for XP */}
                    {type === 'xp' && progress > 0 && (
                        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-volt to-yellow-300 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ delay: 1.4 + (index * 0.2), duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default RewardCard;
