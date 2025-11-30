import React from 'react';
import './Card.css';

/**
 * Design System Card Component - "Onyx & Volt" Theme
 * Base black card with grey border, used throughout the app
 */
export const Card = ({
    children,
    className = '',
    padding = 'medium',
    hover = false,
    glow = false,
    ...props
}) => {
    const baseClass = 'fq-card';
    const paddingClass = `fq-card--padding-${padding}`;
    const hoverClass = hover ? 'fq-card--hover' : '';
    const glowClass = glow ? 'fq-card--glow' : '';

    return (
        <div
            className={`${baseClass} ${paddingClass} ${hoverClass} ${glowClass} ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
