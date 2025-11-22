import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Flame,
    ArrowUpRight,
    Zap,
    Clock,
    CheckCircle2,
    XCircle,
    LayoutList,
    Archive,
    Plus,
    BarChart3,
    Gamepad2,
    Wallet,
    User,
    Home
} from 'lucide-react';

// --- Constants & Mock Data ---
const RECENT_IMPACT = [
    { id: 1, label: 'Uber Eats', val: 15.00, time: '2h ago' },
    { id: 2, label: 'Spotify', val: 9.00, time: '1d ago' },
    { id: 3, label: 'Apple TV', val: 12.00, time: '3d ago' },
];

const MOCK_BADGES = [
    { id: 1, icon: '🥈', achievedAt: '2023-10-01' },
    { id: 2, icon: '🥇', achievedAt: '2023-10-15' },
    { id: 3, icon: '💎', achievedAt: null },
    { id: 4, icon: '👑', achievedAt: null },
];

const MOCK_STATS = {
    streakDays: 12,
    level: 5,
    currentXp: 750,
    nextLevelXp: 1000,
    yearlySavings: 264.5,
    currency: '€'
};

const MOCK_QUESTS = [
    {
        id: 'q1',
        title: 'CANCEL NETFLIX',
        description: "You haven't watched in 28 days...",
        xpReward: 500,
        monetaryValue: 15.99,
        iconType: 'NETFLIX',
        status: 'ACTIVE'
    }
];

// --- Components ---

const Header = ({ stats }) => {
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
                        <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Avatar" className="w-full h-full object-cover opacity-90 grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>
            </div>
        </header>
    );
};

const Scoreboard = ({ stats, onStartQuest, isLoading }) => {
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
                        +{stats.currency}{stats.yearlySavings}
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

const QuestCartridge = ({ quest, onComplete }) => {
    const isNetflix = quest.iconType === "NETFLIX";

    return (
        <div className="w-full mb-6 group animate-slide-up relative z-10">
            {/* Physical Cartridge Top Ridge */}
            <div className="w-[94%] mx-auto h-2.5 bg-[#1a1a1a] rounded-t-xl border-x border-t border-[#333]"></div>

            {/* Main Body */}
            <div className="relative bg-gradient-to-b from-[#111] to-[#050505] border border-[#222] rounded-3xl p-5 shadow-xl overflow-hidden">

                {/* Background Mesh for Texture */}
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

                <div className="flex gap-5 items-center relative z-10">
                    {/* 3D Icon Container */}
                    <div className={`
                    w-20 h-20 flex-shrink-0 rounded-2xl flex items-center justify-center
                    bg-gradient-to-br from-[#222] to-black border border-[#333] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]
                    transform transition-transform group-hover:scale-105 duration-300 relative overflow-hidden
                `}>
                        {/* Shine */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50"></div>

                        {/* Faux 3D Object */}
                        {isNetflix ? (
                            <div className="text-4xl font-black text-[#E50914] drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] rotate-[-12deg] transform group-hover:rotate-0 transition-transform duration-300">N</div>
                        ) : (
                            <div className="text-4xl grayscale contrast-150 drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">📦</div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="font-mono text-[10px] font-bold text-[#E5FF00] border border-[#E5FF00]/30 px-2 py-0.5 rounded bg-[#E5FF00]/10 tracking-wider">
                                XP +{quest.xpReward}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> 24H LEFT
                            </span>
                        </div>
                        <h3 className="font-space font-bold text-xl text-white leading-none tracking-tight truncate mb-1">
                            {quest.title}
                        </h3>
                        <p className="font-mono text-xs text-gray-400 truncate tracking-tight">
                            {quest.description}
                        </p>

                        {/* Progress Bar styled as 'Loading' */}
                        <div className="mt-4 w-full h-3 bg-[#1a1a1a] rounded-sm border border-[#333] relative overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-white w-1/3 stripes animate-[slide_2s_linear_infinite]"></div>
                        </div>
                    </div>
                </div>

                {/* Action Overlay */}
                <div className="mt-5 flex gap-3">
                    <button
                        onClick={() => onComplete(quest.id)}
                        className="flex-1 bg-white text-black font-bold font-space py-3 rounded-xl hover:bg-[#E5FF00] transition-all flex items-center justify-center gap-2 shadow-[0_5px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_5px_20px_rgba(229,255,0,0.3)] active:scale-95"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        COMPLETE
                    </button>
                    <button className="w-14 flex items-center justify-center rounded-xl border border-[#333] bg-[#111] text-gray-500 hover:text-red-500 hover:border-red-500/50 transition-colors">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const BentoStats = ({ badges }) => {
    return (
        <div className="px-6 py-4 grid grid-cols-2 gap-4">

            {/* Badges Collection - Chrome Style */}
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#151515] to-black border border-white/10 rounded-3xl p-5 relative overflow-hidden shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-space font-bold text-white text-lg tracking-tight">BADGES</h3>
                    <span className="font-mono text-xs text-gray-500">4/12</span>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {badges.map(badge => (
                        <div key={badge.id} className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full p-[1px] shadow-lg relative group cursor-pointer">
                            <div className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-white border-[2px] border-gray-300 ${badge.achievedAt ? '' : 'grayscale opacity-40'}`}>
                                <span className="text-xl transform group-hover:scale-110 transition-transform duration-200 drop-shadow-md">{badge.icon}</span>
                            </div>
                            {/* Tooltipish */}
                            {badge.achievedAt && (
                                <div className="absolute -bottom-1 right-0 w-3.5 h-3.5 bg-[#E5FF00] rounded-full border-2 border-black shadow-[0_0_10px_#E5FF00]"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Impact Ledger - Receipt Style */}
            <div className="col-span-2 md:col-span-1 bg-white text-black rounded-3xl p-5 font-mono text-xs relative shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                {/* Rip Paper Effect Top */}
                <div className="absolute top-0 left-0 w-full h-3 bg-[#050505]" style={{ clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)" }}></div>

                <div className="flex justify-between items-end mb-3 mt-1 border-b-2 border-black pb-2">
                    <h3 className="font-bold text-lg tracking-tighter">IMPACT_LOG</h3>
                    <span>#0049</span>
                </div>

                <div className="space-y-2.5">
                    {RECENT_IMPACT.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div>
                                <span className="block font-bold uppercase">{item.label}</span>
                                <span className="text-gray-500">{item.time}</span>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold bg-black text-[#E5FF00] px-1">+{item.val.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-2 border-t border-dashed border-gray-400 text-center text-[10px] text-gray-500 uppercase">
                    Total Efficiency: 94%
                </div>
            </div>
        </div>
    );
};

const QuestsView = ({
    activeQuests,
    completedQuests,
    onComplete,
    onStartQuest,
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
                                <QuestCartridge
                                    key={quest.id}
                                    quest={quest}
                                    onComplete={onComplete}
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
                            completedQuests.map(quest => (
                                <div key={quest.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 text-xs">
                                            ✓
                                        </div>
                                        <div>
                                            <h4 className="font-space font-bold text-white line-through decoration-[#E5FF00]">{quest.title}</h4>
                                            <span className="font-mono text-[10px] text-[#E5FF00]">+{quest.monetaryValue.toFixed(2)} SAVED</span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-[10px] text-gray-600">COMPLETED</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const NavButton = ({ icon, active }) => (
    <button className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 relative ${active ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110' : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'}`}>
        {icon}
        {active && <div className="absolute -bottom-2 w-1 h-1 bg-[#E5FF00] rounded-full shadow-[0_0_5px_#E5FF00]" />}
    </button>
);

// --- Main Dashboard Component ---

const DashboardConcept = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeQuests, setActiveQuests] = useState(MOCK_QUESTS);
    const [completedQuests, setCompletedQuests] = useState([]);

    const handleStartQuest = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            // Mock adding a quest
            const newQuest = {
                id: `q${Date.now()}`,
                title: 'SKIP STARBUCKS',
                description: "Make coffee at home today",
                xpReward: 200,
                monetaryValue: 5.50,
                iconType: 'COFFEE',
                status: 'ACTIVE'
            };
            setActiveQuests([newQuest, ...activeQuests]);
        }, 1500);
    };

    const handleCompleteQuest = (id) => {
        const quest = activeQuests.find(q => q.id === id);
        if (quest) {
            setActiveQuests(activeQuests.filter(q => q.id !== id));
            setCompletedQuests([quest, ...completedQuests]);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-space selection:bg-[#E5FF00] selection:text-black overflow-hidden relative">
            {/* Font Import */}
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          .font-space { font-family: 'Space Grotesk', sans-serif; }
          .stripes {
            background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
            background-size: 1rem 1rem;
          }
          @keyframes slide {
            0% { background-position: 0 0; }
            100% { background-position: 2rem 2rem; }
          }
        `}
            </style>

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] pointer-events-none" />

            <div className="max-w-md mx-auto min-h-screen flex flex-col relative z-10 font-space pb-24">
                <Header stats={MOCK_STATS} />

                <Scoreboard
                    stats={MOCK_STATS}
                    onStartQuest={handleStartQuest}
                    isLoading={isLoading}
                />

                <div className="px-6 mb-4 flex justify-between items-end mt-4">
                    <h3 className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">Urgent Missions</h3>
                    <button className="text-[10px] font-bold text-[#E5FF00] tracking-widest uppercase hover:underline">View All</button>
                </div>

                {activeQuests.length > 0 && (
                    <div className="px-6">
                        <QuestCartridge
                            quest={activeQuests[0]}
                            onComplete={handleCompleteQuest}
                        />
                    </div>
                )}

                <BentoStats badges={MOCK_BADGES} />

                <QuestsView
                    activeQuests={activeQuests}
                    completedQuests={completedQuests}
                    onComplete={handleCompleteQuest}
                    onStartQuest={handleStartQuest}
                    isLoading={isLoading}
                />

            </div>

            {/* Navigation */}
            <div className="fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto">
                <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-[#222] rounded-3xl p-2 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                    <NavButton icon={<Home />} active={true} />
                    <NavButton icon={<Gamepad2 />} active={false} />
                    <NavButton icon={<BarChart3 />} active={false} />
                    <NavButton icon={<User />} active={false} />
                </div>
            </div>
        </div>
    );
};

export default DashboardConcept;
