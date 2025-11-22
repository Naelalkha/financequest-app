import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import AppBackground from '../app/AppBackground';
import { ImpactHero, AddSavingsModal, EditSavingsModal, ImpactNextMilestone, ImpactMilestonesModal } from '../impact';
import ImpactEventItem from '../impact/ImpactEventItem';
import { useSavingsEvents } from '../../hooks/useSavingsEvents';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../app/LoadingSpinner';
import { IMPACT_MILESTONES } from '../../config/gamification';

// Import Images
import dettesImg from '../../assets/dettes.png';
import budgetImg from '../../assets/budget.png';
import protectionImg from '../../assets/protection.png';
import epargneImg from '../../assets/epargne.png';
import impactImg from '../../assets/impact.png';
import couronneImg from '../../assets/couronne.png';

// Helper pour formater la devise
const formatCurrency = (amount, language) => {
  return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper pour formater la date
const formatDate = (dateString, language) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Styles par catégorie
const getCategoryStyle = (category) => {
  const styles = {
    subscription: {
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400',
      neonGlow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
      illustration: dettesImg
    },
    food: {
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      neonGlow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      illustration: budgetImg
    },
    transport: {
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      neonGlow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
      illustration: protectionImg
    },
    shopping: {
      bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
      borderColor: 'border-pink-500/30',
      iconColor: 'text-pink-400',
      neonGlow: 'shadow-[0_0_15px_rgba(236,72,153,0.15)]',
      illustration: epargneImg
    },
    energy: {
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      neonGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      illustration: impactImg
    },
    other: {
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
      borderColor: 'border-violet-500/30',
      iconColor: 'text-violet-400',
      neonGlow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]',
      illustration: couronneImg
    }
  };
  return styles[category] || styles.other;
};

const Impact = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { events, loading, error, loadEvents, addEvent, updateEvent, deleteEvent } = useSavingsEvents();

  const [period, setPeriod] = useState('year'); // 'year' or 'month'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMilestonesModalOpen, setIsMilestonesModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Charger les événements au montage
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAddEvent = async (eventData) => {
    await addEvent(eventData);
    setIsAddModalOpen(false);
  };

  const handleUpdateEvent = async (id, eventData) => {
    await updateEvent(id, eventData);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm(t('impact.confirm_delete') || 'Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      await deleteEvent(event.id);
    }
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Calcul du total annuel
  const totalAnnual = useMemo(() => {
    return events.reduce((acc, event) => {
      const annualAmount = event.amount * (event.period === 'month' ? 12 : 1);
      return acc + annualAmount;
    }, 0);
  }, [events]);

  // Calcul du prochain palier
  const nextMilestone = useMemo(() => {
    const sortedMilestones = [...(IMPACT_MILESTONES || [])].sort((a, b) => a - b);
    const nextIndex = sortedMilestones.findIndex(m => m > totalAnnual);

    if (nextIndex === -1) return null; // Tous les paliers atteints

    const target = sortedMilestones[nextIndex];
    const prevTarget = nextIndex > 0 ? sortedMilestones[nextIndex - 1] : 0;
    const progress = Math.min(100, Math.max(0, ((totalAnnual - prevTarget) / (target - prevTarget)) * 100));

    return {
      target,
      remaining: target - totalAnnual,
      progress,
      currentIndex: nextIndex
    };
  }, [totalAnnual]);

  return (
    <AppBackground variant="nebula" grain grid animate>
      <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              {t('impact.title') || 'Mon Impact'}
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              {t('impact.subtitle') || 'Suivez vos économies et votre progression'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center"
          >
            <FaPlus className="text-xl" />
          </motion.button>
        </div>

        {/* Hero Section */}
        <div className="mb-6">
          <ImpactHero
            totalAnnual={totalAnnual}
            period={period}
            onPeriodChange={setPeriod}
            showActions={false}
          />
        </div>

        {/* Next Milestone Section */}
        {nextMilestone && (
          <div className="mb-8">
            <ImpactNextMilestone
              nextMilestone={nextMilestone}
              formatCurrency={formatCurrency}
              language={language}
              onClick={() => setIsMilestonesModalOpen(true)}
            />
          </div>
        )}

        {/* Filters & List Header (Optional) */}
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FaSortAmountDown className="text-amber-400" />
            {t('impact.history.title') || 'Historique'}
          </h2>
          {/* Placeholder for future filters */}
          <button className="text-gray-400 hover:text-white transition-colors">
            <FaFilter />
          </button>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10">
            <div className="text-6xl mb-4">🍃</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {t('impact.empty.title') || 'Aucun impact pour le moment'}
            </h3>
            <p className="text-gray-400 max-w-xs mx-auto mb-6">
              {t('impact.empty.message') || 'Commencez à ajouter vos économies pour voir votre impact grandir !'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
            >
              {t('impact.empty.cta') || 'Ajouter une économie'}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            <AnimatePresence>
              {events.map((event) => {
                const categoryStyle = getCategoryStyle(event.category);
                // Calcul du montant à afficher selon la période sélectionnée
                const annualAmount = event.amount * (event.period === 'month' ? 12 : 1);
                const displayAmount = period === 'year' ? annualAmount : Math.round(annualAmount / 12);

                return (
                  <ImpactEventItem
                    key={event.id}
                    event={event}
                    categoryStyle={categoryStyle}
                    displayAmount={displayAmount}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    language={language}
                    t={t}
                    isMenuOpen={openMenuId === event.id}
                    onToggleMenu={toggleMenu}
                    onEdit={setEditingEvent}
                    onDelete={handleDeleteEvent}
                    period={period}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Modals */}
        <AddSavingsModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddEvent}
        />

        {editingEvent && (
          <EditSavingsModal
            isOpen={!!editingEvent}
            onClose={() => setEditingEvent(null)}
            event={editingEvent}
            onUpdate={(data) => handleUpdateEvent(editingEvent.id, data)}
          />
        )}

        <ImpactMilestonesModal
          isOpen={isMilestonesModalOpen}
          onClose={() => setIsMilestonesModalOpen(false)}
          currentTotal={totalAnnual}
          period={period}
          formatCurrency={formatCurrency}
          language={language}
        />

      </div>
    </AppBackground>
  );
};

export default Impact;
