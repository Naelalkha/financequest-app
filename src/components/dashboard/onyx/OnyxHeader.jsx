import React from 'react';
import { Flame } from 'lucide-react';

const OnyxHeader = ({ stats, userAvatar }) => {
    return (
        <header className="flex items-center justify-between px-6 py-6 sticky top-0 z-40 mix-blend-difference">
            {/* Brand / Menu Trigger */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#E5FF00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(229,255,0,0.4)] rotate-3 hover:rotate-12 transition-transform duration-300">
                    <div className="w-3.5 h-3.5 bg-[#050505] rounded-sm transform rotate-45"></div>
                </div>
                <span className="font-space font-black text-xl tracking-tighter text-white">MONIYO</span>
            </div>

            {/* HUD Controls */}
            <div className="flex items-center gap-3">
                {/* Streak Widget */}
                <div className="flex items-center gap-2 bg-[#111] border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg">
                    <Flame className="w-3.5 h-3.5 text-[#E5FF00] fill-[#E5FF00] drop-shadow-[0_0_8px_rgba(229,255,0,0.8)]" />
                    <span className="font-mono text-[10px] font-bold text-white tracking-wider">{stats.streakDays} DAY STREAK</span>
                </div>

                {/* Level Ring */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                    {/* Chrome Ring SVG */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-gray-800"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        />
                        <path
                            className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                            strokeDasharray={`${(stats.currentXp / stats.nextLevelXp) * 100}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="font-mono text-[8px] font-black text-[#E5FF00] absolute -bottom-4 tracking-widest">LVL {stats.level}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center overflow-hidden border-2 border-white/20">
                        <img src={userAvatar || "https://ui-avatars.com/api/?name=User&background=random"} alt="Avatar" className="w-full h-full object-cover opacity-90 grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default OnyxHeader;
