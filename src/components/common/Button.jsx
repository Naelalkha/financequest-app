import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Button component with multiple variants
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  href,
  to,
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center font-semibold
    transition-all duration-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${fullWidth ? 'w-full' : ''}
  `;

  // Size variants
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  // Color variants
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900
      hover:from-yellow-600 hover:to-orange-600
      focus:ring-yellow-500
      transform hover:scale-105 active:scale-95
    `,
    secondary: `
      bg-gray-800 text-gray-300 border border-gray-700
      hover:bg-gray-700 hover:text-white
      focus:ring-gray-500
    `,
    success: `
      bg-gradient-to-r from-green-500 to-emerald-500 text-white
      hover:from-green-600 hover:to-emerald-600
      focus:ring-green-500
      transform hover:scale-105 active:scale-95
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-500 text-white
      hover:from-red-600 hover:to-pink-600
      focus:ring-red-500
      transform hover:scale-105 active:scale-95
    `,
    premium: `
      bg-gradient-to-r from-purple-600 to-pink-600 text-white
      hover:from-purple-700 hover:to-pink-700
      focus:ring-purple-500
      transform hover:scale-105 active:scale-95
      shadow-lg hover:shadow-xl
    `,
    ghost: `
      bg-transparent text-gray-400
      hover:text-white hover:bg-gray-800/50
      focus:ring-gray-500
    `,
    outline: `
      bg-transparent border-2 border-yellow-500 text-yellow-500
      hover:bg-yellow-500 hover:text-gray-900
      focus:ring-yellow-500
    `
  };

  // Combined styles
  const combinedStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${className}
  `;

  // Loading spinner
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Button content
  const ButtonContent = () => (
    <>
      {loading && <LoadingSpinner />}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className={`${size === 'small' ? 'text-sm' : 'text-lg'} ${children ? 'mr-2' : ''}`} />
      )}
      {children}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={`${size === 'small' ? 'text-sm' : 'text-lg'} ${children ? 'ml-2' : ''}`} />
      )}
    </>
  );

  // Render as Link if 'to' prop is provided
  if (to && !disabled) {
    return (
      <Link
        to={to}
        className={combinedStyles}
        {...props}
      >
        <ButtonContent />
      </Link>
    );
  }

  // Render as anchor if 'href' prop is provided
  if (href && !disabled) {
    return (
      <a
        href={href}
        className={combinedStyles}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        <ButtonContent />
      </a>
    );
  }

  // Default button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedStyles}
      {...props}
    >
      <ButtonContent />
    </button>
  );
};

export default Button;