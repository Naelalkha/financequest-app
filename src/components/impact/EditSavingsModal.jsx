import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaChevronDown } from 'react-icons/fa';
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
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const periodSelectRef = useRef(null);

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

  // Fermer le menu période au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (periodSelectRef.current && !periodSelectRef.current.contains(event.target)) {
        setIsPeriodOpen(false);
      }
    };

    if (isPeriodOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPeriodOpen]);

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

  console.log('EditSavingsModal render - isOpen:', isOpen, 'event:', event);
  
  if (!isOpen || !event) {
    console.log('EditSavingsModal: Not rendering - isOpen:', isOpen, 'event:', event);
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-savings-title"
    >
      <div 
        className="relative rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] p-6 w-full max-w-md border border-white/10"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.25) 100%)',
          backdropFilter: 'blur(20px)',
          isolation: 'isolate', // Crée un nouveau contexte d'empilement pour les selects
        }}
      >
        {/* Ligne d'accent en haut */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="flex items-center justify-between mb-6">
          <h2 id="edit-savings-title" className="text-2xl font-bold text-white">
            {t('impact.edit.title') || 'Edit Savings'}
          </h2>
        <button
          onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label={t('impact.edit.cancel') || 'Cancel'}
          disabled={isSubmitting}
        >
            <FaTimes className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-300 mb-2">
              {t('impact.modal.fields.title') || 'Title'} *
            </label>
            <input
              type="text"
              id="edit-title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-black/30 border rounded-xl text-white focus:outline-none focus:ring-2 transition-colors ${
                errors.title ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-amber-500'
              } placeholder-gray-400`}
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
            <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-300 mb-2">
              {t('impact.modal.fields.amount') || 'Amount'} * (€)
            </label>
            <input
              type="number"
              id="edit-amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-black/30 border rounded-xl text-white focus:outline-none focus:ring-2 transition-colors ${
                errors.amount ? 'border-red-500/50 focus:ring-red-500' : 'border-white/10 focus:ring-amber-500'
              } placeholder-gray-400`}
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
          <div className="relative" ref={periodSelectRef}>
            <label htmlFor="edit-period" className="block text-sm font-medium text-gray-300 mb-2">
              {t('impact.modal.fields.period') || 'Period'} *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => !isSubmitting && setIsPeriodOpen(!isPeriodOpen)}
              disabled={isSubmitting}
                className={`w-full px-4 py-3 bg-black/30 border rounded-xl focus:outline-none focus:ring-2 transition-colors text-left flex items-center justify-between text-white ${
                  errors.period
                    ? 'border-red-500/50 focus:ring-red-500'
                    : 'border-white/10 focus:ring-amber-500'
                }`}
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
            >
                <span>{formData.period === 'month' ? (t('impact.modal.period.month') || 'per month') : (t('impact.modal.period.year') || 'per year')}</span>
                <FaChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isPeriodOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPeriodOpen && (
                <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-white/10 rounded-xl shadow-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, period: 'month' }));
                      setIsPeriodOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors ${
                      formData.period === 'month' ? 'bg-white/5' : ''
                    }`}
                  >
                    {t('impact.modal.period.month') || 'per month'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, period: 'year' }));
                      setIsPeriodOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors ${
                      formData.period === 'year' ? 'bg-white/5' : ''
                    }`}
                  >
                    {t('impact.modal.period.year') || 'per year'}
                  </button>
                </div>
              )}
            </div>
            {errors.period && (
              <p className="mt-1 text-sm text-red-400">{errors.period}</p>
            )}
          </div>

          {/* Détails */}
          <div>
            <label htmlFor="edit-note" className="block text-sm font-medium text-gray-300 mb-2">
              {t('impact.modal.fields.note') || 'Détails (optionnel)'}
            </label>
            <textarea
              id="edit-note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition-colors placeholder-gray-400"
              placeholder={t('impact.modal.fields.note_placeholder') || 'Add details or evidence...'}
              disabled={isSubmitting}
            />
            {errors.note && (
              <p className="mt-1 text-sm text-red-400">{errors.note}</p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

