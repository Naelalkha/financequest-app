/**
 * 🎮 ÉCRAN 1 : L'INITIALISATION (Le Hook)
 * "SYSTEM ONLINE" - Met l'utilisateur dans la peau de l'agent
 * 
 * Visuel: Fond noir avec logo qui pulse, lignes de code en arrière-plan
 * Effet: Boot Sequence immersif
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '../../../utils/haptics';
import { Target, Zap, TrendingUp, Cpu } from 'lucide-react';

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
  const containerRef = useRef(null);

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
      ref={containerRef}
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

const PulsingLogo = () => {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
    >
      {/* Glow rings */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-[#E2FF00]/20"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ filter: 'blur(20px)' }}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl bg-[#E2FF00]/30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
        style={{ filter: 'blur(10px)' }}
      />
      
      {/* Logo container */}
      <motion.div
        className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#E2FF00] to-[#B8CC00] flex items-center justify-center shadow-[0_0_40px_rgba(226,255,0,0.4)]"
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* M Logo */}
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path
            d="M8 40V12L16 28L24 12L32 28L40 12V40"
            stroke="#0A0A0A"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};

const InitScreen = ({ onNext }) => {
  const [showContent, setShowContent] = useState(false);
  const [bootPhase, setBootPhase] = useState(0);

  useEffect(() => {
    // Boot sequence timing
    const timers = [
      setTimeout(() => {
        setBootPhase(1);
        haptic.light();
      }, 500),
      setTimeout(() => {
        setBootPhase(2);
        haptic.light();
      }, 1000),
      setTimeout(() => {
        setShowContent(true);
        haptic.medium();
      }, 1500),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleInitialize = () => {
    haptic.heavy();
    // Small delay for haptic feedback before transition
    setTimeout(() => {
      onNext();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
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
      <div className="relative z-10 flex flex-col items-center px-6">
        
        {/* Logo with pulse effect */}
        <div className="mb-12">
          <PulsingLogo />
        </div>

        {/* Boot text sequence */}
        <AnimatePresence mode="wait">
          {bootPhase >= 1 && (
            <motion.div
              key="boot-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              {/* Main title */}
              <motion.h1
                className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3"
                initial={{ opacity: 0, letterSpacing: '0.2em' }}
                animate={{ opacity: 1, letterSpacing: '0.02em' }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                SYSTEM ONLINE
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-[#E2FF00] font-mono text-sm tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                La fin de l'argent invisible.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Value proposition cards */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-sm space-y-3 mb-10"
            >
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
                  transition={{ delay: 0.3 + index * 0.15 }}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Button */}
        <AnimatePresence>
          {showContent && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInitialize}
              className="w-full max-w-sm bg-[#E2FF00] text-black font-black py-4 px-8 rounded-xl 
                         shadow-[0_0_30px_rgba(226,255,0,0.3)] 
                         hover:shadow-[0_0_50px_rgba(226,255,0,0.5)]
                         active:scale-[0.98] transition-all duration-200
                         uppercase tracking-wider text-base flex items-center justify-center gap-3"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 1.5 }}
              >
                <Cpu className="w-5 h-5" />
              </motion.span>
              INITIALISER LE PROTOCOLE
            </motion.button>
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
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-[#E2FF00]/20" />
      <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-[#E2FF00]/20" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-[#E2FF00]/20" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-[#E2FF00]/20" />
    </div>
  );
};

export default InitScreen;
