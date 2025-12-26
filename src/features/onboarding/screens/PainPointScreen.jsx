/**
 * 💔 ÉCRAN 2 : CHOIX DU PAIN POINT
 * L'utilisateur choisit son problème principal → détermine sa première mission
 * 
 * Options:
 * - Abos inutilisés → Mission "LA PURGE" (cut-subscription)
 * - Micro-dépenses → Mission "DÉTOX EXPRESS" (micro-expenses)
 * - Forfaits non optimisés → Mission "RENÉGOCIATION" (renegotiation)
 * - Je sais pas → Mission "LE DIAGNOSTIC" (micro-expenses fallback)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tv, Coffee, Smartphone, HelpCircle, ChevronRight } from 'lucide-react';
import { haptic } from '../../../utils/haptics';
import { onboardingStore } from '../onboardingStore';
import logoMoniyo from '../../../assets/logo-moniyo.png';

// Pain point options with their corresponding missions
const PAIN_POINTS = [
    {
        id: 'subscriptions',
        icon: Tv,
        title: "Des abos que j'utilise à peine",
        subtitle: 'Netflix, Spotify, salle de sport, apps...',
        missionId: 'cut-subscription',
        missionName: 'LA PURGE',
    },
    {
        id: 'micro',
        icon: Coffee,
        title: 'Des petits plaisirs quotidiens',
        subtitle: 'Café, clopes, Uber Eats, snacks...',
        missionId: 'micro-expenses',
        missionName: 'DÉTOX EXPRESS',
    },
    {
        id: 'contracts',
        icon: Smartphone,
        title: 'Des forfaits jamais renégociés',
        subtitle: 'Mobile, box internet, assurance...',
        missionId: 'micro-expenses', // Fallback until renegotiation quest exists
        missionName: 'RENÉGOCIATION',
    },
    {
        id: 'unknown',
        icon: HelpCircle,
        title: 'Honnêtement, je sais pas',
        subtitle: 'On va trouver ensemble',
        missionId: 'micro-expenses',
        missionName: 'LE DIAGNOSTIC',
    },
];

// Single option card component - using quest card design style
const OptionCard = ({ option, isSelected, onSelect, index }) => {
    const Icon = option.icon;

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: 0.3 + index * 0.1,
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option)}
            className={`
                w-full rounded-2xl border transition-all text-left
                ${isSelected
                    ? 'bg-neutral-900 border-volt shadow-[0_0_20px_rgba(226,255,0,0.2)]'
                    : 'bg-neutral-900 border-neutral-800 active:bg-neutral-800'
                }
            `}
        >
            <div className="px-4 py-3 flex items-center gap-4">
                {/* Icon container */}
                <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isSelected
                        ? 'bg-volt text-black'
                        : 'bg-neutral-800 text-neutral-400'
                    }
                `}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-black' : 'text-neutral-400'}`} />
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                    <h3 className={`font-sans font-bold text-sm leading-tight mb-1 ${isSelected ? 'text-volt' : 'text-white'}`}>
                        {option.title}
                    </h3>
                    <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-wide truncate">
                        {option.subtitle}
                    </p>
                </div>

                {/* Arrow */}
                <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-all ${isSelected ? 'text-volt translate-x-1' : 'text-neutral-600'}`} />
            </div>
        </motion.button>
    );
};

const PainPointScreen = ({ onNext, onSkip }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleSelect = (option) => {
        if (isTransitioning) return;

        haptic.medium();
        setSelectedOption(option);

        // Save selection to store
        onboardingStore.setSelectedPainPoint(option.id);

        // Auto-continue after brief delay
        setIsTransitioning(true);
        setTimeout(() => {
            haptic.heavy();
            onNext(option);
        }, 400);
    };

    const handleSkip = () => {
        haptic.light();
        // Default to micro-expenses if skipping
        onboardingStore.setSelectedPainPoint('unknown');
        onSkip?.();
    };

    return (
        <div className="fixed inset-0 z-[500] bg-transparent flex flex-col items-center p-6 overflow-hidden">
            {/* Background Grid - same as Screen 1 */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] z-0 opacity-40" />

            {/* Header - PASSER button same style as Screen 1 */}
            <div className="w-full flex justify-end relative z-10 pb-2">
                <button
                    onClick={handleSkip}
                    className="text-neutral-600 font-mono text-[10px] uppercase tracking-widest hover:text-white transition-colors pr-2"
                >
                    PASSER
                </button>
            </div>

            {/* Main content */}
            <div className="relative z-10 w-full max-w-sm flex-1 flex flex-col items-center justify-center">
                
                {/* Logo - appears on Screen 2 */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center items-center gap-2 mb-8"
                >
                    <img src={logoMoniyo} alt="Moniyo" className="w-7 h-7 object-contain" />
                    <span className="text-white font-black text-lg tracking-tight">MONIYO</span>
                </motion.div>

                {/* Title - same font style as Screen 1 */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="font-sans font-black text-[1.4rem] text-white text-center leading-tight mb-3"
                >
                    C'EST QUOI TON PLUS GROS{' '}
                    <span className="text-volt">MONEY LEAK</span> ?
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="font-mono text-[10px] text-neutral-500 uppercase tracking-wide text-center mb-8"
                >
                    Choisis ce qui te parle le plus. Ta première mission en dépend.
                </motion.p>

                {/* Options */}
                <div className="space-y-3 w-full">
                    {PAIN_POINTS.map((option, index) => (
                        <OptionCard
                            key={option.id}
                            option={option}
                            isSelected={selectedOption?.id === option.id}
                            onSelect={handleSelect}
                            index={index}
                        />
                    ))}
                </div>

                {/* Bottom note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="font-mono text-[10px] text-neutral-600 text-center mt-8"
                >
                    Tu pourras faire toutes les missions plus tard
                </motion.p>
            </div>
        </div>
    );
};

export default PainPointScreen;
