import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronRight, Zap } from 'lucide-react';
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

const DashboardScoreboard = ({ impactAnnual, currency = '€', onStartQuest, isLoading, userId = "884-XJ" }) => {
    const { t } = useTranslation('dashboard');
    const progressPercentage = 65;

    return (
        <section className="px-6 pt-4 pb-12 relative z-20 animate-slide-up">
            {/* The Score Card */}
            <div
                className="relative w-full aspect-[4/3] md:aspect-[21/9] bg-[#0A0A0A] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 flex flex-col justify-between overflow-hidden active:scale-[0.98] transition-transform"
            >

                {/* Background Texture */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

                {/* Top Meta */}
                <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-neutral-400">
                            <span className="font-mono text-[10px] tracking-[0.2em] uppercase">{t('netImpactYTD')}</span>
                            <ChevronRight className="w-3 h-3 text-neutral-600" />
                        </div>
                        {/* VOLT accent */}
                        <div className="flex items-center gap-2 text-volt font-mono text-xs bg-volt/10 px-2 py-0.5 rounded border border-volt/20 w-fit">
                            <ArrowUpRight className="w-3 h-3" />
                            <span className="font-bold">+12%</span>
                        </div>
                    </div>
                    <div className="font-mono text-[9px] text-neutral-600 border border-neutral-800 px-2 py-1 rounded bg-black/50">
                        ID: {userId}
                    </div>
                </div>

                {/* Massive Value Ticker - ELECTRIC VOLT */}
                <div className="mt-4 relative z-10">
                    <h1 className="text-6xl md:text-7xl lg:text-8xl text-volt font-mono font-bold tracking-tighter leading-none text-glow-volt">
                        <span className="text-volt/50 mr-1">+</span>
                        <RollingCounter value={impactAnnual || 0} currency={currency} />
                    </h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="font-sans text-sm text-neutral-400 font-medium uppercase tracking-wider">
                            {t('perYearSaved')}
                        </span>
                    </div>
                </div>

                {/* Bottom Progress Bar - Volt gradient */}
                <div className="w-full h-1.5 bg-neutral-900/80 rounded-full mt-auto overflow-hidden relative z-10 border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-volt via-white to-volt shadow-[0_0_20px_rgba(226,255,0,0.5)]"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Main CTA - Floating Pill - VOLT */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-full max-w-[70%] z-30">
                <button
                    onClick={onStartQuest}
                    disabled={isLoading}
                    className="w-full bg-volt text-black font-sans font-bold text-lg py-3.5 rounded-full shadow-volt-glow-strong hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 border-[3px] border-black relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="font-mono text-xs animate-pulse">{t('generating')}</span>
                    ) : (
                        <>
                            <Zap className="w-5 h-5 fill-current" />
                            {t('startQuest')}
                        </>
                    )}

                    {/* Sheen Effect */}
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent transform skew-x-12 animate-[shimmer_3s_infinite]" />
                </button>
            </div>
        </section>
    );
};

export default DashboardScoreboard;

