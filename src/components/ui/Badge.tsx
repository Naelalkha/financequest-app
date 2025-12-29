import React from 'react';
import './Badge.css';

/** Variantes du badge */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium';

/** Tailles disponibles */
export type BadgeSize = 'small' | 'medium' | 'large';

/**
 * Props du composant Badge
 * @description Pills de statut (NEW, PREMIUM, COMPLETED, IN_PROGRESS, etc.)
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Variante visuelle */
    variant?: BadgeVariant;
    /** Taille du badge */
    size?: BadgeSize;
    /** Contenu du badge */
    children: React.ReactNode;
}

/**
 * Design System Badge Component
 * Status pills (NEW, PREMIUM, COMPLETED, IN_PROGRESS, etc.)
 */
export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'medium',
    className = '',
    ...props
}) => {
    const baseClass = 'fq-badge';
    const variantClass = `fq-badge--${variant}`;
    const sizeClass = `fq-badge--${size}`;

    return (
        <span
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`.trim()}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
