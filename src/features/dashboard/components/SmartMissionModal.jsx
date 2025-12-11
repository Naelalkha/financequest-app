import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Zap, X } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useLocalizedQuest } from '../../../hooks/useLocalizedQuest';
import { modalVariants, TRANSITIONS } from '../../../styles/animationConstants';

/**
 * SmartMissionModal - Mission Briefing UI
 * Premium "Hard Tech" aesthetic modal with HUD-style elements
 * 
 * Animation Strategy:
 * - Opening: scale 0.96 → 1, opacity 0 → 1
 * - Closing (X button): scale 1 → 0.96, opacity 1 → 0 via AnimatePresence
 * - Accepting quest: NO animation - quest appears on top, modal closes silently
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

  // Handle accept - NO transition animation
  // The quest will appear on top (z-100) and cover this modal (z-50)
  const handleAccept = () => {
    onAccept(currentQuest);
  };

  const questColor = localizedQuest?.colors?.primary || '#E2FF00';

  const getQuestIcon = (quest) => {
    if (!quest) return '🎯';
    if (quest.icons?.main && typeof quest.icons.main === 'string') {
      return quest.icons.main;
    }
    if (quest.icons?.main && typeof quest.icons.main === 'function') {
      const IconComponent = quest.icons.main;
      return <IconComponent className="w-12 h-12" style={{ color: questColor }} />;
    }
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

  const highlightNumbers = (text) => {
    if (!text) return text;
    const pattern = /(€\d+[\d,\.]*\/?[a-zA-Z]*|\d+[\d,\.]*\s*[€%]|\d+[\d,\.]*\s*(an|mois|jours?|ans?|heures?|minutes?|h|m))/gi;
    const parts = text.split(pattern);
    return parts.map((part, index) => {
      if (pattern.test(part)) {
        return <span key={index} className="text-yellow-400 font-bold">{part}</span>;
      }
      pattern.lastIndex = 0;
      if (part && pattern.test(part)) {
        return <span key={index} className="text-yellow-400 font-bold">{part}</span>;
      }
      pattern.lastIndex = 0;
      return part;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && localizedQuest && (
        <motion.div
          key="smart-mission-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={modalVariants.backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={TRANSITIONS.overlayEntry}
          style={{
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)'
          }}
        >
          {/* Card */}
          <motion.div
            className="bg-[#0A0A0A] shadow-2xl relative flex flex-col items-center text-center overflow-hidden w-full max-w-sm rounded-3xl p-6 border border-neutral-800"
            variants={modalVariants.card}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={TRANSITIONS.modalEntry}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors group z-20"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            {/* Holographic Top Border */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-volt to-transparent rounded-b-full shadow-volt-glow" />

            <h2 className="font-mono text-xs text-volt font-bold tracking-[0.2em] uppercase mb-6 mt-2">
              {t('missionBriefing')}
            </h2>

            {/* Icon / Visual */}
            {(() => {
              const icon = getQuestIcon(localizedQuest);
              const isImage = typeof icon === 'string' && (icon.includes('/') || icon.includes('.'));

              if (isImage) {
                return (
                  <div className={`relative mb-6 ${isAnimating ? 'animate-spin-slow opacity-50' : ''}`}>
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

              return (
                <div className={`relative mb-6 ${isAnimating ? 'animate-spin-slow opacity-50' : ''}`}>
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
              {localizedQuest.codename && (
                <span className="font-mono text-xs text-volt/75 uppercase tracking-[0.2em] block mb-1">
                  {localizedQuest.codename}
                </span>
              )}
              <h3 className="font-sans font-black text-2xl text-white uppercase leading-tight mb-3">
                {localizedQuest.title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed px-2 mb-6">
                {highlightNumbers(localizedQuest.description)}
              </p>

              {/* HUD-Style Stats Grid */}
              <div className="flex items-stretch justify-center gap-4 mb-8">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col items-center backdrop-blur-sm">
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-1">{t('reward')}</span>
                  <span className="text-xl font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]">
                    +{localizedQuest.xpReward || 100} XP
                  </span>
                </div>
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
              <button
                onClick={handleReroll}
                disabled={isAnimating}
                className="w-14 h-14 flex-shrink-0 rounded-full bg-transparent border-2 border-white/20 text-gray-400 hover:border-volt hover:text-volt hover:bg-volt/5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
                aria-label="Reroll Mission"
              >
                <RefreshCw className={`w-6 h-6 ${isAnimating ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 bg-volt text-black font-black font-sans rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-volt-glow active:scale-95 py-4"
              >
                <Zap className="w-5 h-5 fill-black" />
                {t('startQuest')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartMissionModal;
