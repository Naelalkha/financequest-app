import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink } from 'lucide-react';

/**
 * ExecutionScreen - Phase 2: User Action
 * 
 * Template with examples for different quest types.
 * Customize the content and CTA based on quest needs.
 * 
 * Examples:
 * - Cut Subscription: Service grid + Amount input → "VALIDER LE BUTIN"
 * - Open Boursobank: External link + Confirmation → "J'AI OUVERT MON COMPTE ✓"
 * - Sell on Vinted: Item details + Price → "ARTICLE MIS EN LIGNE ✓"
 */
const ExecutionScreen = ({
    data = {},
    onUpdate,
    onNext,
    onBack
}) => {
    const { i18n } = useTranslation();
    const locale = i18n.language;

    // ===== CUSTOMIZE THIS SECTION PER QUEST =====

    // Example: Confirmation checkbox for action quests
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Example: Input value for data collection quests
    const [inputValue, setInputValue] = useState(data.inputValue || '');

    // Validation - customize per quest
    const isValid = isConfirmed || inputValue.trim().length > 0;

    // Handle submission
    const handleNext = () => {
        onUpdate({
            inputValue,
            isConfirmed,
            completedAt: new Date().toISOString()
        });
        onNext();
    };

    // ===== LABELS - CUSTOMIZE PER QUEST =====
    const labels = {
        fr: {
            title: '[TITRE À PERSONNALISER]',

            // Example CTAs for different quest types:
            // cta: 'VALIDER LE BUTIN',           // Monetary savings
            // cta: "J'AI OUVERT MON COMPTE ✓",   // Account creation
            // cta: 'ARTICLE MIS EN LIGNE ✓',     // Listing creation
            // cta: 'VOIR MES RÉSULTATS →',       // Simulation
            cta: 'CONFIRMER ✓',

            confirmLabel: "J'ai effectué cette action",
            placeholder: 'Votre réponse...',
            externalLink: 'Ouvrir le service →'
        },
        en: {
            title: '[TITLE TO CUSTOMIZE]',
            cta: 'CONFIRM ✓',
            confirmLabel: "I've completed this action",
            placeholder: 'Your answer...',
            externalLink: 'Open service →'
        }
    };
    const currentLabels = labels[locale] || labels.fr;

    return (
        <div className="h-full flex flex-col">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                {/* Back button (for multi-step quests) */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-neutral-500 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-mono text-xs">{locale === 'fr' ? 'Retour' : 'Back'}</span>
                    </button>
                )}

                <div className="text-center">
                    {/* Section title */}
                    <h3 className="font-mono text-xs text-neutral-500 tracking-[0.2em] uppercase mb-6">
                        {currentLabels.title}
                    </h3>

                    {/* ===== EXAMPLE 1: External Link Button (for account creation quests) ===== */}
                    <motion.a
                        href="https://example.com"  // TODO: Replace with actual URL
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-6 py-4 text-white font-mono text-sm mb-8 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {currentLabels.externalLink}
                    </motion.a>

                    {/* ===== EXAMPLE 2: Confirmation Checkbox (for action quests) ===== */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <label className="flex items-center justify-center gap-3 cursor-pointer group">
                            <div
                                className={`
                                    w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                                    ${isConfirmed
                                        ? 'bg-volt border-volt'
                                        : 'border-neutral-600 group-hover:border-neutral-400'
                                    }
                                `}
                                onClick={() => setIsConfirmed(!isConfirmed)}
                            >
                                {isConfirmed && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-black font-bold"
                                    >
                                        ✓
                                    </motion.span>
                                )}
                            </div>
                            <span className={`font-mono text-sm ${isConfirmed ? 'text-volt' : 'text-neutral-400'}`}>
                                {currentLabels.confirmLabel}
                            </span>
                        </label>
                    </motion.div>

                    {/* ===== EXAMPLE 3: Text Input (for data collection quests) ===== */}
                    {/* Uncomment if needed:
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={currentLabels.placeholder}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-4 text-white text-center font-mono focus:outline-none focus:border-volt transition-colors"
                        />
                    </motion.div>
                    */}

                    {/* Success feedback */}
                    {isValid && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-mono text-xs text-volt"
                        >
                            ✓ {locale === 'fr' ? 'Prêt à continuer' : 'Ready to continue'}
                        </motion.p>
                    )}
                </div>
            </div>

            {/* Footer: CTA */}
            <div className="p-6 bg-black border-t border-neutral-800">
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: isValid ? 1.02 : 1 }}
                    whileTap={{ scale: isValid ? 0.98 : 1 }}
                    onClick={handleNext}
                    disabled={!isValid}
                    className={`
                        w-full font-black font-sans py-4 rounded-xl transition-all flex items-center justify-center gap-2
                        ${isValid
                            ? 'bg-volt text-black hover:bg-white shadow-[0_0_20px_rgba(226,255,0,0.3)]'
                            : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                        }
                    `}
                >
                    {currentLabels.cta}
                </motion.button>
            </div>
        </div>
    );
};

export default ExecutionScreen;
