import { useState } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { createSavingsEventInFirestore } from '../../services/savingsEvents';
import { trackEvent } from '../../utils/analytics';

/**
 * Modal Quick Win : "Couper 1 abonnement"
 * 3 étapes simples pour générer une première économie
 */
const QuickWinModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [subscriptions, setSubscriptions] = useState([
    { id: 1, name: 'Netflix', price: 12.99, selected: false },
    { id: 2, name: 'Spotify', price: 9.99, selected: false },
    { id: 3, name: 'Amazon Prime', price: 6.99, selected: false },
    { id: 4, name: 'Disney+', price: 8.99, selected: false },
    { id: 5, name: 'YouTube Premium', price: 11.99, selected: false },
  ]);
  const [customSub, setCustomSub] = useState({ name: '', price: '' });
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculer l'abonnement sélectionné (prédéfini ou custom)
  const selectedSub = subscriptions.find((s) => s.selected) || 
                      (customSub.name?.trim() && customSub.price && String(customSub.price).trim() !== '' ? customSub : null);
  
  // Debug pour voir l'état
  console.log('🔍 Modal state:', {
    step,
    selectedSub,
    subscriptions: subscriptions.filter(s => s.selected),
    customSub,
    isSubmitting,
    currentUser: !!currentUser,
  });

  const handleSelectSub = (id) => {
    setSubscriptions((prev) =>
      prev.map((s) => ({ ...s, selected: s.id === id }))
    );
    setCustomSub({ name: '', price: '' });
  };

  const handleCustomSubChange = (field, value) => {
    setCustomSub((prev) => ({ ...prev, [field]: value }));
    // Désélectionner les prédéfinis
    setSubscriptions((prev) => prev.map((s) => ({ ...s, selected: false })));
  };

  const handleNext = () => {
    if (step === 1 && !selectedSub) {
      return; // Pas d'abo sélectionné
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleConfirm = async () => {
    console.log('🔍 handleConfirm called', {
      selectedSub,
      currentUser: !!currentUser,
      step,
    });

    if (!selectedSub) {
      console.error('❌ No subscription selected');
      toast.error('Aucun abonnement sélectionné');
      return;
    }

    if (!currentUser) {
      console.error('❌ User not authenticated');
      toast.error('Utilisateur non connecté');
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = typeof selectedSub.price === 'number' 
        ? selectedSub.price 
        : parseFloat(selectedSub.price);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }

      const eventData = {
        title: `${t('quickwin.subscription_canceled')} — ${selectedSub.name}`,
        amount,
        period: 'month',
        source: 'quest',
        questId: 'quickwin',
        proof: note.trim() ? {
          type: 'note',
          note: note.trim(),
        } : null,
      };

      console.log('💾 Creating savings event:', eventData);
      await createSavingsEventInFirestore(currentUser.uid, eventData);

      // Analytics
      trackEvent('quickwin_completed', {
        subscription_name: selectedSub.name,
        amount,
        has_proof: !!note.trim(),
      });

      // Success
      console.log('✅ Quick win saved successfully');
      if (onSuccess) {
        onSuccess();
      }

      // Toast
      toast.success(t('quickwin.success'));

      // Reset et fermeture
      handleReset();
      onClose();
    } catch (error) {
      console.error('❌ Error creating quick win savings:', error);
      toast.error(t('quickwin.error') || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSubscriptions((prev) => prev.map((s) => ({ ...s, selected: false })));
    setCustomSub({ name: '', price: '' });
    setNote('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      handleReset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickwin-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2
              id="quickwin-title"
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              {t('quickwin.title')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('quickwin.subtitle')}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label={t('ui.close')}
          >
            <FaTimes className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress steps */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    s < step
                      ? 'bg-green-500 text-white'
                      : s === step
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {s < step ? <FaCheckCircle /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      s < step
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Étape 1 : Liste des abonnements */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('quickwin.step1_title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('quickwin.step1_subtitle')}
              </p>

              {/* Liste prédéfinie */}
              <div className="space-y-2">
                {subscriptions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectSub(sub.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      sub.selected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700'
                    }`}
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {sub.name}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      €{sub.price.toFixed(2)}/mois
                    </span>
                  </button>
                ))}
              </div>

              {/* Champ personnalisé */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('quickwin.custom_sub')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={t('quickwin.sub_name_placeholder')}
                    value={customSub.name}
                    onChange={(e) => handleCustomSubChange('name', e.target.value)}
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder={t('quickwin.sub_price_placeholder')}
                    value={customSub.price}
                    onChange={(e) => handleCustomSubChange('price', e.target.value)}
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 : Confirmation + Note optionnelle */}
          {step === 2 && selectedSub && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('quickwin.step2_title')}
              </h3>
              
              {/* Récap */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedSub.name}
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    +€{(selectedSub.price * 12).toFixed(0)}/an
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  €{selectedSub.price}/mois économisés
                </p>
              </div>

              {/* Note optionnelle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('quickwin.proof_note_label')}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('quickwin.proof_note_placeholder')}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>
          )}

          {/* Étape 3 : Félicitations */}
          {step === 3 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <FaCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('quickwin.step3_title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('quickwin.step3_subtitle')}
              </p>
              {selectedSub && (
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  +€{(selectedSub.price * 12).toFixed(0)}/an
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Message d'erreur si bouton désactivé à l'étape 3 */}
          {step === 3 && (!selectedSub || !currentUser) && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {!selectedSub && '⚠️ Aucun abonnement sélectionné'}
              {!currentUser && '⚠️ Vous devez être connecté'}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('ui.cancel')}
            </button>
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={!selectedSub}
              className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 2 ? t('quickwin.cta_confirm') : t('ui.continue')}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || !selectedSub || !currentUser}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title={!selectedSub ? 'Aucun abonnement sélectionné' : !currentUser ? 'Utilisateur non connecté' : ''}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('ui.saving')}
                </>
              ) : (
                t('quickwin.cta_finish')
              )}
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickWinModal;

