import { useState, useEffect, useRef, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUndo, FaEllipsisV, FaCheck, FaChartLine, FaTrophy, FaFire, FaChartBar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSavingsEvents } from '../../hooks/useSavingsEvents';
import { trackEvent } from '../../utils/analytics';
import { toast } from 'react-toastify';
import AddSavingsModal from '../impact/AddSavingsModal';
import EditSavingsModal from '../impact/EditSavingsModal';
import { useGamification } from '../../hooks/useGamification';
import AppBackground from '../app/AppBackground';
import LoadingSpinner from '../app/LoadingSpinner';
import { IMPACT_MILESTONES } from '../../config/gamification';
import { getStarterPackQuests } from '../../data/quests/index';
import { openQuestGuarded } from '../../utils/navguards';

// Images des assets pour les catégories
import budgetImg from '../../assets/budget.png';
import epargneImg from '../../assets/epargne.png';
import investissementImg from '../../assets/investissement.png';
import impotImg from '../../assets/impots.png';
import dettesImg from '../../assets/dettes.png';
import progressionImg from '../../assets/progression.png';
import protectionImg from '../../assets/protection.png';
import plannificationImg from '../../assets/plannification.png';
import impactHeroImg from '../../assets/impact.png';

// Animation de compteur fluide
const CountUp = ({ end, duration = 1000, prefix = '', suffix = '', locale = 'fr-FR' }) => {
  const [count, setCount] = useState(end);
  const previousEndRef = useRef(end);
  
  useEffect(() => {
    // Si la valeur change, réinitialiser depuis la valeur précédente
    const startValue = previousEndRef.current;
    previousEndRef.current = end;
    
    // Si c'est la première fois, définir directement
    if (startValue === end) {
      setCount(end);
      return;
    }
    
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(startValue + (end - startValue) * easeOutQuart));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
  const formatted = count.toLocaleString(localeCode);
  
  return (
    <span 
      className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]"
      style={{ 
        fontFamily: '"Inter", sans-serif', 
        fontWeight: 900,
        letterSpacing: '-0.03em',
        lineHeight: 1
      }}
    >
      {prefix}{formatted}{suffix}
    </span>
  );
};

// Configuration des styles de catégories avec illustrations PNG
const categoryStyles = {
  budgeting: {
    illustration: budgetImg,
    gradient: 'from-cyan-400 via-sky-400 to-teal-400',
    bgGradient: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(13, 148, 136, 0.08) 100%)',
    neonGlow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-300'
  },
  saving: {
    illustration: epargneImg,
    gradient: 'from-green-400 via-lime-400 to-emerald-400',
    bgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(101, 163, 13, 0.08) 100%)',
    neonGlow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-300'
  },
  credit: {
    illustration: dettesImg,
    gradient: 'from-red-400 via-rose-400 to-pink-400',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(244, 63, 94, 0.08) 100%)',
    neonGlow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-300'
  },
  investing: {
    illustration: investissementImg,
    gradient: 'from-blue-400 via-indigo-400 to-purple-400',
    bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.08) 100%)',
    neonGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-300'
  },
  taxes: {
    illustration: impotImg,
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
    bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%)',
    neonGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-300'
  },
  protect: {
    illustration: protectionImg,
    gradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
    bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.08) 100%)',
    neonGlow: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]',
    borderColor: 'border-pink-500/30',
    textColor: 'text-pink-300'
  },
  planning: {
    illustration: plannificationImg,
    gradient: 'from-orange-400 via-amber-400 to-yellow-400',
    bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(251, 191, 36, 0.08) 100%)',
    neonGlow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-300'
  }
};

/**
 * Calcule le montant annualisé d'un événement d'économie
 */
const calculateAnnual = (event) => {
  return event.amount * (event.period === 'month' ? 12 : 1);
};

/**
 * Formate un montant en euros selon la locale avec espaces pour les milliers
 */
const formatCurrency = (amount, locale) => {
  if (!Number.isFinite(amount) || amount === null || amount === undefined) {
    return '0';
  }
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount)).replace(/\s/g, ' '); // S'assurer que les espaces sont présents
};

/**
 * Formate une date en format court
 */
const formatDate = (date, locale) => {
  if (!date) return '';
  const dateObj = date?.seconds ? new Date(date.seconds * 1000) : new Date(date);
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.DateTimeFormat(localeCode, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
};

/**
 * Formate un mois/année pour les groupes
 */
const formatMonthYear = (date, locale) => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.DateTimeFormat(localeCode, {
    month: 'long',
    year: 'numeric',
  }).format(dateObj);
};

/**
 * Trouve le prochain palier et calcule le reste
 */
const getNextMilestone = (totalAnnual) => {
  const sortedMilestones = [...IMPACT_MILESTONES].sort((a, b) => a - b);
  const nextMilestone = sortedMilestones.find(m => m > totalAnnual);
  
  if (!nextMilestone) {
    // Tous les paliers atteints
    const lastMilestone = sortedMilestones[sortedMilestones.length - 1];
    return {
      target: lastMilestone,
      remaining: 0,
      progress: 100,
      currentIndex: sortedMilestones.length - 1,
      totalMilestones: sortedMilestones.length,
    };
  }
  
  const previousMilestone = sortedMilestones.filter(m => m <= totalAnnual).pop() || 0;
  const progress = ((totalAnnual - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
  const currentIndex = sortedMilestones.indexOf(nextMilestone) - 1;
  
  return {
    target: nextMilestone,
    remaining: nextMilestone - totalAnnual,
    progress: Math.min(Math.max(progress, 0), 100),
    currentIndex: currentIndex >= 0 ? currentIndex : 0,
    totalMilestones: sortedMilestones.length,
  };
};

const Impact = () => {
  const navigate = useNavigate();
  const { t, language, currentLang } = useLanguage();
  const { user } = useAuth();
  const { events, loadEvents, loading, editEvent, deleteEvent, undoDelete } = useSavingsEvents();
  const { gamification } = useGamification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [period, setPeriod] = useState(() => {
    // Charger depuis localStorage ou défaut 'year'
    const saved = localStorage.getItem('impact_period');
    return saved === 'month' ? 'month' : 'year';
  });
  const [showMilestonesSheet, setShowMilestonesSheet] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [displayedEventsCount, setDisplayedEventsCount] = useState(50); // Pagination
  
  const [stats, setStats] = useState({
    totalAnnual: 0,
    eventsCount: 0,
  });
  
  // Pour gérer le toast Undo
  const undoTimeoutRef = useRef(null);
  const undoToastIdRef = useRef(null);
  const menuRef = useRef(null);

  // Charger les événements au montage
  useEffect(() => {
    loadEvents({ limitCount: 50 });
    trackEvent('impact_tab_viewed');
  }, [loadEvents]);

  // Persister le choix de période
  useEffect(() => {
    localStorage.setItem('impact_period', period);
  }, [period]);

  // Calculer les statistiques
  useEffect(() => {
    if (events.length === 0) {
      setStats({
        totalAnnual: 0,
        eventsCount: 0,
      });
      return;
    }

    let totalAnnual = 0;

    events.forEach((event) => {
      const annual = calculateAnnual(event);
      totalAnnual += annual;
    });

    setStats({
      totalAnnual,
      eventsCount: events.length,
    });
  }, [events]);

  // Grouper les événements par mois (avec pagination)
  const eventsByMonth = useMemo(() => {
    const grouped = {};
    const sortedEvents = [...events]
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
        const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
        return dateB - dateA;
      })
      .slice(0, displayedEventsCount); // Pagination

    sortedEvents.forEach((event) => {
      const date = event.createdAt?.seconds ? new Date(event.createdAt.seconds * 1000) : new Date(event.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: date,
          events: [],
        };
      }
      grouped[monthKey].events.push(event);
    });

    return Object.values(grouped);
  }, [events, displayedEventsCount]);

  // Calculer le prochain palier
  const nextMilestone = useMemo(() => {
    return getNextMilestone(stats.totalAnnual);
  }, [stats.totalAnnual]);
  
  // Vérifier si tous les paliers sont atteints
  const allMilestonesReached = nextMilestone.remaining === 0 && stats.totalAnnual >= IMPACT_MILESTONES[IMPACT_MILESTONES.length - 1];

  // Trouver les quêtes suggérées
  const suggestedQuests = useMemo(() => {
    if (nextMilestone.remaining < 50) return [];
    
    const starterQuests = getStarterPackQuests(currentLang || 'fr', 'fr-FR');
    const relevantQuests = starterQuests.slice(0, 2).map(quest => {
      // Estimation d'impact basique (à améliorer avec les vraies données)
      const estimatedImpact = 150; // Exemple
      return {
        ...quest,
        estimatedImpact,
      };
    });
    
    return relevantQuests.filter(q => q.estimatedImpact >= nextMilestone.remaining / 2);
  }, [nextMilestone.remaining, currentLang]);

  // Convertir le total selon la période
  const displayTotal = period === 'year' ? stats.totalAnnual : Math.round(stats.totalAnnual / 12);
  const displaySuffix = period === 'year' ? '/an' : '/mois';

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenFor(null);
      }
    };

    if (menuOpenFor) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpenFor]);

  const handleModalSuccess = () => {
    loadEvents({ limitCount: 50 });
  };

  const handleEdit = (event) => {
    trackEvent('ledger_item_edited', {
      event_id: event.id,
    });
    setEventToEdit(event);
    setIsEditModalOpen(true);
    setMenuOpenFor(null);
  };

  const handleEditSuccess = () => {
    loadEvents({ limitCount: 50 });
    setIsEditModalOpen(false);
    setEventToEdit(null);
  };

  const handleDelete = async (event) => {
    const annualAmount = calculateAnnual(event);
    
    trackEvent('ledger_item_deleted', {
      event_id: event.id,
      annual_amount: annualAmount,
    });

    try {
      await deleteEvent(event.id);

      const toastId = toast(
        <div className="flex items-center justify-between gap-4 w-full">
          <span>{t('impact.ledger.toast.deleted')}</span>
          <button
            onClick={() => handleUndo(toastId)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
          >
            <FaUndo className="text-sm" />
            {t('impact.ledger.toast.undo')}
          </button>
        </div>,
        {
          autoClose: 10000,
          closeButton: false,
          draggable: false,
          icon: false,
        }
      );

      undoToastIdRef.current = toastId;

      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      undoTimeoutRef.current = setTimeout(() => {
        undoToastIdRef.current = null;
      }, 10000);
      
      setMenuOpenFor(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(t('impact.errors.delete_failed') || 'Failed to delete savings');
    }
  };

  const handleUndo = async (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
    
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    try {
      await undoDelete();
      
      toast.success(t('impact.ledger.toast.restored') || 'Savings restored', {
        autoClose: 3000,
      });
      
      loadEvents({ limitCount: 50 });
    } catch (error) {
      console.error('Error undoing delete:', error);
      toast.error(t('impact.errors.undo_failed') || 'Failed to restore savings');
    }
  };

  const handleSuggestedQuestClick = (quest) => {
    trackEvent('suggested_action_clicked', {
      quest_id: quest.id,
      remaining: nextMilestone.remaining,
      target: nextMilestone.target,
    });
    openQuestGuarded({
      quest,
      user,
      navigate,
      source: 'impact_suggestion',
    });
  };

  const handleViewAllMilestones = () => {
    trackEvent('view_all_milestones_clicked');
    setShowMilestonesSheet(true);
  };

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <AppBackground variant="finance" grain grid={false} animate>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppBackground>
    );
  }

  const displayTotalFormatted = formatCurrency(displayTotal, language);
  const nextMilestoneTarget = period === 'year' 
    ? nextMilestone.target 
    : Math.round(nextMilestone.target / 12);
  const nextMilestoneRemaining = period === 'year'
    ? nextMilestone.remaining
    : Math.round(nextMilestone.remaining / 12);

  return (
    <AppBackground variant="finance" grain grid={false} animate>
      <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]">
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-20 sm:pb-0">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header compact */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center justify-between mb-2"
            >
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-4xl font-black text-white mb-2 flex items-center gap-2"
                  style={{ 
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 900,
                    letterSpacing: '-0.02em'
                  }}
                >
                  <span className="bg-gradient-to-r from-white via-amber-200 to-orange-200 bg-clip-text text-transparent">
                    {t('impact.title') || 'Impact'}
                  </span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm sm:text-base text-gray-400 font-medium"
                >
                  {stats.eventsCount} {stats.eventsCount > 1 ? 'économies' : 'économie'}
                </motion.p>
              </div>
              
              {/* Toggle €/an | €/mois */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10 backdrop-blur-sm"
                role="group"
                aria-label={t('impact.toggle.period') || 'Choisir la période'}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPeriod('year')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all relative min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    period === 'year'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 shadow-glow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-pressed={period === 'year'}
                  aria-label="Afficher en euros par an"
                >
                  €/an
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPeriod('month')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all relative min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    period === 'month'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 shadow-glow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-pressed={period === 'month'}
                  aria-label="Afficher en euros par mois"
                >
                  €/mois
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Hero métrique améliorée */}
            {stats.totalAnnual > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                className="relative neon-element rounded-3xl p-5 sm:p-6 lg:p-8 overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)] group"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.25) 100%)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Shine effect au hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.8) 50%, transparent 60%)',
                  }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                />
                
                {/* Orbes décoratifs animés */}
                <motion.div 
                  className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-black/20 to-black/10 rounded-full blur-3xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    x: [0, 20, 0],
                    y: [0, 20, 0]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                  className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-br from-black/20 to-black/10 rounded-full blur-3xl"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    x: [0, -20, 0],
                    y: [0, -20, 0]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Ligne d'accent en haut */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                <div className="relative z-10 flex items-center gap-4 sm:gap-6 lg:gap-8">
                  {/* Image agrandie à gauche */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6, ease: 'backOut' }}
                    className="flex-shrink-0"
                  >
                    <motion.img
                      src={impactHeroImg}
                      alt="Impact"
                      className="w-32 sm:w-40 lg:w-48 xl:w-56 h-auto object-contain drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]"
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 3, -3, 0]
                      }}
                      transition={{ 
                        duration: 5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                  
                  {/* Contenu texte à droite */}
                  <div className="flex-1 min-w-0">
                    {/* Label discret en haut */}
                    <div className="flex items-center gap-2 mb-2">
                      <FaChartLine className="text-amber-400/60 text-sm" />
                      <span className="text-xs font-bold text-amber-400/60 uppercase tracking-wider">
                        {t('impact.hero.title') || 'Impact total'}
                      </span>
                    </div>
                    
                    {/* Montant principal */}
                    <motion.div 
                      key={displayTotal}
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: 'backOut' }}
                      className="mb-2"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-amber-400/80 text-3xl sm:text-4xl lg:text-5xl font-black">+</span>
                        <CountUp 
                          end={Math.round(displayTotal)} 
                          duration={1000}
                          prefix=""
                          suffix=""
                          locale={language}
                        />
                        <span className="text-amber-400/80 text-2xl sm:text-3xl lg:text-4xl font-black">€{displaySuffix}</span>
                      </div>
                    </motion.div>
                    
                    {/* Sous-texte */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm sm:text-base text-gray-300 font-semibold"
                    >
                      {t('impact.hero.subtitle') || 'Mesure ce que tu gagnes réellement.'}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative neon-element rounded-2xl p-8 sm:p-12 text-center overflow-hidden border border-amber-500/20"
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)'
                }}
              >
                {/* Orbes décoratifs */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl animate-float" />
                
                <div className="relative z-10">
                  {/* Image de progression au lieu de l'icône */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-32 h-32 mx-auto mb-6 relative"
                  >
                    <motion.img
                      src={progressionImg}
                      alt="Progression"
                      className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl sm:text-4xl font-black mb-3"
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}
                  >
                    <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                      {t('impact.empty.title') || 'Commence et vois ton impact grimper'}
                    </span>
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-gray-400 mb-8 max-w-md mx-auto"
                  >
                    Ajoute ta première économie pour voir ton impact augmenter
                  </motion.p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsModalOpen(true)}
                      className="px-8 py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-gray-900 font-black rounded-xl shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:shadow-[0_0_50px_rgba(251,191,36,0.8)] transition-all relative overflow-hidden group border-2 border-white/20"
                      style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <FaPlus className="text-xl" />
                        {t('impact.ledger.add_btn') || 'Ajouter une économie'}
                      </span>
                    </motion.button>
                    
                    {getStarterPackQuests(currentLang || 'fr', 'fr-FR').length > 0 && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const firstQuest = getStarterPackQuests(currentLang || 'fr', 'fr-FR')[0];
                          openQuestGuarded({
                            quest: firstQuest,
                            user,
                            navigate,
                            source: 'impact_empty_state',
                          });
                        }}
                        className="px-6 py-3 text-amber-400 hover:text-amber-300 font-bold rounded-xl border-2 border-amber-500/30 hover:border-amber-500/50 transition-all"
                        style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <FaFire className="text-lg" />
                          {t('impact.empty.cta') || 'Démarrer un gain rapide'}
                        </span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Carte "Tous les paliers atteints" */}
            {allMilestonesReached && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="neon-element rounded-2xl p-6 sm:p-8 border border-emerald-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.5)] text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)'
                }}
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full blur-3xl animate-float" />
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-5xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent mb-2">
                    Tous les paliers atteints !
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Félicitations, tu as atteint tous les paliers d'impact disponibles.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/quests')}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-green-400 text-gray-900 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                    >
                      Voir les quêtes suivantes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Optionnel : fixer un nouvel objectif
                        trackEvent('milestone_set_new_goal');
                      }}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-colors"
                    >
                      Fixer un nouvel objectif
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Carte Prochain palier avec suggestions intégrées */}
            {stats.totalAnnual > 0 && !allMilestonesReached && nextMilestone.target && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                whileHover={{ y: -2, scale: 1.01 }}
                className="neon-element rounded-2xl p-5 sm:p-6 border border-emerald-500/30 hover:border-emerald-500/50 transition-all group relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.06) 100%)'
                }}
              >
                {/* Orbes animés */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full blur-3xl animate-float" />
                {suggestedQuests.length > 0 && (
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float-slow" />
                )}
                
                <div className="relative z-10">
                  {/* Header du palier simplifié */}
                  <div className="mb-8">
                    <div className="flex items-baseline justify-between mb-5">
                      <div>
                        <p className="text-sm text-emerald-400 font-semibold mb-2">
                          Prochain palier
                        </p>
                        <p className="text-3xl sm:text-4xl font-black text-white">
                          {formatCurrency(nextMilestoneTarget, language)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">
                          Plus que
                        </p>
                        <p className="text-xl font-bold text-emerald-400">
                          {formatCurrency(nextMilestoneRemaining, language)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Indicateurs de progression avec dots et lien */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {IMPACT_MILESTONES.map((_, index) => {
                            const isReached = index <= nextMilestone.currentIndex;
                            return (
                              <motion.div
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={`w-3 h-3 rounded-full transition-all ${
                                  isReached
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                    : 'bg-white/10'
                                }`}
                              />
                            );
                          })}
                        </div>
                        <span className="text-xs text-gray-400">
                          Palier {nextMilestone.currentIndex + 1} sur {nextMilestone.totalMilestones}
                        </span>
                      </div>
                      
                      {/* Lien vers tous les paliers */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAllMilestones();
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-semibold flex items-center gap-1 hover:gap-2"
                      >
                        Voir tous
                        <span className="inline-block transition-transform">→</span>
                      </button>
                    </div>
                  </div>

                  {/* CTA vers les quêtes */}
                  {nextMilestone.remaining >= 50 && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/quests')}
                      className="w-full mt-4 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 border-2 border-emerald-500/40 hover:border-emerald-400/60 transition-all group relative overflow-hidden"
                    >
                      {/* Effet de brillance */}
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.2), transparent)',
                        }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                      />
                      
                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            <span className="text-xl">⚡</span>
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-base font-bold text-white leading-tight">
                              Atteindre {formatCurrency(nextMilestoneTarget, language)}
                            </p>
                            <p className="text-xs text-emerald-300 mt-0.5 line-clamp-1">
                              Découvrir les quêtes
                            </p>
                          </div>
                        </div>
                        <motion.div
                          className="text-emerald-400 text-2xl flex-shrink-0"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.div>
                      </div>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Ledger groupé par mois */}
            {eventsByMonth.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Mes économies
                  </h2>
                </motion.div>
                
                {eventsByMonth.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (groupIndex * 0.1) }}
                      className="flex items-center gap-3 mb-4"
                    >
                      <div className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full" />
                      <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent uppercase tracking-wider">
                        {formatMonthYear(group.month, language)}
                      </h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    </motion.div>
                    
                    {group.events.map((event, index) => {
                      const annual = calculateAnnual(event);
                      const displayAmount = period === 'year' ? annual : Math.round(annual / 12);
                      const categoryStyle = categoryStyles[event.category] || categoryStyles.budgeting;
                      
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + (groupIndex * 0.1) + (index * 0.05), duration: 0.3 }}
                          whileHover={{ y: -3, scale: 1.01 }}
                          className={`neon-element rounded-2xl p-5 sm:p-6 border ${categoryStyle.borderColor} hover:border-opacity-70 transition-all relative group cursor-pointer ${categoryStyle.neonGlow}`}
                          style={{
                            background: categoryStyle.bgGradient,
                            overflow: menuOpenFor === event.id ? 'visible' : 'hidden'
                          }}
                        >
                          {/* Orbe subtil */}
                          <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-white/5 to-white/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                            {/* Image PNG de catégorie */}
                            <motion.div 
                              whileHover={{ rotate: 5, scale: 1.1 }}
                              className="flex-shrink-0"
                            >
                              <img 
                                src={categoryStyle.illustration}
                                alt={event.category}
                                className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                              />
                            </motion.div>
                            
                            <div className="flex-1 min-w-0">
                              {/* Titre sur 2 lignes max */}
                              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-amber-100 transition-colors">
                                {event.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2.5 text-sm text-gray-400">
                                <span className="px-2.5 py-1 bg-white/5 rounded-lg font-medium">
                                  {event.period === 'month' ? t('impact.ledger.period_month') || 'mensuel' : t('impact.ledger.period_year') || 'annuel'}
                                </span>
                                <span className="text-gray-600">•</span>
                                <span>{event.source === 'quest' ? (t('impact.ledger.source_quest') || 'Quête') : (t(`impact.ledger.source_${event.source}`) || event.source)}</span>
                                <span className="text-gray-600 hidden sm:inline">•</span>
                                <span className="hidden sm:inline">{formatDate(event.createdAt, language)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="text-right">
                                <motion.div 
                                  className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                  +{formatCurrency(displayAmount, language)}
                                </motion.div>
                              </div>
                              
                              {/* Menu ⋯ */}
                              <div className="relative z-50" ref={menuRef}>
                                <motion.button
                                  whileHover={{ scale: 1.1, rotate: 90 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenFor(menuOpenFor === event.id ? null : event.id);
                                  }}
                                  className="p-2 text-gray-400 hover:text-white transition-colors touch-manipulation rounded-lg hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                  aria-label={t('impact.ledger.actions.menu') || 'Menu'}
                                  aria-expanded={menuOpenFor === event.id}
                                >
                                  <FaEllipsisV className="w-5 h-5" />
                                </motion.button>
                                
                                <AnimatePresence>
                                  {menuOpenFor === event.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                      transition={{ duration: 0.2 }}
                                      className="absolute right-0 bottom-full mb-2 w-40 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl z-[100] overflow-hidden"
                                      style={{ position: 'absolute' }}
                                    >
                                      <motion.button
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(event);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                                      >
                                        <FaEdit className="w-4 h-4" />
                                        {t('impact.ledger.actions.edit') || 'Modifier'}
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(event);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                      >
                                        <FaTrash className="w-4 h-4" />
                                        {t('impact.ledger.actions.delete') || 'Supprimer'}
                                      </motion.button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
                
                {/* Bouton "Voir plus" si nécessaire */}
                {events.length > displayedEventsCount && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDisplayedEventsCount(prev => prev + 50)}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-colors"
                    >
                      Voir plus ({events.length - displayedEventsCount} restants)
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Bottom Sheet pour tous les paliers */}
            <AnimatePresence>
              {showMilestonesSheet && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowMilestonesSheet(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                  />
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl z-50 max-h-[80vh] overflow-y-auto shadow-2xl"
                  >
                    {/* Handle bar */}
                    <div className="flex justify-center pt-3 pb-2">
                      <div className="w-12 h-1 bg-white/20 rounded-full" />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <motion.h2 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xl font-bold text-white"
                        >
                          {t('impact.milestones.title') || 'Tous les paliers'}
                        </motion.h2>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowMilestonesSheet(false)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          ✕
                        </motion.button>
                      </div>
                      
                      <div className="space-y-2">
                        {IMPACT_MILESTONES.map((milestone, index) => {
                          const isReached = stats.totalAnnual >= milestone;
                          const displayMilestone = period === 'year' ? milestone : Math.round(milestone / 12);
                          const isNext = milestone === nextMilestone.target;
                          
                          return (
                            <motion.div
                              key={milestone}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.02, x: 4 }}
                              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                                isReached
                                  ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                                  : isNext
                                  ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                                  : 'bg-white/5 border-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {isReached ? (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/40"
                                  >
                                    <FaCheck className="text-emerald-400 text-sm" />
                                  </motion.div>
                                ) : (
                                  <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                  </div>
                                )}
                                <div>
                                  <div className={`text-base font-bold ${
                                    isReached ? 'text-emerald-400' : isNext ? 'text-amber-400' : 'text-white'
                                  }`}>
                                    {formatCurrency(displayMilestone, language)}{displaySuffix}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {index + 1}/{IMPACT_MILESTONES.length}
                                  </div>
                                </div>
                              </div>
                              {isNext && !isReached && (
                                <div className="px-2 py-1 bg-amber-500/20 rounded text-xs font-semibold text-amber-400 border border-amber-500/30">
                                  Prochain
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* FAB avec effet neon */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 10 }}
        className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50"
      >
        {/* Glow ring animé */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 blur-xl opacity-60"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsModalOpen(true)}
                  className="relative w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-gray-900 font-bold shadow-[0_0_30px_rgba(251,191,36,0.8)] hover:shadow-[0_0_50px_rgba(251,191,36,1)] flex items-center justify-center touch-manipulation overflow-hidden group border-2 border-white/20 min-w-[44px] min-h-[44px]"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                  aria-label={t('impact.ledger.add_btn') || 'Ajouter une économie'}
                >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <FaPlus className="text-2xl relative z-10 drop-shadow-[0_0_4px_rgba(0,0,0,0.3)]" />
        </motion.button>
      </motion.div>

      {/* Modals */}
      <AddSavingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <EditSavingsModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEventToEdit(null);
        }}
        onSuccess={handleEditSuccess}
        event={eventToEdit}
      />
    </AppBackground>
  );
};

export default Impact;
