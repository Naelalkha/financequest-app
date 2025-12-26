/**
 * 💡 SpotlightOverlay
 * Overlay sombre avec "trou" spotlight sur la carte Impact + bouton mission
 * Affiché sur le dashboard lors de la première visite après onboarding
 * 
 * Features:
 * - Overlay 95% opacité couvrant tout
 * - Zone spotlight animée autour de la carte Impact et bouton CTA
 * - Tooltip animé avec message d'accueil
 * - Pulse effect sur le bouton
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target } from 'lucide-react';
import { haptic } from '../../../utils/haptics';

const SpotlightOverlay = ({
    isVisible,
    onDismiss,
    targetRef,      // Container ref (Impact card + button area)
    buttonRef,      // Button ref (for pulse effect positioning)
    onSpotlightClick
}) => {
    const [spotlightPosition, setSpotlightPosition] = useState(null);
    const [buttonPosition, setButtonPosition] = useState(null);
    const tooltipRef = useRef(null);

    // Calculate spotlight position based on BUTTON element (not container)
    useEffect(() => {
        if (!isVisible) return;

        // Wait a bit for refs to be ready after initial render
        const initialDelay = setTimeout(() => {
            if (!buttonRef?.current) {
                console.warn('🎯 SpotlightOverlay: buttonRef not ready');
                return;
            }

            const updatePosition = () => {
                if (!buttonRef?.current) return;

                // Use BUTTON ref for spotlight position (not container)
                const btnRect = buttonRef.current.getBoundingClientRect();
                
                // Calculate center position of button
                const centerX = btnRect.left + btnRect.width / 2;
                const centerY = btnRect.top + btnRect.height / 2;

                // Spotlight on button with tight padding
                setSpotlightPosition({
                    x: centerX,
                    y: centerY,
                    width: btnRect.width + 24,
                    height: btnRect.height + 16,
                });

                // Button position for tooltip (centered)
                setButtonPosition({
                    x: centerX,
                    y: centerY,
                    width: btnRect.width,
                    height: btnRect.height,
                });
            };

            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition);

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition);
            };
        }, 100);

        return () => clearTimeout(initialDelay);
    }, [isVisible, buttonRef]);

    const handleSpotlightClick = () => {
        haptic.heavy();
        onSpotlightClick?.();
        onDismiss();
    };

    const handleOverlayClick = (e) => {
        // Only dismiss if clicking outside spotlight
        if (e.target === e.currentTarget) {
            haptic.light();
            onDismiss();
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[100]"
                onClick={handleOverlayClick}
            >
                {/* Dark overlay with spotlight hole */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    style={{ pointerEvents: 'none' }}
                >
                    <defs>
                        <mask id="spotlight-mask">
                            <rect width="100%" height="100%" fill="white" />
                            {spotlightPosition && (
                                <rect
                                    x={spotlightPosition.x - spotlightPosition.width / 2}
                                    y={spotlightPosition.y - spotlightPosition.height / 2}
                                    width={spotlightPosition.width}
                                    height={spotlightPosition.height}
                                    rx="16"
                                    fill="black"
                                />
                            )}
                        </mask>

                        {/* Glow filter for spotlight edge */}
                        <filter id="spotlight-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="15" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Dark background with hole */}
                    <rect
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.96)"
                        mask="url(#spotlight-mask)"
                    />

                    {/* Spotlight rounded ring glow */}
                    {spotlightPosition && (
                        <motion.rect
                            x={spotlightPosition.x - spotlightPosition.width / 2}
                            y={spotlightPosition.y - spotlightPosition.height / 2}
                            width={spotlightPosition.width}
                            height={spotlightPosition.height}
                            rx="16"
                            fill="none"
                            stroke="#E2FF00"
                            strokeWidth="2"
                            opacity="0.6"
                            filter="url(#spotlight-glow)"
                            style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                            animate={{
                                scale: [1, 1.05, 1],
                                opacity: [0.6, 0.3, 0.6],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    )}
                </svg>

                {/* Clickable spotlight zone */}
                {spotlightPosition && (
                    <motion.button
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        onClick={handleSpotlightClick}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-2xl"
                        style={{
                            left: spotlightPosition.x,
                            top: spotlightPosition.y,
                            width: spotlightPosition.width,
                            height: spotlightPosition.height,
                        }}
                    />
                )}

                {/* Tooltip - positioned above the button */}
                {buttonPosition && (
                    <div
                        className="absolute"
                        style={{
                            left: `${buttonPosition.x}px`,
                            top: `${buttonPosition.y - buttonPosition.height / 2 - 135}px`,
                            transform: 'translateX(-50%)',
                            width: '320px',
                            maxWidth: 'calc(100vw - 32px)',
                        }}
                    >
                        <motion.div
                            ref={tooltipRef}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="bg-[#1A1A1A] border border-volt/30 rounded-2xl p-4 shadow-2xl relative"
                        >
                            {/* Arrow pointing down */}
                            <div
                                className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-4 h-4 bg-[#1A1A1A] border-b border-r border-volt/30 rotate-45"
                            />

                            <div className="flex items-start gap-3 text-left">
                                <div className="w-8 h-8 rounded-lg bg-volt/20 flex items-center justify-center flex-shrink-0">
                                    <Target className="w-4 h-4 text-volt" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-sm leading-tight">
                                        🎯 Ta première mission t'attend
                                    </p>
                                    <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                                        Clique ici pour découvrir une mission personnalisée selon tes besoins.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Close hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-neutral-500 text-xs"
                >
                    Appuie n'importe où pour fermer
                </motion.p>
            </motion.div>
        </AnimatePresence>
    );
};

export default SpotlightOverlay;
