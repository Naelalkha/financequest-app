/**
 * 🎯 ÉCRAN 2 : CALIBRATION STRATÉGIQUE
 * "CHOISIS TON VECTEUR D'ATTAQUE" - Sélection de l'archétype financier
 * 
 * Remplace l'approche micro-dépense par une vision stratégique globale
 * L'utilisateur choisit son "levier de progression" principal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import { haptic } from '../../../utils/haptics';
import { onboardingStore } from '../onboardingStore';
import { STRATEGIES, formatCurrency } from '../strategyData';

const StrategyCard = ({ strategy, isSelected, onSelect, index }) => {
    const Icon = strategy.icon;

    return (
        <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1, type: 'spring', stiffness: 300 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className={`
        relative w-full p-5 rounded-2xl text-left
        border-2 transition-all duration-300
        ${isSelected
                    ? 'border-[#E2FF00] bg-white/5 shadow-[0_0_30px_rgba(226,255,0,0.15)]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                }
      `}
        >
            {/* Selection glow */}
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                            background: `radial-gradient(ellipse at 50% 0%, ${strategy.color}20 0%, transparent 70%)`,
                        }}
                    />
                )}
            </AnimatePresence>

            <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div
                    className={`
            w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
            transition-all duration-300
            ${isSelected ? 'bg-[#E2FF00]/20' : 'bg-white/5'}
          `}
                >
                    <Icon
                        className={`w-7 h-7 transition-colors duration-300 ${isSelected ? 'text-[#E2FF00]' : 'text-neutral-400'}`}
                        strokeWidth={2}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className={`
            font-black text-base tracking-wide mb-1 transition-colors duration-300
            ${isSelected ? 'text-white' : 'text-neutral-300'}
          `}>
                        {strategy.title}
                    </h3>
                    <p className="text-neutral-500 text-sm leading-snug mb-3">
                        {strategy.subtitle}
                    </p>

                    {/* Quick impact preview */}
                    <div className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono
            transition-all duration-300
            ${isSelected
                            ? 'bg-[#E2FF00]/10 text-[#E2FF00]'
                            : 'bg-white/5 text-neutral-500'
                        }
          `}>
                        <span>POTENTIEL</span>
                        <span className="font-bold">+{formatCurrency(strategy.impactMonthly)} €/mois</span>
                    </div>
                </div>

                {/* Selection indicator */}
                <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1
          transition-all duration-300
          ${isSelected
                        ? 'border-[#E2FF00] bg-[#E2FF00]'
                        : 'border-white/20 bg-transparent'
                    }
        `}>
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-black"
                        />
                    )}
                </div>
            </div>
        </motion.button>
    );
};

const StrategyCalibrationScreen = ({ onNext }) => {
    const [selectedId, setSelectedId] = useState(null);

    const handleSelect = (strategyId) => {
        haptic.light();
        setSelectedId(strategyId);
        onboardingStore.setSelectedStrategy(strategyId);
    };

    const handleContinue = () => {
        if (!selectedId) return;
        haptic.medium();
        onNext();
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
            {/* Subtle top gradient */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(226, 255, 0, 0.03) 0%, transparent 50%)',
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
                        transition={{ delay: 0.1 }}
                        className="text-[#E2FF00] font-mono text-xs tracking-[0.3em] mb-3"
                    >
                        CALIBRATION STRATÉGIQUE
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-4xl font-black text-white tracking-tight"
                    >
                        CHOISIS TON VECTEUR
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-neutral-500 mt-3 text-sm max-w-xs mx-auto"
                    >
                        Identifie ton levier de croissance prioritaire.
                    </motion.p>
                </motion.div>

                {/* Strategy cards */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="space-y-4 max-w-md mx-auto w-full">
                        {STRATEGIES.map((strategy, index) => (
                            <StrategyCard
                                key={strategy.id}
                                strategy={strategy}
                                index={index}
                                isSelected={selectedId === strategy.id}
                                onSelect={() => handleSelect(strategy.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8"
                >
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleContinue}
                        disabled={!selectedId}
                        className={`
              w-full max-w-md mx-auto py-4 px-8 rounded-xl 
              font-black uppercase tracking-wider text-base 
              flex items-center justify-center gap-3
              transition-all duration-300
              ${selectedId
                                ? 'bg-[#E2FF00] text-black shadow-[0_0_30px_rgba(226,255,0,0.3)] hover:shadow-[0_0_50px_rgba(226,255,0,0.5)]'
                                : 'bg-white/10 text-neutral-500 cursor-not-allowed'
                            }
            `}
                    >
                        <Crosshair className="w-5 h-5" />
                        ANALYSER LE POTENTIEL
                    </motion.button>
                </motion.div>
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
                <div className="w-6 h-2 rounded-full bg-[#E2FF00]" />
                <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
                <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
                <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
            </div>
        </div>
    );
};

export default StrategyCalibrationScreen;
