/**
 * ExecutionScreen - Phase 2: User Action
 * 
 * Template pour l'écran d'exécution
 * 
 * CE FICHIER EST LE PLUS VARIABLE ENTRE LES QUÊTES
 * Chaque quête aura une ExecutionScreen différente selon son type.
 * 
 * TYPES D'EXÉCUTION POSSIBLES:
 * 
 * 1. GRILLE DE SÉLECTION (comme cut-subscription)
 *    - Grille d'options avec icônes
 *    - Input montant
 *    - "Reality Check" pill contextuel
 * 
 * 2. SLIDER + CALCUL (comme micro-expenses)
 *    - Sélection catégorie
 *    - Slider avec valeur numérique
 *    - Projection temps réel
 * 
 * 3. QUIZ / QUESTIONNAIRE
 *    - Questions à choix multiples
 *    - Score progressif
 * 
 * 4. FORMULAIRE MULTI-ÉTAPES
 *    - Wizard interne avec sous-phases
 *    - Validation par étape
 * 
 * INSTRUCTIONS:
 * 1. Choisir le type d'exécution approprié
 * 2. S'inspirer des exemples dans /pilotage/cut-subscription ou /pilotage/micro-expenses
 * 3. Adapter la collecte de données selon ta quête
 */
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// [TODO: Importer les données contextuelles]
// import { realityCheckPills } from '../insightData';

const ExecutionScreen = ({ data = {}, onUpdate, onNext, onBack }) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;
    const inputRef = useRef(null);

    // =====================================================
    // LOCAL STATE
    // [TODO: Adapter selon les données que tu collectes]
    // =====================================================
    const [selectedOption, setSelectedOption] = useState(data.selectedOption || null);
    const [inputValue, setInputValue] = useState(data.amount?.toString() || '');

    // =====================================================
    // OPTIONS (exemple de grille)
    // [TODO: Remplacer par tes propres options]
    // =====================================================
    const OPTIONS = [
        { id: 'option1', name: 'Option 1', icon: '🔹', color: 'text-blue-400', defaultValue: 10 },
        { id: 'option2', name: 'Option 2', icon: '🔸', color: 'text-orange-400', defaultValue: 20 },
        { id: 'option3', name: 'Option 3', icon: '🔻', color: 'text-red-400', defaultValue: 30 },
        { id: 'other', name: { fr: 'Autre', en: 'Other' }, icon: '❓', color: 'text-white', defaultValue: 0, isCustom: true },
    ];

    // Get display name for option (handle localized names)
    const getOptionDisplayName = (option) => {
        if (typeof option.name === 'object') {
            return option.name[locale] || option.name.fr;
        }
        return option.name;
    };

    // Handle option selection
    const handleOptionSelect = (option) => {
        setSelectedOption(option.id);
        if (!option.isCustom) {
            setInputValue(option.defaultValue.toString());
        } else {
            setInputValue('');
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
        setInputValue(value);
    };

    // =====================================================
    // CALCULATIONS
    // [TODO: Adapter selon ta logique de calcul]
    // =====================================================
    const rawValue = parseFloat(inputValue) || 0;
    const calculatedImpact = rawValue * 12; // Exemple: impact annuel

    // =====================================================
    // VALIDATION
    // [TODO: Adapter les conditions de validation]
    // =====================================================
    const selectedOptionObj = OPTIONS.find(o => o.id === selectedOption);
    const isValid = selectedOption && rawValue > 0;

    // =====================================================
    // HANDLE NEXT
    // =====================================================
    const handleNext = () => {
        const option = OPTIONS.find(o => o.id === selectedOption);

        onUpdate({
            selectedOption: option,
            optionName: getOptionDisplayName(option),
            amount: rawValue,
            calculatedImpact: calculatedImpact
        });
        onNext();
    };

    // =====================================================
    // LABELS (bilingue)
    // [TODO: Personnaliser les textes]
    // =====================================================
    const labels = {
        fr: {
            title: 'SÉLECTIONNE UNE OPTION',
            impactFeedback: `💰 Soit ${calculatedImpact.toFixed(2)} € par an`,
            cta: 'VALIDER'
        },
        en: {
            title: 'SELECT AN OPTION',
            impactFeedback: `💰 That's ${calculatedImpact.toFixed(2)} € per year`,
            cta: 'CONFIRM'
        }
    };
    const currentLabels = labels[locale] || labels.fr;

    // =====================================================
    // RENDER
    // =====================================================
    return (
        <div className="h-full flex flex-col">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="text-center">

                    {/* Title */}
                    <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="font-mono text-xs text-zinc-500 tracking-[0.2em] uppercase mb-6"
                    >
                        {currentLabels.title}
                    </motion.h3>

                    {/* ===== OPTION GRID ===== */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="grid grid-cols-2 gap-3 mb-6"
                    >
                        {OPTIONS.map((option, index) => (
                            <motion.button
                                key={option.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2, delay: 0.02 * index }}
                                onClick={() => handleOptionSelect(option)}
                                className={`
                                    h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200
                                    ${selectedOption === option.id
                                        ? 'bg-volt text-black border-volt shadow-[0_0_15px_rgba(226,255,0,0.4)] scale-105 z-10'
                                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'
                                    }
                                `}
                            >
                                <span className={`text-xl ${selectedOption === option.id ? 'grayscale-0' : ''}`}>
                                    {option.icon}
                                </span>
                                <span className="font-mono text-[10px] font-bold uppercase tracking-wide">
                                    {getOptionDisplayName(option)}
                                </span>
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* ===== AMOUNT INPUT ===== */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="relative mb-6"
                    >
                        <div className="flex items-baseline justify-center gap-1">
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="decimal"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="00"
                                className="w-full max-w-[180px] bg-transparent text-center text-6xl font-mono font-bold text-white placeholder-zinc-800 focus:outline-none caret-volt"
                                style={{ caretColor: '#E2FF00' }}
                            />
                            <span className={`text-4xl font-sans font-bold transition-colors ${inputValue ? 'text-white' : 'text-zinc-700'}`}>
                                €
                            </span>
                        </div>
                    </motion.div>

                    {/* ===== REAL-TIME IMPACT FEEDBACK ===== */}
                    <AnimatePresence>
                        {rawValue > 0 && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="font-mono text-xs text-zinc-400"
                            >
                                {currentLabels.impactFeedback}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer: CTA */}
            <div className="p-6 bg-black border-t border-zinc-800">
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    whileHover={{ scale: isValid ? 1.02 : 1 }}
                    whileTap={{ scale: isValid ? 0.98 : 1 }}
                    onClick={handleNext}
                    disabled={!isValid}
                    className={`
                        w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2 transition-all
                        ${isValid
                            ? 'bg-volt text-black hover:bg-white cursor-pointer shadow-[0_0_20px_rgba(226,255,0,0.3)]'
                            : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
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
