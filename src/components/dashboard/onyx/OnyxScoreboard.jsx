import React from 'react';
import { ArrowUpRight, Zap } from 'lucide-react';

const OnyxScoreboard = ({ impactAnnual, currency = '€', onStartQuest, isLoading }) => {
    // Format large numbers if needed, but keep it simple for now
    const formattedImpact = typeof impactAnnual === 'number' ? impactAnnual.toFixed(0) : '0';

    return (
        <section className="px-6 pt-2 pb-10 relative z-20">
            {/* The Score Card */}
            <div className="relative w-full aspect-[4/3] md:aspect-[21/9] bg-gradient-to-b from-[#151515] to-[#0A0A0A] backdrop-blur-xl border border-white/10 rounded-[2rem] p-7 flex flex-col justify-between overflow-hidden group shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">

                {/* Animated Background Glare */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Top Meta */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-[10px] text-gray-500 tracking-[0.2em] uppercase">Net Impact (YTD)</span>
                        <div className="flex items-center gap-2 text-[#E5FF00]">
                            <ArrowUpRight className="w-4 h-4" />
                            <span className="font-mono text-xs font-bold tracking-wide">+12% vs last month</span>
                        </div>
                    </div>
                    <div className="font-mono text-[10px] text-gray-600 border border-white/5 bg-white/5 px-2 py-1 rounded-md tracking-widest">
                        ID: 884-XJ
                    </div>
                </div>

                {/* Massive Value */}
                <div className="mt-2 relative z-10">
                    <h1 className="font-space font-black text-7xl md:text-8xl text-white tracking-tighter leading-none drop-shadow-2xl">
                        +{currency}{formattedImpact}
                    </h1>
                    <span className="font-space text-lg text-gray-600 font-medium block mt-2 tracking-tight">
                        / YEAR SAVED
                    </span>
                </div>

                {/* Bottom Decoration */}
                <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full mt-auto overflow-hidden relative">
                    <div className="absolute left-0 top-0 h-full w-1/3 bg-[#E5FF00] shadow-[0_0_15px_#E5FF00]"></div>
                </div>
            </div>

            {/* Main CTA - Floating Pill */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-full max-w-[70%] z-30">
                <button
                    onClick={onStartQuest}
                    disabled={isLoading}
                    className="w-full bg-[#E5FF00] text-[#050505] font-space font-bold text-lg py-3.5 rounded-full shadow-[0_10px_30px_-5px_rgba(229,255,0,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 border-[3px] border-[#050505] hover:border-white/20 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="font-mono text-xs animate-pulse">GENERATING...</span>
                    ) : (
                        <>
                            <Zap className="w-5 h-5 fill-current" />
                            START QUEST
                        </>
                    )}

                    {/* Sheen Effect */}
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform skew-x-12 animate-[shimmer_3s_infinite]" />
                </button>
            </div>
        </section>
    );
};

export default OnyxScoreboard;
