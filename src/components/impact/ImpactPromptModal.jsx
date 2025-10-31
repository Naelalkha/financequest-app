import { FaChartLine, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEvent } from '../../utils/analytics';

/**
 * Prompt modal pour proposer d'ajouter l'économie d'une quête à l'Impact
 * Affiché après la complétion d'une quête avec estimatedImpact
 */
const ImpactPromptModal = ({ isOpen, onClose, onConfirm, quest, estimatedImpact }) => {
  const { t, language } = useLanguage();

  if (!isOpen || !estimatedImpact) return null;

  // Calculer le montant annualisé pour l'affichage
  const annualAmount = estimatedImpact.amount * (estimatedImpact.period === 'month' ? 12 : 1);
  const formattedAmount = new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(annualAmount);

  const handleConfirm = () => {
    trackEvent('impact_add_confirmed', {
      quest_id: quest.id,
      amount: estimatedImpact.amount,
      period: estimatedImpact.period,
      annual_amount: annualAmount,
    });
    onConfirm();
  };

  const handleDismiss = () => {
    trackEvent('impact_add_dismissed', {
      quest_id: quest.id,
      amount: estimatedImpact.amount,
      period: estimatedImpact.period,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border-2 border-amber-200 dark:border-amber-600">
        {/* Bouton fermer */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>

        {/* Icône */}
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <FaChartLine className="text-4xl text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {t('impact.prompt.title')}
        </h2>

        {/* Montant annualisé */}
        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {t('impact.prompt.subtitle', { amount: formattedAmount })}
          </p>
        </div>

        {/* Description */}
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          {t('impact.prompt.description')}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Bouton primaire : Ajouter */}
          <button
            onClick={handleConfirm}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            {t('impact.prompt.add')}
          </button>

          {/* Bouton secondaire : Plus tard */}
          <button
            onClick={handleDismiss}
            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-200"
          >
            {t('impact.prompt.later')}
          </button>
        </div>

        {/* Note discrète */}
        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
          {t('quest.impact_chip', { amount: formattedAmount })}
        </p>
      </div>
    </div>
  );
};

export default ImpactPromptModal;

