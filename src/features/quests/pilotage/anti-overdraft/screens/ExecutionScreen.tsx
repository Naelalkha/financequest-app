import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    ChevronRight, Wallet, Copy, Check,
    ArrowRightCircle, Bell, Calendar, Shield, Phone,
    AlertTriangle, AlertCircle, CheckCircle2, Sparkles
} from 'lucide-react';
import {
    calculateRAV,
    calculateTotalImpact,
    hasStrategiesRequiringCall,
    getStrategiesRequiringCall,
    getStrategiesForRiskLevel,
    isStrategyPriority,
    strategies,
    bankCallScript,
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
    ArrowRightCircle,
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

    // Calculate RAV in real-time
    const ravResult = useMemo(() => calculateRAV(revenus, chargesFixes), [revenus, chargesFixes]);
    const riskConfig = RISK_LEVELS[ravResult.riskLevel as RiskLevel];

    // Calculate total impact
    const totalImpact = useMemo(() => calculateTotalImpact(selectedStrategies), [selectedStrategies]);

    // Check if bank call needed
    const needsBankCall = useMemo(() => hasStrategiesRequiringCall(selectedStrategies), [selectedStrategies]);
    const callStrategies = useMemo(() => getStrategiesRequiringCall(selectedStrategies), [selectedStrategies]);

    // Toggle strategy selection
    const toggleStrategy = useCallback((strategyId: string) => {
        haptic.light();
        setSelectedStrategies(prev =>
            prev.includes(strategyId)
                ? prev.filter(id => id !== strategyId)
                : [...prev, strategyId]
        );
    }, []);

    // Copy script to clipboard
    const copyScript = useCallback(() => {
        const script = locale === 'en' ? bankCallScript.introEn : bankCallScript.introFr;
        const points = locale === 'en' ? bankCallScript.pointsEn : bankCallScript.pointsFr;
        const outro = locale === 'en' ? bankCallScript.outroEn : bankCallScript.outroFr;

        // Filter points based on selected strategies
        const relevantPoints = points.filter((_, index) => {
            if (index === 0) return selectedStrategies.includes('delay-debits');
            if (index === 1) return selectedStrategies.includes('sms-alert');
            if (index === 2 || index === 3) return selectedStrategies.includes('negotiate-overdraft');
            return false;
        });

        const fullScript = `${script}\n\n${relevantPoints.map(p => `• ${p}`).join('\n')}\n\n${outro}`;
        navigator.clipboard.writeText(fullScript);

        haptic.success();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [locale, selectedStrategies]);

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

    // Go to action step or finish
    const goToAction = useCallback(() => {
        haptic.medium();
        onUpdate({
            selectedStrategies,
            totalImpact
        });

        if (needsBankCall) {
            setStep('action');
        } else {
            // Skip action step, go directly to debrief
            onNext();
        }
    }, [selectedStrategies, totalImpact, needsBankCall, onUpdate, setStep, onNext]);

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
            revenusHint: 'Salaire, allocations, revenus réguliers',
            chargesLabel: 'TES CHARGES FIXES',
            chargesHint: 'Loyer, crédits, abonnements, assurances',
            ravLabel: 'TON RESTE À VIVRE',
            ratioLabel: 'de tes revenus',
            diagnosticCta: 'CONTINUER',

            // Strategy
            strategyIntro: 'Sélectionne les stratégies à activer',
            impactLabel: 'IMPACT ESTIMÉ',
            protectionLabel: 'protection',
            perMonth: '/mois',
            strategyCta: 'CONTINUER',
            noStrategy: 'Sélectionne au moins une stratégie',

            // Action
            actionIntro: 'Certaines stratégies nécessitent un appel à ta banque.',
            scriptLabel: 'SCRIPT D\'APPEL',
            copyScript: 'Copier le script',
            copied: 'Copié !',
            callHint: 'Appelle le numéro de ta banque',
            actionCta: 'VOIR MON IMPACT'
        },
        en: {
            // Diagnostic
            revenusLabel: 'YOUR NET MONTHLY INCOME',
            revenusHint: 'Salary, benefits, regular income',
            chargesLabel: 'YOUR FIXED EXPENSES',
            chargesHint: 'Rent, loans, subscriptions, insurance',
            ravLabel: 'YOUR DISPOSABLE INCOME',
            ratioLabel: 'of your income',
            diagnosticCta: 'CONTINUE',

            // Strategy
            strategyIntro: 'Select strategies to activate',
            impactLabel: 'ESTIMATED IMPACT',
            protectionLabel: 'protection',
            perMonth: '/month',
            strategyCta: 'CONTINUE',
            noStrategy: 'Select at least one strategy',

            // Action
            actionIntro: 'Some strategies require a call to your bank.',
            scriptLabel: 'CALL SCRIPT',
            copyScript: 'Copy script',
            copied: 'Copied!',
            callHint: 'Call your bank number',
            actionCta: 'SEE MY IMPACT'
        }
    };
    const L = labels[locale] || labels.fr;

    // STEP 1: DIAGNOSTIC
    if (step === 'diagnostic') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col p-6 pt-2 pb-32">

                        {/* REVENUS INPUT */}
                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-3 px-1 gap-4">
                                <div className="flex-1 min-w-0">
                                    <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wide block truncate">
                                        {L.revenusLabel}
                                    </label>
                                    <span className="font-mono text-xs text-neutral-500 block truncate">
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
                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-3 px-1 gap-4">
                                <div className="flex-1 min-w-0">
                                    <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wide block truncate">
                                        {L.chargesLabel}
                                    </label>
                                    <span className="font-mono text-xs text-neutral-500 block truncate">
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
                            className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                        >
                            <div className="flex items-center gap-4">
                                {/* Icône seule - pas de cercle/fond */}
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
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[10px] text-neutral-500">
                                            {Math.round(ravResult.ratio * 100)}% {L.ratioLabel}
                                        </span>
                                        {(() => {
                                            const RiskIcon = RISK_ICON_MAP[riskConfig.iconName] || CheckCircle2;
                                            return (
                                                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1.5 ${riskConfig.bgClass} ${riskConfig.colorClass} ${riskConfig.borderClass}`}>
                                                    <RiskIcon className="w-3.5 h-3.5" />
                                                    {locale === 'en' ? riskConfig.labelEn : riskConfig.labelFr}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
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

                        {/* Risk-based contextual message */}
                        {(() => {
                            const RiskIcon = RISK_ICON_MAP[riskConfig.iconName] || CheckCircle2;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mb-4 p-4 rounded-2xl ${riskConfig.bgClass} ${riskConfig.borderClass}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${currentRiskLevel === 'CRITIQUE' ? 'bg-volt/20' : 'bg-neutral-800'}`}>
                                            <RiskIcon className={`w-5 h-5 ${riskConfig.colorClass}`} />
                                        </div>
                                        <div>
                                            <span className={`font-mono text-xs font-bold ${riskConfig.colorClass} block mb-1`}>
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

                        {/* Intro */}
                        <p className="font-mono text-sm text-neutral-400 mb-4">
                            {L.strategyIntro}
                        </p>

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
                                        className={`w-full rounded-2xl border text-left selectable-card ${
                                            isSelected
                                                ? 'bg-neutral-900 border-volt selectable-card--active'
                                                : 'bg-neutral-900 border-neutral-800 active:bg-neutral-800'
                                        }`}
                                    >
                                        <div className="p-4 flex items-start gap-3">
                                            {/* Icon seule - PAS DE CERCLE/FOND */}
                                            <IconComponent className={`w-6 h-6 flex-shrink-0 mt-0.5 ${isSelected ? 'text-volt' : 'text-neutral-500'}`} />

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`font-mono text-sm font-bold uppercase ${isSelected ? 'text-volt' : 'text-white'}`}>
                                                        {locale === 'en' ? strategy.labelEn : strategy.labelFr}
                                                    </span>
                                                    {/* Impact indicator */}
                                                    <div className="flex-shrink-0">
                                                        {strategy.isProtection ? (
                                                            <Shield className="w-5 h-5 text-volt" />
                                                        ) : (
                                                            <span className="font-mono text-sm font-bold text-volt whitespace-nowrap">
                                                                +{strategy.monthlyImpact}€/m
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-neutral-500 mt-1">
                                                    {locale === 'en' ? strategy.descEn : strategy.descFr}
                                                </p>
                                                {/* Bank call indicator - style outline monochrome */}
                                                {strategy.requiresBankCall && (
                                                    <span className="inline-flex items-center gap-1.5 mt-2 text-neutral-500 font-mono text-[10px]">
                                                        <Phone className="w-3 h-3" />
                                                        {locale === 'en' ? 'Bank call required' : 'Appel banque requis'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Total Impact Card */}
                        {selectedStrategies.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 bg-volt/10 border border-volt/30 rounded-2xl p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[11px] text-volt uppercase font-bold">
                                        {L.impactLabel}
                                    </span>
                                    <span className="font-mono text-xl font-bold text-volt">
                                        +{totalImpact}€{L.perMonth}
                                    </span>
                                </div>
                            </motion.div>
                        )}
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

    // STEP 3: ACTION (Bank Call Script)
    if (step === 'action') {
        const scriptIntro = locale === 'en' ? bankCallScript.introEn : bankCallScript.introFr;
        const scriptPoints = locale === 'en' ? bankCallScript.pointsEn : bankCallScript.pointsFr;
        const scriptOutro = locale === 'en' ? bankCallScript.outroEn : bankCallScript.outroFr;

        // Filter relevant points based on selected strategies
        const relevantPointsIndices: number[] = [];
        if (selectedStrategies.includes('delay-debits')) relevantPointsIndices.push(0);
        if (selectedStrategies.includes('sms-alert')) relevantPointsIndices.push(1);
        if (selectedStrategies.includes('negotiate-overdraft')) {
            relevantPointsIndices.push(2);
            relevantPointsIndices.push(3);
        }

        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col p-6 pt-2 pb-32">

                        {/* Intro */}
                        <p className="font-mono text-sm text-neutral-400 mb-6">
                            {L.actionIntro}
                        </p>

                        {/* Script Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-neutral-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-[20px]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-mono text-[11px] text-volt uppercase font-bold">
                                    {L.scriptLabel}
                                </span>
                                <button
                                    onClick={copyScript}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                                        copied
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                                    }`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? L.copied : L.copyScript}
                                </button>
                            </div>

                            {/* Script Content */}
                            <div className="space-y-4 text-neutral-300 text-sm">
                                <p className="italic">"{scriptIntro}"</p>

                                <ul className="space-y-2">
                                    {relevantPointsIndices.map(index => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-volt">•</span>
                                            <span>{scriptPoints[index]}</span>
                                        </li>
                                    ))}
                                </ul>

                                <p className="italic">"{scriptOutro}"</p>
                            </div>
                        </motion.div>

                        {/* Call Hint */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-4 flex items-center justify-center gap-2 text-neutral-500"
                        >
                            <Phone className="w-4 h-4" />
                            <span className="font-mono text-xs">{L.callHint}</span>
                        </motion.div>

                        {/* Selected Strategies Reminder - monochrome */}
                        <div className="mt-6 space-y-2">
                            {callStrategies.map(strategy => {
                                const IconComponent = ICON_MAP[strategy.iconName] || Shield;
                                return (
                                    <div
                                        key={strategy.id}
                                        className="flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-700 rounded-xl"
                                    >
                                        <IconComponent className="w-4 h-4 text-volt" />
                                        <span className="text-sm text-neutral-300">
                                            {locale === 'en' ? strategy.labelEn : strategy.labelFr}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleFinish}
                        className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] border-black cta-ios-fix cta-active"
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
