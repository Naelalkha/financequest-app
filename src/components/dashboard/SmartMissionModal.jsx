import React, { useState, useEffect } from "react";
import { RefreshCw, Zap, X } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * SmartMissionModal - Refonte UI
 * Modal avec recommandation AI de mission unique
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal ouvert/fermé
 * @param {Function} props.onClose - Callback de fermeture
 * @param {Function} props.onAccept - Callback d'acceptation (quest)
 * @param {Function} props.onReroll - Callback pour regénérer une quête
 * @param {Object} props.initialQuest - Quête initiale recommandée
 */
const SmartMissionModal = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  onReroll, 
  initialQuest 
}) => {
  const { t } = useLanguage();
  const [currentQuest, setCurrentQuest] = useState(initialQuest);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (initialQuest) {
      setCurrentQuest(initialQuest);
    }
  }, [initialQuest, isOpen]);

  const handleReroll = () => {
    setIsAnimating(true);
    setTimeout(() => {
        const newQuest = onReroll();
        setCurrentQuest(newQuest);
        setIsAnimating(false);
    }, 500);
  };

  if (!isOpen || !currentQuest) return null;

  // Determine icon based on quest data
  const getQuestIcon = (quest) => {
    if (quest.category) {
      const cat = quest.category.toLowerCase();
      if (cat.includes('budget')) return '💰';
      if (cat.includes('saving')) return '💎';
      if (cat.includes('invest')) return '📈';
      if (cat.includes('tax')) return '📋';
      if (cat.includes('credit')) return '💳';
    }
    return '🎯';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Card */}
      <div className="w-full max-w-sm bg-[#111] border border-neutral-800 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center animate-in zoom-in-95">
        
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white transition-colors"
          aria-label={t('ui.close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Holographic Top Border - VOLT */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-volt to-transparent rounded-b-full shadow-volt-glow"></div>
        
        <h2 className="font-mono text-xs text-volt font-bold tracking-[0.2em] uppercase mb-6 mt-2">
          {t('dashboard.recommended') || 'MISSION BRIEFING'}
        </h2>

        {/* Icon / Visual */}
        <div className={`w-24 h-24 bg-gradient-to-br from-neutral-800 to-black rounded-full flex items-center justify-center border border-neutral-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-6 ${isAnimating ? 'animate-spin-slow opacity-50' : ''}`}>
            <span className="text-5xl drop-shadow-md">
                {getQuestIcon(currentQuest)}
            </span>
        </div>

        {/* Title & Reward */}
        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'} w-full`}>
            <h3 className="font-sans font-black text-2xl text-white uppercase leading-tight mb-2">
                {currentQuest.title}
            </h3>
            <p className="font-mono text-xs text-neutral-500 line-clamp-2 px-4 mb-6">
                {currentQuest.description}
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
                <div className="bg-neutral-900/50 border border-neutral-800 px-4 py-2 rounded-xl flex flex-col items-center">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase">Reward</span>
                    <span className="font-mono text-lg font-bold text-volt text-glow-volt">
                      +€{currentQuest.monetaryValue || 0}
                    </span>
                </div>
                <div className="bg-neutral-900/50 border border-neutral-800 px-4 py-2 rounded-xl flex flex-col items-center">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase">Est. Time</span>
                    <span className="font-mono text-lg font-bold text-volt text-glow-volt">
                      {currentQuest.estimatedTime || '5m'}
                    </span>
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="w-full flex gap-3">
            <button 
                onClick={handleReroll}
                disabled={isAnimating}
                className="p-4 rounded-2xl bg-neutral-900 border border-volt text-volt hover:bg-volt/10 transition-all active:scale-95 disabled:opacity-50"
                aria-label="Reroll"
            >
                <RefreshCw className={`w-6 h-6 ${isAnimating ? 'animate-spin' : ''}`} />
            </button>
            <button 
                onClick={() => onAccept(currentQuest)}
                className="flex-1 bg-volt text-black font-black font-sans rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-volt-glow active:scale-95 py-3"
            >
                <Zap className="w-5 h-5 fill-black" />
                {t('quests.start')}
            </button>
        </div>
        
        <button 
          onClick={onClose} 
          className="mt-6 text-neutral-600 text-xs font-mono hover:text-white transition-colors"
        >
            {t('ui.cancel')}
        </button>
      </div>
    </div>
  );
};

export default SmartMissionModal;

