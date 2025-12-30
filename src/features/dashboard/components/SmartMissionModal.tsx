import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Shuffle } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useLocalizedQuest } from '../../../hooks/useLocalizedQuest';
import { modalVariants, TRANSITIONS } from '../../../styles/animationConstants';

/** Quest interface for SmartMissionModal */
interface SmartMissionQuest {
  id: string;
  title?: string;
  description?: string;
  codename?: string;
  xpReward?: number;
  duration?: number;
  estimatedTime?: string | number;
  icons?: {
    main?: string | React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  };
  colors?: {
    primary?: string;
  };
}

/** SmartMissionModal props */
interface SmartMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (quest: SmartMissionQuest) => void;
  onReroll: () => SmartMissionQuest;
  initialQuest: SmartMissionQuest | null;
  hideReroll?: boolean;
}

/**
 * SmartMissionModal - Mission Briefing UI
 * Premium "Hard Tech" aesthetic modal with HUD-style elements
 */

const ANIMATION_DURATION = {
  reroll: 0.25,
  shuffle: 0.6,
  warp: 0.4
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 1.05, filter: "blur(4px)" }
};

/**
 * Highlights monetary values and time durations in text
 */
const highlightNumbers = (text: string | undefined): React.ReactNode => {
  if (!text) return text;
  const pattern = /(€\d+[\d,\.]*\/?[a-zA-Z]*|\d+[\d,\.]*\s*[€%]|\d+[\d,\.]*\s*(?:an|mois|jours?|ans?|heures?|minutes?|h|m)\b)/gi;
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) result.push(text.slice(lastIndex, match.index));
    result.push(<span key={match.index} className="text-yellow-400 font-bold">{match[0]}</span>);
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) result.push(text.slice(lastIndex));
  return result.length > 0 ? result : text;
};

/** Quest icon props */
interface QuestIconProps {
  quest: SmartMissionQuest | null;
  questColor: string;
}

/**
 * Quest Icon Component
 */
const QuestIcon: React.FC<QuestIconProps> = ({ quest, questColor }) => {
  if (!quest) return <span className="text-5xl">🎯</span>;
  const icon = quest.icons?.main;

  if (typeof icon === 'function') {
    const IconComponent = icon;
    return <IconComponent className="w-12 h-12" style={{ color: questColor }} />;
  }

  if (typeof icon === 'string' && (icon.includes('/') || icon.includes('.'))) {
    return (
      <div className="relative mb-6">
        <div className="absolute inset-0 -m-8 rounded-full blur-2xl opacity-60" style={{ background: 'radial-gradient(circle, rgba(234, 179, 8, 0.25) 0%, transparent 70%)' }} />
        <img src={icon} alt={quest.title} className="relative w-40 h-40 object-contain drop-shadow-2xl" />
      </div>
    );
  }

  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 -m-6 rounded-full blur-xl opacity-60" style={{ background: 'radial-gradient(circle, rgba(234, 179, 8, 0.2) 0%, transparent 70%)' }} />
      <div className="relative w-24 h-24 bg-gradient-to-br from-neutral-800 to-black rounded-full flex items-center justify-center border border-neutral-700">
        <span className="text-5xl">{typeof icon === 'string' ? icon : '🎯'}</span>
      </div>
    </div>
  );
};

const SmartMissionModal: React.FC<SmartMissionModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  onReroll,
  initialQuest,
  hideReroll = false
}) => {
  const { t } = useTranslation('dashboard');
  const [rerolledQuest, setRerolledQuest] = useState<SmartMissionQuest | null>(null);
  const [isRerolling, setIsRerolling] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [rotation, setRotation] = useState(0);
  const rerollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuest = rerolledQuest || initialQuest;
  const localizedQuest = useLocalizedQuest(currentQuest);
  const questColor = localizedQuest?.colors?.primary || '#E2FF00';

  // Reset all states ONLY when modal opens
  useEffect(() => {
    if (isOpen) {
      setRerolledQuest(null);
      setIsAccepting(false);
      setIsRerolling(false);
      setRotation(0);
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => { if (rerollTimeoutRef.current) clearTimeout(rerollTimeoutRef.current); };
  }, []);

  const handleReroll = useCallback(() => {
    if (isRerolling || isAccepting) return;
    setIsRerolling(true);
    setRotation(prev => prev + 360);
    const newQuest = onReroll();
    setRerolledQuest(newQuest);
    rerollTimeoutRef.current = setTimeout(() => setIsRerolling(false), ANIMATION_DURATION.shuffle * 1000);
  }, [isRerolling, isAccepting, onReroll]);

  const handleAccept = useCallback(() => {
    if (isAccepting || !currentQuest) return;
    setIsAccepting(true);
    onAccept(currentQuest);
  }, [isAccepting, currentQuest, onAccept]);

  // Special exit variant for "Warp" effect
  const warpExit = {
    scale: 1.2,
    opacity: 0,
    filter: "blur(15px)",
    y: -20,
    transition: { duration: ANIMATION_DURATION.warp, ease: [0.4, 0, 0.2, 1] as const }
  };

  return (
    <AnimatePresence>
      {isOpen && localizedQuest && (
        <motion.div
          key="smart-mission-modal"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          variants={modalVariants.backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={TRANSITIONS.overlayEntry}
          style={{
            backdropFilter: isAccepting ? 'blur(20px)' : 'blur(12px)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)'
          }}
        >
          <motion.div
            className="bg-[#0A0A0A] shadow-2xl relative flex flex-col items-center text-center overflow-hidden w-full max-w-sm rounded-3xl p-6 border border-neutral-800"
            variants={modalVariants.card}
            initial="hidden"
            animate={isAccepting ? warpExit : "visible"}
            exit="exit"
            transition={TRANSITIONS.modalEntry}
          >
            {!isAccepting && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/5 active:bg-white/10 transition-colors z-20"
                aria-label={t('close')}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-volt to-transparent rounded-b-full shadow-volt-glow" />

            <h2 className="font-mono text-xs text-volt font-bold tracking-[0.2em] uppercase mb-6 mt-2">
              {t('missionBriefing')}
            </h2>

            <div className="w-full">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`content-${localizedQuest?.id || 'loading'}`}
                  layout
                  className="flex flex-col items-center w-full"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: ANIMATION_DURATION.reroll, ease: "easeOut", layout: { duration: 0.3 } }}
                >
                  <QuestIcon quest={localizedQuest} questColor={questColor} />
                  <div className="w-full">
                    {localizedQuest.codename && <span className="font-mono text-xs text-volt/75 uppercase tracking-[0.2em] block mb-1">{localizedQuest.codename}</span>}
                    <h3 className="font-sans font-black text-2xl text-white uppercase leading-tight mb-3">{localizedQuest.title}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed px-2 mb-6">{highlightNumbers(localizedQuest.description)}</p>
                    <div className="flex items-stretch justify-center gap-4 mb-8">
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col items-center">
                        <span className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-1">{t('reward')}</span>
                        <span className="text-xl font-bold text-yellow-400">+{localizedQuest.xpReward || 100} XP</span>
                      </div>
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col items-center">
                        <span className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-1">{t('estTime')}</span>
                        <span className="text-xl font-bold text-yellow-400">{localizedQuest.duration || localizedQuest.estimatedTime || '5'}m</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className={`w-full flex gap-3 items-center ${hideReroll ? 'justify-center' : ''}`}>
              {!hideReroll && (
                <button
                  onClick={handleReroll}
                  disabled={isRerolling || isAccepting}
                  className="w-14 h-14 flex-shrink-0 rounded-full bg-transparent border-2 border-white/20 text-gray-400 active:border-volt active:text-volt active:bg-volt/5 transition-colors flex items-center justify-center disabled:opacity-50"
                  aria-label={t('rerollMission')}
                >
                  <motion.div
                    animate={{ rotate: rotation }}
                    transition={rotation === 0 ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
                  >
                    <Shuffle className="w-6 h-6" />
                  </motion.div>
                </button>
              )}
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="flex-1 bg-volt text-black font-black font-sans rounded-xl flex items-center justify-center gap-2 active:scale-95 py-4 disabled:opacity-80 shadow-volt-glow-strong border-[3px] border-black"
                aria-label={t('accept')}
              >
                {isAccepting ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"
                    aria-label="Loading"
                  />
                ) : (
                  <><Zap className="w-5 h-5 fill-black" />{t('accept')}</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartMissionModal;