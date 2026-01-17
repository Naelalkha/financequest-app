import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    ChevronRight, Wallet, Copy, Check, ExternalLink,
    ArrowRightLeft, Bell, Calendar, Shield, Phone,
    AlertTriangle, AlertCircle, CheckCircle2, Sparkles
} from 'lucide-react';
import {
    calculateRAV,
    calculateTotalImpact,
    getStrategiesForRiskLevel,
    strategies,
    RISK_LEVELS,
    RISK_MESSAGES,
    type RiskLevel
} from '../insightData';
import { Slider } from '../../../../../components/ui';
import { haptic } from '../../../../../utils/haptics';

/** Quest data from flow */
interface QuestData {
  revenus?: number;
  chargesFixes?: number;
  rav?: number;
  ravRatio?: number;
  riskLevel?: string;
  selectedStrategies?: string[];
  totalImpact?: number;
  [key: string]: unknown;
}

/** Props for ExecutionScreen */
interface ExecutionScreenProps {
  data?: QuestData;
  onUpdate: (data: object) => void;
  onNext: () => void;
  step: string;
  setStep: (step: string) => void;
}

// Icon map for strategies
const ICON_MAP: Record<string, React.ElementType> = {
    ArrowRightLeft,
    Bell,
    Calendar,
    Shield,
};

// Icon map for risk levels (Lucide icons instead of emojis)
const RISK_ICON_MAP: Record<string, React.ElementType> = {
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    Sparkles,
};

/**
 * ExecutionScreen - Phase 2: Diagnostic + Strategy + Action
 *
 * Step 1: "diagnostic" - Input revenus + charges → calcul RAV
 * Step 2: "strategy" - Multi-select stratégies garde-fous
 * Step 3: "action" - Script card appel banque (si applicable)
 */
const ExecutionScreen: React.FC<ExecutionScreenProps> = ({ data = {}, onUpdate, onNext, step, setStep }) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Local state
    const [revenus, setRevenus] = useState(data.revenus || 2500);
    const [chargesFixes, setChargesFixes] = useState(data.chargesFixes || 1500);
    const [selectedStrategies, setSelectedStrategies] = useState<string[]>(data.selectedStrategies || []);
    const [copied, setCopied] = useState(false);
    const [completedActions, setCompletedActions] = useState<string[]>([]);

    // Toggle completed action
    const toggleAction = useCallback((actionId: string) => {
        setCompletedActions(prev => {
            const isRemoving = prev.includes(actionId);
            const newActions = isRemoving
                ? prev.filter(id => id !== actionId)
                : [...prev, actionId];

            // Check if all actions will be completed after this toggle
            const willBeAllCompleted = !isRemoving &&
                selectedStrategies.length > 0 &&
                selectedStrategies.every(id => newActions.includes(id));

            if (willBeAllCompleted) {
                haptic.success();
            } else {
                haptic.light();
            }

            return newActions;
        });
    }, [selectedStrategies]);

    // Calculate RAV in real-time
    const ravResult = useMemo(() => calculateRAV(revenus, chargesFixes), [revenus, chargesFixes]);
    const riskConfig = RISK_LEVELS[ravResult.riskLevel as RiskLevel];

    // Calculate total impact
    const totalImpact = useMemo(() => calculateTotalImpact(selectedStrategies), [selectedStrategies]);

    // Toggle strategy selection
    const toggleStrategy = useCallback((strategyId: string) => {
        haptic.light();
        setSelectedStrategies(prev =>
            prev.includes(strategyId)
                ? prev.filter(id => id !== strategyId)
                : [...prev, strategyId]
        );
    }, []);

    // Go to strategy step
    const goToStrategy = useCallback(() => {
        haptic.medium();
        onUpdate({
            revenus,
            chargesFixes,
            rav: ravResult.rav,
            ravRatio: ravResult.ratio,
            riskLevel: ravResult.riskLevel
        });
        setStep('strategy');
    }, [revenus, chargesFixes, ravResult, onUpdate, setStep]);

    // Go to action step (always show action screen for checklist)
    const goToAction = useCallback(() => {
        haptic.medium();
        onUpdate({
            selectedStrategies,
            totalImpact
        });
        setStep('action');
    }, [selectedStrategies, totalImpact, onUpdate, setStep]);

    // Finish
    const handleFinish = useCallback(() => {
        haptic.heavy();
        onUpdate({
            selectedStrategies,
            totalImpact
        });
        onNext();
    }, [selectedStrategies, totalImpact, onUpdate, onNext]);

    // Labels
    const labels = {
        fr: {
            // Diagnostic
            revenusLabel: 'TES REVENUS NETS MENSUELS',
            revenusHint: 'Salaire, allocations, etc.',
            chargesLabel: 'TES CHARGES FIXES',
            chargesHint: 'Loyer, crédits, abos, etc.',
            ravLabel: 'TON RESTE À VIVRE',
            ratioLabel: 'de tes revenus',
            diagnosticCta: 'CONTINUER',

            // Strategy
            strategyIntro: 'Sélectionne tes protections',
            protectionLabel: 'protection',
            strategyCta: 'CONTINUER',
            noStrategy: 'Sélectionne au moins une protection',

            // Action
            scriptLabel: 'REQUÊTE TYPE',
            procedureLabel: 'PROCÉDURE',
            copyScript: 'Copier',
            copied: 'Copié !',
            callBank: 'APPELER MA BANQUE',
            openBankApp: 'OUVRIR MON APP BANCAIRE',
            actionCta: 'VOIR MON IMPACT'
        },
        en: {
            // Diagnostic
            revenusLabel: 'YOUR NET MONTHLY INCOME',
            revenusHint: 'Salary, benefits, etc.',
            chargesLabel: 'YOUR FIXED EXPENSES',
            chargesHint: 'Rent, loans, subs, etc.',
            ravLabel: 'YOUR DISPOSABLE INCOME',
            ratioLabel: 'of your income',
            diagnosticCta: 'CONTINUE',

            // Strategy
            strategyIntro: 'Select your protections',
            protectionLabel: 'protection',
            strategyCta: 'CONTINUE',
            noStrategy: 'Select at least one protection',

            // Action
            scriptLabel: 'SAMPLE REQUEST',
            procedureLabel: 'PROCEDURE',
            copyScript: 'Copy',
            copied: 'Copied!',
            callBank: 'CALL MY BANK',
            openBankApp: 'OPEN MY BANKING APP',
            actionCta: 'SEE MY IMPACT'
        }
    };
    const L = labels[locale] || labels.fr;

    // STEP 1: DIAGNOSTIC
    if (step === 'diagnostic') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col p-6 pt-6 pb-32">

                        {/* REVENUS INPUT */}
                        <div className="mb-10">
                            <div className="flex justify-between items-end mb-4 px-1 gap-4">
                                <div className="flex-1 min-w-0">
                                    <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wide block truncate mb-1">
                                        {L.revenusLabel}
                                    </label>
                                    <span className="font-mono text-xs text-neutral-500 block">
                                        {L.revenusHint}
                                    </span>
                                </div>
                                <div className="flex items-baseline flex-shrink-0">
                                    <motion.span
                                        key={revenus}
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        className="text-4xl font-sans font-black text-white tabular-nums"
                                    >
                                        {revenus.toLocaleString('fr-FR')}
                                    </motion.span>
                                    <span className="font-sans font-bold text-neutral-500 text-lg ml-1">€</span>
                                </div>
                            </div>
                            <div className="slider-container">
                                <Slider
                                    value={revenus}
                                    onChange={setRevenus}
                                    min={500}
                                    max={15000}
                                    step={100}
                                    hapticOnChange={true}
                                />
                            </div>
                        </div>

                        {/* CHARGES INPUT */}
                        <div className="mb-10">
                            <div className="flex justify-between items-end mb-4 px-1 gap-4">
                                <div className="flex-1 min-w-0">
                                    <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wide block truncate mb-1">
                                        {L.chargesLabel}
                                    </label>
                                    <span className="font-mono text-xs text-neutral-500 block">
                                        {L.chargesHint}
                                    </span>
                                </div>
                                <div className="flex items-baseline flex-shrink-0">
                                    <motion.span
                                        key={chargesFixes}
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        className="text-4xl font-sans font-black text-white tabular-nums"
                                    >
                                        {chargesFixes.toLocaleString('fr-FR')}
                                    </motion.span>
                                    <span className="font-sans font-bold text-neutral-500 text-lg ml-1">€</span>
                                </div>
                            </div>
                            <div className="slider-container">
                                <Slider
                                    value={chargesFixes}
                                    onChange={setChargesFixes}
                                    min={0}
                                    max={revenus}
                                    step={50}
                                    hapticOnChange={true}
                                />
                            </div>
                        </div>

                        {/* RAV RESULT CARD */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`${riskConfig.bgClass} ${riskConfig.borderClass} rounded-2xl p-4 backdrop-blur-[20px]`}
                        >
                            {/* Partie haute : RAV */}
                            <div className="flex items-center gap-4">
                                <Wallet className="w-7 h-7 text-volt flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-mono text-[11px] text-neutral-400 uppercase">
                                            {L.ravLabel}
                                        </span>
                                        <motion.span
                                            key={ravResult.rav}
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            className="font-mono text-xl font-bold text-white"
                                        >
                                            {ravResult.rav.toLocaleString('fr-FR')} €
                                        </motion.span>
                                    </div>
                                    <span className="font-mono text-[10px] text-neutral-500">
                                        {Math.round(ravResult.ratio * 100)}% {L.ratioLabel}
                                    </span>
                                </div>
                            </div>

                            {/* Séparateur */}
                            <div className="border-t border-white/5 my-3" />

                            {/* Partie basse : Niveau de risque */}
                            {(() => {
                                const RiskIcon = RISK_ICON_MAP[riskConfig.iconName] || CheckCircle2;
                                return (
                                    <div className="flex items-start gap-3">
                                        <RiskIcon className={`w-5 h-5 ${riskConfig.colorClass} flex-shrink-0 mt-0.5`} />
                                        <div className="flex-1">
                                            <span className={`font-mono text-sm font-bold ${riskConfig.colorClass}`}>
                                                {locale === 'en' ? riskConfig.labelEn : riskConfig.labelFr}
                                            </span>
                                            <p className="text-xs text-neutral-400 mt-0.5">
                                                {locale === 'en' ? riskConfig.descEn : riskConfig.descFr}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={goToStrategy}
                        className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] border-black cta-ios-fix cta-active"
                    >
                        <span className="cta-content cta-content-animate">
                            {L.diagnosticCta}
                            <ChevronRight className="w-5 h-5" />
                        </span>
                    </motion.button>
                </div>
            </div>
        );
    }

    // STEP 2: STRATEGY SELECTION
    // Get risk level from previous diagnostic step
    const currentRiskLevel = (data.riskLevel || ravResult.riskLevel) as RiskLevel;
    const riskMessage = RISK_MESSAGES[currentRiskLevel];
    const orderedStrategies = getStrategiesForRiskLevel(currentRiskLevel);

    if (step === 'strategy') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col p-6 pt-2 pb-32">

                        {/* Risk-based contextual message - Style dynamique selon niveau */}
                        {(() => {
                            const RiskIcon = RISK_ICON_MAP[riskConfig.iconName] || CheckCircle2;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-2xl p-4 ${riskConfig.bgClass} ${riskConfig.borderClass}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <RiskIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${riskConfig.colorClass}`} />
                                        <div>
                                            <span className={`font-mono text-xs font-bold uppercase block mb-1 ${riskConfig.colorClass}`}>
                                                {locale === 'en' ? riskMessage.priorityLabelEn : riskMessage.priorityLabelFr}
                                            </span>
                                            <p className="text-sm text-neutral-300">
                                                {locale === 'en' ? riskMessage.en : riskMessage.fr}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })()}

                        {/* Divider */}
                        <div className="my-5">
                            <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
                        </div>

                        {/* Strategy Cards - ordered by risk level */}
                        <div className="space-y-3">
                            {orderedStrategies.map((strategy, index) => {
                                const IconComponent = ICON_MAP[strategy.iconName] || Shield;
                                const isSelected = selectedStrategies.includes(strategy.id);

                                return (
                                    <motion.button
                                        key={strategy.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.06, duration: 0.25 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => toggleStrategy(strategy.id)}
                                        className={`
                                            w-full rounded-2xl border text-left selectable-card
                                            ${isSelected
                                                ? 'bg-neutral-900 border-volt selectable-card--active'
                                                : 'bg-neutral-900 border-neutral-800 active:bg-neutral-800'
                                            }
                                        `}
                                    >
                                        <div className="p-4 flex items-center gap-4">
                                            {/* Icon avec cadre carré arrondi */}
                                            <div className={`
                                                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                                ${isSelected
                                                    ? 'bg-volt text-black'
                                                    : 'bg-neutral-800 text-neutral-400'
                                                }
                                            `}>
                                                <IconComponent className="w-6 h-6" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`font-mono text-sm font-semibold uppercase tracking-wide ${isSelected ? 'text-volt' : 'text-white'}`}>
                                                        {locale === 'en' ? strategy.labelEn : strategy.labelFr}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-500">
                                                    {locale === 'en' ? strategy.descEn : strategy.descFr}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                    <motion.button
                        whileTap={selectedStrategies.length > 0 ? { scale: 0.97 } : {}}
                        onClick={goToAction}
                        disabled={selectedStrategies.length === 0}
                        className={`w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] cta-ios-fix ${
                            selectedStrategies.length > 0
                                ? 'bg-volt text-black border-black cta-active'
                                : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                        }`}
                    >
                        <span className="cta-content cta-content-animate">
                            {selectedStrategies.length > 0 ? L.strategyCta : L.noStrategy}
                            <ChevronRight className="w-5 h-5" />
                        </span>
                    </motion.button>
                </div>
            </div>
        );
    }

    // STEP 3: ACTION (Bank Call Script + Checklist)
    if (step === 'action') {
        // Get selected strategy details
        const selectedStrategyDetails = strategies.filter(s => selectedStrategies.includes(s.id));

        // Script strategies: everything except virement auto (100% autonomous)
        const scriptStrategyIds = selectedStrategies.filter(id => id !== 'auto-transfer');
        const hasScriptStrategies = scriptStrategyIds.length > 0;

        // Check if all actions are completed
        const allActionsCompleted = selectedStrategies.length > 0 &&
            selectedStrategies.every(id => completedActions.includes(id));

        // Generate dynamic script (includes all except auto-transfer)
        const generateScript = () => {
            const points: string[] = [];

            if (selectedStrategies.includes('delay-debits')) {
                points.push(locale === 'en'
                    ? 'move my direct debits to the 5th of the month'
                    : 'décaler mes prélèvements au 5 du mois'
                );
            }
            if (selectedStrategies.includes('sms-alert')) {
                points.push(locale === 'en'
                    ? 'activate low balance SMS alerts'
                    : 'activer les alertes SMS de solde bas'
                );
            }
            if (selectedStrategies.includes('negotiate-overdraft')) {
                points.push(locale === 'en'
                    ? 'set up a free authorized overdraft'
                    : 'mettre en place un découvert autorisé gratuit'
                );
            }

            // No script if only auto-transfer selected
            if (points.length === 0) return null;

            // Single request → fluid sentence
            if (points.length === 1) {
                const intro = locale === 'en'
                    ? `"Hello, I'm a customer and I'd like to ${points[0]}. Is that possible by phone?"`
                    : `"Bonjour, je suis client(e) et je souhaite ${points[0]}. Est-ce possible par téléphone ?"`;
                const outro = locale === 'en' ? 'Thank you for your help.' : 'Merci de votre aide.';
                return { intro, points: null, outro: `"${outro}"` };
            }

            // Multiple requests → numbered list
            const intro = locale === 'en'
                ? `"Hello, I'm a customer. I have ${points.length} requests:"`
                : `"Bonjour, je suis client(e). J'aurais ${points.length} demandes :"`;

            // Capitalize first letter of each point
            const capitalizedPoints = points.map(p => p.charAt(0).toUpperCase() + p.slice(1));

            const outro = locale === 'en'
                ? 'What can I do directly with you?'
                : 'Qu\'est-ce que je peux faire directement avec vous ?';

            return { intro, points: capitalizedPoints, outro: `"${outro}"` };
        };

        const script = generateScript();

        // Generate procedure steps for autonomous actions (when no script)
        const generateProcedure = () => {
            // Only show procedure when no script strategies
            if (hasScriptStrategies) return null;

            const steps: string[] = [];

            if (selectedStrategies.includes('auto-transfer')) {
                if (locale === 'en') {
                    steps.push('Open your banking app');
                    steps.push('Go to "Transfers" section');
                    steps.push('Select "Recurring transfer"');
                    steps.push('Set amount (e.g. 50€) for the day after payday');
                } else {
                    steps.push('Ouvre l\'app de ta banque');
                    steps.push('Va dans la section "Virements"');
                    steps.push('Sélectionne "Virement permanent"');
                    steps.push('Programme le montant (ex: 50€) le lendemain de ta paie');
                }
            }

            if (selectedStrategies.includes('sms-alert') && !hasScriptStrategies) {
                if (locale === 'en') {
                    steps.push('Open your banking app');
                    steps.push('Go to "Settings" or "Alerts"');
                    steps.push('Enable "Low balance alert"');
                    steps.push('Set threshold (e.g. 100€)');
                } else {
                    steps.push('Ouvre l\'app de ta banque');
                    steps.push('Va dans "Paramètres" ou "Alertes"');
                    steps.push('Active "Alerte solde bas"');
                    steps.push('Définis le seuil (ex: 100€)');
                }
            }

            return steps.length > 0 ? steps : null;
        };

        const procedure = generateProcedure();

        // Action labels for all strategies
        const actionLabels: Record<string, { label: string; completedLabel: string }> = {
            'auto-transfer': {
                label: locale === 'en' ? 'Set up auto transfer' : 'Programmer virement auto',
                completedLabel: locale === 'en' ? 'TRANSFER SCHEDULED' : 'VIREMENT PROGRAMMÉ'
            },
            'delay-debits': {
                label: locale === 'en' ? 'Delay debits' : 'Décaler prélèvements',
                completedLabel: locale === 'en' ? 'DEBITS DELAYED' : 'PRÉLÈVEMENTS DÉCALÉS'
            },
            'sms-alert': {
                label: locale === 'en' ? 'Activate SMS alerts' : 'Activer alertes SMS',
                completedLabel: locale === 'en' ? 'ALERTS ACTIVATED' : 'ALERTES ACTIVÉES'
            },
            'negotiate-overdraft': {
                label: locale === 'en' ? 'Negotiate overdraft' : 'Négocier découvert',
                completedLabel: locale === 'en' ? 'OVERDRAFT NEGOTIATED' : 'DÉCOUVERT NÉGOCIÉ'
            }
        };

        // Copy script to clipboard (dynamic version)
        const handleCopyScript = () => {
            if (!script) return;

            let fullScript = script.intro + '\n\n';
            if (script.points) {
                fullScript += script.points.map((p, i) => `${i + 1}. ${p}`).join('\n') + '\n\n';
            }
            fullScript += script.outro;

            // Remove quotes for clipboard
            const cleanScript = fullScript.replace(/"/g, '');
            navigator.clipboard.writeText(cleanScript);

            haptic.light();
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        // Render checklist item
        const renderChecklistItem = (strategy: typeof strategies[0], index: number, delayOffset: number = 0) => {
            const IconComponent = ICON_MAP[strategy.iconName] || Shield;
            const isCompleted = completedActions.includes(strategy.id);
            const labels = actionLabels[strategy.id];

            return (
                <motion.button
                    key={strategy.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delayOffset + index * 0.05 }}
                    onClick={() => toggleAction(strategy.id)}
                    className={`
                        w-full flex items-center justify-between gap-3 p-4 rounded-xl transition-all
                        ${isCompleted
                            ? 'border-2 border-volt bg-volt/10'
                            : 'border border-white/10 bg-neutral-900/60'
                        }
                    `}
                >
                    <div className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 ${isCompleted ? 'text-volt' : 'text-neutral-400'}`} />
                        <span className={`font-mono text-sm uppercase ${isCompleted ? 'text-volt' : 'text-white'}`}>
                            {isCompleted ? labels?.completedLabel : labels?.label}
                        </span>
                    </div>

                    {/* Checkbox circle */}
                    <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                        ${isCompleted
                            ? 'bg-volt'
                            : 'border-2 border-neutral-600'
                        }
                    `}>
                        {isCompleted && <Check className="w-4 h-4 text-black" />}
                    </div>
                </motion.button>
            );
        };

        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col p-6 pt-2 pb-32 space-y-4">

                        {/* Script Card + Call Button - Only if has script strategies */}
                        {hasScriptStrategies && script && (
                            <>
                                {/* Script Card - Style Terminal */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-neutral-900/60 border border-white/10 rounded-2xl p-4"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-mono text-xs text-volt uppercase tracking-wider">
                                            {L.scriptLabel}
                                        </span>
                                        <button
                                            onClick={handleCopyScript}
                                            className="flex items-center gap-1.5 text-neutral-500 hover:text-white transition-colors"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                            <span className="text-xs">{copied ? L.copied : L.copyScript}</span>
                                        </button>
                                    </div>

                                    {/* Script Content - Dynamic */}
                                    <div className="font-mono text-sm text-neutral-400 space-y-3">
                                        <p className="italic">{script.intro}</p>

                                        {script.points && (
                                            <ol className="space-y-2 list-decimal list-inside">
                                                {script.points.map((point, i) => (
                                                    <li key={i} className="text-neutral-400">
                                                        <span className="text-white font-semibold">{point}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        )}

                                        <p className="italic">{script.outro}</p>
                                    </div>
                                </motion.div>

                                {/* Call Bank Button */}
                                <motion.a
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    href="tel:"
                                    className="flex items-center justify-center gap-2 w-full py-4 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/5 transition-colors"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>{L.callBank}</span>
                                </motion.a>

                                {/* Divider */}
                                <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
                            </>
                        )}

                        {/* Procedure Card + Open App Button - Only if no script strategies (autonomous actions) */}
                        {!hasScriptStrategies && procedure && (
                            <>
                                {/* Procedure Card - Same style as Script */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-neutral-900/60 border border-white/10 rounded-2xl p-4"
                                >
                                    {/* Header */}
                                    <div className="mb-3">
                                        <span className="font-mono text-xs text-volt uppercase tracking-wider">
                                            {L.procedureLabel}
                                        </span>
                                    </div>

                                    {/* Procedure Steps */}
                                    <ol className="space-y-2 list-decimal list-inside font-mono text-sm">
                                        {procedure.map((step, i) => (
                                            <li key={i} className="text-neutral-400">
                                                <span className="text-white">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </motion.div>

                                {/* Open Bank App Button */}
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    onClick={() => haptic.light()}
                                    className="flex items-center justify-center gap-2 w-full py-4 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/5 transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    <span>{L.openBankApp}</span>
                                </motion.button>

                                {/* Divider */}
                                <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
                            </>
                        )}

                        {/* Simple Checklist - All selected strategies */}
                        <div className="space-y-3">
                            {selectedStrategyDetails.map((strategy, index) =>
                                renderChecklistItem(strategy, index, (hasScriptStrategies || procedure) ? 0.15 : 0)
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer CTA - Locked until all actions completed */}
                <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                    <motion.button
                        whileTap={allActionsCompleted ? { scale: 0.97 } : {}}
                        onClick={handleFinish}
                        disabled={!allActionsCompleted}
                        animate={allActionsCompleted ? {
                            scale: [0.95, 1.02, 1],
                            transition: { duration: 0.3, ease: 'easeOut' }
                        } : {}}
                        className={`
                            w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center gap-2
                            transition-all duration-300 border-[3px] cta-ios-fix
                            ${allActionsCompleted
                                ? 'bg-volt text-black border-black cta-active'
                                : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed'
                            }
                        `}
                    >
                        <span className="cta-content cta-content-animate">
                            {L.actionCta}
                            <ChevronRight className="w-5 h-5" />
                        </span>
                    </motion.button>
                </div>
            </div>
        );
    }

    return null;
};

export default ExecutionScreen;
