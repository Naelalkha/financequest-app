import { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { haptic } from '../../utils/haptics';
import { SPRING } from '../../styles/animationConstants';
import './Slider.css';

/**
 * Premium Slider Component - Mobile Optimized
 * 
 * Features:
 * - Native touch events for reliable mobile tracking
 * - Haptic feedback on value changes
 * - GPU-accelerated transforms (no spring during drag)
 * - Accessible (keyboard support)
 * - Snap to steps with haptic ticks
 * 
 * Usage:
 *   <Slider 
 *     value={amount} 
 *     onChange={setAmount}
 *     min={0}
 *     max={50}
 *     step={0.5}
 *   />
 */
const Slider = ({
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
}) => {
    const trackRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const lastHapticValue = useRef(value);
    const isDraggingRef = useRef(false); // Ref for event handlers

    // Calculate progress from value (0-100%)
    const valueToProgress = useCallback((val) => {
        return ((val - min) / (max - min)) * 100;
    }, [min, max]);

    // Calculate value from progress
    const progressToValue = useCallback((prog) => {
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
    const triggerHaptic = useCallback((newValue) => {
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
    const getClientX = useCallback((e) => {
        if (e.touches && e.touches.length > 0) {
            return e.touches[0].clientX;
        }
        if (e.changedTouches && e.changedTouches.length > 0) {
            return e.changedTouches[0].clientX;
        }
        return e.clientX;
    }, []);

    // Handle drag - updates value directly without animation
    const handleDrag = useCallback((clientX) => {
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
    const handleStart = useCallback((e) => {
        if (disabled) return;
        
        // Prevent default to stop scrolling
        e.preventDefault();
        e.stopPropagation();
        
        isDraggingRef.current = true;
        setIsDragging(true);
        
        // Initial haptic
        haptic.light();
        
        // Handle initial position
        handleDrag(getClientX(e));
    }, [disabled, handleDrag, getClientX]);

    // Touch/Mouse move handler
    const handleMove = useCallback((e) => {
        if (!isDraggingRef.current || disabled) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        handleDrag(getClientX(e));
    }, [disabled, handleDrag, getClientX]);

    // Touch/Mouse end handler
    const handleEnd = useCallback((e) => {
        if (!isDraggingRef.current) return;
        
        e.preventDefault();
        
        isDraggingRef.current = false;
        setIsDragging(false);
        haptic.medium();
    }, []);

    // Setup and cleanup global event listeners for drag tracking
    useEffect(() => {
        const handleGlobalMove = (e) => {
            if (isDraggingRef.current) {
                handleMove(e);
            }
        };

        const handleGlobalEnd = (e) => {
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
    const handleKeyDown = useCallback((e) => {
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
                {/* Filled portion - direct style update, no animation during drag */}
                <div 
                    className="fq-slider__fill"
                    style={{ 
                        width: `${progress}%`,
                        transition: isDragging ? 'none' : 'width 0.15s ease-out'
                    }}
                />

                {/* Thumb - direct position update */}
                <div 
                    className={`fq-slider__thumb ${isDragging ? 'fq-slider__thumb--active' : ''} ${thumbClassName}`}
                    style={{ 
                        left: `${progress}%`,
                        transform: `translateZ(0) scale(${isDragging ? 1.15 : 1})`,
                        transition: isDragging ? 'transform 0.1s ease-out' : 'left 0.15s ease-out, transform 0.15s ease-out'
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
