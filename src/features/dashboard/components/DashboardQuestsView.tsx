import React, { useState } from 'react';
import { LayoutList, Archive, Plus } from 'lucide-react';
import DashboardQuestCartridge from './DashboardQuestCartridge';
import useLocalizedQuest from '../../../hooks/useLocalizedQuest';

interface Quest {
    id: string;
    title?: string;
    xp?: number;
    xpReward?: number;
}

interface DashboardQuestsViewProps {
    activeQuests?: Quest[];
    completedQuests?: Quest[];
    onComplete?: (questId: string) => void;
    onStartQuest?: () => void;
    onNavigate?: (questId: string) => void;
    isLoading?: boolean;
}

const DashboardQuestsView: React.FC<DashboardQuestsViewProps> = ({
    activeQuests = [],
    completedQuests = [],
    onComplete,
    onStartQuest,
    onNavigate,
    isLoading
}) => {
    const [tab, setTab] = useState("ACTIVE");

    return (
        <div className="pt-2 px-6 pb-32 animate-slide-up">

            {/* Page Header */}
            <div className="flex items-end justify-between mb-6 border-b border-white/10 pb-4">
                <div>
                    <h1 className="font-space font-bold text-4xl md:text-5xl text-white tracking-tight leading-none">
                        MISSION<br /><span className="text-gray-600">LOG_01</span>
                    </h1>
                </div>
                <div className="text-right hidden md:block">
                    <span className="font-mono text-xs text-[#E5FF00] block">SYSTEM STATUS</span>
                    <span className="font-mono text-xs text-white">ONLINE</span>
                </div>
            </div>

            {/* Tabs / Filter */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setTab("ACTIVE")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[10px] font-bold transition-all border ${tab === "ACTIVE"
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        : "bg-transparent text-gray-500 border-gray-800 hover:border-gray-600"
                        }`}
                >
                    <LayoutList className="w-3 h-3" />
                    ACTIVE ({activeQuests.length})
                </button>
                <button
                    onClick={() => setTab("ARCHIVE")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[10px] font-bold transition-all border ${tab === "ARCHIVE"
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        : "bg-transparent text-gray-500 border-gray-800 hover:border-gray-600"
                        }`}
                >
                    <Archive className="w-3 h-3" />
                    ARCHIVE ({completedQuests.length})
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-4 min-h-[300px]">
                {tab === "ACTIVE" ? (
                    <>
                        {/* Add New Quest Button (Small version) */}
                        <button
                            onClick={onStartQuest}
                            disabled={isLoading}
                            className="w-full h-14 border border-dashed border-gray-700 rounded-2xl flex items-center justify-center gap-3 text-gray-500 hover:text-[#E5FF00] hover:border-[#E5FF00] hover:bg-[#E5FF00]/5 transition-all group mb-6"
                        >
                            {isLoading ? (
                                <span className="font-mono text-xs animate-pulse">SCANNING OPPORTUNITIES...</span>
                            ) : (
                                <>
                                    <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="w-3 h-3" />
                                    </div>
                                    <span className="font-mono text-xs font-bold tracking-widest">FIND NEW QUEST</span>
                                </>
                            )}
                        </button>

                        {activeQuests.length === 0 ? (
                            <div className="text-center py-12 opacity-50">
                                <LayoutList className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                                <p className="font-mono text-xs text-gray-500">NO ACTIVE MISSIONS</p>
                            </div>
                        ) : (
                            activeQuests.map(quest => (
                                <DashboardQuestCartridge
                                    key={quest.id}
                                    quest={quest}
                                    onComplete={onComplete}
                                    onNavigate={onNavigate}
                                />
                            ))
                        )}
                    </>
                ) : (
                    /* ARCHIVE TAB */
                    <div className="space-y-3">
                        {completedQuests.length === 0 ? (
                            <div className="text-center py-12 opacity-50">
                                <Archive className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                                <p className="font-mono text-xs text-gray-500">ARCHIVE EMPTY</p>
                            </div>
                        ) : (
                            completedQuests.map(quest => {
                                const CompletedQuestItem = () => {
                                    const localizedQuest = useLocalizedQuest(quest);
                                    return (
                                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
                                            <div>
                                                <h4 className="font-space font-bold text-white text-sm">{localizedQuest?.title || quest.title}</h4>
                                                <p className="font-mono text-[10px] text-gray-400">Completed</p>
                                            </div>
                                            <div className="text-[#E5FF00] font-mono text-xs font-bold">
                                                +{quest.xp || quest.xpReward} XP
                                            </div>
                                        </div>
                                    );
                                };
                                return <CompletedQuestItem key={quest.id} />;
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardQuestsView;

