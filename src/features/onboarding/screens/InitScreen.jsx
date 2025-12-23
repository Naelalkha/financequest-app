/**
 * 🎮 ÉCRAN 1 : LA PROMESSE (L'Identité)
 * "L'OS TACTIQUE DE VOTRE ARGENT" - Ceci n'est pas une banque, c'est un QG.
 * 
 * Visuel: Fond noir + Pattern Guilloche fantôme (15% opacité)
 * Logo MONIYO qui pulse, typewriter animation pour le nom
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '../../../utils/haptics';
import { ArrowRight, Power } from 'lucide-react';
import { TypewriterText } from '../../../components/ui';
import logoMoniyo from '../../../assets/logo-moniyo.png';

const MoniyoLogo = () => {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-[#E2FF00]/30"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ filter: 'blur(25px)' }}
      />

      {/* Logo image */}
      <motion.img
        src={logoMoniyo}
        alt="Moniyo"
        className="relative w-28 h-28 object-contain drop-shadow-[0_0_30px_rgba(226,255,0,0.4)]"
        animate={{
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};

const InitScreen = ({ onNext }) => {
  const [isTitleReady, setIsTitleReady] = useState(false);

  const handleTitleFinished = () => {
    setTimeout(() => {
      setIsTitleReady(true);
      haptic.medium();
    }, 300);
  };

  const handleContinue = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    haptic.heavy();
    // Utiliser un setTimeout très court pour s'assurer que l'événement est traité
    setTimeout(() => {
      onNext();
    }, 0);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(226, 255, 0, 0.02) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-6 w-full max-w-lg pb-24"
      >

        {/* Logo Moniyo */}
        <div className="mb-12">
          <MoniyoLogo />
        </div>

        {/* Brand name - Typewriter Effect */}
        <div className="mb-8 flex flex-col items-center min-h-[60px]">
          <TypewriterText
            text="MONIYO"
            className="text-5xl md:text-6xl font-black text-white tracking-tighter text-center"
            cursorColor="#E2FF00"
            typingSpeed={150}
            startDelay={500}
            onFinish={handleTitleFinished}
          />
        </div>

        {/* Phase 2: Content Reveal after Typewriter */}
        <AnimatePresence>
          {isTitleReady && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              className="w-full flex flex-col items-center relative z-20"
            >
              {/* Main Title - H2 */}
              <motion.h2
                className="text-xl md:text-2xl font-black text-white text-center tracking-tight mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                LE SYSTÈME TACTIQUE DE VOTRE ARGENT.
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                className="text-neutral-300 text-center text-sm leading-relaxed max-w-xs mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Arrêtez de subir. Les banques vous montrent le passé.
                <span className="text-white font-medium"> Moniyo vous donne les armes pour construire l'avenir.</span>
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: isTitleReady ? 1 : 0, scale: isTitleReady ? 1 : 0.98 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 25 }}
                className="w-full"
              >
                <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 -mx-6 mt-6">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleContinue}
                    type="button"
                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-volt-glow-strong border-[3px] border-black transition-all"
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Power className="w-5 h-5" />
                    INITIALISER LE SYSTÈME
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Version tag */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: isTitleReady ? 0.4 : 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-[10px] font-mono text-neutral-600 tracking-widest"
        >
          BRIEFING STRATÉGIQUE • v2.0
        </motion.p>
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-[#E2FF00]/20" />
      <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-[#E2FF00]/20" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-[#E2FF00]/20" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-[#E2FF00]/20" />
    </div>
  );
};

export default InitScreen;
