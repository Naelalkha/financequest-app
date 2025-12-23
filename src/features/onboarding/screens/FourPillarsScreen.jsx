/**
 * 🎯 ÉCRAN 2 : LA STRATÉGIE (Les 4 Piliers)
 * "UNE COUVERTURE TOTALE" - Montre que l'app gère TOUT
 * 
 * Animation: 4 icônes qui s'allument une par une avec pulse effect
 * Message: Du budget quotidien à l'investissement long terme
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '../../../utils/haptics';
import { ChevronRight } from 'lucide-react';

// Import PNG Assets
import pilotageIcon from '../../../assets/credit-card.png';
import defenseIcon from '../../../assets/vault.png';
import growthIcon from '../../../assets/coins.png';
import strategyIcon from '../../../assets/chess.png';

// The 4 pillars of financial mastery
const PILLARS = [
    {
        id: 'pilotage',
        image: pilotageIcon,
        title: 'PILOTAGE',
        subtitle: 'BUDGET & CASHFLOW',
        color: '#E2FF00',
        description: 'Maîtrise ton cash-flow quotidien'
    },
    {
        id: 'defense',
        image: defenseIcon,
        title: 'DÉFENSE',
        subtitle: 'ÉPARGNE & SÉCURITÉ',
        color: '#22D3EE',
        description: 'Protège ton capital'
    },
    {
        id: 'croissance',
        image: growthIcon,
        title: 'CROISSANCE',
        subtitle: 'INVESTISSEMENT & REVENUS',
        color: '#A855F7',
        description: 'Fais fructifier ton argent'
    },
    {
        id: 'strategie',
        image: strategyIcon,
        title: 'STRATÉGIE',
        subtitle: 'PATRIMOINE & LONG TERME',
        color: '#F97316',
        description: 'Développe ta vision long terme'
    },
];

const PillarCard = ({ pillar, index, isRevealed }) => {
    // Different rotation angles for each card to add dynamism
    const rotations = [-8, 5, -6, 7];
    const rotation = rotations[index] || 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
                opacity: isRevealed ? 1 : 0,
                scale: isRevealed ? 1 : 0.8,
                y: isRevealed ? 0 : 20
            }}
            transition={{
                duration: 0.5,
                delay: index * 0.15,
                type: 'spring',
                stiffness: 300,
                damping: 20
            }}
            className="relative"
        >
            {/* Card - Tactical Glass */}
            <div
                className="relative p-4 rounded-2xl border border-[#333] backdrop-blur-md overflow-hidden"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                }}
            >
                {/* Gradient Overlay (Background aesthetic) */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-0" />

                {/* 3D Asset - Large, cropped, positioned right, dynamic (150%+ zoom) */}
                <motion.div
                    className="absolute right-[-1.2rem] bottom-[-1.2rem] w-24 h-24 z-0 pointer-events-none"
                    animate={{
                        rotate: [rotation, rotation + 2, rotation],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <img
                        src={pillar.image}
                        alt={pillar.title}
                        className="w-full h-full object-contain opacity-95 drop-shadow-xl"
                    />
                </motion.div>

                {/* Text Info - Left aligned, bottom positioned */}
                <div className="relative z-20 flex flex-col justify-end h-full min-h-[80px]">
                    <h3 className="font-sans font-bold text-white text-sm tracking-tight uppercase drop-shadow-lg whitespace-nowrap mb-1">
                        {pillar.title}
                    </h3>
                    <span className="font-mono text-[9px] text-neutral-300 uppercase bg-black/70 backdrop-blur-sm py-0.5 pr-1.5 rounded leading-tight inline-block w-fit">
                        {pillar.subtitle}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

const FourPillarsScreen = ({ onNext }) => {
    const [revealedCount, setRevealedCount] = useState(0);
    const [allRevealed, setAllRevealed] = useState(false);

    // Sequential reveal animation
    useEffect(() => {
        const revealInterval = setInterval(() => {
            setRevealedCount(prev => {
                if (prev < PILLARS.length) {
                    haptic.light();
                    return prev + 1;
                }
                return prev;
            });
        }, 400); // 400ms between each reveal

        return () => clearInterval(revealInterval);
    }, []);

    // After all revealed, show CTA
    useEffect(() => {
        if (revealedCount >= PILLARS.length) {
            setTimeout(() => {
                setAllRevealed(true);
                haptic.medium();
            }, 300);
        }
    }, [revealedCount]);

    const handleContinue = () => {
        haptic.heavy();
        setTimeout(() => {
            onNext();
        }, 100);
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
            {/* Subtle background gradient */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(226, 255, 0, 0.03) 0%, transparent 50%)',
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
                        SYSTÈME COMPLET
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-4xl font-black text-white tracking-tight"
                    >
                        UNE COUVERTURE TOTALE.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-neutral-500 mt-3 text-sm max-w-xs mx-auto"
                    >
                        Du budget quotidien à l'investissement long terme via une interface unique.
                    </motion.p>
                </motion.div>

                {/* Pillars Grid - 2x2 */}
                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <div className="grid grid-cols-2 gap-3">
                        {PILLARS.map((pillar, index) => (
                            <PillarCard
                                key={pillar.id}
                                pillar={pillar}
                                index={index}
                                isRevealed={revealedCount > index}
                            />
                        ))}
                    </div>
                </div>

                {/* CTA Button */}
                <AnimatePresence>
                    {allRevealed && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 25 }}
                            className="w-full"
                        >
                            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 -mx-6 mt-8">
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleContinue}
                                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-volt-glow-strong border-[3px] border-black transition-all"
                                >
                                    VOIR LA MÉTHODE
                                    <ChevronRight className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
                <div className="w-6 h-2 rounded-full bg-[#E2FF00]" />
                <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
            </div>
        </div>
    );
};

export default FourPillarsScreen;
