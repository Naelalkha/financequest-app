import { motion } from 'framer-motion';

/**
 * QuestProgressBar - Adaptive progress bar for quest phases
 * 
 * Automatically adjusts to the number of phases
 * 
 * @param {number} progress - Progress percentage (0-100)
 * @param {number} totalSteps - Total number of phases
 * @param {boolean} showDots - Show step indicator dots
 */
const QuestProgressBar = ({
    progress = 0,
    totalSteps = 3,
    showDots = false,
    currentStep = 0
}) => {
    return (
        <div className="absolute top-0 left-0 w-full z-50">
            {/* Main progress bar */}
            <div className="h-1 bg-neutral-800 w-full">
                <motion.div
                    className="h-full bg-volt transition-all duration-500 ease-out"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    style={{
                        boxShadow: '0 0 10px rgba(226, 255, 0, 0.4)'
                    }}
                />
            </div>

            {/* Optional step dots */}
            {showDots && totalSteps > 1 && (
                <div className="flex justify-between px-6 mt-2">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={`
                                w-2 h-2 rounded-full transition-all duration-300
                                ${i <= currentStep
                                    ? 'bg-volt shadow-[0_0_6px_rgba(226,255,0,0.5)]'
                                    : 'bg-neutral-700'
                                }
                            `}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuestProgressBar;
