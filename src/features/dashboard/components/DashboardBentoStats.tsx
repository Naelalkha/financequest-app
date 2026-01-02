import React from 'react';
import { useTranslation } from 'react-i18next';

// Import 3D Trophies
import trophyNoviceStar from '../../../assets/trophee-novice-star.png';
import trophyFirstSave from '../../../assets/trophee-first-save.png';
import trophyEarlyStreak from '../../../assets/trophee-streak.png';
import lootChestIcon from '../../../assets/loot-level.png';

/** Badge data */
interface Badge {
    id: string;
    achievedAt?: Date | string | null;
    name?: string;
}

/** Level data for progress display */
interface LevelData {
    level?: number;
    progress?: number;
    xpNeededForNext?: number;
}

/** DashboardBentoStats props */
interface DashboardBentoStatsProps {
    badges?: Badge[];
    recentImpact?: unknown[];
    levelData?: LevelData;
}

const DashboardBentoStats: React.FC<DashboardBentoStatsProps> = React.memo(({
    badges = [],
    recentImpact = [],
    levelData = {}
}) => {
    const { t } = useTranslation('dashboard');
    const achievedCount = badges.filter(b => b.achievedAt).length;

    // Calculate progress for the bar
    const progressPercent = levelData.progress || 0;
    const xpRemaining = levelData.xpNeededForNext || 0;
    const nextLevel = (levelData.level || 0) + 1;

    return (
        <div className="px-6 pb-8 grid grid-cols-2 gap-4">

            {/* Badges Collection - BLACK-ON-BLACK PREMIUM CARD */}
            <div className="col-span-2 md:col-span-1 bg-black border border-white/10 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden shadow-2xl group min-h-[160px]">

                {/* 3D Trophies Display */}
                <div className="flex justify-between items-end relative z-10 px-1 w-full">

                    {/* Trophy 1: Novice Star */}
                    <div className="flex flex-col items-center gap-3 group/trophy cursor-pointer">
                        <div className="relative w-16 h-16 flex items-center justify-center bg-black">
                            <img
                                src={trophyNoviceStar}
                                alt="Novice Star"
                                className="w-full h-full object-contain drop-shadow-2xl transform group-hover/trophy:scale-110 transition-transform duration-300 relative z-10"
                            />
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider group-hover/trophy:text-white transition-colors relative z-10">{t('bento.badge_novice')}</span>
                    </div>

                    {/* Trophy 2: First Save */}
                    <div className="flex flex-col items-center gap-3 group/trophy cursor-pointer">
                        <div className="relative w-16 h-16 flex items-center justify-center bg-black">
                            <img
                                src={trophyFirstSave}
                                alt="First Save"
                                className="w-full h-full object-contain drop-shadow-2xl transform group-hover/trophy:scale-110 transition-transform duration-300 delay-75 relative z-10"
                            />
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider group-hover/trophy:text-white transition-colors relative z-10">{t('bento.badge_first_save')}</span>
                    </div>

                    {/* Trophy 3: Early Streak */}
                    <div className="flex flex-col items-center gap-3 group/trophy cursor-pointer">
                        <div className="relative w-16 h-16 flex items-center justify-center bg-black">
                            <img
                                src={trophyEarlyStreak}
                                alt="Early Streak"
                                className="w-full h-full object-contain drop-shadow-2xl transform group-hover/trophy:scale-110 transition-transform duration-300 delay-150 relative z-10"
                            />
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider group-hover/trophy:text-white transition-colors relative z-10">{t('bento.badge_streak')}</span>
                    </div>
                </div>

                {/* Gradient Overlay on the Entire Block */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#E5FF00]/5 to-transparent opacity-50 pointer-events-none rounded-3xl z-20"></div>
            </div>

            {/* Level Progress Section - PREMIUM VOLT GLOW STYLE (MATCHING RANK CARD) */}
            <div className="col-span-2 md:col-span-1 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-1 relative overflow-hidden shadow-2xl h-full min-h-[160px]">

                {/* Inner Content Container */}
                <div className="bg-black border border-white/10 rounded-[20px] p-6 relative z-10 flex flex-col justify-between h-full">

                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                            <h2 className="font-sans font-black text-2xl text-white italic tracking-tighter">{t('bento.level_label')} {levelData.level || 1}</h2>
                            <p className="font-mono text-xs text-[#E5FF00] mt-1 font-semibold">{t('bento.level_title')}</p>
                        </div>
                        {/* 3D Loot Chest Icon */}
                        <img src={lootChestIcon} alt="Loot Chest" className="w-12 h-12 object-contain m-2" />
                    </div>

                    <div className="relative z-10 mt-auto">
                        <div className="flex justify-between text-[10px] font-mono font-bold text-neutral-400 mb-2">
                            <span>{xpRemaining} XP {t('bento.before_level')} {nextLevel}</span>
                            <span className="text-white">{Math.round(progressPercent)}%</span>
                        </div>

                        {/* High-End Progress Bar (Matched to Rank Card) */}
                        <div className="w-full h-4 bg-black rounded-full overflow-hidden border border-neutral-800 relative">
                            {/* The Bar */}
                            <div
                                className="h-full bg-gradient-to-r from-[#E5FF00] via-white to-[#E5FF00] shadow-[0_0_15px_rgba(226,255,0,0.6)] relative transition-all duration-1000"
                                style={{ width: `${progressPercent}%` }}
                            >
                                {/* Scanline effect */}
                                <div className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)] opacity-30 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#E5FF00] rounded-full animate-pulse"></div>
                            <p className="font-mono text-[9px] text-neutral-500 uppercase">
                                {t('bento.unlocksReward')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Background Glow (on outer container) */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#E5FF00]/10 to-transparent pointer-events-none" />
            </div>
        </div>
    );
});

DashboardBentoStats.displayName = 'DashboardBentoStats';

export default DashboardBentoStats;


