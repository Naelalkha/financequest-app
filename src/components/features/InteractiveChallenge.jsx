import React, { useState, useEffect } from 'react';
import { 
  FaCalculator, FaChartPie, FaDollarSign, FaBalanceScale,
  FaPiggyBank, FaChartLine, FaExclamationTriangle, FaCheckCircle,
  FaLightbulb, FaRocket, FaTrophy, FaUndo, FaPlay, FaTimes, FaPlus, FaFire
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import ProgressBar from '../common/ProgressBar';
import { toast } from 'react-toastify';
import posthog from 'posthog-js';

const InteractiveChallenge = ({ step, onComplete }) => {
  const { t } = useLanguage();
  const [challengeState, setChallengeState] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Types de défis interactifs
  const challengeTypes = {
    BUDGET_CALCULATOR: 'budget_calculator',
    INVESTMENT_SIMULATOR: 'investment_simulator',
    DEBT_PAYOFF: 'debt_payoff',
    SAVINGS_GOAL: 'savings_goal',
    EXPENSE_SORTER: 'expense_sorter'
  };

  const getChallengeComponent = () => {
    switch (step.challengeType) {
      case challengeTypes.BUDGET_CALCULATOR:
        return <BudgetCalculatorChallenge />;
      case challengeTypes.INVESTMENT_SIMULATOR:
        return <InvestmentSimulatorChallenge />;
      case challengeTypes.DEBT_PAYOFF:
        return <DebtPayoffChallenge />;
      case challengeTypes.SAVINGS_GOAL:
        return <SavingsGoalChallenge />;
      case challengeTypes.EXPENSE_SORTER:
        return <ExpenseSorterChallenge />;
      default:
        return <BudgetCalculatorChallenge />; // Default
    }
  };

  // Debt Payoff Challenge
  const DebtPayoffChallenge = () => {
    const [debts, setDebts] = useState([
      { id: 1, name: '', balance: '', rate: '', minimum: '' }
    ]);
    const [extraPayment, setExtraPayment] = useState('');
    const [results, setResults] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const addDebt = () => {
      setDebts([...debts, { id: Date.now(), name: '', balance: '', rate: '', minimum: '' }]);
    };

    const removeDebt = (id) => {
      if (debts.length > 1) {
        setDebts(debts.filter(debt => debt.id !== id));
      }
    };

    const updateDebt = (id, field, value) => {
      setDebts(debts.map(debt => 
        debt.id === id ? { ...debt, [field]: value } : debt
      ));
    };

    const calculateAvalanche = () => {
      // Filtrer et trier les dettes par taux d'intérêt (plus élevé en premier)
      const validDebts = debts
        .filter(d => d.name && d.balance && d.rate && d.minimum)
        .map(d => ({
          ...d,
          originalBalance: parseFloat(d.balance),
          balance: parseFloat(d.balance),
          rate: parseFloat(d.rate) / 100 / 12, // Taux mensuel
          annualRate: parseFloat(d.rate),
          minimum: parseFloat(d.minimum)
        }))
        .sort((a, b) => b.annualRate - a.annualRate);

      if (validDebts.length === 0) {
        toast.warning(t('challenge.enter_debt_info') || 'Please enter at least one debt with all information');
        return;
      }

      const extra = parseFloat(extraPayment) || 0;
      let totalInterest = 0;
      let months = 0;
      const payoffOrder = [];
      const monthlyDetails = [];

      // Copie des dettes pour la simulation
      let remainingDebts = validDebts.map(d => ({ ...d }));
      
      // Vérifier que les paiements minimums couvrent au moins les intérêts
      for (let debt of remainingDebts) {
        const monthlyInterest = debt.balance * debt.rate;
        if (debt.minimum <= monthlyInterest) {
          toast.error(
            t('challenge.minimum_too_low') || 
            `Minimum payment for ${debt.name} must be higher than monthly interest (${monthlyInterest.toFixed(2)})`
          );
          return;
        }
      }

      // Simulation mois par mois
      while (remainingDebts.some(d => d.balance > 0.01)) {
        months++;
        let monthlyInterestTotal = 0;
        let availableExtra = extra;

        // D'abord, appliquer les paiements minimums à toutes les dettes
        for (let debt of remainingDebts) {
          if (debt.balance > 0.01) {
            // Calculer les intérêts pour ce mois
            const interest = debt.balance * debt.rate;
            monthlyInterestTotal += interest;
            totalInterest += interest;
            
            // Le paiement minimum va d'abord aux intérêts, puis au principal
            const principalPayment = debt.minimum - interest;
            
            if (principalPayment > 0) {
              debt.balance = Math.max(0, debt.balance - principalPayment);
            }
            
            // Si la dette est payée avec le minimum, libérer ce montant pour extra
            if (debt.balance <= 0.01 && !payoffOrder.find(p => p.name === debt.name)) {
              payoffOrder.push({ 
                name: debt.name, 
                month: months,
                originalBalance: debt.originalBalance,
                totalPaid: debt.originalBalance + (interest * months)
              });
              // Ajouter le paiement minimum aux paiements extra disponibles
              availableExtra += debt.minimum;
              debt.balance = 0;
            }
          }
        }

        // Ensuite, appliquer tout paiement supplémentaire à la dette au taux le plus élevé
        for (let debt of remainingDebts) {
          if (debt.balance > 0.01 && availableExtra > 0) {
            const payment = Math.min(availableExtra, debt.balance);
            debt.balance -= payment;
            availableExtra -= payment;

            if (debt.balance <= 0.01 && !payoffOrder.find(p => p.name === debt.name)) {
              payoffOrder.push({ 
                name: debt.name, 
                month: months,
                originalBalance: debt.originalBalance,
                totalPaid: debt.originalBalance + totalInterest
              });
              debt.balance = 0;
            }
            
            // Méthode avalanche : on ne paie qu'une dette à la fois avec l'extra
            break;
          }
        }

        // Enregistrer les détails du mois
        monthlyDetails.push({
          month: months,
          interest: monthlyInterestTotal,
          remainingBalance: remainingDebts.reduce((sum, d) => sum + d.balance, 0)
        });

        // Sécurité pour éviter les boucles infinies
        if (months > 360) {
          toast.error(t('challenge.payoff_too_long') || 'Payoff period exceeds 30 years. Consider increasing payments.');
          return;
        }
      }

      // Calculer les économies par rapport au paiement minimum seul
      let minOnlyMonths = 0;
      let minOnlyInterest = 0;
      let minOnlyDebts = validDebts.map(d => ({ ...d }));
      
      while (minOnlyDebts.some(d => d.balance > 0.01) && minOnlyMonths < 360) {
        minOnlyMonths++;
        for (let debt of minOnlyDebts) {
          if (debt.balance > 0.01) {
            const interest = debt.balance * debt.rate;
            minOnlyInterest += interest;
            const principalPayment = debt.minimum - interest;
            debt.balance = Math.max(0, debt.balance - principalPayment);
          }
        }
      }

      const interestSaved = minOnlyInterest - totalInterest;
      const monthsSaved = minOnlyMonths - months;

      setResults({
        totalMonths: months,
        totalInterest: Math.round(totalInterest),
        payoffOrder,
        monthlyPayment: validDebts.reduce((sum, d) => sum + d.minimum, 0) + extra,
        totalPaid: validDebts.reduce((sum, d) => sum + d.originalBalance, 0) + totalInterest,
        interestSaved: Math.round(interestSaved),
        monthsSaved: monthsSaved,
        monthlyDetails
      });
      setShowResults(true);
      
      // Marquer comme complété après visualisation
      setTimeout(() => {
        setIsCompleted(true);
        
        // Capture l'événement PostHog pour la validation d'étape
        posthog.capture('quest_step_complete', {
          step_id: step.id || step.title,
          step_type: 'interactive_challenge',
          quest_id: step.questId,
          challenge_type: 'debt_payoff',
          debts_count: validDebts.length,
          total_debt: validDebts.reduce((sum, d) => sum + d.originalBalance, 0),
          months_to_payoff: months,
          interest_saved: interestSaved
        });
        
        onComplete({
          completed: true,
          score: 100,
          data: { 
            debts: validDebts.length,
            totalDebt: validDebts.reduce((sum, d) => sum + d.originalBalance, 0),
            months,
            interestSaved
          }
        });
      }, 3000);
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <FaChartLine className="text-red-400" />
            {t('challenge.debt_avalanche_title') || 'Debt Avalanche Calculator'}
          </h3>

          <p className="text-gray-400 mb-6">
            {t('challenge.debt_avalanche_desc') || 'List your debts and see how the avalanche method saves you money by paying high-interest debts first.'}
          </p>

          {/* Debt List */}
          <div className="space-y-4 mb-6">
            {debts.map((debt, index) => (
              <div key={debt.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-300">
                    {t('challenge.debt') || 'Debt'} #{index + 1}
                  </h4>
                  {debts.length > 1 && (
                    <button
                      onClick={() => removeDebt(debt.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={debt.name}
                    onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                    placeholder={t('challenge.debt_name') || 'Debt name'}
                    className="col-span-2 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  <div className="relative">
                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="number"
                      value={debt.balance}
                      onChange={(e) => updateDebt(debt.id, 'balance', e.target.value)}
                      placeholder={t('challenge.balance') || 'Balance'}
                      className="w-full pl-8 pr-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={debt.rate}
                      onChange={(e) => updateDebt(debt.id, 'rate', e.target.value)}
                      placeholder={t('challenge.apr') || 'APR %'}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                  <div className="relative col-span-2">
                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="number"
                      value={debt.minimum}
                      onChange={(e) => updateDebt(debt.id, 'minimum', e.target.value)}
                      placeholder={t('challenge.minimum_payment') || 'Minimum payment'}
                      className="w-full pl-8 pr-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Debt Button */}
          <button
            onClick={addDebt}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            <FaPlus />
            {t('challenge.add_debt') || 'Add Another Debt'}
          </button>

          {/* Extra Payment */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('challenge.extra_payment') || 'Extra Monthly Payment'}
            </label>
            <div className="relative">
              <FaDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="number"
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {showResults && results && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-slideDown">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-400" />
              {t('challenge.avalanche_results') || 'Avalanche Method Results'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">
                  {t('challenge.payoff_time') || 'Payoff Time'}
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {Math.floor(results.totalMonths / 12)}y {results.totalMonths % 12}m
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {results.monthsSaved > 0 && `(${results.monthsSaved} months saved!)`}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">
                  {t('challenge.total_interest') || 'Total Interest'}
                </p>
                <p className="text-2xl font-bold text-red-400">
                  ${results.totalInterest.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {results.interestSaved > 0 && `(${results.interestSaved.toLocaleString()} saved!)`}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">
                  {t('challenge.monthly_payment') || 'Monthly Payment'}
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  ${Math.round(results.monthlyPayment).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Payoff Order */}
            {results.payoffOrder.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <FaFire className="text-orange-400" />
                  {t('challenge.payoff_order') || 'Payoff Order (Highest Interest First)'}
                </h5>
                <div className="space-y-2">
                  {results.payoffOrder.map((debt, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-600 rounded">
                      <span className="text-gray-300">
                        <span className="text-yellow-400 font-bold mr-2">{index + 1}.</span>
                        {debt.name}
                      </span>
                      <span className="text-green-400">
                        {t('challenge.paid_in') || 'Paid off in'} <strong>{debt.month}</strong> {t('challenge.months') || 'months'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">{t('challenge.total_paid') || 'Total Amount Paid'}</p>
                <p className="text-lg font-bold text-white">
                  ${Math.round(results.totalPaid).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">{t('challenge.effective_rate') || 'Effective Interest Rate'}</p>
                <p className="text-lg font-bold text-white">
                  {((results.totalInterest / (results.totalPaid - results.totalInterest)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <strong>{t('challenge.avalanche_tip') || 'Avalanche Method Success!'}</strong> 
                {' '}
                {t('challenge.avalanche_explanation') || 
                  `By focusing on high-interest debts first and adding ${extraPayment || 0}/month extra, you'll save ${results.interestSaved.toLocaleString()} in interest and be debt-free ${results.monthsSaved} months sooner!`
                }
              </p>
            </div>
          </div>
        )}

        {/* Calculate Button */}
        {!showResults && (
          <button
            onClick={calculateAvalanche}
            disabled={debts.every(d => !d.balance || !d.rate || !d.minimum)}
            className={`
              w-full px-6 py-3 rounded-lg font-semibold transition-all
              ${debts.some(d => d.balance && d.rate && d.minimum)
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {t('challenge.calculate_avalanche') || 'Calculate Debt-Free Date'}
          </button>
        )}
      </div>
    );
  };

  // Savings Goal Challenge (placeholder for now)
  const SavingsGoalChallenge = () => {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Savings Goal Calculator
        </h3>
        <p className="text-gray-400">
          Coming soon! This challenge will help you calculate how long it takes to reach your savings goals.
        </p>
      </div>
    );
  };

  // Budget Calculator Challenge
  const BudgetCalculatorChallenge = () => {
    const [income, setIncome] = useState('');
    const [expenses, setExpenses] = useState({
      needs: '',
      wants: '',
      savings: ''
    });
    const [errors, setErrors] = useState({});

    const validate503020Rule = () => {
      const incomeNum = parseFloat(income) || 0;
      const needsNum = parseFloat(expenses.needs) || 0;
      const wantsNum = parseFloat(expenses.wants) || 0;
      const savingsNum = parseFloat(expenses.savings) || 0;

      const total = needsNum + wantsNum + savingsNum;
      const needsPercent = (needsNum / incomeNum) * 100;
      const wantsPercent = (wantsNum / incomeNum) * 100;
      const savingsPercent = (savingsNum / incomeNum) * 100;

      const newErrors = {};
      let points = 100;

      if (Math.abs(total - incomeNum) > 1) {
        newErrors.total = t('challenge.budget_not_balanced') || 'Budget doesn\'t balance';
        points -= 20;
      }

      if (needsPercent > 55 || needsPercent < 45) {
        newErrors.needs = t('challenge.needs_should_be_50') || 'Needs should be ~50%';
        points -= 10;
      }

      if (wantsPercent > 35 || wantsPercent < 25) {
        newErrors.wants = t('challenge.wants_should_be_30') || 'Wants should be ~30%';
        points -= 10;
      }

      if (savingsPercent < 15) {
        newErrors.savings = t('challenge.savings_should_be_20') || 'Savings should be at least 20%';
        points -= 10;
      }

      setErrors(newErrors);
      return { isValid: Object.keys(newErrors).length === 0, points };
    };

    const handleSubmit = () => {
      const result = validate503020Rule();
      setScore(result.points);
      setShowFeedback(true);
      
      if (result.isValid) {
        setIsCompleted(true);
        setTimeout(() => {
          // Capture l'événement PostHog pour la validation d'étape
          posthog.capture('quest_step_complete', {
            step_id: step.id || step.title,
            step_type: 'interactive_challenge',
            quest_id: step.questId,
            challenge_type: 'budget_calculator',
            score: result.points,
            attempts: attempts + 1,
            income: parseFloat(income) || 0,
            needs_percentage: getPercentage(expenses.needs),
            wants_percentage: getPercentage(expenses.wants),
            savings_percentage: getPercentage(expenses.savings)
          });
          
          onComplete({
            completed: true,
            score: result.points,
            attempts: attempts + 1,
            data: { income, expenses }
          });
        }, 2000);
      } else {
        setAttempts(prev => prev + 1);
      }
    };

    const getPercentage = (value) => {
      const incomeNum = parseFloat(income) || 0;
      return incomeNum > 0 ? ((parseFloat(value) || 0) / incomeNum * 100).toFixed(1) : '0';
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <FaCalculator className="text-yellow-400" />
            {t('challenge.budget_calculator_title') || '50/30/20 Budget Calculator'}
          </h3>
          
          <p className="text-gray-400 mb-6">
            {t('challenge.budget_calculator_desc') || 'Create a balanced budget following the 50/30/20 rule: 50% needs, 30% wants, 20% savings.'}
          </p>

          {/* Income Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('challenge.monthly_income') || 'Monthly Income'}
            </label>
            <div className="relative">
              <FaDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Budget Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Needs */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('challenge.needs') || 'Needs (50%)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={expenses.needs}
                  onChange={(e) => setExpenses({ ...expenses, needs: e.target.value })}
                  placeholder="0"
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none
                    ${errors.needs ? 'border-red-500' : 'border-gray-600 focus:border-yellow-500'}`}
                />
                <span className="absolute right-4 top-3 text-sm text-gray-400">
                  {getPercentage(expenses.needs)}%
                </span>
              </div>
              {errors.needs && (
                <p className="text-red-400 text-xs mt-1">{errors.needs}</p>
              )}
            </div>

            {/* Wants */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('challenge.wants') || 'Wants (30%)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={expenses.wants}
                  onChange={(e) => setExpenses({ ...expenses, wants: e.target.value })}
                  placeholder="0"
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none
                    ${errors.wants ? 'border-red-500' : 'border-gray-600 focus:border-yellow-500'}`}
                />
                <span className="absolute right-4 top-3 text-sm text-gray-400">
                  {getPercentage(expenses.wants)}%
                </span>
              </div>
              {errors.wants && (
                <p className="text-red-400 text-xs mt-1">{errors.wants}</p>
              )}
            </div>

            {/* Savings */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('challenge.savings') || 'Savings (20%)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={expenses.savings}
                  onChange={(e) => setExpenses({ ...expenses, savings: e.target.value })}
                  placeholder="0"
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none
                    ${errors.savings ? 'border-red-500' : 'border-gray-600 focus:border-yellow-500'}`}
                />
                <span className="absolute right-4 top-3 text-sm text-gray-400">
                  {getPercentage(expenses.savings)}%
                </span>
              </div>
              {errors.savings && (
                <p className="text-red-400 text-xs mt-1">{errors.savings}</p>
              )}
            </div>
          </div>

          {/* Total Balance */}
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">{t('challenge.total') || 'Total'}</span>
              <span className={`text-xl font-bold ${errors.total ? 'text-red-400' : 'text-green-400'}`}>
                ${(parseFloat(expenses.needs) || 0) + (parseFloat(expenses.wants) || 0) + (parseFloat(expenses.savings) || 0)}
              </span>
            </div>
            {errors.total && (
              <p className="text-red-400 text-sm mt-2">{errors.total}</p>
            )}
          </div>

          {/* Visual Representation */}
          {income && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <FaChartPie className="text-purple-400" />
                <span className="text-sm text-gray-400">{t('challenge.budget_breakdown') || 'Budget Breakdown'}</span>
              </div>
              <div className="flex h-8 bg-gray-700 rounded-lg overflow-hidden">
                <div 
                  className="bg-blue-500 transition-all duration-500"
                  style={{ width: `${getPercentage(expenses.needs)}%` }}
                />
                <div 
                  className="bg-purple-500 transition-all duration-500"
                  style={{ width: `${getPercentage(expenses.wants)}%` }}
                />
                <div 
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${getPercentage(expenses.savings)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-blue-400">Needs: {getPercentage(expenses.needs)}%</span>
                <span className="text-purple-400">Wants: {getPercentage(expenses.wants)}%</span>
                <span className="text-green-400">Savings: {getPercentage(expenses.savings)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`p-6 rounded-xl animate-slideDown border ${
            isCompleted 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {isCompleted ? (
                <FaTrophy className="text-3xl text-green-400" />
              ) : (
                <FaLightbulb className="text-3xl text-yellow-400" />
              )}
              <div>
                <h4 className={`text-lg font-semibold ${
                  isCompleted ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {isCompleted 
                    ? t('challenge.perfect_budget') || 'Perfect Budget!' 
                    : t('challenge.almost_there') || 'Almost there!'}
                </h4>
                <p className="text-gray-300 text-sm">
                  {t('challenge.score') || 'Score'}: {score}/100
                </p>
              </div>
            </div>
            
            {!isCompleted && (
              <button
                onClick={() => setShowFeedback(false)}
                className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <FaUndo />
                {t('challenge.try_again') || 'Try Again'}
              </button>
            )}
          </div>
        )}

        {/* Submit Button */}
        {!showFeedback && (
          <button
            onClick={handleSubmit}
            disabled={!income || !expenses.needs || !expenses.wants || !expenses.savings}
            className={`
              w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300
              ${income && expenses.needs && expenses.wants && expenses.savings
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {t('challenge.check_budget') || 'Check My Budget'}
          </button>
        )}
      </div>
    );
  };

  // Investment Simulator Challenge
  const InvestmentSimulatorChallenge = () => {
    const [principal, setPrincipal] = useState('1000');
    const [monthlyContribution, setMonthlyContribution] = useState('100');
    const [annualReturn, setAnnualReturn] = useState('7');
    const [years, setYears] = useState('10');
    const [result, setResult] = useState(null);
    const [showChart, setShowChart] = useState(false);

    const calculateCompoundInterest = () => {
      const P = parseFloat(principal) || 0;
      const PMT = parseFloat(monthlyContribution) || 0;
      const r = (parseFloat(annualReturn) || 0) / 100 / 12; // Monthly rate
      const n = (parseFloat(years) || 0) * 12; // Total months

      // Future value with compound interest
      const futureValue = P * Math.pow(1 + r, n) + PMT * ((Math.pow(1 + r, n) - 1) / r);
      const totalContributions = P + (PMT * n);
      const totalInterest = futureValue - totalContributions;

      // Generate chart data
      const chartData = [];
      for (let year = 0; year <= parseFloat(years); year++) {
        const months = year * 12;
        const value = P * Math.pow(1 + r, months) + PMT * ((Math.pow(1 + r, months) - 1) / r);
        chartData.push({
          year,
          value: Math.round(value),
          contributions: P + (PMT * months)
        });
      }

      setResult({
        futureValue: Math.round(futureValue),
        totalContributions: Math.round(totalContributions),
        totalInterest: Math.round(totalInterest),
        chartData
      });
      setShowChart(true);
      setShowFeedback(true);
      setIsCompleted(true);

      // Auto complete after viewing
      setTimeout(() => {
        // Capture l'événement PostHog pour la validation d'étape
        posthog.capture('quest_step_complete', {
          step_id: step.id || step.title,
          step_type: 'interactive_challenge',
          quest_id: step.questId,
          challenge_type: 'investment_simulator',
          principal: parseFloat(principal) || 0,
          monthly_contribution: parseFloat(monthlyContribution) || 0,
          annual_return: parseFloat(annualReturn) || 0,
          years: parseFloat(years) || 0,
          future_value: Math.round(futureValue)
        });
        
        onComplete({
          completed: true,
          score: 100,
          data: { principal, monthlyContribution, annualReturn, years, futureValue }
        });
      }, 5000);
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <FaChartLine className="text-green-400" />
            {t('challenge.investment_simulator') || 'Investment Growth Simulator'}
          </h3>

          <p className="text-gray-400 mb-6">
            {t('challenge.investment_desc') || 'See how your money can grow with compound interest over time.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Initial Investment */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('challenge.initial_investment') || 'Initial Investment'}
              </label>
              <div className="relative">
                <FaDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            {/* Monthly Contribution */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('challenge.monthly_contribution') || 'Monthly Contribution'}
              </label>
              <div className="relative">
                <FaDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            {/* Annual Return */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('challenge.annual_return') || 'Expected Annual Return (%)'}
              </label>
              <input
                type="number"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Investment Period */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('challenge.investment_period') || 'Investment Period (Years)'}
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-slideDown">
            <h4 className="text-lg font-semibold text-white mb-4">
              {t('challenge.investment_results') || 'Your Investment Growth'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">
                  {t('challenge.total_contributions') || 'Total Contributions'}
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  ${result.totalContributions.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">
                  {t('challenge.interest_earned') || 'Interest Earned'}
                </p>
                <p className="text-2xl font-bold text-green-400">
                  ${result.totalInterest.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">
                  {t('challenge.future_value') || 'Future Value'}
                </p>
                <p className="text-2xl font-bold text-yellow-400">
                  ${result.futureValue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Simple Chart Visualization */}
            {showChart && (
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-3">
                  {t('challenge.growth_over_time') || 'Growth Over Time'}
                </p>
                <div className="relative h-40">
                  {result.chartData.map((point, index) => {
                    const height = (point.value / result.futureValue) * 100;
                    const contributionHeight = (point.contributions / result.futureValue) * 100;
                    return (
                      <div
                        key={index}
                        className="absolute bottom-0 bg-gray-600 rounded-t"
                        style={{
                          left: `${(index / (result.chartData.length - 1)) * 90}%`,
                          width: `${80 / result.chartData.length}%`,
                          height: `${height}%`
                        }}
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t"
                          style={{ height: `${(contributionHeight / height) * 100}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Year 0</span>
                  <span>Year {years}</span>
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">
                <strong>{t('challenge.power_of_compound') || 'The Power of Compound Interest:'}</strong> Your money grew by {Math.round((result.totalInterest / result.totalContributions) * 100)}%!
              </p>
            </div>
          </div>
        )}

        {/* Calculate Button */}
        {!result && (
          <button
            onClick={calculateCompoundInterest}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300"
          >
            <FaPlay className="inline mr-2" />
            {t('challenge.calculate_growth') || 'Calculate Investment Growth'}
          </button>
        )}
      </div>
    );
  };

  // Expense Sorter Challenge (Drag & Drop Style)
  const ExpenseSorterChallenge = () => {
    const expenses = [
      { id: 1, name: t('expenses.coffee') || 'Daily Coffee', amount: 5, category: null },
      { id: 2, name: t('expenses.rent') || 'Monthly Rent', amount: 1200, category: null },
      { id: 3, name: t('expenses.netflix') || 'Netflix Subscription', amount: 15, category: null },
      { id: 4, name: t('expenses.groceries') || 'Weekly Groceries', amount: 150, category: null },
      { id: 5, name: t('expenses.gym') || 'Gym Membership', amount: 50, category: null },
      { id: 6, name: t('expenses.savings') || 'Emergency Fund', amount: 200, category: null },
      { id: 7, name: t('expenses.dinner') || 'Restaurant Dinner', amount: 80, category: null },
      { id: 8, name: t('expenses.utilities') || 'Utilities', amount: 150, category: null }
    ];

    const [sortedExpenses, setSortedExpenses] = useState(expenses);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const categories = {
      needs: { name: t('categories.needs') || 'Needs', color: 'bg-blue-500', items: [] },
      wants: { name: t('categories.wants') || 'Wants', color: 'bg-purple-500', items: [] },
      savings: { name: t('categories.savings') || 'Savings', color: 'bg-green-500', items: [] }
    };

    const correctCategories = {
      1: 'wants', // Coffee
      2: 'needs', // Rent
      3: 'wants', // Netflix
      4: 'needs', // Groceries
      5: 'wants', // Gym
      6: 'savings', // Emergency Fund
      7: 'wants', // Restaurant
      8: 'needs' // Utilities
    };

    const handleCategorySelect = (expenseId, category) => {
      setSortedExpenses(prev => 
        prev.map(exp => 
          exp.id === expenseId ? { ...exp, category } : exp
        )
      );
      setSelectedExpense(null);
    };

    const checkAnswers = () => {
      let correct = 0;
      sortedExpenses.forEach(expense => {
        if (expense.category === correctCategories[expense.id]) {
          correct++;
        }
      });

      const scoreValue = Math.round((correct / expenses.length) * 100);
      setScore(scoreValue);
      setShowFeedback(true);
      setIsCompleted(scoreValue === 100);

      if (scoreValue === 100) {
        setTimeout(() => {
          // Capture l'événement PostHog pour la validation d'étape
          posthog.capture('quest_step_complete', {
            step_id: step.id || step.title,
            step_type: 'interactive_challenge',
            quest_id: step.questId,
            challenge_type: 'expense_sorter',
            score: scoreValue,
            attempts: attempts + 1,
            correct_answers: correct,
            total_expenses: expenses.length
          });
          
          onComplete({
            completed: true,
            score: scoreValue,
            attempts: attempts + 1
          });
        }, 2000);
      } else {
        setAttempts(prev => prev + 1);
      }
    };

    const resetChallenge = () => {
      setSortedExpenses(expenses);
      setShowFeedback(false);
      setSelectedExpense(null);
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <FaBalanceScale className="text-purple-400" />
            {t('challenge.expense_sorter') || 'Sort Your Expenses'}
          </h3>

          <p className="text-gray-400 mb-6">
            {t('challenge.expense_desc') || 'Categorize each expense as a Need, Want, or Savings. Click an expense, then click the correct category.'}
          </p>

          {/* Unsorted Expenses */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">
              {t('challenge.expenses_to_sort') || 'Expenses to Sort'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sortedExpenses.filter(exp => !exp.category).map(expense => (
                <button
                  key={expense.id}
                  onClick={() => setSelectedExpense(expense.id)}
                  className={`
                    p-3 rounded-lg transition-all text-left
                    ${selectedExpense === expense.id 
                      ? 'bg-yellow-500 text-gray-900 transform scale-105' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }
                  `}
                >
                  <p className="font-medium text-sm">{expense.name}</p>
                  <p className="text-lg font-bold">${expense.amount}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(categories).map(([key, category]) => (
              <div key={key}>
                <button
                  onClick={() => selectedExpense && handleCategorySelect(selectedExpense, key)}
                  disabled={!selectedExpense}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all
                    ${selectedExpense 
                      ? 'border-dashed border-gray-500 hover:border-yellow-500 cursor-pointer' 
                      : 'border-gray-700 cursor-not-allowed'
                    }
                  `}
                >
                  <div className={`w-full h-2 ${category.color} rounded mb-3`} />
                  <h5 className="text-white font-semibold mb-2">{category.name}</h5>
                  <div className="space-y-2">
                    {sortedExpenses
                      .filter(exp => exp.category === key)
                      .map(expense => (
                        <div
                          key={expense.id}
                          className={`
                            p-2 rounded text-sm
                            ${showFeedback && expense.category !== correctCategories[expense.id]
                              ? 'bg-red-500/20 border border-red-500/30'
                              : 'bg-gray-700'
                            }
                          `}
                        >
                          <p className="text-gray-300">{expense.name}</p>
                          <p className="text-white font-medium">${expense.amount}</p>
                        </div>
                      ))
                    }
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{t('challenge.sorted') || 'Sorted'}</span>
              <span>{sortedExpenses.filter(exp => exp.category).length}/{expenses.length}</span>
            </div>
            <ProgressBar 
              progress={(sortedExpenses.filter(exp => exp.category).length / expenses.length) * 100}
              showPercentage={false}
              height="h-2"
              color="purple"
            />
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`p-6 rounded-xl animate-slideDown border ${
            isCompleted 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {isCompleted ? (
                <FaCheckCircle className="text-3xl text-green-400" />
              ) : (
                <FaExclamationTriangle className="text-3xl text-yellow-400" />
              )}
              <div>
                <h4 className={`text-lg font-semibold ${
                  isCompleted ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {isCompleted 
                    ? t('challenge.perfect_sorting') || 'Perfect Sorting!' 
                    : t('challenge.review_categories') || 'Review your categories'}
                </h4>
                <p className="text-gray-300 text-sm">
                  {t('challenge.score') || 'Score'}: {score}%
                </p>
              </div>
            </div>

            {!isCompleted && (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">
                  {t('challenge.remember_50_30_20') || 'Remember: Needs are essentials, Wants are nice-to-haves, Savings is for your future.'}
                </p>
                <button
                  onClick={resetChallenge}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaUndo />
                  {t('challenge.try_again') || 'Try Again'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Check Button */}
        {!showFeedback && sortedExpenses.every(exp => exp.category) && (
          <button
            onClick={checkAnswers}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300"
          >
            {t('challenge.check_answers') || 'Check My Answers'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {getChallengeComponent()}
    </div>
  );
};

export default InteractiveChallenge;