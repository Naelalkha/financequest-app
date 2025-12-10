import { motion } from 'framer-motion';

/**
 * QuestContainer - Full-screen modal container for quests
 * 
 * Provides consistent styling and animation for all quests
 * 
 * @param {ReactNode} children - Quest content
 * @param {function} onClose - Close handler
 */
const QuestContainer = ({
    children,
    onClose,
    className = ''
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'backOut' }}
                className={`
                    w-full max-w-md h-[90vh] max-h-[850px] 
                    bg-[#0A0A0A] border border-neutral-800 rounded-3xl 
                    overflow-hidden shadow-2xl relative flex flex-col
                    ${className}
                `}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default QuestContainer;
