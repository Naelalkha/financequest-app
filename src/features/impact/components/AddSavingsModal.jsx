import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { createSavingsEventInFirestore } from '../../../services/savingsEvents';
import { trackEvent } from '../../../utils/analytics';

const AddSavingsModal = ({ isOpen, onClose, onSuccess, initialValues = null }) => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: initialValues?.title || '',
    amount: initialValues?.amount !== undefined ? String(initialValues.amount) : '',
    period: initialValues?.period || 'month',
    note: initialValues?.note || '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const periodSelectRef = useRef(null);

  // Mettre à jour le formData quand initialValues change
  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title || '',
        amount: initialValues.amount !== undefined ? String(initialValues.amount) : '',
        period: initialValues.period || 'month',
        note: initialValues.note || '',
      });
    }
  }, [initialValues]);

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
      const amount = Number(formData.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        newErrors.amount = t('impact.modal.validation.amount_positive');
      }
      // Validation supplémentaire : montant max (selon règles Firestore)
      if (Number.isFinite(amount) && amount > 100000) {
        newErrors.amount = t('impact.modal.validation.amount_too_high') || 'Amount must be less than €100,000';
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
      const amount = Number(formData.amount);

      // Double vérification (défense en profondeur)
      if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
        throw new Error('Invalid amount value');
      }

      const eventData = {
        title: formData.title.trim(),
        amount,
        period: formData.period,
        source: initialValues?.source || 'manual',
        questId: initialValues?.questId || 'manual',
        proof: formData.note.trim() ? {
          type: 'note',
          note: formData.note.trim(),
        } : null,
      };

      await createSavingsEventInFirestore(user.uid, eventData);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] max-h-[90vh] overflow-y-auto border border-white/10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.25) 100%)',
          backdropFilter: 'blur(20px)',
          isolation: 'isolate', // Crée un nouveau contexte d'empilement pour les selects
        }}
      >
        {/* Ligne d'accent en haut */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2
            id="modal-title"
            className="text-2xl font-bold text-white"
          >
            {t('impact.modal.title')}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label={t('impact.modal.cancel')}
          >
            <FaTimes className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Titre */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-2"
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
              className={`w-full px-4 py-3 bg-black/30 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${errors.title
                ? 'border-red-500/50 focus:ring-red-500'
                : 'border-white/10 focus:ring-amber-500'
                } text-white placeholder-gray-400`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          {/* Montant et Période */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                {t('impact.modal.fields.amount')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                  className={`w-full pl-8 pr-4 py-3 bg-black/30 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${errors.amount
                    ? 'border-red-500/50 focus:ring-red-500'
                    : 'border-white/10 focus:ring-amber-500'
                    } text-white placeholder-gray-400`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.amount}
                </p>
              )}
            </div>

            <div className="relative" ref={periodSelectRef}>
              <label
                htmlFor="period"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                {t('impact.modal.fields.period')}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => !isSubmitting && setIsPeriodOpen(!isPeriodOpen)}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 bg-black/30 border rounded-xl focus:outline-none focus:ring-2 transition-colors text-left flex items-center justify-between text-white ${errors.period
                    ? 'border-red-500/50 focus:ring-red-500'
                    : 'border-white/10 focus:ring-amber-500'
                    }`}
                  style={{
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  <span>{formData.period === 'month' ? t('impact.modal.period.month') : t('impact.modal.period.year')}</span>
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
                      className={`w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors ${formData.period === 'month' ? 'bg-white/5' : ''
                        }`}
                    >
                      {t('impact.modal.period.month')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, period: 'year' }));
                        setIsPeriodOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors ${formData.period === 'year' ? 'bg-white/5' : ''
                        }`}
                    >
                      {t('impact.modal.period.year')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Détails */}
          <div>
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-300 mb-2"
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
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 resize-none transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {/* Erreur globale */}
          {errors.submit && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">
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
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('impact.modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
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

