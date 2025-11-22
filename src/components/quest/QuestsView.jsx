import React, { useState } from "react";
import QuestCartridge from "./QuestCartridge";
import { Archive, LayoutList, Plus } from "lucide-react";

const QuestsView = ({
    activeQuests,
    completedQuests,
    onComplete,
    onStartQuest,
    isLoading,
    onDelete
}) => {
    const [tab, setTab] = useState("ACTIVE");

    return (
        <div className="pt-4 px-6 pb-24 animate-slide-up">

            {/* Page Header */}
            <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
                <div>
                    <h1 className="font-sans font-bold text-4xl md:text-5xl text-white tracking-tight leading-none">
                        MISSION<br /><span className="text-neutral-600">LOG_01</span>
                    </h1>
                </div>
                <div className="text-right hidden md:block">
                    <span className="font-mono text-xs text-gold block">SYSTEM STATUS</span>
                    <span className="font-mono text-xs text-white">ONLINE</span>
                </div>
            </div>

            {/* Tabs / Filter */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setTab("ACTIVE")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-bold transition-all border ${tab === "ACTIVE"
                            ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            : "bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-600"
                        }`}
                >
                    <LayoutList className="w-3 h-3" />
                    ACTIVE ({activeQuests.length})
                </button>
                <button
                    onClick={() => setTab("ARCHIVE")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-bold transition-all border ${tab === "ARCHIVE"
                            ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            : "bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-600"
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
                            className="w-full h-16 border border-dashed border-neutral-700 rounded-2xl flex items-center justify-center gap-3 text-neutral-500 hover:text-gold hover:border-gold hover:bg-gold/5 transition-all group mb-6"
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
                                <LayoutList className="w-12 h-12 mx-auto mb-3 text-neutral-700" />
                                <p className="font-mono text-xs text-neutral-500">NO ACTIVE MISSIONS</p>
                            </div>
                        ) : (
                            activeQuests.map(quest => (
                                <QuestCartridge
                                    key={quest.id}
                                    quest={quest}
                                    onComplete={onComplete}
                                    onDelete={onDelete}
                                />
                            ))
                        )}
                    </>
                ) : (
                    /* ARCHIVE TAB */
                    <div className="space-y-3">
                        {completedQuests.length === 0 ? (
                            <div className="text-center py-12 opacity-50">
                                <Archive className="w-12 h-12 mx-auto mb-3 text-neutral-700" />
                                <p className="font-mono text-xs text-neutral-500">ARCHIVE EMPTY</p>
                            </div>
                        ) : (
                            completedQuests.map(quest => (
                                <div key={quest.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 text-xs">
                                            ✓
                                        </div>
                                        <div>
                                            <h4 className="font-sans font-bold text-white line-through decoration-gold">{quest.title}</h4>
                                            <span className="font-mono text-[10px] text-emerald">+{(quest.estimatedAnnual || quest.estimatedImpact || 0).toFixed(2)} SAVED</span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-[10px] text-neutral-600">COMPLETED</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestsView;
