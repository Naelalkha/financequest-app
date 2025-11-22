import React from 'react';

const OnyxBentoStats = ({ badges = [], recentImpact = [] }) => {
    return (
        <div className="px-6 py-4 grid grid-cols-2 gap-4">

            {/* Badges Collection - Chrome Style */}
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#151515] to-black border border-white/10 rounded-3xl p-5 relative overflow-hidden shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-space font-bold text-white text-lg tracking-tight">BADGES</h3>
                    <span className="font-mono text-xs text-gray-500">{badges.filter(b => b.achievedAt).length}/{badges.length}</span>
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
                    {recentImpact.length > 0 ? recentImpact.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div>
                                <span className="block font-bold uppercase">{item.label}</span>
                                <span className="text-gray-500">{item.time}</span>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold bg-black text-[#E5FF00] px-1">+{item.val}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-400 py-4">No recent impact</div>
                    )}
                </div>

                <div className="mt-4 pt-2 border-t border-dashed border-gray-400 text-center text-[10px] text-gray-500 uppercase">
                    Total Efficiency: 94%
                </div>
            </div>
        </div>
    );
};

export default OnyxBentoStats;
