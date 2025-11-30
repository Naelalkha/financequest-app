import React from 'react';
import './Input.css';

/**
 * Design System Input Component - "Dark Glass" Theme
 * Form inputs with dark glassmorphism effect
 */
export const Input = ({
    label,
    error,
    helperText,
    fullWidth = false,
    className = '',
    type = 'text',
    ...props
}) => {
    const wrapperClass = fullWidth ? 'fq-input-wrapper--full' : '';

    return (
        <div className={`fq-input-wrapper ${wrapperClass} ${className}`.trim()}>
            {label && (
                <label className="fq-input-label">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`fq-input ${error ? 'fq-input--error' : ''}`}
                {...props}
            />
            {helperText && !error && (
                <p className="fq-input-helper">{helperText}</p>
            )}
            {error && (
                <p className="fq-input-error">{error}</p>
            )}
        </div>
    );
};

export default Input;
