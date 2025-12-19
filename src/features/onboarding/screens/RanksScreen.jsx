/**
 * 🎮 ÉCRAN 3 : LA PROMESSE (La Gamification)
 * "MONTE EN GRADE" - Montrer que ce n'est pas juste un tableur Excel
 * 
 * Affiche la progression des grades: Recrue → Stratège → Légende
 * Crée l'aspiration et la curiosité
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Crown, Shield, Zap, Gift, Lock, Trophy } from 'lucide-react';
import { haptic } from '../../../utils/haptics';

const RANKS = [
  {
    id: 'recruit',
    name: 'RECRUE',
    level: '1-4',
    color: '#6B7280', // gray
    bgColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: 'rgba(107, 114, 128, 0.3)',
    icon: Shield,
    description: 'Premiers pas vers l\'indépendance',
    isYou: true,
  },
  {
    id: 'strategist',
    name: 'STRATÈGE',
    level: '5-9',
    color: '#D97706', // amber/bronze
    bgColor: 'rgba(217, 119, 6, 0.1)',
    borderColor: 'rgba(217, 119, 6, 0.3)',
    icon: Zap,
    description: 'Maîtrise du cashflow',
    isYou: false,
  },
  {
    id: 'legend',
    name: 'LÉGENDE',
    level: '10+',
    color: '#FBBF24', // gold
    bgColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
    icon: Crown,
    description: 'Liberté Financière débloquée',
    isYou: false,
    hasSecrets: true,
  },
];

const RankBadge = ({ rank, index, isAnimating }) => {
  const Icon = rank.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: isAnimating && index === 0 ? [1, 1.05, 1] : 1, 
        y: 0 
      }}
      transition={{ 
        delay: 0.3 + index * 0.2,
        duration: 0.5,
        scale: { duration: 0.4, repeat: isAnimating && index === 0 ? 2 : 0 }
      }}
      className="relative"
    >
      {/* Glow effect for current rank */}
      {rank.isYou && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ 
            background: `radial-gradient(circle, ${rank.color}40 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div
        className={`
          relative p-5 rounded-2xl border-2 transition-all duration-300
          ${rank.isYou ? 'scale-105' : 'opacity-60'}
        `}
        style={{
          backgroundColor: rank.bgColor,
          borderColor: rank.isYou ? rank.color : rank.borderColor,
        }}
      >
        {/* "C'est toi" badge */}
        {rank.isYou && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E2FF00] text-black 
                       text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider"
          >
            C'EST TOI
          </motion.div>
        )}

        {/* Icon */}
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: `${rank.color}20` }}
        >
          <Icon 
            className="w-8 h-8" 
            style={{ color: rank.color }}
            strokeWidth={2.5}
          />
        </div>

        {/* Rank name */}
        <h3 
          className="text-center font-black text-lg mb-1"
          style={{ color: rank.color }}
        >
          {rank.name}
        </h3>

        {/* Level range */}
        <p className="text-center text-neutral-500 text-xs font-mono mb-2">
          NIVEAU {rank.level}
        </p>

        {/* Description */}
        <p className="text-center text-neutral-400 text-xs">
          {rank.description}
        </p>

        {/* Secret badge for Legend */}
        {rank.hasSecrets && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-3 flex items-center justify-center gap-1.5 text-amber-400/70 text-[10px] font-medium"
          >
            <Lock className="w-3 h-3" />
            <span>FONCTIONNALITÉS EXCLUSIVES</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const RewardPreview = () => {
  const rewards = [
    { icon: Trophy, label: 'Badges exclusifs' },
    { icon: Gift, label: 'Récompenses réelles' },
    { icon: Zap, label: 'Boost XP quotidien' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="mt-8"
    >
      <p className="text-center text-neutral-500 text-xs font-mono tracking-wider mb-4">
        RÉCOMPENSES À DÉBLOQUER
      </p>
      <div className="flex justify-center gap-6">
        {rewards.map((reward, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.7 + index * 0.1 }}
            className="text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 
                          flex items-center justify-center mb-2">
              <reward.icon className="w-5 h-5 text-[#E2FF00]" />
            </div>
            <p className="text-neutral-500 text-[10px]">{reward.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const RanksScreen = ({ onNext }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    haptic.medium();
    
    // Stop badge pulsing after initial animation
    const timer = setTimeout(() => setIsAnimating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    haptic.medium();
    onNext();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden">
      {/* Decorative gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-6 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#E2FF00] font-mono text-xs tracking-[0.3em] mb-3"
          >
            SYSTÈME DE PROGRESSION
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-black text-white tracking-tight"
          >
            MONTE EN GRADE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-neutral-500 mt-3 text-sm max-w-xs mx-auto"
          >
            Chaque euro sauvé te donne de l'XP. Débloque des récompenses réelles.
          </motion.p>
        </motion.div>

        {/* Ranks grid */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto w-full">
            {RANKS.map((rank, index) => (
              <RankBadge 
                key={rank.id} 
                rank={rank} 
                index={index}
                isAnimating={isAnimating}
              />
            ))}
          </div>

          {/* XP explanation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 
                          rounded-full px-4 py-2 text-sm">
              <Star className="w-4 h-4 text-[#E2FF00]" />
              <span className="text-neutral-300">
                <span className="text-[#E2FF00] font-bold">1€ économisé</span> = 
                <span className="text-white font-bold"> 1 XP</span>
              </span>
            </div>
          </motion.div>

          {/* Reward preview */}
          <RewardPreview />
        </div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="mt-8"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="w-full max-w-sm mx-auto bg-[#E2FF00] text-black font-black py-4 px-8 rounded-xl 
                       shadow-[0_0_30px_rgba(226,255,0,0.3)] 
                       hover:shadow-[0_0_50px_rgba(226,255,0,0.5)]
                       active:scale-[0.98] transition-all duration-200
                       uppercase tracking-wider text-base flex items-center justify-center gap-3"
          >
            CONTINUER
            <span className="text-lg">→</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
        <div className="w-6 h-2 rounded-full bg-[#E2FF00]" />
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
      </div>
    </div>
  );
};

export default RanksScreen;
