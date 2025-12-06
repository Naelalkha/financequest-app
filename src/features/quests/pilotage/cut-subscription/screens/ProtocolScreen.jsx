import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import secretDirectoryAsset from '../../../../../assets/secret-directory.png';

/**
 * ProtocolScreen - Phase 1: Intel + Tactics
 * 
 * Clean tactical briefing with glass card and numbered timeline
 */
const ProtocolScreen = ({ onNext }) => {
    const { t, i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Intel content
    const intel = {
        fr: {
            label: 'DATA INTELLIGENCE',
            title: "COÛT D'OPPORTUNITÉ",
            text: "Une dépense passive est un vampire financier. Couper 15€/mois aujourd'hui équivaut à se verser ~2 500€ de capital futur (sur 10 ans) grâce aux intérêts composés. Agir maintenant, c'est payer son futur."
        },
        en: {
            label: 'DATA INTELLIGENCE',
            title: 'OPPORTUNITY COST',
            text: "A passive expense is a financial vampire. Cutting €15/month today equals ~€2,500 of future capital (over 10 years) thanks to compound interest. Acting now is paying your future self."
        }
    };

    // Tactics steps
    const tactics = {
        fr: {
            label: 'PROCÉDURE TACTIQUE',
            steps: [
                'Ouvre les paramètres du service',
                'Localise la section abonnement',
                'Confirme la résiliation'
            ]
        },
        en: {
            label: 'TACTICAL PROCEDURE',
            steps: [
                'Open the service settings',
                'Locate the subscription section',
                'Confirm cancellation'
            ]
        }
    };

    const currentIntel = intel[locale] || intel.fr;
    const currentTactics = tactics[locale] || tactics.fr;
    const ctaText = locale === 'fr' ? 'CIBLE IDENTIFIÉE →' : 'TARGET IDENTIFIED →';

    return (
        <div className="h-full flex flex-col">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* Zone 1: INTEL (Top) */}
                <div className="p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
                    >
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />

                        {/* 3D Asset Hero - Secret Directory */}
                        <div className="absolute -right-4 -top-4 w-28 h-28 opacity-80 group-hover:scale-110 transition-transform duration-700">
                            <img
                                src={secretDirectoryAsset}
                                alt="Dossier"
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </div>

                        <span className="font-mono text-[9px] text-volt font-bold uppercase tracking-widest mb-3 block relative z-10">
                            {currentIntel.label}
                        </span>

                        <h3 className="font-sans font-bold text-xl text-white mb-2 relative z-10 max-w-[80%]">
                            {currentIntel.title}
                        </h3>
                        <p className="font-mono text-xs text-neutral-400 leading-relaxed relative z-10">
                            {currentIntel.text}
                        </p>
                    </motion.div>
                </div>

                {/* Zone 2: TACTICS (Bottom) */}
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
                            {currentTactics.label}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
                    </motion.div>

                    {/* Timeline */}
                    <div className="space-y-6 pl-4 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-neutral-800" />

                        {currentTactics.steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (index * 0.1) }}
                                className="relative flex items-center gap-4 group"
                            >
                                {/* Numbered circle */}
                                <div className="w-10 h-10 rounded-full bg-black border border-neutral-700 flex items-center justify-center z-10 group-hover:border-volt group-hover:text-volt transition-colors shadow-lg">
                                    <span className="font-mono text-sm font-bold">{index + 1}</span>
                                </div>

                                {/* Step card */}
                                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-3 flex-1 group-hover:bg-neutral-900 transition-colors">
                                    <span className="text-xs text-neutral-300 font-sans font-medium">
                                        {step}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer: CTA */}
            <div className="p-6 bg-[#0A0A0A] border-t border-neutral-800">
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNext}
                    className="w-full bg-volt text-black font-black font-sans py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-volt-glow"
                >
                    {ctaText}
                </motion.button>
            </div>
        </div>
    );
};

export default ProtocolScreen;
