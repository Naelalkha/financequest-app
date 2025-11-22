import React, { useState, useEffect } from "react";
import { Timer, Zap, ArrowRight } from "lucide-react";

const OnyxDailyChallenge = ({ challenge, onStart, isLoading }) => {
    const [timeLeft, setTimeLeft] = useState("");

    // Countdown Logic
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const diff = endOfDay.getTime() - now.getTime();

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, []);

    if (!challenge) return null;

    return (
        <div className="px-6 mt-6 animate-slide-up delay-100">
            <div className="relative group cursor-pointer" onClick={onStart}>
                {/* Holographic Border Gradient */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5FF00] via-[#10b981] to-[#3b82f6] rounded-2xl opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>

                {/* Card Body */}
                <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 flex items-center justify-between overflow-hidden">

                    {/* Texture */}
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-[9px] font-bold animate-pulse">
                                <Timer className="w-3 h-3" />
                                EXPIRES {timeLeft}
                            </span>
                        </div>
                        <h3 className="font-sans font-bold text-xl text-white italic tracking-tight">
                            {challenge.questTitle || "NO SPEND CHALLENGE"}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="font-mono text-xs text-[#E5FF00] font-bold flex items-center gap-1">
                                <Zap className="w-3 h-3" /> +{challenge.rewards?.xp || 300} XP
                            </span>
                            <span className="font-mono text-xs text-[#10b981] font-bold">
                                +€{challenge.rewards?.savings || '25.00'} SAVED
                            </span>
                        </div>
                    </div>

                    {/* Action Icon */}
                    <div className="relative z-10 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnyxDailyChallenge;
