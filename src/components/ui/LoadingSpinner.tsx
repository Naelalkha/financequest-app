import React from 'react';

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
}

/** Classes de taille */
const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
};

/**
 * LoadingSpinner - Advanced Tech/Nebula loading indicator
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className = ''
}) => {
    const containerSize = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
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
        </div>
    );
};

export default LoadingSpinner;
