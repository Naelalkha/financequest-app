import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

const OnyxQuestCartridge = ({ quest, onComplete, onNavigate }) => {
    const isNetflix = quest.iconType === "NETFLIX" || quest.title?.toLowerCase().includes('netflix');
    const isSpotify = quest.title?.toLowerCase().includes('spotify');

    // Determine icon based on quest content if not explicit
    let IconDisplay = (
        <div className="text-4xl grayscale contrast-150 drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">📦</div>
    );

    if (isNetflix) {
        IconDisplay = <div className="text-4xl font-black text-[#E50914] drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] rotate-[-12deg] transform group-hover:rotate-0 transition-transform duration-300">N</div>;
    } else if (isSpotify) {
        IconDisplay = <div className="text-4xl font-black text-[#1DB954] drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] rotate-[-12deg] transform group-hover:rotate-0 transition-transform duration-300">S</div>;
    }

    return (
        <div
            className="w-full mb-6 group animate-slide-up relative z-10 cursor-pointer"
            onClick={() => onNavigate && onNavigate(quest.id)}
        >
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
                        {IconDisplay}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="font-mono text-[10px] font-bold text-[#E5FF00] border border-[#E5FF00]/30 px-2 py-0.5 rounded bg-[#E5FF00]/10 tracking-wider">
                                XP +{quest.xp || quest.xpReward || 0}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {quest.duration || 24}H LEFT
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
                        onClick={(e) => {
                            e.stopPropagation();
                            onComplete && onComplete(quest.id);
                        }}
                        className="flex-1 bg-white text-black font-bold font-space py-3 rounded-xl hover:bg-[#E5FF00] transition-all flex items-center justify-center gap-2 shadow-[0_5px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_5px_20px_rgba(229,255,0,0.3)] active:scale-95"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        COMPLETE
                    </button>
                    <button
                        className="w-14 flex items-center justify-center rounded-xl border border-[#333] bg-[#111] text-gray-500 hover:text-red-500 hover:border-red-500/50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnyxQuestCartridge;
