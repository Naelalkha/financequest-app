/**
 * 🚀 ÉCRAN TRANSITION : CONNEXION ÉTABLIE
 * Animation de "warp/hyperspace" avant d'arriver au Dashboard
 * 
 * Crée une transition narrative plutôt qu'un simple changement de page
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '../../../utils/haptics';

const WarpLines = () => {
  const lines = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    angle: (i / 30) * 360,
    delay: Math.random() * 0.5,
    length: 50 + Math.random() * 150,
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {lines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute w-0.5 bg-gradient-to-b from-[#E2FF00] to-transparent"
          style={{
            height: 0,
            transform: `rotate(${line.angle}deg)`,
            transformOrigin: 'center 200%',
          }}
          animate={{
            height: [0, line.length, line.length * 2],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: line.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

const TransitionScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    haptic.heavy();

    const timers = [
      // Phase 1: Initial state
      setTimeout(() => {
        setPhase(1);
        haptic.medium();
      }, 300),

      // Phase 2: "Connexion établie"
      setTimeout(() => {
        setPhase(2);
        haptic.light();
      }, 1000),

      // Phase 3: "Redirection..."
      setTimeout(() => {
        setPhase(3);
      }, 1800),

      // Complete transition
      setTimeout(() => {
        haptic.success();
        onComplete();
      }, 2800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Warp effect */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <WarpLines />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central vortex */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: phase >= 3 ? [1, 50] : 1,
          opacity: phase >= 3 ? [1, 0] : 1,
        }}
        transition={{ duration: 0.8, ease: 'easeIn' }}
      >
        <motion.div
          className="w-4 h-4 rounded-full bg-[#E2FF00]"
          animate={{
            scale: [1, 1.5, 1],
            boxShadow: [
              '0 0 20px rgba(226, 255, 0, 0.5)',
              '0 0 60px rgba(226, 255, 0, 0.8)',
              '0 0 20px rgba(226, 255, 0, 0.5)',
            ],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
          }}
        />
      </motion.div>

      {/* Text content */}
      <div className="relative z-10 text-center px-6">
        <AnimatePresence mode="wait">
          {phase >= 2 && phase < 3 && (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl md:text-3xl font-black text-[#E2FF00] tracking-tight mb-2">
                CONNEXION ÉTABLIE
              </h1>
              <p className="text-neutral-500 text-sm font-mono">
                Protocole Agent activé
              </p>
            </motion.div>
          )}

          {phase >= 3 && (
            <motion.div
              key="redirect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">
                REDIRECTION VERS LE QG...
              </h1>

              {/* Progress bar */}
              <div className="w-48 h-1 bg-white/10 rounded-full mx-auto mt-4 overflow-hidden">
                <motion.div
                  className="h-full bg-[#E2FF00] rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scan lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(226, 255, 0, 0.03) 2px, rgba(226, 255, 0, 0.03) 4px)',
        }}
      />
    </div>
  );
};

export default TransitionScreen;
