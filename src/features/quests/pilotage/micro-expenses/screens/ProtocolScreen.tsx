import { useState, useEffect, useRef } from 'react';
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

// Page transition variants (fade only for consistency with parent)
const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

const pageTransition = {
    duration: 0.25
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
    const timerRef = useRef(null);

    // Function to reset the auto-slide timer
    const resetAutoSlide = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        if (page === 0) {
            timerRef.current = setInterval(() => {
                setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
            }, 10000);
        }
    };

    // Auto-slide every 10 seconds
    useEffect(() => {
        if (page !== 0) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        resetAutoSlide();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [page, slides.length]);

    // Carousel navigation
    const nextSlide = () => {
        haptic.light();
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
        resetAutoSlide();
    };
    const prevSlide = () => {
        haptic.light();
        setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
        resetAutoSlide();
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
            hookLabel: 'LE PROBLÈME',
            hook: "Tu surveilles les gros virements, mais tu ignores la petite monnaie.",
            hookHighlight: "L'ennemi n'est pas le montant, c'est la fréquence.",
            statLabel: 'LES CHIFFRES',
            contextCta: 'VOIR LE PROTOCOLE',

            // Page 2
            methodTitle: 'MÉTHODE',
            methodSubtitle: '3 étapes pour reprendre le contrôle',
            methodCta: 'PASSER À L\'ACTION'
        },
        en: {
            contextTitle: 'CONTEXT',
            hookLabel: 'THE PROBLEM',
            hook: "You watch the big transfers, but ignore the loose change.",
            hookHighlight: "The enemy isn't the amount, it's the frequency.",
            statLabel: 'THE NUMBERS',
            contextCta: 'SEE THE PROTOCOL',
            methodTitle: 'METHOD',
            methodSubtitle: '3 steps to take back control',
            methodCta: 'TAKE ACTION'
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

                                {/* ===== CARD 1: THE PROBLEM ===== "Verre Fumé" - rgb(36 36 36 / 50%) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.25 }}
                                    className="rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl"
                                    style={{
                                        backgroundColor: 'rgb(36 36 36 / 50%)',
                                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)'
                                    }}
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
                                        <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wide mb-4 block">
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

                                {/* ===== CARD 2: STATS CAROUSEL ===== "Verre Profond" - Instagram Stories style */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15, duration: 0.25 }}
                                    className="border border-white/5 rounded-2xl relative overflow-hidden backdrop-blur-[20px]"
                                    style={{ backgroundColor: 'rgb(17 17 17 / 60%)' }}
                                >
                                    {/* Progress Bar - Instagram Stories style */}
                                    <div className="flex gap-1 px-4 pt-4 pb-2">
                                        {slides.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex-1 h-1 rounded-full transition-colors duration-300 ${idx === currentSlideIndex ? 'bg-volt' : 'bg-neutral-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Header */}
                                    <div className="relative z-10 px-6 pt-2 pb-2">
                                        <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wide">
                                            {L.statLabel}
                                        </span>
                                    </div>

                                    {/* Carousel Content with Tap Zones */}
                                    <div
                                        className="relative h-[140px] px-6 pb-6"
                                        onTouchStart={(e) => {
                                            const touch = e.touches[0];
                                            (e.currentTarget as HTMLDivElement).dataset.touchStartX = String(touch.clientX);
                                        }}
                                        onTouchEnd={(e) => {
                                            const touchStartX = Number((e.currentTarget as HTMLDivElement).dataset.touchStartX);
                                            const touchEndX = e.changedTouches[0].clientX;
                                            const diff = touchStartX - touchEndX;

                                            if (Math.abs(diff) > 50) {
                                                if (diff > 0) {
                                                    nextSlide();
                                                } else {
                                                    prevSlide();
                                                }
                                            }
                                        }}
                                    >
                                        {/* Invisible tap zones */}
                                        <div className="absolute inset-0 flex z-20">
                                            <button
                                                onClick={prevSlide}
                                                className="w-1/3 h-full outline-none focus:outline-none"
                                                aria-label="Previous"
                                            />
                                            <div className="w-1/3 h-full" /> {/* Center - no action */}
                                            <button
                                                onClick={nextSlide}
                                                className="w-1/3 h-full outline-none focus:outline-none"
                                                aria-label="Next"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="relative z-10 h-full flex items-center justify-center">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={currentSlideIndex}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="text-center"
                                                >
                                                    <h3 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                                                        {currentSlide.stat}
                                                    </h3>
                                                    <p className="text-sm text-neutral-300 leading-relaxed max-w-[260px] mx-auto">
                                                        {currentSlide.text}
                                                    </p>
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
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
                            <div className="p-6 pt-4 pb-32">

                                {/* ===== TIMELINE LAYOUT ===== */}
                                <div className="relative">
                                    {/* Vertical Line - Animated */}
                                    <motion.div
                                        initial={{ scaleY: 0, originY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                        className="absolute left-[19px] top-10 bottom-6 w-px bg-gradient-to-b from-volt/40 via-neutral-700 to-neutral-800"
                                    />

                                    <div className="space-y-4">
                                        {tips.map((tip, index) => {
                                            const IconComponent = IconMap[tip.iconName] || Zap;
                                            return (
                                                <motion.div
                                                    key={tip.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{
                                                        delay: 0.1 + index * 0.1,
                                                        duration: 0.3,
                                                        ease: "easeOut"
                                                    }}
                                                    className="relative flex gap-4 items-start"
                                                >
                                                    {/* Number Circle - Aligned with top of card */}
                                                    <div className="relative z-10 flex-shrink-0 pt-5">
                                                        <motion.div
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{
                                                                delay: 0.15 + index * 0.1,
                                                                type: 'spring',
                                                                stiffness: 400,
                                                                damping: 25
                                                            }}
                                                            className="w-8 h-8 rounded-full bg-[#0A0A0A] border-2 border-volt/50 flex items-center justify-center ring-4 ring-[#0A0A0A] shadow-[0_0_15px_rgba(226,255,0,0.1)] relative -top-4"
                                                        >
                                                            <span className="font-mono text-sm font-bold text-volt">
                                                                {index + 1}
                                                            </span>
                                                        </motion.div>
                                                    </div>

                                                    {/* Content Card */}
                                                    <div className="flex-1 bg-neutral-900/60 border border-white/5 rounded-2xl p-5 backdrop-blur-[1px] relative overflow-hidden">

                                                        <div className="relative z-10">
                                                            {/* Title - No padding right needed as icon is very transparent */}
                                                            <h4 className="font-sans text-base font-bold text-white leading-tight mb-3">
                                                                {tip.title}
                                                            </h4>

                                                            {/* Body */}
                                                            <p className="text-[15px] text-neutral-300 font-sans leading-relaxed">
                                                                {renderWithBold(tip.body)}
                                                            </p>
                                                        </div>
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
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25
                            }}
                            whileTap={{ scale: 0.97 }}
                            onClick={goToMethod}
                            className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-volt-glow-strong border-[3px] border-black transition-all"
                        >
                            {L.contextCta} <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    ) : (
                        <motion.button
                            key="cta-method"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25
                            }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleLaunch}
                            className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 shadow-volt-glow-strong border-[3px] border-black transition-all"
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
