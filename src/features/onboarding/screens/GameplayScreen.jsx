/**
 * 🎮 ÉCRAN 3 : LE GAMEPLAY (La Méthode)
 * "DES MISSIONS, PAS DES TABLEURS" - Montrer que c'est ludique et rapide
 * 
 * Visuel: Carte de Mission style Glass/Tactique
 * Animation: Touche "VALIDER" -> Explosion particules dorées + XP/Grade reveal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '../../../utils/haptics';
import { Target, Clock, Sparkles, Play, Check } from 'lucide-react';

// Golden particles explosion component
const GoldenParticles = ({ isActive }) => {
    if (!isActive) return null;

    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        angle: (i / 20) * 360,
        distance: 50 + Math.random() * 80,
        size: 4 + Math.random() * 8,
        delay: Math.random() * 0.2,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-20">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-[#E2FF00]"
                    style={{
                        width: particle.size,
                        height: particle.size,
                        boxShadow: '0 0 10px rgba(226, 255, 0, 0.8)',
                    }}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                    animate={{
                        scale: [0, 1.5, 0],
                        x: Math.cos(particle.angle * Math.PI / 180) * particle.distance,
                        y: Math.sin(particle.angle * Math.PI / 180) * particle.distance,
                        opacity: [1, 1, 0],
                    }}
                    transition={{
                        duration: 0.8,
                        delay: particle.delay,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    );
};

// XP Badge reveal component
const XPReward = ({ isVisible }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 15,
                        delay: 0.3
                    }}
                    className="flex flex-col items-center gap-3"
                >
                    {/* XP Amount */}
                    <motion.div
                        className="flex items-center gap-2"
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <Sparkles className="w-6 h-6 text-[#E2FF00]" />
                        <span className="text-4xl font-black text-[#E2FF00] tracking-tight">
                            +250 XP
                        </span>
                    </motion.div>

                    {/* Grade Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="px-4 py-2 rounded-lg bg-white/10 border border-[#E2FF00]/30"
                    >
                        <span className="text-xs font-mono text-neutral-400 tracking-widest">
                            GRADE :
                        </span>
                        <span className="ml-2 text-sm font-black text-white tracking-wide">
                            STRATÈGE
                        </span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Mission Card Component
const MissionCard = ({ onValidate, isValidating, isValidated }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, rotateX: -10 }}
            animate={{
                opacity: 1,
                y: 0,
                rotateX: 0,
                scale: isValidated ? 0.95 : 1,
            }}
            transition={{
                duration: 0.6,
                delay: 0.3,
                type: 'spring',
                stiffness: 200
            }}
            className="relative w-full max-w-sm mx-auto"
            style={{ perspective: 1000 }}
        >
            {/* Card glow effect */}
            <motion.div
                className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#E2FF00]/20 to-transparent opacity-50"
                animate={!isValidated ? {
                    opacity: [0.3, 0.6, 0.3],
                } : {}}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{ filter: 'blur(10px)' }}
            />

            {/* Main Card */}
            <div className={`
        relative rounded-2xl overflow-hidden backdrop-blur-xl
        border transition-all duration-500
        ${isValidated
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/10'
                }
      `}>
                {/* Card Header */}
                <div className="px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono text-[#E2FF00] tracking-[0.2em] uppercase">
                            MISSION #001
                        </span>
                        <div className="flex items-center gap-1 text-neutral-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">5 min</span>
                        </div>
                    </div>

                    <h3 className="text-lg font-black text-white mb-2">
                        Identifier une Fuite
                    </h3>

                    <p className="text-sm text-neutral-400 leading-relaxed">
                        Repère une dépense récurrente que tu pourrais éliminer ou réduire.
                    </p>
                </div>

                {/* Card Stats */}
                <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-[#E2FF00]" />
                            <span className="text-xs text-neutral-400">Difficulté</span>
                            <span className="text-xs font-bold text-white">Facile</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#E2FF00]" />
                        <span className="text-xs font-bold text-[#E2FF00]">+250 XP</span>
                    </div>
                </div>

                {/* Validate Button */}
                <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 -mx-6">
                    <motion.button
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onValidate}
                        disabled={isValidating || isValidated}
                        className={`
              w-full py-4 rounded-xl font-bold font-sans
              flex items-center justify-center gap-2 transition-all border-[3px]
              ${isValidated
                                ? 'bg-emerald-500 text-white border-black'
                                : 'bg-volt text-black border-black shadow-volt-glow-strong'
                            }
            `}
                    >
                        {isValidated ? (
                            <>
                                <Check className="w-5 h-5" />
                                MISSION VALIDÉE
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" fill="currentColor" />
                                VALIDER
                            </>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Particles explosion */}
            <GoldenParticles isActive={isValidating} />
        </motion.div>
    );
};

const GameplayScreen = ({ onNext }) => {
    const [isValidating, setIsValidating] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [showReward, setShowReward] = useState(false);

    const handleValidate = () => {
        if (isValidating || isValidated) return;

        haptic.heavy();
        setIsValidating(true);

        // Trigger explosion
        setTimeout(() => {
            setIsValidating(false);
            setIsValidated(true);
            setShowReward(true);
            haptic.success();
        }, 600);
    };

    const handleContinue = () => {
        haptic.medium();
        onNext();
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
            {/* Subtle background gradient */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 40%, rgba(226, 255, 0, 0.03) 0%, transparent 60%)',
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col px-6 py-12 pb-24">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-[#E2FF00] font-mono text-xs tracking-[0.3em] mb-3"
                    >
                        LA MÉTHODE
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-4xl font-black text-white tracking-tight"
                    >
                        DES MISSIONS, PAS DES TABLEURS.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-neutral-500 mt-3 text-sm max-w-xs mx-auto"
                    >
                        Progressez mission par mission. Gagnez de l'XP, montez en grade et débloquez votre liberté financière,
                        <span className="text-white font-medium"> 5 minutes à la fois</span>.
                    </motion.p>
                </motion.div>

                {/* Mission Card */}
                <div className="flex-1 flex flex-col justify-center items-center">
                    <MissionCard
                        onValidate={handleValidate}
                        isValidating={isValidating}
                        isValidated={isValidated}
                    />

                    {/* XP Reward reveal */}
                    <div className="mt-8 h-24 flex items-center justify-center">
                        <XPReward isVisible={showReward} />
                    </div>
                </div>

                {/* CTA Button - appears after validation */}
                <AnimatePresence>
                    {showReward && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ delay: 0.8, type: 'spring', stiffness: 400, damping: 25 }}
                            className="w-full mt-4"
                        >
                            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 -mx-6">
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleContinue}
                                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-volt-glow-strong border-[3px] border-black transition-all"
                                >
                                    COMMENCER L'AVENTURE
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
                <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
                <div className="w-6 h-2 rounded-full bg-[#E2FF00]" />
            </div>
        </div>
    );
};

export default GameplayScreen;
