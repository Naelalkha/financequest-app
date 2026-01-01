import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DURATION, EASE } from '../../styles/animationConstants';

/** Tailles disponibles */
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props du composant LoadingSpinner
 * @description Indicateur de chargement Tech/Nebula
 */
export interface LoadingSpinnerProps {
    /** Taille du spinner */
    size?: SpinnerSize;
    /** Classes CSS additionnelles */
    className?: string;
    /** Message de chargement optionnel */
    message?: string;
}

/** Classes de taille */
const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
};

/**
 * LoadingSpinner - Advanced Tech/Nebula loading indicator with smooth transitions
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className = '',
    message
}) => {
    const containerSize = sizeClasses[size] || sizeClasses.md;

    return (
        <motion.div
            className={`relative flex items-center justify-center ${containerSize} ${className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
                duration: DURATION.medium,
                ease: EASE.outExpo
            }}
        >
            {/* Anneau Extérieur - Tourne lentement */}
            <div
                className="absolute inset-0 border-2 border-transparent border-t-volt border-r-volt/30 rounded-full animate-spin"
                style={{ animationDuration: '1.5s' }}
            />

            {/* Anneau Intérieur - Tourne vite en sens inverse */}
            <div
                className="absolute inset-2 border-2 border-transparent border-b-volt border-l-volt/50 rounded-full animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1s' }}
            />

            {/* Cœur Pulsant */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-volt rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--color-volt),0.8)]" />
            </div>

            {/* Accessibilité */}
            <span className="sr-only">Loading...</span>
        </motion.div>
    );
};

/**
 * LoadingScreen - Full screen loading state with smooth enter/exit transitions
 */
export const LoadingScreen: React.FC<{ message?: string; isVisible?: boolean }> = ({
    message = 'Loading...',
    isVisible = true
}) => {
    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    className="min-h-screen flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: DURATION.medium,
                        ease: EASE.premium
                    }}
                >
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                            duration: DURATION.normal,
                            ease: EASE.outExpo,
                            delay: 0.1
                        }}
                    >
                        <div className="mb-6 flex items-center justify-center">
                            <LoadingSpinner size="lg" />
                        </div>
                        <motion.p
                            className="text-gray-400 text-lg font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: DURATION.normal }}
                        >
                            {message}
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingSpinner;
