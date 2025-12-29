import React from 'react';
import './Card.css';

/** Tailles de padding */
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

/**
 * Props du composant Card
 * @description Carte du Design System Moniyo - Thème "Onyx & Volt"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Taille du padding interne */
    padding?: CardPadding;
    /** Effet hover activé */
    hover?: boolean;
    /** Effet glow activé */
    glow?: boolean;
    /** Contenu de la carte */
    children: React.ReactNode;
}

/**
 * Design System Card Component - "Onyx & Volt" Theme
 * Base black card with grey border, used throughout the app
 */
export const Card: React.FC<CardProps> = ({
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
