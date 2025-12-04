import SubscriptionSelector from './SubscriptionSelector';
import AmountInput from './AmountInput';
import CancellationGuide from './CancellationGuide';
import { trackEvent } from '../../../../utils/analytics';

/**
 * CutSubscriptionCore - Steps spécifiques pour la quête "Couper 1 abonnement"
 * 
 * Export les 3 steps + validation logic
 */

const QUEST_ID = 'cut-subscription';

// Step 1: Sélection du service
const SelectSubscriptionStep = ({ questData, updateQuestData, locale }) => {
  const handleSubscriptionSelect = (subscription) => {
    updateQuestData({
      serviceName: subscription.serviceName,
      serviceId: subscription.id,
      monthlyAmount: subscription.monthlyAmount
    });

    trackEvent('quest_step_completed', {
      quest_id: QUEST_ID,
      step: 'subscription_select',
      service: subscription.serviceName
    });
  };

  return (
    <SubscriptionSelector
      value={questData.serviceId ? {
        id: questData.serviceId,
        serviceName: questData.serviceName,
        monthlyAmount: questData.monthlyAmount
      } : null}
      onChange={handleSubscriptionSelect}
      locale={locale}
    />
  );
};

// Step 2: Montant mensuel
const AmountInputStep = ({ questData, updateQuestData, locale }) => {
  const handleAmountChange = (amount) => {
    updateQuestData({
      monthlyAmount: amount
    });
  };

  return (
    <AmountInput
      value={questData.monthlyAmount || 0}
      onChange={handleAmountChange}
      serviceName={questData.serviceName}
      locale={locale}
    />
  );
};

// Step 3: Guide d'annulation
const CancellationGuideStep = ({ questData, updateQuestData, onNext, locale }) => {
  const handleCancellationComplete = () => {
    trackEvent('quest_step_completed', {
      quest_id: QUEST_ID,
      step: 'cancellation_guide'
    });

    // Passer automatiquement à l'étape suivante
    if (onNext) {
      onNext();
    }
  };

  return (
    <CancellationGuide
      serviceName={questData.serviceName}
      onComplete={handleCancellationComplete}
      locale={locale}
    />
  );
};

// Validation logic
const validateCutSubscriptionStep = (stepIndex, questData, locale) => {
  const isFr = locale === 'fr';

  switch (stepIndex) {
    case 0: // Selection step
      if (!questData.serviceName) {
        return {
          valid: false,
          message: isFr ? 'Sélectionne un abonnement' : 'Select a subscription'
        };
      }
      return { valid: true };

    case 1: // Amount step
      if (!questData.monthlyAmount || questData.monthlyAmount <= 0) {
        return {
          valid: false,
          message: isFr ? 'Entre le montant mensuel' : 'Enter the monthly amount'
        };
      }
      return { valid: true };

    case 2: // Cancellation guide - always valid (user can proceed)
      return { valid: true };

    default:
      return { valid: true };
  }
};

// Export default d'un objet qui regroupe tout
export default {
  // ID de la quête (pour linking avec DATA)
  questId: 'cut-subscription',

  // Steps React
  steps: [
    SelectSubscriptionStep,
    AmountInputStep,
    CancellationGuideStep
  ],

  // Validation
  validate: validateCutSubscriptionStep,

  // Config de completion
  completionConfig: {
    title: {
      fr: 'Mission accomplie !',
      en: 'Mission accomplished!'
    },
    showImpactButton: true
  },

  // Config du modal Impact
  impactConfig: {
    // Le titre sera récupéré depuis les traductions de la quête
    // Format: t('cutSubscription.title') avec le nom du service
    getTitleKey: () => 'cutSubscription.card.title',
    appendServiceName: true,
    period: 'month',
    initialValues: {}
  },

  // Options du wrapper
  wrapperConfig: {
    showIntro: true
  }
};

