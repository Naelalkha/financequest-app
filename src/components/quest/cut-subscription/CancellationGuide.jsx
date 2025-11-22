import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaChevronDown, 
  FaChevronUp,
  FaMobileAlt,
  FaGlobe,
  FaEnvelope,
  FaPhoneAlt,
  FaInfoCircle,
  FaExclamationTriangle,
  FaLightbulb
} from 'react-icons/fa';

const CancellationGuide = ({ serviceName, onComplete, locale = 'fr' }) => {
  const [expandedMethod, setExpandedMethod] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState([]);

  const t = (key) => {
    const translations = {
      fr: {
        title: 'Guide d\'annulation',
        subtitle: 'Suis ces étapes pour annuler',
        methods: 'Méthodes d\'annulation',
        appMethod: 'Via l\'application',
        webMethod: 'Via le site web',
        emailMethod: 'Par email',
        phoneMethod: 'Par téléphone',
        generalSteps: 'Étapes générales',
        warnings: 'Points d\'attention',
        tips: 'Astuces',
        markComplete: 'J\'ai annulé l\'abonnement',
        step1: '1. Ouvre l\'application ou le site',
        step2: '2. Va dans Paramètres ou Mon compte',
        step3: '3. Cherche "Abonnement" ou "Facturation"',
        step4: '4. Clique sur "Annuler" ou "Résilier"',
        step5: '5. Confirme l\'annulation',
        warning1: 'Vérifie la période d\'engagement (certains abonnements ont des frais d\'annulation anticipée)',
        warning2: 'Ton accès reste actif jusqu\'à la fin de la période déjà payée',
        warning3: 'Conserve la confirmation d\'annulation',
        tip1: 'Demande un remboursement au prorata si tu as payé pour l\'année',
        tip2: 'Désactive le prélèvement automatique via ta banque en dernier recours',
        tip3: 'Prends une capture d\'écran de la confirmation'
      },
      en: {
        title: 'Cancellation Guide',
        subtitle: 'Follow these steps to cancel',
        methods: 'Cancellation methods',
        appMethod: 'Via the app',
        webMethod: 'Via the website',
        emailMethod: 'By email',
        phoneMethod: 'By phone',
        generalSteps: 'General steps',
        warnings: 'Important notes',
        tips: 'Tips',
        markComplete: 'I\'ve canceled the subscription',
        step1: '1. Open the application or website',
        step2: '2. Go to Settings or My Account',
        step3: '3. Look for "Subscription" or "Billing"',
        step4: '4. Click "Cancel" or "Unsubscribe"',
        step5: '5. Confirm cancellation',
        warning1: 'Check the commitment period (some subscriptions have early cancellation fees)',
        warning2: 'Your access remains active until the end of the already paid period',
        warning3: 'Keep the cancellation confirmation',
        tip1: 'Ask for a pro-rata refund if you paid for the year',
        tip2: 'Disable automatic withdrawal via your bank as a last resort',
        tip3: 'Take a screenshot of the confirmation'
      }
    };
    return translations[locale]?.[key] || translations.fr[key];
  };

  const methods = [
    {
      id: 'app',
      title: t('appMethod'),
      icon: FaMobileAlt,
      color: 'from-blue-500 to-blue-600',
      steps: [
        { id: 'app-1', text: locale === 'fr' ? 'Ouvre l\'application sur ton téléphone' : 'Open the app on your phone' },
        { id: 'app-2', text: locale === 'fr' ? 'Va dans ton profil (icône en haut)' : 'Go to your profile (icon at top)' },
        { id: 'app-3', text: locale === 'fr' ? 'Cherche "Gérer l\'abonnement"' : 'Look for "Manage subscription"' },
        { id: 'app-4', text: locale === 'fr' ? 'Clique sur "Annuler l\'abonnement"' : 'Click "Cancel subscription"' },
        { id: 'app-5', text: locale === 'fr' ? 'Confirme l\'annulation' : 'Confirm cancellation' }
      ]
    },
    {
      id: 'web',
      title: t('webMethod'),
      icon: FaGlobe,
      color: 'from-purple-500 to-purple-600',
      steps: [
        { id: 'web-1', text: locale === 'fr' ? 'Connecte-toi sur le site web' : 'Log in to the website' },
        { id: 'web-2', text: locale === 'fr' ? 'Va dans "Paramètres" ou "Compte"' : 'Go to "Settings" or "Account"' },
        { id: 'web-3', text: locale === 'fr' ? 'Clique sur "Abonnement" ou "Facturation"' : 'Click "Subscription" or "Billing"' },
        { id: 'web-4', text: locale === 'fr' ? 'Sélectionne "Annuler l\'abonnement"' : 'Select "Cancel subscription"' },
        { id: 'web-5', text: locale === 'fr' ? 'Valide l\'annulation' : 'Validate cancellation' }
      ]
    },
    {
      id: 'email',
      title: t('emailMethod'),
      icon: FaEnvelope,
      color: 'from-green-500 to-green-600',
      steps: [
        { id: 'email-1', text: locale === 'fr' ? 'Trouve l\'email de support (souvent support@...)' : 'Find support email (often support@...)' },
        { id: 'email-2', text: locale === 'fr' ? 'Écris "Demande de résiliation d\'abonnement"' : 'Write "Subscription cancellation request"' },
        { id: 'email-3', text: locale === 'fr' ? 'Indique ton nom, email et numéro de compte' : 'Provide your name, email and account number' },
        { id: 'email-4', text: locale === 'fr' ? 'Demande une confirmation écrite' : 'Request written confirmation' },
        { id: 'email-5', text: locale === 'fr' ? 'Conserve l\'email de confirmation' : 'Keep the confirmation email' }
      ]
    }
  ];

  const toggleStep = (stepId) => {
    setCheckedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const allStepsChecked = methods.some(method => 
    method.id === expandedMethod && 
    method.steps.every(step => checkedSteps.includes(step.id))
  );

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Titre */}
      <div className="text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {t('title')}
        </h3>
        <p className="text-gray-400">
          {t('subtitle')} <span className="text-amber-400 font-medium">{serviceName}</span>
        </p>
      </div>

      {/* Méthodes d'annulation */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <FaMobileAlt className="text-amber-400" />
          {t('methods')}
        </h4>

        {methods.map((method, index) => {
          const Icon = method.icon;
          const isExpanded = expandedMethod === method.id;
          const methodProgress = method.steps.filter(step => checkedSteps.includes(step.id)).length;
          const methodTotal = method.steps.length;

          return (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedMethod(isExpanded ? null : method.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${method.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">{method.title}</p>
                    {methodProgress > 0 && (
                      <p className="text-xs text-gray-400">
                        {methodProgress}/{methodTotal} {locale === 'fr' ? 'étapes' : 'steps'}
                      </p>
                    )}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="text-gray-400" />
                </motion.div>
              </button>

              {/* Steps */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-4 space-y-2">
                      {method.steps.map((step, stepIndex) => {
                        const isChecked = checkedSteps.includes(step.id);
                        
                        return (
                          <motion.button
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: stepIndex * 0.05 }}
                            whileHover={{ x: 4 }}
                            onClick={() => toggleStep(step.id)}
                            className={`
                              w-full p-3 rounded-lg flex items-start gap-3 text-left transition-all
                              ${isChecked 
                                ? 'bg-green-500/10 border-green-500/30' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                              } border
                            `}
                          >
                            <motion.div
                              animate={{ scale: isChecked ? [1, 1.2, 1] : 1 }}
                              className={`
                                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all
                                ${isChecked 
                                  ? 'bg-gradient-to-br from-green-400 to-green-500' 
                                  : 'border-2 border-white/20'
                                }
                              `}
                            >
                              {isChecked && <FaCheckCircle className="text-white text-sm" />}
                            </motion.div>
                            <span className={`text-sm ${isChecked ? 'text-green-300 line-through' : 'text-gray-300'}`}>
                              {step.text}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Warnings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-2"
      >
        <h4 className="text-sm font-semibold text-orange-300 flex items-center gap-2">
          <FaExclamationTriangle />
          {t('warnings')}
        </h4>
        <ul className="space-y-1 text-sm text-orange-200/80">
          <li>• {t('warning1')}</li>
          <li>• {t('warning2')}</li>
          <li>• {t('warning3')}</li>
        </ul>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2"
      >
        <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-2">
          <FaLightbulb />
          {t('tips')}
        </h4>
        <ul className="space-y-1 text-sm text-blue-200/80">
          <li>💡 {t('tip1')}</li>
          <li>💡 {t('tip2')}</li>
          <li>💡 {t('tip3')}</li>
        </ul>
      </motion.div>

      {/* Bouton de complétion */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onComplete}
        disabled={!allStepsChecked && expandedMethod}
        className={`
          w-full py-4 px-6 rounded-xl font-bold text-lg transition-all
          ${allStepsChecked || !expandedMethod
            ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg shadow-amber-500/30'
            : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {t('markComplete')}
      </motion.button>
    </div>
  );
};

export default CancellationGuide;

