import React from 'react';
import './Button.css';

/** Variantes visuelles du bouton */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Tailles disponibles */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Props du composant Button
 * @description Bouton du Design System Moniyo - Thème "Onyx & Volt"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Variante visuelle (primary = volt yellow, secondary = grey, ghost = transparent, danger = red) */
    variant?: ButtonVariant;
    /** Taille du bouton */
    size?: ButtonSize;
    /** Largeur 100% */
    fullWidth?: boolean;
    /** Contenu du bouton */
    children: React.ReactNode;
}

/**
 * Design System Button Component - "Onyx & Volt" Theme
 * Variants: primary (volt yellow), secondary (grey), ghost (transparent), danger (red)
 */
export const Button: React.FC<ButtonProps> = ({
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
