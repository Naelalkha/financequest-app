/**
 * 💔 ÉCRAN 2 : CHOIX DU PAIN POINT
 * L'utilisateur choisit son problème principal → détermine sa première mission
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { haptic } from '../../../utils/haptics';
import { onboardingStore } from '../onboardingStore';
import logoMoniyo from '../../../assets/logo-moniyo.png';

// Import PNG icons
import onboarding5 from '../assets/onboarding5.png';
import onboarding6 from '../assets/onboarding6.png';
import onboarding7 from '../assets/onboarding7.png';
import onboarding8 from '../assets/onboarding8.png';

interface PainPoint {
    id: string;
    iconSrc: string;
    title: string;
    subtitle: string;
    missionId: string;
    missionName: string;
}

const PAIN_POINTS: PainPoint[] = [
    {
        id: 'subscriptions',
        iconSrc: onboarding5,
        title: 'Abonnements oubliés',
        subtitle: 'Netflix, Spotify, apps...',
        missionId: 'cut-subscription',
        missionName: 'LA PURGE',
    },
    {
        id: 'micro',
        iconSrc: onboarding6,
        title: 'Petits plaisirs',
        subtitle: 'Café, vape, uber eats, snacks...',
        missionId: 'micro-expenses',
        missionName: 'DÉTOX EXPRESS',
    },
    {
        id: 'contracts',
        iconSrc: onboarding7,
        title: 'Forfaits négligés',
        subtitle: 'Mobile, box, assurance...',
        missionId: 'micro-expenses',
        missionName: 'RENÉGOCIATION',
    },
    {
        id: 'unknown',
        iconSrc: onboarding8,
        title: 'Honnêtement, je sais pas',
        subtitle: 'On va trouver ensemble',
        missionId: 'micro-expenses',
        missionName: 'LE DIAGNOSTIC',
    },
];

interface OptionCardProps {
    option: PainPoint;
    isSelected: boolean;
    onSelect: (option: PainPoint) => void;
    index: number;
}

const OptionCard: React.FC<OptionCardProps> = ({ option, isSelected, onSelect, index }) => {
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
            style={{
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
            }}
            className={`
        w-full rounded-2xl border text-left
        transition-colors transition-shadow duration-200
        ${isSelected
                    ? 'bg-neutral-900 border-volt shadow-[0_0_20px_rgba(226,255,0,0.2)]'
                    : 'bg-neutral-900 border-neutral-800 active:bg-neutral-800'
                }
      `}
        >
            <div className="px-4 py-3 flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                    <img
                        src={option.iconSrc}
                        alt={option.title}
                        className="w-14 h-14 object-contain transition-opacity opacity-100"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className={`font-sans font-black text-[15px] leading-[1.1] tracking-tight mb-2 ${isSelected ? 'text-volt' : 'text-white'}`}>
                        {option.title}
                    </h3>
                    <p className="font-mono text-[10px] text-neutral-300 font-semibold tracking-wide">
                        {option.subtitle}
                    </p>
                </div>

                <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-all ${isSelected ? 'text-volt translate-x-1' : 'text-neutral-600'}`} />
            </div>
        </motion.button>
    );
};

interface PainPointScreenProps {
    onNext: (option: PainPoint) => void;
    onSkip?: () => void;
}

const PainPointScreen: React.FC<PainPointScreenProps> = ({ onNext, onSkip }) => {
    const [selectedOption, setSelectedOption] = useState<PainPoint | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const handleSelect = (option: PainPoint) => {
        if (isTransitioning) return;

        haptic.medium();
        setSelectedOption(option);
        onboardingStore.setSelectedPainPoint(option.id);
        setIsTransitioning(true);

        setTimeout(() => {
            setIsFadingOut(true);
        }, 300);

        setTimeout(() => {
            haptic.heavy();
            onNext(option);
        }, 600);
    };

    const handleSkip = () => {
        haptic.light();
        onboardingStore.setSelectedPainPoint('unknown');
        onSkip?.();
    };

    return (
        <div className="fixed inset-0 z-[500] bg-transparent flex flex-col items-center p-6 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isFadingOut ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black z-[600] pointer-events-none"
            />

            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] z-0 opacity-50" />

            <div className="w-full flex justify-end relative z-10 pb-2">
                <button
                    onClick={handleSkip}
                    className="text-neutral-600 font-mono text-[10px] uppercase tracking-widest hover:text-white transition-colors pr-2"
                >
                    PASSER
                </button>
            </div>

            <div className="relative z-10 w-full max-w-sm flex-1 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center items-center gap-2 mb-10"
                >
                    <img src={logoMoniyo} alt="Moniyo" className="w-[3.25rem] h-[3.25rem] object-contain" />
                    <span className="text-white font-black text-lg tracking-tight">MONIYO</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="font-sans font-black text-[1.4rem] text-white text-center leading-tight mb-3"
                >
                    C'EST QUOI TON PLUS GROS{' '}
                    <span className="text-volt">MONEY LEAK</span> ?
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="font-mono text-[10px] text-neutral-300 font-normal tracking-wide text-center mb-6"
                >
                    Choisis ce qui te parle le plus. Ta première mission en dépend.
                </motion.p>

                <div className="space-y-3 w-full mb-8">
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

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="font-mono text-[10px] text-neutral-600 text-center mt-0"
                >
                    Tu pourras faire toutes les missions plus tard
                </motion.p>
            </div>
        </div>
    );
};

export default PainPointScreen;
