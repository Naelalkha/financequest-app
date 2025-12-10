import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

/**
 * BriefingScreen - Phase 1: Intel + Tactics
 * 
 * TODO: Customize with quest-specific content
 */
const BriefingScreen = ({ onNext }) => {
    const { i18n } = useTranslation();
    const locale = i18n.language;

    // CTA text
    const ctaText = locale === 'fr' ? 'LANCER LA MISSION →' : 'START MISSION →';

    return (
        <div className="h-full flex flex-col">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                {/* ===== SOCIAL PROOF / INTEL CARD ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden mb-6"
                >
                    {/* Badge */}
                    <div className="relative z-10 mb-4 inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-volt animate-pulse" />
                        <span className="font-mono text-[9px] text-volt font-bold uppercase tracking-widest border border-volt/30 bg-volt/10 px-2 py-0.5 rounded">
                            {locale === 'fr' ? 'INFO CLÉ' : 'KEY INFO'}
                        </span>
                    </div>

                    {/* Main text */}
                    <h3 className="font-sans font-bold text-xl text-white mb-4 relative z-10 leading-tight">
                        {locale === 'fr'
                            ? '[Statistique ou fait impactant à personnaliser]'
                            : '[Impactful stat or fact to customize]'
                        }
                    </h3>

                    {/* Source */}
                    <span className="font-mono text-[9px] text-neutral-500">
                        Source: [Source]
                    </span>
                </motion.div>

                {/* ===== TACTICS / TIPS ===== */}
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

                {/* Tips list - customize with quest-specific tips */}
                <div className="space-y-3">
                    {[1, 2, 3].map((step, index) => (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (index * 0.1) }}
                            className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-volt/20 flex items-center justify-center flex-shrink-0">
                                    <span className="font-mono text-xs text-volt font-bold">{step}</span>
                                </div>
                                <div>
                                    <h4 className="font-mono text-xs text-white font-bold uppercase mb-1">
                                        {locale === 'fr' ? `ÉTAPE ${step}` : `STEP ${step}`}
                                    </h4>
                                    <p className="text-sm text-neutral-300 leading-relaxed">
                                        {locale === 'fr'
                                            ? '[Description de l\'étape à personnaliser]'
                                            : '[Step description to customize]'
                                        }
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
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

export default BriefingScreen;
