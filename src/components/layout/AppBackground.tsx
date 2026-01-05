import React, { memo, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useBackground } from '../../contexts/BackgroundContext';

/**
 * Props du composant AppBackground
 */
export interface AppBackgroundProps {
    children?: React.ReactNode;
    className?: string;
    /** Background variant (kept for legacy compatibility) */
    variant?: 'default' | 'finance' | 'quest';
    /** Enable grain effect */
    grain?: boolean;
    /** Enable grid pattern */
    grid?: boolean;
    /** Enable animations */
    animate?: boolean;
}

/**
 * AppBackground - Composant de fond "Atmospheric Guilloche"
 * Style: High-Tech Security / Premium Finance
 */
const AppBackground = memo<AppBackgroundProps>(({
    children,
    className = ''
}) => {
    const { mode, config } = useBackground();
    const reduceMotion = useReducedMotion();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div
                className={`fixed inset-0 ${className}`}
                style={{ backgroundColor: '#050505' }}
            >
                {children}
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 overflow-hidden ${className}`}>
            {/* Background with Atmospheric Guilloche Pattern (Macro Mode Only) */}
            <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{
                    opacity: mode === 'macro' ? 1 : 0,
                    scale: mode === 'macro' ? 1 : 1.1
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{
                    backgroundColor: '#050505',
                    filter: config?.blur ? `blur(${config.blurAmount || 4}px)` : 'none',
                    backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(26, 33, 0, 0.03) 0%, transparent 70%),
            repeating-radial-gradient(circle at 0 0, transparent 0, transparent 29px, rgba(255, 255, 255, ${config?.patternOpacity || 0.07}) 29px, rgba(255, 255, 255, ${config?.patternOpacity || 0.07}) 30px),
            repeating-radial-gradient(circle at 100% 0, transparent 0, transparent 29px, rgba(255, 255, 255, ${config?.patternOpacity || 0.07}) 29px, rgba(255, 255, 255, ${config?.patternOpacity || 0.07}) 30px)
          `,
                    backgroundAttachment: 'fixed',
                    backgroundSize: '100% 100%, 100% 100%, 100% 100%'
                }}
            />

            {/* Micro Mode Background (Deep Void + Vignette) */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={false}
                animate={{ opacity: mode === 'micro' ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                style={{
                    background: 'radial-gradient(circle at 50% 30%, #111111 0%, #050505 60%, #000000 100%)',
                    zIndex: 1
                }}
            />

            {/* Crosshair / dust texture for Micro Mode */}
            {mode === 'micro' && (
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zzM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        zIndex: 1
                    }}
                />
            )}

            {/* Global Vignette Effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: mode === 'micro'
                        ? 'radial-gradient(circle at 50% 50%, transparent 40%, #000000 100%)'
                        : 'radial-gradient(circle at 50% 40%, transparent 20%, #050505 120%)',
                    zIndex: 2,
                    transition: 'background 0.8s ease'
                }}
            />

            {/* Application content */}
            <div id="app-scroll-container" className="relative z-10 w-full h-full overflow-auto safe-area-top">
                {children}
            </div>
        </div>
    );
});

AppBackground.displayName = 'AppBackground';

export default AppBackground;
