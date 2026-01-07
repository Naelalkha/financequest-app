import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Home, Heart, PiggyBank, ChevronRight, Zap, ArrowRight, LucideIcon } from 'lucide-react';
import {
    calculateBudgetSplit,
    envelopeCategories,
    envelopeLabels,
    getCategoryDiagnosis,
    calculateCompoundGrowth
} from '../insightData';
import { Slider } from '../../../../../components/ui';
import { haptic } from '../../../../../utils/haptics';

/** Quest data from flow */
interface QuestData {
  monthlyIncome?: number;
  idealNeeds?: number;
  idealWants?: number;
  idealSavings?: number;
  actualNeeds?: number;
  actualWants?: number;
  actualSavings?: number;
  didDiagnosis?: boolean;
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

/**
 * ExecutionScreen - Phase 2: Budget Configuration + Diagnosis
 *
 * Quest: BUDGET 50/30/20
 * 3-STEP FLOW:
 * Step 1: "revelation" - Enter income, see ideal budget split
 * Step 2: "diagnosis-prompt" - Ask if user wants to compare to reality
 * Step 3: "diagnosis" - Enter actual expenses, see comparison
 */

// Icon map for envelope categories
const ICON_MAP: Record<string, LucideIcon> = {
    Home: Home,
    Heart: Heart,
    PiggyBank: PiggyBank
};

const ExecutionScreen: React.FC<ExecutionScreenProps> = ({ data = {}, onUpdate, onNext, step, setStep }) => {
    const { i18n } = useTranslation('quests');
    const locale = i18n.language;

    // Local state
    const [monthlyIncome, setMonthlyIncome] = useState(data.monthlyIncome || 2500);
    const [actualNeeds, setActualNeeds] = useState(data.actualNeeds || 0);
    const [actualWants, setActualWants] = useState(data.actualWants || 0);
    const [actualSavings, setActualSavings] = useState(data.actualSavings || 0);

    // Animated counters - initialize with calculated values to avoid starting from 0
    const initialBudget = useMemo(() => calculateBudgetSplit(data.monthlyIncome || 2500), []);
    const [animatedNeeds, setAnimatedNeeds] = useState(initialBudget.needs);
    const [animatedWants, setAnimatedWants] = useState(initialBudget.wants);
    const [animatedSavings, setAnimatedSavings] = useState(initialBudget.savings);

    // Get envelope labels
    const envLabels = envelopeLabels[locale] || envelopeLabels.fr;

    // Calculate ideal budget split
    const idealBudget = useMemo(() =>
        calculateBudgetSplit(monthlyIncome),
        [monthlyIncome]
    );

    // Animate counters when income changes - transition from current value to new value
    useEffect(() => {
        const targets = {
            needs: idealBudget.needs,
            wants: idealBudget.wants,
            savings: idealBudget.savings
        };

        // Get current values as starting points
        const starts = {
            needs: animatedNeeds,
            wants: animatedWants,
            savings: animatedSavings
        };

        const duration = 300;
        const steps = 15;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                setAnimatedNeeds(targets.needs);
                setAnimatedWants(targets.wants);
                setAnimatedSavings(targets.savings);
                clearInterval(timer);
            } else {
                const progress = currentStep / steps;
                const eased = 1 - Math.pow(1 - progress, 3);
                setAnimatedNeeds(Math.round(starts.needs + (targets.needs - starts.needs) * eased));
                setAnimatedWants(Math.round(starts.wants + (targets.wants - starts.wants) * eased));
                setAnimatedSavings(Math.round(starts.savings + (targets.savings - starts.savings) * eased));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [idealBudget]);

    // Handlers
    const handleIncomeChange = useCallback((value: number) => {
        setMonthlyIncome(value);
    }, []);

    // Go to diagnosis prompt
    const goToDiagnosisPrompt = useCallback(() => {
        haptic.medium();
        onUpdate({
            monthlyIncome,
            idealNeeds: idealBudget.needs,
            idealWants: idealBudget.wants,
            idealSavings: idealBudget.savings,
            fiveYearProjection: calculateCompoundGrowth(idealBudget.savings, 5, 0.07)
        });
        setStep('diagnosis-prompt');
    }, [monthlyIncome, idealBudget, onUpdate, setStep]);

    // Skip diagnosis and go to debrief
    const skipDiagnosis = useCallback(() => {
        haptic.light();
        onUpdate({
            monthlyIncome,
            idealNeeds: idealBudget.needs,
            idealWants: idealBudget.wants,
            idealSavings: idealBudget.savings,
            didDiagnosis: false,
            fiveYearProjection: calculateCompoundGrowth(idealBudget.savings, 5, 0.07)
        });
        onNext();
    }, [monthlyIncome, idealBudget, onUpdate, onNext]);

    // Go to diagnosis
    const goToDiagnosis = useCallback(() => {
        haptic.heavy();
        // Initialize actual values with ideal values as defaults
        setActualNeeds(idealBudget.needs);
        setActualWants(idealBudget.wants);
        setActualSavings(idealBudget.savings);
        setStep('diagnosis');
    }, [idealBudget, setStep]);

    // Complete with diagnosis
    const completeDiagnosis = useCallback(() => {
        haptic.success();
        onUpdate({
            monthlyIncome,
            idealNeeds: idealBudget.needs,
            idealWants: idealBudget.wants,
            idealSavings: idealBudget.savings,
            actualNeeds,
            actualWants,
            actualSavings,
            didDiagnosis: true,
            fiveYearProjection: calculateCompoundGrowth(idealBudget.savings, 5, 0.07)
        });
        onNext();
    }, [monthlyIncome, idealBudget, actualNeeds, actualWants, actualSavings, onUpdate, onNext]);

    // Validation
    const canProceed = monthlyIncome >= 500;

    // Labels
    const labels = {
        fr: {
            // Step 1: Revenue input
            incomeLabel: 'TON REVENU NET MENSUEL',
            incomeHint: 'Après impôts',
            budgetLabel: 'TON BUDGET IDÉAL',
            revelationCta: 'VOIR MON DIAGNOSTIC',

            // Step 2: Diagnosis prompt
            diagnosisQuestion: 'Tu veux comparer à ta réalité ?',
            diagnosisYes: 'OUI, DIAGNOSTIQUE-MOI',
            diagnosisSkip: 'Passer',

            // Step 3: Actual expenses
            actualLabel: 'TES DÉPENSES RÉELLES',
            actualNeeds: 'Combien dépenses-tu en besoins ?',
            actualWants: 'Combien dépenses-tu en envies ?',
            actualSavings: 'Combien épargnes-tu ?',
            diagnosisCta: 'VOIR L\'IMPACT',
            idealPrefix: 'Idéal:',

            // Categories
            needs: 'BESOINS',
            wants: 'ENVIES',
            savings: 'ÉPARGNE',

            // Diagnosis status
            balanced: 'Équilibré',
            warning: 'À ajuster',
            critical: 'Déséquilibré'
        },
        en: {
            incomeLabel: 'YOUR NET MONTHLY INCOME',
            incomeHint: 'After taxes',
            budgetLabel: 'YOUR IDEAL BUDGET',
            revelationCta: 'SEE MY DIAGNOSIS',

            diagnosisQuestion: 'Want to compare to your reality?',
            diagnosisYes: 'YES, DIAGNOSE ME',
            diagnosisSkip: 'Skip',

            actualLabel: 'YOUR ACTUAL EXPENSES',
            actualNeeds: 'How much do you spend on needs?',
            actualWants: 'How much do you spend on wants?',
            actualSavings: 'How much do you save?',
            diagnosisCta: 'SEE THE IMPACT',
            idealPrefix: 'Ideal:',

            needs: 'NEEDS',
            wants: 'WANTS',
            savings: 'SAVINGS',

            balanced: 'Balanced',
            warning: 'Needs adjustment',
            critical: 'Unbalanced'
        }
    };
    const L = labels[locale] || labels.fr;

    // Get diagnosis status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'balanced': return 'text-emerald-400';
            case 'warning': return 'text-amber-400';
            case 'critical': return 'text-red-400';
            default: return 'text-neutral-400';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'balanced': return 'bg-emerald-500/20';
            case 'warning': return 'bg-amber-500/20';
            case 'critical': return 'bg-red-500/20';
            default: return 'bg-neutral-500/20';
        }
    };

    // STEP 1: INCOME INPUT + IDEAL BUDGET
    if (step === 'revelation') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col p-6 pt-2 pb-32">

                        {/* INCOME INPUT */}
                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-3 px-1">
                                <div>
                                    <label className="font-mono text-[11px] text-neutral-500 uppercase tracking-wide block">
                                        {L.incomeLabel}
                                    </label>
                                    <span className="font-mono text-[10px] text-neutral-600">
                                        {L.incomeHint}
                                    </span>
                                </div>
                                <div className="flex items-baseline">
                                    <motion.span
                                        key={monthlyIncome}
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        className="text-4xl font-sans font-black text-white"
                                    >
                                        {monthlyIncome.toLocaleString('fr-FR')}
                                    </motion.span>
                                    <span className="font-sans font-bold text-neutral-500 text-lg ml-1">€</span>
                                </div>
                            </div>
                            <div className="slider-container">
                                <Slider
                                    value={monthlyIncome}
                                    onChange={handleIncomeChange}
                                    min={500}
                                    max={10000}
                                    step={100}
                                    hapticOnChange={true}
                                    hapticOnSnap={true}
                                />
                            </div>
                        </div>

                        {/* BUDGET SPLIT LABEL */}
                        <div className="mb-4">
                            <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-wide">
                                {L.budgetLabel}
                            </span>
                        </div>

                        {/* 3 ENVELOPE CARDS */}
                        <div className="space-y-3">
                            {/* BESOINS (50%) */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <Home className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-mono text-[11px] text-neutral-400 uppercase">
                                                {L.needs} (50%)
                                            </span>
                                            <span className="font-mono text-xl font-bold text-white">
                                                {animatedNeeds.toLocaleString('fr-FR')} €
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-blue-400 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: '50%' }}
                                                transition={{ delay: 0.2, duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* ENVIES (30%) */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                                        <Heart className="w-6 h-6 text-pink-400 fill-pink-400/30" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-mono text-[11px] text-neutral-400 uppercase">
                                                {L.wants} (30%)
                                            </span>
                                            <span className="font-mono text-xl font-bold text-white">
                                                {animatedWants.toLocaleString('fr-FR')} €
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-pink-400 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: '30%' }}
                                                transition={{ delay: 0.25, duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* ÉPARGNE (20%) */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <PiggyBank className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-mono text-[11px] text-neutral-400 uppercase">
                                                {L.savings} (20%)
                                            </span>
                                            <span className="font-mono text-xl font-bold text-volt">
                                                {animatedSavings.toLocaleString('fr-FR')} €
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-volt rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: '20%' }}
                                                transition={{ delay: 0.3, duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                    <motion.button
                        whileTap={canProceed ? { scale: 0.97 } : {}}
                        onClick={goToDiagnosisPrompt}
                        disabled={!canProceed}
                        className={`
                            w-full font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px]
                            cta-ios-fix ${canProceed ? 'cta-active' : 'cta-inactive'}
                            ${canProceed
                                ? 'bg-volt text-black border-black'
                                : 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed'
                            }
                        `}
                    >
                        <span className="cta-content cta-content-animate">
                            {L.revelationCta}
                            <ChevronRight className="w-5 h-5" />
                        </span>
                    </motion.button>
                </div>
            </div>
        );
    }

    // STEP 2: DIAGNOSIS PROMPT
    if (step === 'diagnosis-prompt') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="p-6 text-center">
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xl font-bold text-white mb-8"
                        >
                            {L.diagnosisQuestion}
                        </motion.h3>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-4"
                        >
                            {/* Primary CTA - Yes */}
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={goToDiagnosis}
                                className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] border-black"
                            >
                                <span className="cta-content">
                                    <Zap className="w-5 h-5 fill-current" />
                                    {L.diagnosisYes}
                                </span>
                            </motion.button>

                            {/* Ghost link - Skip */}
                            <button
                                onClick={skipDiagnosis}
                                className="text-neutral-500 hover:text-neutral-400 font-mono text-sm flex items-center justify-center gap-1 mx-auto transition-colors"
                            >
                                {L.diagnosisSkip}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        );
    }

    // STEP 3: DIAGNOSIS (actual expenses input)
    const needsDiagnosis = getCategoryDiagnosis('needs', idealBudget.needs, actualNeeds);
    const wantsDiagnosis = getCategoryDiagnosis('wants', idealBudget.wants, actualWants);
    const savingsDiagnosis = getCategoryDiagnosis('savings', idealBudget.savings, actualSavings);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col p-6 pt-2 pb-32">

                    {/* ACTUAL EXPENSES LABEL */}
                    <div className="mb-4">
                        <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-wide">
                            {L.actualLabel}
                        </span>
                    </div>

                    {/* 3 INPUT CARDS WITH COMPARISON */}
                    <div className="space-y-4">
                        {/* BESOINS */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <Home className="w-5 h-5 text-blue-400" />
                                <span className="font-mono text-[11px] text-neutral-400 uppercase flex-1">
                                    {L.needs}
                                </span>
                                <span className="font-mono text-xs text-neutral-500">
                                    {L.idealPrefix} {idealBudget.needs.toLocaleString('fr-FR')} €
                                </span>
                            </div>
                            <Slider
                                value={actualNeeds}
                                onChange={setActualNeeds}
                                min={0}
                                max={monthlyIncome}
                                step={50}
                                hapticOnChange={true}
                            />
                            <div className="flex items-center justify-between mt-2">
                                <span className={`font-mono text-xs ${getStatusColor(needsDiagnosis.status)}`}>
                                    {needsDiagnosis.delta > 0 ? '+' : ''}{needsDiagnosis.delta.toLocaleString('fr-FR')} €
                                </span>
                                <span className="font-mono text-lg font-bold text-white">
                                    {actualNeeds.toLocaleString('fr-FR')} €
                                </span>
                            </div>
                        </motion.div>

                        {/* ENVIES */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <Heart className="w-5 h-5 text-pink-400" />
                                <span className="font-mono text-[11px] text-neutral-400 uppercase flex-1">
                                    {L.wants}
                                </span>
                                <span className="font-mono text-xs text-neutral-500">
                                    {L.idealPrefix} {idealBudget.wants.toLocaleString('fr-FR')} €
                                </span>
                            </div>
                            <Slider
                                value={actualWants}
                                onChange={setActualWants}
                                min={0}
                                max={monthlyIncome}
                                step={50}
                                hapticOnChange={true}
                            />
                            <div className="flex items-center justify-between mt-2">
                                <span className={`font-mono text-xs ${getStatusColor(wantsDiagnosis.status)}`}>
                                    {wantsDiagnosis.delta > 0 ? '+' : ''}{wantsDiagnosis.delta.toLocaleString('fr-FR')} €
                                </span>
                                <span className="font-mono text-lg font-bold text-white">
                                    {actualWants.toLocaleString('fr-FR')} €
                                </span>
                            </div>
                        </motion.div>

                        {/* ÉPARGNE */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 backdrop-blur-[20px]"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <PiggyBank className="w-5 h-5 text-emerald-400" />
                                <span className="font-mono text-[11px] text-neutral-400 uppercase flex-1">
                                    {L.savings}
                                </span>
                                <span className="font-mono text-xs text-neutral-500">
                                    {L.idealPrefix} {idealBudget.savings.toLocaleString('fr-FR')} €
                                </span>
                            </div>
                            <Slider
                                value={actualSavings}
                                onChange={setActualSavings}
                                min={0}
                                max={monthlyIncome}
                                step={50}
                                hapticOnChange={true}
                            />
                            <div className="flex items-center justify-between mt-2">
                                <span className={`font-mono text-xs ${getStatusColor(savingsDiagnosis.status)}`}>
                                    {savingsDiagnosis.delta > 0 ? '+' : ''}{savingsDiagnosis.delta.toLocaleString('fr-FR')} €
                                </span>
                                <span className="font-mono text-lg font-bold text-volt">
                                    {actualSavings.toLocaleString('fr-FR')} €
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="p-4 bg-black/90 backdrop-blur-sm border-t border-neutral-800 cta-footer-container">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={completeDiagnosis}
                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl flex items-center justify-center border-[3px] border-black cta-ios-fix cta-active"
                >
                    <span className="cta-content cta-content-animate">
                        <Zap className="w-5 h-5 fill-current" />
                        {L.diagnosisCta}
                    </span>
                </motion.button>
            </div>
        </div>
    );
};

export default ExecutionScreen;
