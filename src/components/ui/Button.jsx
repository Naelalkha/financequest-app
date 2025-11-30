import React from 'react';
import './Button.css';

/**
 * Design System Button Component - "Onyx & Volt" Theme
 * Variants: primary (volt yellow), secondary (grey), ghost (transparent), danger (red)
 */
export const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    disabled = false,
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const baseClass = 'fq-button';
    const variantClass = `fq-button--${variant}`;
    const sizeClass = `fq-button--${size}`;
    const widthClass = fullWidth ? 'fq-button--full' : '';
    const disabledClass = disabled ? 'fq-button--disabled' : '';

    return (
        <button
            type={type}
            className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${disabledClass} ${className}`.trim()}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
