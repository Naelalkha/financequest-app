import { motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * QuestHeader - Consistent header for quest phases
 * 
 * @param {string} phaseLabel - e.g., "PHASE 01 // PROTOCOLE"
 * @param {string} title - e.g., "BRIEFING"
 * @param {function} onClose - Close handler
 */
const QuestHeader = ({
    phaseLabel,
    title,
    onClose,
    showClose = true
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50"
        >
            <div>
                <span className="font-mono text-[9px] text-volt tracking-[0.2em] uppercase animate-pulse">
                    {phaseLabel}
                </span>
                <h2 className="font-sans font-bold text-lg text-white leading-none mt-1">
                    {title}
                </h2>
            </div>

            {showClose && onClose && (
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </motion.div>
    );
};

export default QuestHeader;
