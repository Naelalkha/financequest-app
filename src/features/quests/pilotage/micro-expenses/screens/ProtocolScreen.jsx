import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Zap, Clock, RefreshCw, HelpCircle } from 'lucide-react';
import { socialProofSlides, proTips } from '../insightData';

/**
 * ProtocolScreen - Phase 1: Intel + Tactics
 * 
 * Quest 02: TRAQUE INVISIBLE
 * Features:
 * - Social Proof carousel with 3 stats
 * - Tactics timeline with 3 tips
 * - Hook: "Tes cafés te coûtent une voiture neuve"
 */

// Icon mapping from insightData iconName to Lucide component
const ICON_MAP = {
    Zap,
    Clock,
    RefreshCw,
    HelpCircle
};

const ProtocolScreen = ({ onNext }) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Get localized content
    const slides = socialProofSlides[locale] || socialProofSlides.fr;
    const tips = proTips[locale] || proTips.fr;

    // Carousel state
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const currentSlide = slides[currentSlideIndex];

    // Carousel navigation
    const nextSlide = () => setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);

    // Helper to render bold text marked with **
    const renderWithBold = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };



    // Labels
    const labels = {
        fr: {
            hook: "Tu surveilles les gros virements, mais tu ignores la petite monnaie. Erreur tactique. L'ennemi n'est pas le montant, c'est la fréquence. Café, Vape, Uber... Mis bout à bout, c'est un treizième mois qui part en fumée.",
            protocolTitle: "PROTOCOLE D'ACTION",
            cta: 'LANCER LA MISSION →'
        },
        en: {
            hook: "You watch the big transfers, but you ignore the loose change. Tactical error. The enemy isn't the amount, it's the frequency. Coffee, Vape, Uber... Add them up, and that's a 13th month salary going up in smoke.",
            protocolTitle: 'ACTION PROTOCOL',
            cta: 'START MISSION →'
        }
    };
    const currentLabels = labels[locale] || labels.fr;

    return (
        <div className="h-full flex flex-col">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* ===== ZONE 1: SOCIAL PROOF INTEL (Single Glass Card) ===== */}
                <div className="p-6 relative">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden"
                    >
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />

                        {/* Briefing Text with volt left border */}
                        <p className="font-sans text-sm text-neutral-300 mb-6 italic border-l-2 border-volt pl-3 relative z-10">
                            "{currentLabels.hook}"
                        </p>

                        {/* Carousel Stats (nested dark card) */}
                        <div className="bg-black/40 rounded-xl p-4 border border-white/5 relative overflow-hidden flex flex-col">

                            {/* Dynamic Header */}
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-mono text-[10px] text-volt uppercase tracking-widest font-bold border-l-2 border-volt pl-2">
                                    {currentSlide.title}
                                </span>
                                <span className="font-mono text-[9px] text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded">
                                    {currentSlideIndex + 1}/{slides.length}
                                </span>
                            </div>

                            {/* Carousel Content - Fixed min height */}
                            <div className="mb-6 min-h-[90px]">
                                <div className="grid">
                                    {slides.map((slide, idx) => (
                                        <div
                                            key={slide.id}
                                            className={`col-start-1 row-start-1 transition-opacity duration-300 ${idx === currentSlideIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                        >
                                            <h3 className="text-3xl font-black text-white mb-2 tracking-tight">{slide.stat}</h3>
                                            <p className="text-xs text-[#E0E0E0] font-medium leading-relaxed">{slide.text}</p>
                                            <span className="text-[9px] text-neutral-600 mt-2 block">Source: {slide.source}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Controls - Bottom Right */}
                            <div className="absolute right-2 bottom-2 flex gap-1">
                                <button onClick={prevSlide} className="p-1.5 hover:bg-white/10 rounded-lg active:scale-95 transition-all">
                                    <ChevronRight className="w-3 h-3 text-neutral-400 hover:text-white rotate-180" />
                                </button>
                                <button onClick={nextSlide} className="p-1.5 hover:bg-white/10 rounded-lg active:scale-95 transition-all">
                                    <ChevronRight className="w-3 h-3 text-neutral-400 hover:text-white" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ===== ZONE 3: TACTICS (Timeline with Icons) ===== */}
                <div className="flex-1 px-6 pb-6">
                    {/* Section divider */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-2 mb-4 opacity-70"
                    >
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
                        <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
                            {currentLabels.protocolTitle}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
                    </motion.div>

                    {/* Timeline */}
                    <div className="space-y-6 pl-4 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-neutral-800" />

                        {tips.map((tip, index) => {
                            const IconComponent = ICON_MAP[tip.iconName] || HelpCircle;

                            return (
                                <motion.div
                                    key={tip.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.25, delay: index * 0.05 }}
                                    className="relative flex items-start gap-4 group"
                                >
                                    {/* Icon Circle */}
                                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-black border border-neutral-700 flex items-center justify-center z-10 group-hover:border-volt group-hover:text-volt transition-colors shadow-lg mt-1">
                                        <IconComponent className="w-4 h-4 text-white group-hover:text-volt transition-colors" />
                                    </div>

                                    {/* Content Card */}
                                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-3 flex-1 group-hover:bg-neutral-900 transition-colors">
                                        <h4 className="font-mono text-xs text-white font-bold uppercase mb-1">
                                            {tip.title}
                                        </h4>
                                        <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                                            {renderWithBold(tip.body)}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer: CTA */}
            <div className="p-6 bg-black border-t border-neutral-800">
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNext}
                    className="w-full bg-volt text-black font-black font-sans py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,255,0,0.3)]"
                >
                    {currentLabels.cta}
                </motion.button>
            </div>
        </div>
    );
};

export default ProtocolScreen;
