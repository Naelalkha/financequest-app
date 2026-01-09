import { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Zap, ArrowRight } from 'lucide-react';
import secretDirectoryAsset from '../../../../../assets/secret-directory.png';
import { socialProofSlides, proTips } from '../insightData';
import { haptic } from '../../../../../utils/haptics';

/** Props for ProtocolScreen */
interface ProtocolScreenProps {
  onNext: () => void;
  page: number;
  setPage: (page: number) => void;
}

/**
 * ProtocolScreen - Phase 1: Context & Method
 *
 * Page 0: CONTEXTE - Stats choc sur le découvert (Instagram Stories style)
 * Page 1: MÉTHODE - Présentation du RAV (Timeline avec cards)
 */

// Page transition variants
const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

const pageTransition = {
    duration: 0.25
};

// Helper to render bold text marked with **
const renderWithBold = (text: string): ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <span key={i} className="text-white font-semibold">{part.slice(2, -2)}</span>;
        }
        return part;
    });
};

const ProtocolScreen: React.FC<ProtocolScreenProps> = ({ onNext, page, setPage }) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language as 'fr' | 'en';

    // Carousel state
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const currentSlide = socialProofSlides[currentSlideIndex];
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Function to reset the auto-slide timer
    const resetAutoSlide = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        if (page === 0) {
            timerRef.current = setInterval(() => {
                setCurrentSlideIndex((prev) => (prev + 1) % socialProofSlides.length);
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
    }, [page]);

    // Carousel navigation
    const nextSlide = () => {
        haptic.light();
        setCurrentSlideIndex((prev) => (prev + 1) % socialProofSlides.length);
        resetAutoSlide();
    };
    const prevSlide = () => {
        haptic.light();
        setCurrentSlideIndex((prev) => (prev - 1 + socialProofSlides.length) % socialProofSlides.length);
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

    // Labels
    const labels = {
        fr: {
            // Page 0
            hookLabel: 'LE PROBLÈME',
            hook: "Tu ne vois pas le découvert arriver, mais lui te voit.",
            hookHighlight: "L'ennemi, c'est l'imprévu.",
            statLabel: 'LES CHIFFRES',
            contextCta: 'VOIR LE PROTOCOLE',
            methodCta: 'CALCULER MON RAV'
        },
        en: {
            hookLabel: 'THE PROBLEM',
            hook: "You don't see the overdraft coming, but it sees you.",
            hookHighlight: "The enemy is the unexpected.",
            statLabel: 'THE NUMBERS',
            contextCta: 'SEE THE PROTOCOL',
            methodCta: 'CALCULATE MY RAV'
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

                                    {/* Dossier image - corner top-right */}
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

                                {/* ===== CARD 2: STATS CAROUSEL ===== Instagram Stories style */}
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15, duration: 0.25 }}
                                    className="border border-white/5 rounded-2xl relative overflow-hidden backdrop-blur-[20px]"
                                    style={{ backgroundColor: 'rgb(17 17 17 / 60%)' }}
                                >
                                    {/* Progress Bar - Instagram Stories style */}
                                    <div className="flex gap-1 px-4 pt-4 pb-2">
                                        {socialProofSlides.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                                                    idx === currentSlideIndex ? 'bg-volt' : 'bg-neutral-700'
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
                                                        {locale === 'en' ? currentSlide.textEn : currentSlide.textFr}
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
                                        {proTips.map((tip, index) => (
                                            <motion.div
                                                key={tip.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: 0.15 + index * 0.1,
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
                                                            delay: 0.2 + index * 0.1,
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
                                                        {/* Title */}
                                                        <h4 className="font-sans text-base font-bold text-white leading-tight mb-3">
                                                            {locale === 'en' ? tip.titleEn : tip.titleFr}
                                                        </h4>

                                                        {/* Body */}
                                                        <p className="text-[15px] text-neutral-300 font-sans leading-relaxed">
                                                            {renderWithBold(locale === 'en' ? tip.bodyEn : tip.bodyFr)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer CTA - Single persistent button with animated content */}
            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                <motion.button
                    key="cta-persistent"
                    whileTap={{ scale: 0.97 }}
                    onClick={page === 0 ? goToMethod : handleLaunch}
                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] border-black cta-ios-fix cta-active"
                >
                    {/* Animated content wrapper */}
                    <span key={`cta-content-${page}`} className="cta-content cta-content-animate">
                        {page === 0 ? (
                            <>
                                {L.contextCta} <ArrowRight className="w-5 h-5" />
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5 fill-current" />
                                {L.methodCta}
                            </>
                        )}
                    </span>
                </motion.button>
            </div>
        </div>
    );
};

export default ProtocolScreen;
