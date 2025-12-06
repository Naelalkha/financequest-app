import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

/**
 * RollingCounter - Animated number counter with spring physics
 * 
 * @param {Object} props
 * @param {number} props.value - Target value to animate to
 * @param {string} props.prefix - Text before number (e.g., '+')
 * @param {string} props.suffix - Text after number (e.g., '€')
 * @param {number} props.duration - Animation duration in seconds
 * @param {string} props.className - Additional classes for the number
 */
const RollingCounter = ({
    value = 0,
    prefix = '+',
    suffix = '€',
    duration = 1.5,
    className = ''
}) => {
    const [isAnimating, setIsAnimating] = useState(true);

    const springValue = useSpring(0, {
        stiffness: 50,
        damping: 20,
        duration: duration * 1000
    });

    const displayValue = useTransform(springValue, (latest) => {
        return Math.round(latest);
    });

    const [displayNumber, setDisplayNumber] = useState(0);

    useEffect(() => {
        springValue.set(value);

        const unsubscribe = displayValue.on('change', (latest) => {
            setDisplayNumber(latest);
        });

        const timer = setTimeout(() => {
            setIsAnimating(false);
        }, duration * 1000 + 500);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, [value, springValue, displayValue, duration]);

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: 'backOut' }}
            className={`inline-flex items-baseline gap-1 ${className}`}
        >
            {/* Prefix */}
            {prefix && (
                <span className="text-volt/80">{prefix}</span>
            )}

            {/* Number */}
            <motion.span
                className="tabular-nums"
                animate={isAnimating ? {
                    textShadow: [
                        '0 0 20px rgba(226, 255, 0, 0.4)',
                        '0 0 40px rgba(226, 255, 0, 0.8)',
                        '0 0 20px rgba(226, 255, 0, 0.4)'
                    ]
                } : {}}
                transition={{ duration: 0.5, repeat: isAnimating ? Infinity : 0 }}
            >
                {displayNumber}
            </motion.span>

            {/* Suffix */}
            {suffix && (
                <span className="text-volt/80">{suffix}</span>
            )}
        </motion.div>
    );
};

export default RollingCounter;
