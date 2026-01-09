import { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { haptic } from '../../utils/haptics';
import { SPRING } from '../../styles/animationConstants';
import './Slider.css';

/**
 * Props du composant Slider
 * @description Slider mobile-optimized avec haptic feedback
 */
export interface SliderProps {
    /** Valeur actuelle */
    value?: number;
    /** Callback de changement */
    onChange?: (value: number) => void;
    /** Valeur minimum */
    min?: number;
    /** Valeur maximum */
    max?: number;
    /** Incrément de pas */
    step?: number;
    /** Désactivé */
    disabled?: boolean;
    /** Afficher la valeur */
    showValue?: boolean;
    /** Fonction de formatage de la valeur */
    formatValue?: (value: number) => string | number;
    /** Haptic feedback au changement */
    hapticOnChange?: boolean;
    /** Haptic feedback au snap */
    hapticOnSnap?: boolean;
    /** Classes CSS additionnelles */
    className?: string;
    /** Classes CSS pour la track */
    trackClassName?: string;
    /** Classes CSS pour le thumb */
    thumbClassName?: string;
    /** Couleur d'accentuation (hex) - remplace volt par défaut */
    accentColor?: string;
}

/**
 * Premium Slider Component - Mobile Optimized
 * 
 * Features:
 * - Native touch events for reliable mobile tracking
 * - Haptic feedback on value changes
 * - GPU-accelerated transforms (no spring during drag)
 * - Accessible (keyboard support)
 * - Snap to steps with haptic ticks
 */
const Slider: React.FC<SliderProps> = ({
    value = 0,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    showValue = false,
    formatValue = (v) => v,
    hapticOnChange = true,
    hapticOnSnap = true,
    className = '',
    trackClassName = '',
    thumbClassName = '',
    accentColor,
}) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const lastHapticValue = useRef(value);
    const isDraggingRef = useRef(false);

    // Calculate progress from value (0-100%)
    const valueToProgress = useCallback((val: number) => {
        return ((val - min) / (max - min)) * 100;
    }, [min, max]);

    // Calculate value from progress
    const progressToValue = useCallback((prog: number) => {
        const rawValue = (prog / 100) * (max - min) + min;
        // Snap to step
        const snappedValue = Math.round(rawValue / step) * step;
        // Round to avoid floating point issues
        const rounded = Math.round(snappedValue * 1000) / 1000;
        return Math.max(min, Math.min(max, rounded));
    }, [min, max, step]);

    // Current progress percentage
    const progress = valueToProgress(value);

    // Handle haptic feedback
    const triggerHaptic = useCallback((newValue: number) => {
        if (!hapticOnChange) return;

        // Haptic tick when crossing step boundaries
        const stepDiff = Math.abs(newValue - lastHapticValue.current);
        if (stepDiff >= step) {
            if (hapticOnSnap) {
                haptic.tick();
            }
            lastHapticValue.current = newValue;
        }
    }, [hapticOnChange, hapticOnSnap, step]);

    // Get clientX from either mouse or touch event
    const getClientX = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
        if ('touches' in e && e.touches.length > 0) {
            return e.touches[0].clientX;
        }
        if ('changedTouches' in e && e.changedTouches.length > 0) {
            return e.changedTouches[0].clientX;
        }
        return (e as MouseEvent).clientX;
    }, []);

    // Handle drag - updates value directly without animation
    const handleDrag = useCallback((clientX: number) => {
        if (!trackRef.current || disabled) return;

        const rect = trackRef.current.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(100,
            ((clientX - rect.left) / rect.width) * 100
        ));

        const newValue = progressToValue(percentage);

        triggerHaptic(newValue);
        onChange?.(newValue);
    }, [disabled, progressToValue, triggerHaptic, onChange]);

    // Touch/Mouse start handler
    const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;

        e.preventDefault();
        e.stopPropagation();

        isDraggingRef.current = true;
        setIsDragging(true);

        haptic.light();
        handleDrag(getClientX(e));
    }, [disabled, handleDrag, getClientX]);

    // Touch/Mouse move handler
    const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current || disabled) return;

        e.preventDefault();
        e.stopPropagation();

        handleDrag(getClientX(e));
    }, [disabled, handleDrag, getClientX]);

    // Touch/Mouse end handler
    const handleEnd = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current) return;

        e.preventDefault();

        isDraggingRef.current = false;
        setIsDragging(false);
        haptic.medium();
    }, []);

    // Setup and cleanup global event listeners for drag tracking
    useEffect(() => {
        const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
            if (isDraggingRef.current) {
                handleMove(e);
            }
        };

        const handleGlobalEnd = (e: MouseEvent | TouchEvent) => {
            if (isDraggingRef.current) {
                handleEnd(e);
            }
        };

        // Mouse events
        window.addEventListener('mousemove', handleGlobalMove, { passive: false });
        window.addEventListener('mouseup', handleGlobalEnd, { passive: false });

        // Touch events
        window.addEventListener('touchmove', handleGlobalMove, { passive: false });
        window.addEventListener('touchend', handleGlobalEnd, { passive: false });
        window.addEventListener('touchcancel', handleGlobalEnd, { passive: false });

        return () => {
            window.removeEventListener('mousemove', handleGlobalMove);
            window.removeEventListener('mouseup', handleGlobalEnd);
            window.removeEventListener('touchmove', handleGlobalMove);
            window.removeEventListener('touchend', handleGlobalEnd);
            window.removeEventListener('touchcancel', handleGlobalEnd);
        };
    }, [handleMove, handleEnd]);

    // Keyboard support
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (disabled) return;

        let newValue = value;
        const bigStep = step * 10;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
                newValue = Math.min(max, value + step);
                break;
            case 'ArrowLeft':
            case 'ArrowDown':
                newValue = Math.max(min, value - step);
                break;
            case 'PageUp':
                newValue = Math.min(max, value + bigStep);
                break;
            case 'PageDown':
                newValue = Math.max(min, value - bigStep);
                break;
            case 'Home':
                newValue = min;
                break;
            case 'End':
                newValue = max;
                break;
            default:
                return;
        }

        e.preventDefault();
        haptic.selection();
        onChange?.(newValue);
    }, [disabled, value, min, max, step, onChange]);

    return (
        <div
            className={`fq-slider ${disabled ? 'fq-slider--disabled' : ''} ${className}`}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={handleKeyDown}
            style={{ touchAction: 'none' }}
        >
            {/* Track */}
            <div
                ref={trackRef}
                className={`fq-slider__track ${trackClassName}`}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                style={{ touchAction: 'none' }}
            >
                {/* Filled portion */}
                <div
                    className="fq-slider__fill"
                    style={{
                        width: `${progress}%`,
                        transition: isDragging ? 'none' : 'width 0.15s ease-out',
                        ...(accentColor && {
                            background: `linear-gradient(90deg, ${accentColor}, ${accentColor})`,
                            boxShadow: `0 0 12px ${accentColor}40`
                        })
                    }}
                />

                {/* Thumb */}
                <div
                    className={`fq-slider__thumb ${isDragging ? 'fq-slider__thumb--active' : ''} ${thumbClassName}`}
                    style={{
                        left: `${progress}%`,
                        transform: `translateZ(0) scale(${isDragging ? 1.15 : 1})`,
                        transition: isDragging ? 'transform 0.1s ease-out' : 'left 0.15s ease-out, transform 0.15s ease-out',
                        ...(accentColor && {
                            background: accentColor,
                            boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px ${accentColor}33`
                        })
                    }}
                >
                    {/* Glow effect when dragging */}
                    {isDragging && (
                        <motion.div
                            className="fq-slider__thumb-glow"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        />
                    )}
                </div>
            </div>

            {/* Optional value display */}
            {showValue && (
                <motion.span
                    className="fq-slider__value"
                    key={value}
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={SPRING.snappy}
                >
                    {formatValue(value)}
                </motion.span>
            )}
        </div>
    );
};

export default Slider;
