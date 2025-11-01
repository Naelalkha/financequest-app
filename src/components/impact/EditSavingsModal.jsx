import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { updateSavingsEventInFirestore } from '../../services/savingsEvents';
import { trackEvent } from '../../utils/analytics';

/**
 * Modal pour éditer un événement d'économie existant
 * Whitelist stricte : seuls title, amount, period, proof.note peuvent être modifiés
 */
const EditSavingsModal = ({ isOpen, onClose, onSuccess, event }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    period: 'month',
    note: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pré-remplir le formulaire avec les données de l'événement
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        amount: event.amount !== undefined ? String(event.amount) : '',
        period: event.period || 'month',
        note: event.proof?.note || '',
      });
    }
  }, [event]);

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
      newErrors.title = t('impact.errors.required_field') || 'This field is required';
    }

    if (!formData.amount || formData.amount === '') {
      newErrors.amount = t('impact.errors.required_field') || 'This field is required';
    } else {
      const amount = Number(formData.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        newErrors.amount = t('impact.errors.amount_invalid') || 'Amount must be positive';
      }
      // Validation supplémentaire : montant max (selon règles Firestore)
      if (Number.isFinite(amount) && amount > 100000) {
        newErrors.amount = t('impact.errors.amount_invalid') || 'Invalid amount. Must be between 0 and 100,000';
      }
    }

    if (!['month', 'year'].includes(formData.period)) {
      newErrors.period = t('impact.errors.forbidden_field') || 'Invalid period';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate() || !event) {
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = Number(formData.amount);
      
      // Double vérification (défense en profondeur)
      if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
        throw new Error('Invalid amount value');
      }

      // Calculer le delta annuel pour analytics
      const oldAnnual = event.amount * (event.period === 'month' ? 12 : 1);
      const newAnnual = amount * (formData.period === 'month' ? 12 : 1);
      const deltaAnnual = newAnnual - oldAnnual;

      // Whitelist stricte : seuls ces champs peuvent être mis à jour
      const updates = {
        title: formData.title.trim(),
        amount,
        period: formData.period,
        proof: formData.note.trim() ? {
          type: 'note',
          note: formData.note.trim(),
        } : null,
      };

      await updateSavingsEventInFirestore(user.uid, event.id, updates);

      // Analytics
      trackEvent('impact_edited', {
        event_id: event.id,
        delta_annual: deltaAnnual,
        old_amount: event.amount,
        new_amount: amount,
        old_period: event.period,
        new_period: formData.period,
      });

      // Succès
      if (onSuccess) {
        onSuccess();
      }

      // Toast notification
      if (window.toast) {
        window.toast.success(t('impact.edit.success') || 'Savings updated successfully');
      }

      onClose();
    } catch (error) {
      console.error('❌ Error editing savings:', error);
      setErrors({ submit: t('impact.edit.error') || 'Failed to update savings' });
      
      if (window.toast) {
        window.toast.error(t('impact.edit.error') || 'Failed to update savings');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-savings-title"
    >
      <div 
        className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-700 transform animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label={t('impact.edit.cancel') || 'Cancel'}
          disabled={isSubmitting}
        >
          <FaTimes size={20} />
        </button>

        <h2 id="edit-savings-title" className="text-2xl font-bold text-white mb-6">
          {t('impact.edit.title') || 'Edit Savings'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-300 mb-1">
              {t('impact.modal.fields.title') || 'Title'} *
            </label>
            <input
              type="text"
              id="edit-title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-700 border ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500`}
              placeholder={t('impact.modal.fields.title_placeholder') || 'e.g., Canceled subscription'}
              disabled={isSubmitting}
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-300 mb-1">
              {t('impact.modal.fields.amount') || 'Amount'} * (€)
            </label>
            <input
              type="number"
              id="edit-amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-gray-700 border ${
                errors.amount ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500`}
              placeholder={t('impact.modal.fields.amount_placeholder') || '0'}
              min="0"
              max="100000"
              step="0.01"
              disabled={isSubmitting}
              required
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-400">{errors.amount}</p>
            )}
          </div>

          {/* Period */}
          <div>
            <label htmlFor="edit-period" className="block text-sm font-medium text-gray-300 mb-1">
              {t('impact.modal.fields.period') || 'Period'} *
            </label>
            <select
              id="edit-period"
              name="period"
              value={formData.period}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isSubmitting}
              required
            >
              <option value="month">{t('impact.modal.period.month') || 'per month'}</option>
              <option value="year">{t('impact.modal.period.year') || 'per year'}</option>
            </select>
            {errors.period && (
              <p className="mt-1 text-sm text-red-400">{errors.period}</p>
            )}
          </div>

          {/* Proof note */}
          <div>
            <label htmlFor="edit-note" className="block text-sm font-medium text-gray-300 mb-1">
              {t('impact.modal.fields.note') || 'Proof note (optional)'}
            </label>
            <textarea
              id="edit-note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              placeholder={t('impact.modal.fields.note_placeholder') || 'Add details or evidence...'}
              disabled={isSubmitting}
            />
            {errors.note && (
              <p className="mt-1 text-sm text-red-400">{errors.note}</p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {t('impact.edit.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  {t('ui.saving') || 'Saving...'}
                </>
              ) : (
                t('impact.edit.save') || 'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSavingsModal;

