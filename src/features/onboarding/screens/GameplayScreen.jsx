/**
 * 🎮 ÉCRAN 3 : LE GAMEPLAY (La Méthode) - VERSION "MONEY SHOT"
 * "DES MISSIONS, PAS DES TABLEURS" - Montrer l'instant de victoire, pas la tâche
 * 
 * Stratégie: Vendre la récompense, pas la mission
 * Visuel: Carte de mission en état "SUCCESS" avec trophée 3D qui sort de la carte
 * Effet: Grosse lueur jaune + chiffres €€€ + XP en évidence
 */

import React from 'react';
import { motion } from 'framer-motion';
import { haptic } from '../../../utils/haptics';
import { Sparkles, Check, Euro } from 'lucide-react';
import trophyAsset from '../../../assets/onboarding-trophy.png';

// Mission Card Component - Version "Grand Chelem" (déjà en état SUCCESS)
const MissionCard = () => {
    return (
        <div className="relative w-full max-w-sm mx-auto">
            {/* Grosse lueur jaune derrière la carte - Statique */}
            <div
                className="absolute -inset-8 rounded-3xl bg-[#E2FF00]/30"
                style={{ filter: 'blur(30px)' }}
            />

            {/* Main Card - État SUCCESS */}
            <div 
                className="relative rounded-2xl overflow-visible backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                }}
            >
                {/* Gradient Overlay (Background aesthetic) */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-0" />
                
                {/* Trophée 3D qui sort de la carte - SEUL ÉLÉMENT ANIMÉ (floating très lent) */}
                <motion.div
                    className="absolute -top-12 -right-12 w-48 h-48 z-20 pointer-events-none"
                    initial={{ scale: 0, y: 0 }}
                    animate={{
                        scale: 1,
                        y: [0, -8, 0],
                    }}
                    transition={{
                        scale: {
                            duration: 0.8,
                            delay: 0.5,
                            type: 'spring',
                            stiffness: 200,
                            damping: 20,
                        },
                        y: {
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 1,
                        },
                    }}
                >
                    <img
                        src={trophyAsset}
                        alt="Trophée"
                        className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(226,255,0,0.9)]"
                    />
                </motion.div>

                {/* Card Header */}
                <div className="px-5 pt-5 pb-4 relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        {/* Halo jaune pour "MISSION ACCOMPLIE" - Statique */}
                        <span 
                            className="text-[10px] font-mono text-[#E2FF00] tracking-[0.2em] uppercase flex items-center gap-2"
                            style={{
                                textShadow: '0 0 15px rgba(226, 255, 0, 0.6)',
                            }}
                        >
                            <Check className="w-3 h-3" />
                            MISSION ACCOMPLIE
                        </span>
                    </div>

                    <h3 className="text-xl font-black text-white mb-1 tracking-tight">
                        MISSION : LA PURGE
                    </h3>
                    <p className="text-sm text-neutral-300">
                        Optimisation des charges fixes
                    </p>
                </div>

                {/* Card Stats - Version "Money Shot" - Épurée, sans boîtes */}
                <div className="px-5 py-4 border-t border-white/5 space-y-4 relative z-10">
                    {/* Gain en argent - Texte statique, sans boîte */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Euro className="w-4 h-4 text-neutral-400" />
                            <span className="text-xs font-mono text-neutral-300 uppercase tracking-wider">GAIN</span>
                        </div>
                        <span className="text-2xl font-black text-[#E2FF00] tracking-tight">
                            +35€ / MOIS
                        </span>
                    </div>

                    {/* Récompense XP - Texte statique, sans boîte */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-neutral-400" />
                            <span className="text-xs font-mono text-neutral-300 uppercase tracking-wider">RÉCOMPENSE</span>
                        </div>
                        <span className="text-2xl font-black text-[#E2FF00] tracking-tight">
                            +250 XP
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GameplayScreen = ({ onNext }) => {
    const handleContinue = () => {
        haptic.heavy();
        onNext();
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
            {/* Background gradient renforcé */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 40%, rgba(226, 255, 0, 0.08) 0%, transparent 60%)',
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col px-6 py-12 pb-24">

                {/* Header - Statique */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                        DES MISSIONS, PAS DES TABLEURS.
                    </h1>
                    <p className="text-neutral-400 mt-3 text-sm max-w-md mx-auto leading-relaxed">
                        Gagnez de l'XP à chaque euro économisé. Transformez votre gestion en jeu de stratégie.
                    </p>
                </div>

                {/* Mission Card - Version "Grand Chelem" */}
                <div className="flex-1 flex flex-col justify-center items-center">
                    <MissionCard />
                </div>

                {/* CTA Button - Statique */}
                <div className="w-full mt-8">
                    <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 -mx-6">
                        <button
                            onClick={handleContinue}
                            className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-volt-glow-strong border-[3px] border-black transition-all active:scale-[0.97]"
                        >
                            CRÉER MON PROFIL AGENT
                        </button>
                    </div>
                </div>
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
