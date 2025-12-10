import React from "react";
import { Eye } from "lucide-react";
import { useTranslation } from 'react-i18next';
import useLocalizedQuest from '../../../hooks/useLocalizedQuest';

/**
 * QuestCartridge - Quest card with 3D cartridge design
 * Utilise les métadonnées de la quête (xp, estimatedImpact, icons, etc.)
 */
const QuestCartridge = ({ quest, onOpen, isPriority }) => {
    const { t } = useTranslation(['quests', 'common']);

    // ✅ Charger les traductions via le hook
    const localizedQuest = useLocalizedQuest(quest);

    // Récupérer les métadonnées de la quête
    const questXP = quest.xp || quest.xpReward || 0;
    const estimatedImpact = quest.estimatedImpact || {};
    const monthlyAmount = estimatedImpact.amount || quest.monetaryValue || 0;
    const impactPeriod = estimatedImpact.period || 'month';
    const questIcon = quest.icons?.main;
    const questColors = quest.colors || {};
    const questDuration = quest.duration || 0;

    // Stylistic variants based on type
    const isNetflix = quest.iconType === "NETFLIX" || quest.category === "savings";

    // Get translated difficulty
    const getDifficultyLabel = (difficulty) => {
        const diff = (difficulty || 'intermediate').toLowerCase();
        if (diff === 'easy' || diff === 'beginner') return t('difficulties.beginner');
        if (diff === 'med' || diff === 'intermediate' || diff === 'medium') return t('difficulties.intermediate');
        if (diff === 'hard' || diff === 'advanced') return t('difficulties.advanced');
        return t('difficulties.intermediate');
    };

    // Difficulty Colors - Support both old format (EASY, MED) and new format (beginner, intermediate, advanced)
    const getDifficultyColor = (difficulty) => {
        const diff = (difficulty || '').toLowerCase();
        if (diff === 'easy' || diff === 'beginner') return 'text-emerald bg-emerald/10 border-emerald/30';
        if (diff === 'med' || diff === 'intermediate' || diff === 'medium') return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
        if (diff === 'hard' || diff === 'advanced') return 'text-red-400 bg-red-400/10 border-red-400/30';
        // Fallback pour ancien format
        if (difficulty === 'EASY') return 'text-emerald bg-emerald/10 border-emerald/30';
        if (difficulty === 'MED') return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
        return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    };

    const difficultyColor = getDifficultyColor(quest.difficulty);

    // Rendre l'icône de la quête si disponible
    const renderQuestIcon = () => {
        // Si c'est une image (string URL)
        if (questIcon && typeof questIcon === 'string') {
            return <img src={questIcon} alt={localizedQuest?.title || quest.title || 'Quest icon'} className="w-full h-full object-contain" />;
        }

        // Si c'est un composant React (icône)
        if (questIcon && typeof questIcon === 'function') {
            const IconComponent = questIcon;
            return <IconComponent className="text-4xl" style={{ color: questColors.primary || '#fff' }} />;
        }

        // Fallback sur les icônes hardcodées
        if (isNetflix) {
            return <div className="text-4xl font-black text-red-600 drop-shadow-[2px_4px_0px_rgba(0,0,0,0.8)] rotate-[-10deg]">N</div>;
        } else if (quest.iconType === 'COFFEE') {
            return <div className="text-4xl drop-shadow-[2px_4px_0px_rgba(0,0,0,0.8)]">☕</div>;
        } else {
            return <div className="text-4xl grayscale contrast-150 drop-shadow-[2px_4px_0px_rgba(0,0,0,0.8)]">💰</div>;
        }
    };

    // Calculer le montant annuel si c'est mensuel
    const getImpactDisplay = () => {
        if (monthlyAmount <= 0) return null;

        if (impactPeriod === 'month') {
            const yearlyAmount = monthlyAmount * 12;
            return {
                monthly: monthlyAmount,
                yearly: yearlyAmount,
                label: `~€${monthlyAmount}/${t('ui.month', { ns: 'common' })} (≈ €${yearlyAmount}/${t('ui.year', { ns: 'common' })})`
            };
        } else if (impactPeriod === 'year') {
            return {
                yearly: monthlyAmount,
                label: `~€${monthlyAmount}/${t('ui.year', { ns: 'common' })}`
            };
        }
        return {
            amount: monthlyAmount,
            label: `~€${monthlyAmount}`
        };
    };

    const impactDisplay = getImpactDisplay();

    return (
        <div className={`w-full mb-4 group animate-slide-up ${isPriority ? 'scale-105' : ''}`}>
            {/* Physical Cartridge Top Ridge */}
            <div className="w-[90%] mx-auto h-2 bg-neutral-800 rounded-t-lg border-x border-t border-neutral-700"></div>

            {/* Main Body */}
            <div className={`relative bg-[#0A0A0A] border ${isPriority ? 'border-volt/30 shadow-[0_0_15px_rgba(226,255,0,0.1)]' : 'border-neutral-800'} rounded-2xl p-5 shadow-2xl overflow-hidden hover:border-neutral-700 transition-colors`}>

                {/* Background Mesh for Texture */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#666_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                <div className="flex gap-5 items-center relative z-10">
                    {/* Icon/Image Container - Conditionnel selon le type */}
                    {questIcon && typeof questIcon === 'string' ? (
                        // Image PNG - pas de conteneur, juste l'image flottante
                        <div className="flex-shrink-0 transform transition-transform group-hover:scale-105 duration-300">
                            <img
                                src={questIcon}
                                alt={localizedQuest?.title || quest.title || 'Quest icon'}
                                className="w-32 h-32 object-contain drop-shadow-lg"
                            />
                        </div>
                    ) : (
                        // Icône React ou emoji - avec conteneur rond
                        <div className={`
                            w-20 h-20 flex-shrink-0 rounded-2xl flex items-center justify-center
                            bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 shadow-inner
                            transform transition-transform group-hover:scale-105 duration-300
                        `}>
                            {/* Icône de la quête depuis les métadonnées */}
                            {renderQuestIcon()}
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${difficultyColor}`}>
                                {getDifficultyLabel(quest.difficulty)}
                            </span>
                            {/* Volt XP Badge - Utilise quest.xp depuis les métadonnées */}
                            {questXP > 0 && (
                                <span className="font-mono text-[10px] font-bold text-volt bg-volt/10 border border-volt/30 px-2 py-0.5 rounded">
                                    +{questXP} {t('common:xp') || 'XP'}
                                </span>
                            )}
                            {/* Durée si disponible */}
                            {questDuration > 0 && (
                                <span className="font-mono text-[10px] font-bold text-gray-400 bg-gray-400/10 border border-gray-400/30 px-2 py-0.5 rounded">
                                    {questDuration} min
                                </span>
                            )}
                        </div>

                        {/* Codename as small tech label */}
                        {localizedQuest?.codename && (
                            <span className="font-mono text-[9px] text-volt/75 uppercase tracking-[0.15em] block mb-0.5">
                                {localizedQuest.codename}
                            </span>
                        )}

                        <h3 className="font-sans font-bold text-xl text-white leading-tight truncate mb-1">
                            {localizedQuest?.title || quest.title || 'Quest'}
                        </h3>

                        {/* Impact financier estimé - Utilise estimatedImpact depuis les métadonnées */}
                        {impactDisplay && (
                            <div className="inline-flex items-center gap-1 bg-emerald/10 border border-emerald/20 rounded-lg px-2 py-0.5 mb-2">
                                <span className="font-mono text-xs font-bold text-emerald">
                                    {impactDisplay.label}
                                </span>
                            </div>
                        )}

                        {/* Progress Bar styled as 'Loading' */}
                        <div className="w-full h-2 bg-neutral-900 rounded-sm border border-neutral-800 relative overflow-hidden">
                            <div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-volt/40 via-white/40 to-volt/30 transition-all"
                                style={{ width: `${quest.progress || 33}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Action Overlay */}
                <div className="mt-5 flex gap-2 relative z-10">
                    <button
                        onClick={() => onOpen(quest)}
                        className="flex-1 bg-white text-black font-bold font-sans py-3 rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95"
                    >
                        <Eye className="w-5 h-5" />
                        {t('openMission') || 'OPEN MISSION'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestCartridge;
