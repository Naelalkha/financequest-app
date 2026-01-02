import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// RollingCounter component for animated numbers
const RollingCounter = ({ value, currency }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        // Start from current displayed value, not from 0
        const start = displayValue;
        const end = value;

        // If no change, don't animate
        if (Math.abs(end - start) < 0.01) {
            return;
        }

        const duration = 1500; // ms
        const incrementTime = 20; // ms
        const totalSteps = duration / incrementTime;
        const incrementValue = (end - start) / totalSteps;

        let currentValue = start;
        const timer = setInterval(() => {
            currentValue += incrementValue;

            // Check if we've reached the end
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
};

const DashboardScoreboard = ({ impactAnnual, currency = '€', onStartQuest, buttonRef, containerRef }) => {
    const { t } = useTranslation('dashboard');

    return (
        <section ref={containerRef} className="px-6 pt-4 pb-12 relative z-20">
            {/* The Score Card - COMPACT & CLEAN */}
            <div
                className="relative w-full bg-[#0A0A0A] backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 pt-8 pb-8 flex flex-col items-start justify-center overflow-hidden active:scale-[0.98] transition-transform"
            >

                {/* Background Texture */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

                {/* Content Container - No useless meta, just raw data */}
                <div className="relative z-10 w-full flex flex-col gap-2">

                    {/* Label */}
                    <div className="flex items-center gap-2 text-neutral-500 mb-0">
                        <span className="font-mono text-xs tracking-[0.15em] uppercase font-bold text-neutral-600">{t('netImpactYTD')}</span>
                        {/* Removed: +12% badge & ID */}
                    </div>

                    {/* Massive Value */}
                    <h1 className="text-6xl md:text-7xl text-volt font-mono font-bold tracking-tighter leading-none text-glow-volt -ml-1">
                        <span className="text-volt/50 mr-1">+</span>
                        <RollingCounter value={impactAnnual || 0} currency={currency} />
                    </h1>

                    {/* Subtitle */}
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
                >
                    <Zap className="w-5 h-5 fill-current" />
                    {t('startQuest')}

                    {/* Sheen Effect */}
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent transform skew-x-12 animate-[shimmer_3s_infinite]" />
                </button>
            </div>
        </section>
    );
};

export default DashboardScoreboard;

