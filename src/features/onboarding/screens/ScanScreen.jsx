/**
 * 🔍 ÉCRAN 1 : LE SCAN
 * Hook émotionnel - Révèle les pertes d'argent des Français avec animation scan
 * 
 * Flow:
 * 1. Badge "DIAGNOSTIC EN COURS" avec point pulsant
 * 2. Ligne de scan descend progressivement
 * 3. Révèle 4 stats (abos, frais bancaires, assurances, forfaits)
 * 4. Total animé : 1 128€/an
 * 5. CTA : "LANCER MON DIAGNOSTIC"
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Monitor, Building2, Shield, Smartphone } from 'lucide-react';
import { haptic } from '../../../utils/haptics';

// Stats data
const SCAN_STATS = [
    {
        id: 'subscriptions',
        icon: Monitor,
        title: 'Abonnements oubliés',
        stat: '89% concernés',
        amount: '~29€',
        period: '/mois',
    },
    {
        id: 'banking',
        icon: Building2,
        title: 'Frais bancaires évitables',
        stat: '72% payent trop',
        amount: '~15€',
        period: '/mois',
    },
    {
        id: 'insurance',
        icon: Shield,
        title: 'Assurances sur-cotées',
        stat: "65% n'ont jamais comparé",
        amount: '~38€',
        period: '/mois',
    },
    {
        id: 'contracts',
        icon: Smartphone,
        title: 'Forfaits non optimisés',
        stat: '58% payent plus que nécessaire',
        amount: '~12€',
        period: '/mois',
    },
];

const TOTAL_ANNUAL = 1128;

// Animated counter component - very fast for instant feel
const AnimatedCounter = ({ value, duration = 0.3, instant = false }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (instant) {
            setDisplayValue(value);
            return;
        }

        let startTime;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

            // Easing function (ease-out)
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

    return (
        <span>{displayValue.toLocaleString('fr-FR')}</span>
    );
};

// IntelCard component - using quest card design style
const IntelCard = ({ item, isActive, index }) => {
    const Icon = item.icon;
    // Card starts at low opacity (0.15), goes to full when activeItems >= index
    const isActiveCard = isActive;

    return (
        <div 
            className={`
                flex items-center justify-between rounded-2xl border transition-all duration-300
                ${isActiveCard 
                    ? 'bg-neutral-900 border-neutral-800 opacity-100' 
                    : 'bg-neutral-900 border-neutral-800 opacity-[0.15]'
                }
            `}
        >
            <div className="px-4 py-3 flex items-center gap-4 flex-1 min-w-0">
                {/* Icon container */}
                <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                    ${isActiveCard 
                        ? 'bg-neutral-800 text-white' 
                        : 'bg-neutral-800/20 text-neutral-700'
                    }
                `}>
                    <Icon className={`w-5 h-5 ${isActiveCard ? 'text-white' : 'text-neutral-700'}`} />
                </div>

                {/* Text content */}
                <div className="text-left flex-1 min-w-0">
                    <h4 className="font-sans font-bold text-sm text-white leading-none mb-1">
                        {item.title}
                    </h4>
                    <div className={`transition-all duration-500 origin-left ${isActiveCard ? 'opacity-100' : 'opacity-50'}`}>
                        <p className="font-mono text-[10px] text-neutral-500 font-black uppercase tracking-wide">
                            {item.stat}
                        </p>
                    </div>
                </div>
            </div>

            {/* Amount section */}
            <div className="text-right flex-shrink-0 px-4 py-3 flex flex-col items-end">
                <span className={`font-mono text-xs font-black transition-colors ${isActiveCard ? 'text-volt' : 'text-neutral-700'}`}>
                    {item.amount}
                </span>
                <span className={`font-mono text-[10px] transition-colors ${isActiveCard ? 'text-neutral-500' : 'text-neutral-700'}`}>
                    {item.period}
                </span>
            </div>
        </div>
    );
};

const ScanScreen = ({ onNext, onSkip }) => {
    const [activeItems, setActiveItems] = useState(-1);
    const [shouldPulse, setShouldPulse] = useState(false);

    // Progressive Reveal Sequence (250ms interval) - same as template
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
                // Pulse starts after 2s total (1800ms + 200ms delay)
                setTimeout(() => {
                    setShouldPulse(true);
                }, 200);
            }, 1800), // Reveal total and CTA
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
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] z-0 opacity-40"></div>

            {/* Header Pass */}
            <div className="w-full flex justify-end relative z-10 pb-2">
                <button 
                    onClick={handleSkip}
                    className="text-neutral-600 font-mono text-[10px] uppercase tracking-widest hover:text-white transition-colors pr-2"
                >
                    PASSER
                </button>
            </div>

            <div className="relative z-10 w-full max-w-sm flex-1 flex flex-col items-center justify-center pb-24">
                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="font-sans font-black text-[1.4rem] text-white text-center leading-tight mb-8"
                >
                    CHAQUE MOIS, LES FRANÇAIS PERDENT DE L'ARGENT
                </motion.h1>

                {/* Cards Grid - All rendered initially with low opacity */}
                <div className="space-y-3 w-full mb-12">
                    {SCAN_STATS.map((item, i) => (
                        <IntelCard
                            key={item.id}
                            item={item}
                            isActive={activeItems >= i}
                            index={i}
                        />
                    ))}
                </div>

                {/* Total Area Impact */}
                <div className={`text-center transition-all duration-700 w-full ${activeItems >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.3em] mb-2">
                        EN MOYENNE, ÇA REPRÉSENTE
                    </div>
                    <h2 className="text-6xl font-black text-volt tracking-tighter mb-2 text-glow-volt animate-pulse">
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
                    
                    {/* Pivot */}
                    <h3 className="font-sans font-black text-xl text-white mb-8 italic">
                        Et toi, combien tu perds ?
                    </h3>
                </div>
            </div>

            {/* Footer CTA - Same as other screens */}
            <AnimatePresence>
                {activeItems >= 4 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
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
                            className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-volt-glow-strong border-[3px] border-black transition-all"
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
