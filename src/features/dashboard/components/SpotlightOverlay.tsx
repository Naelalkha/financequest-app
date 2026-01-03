/**
 * SpotlightOverlay - Clean Version
 * Uses 4 overlay panels around the button hole instead of clip-path/SVG
 * This approach works reliably on iOS Safari
 */

import React, { useEffect, useState, useLayoutEffect, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Target, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { haptic } from '../../../utils/haptics';

interface SpotlightOverlayProps {
    isVisible: boolean;
    onDismiss: () => void;
    buttonRef: RefObject<HTMLButtonElement | null>;
    onSpotlightClick: () => void;
}

interface ButtonPosition {
    top: number;
    left: number;
    width: number;
    height: number;
    centerX: number;
}

const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({
    isVisible,
    onDismiss,
    buttonRef,
    onSpotlightClick
}) => {
    const { t } = useTranslation('dashboard');
    const [isExiting, setIsExiting] = useState(false);
    const [position, setPosition] = useState<ButtonPosition | null>(null);

    // Padding around the button for the spotlight hole
    const PADDING = 16;

    // Calculate button position
    useLayoutEffect(() => {
        if (!isVisible || !buttonRef.current) return;

        const calculatePosition = () => {
            if (!buttonRef.current) return;

            const rect = buttonRef.current.getBoundingClientRect();

            setPosition({
                top: rect.top - PADDING,
                left: rect.left - PADDING,
                width: rect.width + PADDING * 2,
                height: rect.height + PADDING * 2,
                centerX: rect.left + rect.width / 2
            });
        };

        // Calculate immediately
        calculatePosition();

        // Recalculate on resize
        window.addEventListener('resize', calculatePosition);
        window.addEventListener('scroll', calculatePosition, true);

        return () => {
            window.removeEventListener('resize', calculatePosition);
            window.removeEventListener('scroll', calculatePosition, true);
        };
    }, [isVisible, buttonRef]);

    // Lock body scroll
    useEffect(() => {
        if (!isVisible) return;

        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;

        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.width = '';
        };
    }, [isVisible]);

    // Reset state when visibility changes
    useEffect(() => {
        if (isVisible) {
            setIsExiting(false);
        }
    }, [isVisible]);

    const handleDismiss = () => {
        if (isExiting) return;
        setIsExiting(true);
        haptic.light();
        setTimeout(onDismiss, 200);
    };

    const handleSpotlightClick = () => {
        if (isExiting) return;
        setIsExiting(true);
        haptic.medium();
        setTimeout(onSpotlightClick, 200);
    };

    if (!isVisible || !position) return null;

    const overlayColor = 'rgba(0, 0, 0, 0.88)';

    return createPortal(
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[1000]"
                initial={{ opacity: 0 }}
                animate={{ opacity: isExiting ? 0 : 1 }}
                transition={{ duration: 0.25 }}
            >
                {/* Top overlay */}
                <div
                    className="absolute left-0 right-0 top-0"
                    style={{
                        height: position.top,
                        backgroundColor: overlayColor
                    }}
                    onClick={handleDismiss}
                />

                {/* Bottom overlay */}
                <div
                    className="absolute left-0 right-0 bottom-0"
                    style={{
                        top: position.top + position.height,
                        backgroundColor: overlayColor
                    }}
                    onClick={handleDismiss}
                />

                {/* Left overlay */}
                <div
                    className="absolute left-0"
                    style={{
                        top: position.top,
                        width: position.left,
                        height: position.height,
                        backgroundColor: overlayColor
                    }}
                    onClick={handleDismiss}
                />

                {/* Right overlay */}
                <div
                    className="absolute right-0"
                    style={{
                        top: position.top,
                        left: position.left + position.width,
                        height: position.height,
                        backgroundColor: overlayColor
                    }}
                    onClick={handleDismiss}
                />

                {/* Glow border around the hole */}
                <motion.div
                    className="absolute pointer-events-none rounded-2xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    style={{
                        top: position.top,
                        left: position.left,
                        width: position.width,
                        height: position.height,
                        border: '2px solid #E2FF00',
                        boxShadow: '0 0 20px rgba(226, 255, 0, 0.4), 0 0 40px rgba(226, 255, 0, 0.2), inset 0 0 20px rgba(226, 255, 0, 0.1)',
                    }}
                />

                {/* Pulsing outer glow */}
                <motion.div
                    className="absolute pointer-events-none rounded-2xl"
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        top: position.top - 4,
                        left: position.left - 4,
                        width: position.width + 8,
                        height: position.height + 8,
                        border: '2px solid #E2FF00',
                    }}
                />

                {/* Clickable area over the button */}
                <div
                    className="absolute cursor-pointer rounded-2xl"
                    onClick={handleSpotlightClick}
                    style={{
                        top: position.top,
                        left: position.left,
                        width: position.width,
                        height: position.height,
                    }}
                />

                {/* Tooltip - positioned above the spotlight hole */}
                <motion.div
                    className="absolute z-[1001] pointer-events-none flex flex-col items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isExiting ? 0 : 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    style={{
                        left: position.centerX,
                        top: position.top,
                        transform: 'translate(-50%, -100%)',
                        paddingBottom: '12px',
                    }}
                >
                    {/* Tooltip Card */}
                    <div className="bg-[#111] border border-white/10 rounded-xl p-4 w-[280px] shadow-[0_0_30px_rgba(226,255,0,0.15)] relative overflow-hidden mb-2">
                        {/* Scan effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent translate-y-[-100%] animate-[scan_3s_infinite]" />

                        {/* Header */}
                        <div className="flex justify-between items-start mb-2 relative">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-[#E2FF00] rounded-full animate-pulse" />
                                <span className="text-[10px] font-mono text-[#E2FF00] tracking-widest uppercase">
                                    {t('systemDetection')}
                                </span>
                            </div>
                            <Target className="w-3 h-3 text-neutral-500" />
                        </div>

                        {/* Content */}
                        <h4 className="text-white font-[800] text-sm mb-1 leading-tight relative">
                            {t('opportunityUnlocked')}
                        </h4>
                        <p className="text-neutral-400 text-xs leading-relaxed relative">
                            {t('spotlight')}
                        </p>

                        {/* Footer */}
                        <div className="mt-3 pt-3 border-t border-dashed border-white/10 flex items-center justify-between text-[#E2FF00] relative">
                            <span className="text-[10px] font-mono uppercase tracking-wider">
                                {t('firstMission', 'Première Mission')}
                            </span>
                            <ChevronRight className="w-3 h-3" />
                        </div>
                    </div>

                    {/* Connection line */}
                    <div className="w-[1px] h-3 bg-gradient-to-b from-[#E2FF00]/50 to-transparent" />

                    {/* Connection dot */}
                    <div className="w-1.5 h-1.5 bg-[#E2FF00] rounded-full shadow-[0_0_10px_#E2FF00]" />
                </motion.div>

                {/* Dismiss hint at bottom */}
                <motion.div
                    className="absolute bottom-8 left-0 right-0 text-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isExiting ? 0 : 0.8 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <p className="text-[10px] text-neutral-300 font-mono uppercase tracking-[0.2em]">
                        {t('dismissHint')}
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default SpotlightOverlay;
