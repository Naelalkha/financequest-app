/**
 * 🎯 FirstRunMissionModal
 * Pop-up modal that appears on first Dashboard visit after onboarding
 * 
 * "Opportunité Détectée" - Launches the user into their first real quest
 * Uses same structure as SmartMissionModal for consistency
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Clock, ChevronRight, X } from 'lucide-react';
import { haptic } from '../../../utils/haptics';
import { modalVariants, TRANSITIONS } from '../../../styles/animationConstants';

const FIRST_RUN_KEY = 'moniyo-first-run-shown';

// Check if first run modal has been shown
export const hasShownFirstRun = () => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(FIRST_RUN_KEY) === 'true';
};

// Mark first run as shown
export const markFirstRunShown = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FIRST_RUN_KEY, 'true');
};

// Reset first run (for testing)
export const resetFirstRun = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FIRST_RUN_KEY);
};

const ANIMATION_DURATION = {
  warp: 0.4
};

const FirstRunMissionModal = ({ isOpen, onClose, onStartMission }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      haptic.medium();
      // Start pulse animation after mount
      const timer = setTimeout(() => setIsAnimating(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleStartMission = () => {
    if (isAccepting) return;
    setIsAccepting(true);
    haptic.heavy();
    markFirstRunShown();
    
    // Small delay for warp animation
    setTimeout(() => {
      onStartMission();
    }, ANIMATION_DURATION.warp * 1000);
  };

  const handleSkip = () => {
    haptic.light();
    markFirstRunShown();
    onClose();
  };

  // Warp exit animation
  const warpExit = {
    scale: 1.2,
    opacity: 0,
    filter: "blur(15px)",
    y: -20,
    transition: { duration: ANIMATION_DURATION.warp, ease: [0.4, 0, 0.2, 1] }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="first-run-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
            {/* Close button */}
            {!isAccepting && (
              <button 
                onClick={handleSkip} 
                className="absolute top-4 right-4 p-3 rounded-full bg-white/5 active:bg-white/10 transition-colors z-20"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}

            {/* Top accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-volt to-transparent rounded-b-full shadow-volt-glow" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#E2FF00]/10 border border-[#E2FF00]/30 rounded-full px-4 py-1.5 mb-4 mt-2">
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-[#E2FF00]"
              />
              <span className="text-[#E2FF00] text-xs font-mono font-bold tracking-wider">
                OPPORTUNITÉ DÉTECTÉE
              </span>
            </div>

            {/* Icon with pulse effect */}
            <div className="relative mb-6">
              {/* Pulsing rings */}
              <motion.div
                className="absolute inset-0 -m-4 rounded-full"
                style={{ backgroundColor: 'rgba(226, 255, 0, 0.1)' }}
                animate={isAnimating ? {
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 -m-8 rounded-full"
                style={{ backgroundColor: 'rgba(226, 255, 0, 0.05)' }}
                animate={isAnimating ? {
                  scale: [1, 2, 1],
                  opacity: [0.3, 0, 0.3],
                } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              
              {/* Center icon */}
              <motion.div
                className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E2FF00] to-[#B8CC00] flex items-center justify-center shadow-[0_0_30px_rgba(226,255,0,0.4)]"
                animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Target className="w-10 h-10 text-black" strokeWidth={2.5} />
              </motion.div>
            </div>

            {/* Title */}
            <h3 className="font-sans font-black text-2xl text-white uppercase leading-tight mb-3">
              PREMIÈRE ACTION
            </h3>

            {/* Subtitle */}
            <p className="text-sm text-gray-300 leading-relaxed px-2 mb-6">
              Simulation terminée. Lance ta première action réelle pour débloquer ton potentiel.
            </p>

            {/* Mission preview card */}
            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#E2FF00]/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-[#E2FF00]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-bold text-sm">Traque Invisible</p>
                  <p className="text-neutral-500 text-xs">Identifie tes micro-dépenses</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-neutral-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">5 min</span>
                  </div>
                  <div className="text-[#E2FF00] text-xs font-bold">
                    +100 XP
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleStartMission}
              disabled={isAccepting}
              className="w-full bg-volt text-black font-black font-sans rounded-xl flex items-center justify-center gap-2 active:scale-95 py-4 disabled:opacity-80 shadow-volt-glow-strong border-[3px] border-black transition-transform"
            >
              {isAccepting ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"
                />
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-black" />
                  ACCEPTER LE DÉFI
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Skip option */}
            <button
              onClick={handleSkip}
              disabled={isAccepting}
              className="mt-4 text-neutral-500 text-xs hover:text-neutral-300 transition-colors disabled:opacity-50"
            >
              Explorer d'abord →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FirstRunMissionModal;
