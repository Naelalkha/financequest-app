import React from 'react';

/**
 * LoadingSpinner - Advanced Tech/Nebula loading indicator
 */
const LoadingSpinner = ({ size = 'md', className = '' }) => {
    // On garde vos tailles mais on ajuste pour que les éléments internes s'adaptent
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const containerSize = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
            {/* Anneau Extérieur - Tourne lentement */}
            <div 
                className="absolute inset-0 border-2 border-transparent border-t-volt border-r-volt/30 rounded-full animate-spin" 
                style={{ animationDuration: '1.5s' }}
            ></div>

            {/* Anneau Intérieur - Tourne vite en sens inverse */}
            <div 
                className="absolute inset-2 border-2 border-transparent border-b-volt border-l-volt/50 rounded-full animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1s' }}
            ></div>

            {/* Cœur Pulsant - Donne de la vie */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-volt rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--color-volt),0.8)]"></div>
            </div>
            
            {/* Accessibilité */}
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default LoadingSpinner;