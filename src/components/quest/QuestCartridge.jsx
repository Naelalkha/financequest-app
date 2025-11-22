import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const QuestCartridge = ({ quest, onComplete, onDelete }) => {
    // Map category to iconType for display
    const getIconType = (category) => {
        const iconMap = {
            'budgeting': 'WALLET',
            'saving': 'PIGGY',
            'credit': 'CARD',
            'investing': 'CHART',
            'taxes': 'DOCUMENT',
            'protect': 'SHIELD'
        };
        return iconMap[category] || 'MONEY';
    };

    const iconType = getIconType(quest.category);

    // Map difficulty to display format
    const getDifficultyLabel = (difficulty) => {
        const difficultyMap = {
            'beginner': 'EASY',
            'intermediate': 'MED',
            'advanced': 'HARD'
        };
        return difficultyMap[difficulty] || 'MED';
    };

    const difficultyLabel = getDifficultyLabel(quest.difficulty);

    // Difficulty Colors
    const difficultyColor =
        difficultyLabel === 'EASY' ? 'text-emerald bg-emerald/10 border-emerald/30' :
            difficultyLabel === 'MED' ? 'text-amber-400 bg-amber-400/10 border-amber-400/30' :
                'text-red-400 bg-red-400/10 border-red-400/30';

    // Calculate monetary value (annual impact if available)
    const monetaryValue = quest.estimatedAnnual || quest.estimatedImpact || 0;

    // Icon rendering based on type
    const renderIcon = () => {
        const iconClass = "text-4xl drop-shadow-[2px_4px_0px_rgba(0,0,0,0.8)]";

        switch (iconType) {
            case 'NETFLIX':
                return <div className="text-4xl font-black text-red-600 drop-shadow-[2px_4px_0px_rgba(0,0,0,0.8)] rotate-[-10deg]">N</div>;
            case 'COFFEE':
                return <div className={iconClass}>☕</div>;
            case 'WALLET':
                return <div className={iconClass}>👛</div>;
            case 'PIGGY':
                return <div className={iconClass}>🐷</div>;
            case 'CARD':
                return <div className={iconClass}>💳</div>;
            case 'CHART':
                return <div className={iconClass}>📈</div>;
            case 'DOCUMENT':
                return <div className={iconClass}>📄</div>;
            case 'SHIELD':
                return <div className={iconClass}>🛡️</div>;
            default:
                return <div className="text-4xl grayscale contrast-150 drop-shadow-[2px_4px_0px_rgba(0,0,0,0.8)]">💰</div>;
        }
    };

    return (
        <div className="w-full mb-4 group animate-slide-up">
            {/* Physical Cartridge Top Ridge */}
            <div className="w-[90%] mx-auto h-2 bg-neutral-800 rounded-t-lg border-x border-t border-neutral-700"></div>

            {/* Main Body */}
            <div className="relative bg-[#0A0A0A] border border-neutral-800 rounded-2xl p-5 shadow-2xl overflow-hidden">

                {/* Background Mesh for Texture */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#666_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                <div className="flex gap-5 items-center relative z-10">
                    {/* 3D Icon Container */}
                    <div className={`
                    w-20 h-20 flex-shrink-0 rounded-2xl flex items-center justify-center
                    bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 shadow-inner
                    transform transition-transform group-hover:scale-105 duration-300
                `}>
                        {renderIcon()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${difficultyColor}`}>
                                {difficultyLabel}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-gold bg-gold/10 border border-gold/30 px-2 py-0.5 rounded">
                                +{quest.xp} XP
                            </span>
                        </div>

                        <h3 className="font-sans font-bold text-xl text-white leading-tight truncate mb-1">
                            {quest.title}
                        </h3>

                        {/* Monetary Value Tag */}
                        {monetaryValue > 0 && (
                            <div className="inline-flex items-center gap-1 bg-emerald/10 border border-emerald/20 rounded-lg px-2 py-0.5 mb-2">
                                <span className="font-mono text-xs font-bold text-emerald">
                                    +€{monetaryValue.toFixed(2)}
                                </span>
                            </div>
                        )}

                        {/* Progress Bar styled as 'Loading' */}
                        <div className="w-full h-2 bg-neutral-900 rounded-sm border border-neutral-800 relative overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold/40 via-gold-light/40 to-white/30 stripes w-1/3"></div>
                        </div>
                    </div>
                </div>

                {/* Action Overlay */}
                <div className="mt-5 flex gap-2 relative z-10">
                    <button
                        onClick={() => onComplete(quest.id)}
                        className="flex-1 bg-white text-black font-bold font-sans py-3 rounded-xl hover:bg-gold hover:text-black transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        COMPLETE
                    </button>

                    {/* Delete button ONLY renders if onDelete prop is passed (Mission Log View) */}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(quest.id)}
                            className="w-14 flex items-center justify-center rounded-xl border border-neutral-700 hover:border-red-500 text-neutral-500 hover:text-red-500 transition-colors active:scale-95"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestCartridge;
