import React from 'react';
import { Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const DashboardBentoStats = ({ badges = [], recentImpact = [] }) => {
    const { t } = useLanguage();
    const achievedCount = badges.filter(b => b.achievedAt).length;

    return (
        <div className="px-6 py-8 grid grid-cols-2 gap-4">

            {/* Badges Collection - POLISHED CHROME/SILVER */}
            <div className="col-span-2 md:col-span-1 bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-5 relative overflow-hidden shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-sans font-bold text-white text-lg">{t('dashboard.bento.badges')}</h3>
                    <span className="font-mono text-xs text-neutral-500 border border-neutral-800 px-2 py-0.5 rounded">{achievedCount}/{badges.length}</span>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {badges.length === 0 ? (
                        <div className="w-full text-center py-4">
                            <p className="text-neutral-600 text-xs font-mono">{t('dashboard.no_badges')}</p>
                        </div>
                    ) : (
                        badges.map(badge => {
                            const isUnlocked = !!badge.achievedAt;
                            const rarity = badge.rarity || (badge.name?.includes('Legend') ? 'LEGENDARY' : 'COMMON');

                            return (
                                <div key={badge.id} className="flex-shrink-0 w-16 h-16 bg-neutral-900 rounded-2xl p-[1px] relative group cursor-pointer border border-neutral-800">
                                    {/* Chrome/Silver gradient base */}
                                    <div className={`
                                        w-full h-full rounded-2xl flex items-center justify-center bg-gradient-to-br from-neutral-700 to-black
                                        ${isUnlocked
                                            ? rarity === 'LEGENDARY'
                                                ? 'border border-white/50 shadow-chrome-glow'
                                                : 'border border-neutral-500'
                                            : 'opacity-40'
                                        }
                                    `}>
                                        {isUnlocked ? (
                                            <span className="text-2xl transform group-hover:scale-110 transition-transform duration-200 drop-shadow-md grayscale hover:grayscale-0 transition-all">{badge.icon}</span>
                                        ) : (
                                            <Lock className="w-4 h-4 text-neutral-600" />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Impact Ledger - DARK MODE RECEIPT */}
            <div className="col-span-2 md:col-span-1 bg-[#111] border border-white/5 text-white rounded-3xl p-5 font-mono text-xs relative shadow-2xl overflow-hidden">
                {/* Dark Rip Paper Effect Top */}
                <div
                    className="absolute top-0 left-0 w-full h-3 bg-bg-primary z-10"
                    style={{ clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)" }}
                />

                <div className="flex justify-between items-end mb-4 mt-2 border-b border-neutral-800 pb-2">
                    <h3 className="font-bold text-lg tracking-tighter text-neutral-200">{t('dashboard.bento.impactLog')}</h3>
                    <span className="text-neutral-600">#0049</span>
                </div>

                <div className="space-y-3 relative z-10">
                    {recentImpact.length === 0 ? (
                        <div className="text-center text-neutral-400 py-4">{t('dashboard.noRecentImpact')}</div>
                    ) : (
                        recentImpact.map((item) => (
                            <div key={item.id} className="flex justify-between items-center group">
                                <div>
                                    <span className="block font-bold uppercase text-neutral-300 group-hover:text-white transition-colors">
                                        {item.label}
                                    </span>
                                    <span className="text-neutral-600 text-[10px]">{item.time}</span>
                                </div>
                                <div className="text-right">
                                    {/* Volt for values */}
                                    <span className="block font-bold text-volt">
                                        +€{typeof item.val === 'number' ? item.val.toFixed(2) : item.val}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4 pt-2 border-t border-dashed border-neutral-800 text-center text-[10px] text-neutral-600 uppercase">
                    {t('dashboard.bento.efficiency')}: 94%
                </div>
            </div>
        </div>
    );
};

export default DashboardBentoStats;

