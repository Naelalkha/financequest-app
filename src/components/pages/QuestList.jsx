import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from 'framer-motion';
// Styles globaux unifiés (neon/glass) désormais dans global.css
import { 
  FaLock, 
  FaClock, 
  FaSearch, 
  FaTrophy,
  FaTimes, 
  FaFire, 
  FaChartLine,
  FaPiggyBank,
  FaWallet,
  FaCheck,
  FaLayerGroup,
  FaArrowRight,
  FaPlay,
  FaRedoAlt,
  FaBolt,
  FaBookmark,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCrown,
  FaChevronDown,
  FaCircle,
  FaCreditCard,
  FaShieldAlt,
  FaFileInvoiceDollar
} from 'react-icons/fa';
import { GiDiamondTrophy, GiTwoCoins } from 'react-icons/gi';
import { BsStars } from 'react-icons/bs';
import { RiFireFill } from 'react-icons/ri';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../app/LoadingSpinner';
import { toast } from 'react-toastify';
import { useLocalQuests } from '../../hooks/useLocalQuests';
import QuestCardShared from '../quest/QuestCard';
import { usePaywall } from '../../hooks/usePaywall';
import PaywallModal from '../app/PaywallModal';
import posthog from 'posthog-js';
import AppBackground from '../app/AppBackground';
import Select from '../quest/Select';

// Skeleton futuriste
const QuestSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotateY: 30 }}
      transition={{ duration: 0.5 }}
      className="neon-card rounded-3xl p-6 relative overflow-hidden"
    >
      <div className="animate-pulse">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl animate-float" />
          <div className="flex-1">
            <div className="h-6 bg-gradient-to-r from-purple-500/20 to-transparent rounded-lg w-3/4 mb-2" />
            <div className="h-4 bg-gradient-to-r from-blue-500/15 to-transparent rounded-md w-1/2" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-12 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-2xl flex-1 animate-pulse-glow" />
        </div>
      </div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float-slow" />
    </motion.div>
  );
};

// Configuration des catégories avec style néon unifié (labels seront définis dans le composant)
const baseCategoryConfig = {
  all: { 
    gradient: 'from-violet-400 via-purple-400 to-pink-400',
    neonGlow: 'shadow-[0_0_20px_rgba(167,139,250,0.3)]',
    color: 'text-violet-300',
    bgColor: 'bg-violet-500/20',
    borderColor: 'border-violet-500/30',
    icon: null
  },
  budgeting: { 
    gradient: 'from-cyan-400 via-sky-400 to-teal-400',
    neonGlow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    icon: FaWallet
  },
  saving: { 
    gradient: 'from-green-400 via-lime-400 to-emerald-400',
    neonGlow: 'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
    color: 'text-green-300',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    icon: FaPiggyBank
  },
  credit: { 
    gradient: 'from-red-400 via-rose-400 to-pink-400',
    neonGlow: 'shadow-[0_0_20px_rgba(248,113,113,0.3)]',
    color: 'text-red-300',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    icon: FaCreditCard
  },
  investing: { 
    gradient: 'from-blue-400 via-indigo-400 to-purple-400',
    neonGlow: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    icon: FaChartLine
  },
  taxes: { 
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
    neonGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    icon: FaFileInvoiceDollar
  },
  protect: { 
    gradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
    neonGlow: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]',
    color: 'text-pink-300',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/30',
    icon: FaShieldAlt
  }
};

const QuestList = () => {
  const { user } = useAuth();
  const { t, currentLang } = useLanguage();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [userProgress, setUserProgress] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const [bookmarkedQuests, setBookmarkedQuests] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [hoveredQuest, setHoveredQuest] = useState(null);
  const [completedQuestsCount, setCompletedQuestsCount] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true);
  const [rawSearch, setRawSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    streak: 0,
    totalQuests: 0
  });
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Configuration des catégories avec labels traduits
  const categoryConfig = useMemo(() => ({
    all: { 
      ...baseCategoryConfig.all,
      label: t('questList.all') || 'Toutes'
    },
    budgeting: { 
      ...baseCategoryConfig.budgeting,
      label: t('questList.budgeting') || 'Budget'
    },
    saving: { 
      ...baseCategoryConfig.saving,
      label: t('questList.saving') || 'Épargne'
    },
    credit: { 
      ...baseCategoryConfig.credit,
      label: t('questList.credit') || 'Crédit'
    },
    investing: { 
      ...baseCategoryConfig.investing,
      label: t('questList.investing') || 'Investissement'
    },
    taxes: { 
      ...baseCategoryConfig.taxes,
      label: t('questList.taxes') || 'Fiscalité'
    },
    protect: { 
      ...baseCategoryConfig.protect,
      label: t('questList.protect') || 'Protection'
    }
  }), [t]);

  // Use the local quests hook
  const { 
    quests, 
    loading, 
    userCountry,
    getQuestsByCategoryForUser,
    getQuestStats 
  } = useLocalQuests();
  
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    search: '',
    sortBy: 'hot'
  });

  // Déterminer la quête active (la plus avancée parmi celles en cours)
  const activeQuest = useMemo(() => {
    if (!quests || quests.length === 0) return null;
    const activeQuests = quests.filter((q) => userProgress[q.id]?.status === 'active');
    if (activeQuests.length === 0) return null;
    const questWithProgress = activeQuests
      .map((q) => ({ quest: q, progress: userProgress[q.id]?.progress || 0 }))
      .sort((a, b) => b.progress - a.progress)[0];
    return questWithProgress?.quest ?? null;
  }, [quests, userProgress]);

  // Tags rapides pour filtrage rapide (non redondants) - épuré
  const quickTags = useMemo(() => [
    { 
      id: 'new', 
      label: t('questList.new') || 'Nouveau',
      icon: BsStars,
      color: 'text-cyan-300',
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/30',
      filter: (q) => q.isNew 
    },
    { 
      id: 'progress', 
      label: t('questList.in_progress') || 'En cours',
      icon: FaBolt,
      color: 'text-orange-300',
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/30',
      filter: (q) => userProgress[q.id]?.status === 'active'
    }
  ], [t, userProgress]);

  useEffect(() => {
    if (!user) {
      setIsUserDataLoaded(true);
      return;
    }
    setIsUserDataLoaded(false);
    loadUserData();
  }, [user, currentLang]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsPremium(userData.isPremium || false);
        setBookmarkedQuests(userData.bookmarkedQuests || []);
        setUserStats({
          level: userData.level || 1,
          xp: userData.xp || 0,
          streak: userData.streak || 0,
          totalQuests: userData.completedQuests || 0
        });
      }

      const progressQuery = query(
        collection(db, 'userQuests'),
        where('userId', '==', user.uid)
      );
      const progressSnapshot = await getDocs(progressQuery);
      const progress = {};
      let completedCount = 0;
      progressSnapshot.docs.forEach(doc => {
        const data = doc.data();
        progress[data.questId] = {
          status: data.status,
          progress: data.progress || 0,
          completedAt: data.completedAt,
          score: data.score || 0
        };
        if (data.status === 'completed') {
          completedCount++;
        }
      });
      setUserProgress(progress);
      setCompletedQuestsCount(completedCount);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsUserDataLoaded(true);
    }
  };

  const calculateRecommendationScore = (quest) => {
    let score = 0;
    if (quest.isNew) score += 30;
    // Favoriser les quêtes récentes de façon déterministe
    score += (quest.createdAt || 0) * 0.6;
    // Prioriser les quêtes en cours
    if (userProgress[quest.id] && userProgress[quest.id].status !== 'completed') score += 40;
    // Déprioriser les quêtes déjà terminées
    if (userProgress[quest.id]?.status === 'completed') score -= 50;
    // Favoriser les favoris
    if (bookmarkedQuests.includes(quest.id)) score += 35;
    // Légère pondération par XP
    score += (quest.xp || 0) * 0.05;
    return score;
  };

  // Quêtes filtrées
  const filteredQuests = useMemo(() => {
    if (!quests || quests.length === 0) return [];

    const enrichedQuests = quests.map((quest, index) => ({
      ...quest,
      isNew: index >= quests.length - 5,
      createdAt: quests.length - index
    }));

    let filtered = [...enrichedQuests];

    if (filters.category !== 'all') {
      filtered = filtered.filter(quest => quest.category === filters.category);
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(quest => quest.difficulty === filters.difficulty);
    }

    selectedTags.forEach(tagId => {
      const tag = quickTags.find(t => t.id === tagId);
      if (tag && tag.filter) {
        filtered = filtered.filter(tag.filter);
      }
    });

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(quest => 
        quest.title.toLowerCase().includes(searchLower) ||
        quest.description.toLowerCase().includes(searchLower)
      );
    }

    // Tri
    switch (filters.sortBy) {
      case 'new':
        filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
      case 'xp':
        filtered.sort((a, b) => b.xp - a.xp);
        break;
      case 'quick':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'hot':
      default:
        // Étape 1: tri stable par récence pour base visuelle
        filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        // Étape 2: si la progression est chargée, re-classement progressif côté UI (voir animation), pas brut
        if (isUserDataLoaded) {
          filtered.sort((a, b) => calculateRecommendationScore(b) - calculateRecommendationScore(a));
        }
        break;
    }

    return filtered;
  }, [quests, filters, selectedTags, userProgress, bookmarkedQuests, debouncedSearch]);

  // Debounce de la recherche (source de vérité: rawSearch)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(rawSearch.trim()), 300);
    return () => clearTimeout(id);
  }, [rawSearch]);

  // Gérer l’état desktop/mobile sans lire window.innerWidth dans le rendu
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange);
    };
  }, []);

  // Fond animé global remplacé par AppBackground (voir composant commun)

  // Observer le scroll pour afficher un bouton remonter
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = document.getElementById('app-scroll-container');
    if (!container) return;
    const onScroll = () => {
      setShowScrollToTop(container.scrollTop > 600);
    };
    onScroll();
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleBookmark = async (questId, e) => {
    e?.stopPropagation();
    
      if (!user) {
        toast.info(t('questList.login_to_save') || '🔒 Connectez-vous pour enregistrer');
      return;
    }

    try {
      const newBookmarks = bookmarkedQuests.includes(questId)
        ? bookmarkedQuests.filter(id => id !== questId)
        : [...bookmarkedQuests, questId];
      
      setBookmarkedQuests(newBookmarks);
      
      await updateDoc(doc(db, 'users', user.uid), {
        bookmarkedQuests: newBookmarks
      });
      
      if (!bookmarkedQuests.includes(questId)) {
        toast.success(t('questList.saved') || '✨ Saved!', {
          position: "bottom-center",
          autoClose: 1500
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleQuestClick = (quest, e) => {
    const activeVariant = posthog.getFeatureFlag('paywall_variant');
    
    if (quest.isPremium && !isPremium && activeVariant === 'A_direct') {
      e.preventDefault();
      posthog.capture('paywall_triggered', {
        variant: 'A_direct',
        quest_id: quest.id
      });
      setSelectedQuest(quest);
      setShowPaywall(true);
      return;
    }
  };

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      difficulty: 'all',
      search: '',
      sortBy: 'hot'
    });
    setSelectedTags([]);
    setShowAdvancedFilters(false);
  };

  const onCardActivate = (quest, e) => {
    const activeVariant = posthog.getFeatureFlag('paywall_variant');
    const isLocked = quest.isPremium && !isPremium;
    if (isLocked && activeVariant === 'A_direct') {
      e.preventDefault();
      posthog.capture('paywall_triggered', {
        variant: 'A_direct',
        quest_id: quest.id
      });
      setSelectedQuest(quest);
      setShowPaywall(true);
      return;
    }
    navigate(`/quests/${quest.id}`);
  };

  // Configuration de difficulté avec meilleur contraste
  const difficultyConfig = {
    beginner: { 
      label: t?.('questList.easy') || 'Facile', 
      color: 'text-emerald-300',
      bgStyle: 'bg-emerald-500/20 border border-emerald-500/30',
      textColor: 'text-emerald-300',
      gradient: 'from-emerald-400 to-green-400'
    },
    intermediate: { 
      label: t?.('questList.medium') || 'Moyen', 
      color: 'text-amber-300',
      bgStyle: 'bg-amber-500/20 border border-amber-500/30',
      textColor: 'text-amber-300',
      gradient: 'from-amber-400 to-orange-400'
    },
    advanced: { 
      label: t?.('questList.hard') || 'Difficile', 
      color: 'text-red-300',
      bgStyle: 'bg-red-500/20 border border-red-500/30',
      textColor: 'text-red-300',
      gradient: 'from-red-400 to-rose-400'
    }
  };

  // Rendu des cartes avec style néon/gaming
  const renderQuestCard = (quest, index) => {
    const progress = userProgress[quest.id];
    const isCompleted = progress?.status === 'completed';
    const isInProgress = progress?.status === 'active';
    const isLocked = quest.isPremium && !isPremium;
    const isBookmarked = bookmarkedQuests.includes(quest.id);
    const category = categoryConfig[quest.category] || categoryConfig.all;
    const difficulty = difficultyConfig[quest.difficulty] || difficultyConfig.beginner;

    return (
      <QuestCardShared
        key={quest.id}
        quest={quest}
        progressData={progress}
        isPremiumUser={isPremium}
        onClick={(e) => onCardActivate(quest, e)}
      />
  );
  };

  return (
    <AppBackground variant="finance" grain grid={false} animate>
      <div className="relative pb-[calc(env(safe-area-inset-bottom)+88px)]">
        

        {/* Header optimisé avec design épuré */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <div className="w-full max-w-7xl mx-auto">
            {/* En-tête avec stats utilisateur */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              {/* Titre et sous-titre */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 
                  className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight"
                  style={{ 
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontWeight: 900,
                    letterSpacing: '-0.03em'
                  }}
                >
                  <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
{t('questList.quests') || 'Quêtes'}
                  </span>
                  <span className="text-white ml-2">
{t('questList.financial') || 'Financières'}
                  </span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base mt-0.5">
                  {t('questList.quests_available', { count: filteredQuests.length }) || `${filteredQuests.length} quêtes disponibles`}
                </p>
              </motion.div>

              {/* Stats rapides utilisateur */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  {/* Streak */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <FaFire className="text-orange-400 text-sm" />
                    <span className="text-orange-300 font-bold text-sm">{userStats.streak || 0}</span>
                  </div>
                  
                  {/* XP */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <GiTwoCoins className="text-yellow-400 text-sm" />
                    <span className="text-yellow-300 font-bold text-sm">{userStats.xp || 0} XP</span>
                  </div>
                  
                  {/* Niveau */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <FaTrophy className="text-purple-400 text-sm" />
                    <span className="text-purple-300 font-bold text-sm">{t('questList.level_short') || 'Niv.'} {userStats.level || 1}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Bouton discret remonter en haut */}
        <AnimatePresence>
          {showScrollToTop && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => {
                const container = document.getElementById('app-scroll-container');
                if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="fixed bottom-[calc(env(safe-area-inset-bottom)+78px)] right-4 sm:right-6 z-[70] p-2.5 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white shadow-lg backdrop-blur-md transition-colors"
              aria-label="Remonter en haut"
            >
              <FaArrowRight className="rotate-[-90deg]" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Bannière Continuer (supprimée) */}

        {/* Zone de filtres avec design moderne (non-sticky) */}
        <div className="px-4 sm:px-6 py-2.5">
          <div className="w-full max-w-7xl mx-auto">
            <div className="space-y-3">
              {/* Ligne 1: Recherche et bouton filtres */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Barre de recherche modernisée */}
                <div className="flex-1 relative">
                  <div className="relative group">
                    {/* Effet de focus amélioré */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg opacity-0 group-focus-within:opacity-20 blur transition-opacity" />
                    
                    <div className="relative flex items-center bg-white/[0.03] backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 focus-within:border-amber-500/50 transition-all">
                      <FaSearch className="text-gray-500 ml-4 text-sm" />
                      <input
                        type="text"
                        placeholder={t('questList.search_placeholder') || 'Rechercher une quête...'}
                        value={rawSearch}
                        onChange={(e) => setRawSearch(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder-gray-500 px-3 py-2.5 focus:outline-none text-sm"
                        aria-label={t('questList.search_placeholder') || 'Rechercher une quête'}
                      />
                      {rawSearch && (
                        <button
                          onClick={() => setRawSearch('')}
                          className="text-gray-500 hover:text-white mr-3 p-1 rounded transition-colors"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bouton tri (mobile) */}
                <button
                  onClick={() => setShowAdvancedFilters(prev => !prev)}
                  className="sm:hidden px-4 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                  aria-expanded={showAdvancedFilters}
                  aria-controls="advanced-filters"
                >
                  <FaLayerGroup className="text-amber-400 text-sm" />
                  <span className="text-white text-sm font-semibold">{t('questList.sort') || 'Trier'}</span>
                  <motion.div
                    animate={{ rotate: showAdvancedFilters ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaArrowRight className="text-xs text-gray-400" />
                  </motion.div>
                </button>
              </div>

              {/* Ligne 2: Filtres rapides toujours visibles */}
              <div className="relative -mx-4 sm:-mx-6">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 px-4 sm:px-6">
                  {/* Tags rapides */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                  {quickTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    const IconComponent = tag.icon;
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.id)}
                        className={`
                          px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap
                          transition-all flex items-center gap-1.5 flex-shrink-0
                          ${isSelected
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/[0.03] text-gray-400 hover:text-gray-300 hover:bg-white/[0.06] border border-white/10'
                          }
                        `}
                      >
                        <IconComponent className="text-[11px]" />
                        <span>{tag.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="w-px h-6 bg-white/10 flex-shrink-0" />
                
                {/* Catégories en chips horizontales - toutes disponibles */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const isSelected = filters.category === key;
                    const IconComponent = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => handleFilterChange('category', key)}
                        className={`
                          px-3 py-1.5 rounded-full text-xs font-semibold
                          transition-all flex items-center gap-1.5 flex-shrink-0
                          ${isSelected
                            ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                            : 'bg-white/[0.03] text-gray-400 hover:text-gray-300 hover:bg-white/[0.06] border border-white/10'
                          }
                        `}
                      >
                        {IconComponent && <IconComponent className="text-[11px]" />}
                        <span>{config.label}</span>
                      </button>
                    );
                  })}
                  {/* Spacer pour le padding de fin */}
                  <div className="w-4 sm:w-6 flex-shrink-0" />
                </div>
                </div>
              </div>

              {/* Filtres avancés - visible sur desktop ou via bouton mobile */}
              <motion.div
                initial={false}
                animate={{ 
                  height: showAdvancedFilters || isDesktop ? 'auto' : 0,
                  opacity: showAdvancedFilters || isDesktop ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-visible"
                aria-expanded={showAdvancedFilters || isDesktop}
                id="advanced-filters"
              >
                <div className="pt-3 border-t border-white/5 relative z-30">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                    {/* Difficulté */}
                    <div className="relative">
                      <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">
                        {t('questList.difficulty') || 'Difficulté'}
                      </label>
                      <Select
                        value={filters.difficulty}
                        onChange={(val) => handleFilterChange('difficulty', val)}
                        options={[
                          { value: 'all', label: t('questList.all_difficulties') || 'Toutes' },
                          { value: 'beginner', label: t('questList.easy') || 'Facile', icon: <FaCircle className="text-emerald-400 text-[9px]" /> },
                          { value: 'intermediate', label: t('questList.medium') || 'Moyen', icon: <FaCircle className="text-amber-400 text-[9px]" /> },
                          { value: 'advanced', label: t('questList.hard') || 'Difficile', icon: <FaCircle className="text-red-400 text-[9px]" /> },
                        ]}
                      />
                    </div>

                    {/* Tri */}
                    <div className="relative">
                      <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">
{t('questList.sort_by') || 'Trier par'}
                      </label>
                      <Select
                        value={filters.sortBy}
                        onChange={(val) => handleFilterChange('sortBy', val)}
                        options={[
                          { value: 'hot', label: t('questList.trending') || 'Tendance', icon: <FaFire className="text-orange-400 text-[12px]" /> },
                          { value: 'new', label: t('questList.recent') || 'Récent', icon: <BsStars className="text-cyan-300 text-[12px]" /> },
                          { value: 'xp', label: 'XP Max', icon: <GiTwoCoins className="text-yellow-400 text-[12px]" /> },
                          { value: 'quick', label: t('questList.quick') || 'Rapide', icon: <FaBolt className="text-purple-300 text-[12px]" /> },
                        ]}
                      />
                    </div>

                    {/* Catégorie */}
                    <div className="relative">
                      <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">
                        {t('questList.category') || 'Catégorie'}
                      </label>
                      <Select
                        value={filters.category}
                        onChange={(val) => handleFilterChange('category', val)}
                        options={Object.entries(categoryConfig).map(([key, config]) => ({
                          value: key,
                          label: config.label,
                          icon: config.icon ? (
                            <config.icon className={`text-[12px] ${config.color}`} />
                          ) : null,
                        }))}
                      />
                    </div>

                    {/* Bouton réinitialiser */}
                    <div className="flex items-end">
                      {(filters.category !== 'all' || filters.difficulty !== 'all' || selectedTags.length > 0 || debouncedSearch) && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={clearAllFilters}
                          className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-b from-red-500/15 to-red-500/10 hover:from-red-500/20 hover:to-red-500/15 text-red-400 border border-red-500/20 text-sm font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <FaTimes className="text-xs" />
                          <span>{t('questList.reset') || 'Réinitialiser'}</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Divider subtil sous la zone de filtres */}
        <div className="px-2 sm:px-4">
          <div className="w-full max-w-full sm:max-w-[1400px] mx-auto">
            <div className="h-px bg-white/5 mb-2" />
          </div>
        </div>

         {/* Quest Grid */}
        <div className="px-2 sm:px-4">
          <div className="w-full max-w-full sm:max-w-[1400px] mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(6)].map((_, index) => (
                  <QuestSkeleton key={index} />
                ))}
              </div>
            ) : !isUserDataLoaded ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8"
              />
            ) : filteredQuests.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                  <motion.div 
                    className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/10 to-emerald-500/10 mb-6"
                    animate={reduceMotion ? {} : { scale: [1, 1.03, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                   <FaSearch className="text-5xl text-gray-400" />
                 </motion.div>
                                                  <h3 
                   className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight"
                   style={{ 
                     fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                     fontWeight: 800,
                     letterSpacing: '-0.01em'
                   }}
                 >
                   {t('questList.no_quests') || 'AUCUNE QUÊTE'}
                 </h3>
                 <p 
                   className="text-gray-300 text-base sm:text-lg mb-6 max-w-md mx-auto leading-relaxed"
                   style={{ 
                     fontFamily: '"Inter", sans-serif',
                     fontWeight: 400,
                     letterSpacing: '0.005em'
                   }}
                 >
                  {t('questList.adjust_filters') || 'Essayez d\'ajuster vos filtres ou explorez toutes nos quêtes disponibles'}
                </p>
                                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={clearAllFilters}
                 className="px-8 py-4 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-white rounded-[28px] font-bold text-base uppercase tracking-wider border border-amber-500/30 transition-all"
                   style={{ 
                     fontFamily: '"Inter", sans-serif',
                   fontWeight: 700,
                     letterSpacing: '0.05em'
                   }}
                 >
                   {t('questList.view_all_quests') || 'Voir toutes les quêtes'}
                 </motion.button>
              </motion.div>
             ) : (
               <LayoutGroup>
                 <AnimatePresence mode="popLayout">
                   <motion.div 
                     key={filters.category + (isUserDataLoaded ? '-ready' : '-base')}
                     initial={{ opacity: 0, y: 8 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 6 }}
                     transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                     className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                   >
                     {filteredQuests.map((quest, index) => renderQuestCard(quest, index))}
                   </motion.div>
                 </AnimatePresence>
               </LayoutGroup>
             )}

            {/* Footer stats supprimé (doublon avec Dashboard) */}
          </div>
        </div>
        {/* Paywall Modal */}
        <AnimatePresence>
          {showPaywall && selectedQuest && (
            <PaywallModal
              quest={selectedQuest}
              variant="A_direct"
              onClose={() => {
                setShowPaywall(false);
                setSelectedQuest(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </AppBackground>
  );
};

export default QuestList;