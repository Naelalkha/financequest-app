import React, { useEffect, useState, memo, RefObject, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Zap, Target, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RollingCounterProps {
    value: number;
    currency: string;
}

// RollingCounter component for animated numbers
const RollingCounter = memo(({ value, currency }: RollingCounterProps) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        const start = displayValue;
        const end = value;

        if (Math.abs(end - start) < 0.01) {
            return;
        }

        const duration = 1500;
        const incrementTime = 20;
        const totalSteps = duration / incrementTime;
        const incrementValue = (end - start) / totalSteps;

        let currentValue = start;
        const timer = setInterval(() => {
            currentValue += incrementValue;

            if ((incrementValue > 0 && currentValue >= end) ||
                (incrementValue < 0 && currentValue <= end)) {
                setDisplayValue(end);
                clearInterval(timer);
            } else {
                setDisplayValue(currentValue);
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <span className="font-mono">
            {currency}{displayValue.toFixed(0)}
        </span>
    );
});

RollingCounter.displayName = 'RollingCounter';

interface DashboardScoreboardProps {
    impactAnnual: number;
    currency?: string;
    onStartQuest: () => void;
    buttonRef?: RefObject<HTMLButtonElement | null>;
    containerRef?: RefObject<HTMLDivElement | null>;
    showSpotlight?: boolean;
    onSpotlightDismiss?: () => void;
    onSpotlightClick?: () => void;
}

const DashboardScoreboard = memo(({
    impactAnnual,
    currency = '€',
    onStartQuest,
    buttonRef,
    containerRef,
    showSpotlight = false,
    onSpotlightDismiss,
    onSpotlightClick
}: DashboardScoreboardProps) => {
    const { t } = useTranslation('dashboard');
    const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

    // Lock scroll and position when spotlight is shown
    useEffect(() => {
        if (!showSpotlight) return;

        // Scroll to top and lock scroll
        const scrollContainer = document.getElementById('app-scroll-container');
        if (scrollContainer) {
            scrollContainer.scrollTop = 0;
            scrollContainer.style.overflow = 'hidden';
        }
        document.body.style.overflow = 'hidden';

        return () => {
            if (scrollContainer) {
                scrollContainer.style.overflow = '';
            }
            document.body.style.overflow = '';
        };
    }, [showSpotlight]);

    // Get button position for the portal overlay
    useLayoutEffect(() => {
        if (!showSpotlight || !buttonRef?.current) return;

        const updatePosition = () => {
            if (!buttonRef?.current) return;
            const rect = buttonRef.current.getBoundingClientRect();
            setButtonPosition({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            });
        };

        // Initial calculation with a small delay to ensure layout is complete
        const initialTimeout = setTimeout(updatePosition, 50);

        // Also recalculate after a longer delay in case layout shifts
        const secondTimeout = setTimeout(updatePosition, 150);

        window.addEventListener('resize', updatePosition);

        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(secondTimeout);
            window.removeEventListener('resize', updatePosition);
        };
    }, [showSpotlight, buttonRef]);

    const handleSpotlightClick = () => {
        onSpotlightClick?.();
    };

    const handleOverlayClick = () => {
        onSpotlightDismiss?.();
    };

    return (
        <>
            {/* Spotlight overlay - everything rendered via portal */}
            {showSpotlight && createPortal(
                <div className="fixed inset-0" style={{ zIndex: 99999 }}>
                    {/* Dark overlay */}
                    <motion.div
                        className="absolute inset-0 bg-black/90"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleOverlayClick}
                    />

                    {/* Tooltip container - positioned above the button, centered */}
                    <motion.div
                        className="absolute inset-x-0 flex flex-col items-center pointer-events-none"
                        style={{
                            top: 0,
                            height: buttonPosition.top - 24,
                            justifyContent: 'flex-end',
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Tooltip Card */}
                        <div className="bg-[#111] border border-white/10 rounded-xl p-4 w-[280px] shadow-[0_0_30px_rgba(226,255,0,0.15)] relative overflow-hidden">
                            {/* Scan effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent translate-y-[-100%] animate-[scan_3s_infinite]" />

                            {/* Header */}
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#E2FF00] rounded-full animate-pulse" />
                                    <span className="text-[10px] font-mono text-[#E2FF00] tracking-widest uppercase">
                                        {t('systemDetection')}
                                    </span>
                                </div>
                                <Target className="w-3 h-3 text-neutral-500" />
                            </div>

                            {/* Content */}
                            <h4 className="text-white font-[800] text-sm mb-1 leading-tight relative z-10">
                                {t('opportunityUnlocked')}
                            </h4>
                            <p className="text-neutral-400 text-xs leading-relaxed relative z-10">
                                {t('spotlight')}
                            </p>

                            {/* Footer */}
                            <div className="mt-3 pt-3 border-t border-dashed border-white/10 flex items-center justify-between text-[#E2FF00] relative z-10">
                                <span className="text-[10px] font-mono uppercase tracking-wider">
                                    {t('firstMission', 'Première Mission')}
                                </span>
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        </div>

                        {/* Connection line */}
                        <div className="w-[1px] h-6 bg-gradient-to-b from-[#E2FF00]/60 to-[#E2FF00]/30 mt-2" />

                        {/* Connection dot - positioned to touch the highlight border */}
                        <div className="w-2 h-2 bg-[#E2FF00] rounded-full shadow-[0_0_10px_#E2FF00] mb-[-12px]" />
                    </motion.div>

                    {/* Button container - positioned exactly where the real button is */}
                    <div
                        className="absolute"
                        style={{
                            top: buttonPosition.top,
                            left: buttonPosition.left,
                            width: buttonPosition.width,
                            height: buttonPosition.height,
                        }}
                    >
                        {/* Subtle pulse ring that expands outward */}
                        <motion.div
                            className="absolute -inset-4 rounded-2xl pointer-events-none"
                            style={{ border: '1.5px solid rgba(226, 255, 0, 0.4)' }}
                            animate={{
                                scale: [1, 1.08],
                                opacity: [0.4, 0]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                        />

                        {/* Inner border with soft glow */}
                        <motion.div
                            className="absolute -inset-3 rounded-xl pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                border: '2px solid rgba(226, 255, 0, 0.6)',
                                boxShadow: '0 0 15px rgba(226, 255, 0, 0.2), 0 0 30px rgba(226, 255, 0, 0.1)',
                            }}
                        />

                        {/* Breathing glow - subtle */}
                        <motion.div
                            className="absolute -inset-3 rounded-xl pointer-events-none"
                            animate={{
                                boxShadow: [
                                    '0 0 15px rgba(226, 255, 0, 0.15)',
                                    '0 0 25px rgba(226, 255, 0, 0.25)',
                                    '0 0 15px rgba(226, 255, 0, 0.15)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        {/* Duplicated button in portal */}
                        <button
                            onClick={handleSpotlightClick}
                            className="w-full h-full bg-volt text-black font-sans font-bold text-lg rounded-xl shadow-volt-glow-strong flex items-center justify-center gap-2 border-[3px] border-black relative overflow-hidden active:scale-95 transition-transform duration-75"
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            {t('startQuest')}
                            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent transform skew-x-12 animate-[shimmer_3s_infinite]" />
                        </button>
                    </div>

                    {/* Dismiss hint */}
                    <motion.div
                        className="absolute bottom-10 left-0 right-0 text-center pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <p className="text-[10px] text-neutral-300 font-mono uppercase tracking-[0.2em]">
                            {t('dismissHint')}
                        </p>
                    </motion.div>
                </div>,
                document.body
            )}

            <section ref={containerRef} className="px-6 pt-4 pb-12 relative z-20">
                {/* The Score Card */}
                <div className="relative w-full bg-[#0A0A0A] backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 pt-8 pb-8 flex flex-col items-start justify-center overflow-hidden active:scale-[0.98] transition-transform">
                    {/* Background Texture */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

                    {/* Content */}
                    <div className="relative z-10 w-full flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-neutral-500 mb-0">
                            <span className="font-mono text-xs tracking-[0.15em] uppercase font-bold text-neutral-600">{t('netImpactYTD')}</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl text-volt font-mono font-bold tracking-tighter leading-none text-glow-volt -ml-1">
                            <span className="text-volt/50 mr-1">+</span>
                            <RollingCounter value={impactAnnual || 0} currency={currency} />
                        </h1>

                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-px w-8 bg-neutral-800"></div>
                            <span className="font-mono text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                                {t('perYearSaved')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main CTA - Floating Button */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-full max-w-[70%] z-30">
                    <button
                        ref={buttonRef}
                        onClick={onStartQuest}
                        className="w-full bg-volt text-black font-sans font-bold text-lg py-4 rounded-xl shadow-volt-glow-strong flex items-center justify-center gap-2 border-[3px] border-black relative overflow-hidden active:scale-95 transition-transform duration-75"
                        style={showSpotlight ? { visibility: 'hidden' } : undefined}
                    >
                        <Zap className="w-5 h-5 fill-current" />
                        {t('startQuest')}

                        {/* Sheen Effect */}
                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent transform skew-x-12 animate-[shimmer_3s_infinite]" />
                    </button>
                </div>
            </section>
        </>
    );
});

DashboardScoreboard.displayName = 'DashboardScoreboard';

export default DashboardScoreboard;
