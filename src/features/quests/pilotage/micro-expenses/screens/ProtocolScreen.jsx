import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, Zap, ArrowRight } from 'lucide-react';
import secretDirectoryAsset from '../../../../../assets/secret-directory.png';
import { socialProofSlides, proTips } from '../insightData';
import { haptic } from '../../../../../utils/haptics';

/**
 * ProtocolScreen - Phase 1: Intel + Tactics
 * 
 * OPTIMIZED VERSION:
 * - Image integrated in card (top-right, transparent)
 * - Auto-sliding carousel with visible arrows
 * - Visible timeline connector between steps
 * - All steps treated equally (no "key" badge)
 * - Motivational message before final CTA
 */

const ProtocolScreen = ({ onNext, page, setPage }) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Get localized content
    const slides = socialProofSlides[locale] || socialProofSlides.fr;
    const tips = proTips[locale] || proTips.fr;

    // Carousel state
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const currentSlide = slides[currentSlideIndex];

    // Auto-slide every 5 seconds
    useEffect(() => {
        if (page !== 0) return;
        
        const timer = setInterval(() => {
            setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        
        return () => clearInterval(timer);
    }, [page, slides.length]);

    // Carousel navigation
    const nextSlide = () => {
        haptic.light();
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    };
    const prevSlide = () => {
        haptic.light();
        setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    // Page navigation
    const goToMethod = () => {
        haptic.medium();
        setPage(1);
    };

    // Launch mission
    const handleLaunch = () => {
        haptic.heavy();
        onNext();
    };

    // Helper to render bold text
    const renderWithBold = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="text-white font-semibold">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    // Labels
    const labels = {
        fr: {
            // Page 1
            contextTitle: 'CONTEXTE',
            contextSubtitle: 'Comprendre le problème',
            hookLabel: 'LE PROBLÈME',
            hook: "Tu surveilles les gros virements, mais tu ignores la petite monnaie.",
            hookHighlight: "L'ennemi n'est pas le montant, c'est la fréquence.",
            statLabel: 'LA RÉALITÉ',
            contextCta: 'VOIR LE PROTOCOLE',
            
            // Page 2
            methodTitle: 'MÉTHODE',
            methodSubtitle: '3 étapes pour reprendre le contrôle',
            methodCta: 'LANCER LA MISSION'
        },
        en: {
            contextTitle: 'CONTEXT',
            contextSubtitle: 'Understanding the problem',
            hookLabel: 'THE PROBLEM',
            hook: "You watch the big transfers, but ignore the loose change.",
            hookHighlight: "The enemy isn't the amount, it's the frequency.",
            statLabel: 'THE REALITY',
            contextCta: 'SEE THE PROTOCOL',
            methodTitle: 'METHOD',
            methodSubtitle: '3 steps to take back control',
            methodCta: 'LAUNCH MISSION'
        }
    };
    const L = labels[locale] || labels.fr;

    // ═══════════════════════════════════════════════════════════════
    // PAGE 0: LE CONTEXTE (Optimized Layout)
    // ═══════════════════════════════════════════════════════════════
    if (page === 0) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col gap-4 p-6 pt-2 pb-32">
                        
                        {/* ===== CARD 1: THE PROBLEM ===== */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
                            
                            {/* Dossier image - integrated top-right, LARGER + MORE VISIBLE */}
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-44 h-44 opacity-50 pointer-events-none">
                                <img 
                                    src={secretDirectoryAsset} 
                                    alt="" 
                                    className="w-full h-full object-contain drop-shadow-lg" 
                                />
                            </div>
                            
                            {/* Content */}
                            <div className="relative z-10">
                                {/* Label */}
                                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wide mb-4 block">
                                    {L.hookLabel}
                                </span>
                                
                                {/* Hook quote */}
                                <h3 className="font-sans font-medium text-lg md:text-xl text-white leading-relaxed max-w-[80%]">
                                    "{L.hook}"
                                </h3>
                                
                                {/* Punch line */}
                                <p className="text-volt font-bold text-sm mt-4">
                                    {L.hookHighlight}
                                </p>
                            </div>
                        </div>

                        {/* ===== CARD 2: STATS CAROUSEL ===== */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl px-6 py-8 relative overflow-hidden">
                            
                            {/* Subtle pattern */}
                            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                            
                            {/* Header */}
                            <div className="relative z-10 flex justify-between items-center mb-6">
                                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wide">
                                    {L.statLabel}
                                </span>
                                {/* Progress dots */}
                                <div className="flex gap-1.5">
                                    {slides.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSlideIndex(idx)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                idx === currentSlideIndex 
                                                    ? 'w-5 bg-volt' 
                                                    : 'w-1.5 bg-neutral-700'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Carousel Content - Fixed height to prevent arrow movement */}
                            <div className="relative flex items-center justify-between h-[130px]">
                                {/* Left Arrow */}
                                <button 
                                    onClick={prevSlide} 
                                    className="p-2 -ml-1 text-neutral-500 active:scale-90 active:text-white transition-all flex-shrink-0"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>

                                {/* Content */}
                                <div className="flex-1 px-4 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentSlideIndex}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-center"
                                        >
                                            <h3 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                                                {currentSlide.stat}
                                            </h3>
                                            <p className="text-xs text-neutral-400 leading-relaxed max-w-[200px] mx-auto">
                                                {currentSlide.text}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Right Arrow */}
                                <button 
                                    onClick={nextSlide} 
                                    className="p-2 -mr-1 text-neutral-500 active:scale-90 active:text-white transition-all flex-shrink-0"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer CTA */}
                <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={goToMethod}
                        className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,255,0,0.3)] transition-all"
                    >
                        {L.contextCta} <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // PAGE 1: LA MÉTHODE
    // ═══════════════════════════════════════════════════════════════
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 pt-2 pb-32">

                    {/* ===== STACK OF CARDS ===== */}
                    <div className="space-y-3">
                        {tips.map((tip, index) => (
                            <motion.div
                                key={tip.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex gap-4 items-start"
                            >
                                {/* Number Circle - Larger with volt accent */}
                                <div className="w-10 h-10 rounded-full border-2 border-volt/40 bg-neutral-950 flex items-center justify-center flex-shrink-0 font-mono text-sm font-bold text-white">
                                    {index + 1}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-1">
<h4 className="font-mono text-sm text-white font-bold uppercase mb-2 tracking-wide">
                                                        {tip.title}
                                                    </h4>
                                    
                                    <p className="text-[15px] text-neutral-400 font-sans leading-relaxed">
                                        {renderWithBold(tip.body)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Footer CTA */}
            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLaunch}
                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,255,0,0.3)] transition-all"
                >
                    <Zap className="w-5 h-5 fill-current" />
                    {L.methodCta}
                </motion.button>
            </div>
        </div>
    );
};

export default ProtocolScreen;
