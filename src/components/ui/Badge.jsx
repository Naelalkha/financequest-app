import React from 'react';
import './Badge.css';

/**
 * Design System Badge Component
 * Status pills (NEW, PREMIUM, COMPLETED, IN_PROGRESS, etc.)
 */
export const Badge = ({
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
