import { useRef, useCallback, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { haptic } from '../../utils/haptics';
import { SPRING } from '../../styles/animationConstants';
import './Slider.css';

/**
 * Premium Slider Component
 * 
 * Features:
 * - Haptic feedback on value changes
 * - Smooth spring animations
 * - GPU-accelerated transforms
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

    // Motion values for smooth animations
    const progress = useMotionValue(0);
    const thumbScale = useMotionValue(1);

    // Calculate progress from value
    const valueToProgress = useCallback((val) => {
        return ((val - min) / (max - min)) * 100;
    }, [min, max]);

    // Calculate value from progress
    const progressToValue = useCallback((prog) => {
        const rawValue = (prog / 100) * (max - min) + min;
        // Snap to step
        const snappedValue = Math.round(rawValue / step) * step;
        return Math.max(min, Math.min(max, snappedValue));
    }, [min, max, step]);

    // Update progress when value changes externally
    useEffect(() => {
        const targetProgress = valueToProgress(value);
        animate(progress, targetProgress, {
            ...SPRING.slider,
            onComplete: () => {},
        });
    }, [value, valueToProgress, progress]);

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

    // Handle drag
    const handleDrag = useCallback((clientX) => {
        if (!trackRef.current || disabled) return;

        const rect = trackRef.current.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(100, 
            ((clientX - rect.left) / rect.width) * 100
        ));

        progress.set(percentage);
        const newValue = progressToValue(percentage);
        
        triggerHaptic(newValue);
        onChange?.(newValue);
    }, [disabled, progress, progressToValue, triggerHaptic, onChange]);

    // Mouse/Touch handlers
    const handlePointerDown = useCallback((e) => {
        if (disabled) return;
        
        e.preventDefault();
        setIsDragging(true);
        
        // Scale up thumb
        animate(thumbScale, 1.2, SPRING.snappy);
        
        // Initial haptic
        haptic.light();
        
        handleDrag(e.clientX);

        const handlePointerMove = (moveEvent) => {
            handleDrag(moveEvent.clientX);
        };

        const handlePointerUp = () => {
            setIsDragging(false);
            animate(thumbScale, 1, SPRING.snappy);
            haptic.medium();
            
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    }, [disabled, handleDrag, thumbScale]);

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

    // Transform progress to CSS percentage
    const progressPercent = useTransform(progress, (p) => `${p}%`);

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
        >
            {/* Track */}
            <div 
                ref={trackRef}
                className={`fq-slider__track ${trackClassName}`}
                onPointerDown={handlePointerDown}
            >
                {/* Filled portion */}
                <motion.div 
                    className="fq-slider__fill"
                    style={{ width: progressPercent }}
                />

                {/* Thumb */}
                <motion.div 
                    className={`fq-slider__thumb ${isDragging ? 'fq-slider__thumb--active' : ''} ${thumbClassName}`}
                    style={{ 
                        left: progressPercent,
                        scale: thumbScale,
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
                </motion.div>
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
