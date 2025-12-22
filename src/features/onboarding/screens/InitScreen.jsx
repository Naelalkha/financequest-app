/**
 * 🎮 ÉCRAN 1 : L'INITIALISATION (Le Hook)
 * "SYSTEM ONLINE" - Met l'utilisateur dans la peau de l'agent
 * 
 * Visuel: Fond noir avec logo qui pulse, lignes de code en arrière-plan
 * Effet: Boot Sequence immersif
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '../../../utils/haptics';
import { Target, Zap, TrendingUp, Cpu } from 'lucide-react';
import { TypewriterText } from '../../../components/ui';
import logoMoniyo from '../../../assets/logo-moniyo.png';

// Fake code lines for the matrix effect
const CODE_LINES = [
  'INITIALIZING_FINANCIAL_CORE...',
  'LOADING_EXPENSE_TRACKER_V2.3...',
  'CONNECTING_TO_SAVINGS_NETWORK...',
  'PARSING_USER_PATTERNS...',
  'ACTIVATING_MISSION_PROTOCOL...',
  'DECRYPTING_BUDGET_DATA...',
  'SCANNING_SUBSCRIPTIONS...',
  'CALIBRATING_XP_SYSTEM...',
  'LOADING_ACHIEVEMENT_MODULES...',
  'ESTABLISHING_SECURE_CHANNEL...',
  'VERIFYING_AGENT_CREDENTIALS...',
  'SYSTEM_READY...',
];

const MatrixRain = () => {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLines(prev => {
        const newLine = {
          id: Date.now(),
          text: CODE_LINES[Math.floor(Math.random() * CODE_LINES.length)],
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
        };
        // Keep only last 15 lines
        const updated = [...prev, newLine].slice(-15);
        return updated;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none opacity-20"
    >
      <AnimatePresence>
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.6, y: '100vh' }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 8,
              delay: line.delay,
              ease: 'linear'
            }}
            className="absolute font-mono text-[10px] text-[#E2FF00]/40 whitespace-nowrap"
            style={{ left: `${line.x}%` }}
          >
            {line.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

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
  const [showContent, setShowContent] = useState(false);
  const [isTitleReady, setIsTitleReady] = useState(false);

  // Typewriter animation triggers this when finished

  const handleTitleFinished = () => {
    // Wait a brief moment after text stabilizes before showing the rest
    setTimeout(() => {
      setIsTitleReady(true);
      setShowContent(true);
      haptic.medium();
    }, 300);
  };

  const handleInitialize = () => {
    haptic.heavy();
    // Small delay for haptic feedback before transition
    setTimeout(() => {
      onNext();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center relative overflow-hidden">
      {/* Matrix rain background */}
      <MatrixRain />

      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(226, 255, 0, 0.03) 2px, rgba(226, 255, 0, 0.03) 4px)',
        }}
      />

      {/* Content */}
      <motion.div
        layout
        className="relative z-10 flex flex-col items-center px-6 w-full max-w-lg"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >

        {/* Logo Moniyo */}
        <div className="mb-8">
          <MoniyoLogo />
        </div>

        {/* Main title - Typewriter Effect */}
        <div className="mb-6 flex flex-col items-center min-h-[60px]">
          <TypewriterText
            text="MONIYO"
            className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-2 text-center"
            cursorColor="#E2FF00"
            typingSpeed={150}
            startDelay={500}
            onFinish={handleTitleFinished}
          />
        </div>

        {/* Phase 2: Content Reveal */}
        <AnimatePresence>
          {isTitleReady && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              className="w-full flex flex-col items-center"
            >
              {/* Subtitle */}
              <motion.p
                className="text-white font-mono text-sm tracking-widest mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                L'OS tactique de votre patrimoine.
              </motion.p>

              {/* Value proposition cards */}
              <div className="w-full space-y-3 mb-10">
                {[
                  {
                    icon: Target,
                    title: 'GAMEPLAY TACTIQUE',
                    subtitle: 'Gamifie tes finances'
                  },
                  {
                    icon: Zap,
                    title: 'OPTIMISATION FLUIDE',
                    subtitle: 'Transforme tes pertes en capital'
                  },
                  {
                    icon: TrendingUp,
                    title: 'STRATÉGIE & CROISSANCE',
                    subtitle: 'Apprends à investir comme un pro'
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#E2FF00]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#E2FF00]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm tracking-wide">{item.title}</span>
                      <span className="text-neutral-400 text-xs">{item.subtitle}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInitialize}
                className="w-full bg-[#E2FF00] text-black font-black py-4 px-8 rounded-xl 
                           shadow-[0_0_30px_rgba(226,255,0,0.3)] 
                           hover:shadow-[0_0_50px_rgba(226,255,0,0.5)]
                           transition-all duration-200
                           uppercase tracking-wider text-base flex items-center justify-center gap-3"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 1.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Cpu className="w-5 h-5" />
                </motion.span>
                INITIALISER LE PROTOCOLE
              </motion.button>

            </motion.div>
          )}
        </AnimatePresence>
        {/* Version tag */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 0.4 : 0 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-[10px] font-mono text-neutral-600 tracking-widest"
        >
          MONIYO v2.0 • AGENT PROTOCOL
        </motion.p>
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-[#E2FF00]/20" />
      <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-[#E2FF00]/20" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-[#E2FF00]/20" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-[#E2FF00]/20" />
    </div >
  );
};

export default InitScreen;
