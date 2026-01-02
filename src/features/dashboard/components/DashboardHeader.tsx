import React from 'react';
import { Flame } from 'lucide-react';
import logo from '../../../assets/logo-moniyo.png';
import GamifiedAvatar from './GamifiedAvatar';

/** Stats displayed in the dashboard header */
interface DashboardStats {
    streakDays: number;
    level?: number;
    xpInCurrentLevel?: number;
    xpForNextLevel?: number;
}

interface DashboardHeaderProps {
    stats: DashboardStats;
    userAvatar?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = React.memo(({ stats, userAvatar }) => {
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

                {/* Gamified Avatar avec anneau de progression XP et badge de niveau */}
                <GamifiedAvatar
                    currentLevel={stats.level || 1}
                    currentXP={stats.xpInCurrentLevel || 0}
                    xpToNextLevel={stats.xpForNextLevel || 100}
                    avatarUrl={userAvatar}
                />
            </div>
        </header>
    );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;

