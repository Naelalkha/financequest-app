/**
 * Animation Constants
 * Centralized animation values for consistent motion across the app
 * Used with Framer Motion
 */

// Easing curves
export const EASE = {
    // Smooth exit - accelerates out
    outExpo: [0.16, 1, 0.3, 1],
    // Smooth entry - decelerates in  
    inExpo: [0.32, 0, 0.67, 0],
    // Standard ease out
    out: [0.4, 0, 0.2, 1],
    // Standard ease in
    in: [0.4, 0, 1, 1],
    // Bounce back effect
    backOut: [0.34, 1.56, 0.64, 1],
};

// Standard durations (in seconds)
export const DURATION = {
    instant: 0.1,
    fast: 0.2,
    normal: 0.25,
    medium: 0.3,
    slow: 0.35,
    slower: 0.5,
};

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
        ease: 'easeIn'
    },
    // For fullscreen overlay entry
    overlayEntry: {
        duration: DURATION.normal,
        ease: 'easeOut'
    },
    // For content fade
    fade: {
        duration: DURATION.normal
    },
    // For quick micro-interactions
    quick: {
        duration: DURATION.fast
    }
};

// Stagger configuration for lists
export const STAGGER = {
    fast: 0.02,
    normal: 0.05,
    slow: 0.1
};
