/**
 * Animation Constants
 * Centralized animation values for consistent motion across the app
 * Used with Framer Motion
 * 
 * Performance optimized:
 * - Spring animations for natural feel (GPU-accelerated)
 * - transform/opacity only (no layout thrashing)
 * - Reduced motion support
 */

// Easing curves (for tween animations)
export const EASE = {
    // Smooth exit - accelerates out
    outExpo: [0.16, 1, 0.3, 1] as const,
    // Smooth entry - decelerates in  
    inExpo: [0.32, 0, 0.67, 0] as const,
    // Standard ease out
    out: [0.4, 0, 0.2, 1] as const,
    // Standard ease in
    in: [0.4, 0, 1, 1] as const,
    // Bounce back effect
    backOut: [0.34, 1.56, 0.64, 1] as const,
    // Premium smooth (Apple-like)
    premium: [0.25, 0.1, 0.25, 1] as const,
} as const;

// Standard durations (in seconds)
export const DURATION = {
    instant: 0.1,
    fast: 0.2,
    normal: 0.25,
    medium: 0.3,
    slow: 0.35,
    slower: 0.5,
} as const;

/**
 * Spring configurations for Framer Motion
 * These create more natural, physics-based animations
 * 
 * Usage:
 *   transition={{ ...SPRING.snappy }}
 *   transition={{ type: 'spring', ...SPRING.bouncy }}
 */
export const SPRING = {
    // Quick and responsive - for buttons, toggles
    snappy: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 30,
        mass: 1,
    },
    // Smooth and elegant - for modals, cards
    smooth: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
        mass: 1,
    },
    // Bouncy - for celebrations, success states
    bouncy: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 15,
        mass: 1,
    },
    // Gentle - for subtle movements
    gentle: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 25,
        mass: 1,
    },
    // Slider - optimized for continuous dragging
    slider: {
        type: 'spring' as const,
        stiffness: 500,
        damping: 35,
        mass: 0.5,
    },
    // Number counter - for animating values
    counter: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
        mass: 1,
    },
} as const;

// Common animation variants for modals/overlays
export const modalVariants = {
    backdrop: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    },
    card: {
        hidden: { scale: 0.96, opacity: 0 },
        visible: { scale: 1, opacity: 1 },
        exit: { scale: 0.96, opacity: 0 }
    }
};

// Common animation variants for fullscreen flows
export const fullscreenVariants = {
    enter: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },
    content: {
        initial: { scale: 0.96 },
        animate: { scale: 1 },
        exit: { scale: 0.96 }
    }
};

/**
 * Screen transition variants for quest phases
 * Optimized for perceived performance
 */
export const screenVariants = {
    // Slide from right (forward navigation)
    slideForward: {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 }
    },
    // Slide from left (back navigation)
    slideBack: {
        initial: { opacity: 0, x: -30 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 30 }
    },
    // Fade + scale (for modals/overlays)
    fadeScale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
    },
    // Fade only (minimal)
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },
};

// Common transitions
export const TRANSITIONS = {
    // For modal/card entry
    modalEntry: {
        duration: DURATION.medium,
        ease: EASE.outExpo
    },
    // For modal/card exit
    modalExit: {
        duration: DURATION.fast,
        ease: 'easeIn' as const
    },
    // For fullscreen overlay entry
    overlayEntry: {
        duration: DURATION.normal,
        ease: 'easeOut' as const
    },
    // For content fade
    fade: {
        duration: DURATION.normal
    },
    // For quick micro-interactions
    quick: {
        duration: DURATION.fast
    },
    // For screen transitions (use with screenVariants)
    screen: {
        duration: DURATION.normal,
        ease: EASE.outExpo
    },
    // Spring-based screen transition
    screenSpring: SPRING.smooth,
} as const;

// Stagger configuration for lists
export const STAGGER = {
    fast: 0.02,
    normal: 0.05,
    slow: 0.1
};

/**
 * Whilte interaction states for buttons/cards
 * Usage: <motion.button {...INTERACTIONS.button}>
 */
export const INTERACTIONS = {
    button: {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.97 },
        transition: SPRING.snappy,
    },
    card: {
        whileHover: { scale: 1.01, y: -2 },
        whileTap: { scale: 0.99 },
        transition: SPRING.smooth,
    },
    icon: {
        whileHover: { scale: 1.1, rotate: 5 },
        whileTap: { scale: 0.9 },
        transition: SPRING.bouncy,
    },
};

/**
 * Check if user prefers reduced motion
 * Use to conditionally disable animations
 */
export const prefersReducedMotion = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
