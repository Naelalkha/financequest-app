/**
 * Haptics Utility
 *
 * Unified haptic feedback system for Moniyo
 * Uses Capacitor Haptics for native iOS/Android, falls back to Vibration API on web
 *
 * Usage:
 *   import { haptic } from '../utils/haptics';
 *   haptic.light();  // Light tap
 *   haptic.medium(); // Medium impact
 *   haptic.success(); // Success pattern
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

// Check if we're running in Capacitor native environment
const isCapacitorNative = () => {
    return Capacitor.isNativePlatform();
};

// Check if vibration is supported on web
const canVibrate = () => {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Haptic feedback patterns
 * Uses native Capacitor Haptics on iOS/Android, Vibration API on web
 */
export const haptic = {
    /**
     * Light impact - for subtle feedback
     * Use for: slider ticks, hover states, minor selections
     */
    light: () => {
        if (isCapacitorNative()) {
            Haptics.impact({ style: ImpactStyle.Light });
            return;
        }
        if (canVibrate()) {
            navigator.vibrate(8);
        }
    },

    /**
     * Medium impact - for confirmations
     * Use for: button taps, card selections, toggles
     */
    medium: () => {
        if (isCapacitorNative()) {
            Haptics.impact({ style: ImpactStyle.Medium });
            return;
        }
        if (canVibrate()) {
            navigator.vibrate(15);
        }
    },

    /**
     * Heavy impact - for important actions
     * Use for: phase transitions, major confirmations
     */
    heavy: () => {
        if (isCapacitorNative()) {
            Haptics.impact({ style: ImpactStyle.Heavy });
            return;
        }
        if (canVibrate()) {
            navigator.vibrate(25);
        }
    },

    /**
     * Selection changed - for picker/slider changes
     * Use for: slider value changes, stepper increments
     */
    selection: () => {
        if (isCapacitorNative()) {
            Haptics.selectionChanged();
            return;
        }
        if (canVibrate()) {
            navigator.vibrate(5);
        }
    },

    /**
     * Success pattern - celebratory feedback
     * Use for: quest completion, achievements, level up
     */
    success: () => {
        if (isCapacitorNative()) {
            Haptics.notification({ type: NotificationType.Success });
            return;
        }
        if (canVibrate()) {
            navigator.vibrate([10, 50, 10, 50, 15]);
        }
    },

    /**
     * Warning pattern - attention needed
     * Use for: validation errors, warnings
     */
    warning: () => {
        if (isCapacitorNative()) {
            Haptics.notification({ type: NotificationType.Warning });
            return;
        }
        if (canVibrate()) {
            navigator.vibrate([30, 40, 30]);
        }
    },

    /**
     * Error pattern - something went wrong
     * Use for: errors, failed actions
     */
    error: () => {
        if (isCapacitorNative()) {
            Haptics.notification({ type: NotificationType.Error });
            return;
        }
        if (canVibrate()) {
            navigator.vibrate([50, 30, 50, 30, 50]);
        }
    },

    /**
     * Slider tick - for continuous slider feedback
     * Debounced to avoid excessive vibration
     * Use for: range sliders, amount pickers
     */
    tick: (() => {
        let lastTick = 0;
        const TICK_INTERVAL = 50; // ms between ticks

        return () => {
            const now = Date.now();
            if (now - lastTick < TICK_INTERVAL) return;
            lastTick = now;

            if (isCapacitorNative()) {
                Haptics.selectionChanged();
                return;
            }
            if (canVibrate()) {
                navigator.vibrate(3);
            }
        };
    })(),

    /**
     * Custom pattern - for special cases (web only)
     * @param {number|number[]} pattern - Duration in ms or array of [vibrate, pause, vibrate, ...]
     */
    custom: (pattern: number | number[]) => {
        if (isCapacitorNative()) {
            // Native doesn't support custom patterns, use medium impact
            Haptics.impact({ style: ImpactStyle.Medium });
            return;
        }
        if (canVibrate()) {
            navigator.vibrate(pattern);
        }
    }
};

/**
 * Hook for haptic feedback with user preference support
 * Can be extended to respect user's "reduce motion" preferences
 */
export const useHaptics = () => {
    // Could add user preference check here
    // const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    return haptic;
};

export default haptic;
