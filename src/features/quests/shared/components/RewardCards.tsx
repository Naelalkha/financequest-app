import { motion } from 'framer-motion';
import { Zap, Flame, TrendingUp } from 'lucide-react';

/**
 * RewardCards - Debrief phase reward display cards
 * 
 * Displays XP, Streak, and Compound Growth rewards
 */

// XP Card
export const XPCard = ({
    xp = 0,
    label = 'XP RÉCOLTÉS',
    progress = 75,
    delay = 0.1
}) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
    >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                <Zap className="w-5 h-5 text-volt fill-volt" />
            </div>
            <div className="text-left">
                <div className="font-bold text-white text-sm">{label}</div>
                <div className="w-24 h-1 bg-neutral-800 rounded-full mt-1.5 overflow-hidden">
                    <motion.div
                        className="h-full bg-volt"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: delay + 0.2, duration: 0.8 }}
                    />
                </div>
            </div>
        </div>
        <span className="font-mono text-xl font-bold text-white">+{xp}</span>
    </motion.div>
);

// Streak Card
export const StreakCard = ({
    streak = 1,
    label = 'SÉRIE ACTIVE',
    sublabel = 'Continue sur ta lancée !',
    delay = 0.2
}) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex items-center justify-between"
    >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                <Flame className="w-5 h-5 text-blue-500 fill-blue-500" />
            </div>
            <div className="text-left">
                <div className="font-bold text-white text-sm">{label}</div>
                <div className="font-mono text-[9px] text-neutral-500">{sublabel}</div>
            </div>
        </div>
        <span className="font-mono text-xl font-bold text-blue-500">+{streak}</span>
    </motion.div>
);

// Compound Growth Card
export const CompoundCard = ({
    amount = 0,
    label = 'POTENTIEL 10 ANS',
    sublabel = 'Placé à 7%/an pendant 10 ans',
    delay = 0.3
}) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-gradient-to-r from-emerald-900/30 to-neutral-900/80 border border-emerald-800/30 rounded-xl p-4 flex items-center justify-between"
    >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/50 flex items-center justify-center border border-emerald-700/50">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
                <div className="font-bold text-white text-sm">{label}</div>
                <div className="font-mono text-[9px] text-neutral-500">{sublabel}</div>
            </div>
        </div>
        <span className="font-mono text-xl font-bold text-emerald-400">+€{amount.toLocaleString()}</span>
    </motion.div>
);

// Concrete Impact Card
export const ConcreteImpactCard = ({
    icon: Icon,
    label = 'IMPACT CONCRET',
    text = '',
    delay = 0
}) => {
    // Helper to render bold text marked with **
    const renderWithBold = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="text-yellow-400">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.4, ease: 'backOut' }}
            className="w-full mb-8 relative z-10"
        >
            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center flex-shrink-0 border border-yellow-400/30">
                    {Icon && <Icon className="w-5 h-5 text-yellow-400" />}
                </div>
                <div>
                    <span className="block font-mono text-[9px] text-yellow-600 uppercase font-bold mb-0.5">
                        {label}
                    </span>
                    <span className="text-sm font-bold text-white block leading-tight">
                        {renderWithBold(text)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

// Export all cards
export default {
    XPCard,
    StreakCard,
    CompoundCard,
    ConcreteImpactCard
};
