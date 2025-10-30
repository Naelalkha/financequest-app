import { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { createSavingsEventInFirestore } from '../../services/savingsEvents';
import { trackEvent } from '../../utils/analytics';

const AddSavingsModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    period: 'month',
    note: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur quand l'utilisateur corrige
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('impact.modal.validation.title_required');
    }

    if (!formData.amount || formData.amount === '') {
      newErrors.amount = t('impact.modal.validation.amount_required');
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = t('impact.modal.validation.amount_positive');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = parseFloat(formData.amount);
      const eventData = {
        title: formData.title.trim(),
        amount,
        period: formData.period,
        source: 'manual',
        questId: 'manual', // Identifiant pour les économies manuelles
        proof: formData.note.trim() ? {
          type: 'note',
          note: formData.note.trim(),
        } : null,
      };

      await createSavingsEventInFirestore(currentUser.uid, eventData);

      // Analytics
      trackEvent('impact_added', {
        amount,
        period: formData.period,
        verified: false,
        source: 'manual',
        has_proof: !!formData.note.trim(),
      });

      // Succès
      if (onSuccess) {
        onSuccess();
      }

      // Réinitialiser le formulaire
      setFormData({
        title: '',
        amount: '',
        period: 'month',
        note: '',
      });
      setErrors({});

      // Toast notification (si disponible)
      if (window.toast) {
        window.toast.success(t('impact.modal.success'));
      }

      onClose();
    } catch (error) {
      console.error('Error adding savings:', error);
      setErrors({ submit: t('impact.modal.error') });
      
      if (window.toast) {
        window.toast.error(t('impact.modal.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        amount: '',
        period: 'month',
        note: '',
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 
            id="modal-title"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {t('impact.modal.title')}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label={t('impact.modal.cancel')}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Titre */}
          <div>
            <label 
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('impact.modal.fields.title')}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('impact.modal.fields.title_placeholder')}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-amber-500'
              } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          {/* Montant et Période */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('impact.modal.fields.amount')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  €
                </span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder={t('impact.modal.fields.amount_placeholder')}
                  step="0.01"
                  min="0"
                  className={`w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    errors.amount
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-amber-500'
                  } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.amount}
                </p>
              )}
            </div>

            <div>
              <label 
                htmlFor="period"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('impact.modal.fields.period')}
              </label>
              <select
                id="period"
                name="period"
                value={formData.period}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white transition-colors"
                disabled={isSubmitting}
              >
                <option value="month">{t('impact.modal.period.month')}</option>
                <option value="year">{t('impact.modal.period.year')}</option>
              </select>
            </div>
          </div>

          {/* Note de preuve */}
          <div>
            <label 
              htmlFor="note"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('impact.modal.fields.note')}
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder={t('impact.modal.fields.note_placeholder')}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {/* Erreur globale */}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('impact.modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('ui.saving')}</span>
                </>
              ) : (
                t('impact.modal.save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSavingsModal;

