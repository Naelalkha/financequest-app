/**
 * AnimatedPage - Wrapper component for smooth page transitions
 *
 * Provides consistent fade/slide animations for all pages
 * when navigating between routes
 */

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { DURATION, EASE, STAGGER } from '../../styles/animationConstants';

interface AnimatedPageProps {
    children: ReactNode;
    className?: string;
    /** Animation variant to use */
    variant?: 'fade' | 'slideUp' | 'slideIn' | 'scale';
    /** Delay before animation starts */
    delay?: number;
}

// Page transition variants
const pageVariants = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 }
    },
    slideIn: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -10 }
    },
    scale: {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 }
    }
};

/**
 * AnimatedPage - Use this wrapper for main page components
 * to get smooth enter/exit animations
 */
export const AnimatedPage: React.FC<AnimatedPageProps> = ({
    children,
    className = '',
    variant = 'fade',
    delay = 0
}) => {
    const variants = pageVariants[variant];

    return (
        <motion.div
            className={className}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{
                duration: DURATION.medium,
                ease: EASE.outExpo,
                delay
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Staggered children container
 * Animates children with a stagger effect
 */
interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    /** Stagger delay between children */
    staggerDelay?: number;
    /** Initial delay before first child animates */
    initialDelay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
    children,
    className = '',
    staggerDelay = STAGGER.normal,
    initialDelay = 0
}) => {
    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        delayChildren: initialDelay,
                        staggerChildren: staggerDelay
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Staggered child item
 * Use inside StaggerContainer for individual animated items
 */
interface StaggerItemProps {
    children: ReactNode;
    className?: string;
    /** Animation variant */
    variant?: 'fadeUp' | 'fadeIn' | 'scaleIn';
}

const itemVariants = {
    fadeUp: {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    },
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    },
    scaleIn: {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    }
};

export const StaggerItem: React.FC<StaggerItemProps> = ({
    children,
    className = '',
    variant = 'fadeUp'
}) => {
    return (
        <motion.div
            className={className}
            variants={itemVariants[variant]}
            transition={{
                duration: DURATION.normal,
                ease: EASE.outExpo
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * Content reveal animation
 * For smooth content appearance after loading
 */
interface ContentRevealProps {
    children: ReactNode;
    className?: string;
    isVisible: boolean;
    delay?: number;
}

export const ContentReveal: React.FC<ContentRevealProps> = ({
    children,
    className = '',
    isVisible,
    delay = 0
}) => {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{
                duration: DURATION.medium,
                ease: EASE.outExpo,
                delay
            }}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedPage;
