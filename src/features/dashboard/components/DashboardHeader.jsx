import React from 'react';
import { Flame } from 'lucide-react';
import logo from '../../../assets/logo-moniyo.png';

const DashboardHeader = ({ stats, userAvatar }) => {
    return (
        <header className="flex items-center justify-between px-6 py-6">
            {/* Brand - Logo */}
            <div className="flex items-center gap-2">
                <img
                    src={logo}
                    alt="Moniyo Logo"
                    className="w-16 h-16"
                    style={{ filter: 'drop-shadow(rgba(226, 255, 0, 0.4) 0px 0px 6px)' }}
                />
                <span className="font-sans font-bold text-xl tracking-tighter text-white">MONIYO</span>
            </div>

            {/* HUD Controls */}
            <div className="flex items-center gap-6">
                {/* Streak Widget - Simplified */}
                <div className="flex items-center gap-1.5 bg-blue/10 border border-blue/30 px-2 py-1 rounded-full backdrop-blur-md">
                    <Flame className="w-4 h-4 text-blue fill-blue" />
                    <span className="font-mono text-xs font-bold text-blue">
                        {stats.streakDays}
                    </span>
                </div>

                {/* Level Ring - Volt Gradient */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                    {/* Chrome Ring SVG */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-neutral-800"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                        />
                        <defs>
                            <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="white" />
                                <stop offset="100%" stopColor="#E2FF00" />
                            </linearGradient>
                        </defs>
                        <path
                            className="drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                            strokeDasharray={`${(stats.currentXp / stats.nextLevelXp) * 100}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#levelGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center overflow-hidden border border-white/20">
                        <img src={userAvatar || "https://ui-avatars.com/api/?name=User&background=random"} alt="Avatar" className="w-full h-full object-cover opacity-80 grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;

