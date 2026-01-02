import React, { useState, useEffect, FormEvent } from "react";
import { createPortal } from "react-dom";
import { X, Save } from "lucide-react";
import { useTranslation } from 'react-i18next';

/** Initial data for editing */
interface InitialData {
  title?: string;
  amount?: number;
  date?: string;
  createdAt?: Date;
}

/** Save data */
interface SaveData {
  title: string;
  amount: number;
  date: string;
}

/** Props for ImpactModal */
interface ImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveData) => void;
  initialData?: InitialData | null;
}

/**
 * ImpactModal - Modal pour ajouter/éditer une économie
 */
const ImpactModal: React.FC<ImpactModalProps> = ({ isOpen, onClose, onSave, initialData = null }) => {
  const { t } = useTranslation('impact');
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: ""
  });


  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        amount: initialData.amount?.toString() || "",
        date: initialData.date || initialData.createdAt?.toISOString().split('T')[0] || ""
      });
    } else {
      setFormData({
        title: "",
        amount: "",
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    onSave({
      title: formData.title,
      amount: parseFloat(formData.amount),
      date: formData.date || new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-bg-secondary border border-volt/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-sans font-bold text-xl text-white uppercase">
            {initialData ? t('modal.edit_title') : t('modal.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-neutral-500 mb-1">
              {t('modal.fields.title')}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('modal.fields.title_placeholder')}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-volt focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-neutral-500 mb-1">
                {t('modal.fields.amount')}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-emerald focus:outline-none transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-neutral-500 mb-1">
                {t('modal.fields.date')}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-volt focus:outline-none transition-colors font-mono text-sm"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-volt text-black font-bold py-4 rounded-xl mt-2 hover:bg-white transition-colors shadow-volt-glow flex items-center justify-center gap-2 active:scale-95 uppercase"
          >
            <Save className="w-5 h-5" />
            {t('modal.save')}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ImpactModal;

