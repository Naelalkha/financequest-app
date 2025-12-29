/**
 * 🔍 ÉCRAN 1 : LE SCAN
 * Hook émotionnel - Révèle les pertes d'argent des Français avec animation scan
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { haptic } from '../../../utils/haptics';

// Import PNG icons
import onboarding1 from '../assets/onboarding1.png';
import onboarding2 from '../assets/onboarding2.png';
import onboarding3 from '../assets/onboarding3.png';
import onboarding4 from '../assets/onboarding4.png';

interface ScanStat {
    id: string;
    iconSrc: string;
    title: string;
    stat: string;
    amount: string;
    period: string;
}

// Stats data
const SCAN_STATS: ScanStat[] = [
    {
        id: 'subscriptions',
        iconSrc: onboarding1,
        title: 'Abonnements oubliés',
        stat: '89% concernés',
        amount: '~29€',
        period: '/mois',
    },
    {
        id: 'banking',
        iconSrc: onboarding2,
        title: 'Frais bancaires évitables',
        stat: '72% payent trop',
        amount: '~15€',
        period: '/mois',
    },
    {
        id: 'insurance',
        iconSrc: onboarding3,
        title: 'Assurances sur-cotées',
        stat: "65% n'ont jamais comparé",
        amount: '~38€',
        period: '/mois',
    },
    {
        id: 'contracts',
        iconSrc: onboarding4,
        title: 'Forfaits non optimisés',
        stat: '58% payent plus que nécessaire',
        amount: '~12€',
        period: '/mois',
    },
];

const TOTAL_ANNUAL = 1128;

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    instant?: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    duration = 0.3,
    instant = false
}) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (instant) {
            setDisplayValue(value);
            return;
        }

        let startTime: number | undefined;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(eased * value));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setDisplayValue(value);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration, instant]);

    return <span>{displayValue.toLocaleString('fr-FR')}</span>;
};

interface IntelCardProps {
    item: ScanStat;
    isActive: boolean;
    index: number;
}

const IntelCard: React.FC<IntelCardProps> = ({ item, isActive }) => {
    return (
        <div
            className={`
        flex items-center justify-between rounded-2xl border transition-all duration-300
        ${isActive
                    ? 'bg-neutral-900 border-neutral-800 opacity-100'
                    : 'bg-neutral-900 border-neutral-800 opacity-[0.15]'
                }
      `}
        >
            <div className="px-4 py-3 flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                    <img
                        src={item.iconSrc}
                        alt={item.title}
                        className={`w-14 h-14 object-contain transition-opacity ${isActive ? 'opacity-100' : 'opacity-50'}`}
                    />
                </div>

                <div className="text-left flex-1 min-w-0">
                    <h4 className="font-sans font-bold text-sm text-white leading-none mb-2">
                        {item.title}
                    </h4>
                    <div className={`transition-all duration-500 origin-left ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                        <p className="font-mono text-[10px] text-neutral-300 font-normal tracking-wide">
                            {item.stat}
                        </p>
                    </div>
                </div>
            </div>

            <div className="text-right flex-shrink-0 px-4 py-3 flex flex-col items-end">
                <span className={`font-mono text-xs font-black transition-colors ${isActive ? 'text-volt' : 'text-neutral-700'}`}>
                    {item.amount}
                </span>
                <span className={`font-mono text-[10px] transition-colors ${isActive ? 'text-neutral-500' : 'text-neutral-700'}`}>
                    {item.period}
                </span>
            </div>
        </div>
    );
};

interface ScanScreenProps {
    onNext: () => void;
    onSkip?: () => void;
}

const ScanScreen: React.FC<ScanScreenProps> = ({ onNext, onSkip }) => {
    const [activeItems, setActiveItems] = useState(-1);
    const [shouldPulse, setShouldPulse] = useState(false);

    useEffect(() => {
        const intervalTime = 250;
        const sequence = [
            setTimeout(() => {
                setActiveItems(0);
                haptic.light();
            }, 400),
            setTimeout(() => {
                setActiveItems(1);
                haptic.light();
            }, 400 + intervalTime),
            setTimeout(() => {
                setActiveItems(2);
                haptic.light();
            }, 400 + (intervalTime * 2)),
            setTimeout(() => {
                setActiveItems(3);
                haptic.light();
            }, 400 + (intervalTime * 3)),
            setTimeout(() => {
                setActiveItems(4);
                haptic.medium();
                setTimeout(() => {
                    setShouldPulse(true);
                }, 200);
            }, 1800),
        ];
        return () => sequence.forEach(clearTimeout);
    }, []);

    const handleContinue = () => {
        haptic.heavy();
        onNext();
    };

    const handleSkip = () => {
        haptic.light();
        onSkip?.();
    };

    return (
        <div className="fixed inset-0 z-[500] bg-transparent flex flex-col items-center p-6 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] z-0 opacity-50" />

            <div className="w-full flex justify-end relative z-10 pb-2">
                <button
                    onClick={handleSkip}
                    className="text-neutral-600 font-mono text-[10px] uppercase tracking-widest hover:text-white transition-colors pr-2"
                >
                    PASSER
                </button>
            </div>

            <div className="relative z-10 w-full max-w-sm flex-1 flex flex-col items-center justify-center pb-24">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="font-sans font-black text-[1.4rem] text-white text-center leading-tight mb-8"
                >
                    CHAQUE MOIS, LES FRANÇAIS PERDENT DE L'ARGENT
                </motion.h1>

                <div className="space-y-3 w-full mb-8">
                    {SCAN_STATS.map((item, i) => (
                        <IntelCard
                            key={item.id}
                            item={item}
                            isActive={activeItems >= i}
                            index={i}
                        />
                    ))}
                </div>

                <div className={`text-center transition-all duration-700 w-full ${activeItems >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="font-mono text-[10px] text-neutral-300 uppercase tracking-[0.3em] mb-2">
                        EN MOYENNE, ÇA REPRÉSENTE
                    </div>
                    <h2 className="text-6xl font-black text-volt tracking-tighter mb-2 animate-glow-pulse">
                        {activeItems >= 4 ? (
                            <>
                                <AnimatedCounter value={TOTAL_ANNUAL} duration={0.3} instant={false} />
                                €/an
                            </>
                        ) : (
                            '0€/an'
                        )}
                    </h2>
                    <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.1em] mb-8">
                        d'argent récupérable
                    </div>

                    <h3 className="font-sans font-black text-xl text-white mb-6 italic">
                        Et toi, combien tu perds ?
                    </h3>
                </div>
            </div>

            <AnimatePresence>
                {activeItems >= 4 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            transform: 'translateZ(0)',
                            WebkitTransform: 'translateZ(0)',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                        }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 bg-black/90 backdrop-blur-sm border-t border-neutral-800"
                    >
                        <motion.button
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{
                                opacity: 1,
                                scale: shouldPulse ? [1, 1.02, 1] : 1
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                                scale: shouldPulse ? {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                } : undefined
                            }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleContinue}
                            style={{
                                transform: 'translateZ(0)',
                                WebkitTransform: 'translateZ(0)',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                willChange: 'transform',
                            }}
                            className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-volt-glow-strong border-[3px] border-black"
                        >
                            <Zap className="w-5 h-5" />
                            LANCER MON DIAGNOSTIC
                        </motion.button>
                        <p className="text-center text-neutral-600 text-[10px] font-mono tracking-wide mt-3">
                            Gratuit • 2 min • Sans compte bancaire
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ScanScreen;
