import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Search, Cog, ShieldAlert, HelpCircle } from 'lucide-react';
import secretDirectoryAsset from '../../../../../assets/secret-directory.png';
import { socialProofSlides, proTips } from '../insightData';

/**
 * ProtocolScreen - Phase 1: Intel + Tactics
 * 
 * Features:
 * - Glass card with 3D asset and Social Proof
 * - Pulsing badge
 * - Timeline with Lucide icons from insightData
 */

// Icon mapping from insightData iconName to Lucide component
const ICON_MAP = {
    Search,
    Cog,
    ShieldAlert,
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

    // CTA text
    const ctaText = locale === 'fr' ? 'LANCER LA MISSION →' : 'START MISSION →';

    return (
        <div className="h-full flex flex-col">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* ===== ZONE 1: SOCIAL PROOF INTEL (Glass Card with 3D Asset) ===== */}
                <div className="p-6 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
                    >
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />

                        {/* 3D Asset Hero */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 opacity-80 group-hover:scale-110 transition-transform duration-700">
                            <img
                                src={secretDirectoryAsset}
                                alt="Dossier"
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </div>

                        {/* Badge: Oubli Fréquent (Pulsing) */}
                        <div className="relative z-10 mb-4 inline-flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="font-mono text-[9px] text-red-500 font-bold uppercase tracking-widest border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded">
                                {currentSlide.badge}
                            </span>
                        </div>

                        {/* Carousel Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                            >
                                {/* Main Stats Text */}
                                <h3 className="font-sans font-bold text-xl text-white mb-4 relative z-10 max-w-[85%] leading-tight">
                                    "{currentSlide.stat} {currentSlide.text}"
                                </h3>
                            </motion.div>
                        </AnimatePresence>

                        {/* Footer: Source + Navigation */}
                        <div className="flex justify-between items-end relative z-10">
                            <span className="font-mono text-[9px] text-neutral-500">
                                Source: {currentSlide.source}
                            </span>

                            {/* Navigation arrows */}
                            <div className="flex gap-1">
                                <button
                                    onClick={prevSlide}
                                    className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/20 transition-colors"
                                >
                                    <ChevronRight className="w-3 h-3 rotate-180" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/20 transition-colors"
                                >
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ===== ZONE 2: TACTICS (Timeline with Icons) ===== */}
                <div className="flex-1 px-6 pb-6">
                    {/* Section divider */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 mb-4 opacity-70"
                    >
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
                        <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
                            {locale === 'fr' ? "PROTOCOLE D'ACTION" : 'ACTION PROTOCOL'}
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
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (index * 0.1) }}
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNext}
                    className="w-full bg-volt text-black font-black font-sans py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,255,0,0.3)]"
                >
                    {ctaText}
                </motion.button>
            </div>
        </div>
    );
};

export default ProtocolScreen;
