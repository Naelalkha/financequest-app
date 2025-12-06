import React, { useState, useEffect } from "react";
import { RefreshCw, Zap, X } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useLocalizedQuest } from '../../../hooks/useLocalizedQuest';

/**
 * SmartMissionModal - Mission Briefing UI
 * Premium "Hard Tech" aesthetic modal with HUD-style elements
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
  const { t } = useTranslation('dashboard');
  const [currentQuest, setCurrentQuest] = useState(initialQuest);
  const [isAnimating, setIsAnimating] = useState(false);

  // Localize the current quest to get translations
  const localizedQuest = useLocalizedQuest(currentQuest);

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

  if (!isOpen || !localizedQuest) return null;

  // Get quest color (primary) or fallback to volt
  const questColor = localizedQuest.colors?.primary || '#E2FF00';

  // Determine icon based on quest data
  const getQuestIcon = (quest) => {
    // If quest has an image (string URL)
    if (quest.icons?.main && typeof quest.icons.main === 'string') {
      return quest.icons.main; // Return the image URL string
    }

    // If quest has a React icon component, use it
    if (quest.icons?.main && typeof quest.icons.main === 'function') {
      const IconComponent = quest.icons.main;
      return <IconComponent className="w-12 h-12" style={{ color: questColor }} />;
    }

    // Fallback to emoji based on category
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

  // Helper to highlight numbers in description (e.g., "€156/an" becomes highlighted)
  const highlightNumbers = (text) => {
    if (!text) return text;
    // Match currency amounts, percentages, and numbers with units
    const pattern = /(€\d+[\d,\.]*\/?[a-zA-Z]*|\d+[\d,\.]*\s*[€%]|\d+[\d,\.]*\s*(an|mois|jours?|ans?|heures?|minutes?|h|m))/gi;
    const parts = text.split(pattern);

    return parts.map((part, index) => {
      if (pattern.test(part)) {
        return <span key={index} className="text-yellow-400 font-bold">{part}</span>;
      }
      // Reset regex lastIndex for next test
      pattern.lastIndex = 0;
      if (part && pattern.test(part)) {
        return <span key={index} className="text-yellow-400 font-bold">{part}</span>;
      }
      pattern.lastIndex = 0;
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">

      {/* Card */}
      <div className="w-full max-w-sm bg-[#111] border border-neutral-800 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center animate-in zoom-in-95">

        {/* Close button - Min 44x44px hitbox for mobile accessibility */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-white/10 border border-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-all flex items-center justify-center"
          aria-label={t('common:actions.close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Holographic Top Border - VOLT */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-volt to-transparent rounded-b-full shadow-volt-glow"></div>

        <h2 className="font-mono text-xs text-volt font-bold tracking-[0.2em] uppercase mb-6 mt-2">
          {t('missionBriefing')}
        </h2>

        {/* Icon / Visual with Radial Spotlight */}
        {(() => {
          const icon = getQuestIcon(localizedQuest);
          const isImage = typeof icon === 'string' && (icon.includes('/') || icon.includes('.'));

          if (isImage) {
            // Image PNG with radial spotlight behind
            return (
              <div className={`relative mb-6 transform transition-transform ${isAnimating ? 'animate-spin-slow opacity-50' : ''}`}>
                {/* Radial Spotlight Gradient */}
                <div
                  className="absolute inset-0 -m-8 rounded-full blur-2xl opacity-60"
                  style={{ background: 'radial-gradient(circle, rgba(234, 179, 8, 0.25) 0%, transparent 70%)' }}
                />
                <img
                  src={icon}
                  alt={localizedQuest?.title || 'Quest icon'}
                  className="relative w-40 h-40 object-contain drop-shadow-2xl"
                />
              </div>
            );
          }

          // Icône React ou emoji - avec conteneur rond et spotlight
          return (
            <div className={`relative mb-6 ${isAnimating ? 'animate-spin-slow opacity-50' : ''}`}>
              {/* Radial Spotlight Gradient */}
              <div
                className="absolute inset-0 -m-6 rounded-full blur-xl opacity-60"
                style={{ background: 'radial-gradient(circle, rgba(234, 179, 8, 0.2) 0%, transparent 70%)' }}
              />
              <div className="relative w-24 h-24 bg-gradient-to-br from-neutral-800 to-black rounded-full flex items-center justify-center border border-neutral-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
                {typeof icon === 'string' ? (
                  <span className="text-5xl drop-shadow-md">{icon}</span>
                ) : (
                  icon
                )}
              </div>
            </div>
          );
        })()}

        {/* Title & Description */}
        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'} w-full`}>
          <h3 className="font-sans font-black text-2xl text-white uppercase leading-tight mb-3">
            {localizedQuest.title}
          </h3>
          {/* Description with improved contrast and highlighted numbers */}
          <p className="text-sm text-gray-300 leading-relaxed px-2 mb-6">
            {highlightNumbers(localizedQuest.description)}
          </p>

          {/* HUD-Style Stats Grid */}
          <div className="flex items-stretch justify-center gap-4 mb-8">
            {/* XP Stat - HUD Element */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col items-center backdrop-blur-sm">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-1">{t('reward')}</span>
              <span className="text-xl font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">
                +{localizedQuest.xp || 100} XP
              </span>
            </div>
            {/* Time Stat - HUD Element */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col items-center backdrop-blur-sm">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-1">{t('estTime')}</span>
              <span className="text-xl font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">
                {localizedQuest.duration || localizedQuest.estimatedTime || '5'}m
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex gap-3 items-center">
          {/* Reroll Button - Circular Tactical Style */}
          <button
            onClick={handleReroll}
            disabled={isAnimating}
            className="w-14 h-14 flex-shrink-0 rounded-full bg-transparent border-2 border-white/20 text-gray-400 hover:border-volt hover:text-volt hover:bg-volt/5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
            aria-label="Reroll Mission"
          >
            <RefreshCw className={`w-6 h-6 ${isAnimating ? 'animate-spin' : ''}`} />
          </button>
          {/* Primary CTA */}
          <button
            onClick={() => onAccept(currentQuest)}
            className="flex-1 bg-volt text-black font-black font-sans rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-volt-glow active:scale-95 py-4"
          >
            <Zap className="w-5 h-5 fill-black" />
            {t('startQuest')}
          </button>
        </div>


      </div>
    </div>
  );
};

export default SmartMissionModal;

