import React, { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Edit2, Trophy, Lock } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../contexts/AuthContext";
import { useSavingsEvents } from "../../hooks/useSavingsEvents";
import { SavingsEventData } from "../../services/savingsEvents";
import { useLocalQuests } from "../../hooks/useLocalQuests";
import useLocalizedQuest from "../../hooks/useLocalizedQuest";
import ImpactModal from "./components/ImpactModal";

// Milestones configuration
const MILESTONES = [
  { level: 1, threshold: 0, labelKey: "rookie_saver" },
  { level: 2, threshold: 100, labelKey: "smart_spender" },
  { level: 3, threshold: 250, labelKey: "wallet_guard" },
  { level: 4, threshold: 500, labelKey: "wealth_builder" },
  { level: 5, threshold: 1000, labelKey: "finance_pro" },
  { level: 6, threshold: 2500, labelKey: "empire_maker" },
  { level: 7, threshold: 5000, labelKey: "legendary" },
];

/**
 * EntryTitle - Component to display savings event titles
 * Shows the stored title directly (which includes service name for quest-based entries)
 * Falls back to localized quest title only if entry.title is missing
 */
const EntryTitle = ({ entry }: { entry: SavingsEventData }) => {
  const { quests } = useLocalQuests();

  // If entry has a stored title (e.g., "Coupe 1 abo - Netflix"), use it directly
  if (entry.title) {
    return (
      <span className="font-bold uppercase block max-w-[180px] truncate text-[#E5E5E5]">
        {entry.title}
      </span>
    );
  }

  // Fallback: If no title but has questId, try to get localized quest title
  const quest = entry.questId && entry.questId !== 'manual'
    ? quests?.find(q => q.id === entry.questId)
    : null;

  const localizedQuest = useLocalizedQuest(quest);

  const displayTitle = quest && localizedQuest
    ? localizedQuest.title
    : 'Manual Entry';

  return (
    <span className="font-bold uppercase block max-w-[180px] truncate text-[#E5E5E5]">
      {displayTitle}
    </span>
  );
};

/**
 * ImpactView - Autonomous view with receipt style
 * Now handles its own data loading
 */
const ImpactView = () => {
  const { t } = useTranslation('impact');
  const { user } = useAuth();
  const { events, loading, loadEvents, createEvent, updateEvent, deleteEvent } = useSavingsEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SavingsEventData | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load events on mount
  useEffect(() => {
    if (user) {
      loadEvents({ limitCount: 100 });
    }
  }, [user, loadEvents]);

  // Use events instead of entries prop
  const entries = events || [];

  // Derived Stats - Calculate from entries (convert monthly to annual)
  const totalSaved = useMemo(() => {
    return entries.reduce((acc, curr) => {
      const annual = curr.amount * (curr.period === 'month' ? 12 : 1);
      return acc + annual;
    }, 0);
  }, [entries]);

  // Milestone Logic
  const currentMilestoneIndex = MILESTONES.findIndex(m => totalSaved < m.threshold) - 1;
  const activeIndex = currentMilestoneIndex === -2 ? MILESTONES.length - 1 : Math.max(0, currentMilestoneIndex);
  const currentLevel = MILESTONES[activeIndex];
  const nextLevel = MILESTONES[activeIndex + 1];

  const progressToNext = nextLevel
    ? Math.min(100, Math.max(0, ((totalSaved - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100))
    : 100;

  // Mock Chart Data (last 7 entries)
  const chartData = useMemo(() => {
    const last7 = entries.slice(0, 7).reverse();
    if (last7.length === 0) return [];

    const amounts = last7.map(e => e.amount * (e.period === 'month' ? 12 : 1));
    const max = Math.max(...amounts);

    return last7.map((e, i) => ({
      ...e,
      annualAmount: amounts[i],
      height: max > 0 ? (amounts[i] / max) * 100 : 0
    }));
  }, [entries]);

  const handleSave = (data: { title: string; amount: number; date?: string }) => {
    if (editingEntry) {
      updateEvent(editingEntry.id, {
        title: data.title,
        amount: data.amount,
      });
    } else {
      createEvent({
        title: data.title,
        questId: 'manual',
        amount: data.amount,
        period: 'month',
        source: 'manual',
        proof: {
          type: 'note',
          note: `Added manually on ${data.date}`
        }
      });
    }
  };

  const openAdd = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const openEdit = (entry: SavingsEventData) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
    setExpandedId(null);
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="pt-4 px-6 pb-32 animate-slide-up">

      {/* Header */}
      <div className="flex items-end justify-between mb-6 border-b border-white/10 pb-4">
        <div>
          <h1 className="font-sans font-bold text-4xl text-white tracking-tight">
            {t('header.title_vault')}<br /><span className="text-volt">{t('header.title_log')}</span>
          </h1>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            openAdd(e);
          }}
          type="button"
          className="w-10 h-10 rounded-full bg-volt text-black flex items-center justify-center hover:scale-110 transition-transform shadow-volt-glow active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Level Progress Card */}
      <div className="mb-8 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-1 relative overflow-hidden">
        <div className="bg-black border border-white/10 rounded-[20px] p-5 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                {t('rank.current_rank')}
              </span>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-volt" />
                <span className="font-bold text-white text-lg">{t(`rank.labels.${currentLevel.labelKey}`)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                {t('rank.level')} {currentLevel.level}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-black rounded-full border border-neutral-800 overflow-hidden mb-2">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-volt via-white to-volt shadow-volt-glow transition-all duration-1000"
              style={{ width: `${progressToNext}%` }}
            />
          </div>

          {/* Next Level Info */}
          <div className="flex justify-between items-center font-mono text-[10px]">
            <span className="text-neutral-400">€{totalSaved.toFixed(2)} {t('rank.total')}</span>
            {nextLevel ? (
              <span className="text-volt flex items-center gap-1">
                <Lock className="w-3 h-3" />
                €{(nextLevel.threshold - totalSaved).toFixed(2)} {t('rank.to_level')} {nextLevel.level}
              </span>
            ) : (
              <span className="text-volt">{t('rank.max_level')}</span>
            )}
          </div>
        </div>

        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-volt/10 to-transparent pointer-events-none" />
      </div>



      {/* THE RECEIPT (Log) */}
      <div className="relative filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {/* Paper Top Rip */}
        <div
          className="w-full h-4 bg-[#1A1A1A] relative z-10"
          style={{
            clipPath: "polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)"
          }}
        />

        {/* Paper Body */}
        <div className="bg-[#1A1A1A] text-[#E0E0E0] p-6 min-h-[300px] font-mono text-xs relative">
          {/* Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:4px_4px] pointer-events-none" />

          {/* Header */}
          <div className="text-center border-b-2 border-[#E0E0E0] pb-4 mb-4 border-dashed relative z-10">
            <h3 className="text-xl font-black tracking-tighter uppercase">{t('receipt.title')}</h3>
            <p className="text-[10px] mt-1">{t('receipt.subtitle')}</p>
            <p className="text-[10px]">{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</p>
          </div>

          {/* Table Header */}
          <div className="flex justify-between text-[10px] text-neutral-500 mb-2 px-2 relative z-10">
            <span>{t('receipt.table_headers.item_date')}</span>
            <span>{t('receipt.table_headers.amt_year')}</span>
          </div>

          {/* Items List */}
          <div className="space-y-0 mb-6 relative z-10">
            {entries.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 italic">
                {t('receipt.empty')}
              </div>
            ) : (
              entries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                const annualAmount = entry.amount * (entry.period === 'month' ? 12 : 1);
                const displayDate = entry.createdAt
                  ? new Date(entry.createdAt).toLocaleDateString()
                  : '';

                return (
                  <div key={entry.id} className="group relative border-b border-dashed border-neutral-200 last:border-0">
                    <div
                      onClick={() => toggleExpand(entry.id)}
                      className={`flex justify-between items-start py-3 px-2 transition-colors cursor-pointer ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'}`}
                    >
                      <div>
                        <EntryTitle entry={entry} />
                        <span className="text-[10px] text-[#888888]">{displayDate}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-volt">€{annualAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Mobile Drawer Actions (Tap to Expand) */}
                    {isExpanded && (
                      <div className="bg-white/5 px-2 pb-2 flex gap-2 animate-slide-up">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(entry);
                          }}
                          type="button"
                          className="flex-1 bg-volt text-black py-2 rounded text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-white active:scale-95"
                        >
                          <Edit2 className="w-3 h-3" /> {t('modal.actions.edit')}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry.id);
                          }}
                          type="button"
                          className="flex-1 bg-transparent border border-red-500/50 text-red-500 py-2 rounded text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-red-500/10 active:scale-95"
                        >
                          <Trash2 className="w-3 h-3" /> {t('modal.actions.delete')}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Totals */}
          <div className="border-t-2 border-[#E0E0E0] pt-4 border-dashed relative z-10">
            <div className="flex justify-between mb-1 px-2">
              <span>{t('receipt.footer.item_count')}</span>
              <span>{entries.length}</span>
            </div>
            <div className="flex justify-between text-lg font-bold px-2">
              <span>{t('receipt.footer.total_saved')}</span>
              <span className="text-volt">€{totalSaved.toFixed(2)}</span>
            </div>
          </div>

          {/* Barcode */}
          <div className="mt-8 text-center opacity-80 relative z-10">
            <div
              className="h-12 bg-[#E5E5E5] w-3/4 mx-auto mb-1"
              style={{ maskImage: "repeating-linear-gradient(90deg, black, black 2px, transparent 2px, transparent 4px)" }}
            />
            <span className="text-[10px] tracking-[0.5em]">{t('receipt.barcode')}</span>
          </div>
        </div>

        {/* Paper Bottom Rip */}
        <div
          className="w-full h-4 bg-[#1A1A1A] relative -mt-[1px] z-10"
          style={{
            clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)"
          }}
        />
      </div>

      <ImpactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSave}
        initialData={editingEntry}
      />
    </div>
  );
};

export default ImpactView;

