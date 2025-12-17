import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, Zap, ArrowRight, Clock, RefreshCw } from 'lucide-react';
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
 * - Smooth page transitions
 */

const IconMap = {
    Zap: Zap,
    Clock: Clock,
    RefreshCw: RefreshCw
};

// Page transition variants
const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
};

const pageTransition = {
    type: 'tween',
    duration: 0.25,
    ease: [0.25, 0.1, 0.25, 1]
};

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
    // RENDER
    // ═══════════════════════════════════════════════════════════════
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {page === 0 ? (
                        // ═══════════════════════════════════════════════════════════════
                        // PAGE 0: LE CONTEXTE
                        // ═══════════════════════════════════════════════════════════════
                        <motion.div
                            key="context-page"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={pageTransition}
                            className="h-full overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex flex-col gap-4 p-6 pt-2 pb-32">
                                
                                {/* ===== CARD 1: THE PROBLEM ===== */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden"
                                >
                                    
                                    {/* Dossier image - corner top-right, slightly cropped for integration effect */}
                                    <div className="absolute -right-6 -top-6 w-36 h-36 opacity-40 pointer-events-none">
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
                                        <h3 className="font-sans font-semibold text-lg md:text-xl text-white leading-relaxed max-w-[80%]">
                                            "{L.hook}"
                                        </h3>
                                        
                                        {/* Punch line */}
                                        <p className="text-volt font-bold text-sm mt-4">
                                            {L.hookHighlight}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* ===== CARD 2: STATS CAROUSEL ===== */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.3 }}
                                    className="bg-[#0A0A0A] border border-white/10 rounded-2xl px-6 py-8 relative overflow-hidden"
                                >
                                    
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
                                                    <p className="text-sm text-neutral-300 leading-relaxed max-w-[240px] mx-auto">
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
                                </motion.div>

                            </div>
                        </motion.div>
                    ) : (
                        // ═══════════════════════════════════════════════════════════════
                        // PAGE 1: LA MÉTHODE
                        // ═══════════════════════════════════════════════════════════════
                        <motion.div
                            key="method-page"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={pageTransition}
                            className="h-full overflow-y-auto custom-scrollbar"
                        >
                            <div className="p-6 pt-6 pb-32">

                                {/* ===== TIMELINE LAYOUT ===== */}
                                <div className="relative">
                                    {/* Vertical Line - Animated */}
                                    <motion.div 
                                        initial={{ scaleY: 0, originY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                        className="absolute left-[19px] top-10 bottom-6 w-px bg-gradient-to-b from-volt/40 via-neutral-700 to-neutral-800" 
                                    />
                                    
                                    <div className="space-y-8">
                                        {tips.map((tip, index) => {
                                            const IconComponent = IconMap[tip.iconName] || Zap;
                                            return (
                                                <motion.div
                                                    key={tip.id}
                                                    initial={{ opacity: 0, x: -15 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ 
                                                        delay: 0.15 + index * 0.1,
                                                        duration: 0.3,
                                                        ease: [0.25, 0.1, 0.25, 1]
                                                    }}
                                                    className="relative flex gap-5"
                                                >
                                                    {/* Number Circle */}
                                                    <div className="relative z-10 flex-shrink-0">
                                                        <motion.div 
                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ 
                                                                delay: 0.2 + index * 0.1,
                                                                type: 'spring',
                                                                stiffness: 400,
                                                                damping: 20
                                                            }}
                                                            className="w-10 h-10 rounded-full bg-[#0A0A0A] border-2 border-volt/50 flex items-center justify-center ring-4 ring-[#0A0A0A]"
                                                        >
                                                            <span className="font-mono text-sm font-bold text-volt">
                                                                {index + 1}
                                                            </span>
                                                        </motion.div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="pt-1.5 flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <IconComponent className="w-4 h-4 text-volt/70" />
                                                            <h4 className="font-mono text-sm text-white font-bold uppercase tracking-wide">
                                                                {tip.title}
                                                            </h4>
                                                        </div>
                                                        
                                                        <p className="text-[15px] text-neutral-400 font-sans leading-relaxed">
                                                            {renderWithBold(tip.body)}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer CTA - Always visible, content changes */}
            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800">
                <AnimatePresence mode="wait">
                    {page === 0 ? (
                        <motion.button
                            key="cta-context"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ 
                                type: 'spring',
                                stiffness: 500,
                                damping: 30
                            }}
                            whileTap={{ scale: 0.97 }}
                            onClick={goToMethod}
                            className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,255,0,0.3)] transition-all"
                        >
                            {L.contextCta} <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    ) : (
                        <motion.button
                            key="cta-method"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ 
                                type: 'spring',
                                stiffness: 500,
                                damping: 30
                            }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleLaunch}
                            className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,255,0,0.3)] transition-all"
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            {L.methodCta}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProtocolScreen;
