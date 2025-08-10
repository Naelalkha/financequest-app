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
  FaCircle
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

// Configuration des catégories avec style néon unifié
const categoryConfig = {
  all: { 
    gradient: 'from-violet-400 via-purple-400 to-pink-400',
    neonGlow: 'shadow-[0_0_20px_rgba(167,139,250,0.3)]',
    label: 'Toutes', 
    color: 'text-violet-300',
    bgColor: 'bg-violet-500/20',
    borderColor: 'border-violet-500/30',
    icon: null
  },
  budgeting: { 
    gradient: 'from-cyan-400 via-sky-400 to-teal-400',
    neonGlow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    label: 'Budget', 
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    icon: FaWallet
  },
  saving: { 
    gradient: 'from-green-400 via-lime-400 to-emerald-400',
    neonGlow: 'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
    label: 'Épargne', 
    color: 'text-green-300',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    icon: FaPiggyBank
  },
  investing: { 
    gradient: 'from-blue-400 via-indigo-400 to-purple-400',
    neonGlow: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]',
    label: 'Investissement', 
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    icon: FaChartLine
  },
  debt: { 
    gradient: 'from-red-400 via-rose-400 to-pink-400',
    neonGlow: 'shadow-[0_0_20px_rgba(248,113,113,0.3)]',
    label: 'Dette', 
    color: 'text-red-300',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    icon: FaExclamationTriangle
  },
  planning: { 
    gradient: 'from-amber-400 via-orange-400 to-red-400',
    neonGlow: 'shadow-[0_0_20px_rgba(251,146,60,0.3)]',
    label: 'Planification', 
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    icon: FaCalendarAlt
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
  const quickTags = [
    { 
      id: 'new', 
      label: 'Nouveau',
      icon: BsStars,
      color: 'text-cyan-300',
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/30',
      filter: (q) => q.isNew 
    },
    { 
      id: 'progress', 
      label: 'En cours',
      icon: FaBolt,
      color: 'text-orange-300',
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/30',
      filter: (q) => userProgress[q.id]?.status === 'active'
    }
  ];

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
        toast.info('🔒 Connectez-vous pour enregistrer');
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
        toast.success('✨ Saved!', {
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
      label: 'Facile', 
      color: 'text-emerald-300',
      bgStyle: 'bg-emerald-500/20 border border-emerald-500/30',
      textColor: 'text-emerald-300',
      gradient: 'from-emerald-400 to-green-400'
    },
    intermediate: { 
      label: 'Moyen', 
      color: 'text-amber-300',
      bgStyle: 'bg-amber-500/20 border border-amber-500/30',
      textColor: 'text-amber-300',
      gradient: 'from-amber-400 to-orange-400'
    },
    advanced: { 
      label: 'Difficile', 
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
      <motion.div
        key={quest.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0
        }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.4,
          delay: Math.min(index * 0.05, 0.2)
        }}
        whileHover={{ 
          scale: 1.02,
          y: -5,
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
        onMouseEnter={() => setHoveredQuest(quest.id)}
        onMouseLeave={() => setHoveredQuest(null)}
        className="group relative w-full"
      >
        {/* Carte avec effet glass morphism style quêtes complétées */}
        <div
          className="relative rounded-2xl overflow-hidden w-full focus-visible-ring cursor-pointer"
          role="link"
          tabIndex={0}
          onClick={(e) => onCardActivate(quest, e)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardActivate(quest, e); } }}
          aria-label={`Ouvrir la quête ${quest.title}`}
        >
          {/* Gradient overlay animé au hover */}
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 rounded-2xl blur-lg opacity-0`}
            animate={{ opacity: hoveredQuest === quest.id ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
            <div 
             className={`
               relative neon-element rounded-2xl p-4 sm:p-5 lg:p-6 backdrop-blur-sm shadow
              ${hoveredQuest === quest.id ? `border-white/30 shadow-2xl ${category.neonGlow}` : ''}
              transition-all duration-500
            `}
                        style={{
              background: quest.category === 'all'
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)'
                  : quest.category === 'budgeting'
                    ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(13, 148, 136, 0.08) 100%)'
                    : quest.category === 'saving'
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(101, 163, 13, 0.08) 100%)'
                      : quest.category === 'investing'
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.08) 100%)'
                        : quest.category === 'debt'
                          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(244, 63, 94, 0.08) 100%)'
                          : quest.category === 'planning'
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.08) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
              boxShadow: quest.category === 'all'
                  ? '0 10px 25px -3px rgba(245, 158, 11, 0.1), 0 4px 6px -2px rgba(245, 158, 11, 0.05)'
                  : quest.category === 'budgeting'
                    ? '0 10px 25px -3px rgba(34, 211, 238, 0.1), 0 4px 6px -2px rgba(13, 148, 136, 0.05)'
                    : quest.category === 'saving'
                      ? '0 10px 25px -3px rgba(101, 163, 13, 0.1), 0 4px 6px -2px rgba(101, 163, 13, 0.05)'
                    : quest.category === 'investing'
                      ? '0 10px 25px -3px rgba(147, 51, 234, 0.1), 0 4px 6px -2px rgba(147, 51, 234, 0.05)'
                      : quest.category === 'debt'
                        ? '0 10px 25px -3px rgba(239, 68, 68, 0.1), 0 4px 6px -2px rgba(239, 68, 68, 0.05)'
                        : quest.category === 'planning'
                          ? '0 10px 25px -3px rgba(245, 158, 11, 0.1), 0 4px 6px -2px rgba(245, 158, 11, 0.05)'
                          : '0 10px 25px -3px rgba(255, 255, 255, 0.05), 0 4px 6px -2px rgba(255, 255, 255, 0.02)'
            }}
          >
            {/* Accent succès discret en top stripe si terminé */}
            {isCompleted && (
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
            )}
            {/* Shine effect */}
            {hoveredQuest === quest.id && (
              <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.7) 50%, transparent 60%)',
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.8 }}
              />
            )}

            <div className="relative z-10">
            {/* Header avec icône de catégorie */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                 <div className="flex items-center gap-2 sm:gap-3">
                  {/* Icône de catégorie au lieu d'emoji aléatoire */}
                  <div className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
                    ${category.bgColor} border ${category.borderColor || 'border-white/10'}
                  `}>
                    {category.icon && <category.icon className={`text-sm sm:text-lg ${category.color}`} />}
                  </div>
                  
                  {/* Order: NEW -> crown (premium) -> difficulty (max 2 visible) */}
                  {/* Badges: NEW → PRO → Difficulté (mobile: max 2 visibles) */}
                  {quest.isNew && !isCompleted && (
                    <div 
                      className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-[11px] sm:text-[12px] font-extrabold text-cyan-300 relative overflow-hidden uppercase tracking-wider"
                      style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: '0.05em' }}
                      aria-label="Nouveau"
                    >
                      NEW
                    </div>
                  )}

                  {quest.isPremium && !isPremium && (
                    <div
                      className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-purple-500/40 text-[11px] sm:text-[12px] font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5"
                      title="Quête premium"
                    >
                      <FaCrown className="text-[10px]" aria-hidden="true" />
                      PRO
                    </div>
                  )}

                  {/* Badge de difficulté - Optimisé (masqué sur mobile si NEW et PRO présents) */}
                  <div 
                    className={`
                      ${quest.isNew && (quest.isPremium && !isPremium) ? 'hidden sm:inline-flex' : 'inline-flex'}
                      px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider
                      ${difficulty.bgStyle} ${difficulty.textColor}
                    `}
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: '0.05em' }}
                  >
                    {difficulty.label}
                  </div>

                </div>

                {/* Right side status badges */}
                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <>
                      {/* Mobile: icon only */}
                      <FaCheckCircle className="text-emerald-300 text-[14px] sm:hidden" aria-label="Terminé" />
                      {/* Desktop: full chip */}
                      <div 
                        className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[12px] font-extrabold text-emerald-300 items-center gap-1 uppercase tracking-wider"
                        style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: '0.05em' }}
                      >
                        <FaCheckCircle className="text-[12px]" aria-hidden="true" />
                        Terminé
                      </div>
                    </>
                  )}
                </div>
              </div>
              
                             {/* Titre stylé et description - Optimisé */}
               <h3 
                 className="text-white font-extrabold text-[17px] sm:text-xl lg:text-2xl mb-2 line-clamp-2 leading-snug group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300"
                 style={{ 
                   fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                   fontWeight: 800,
                   letterSpacing: '-0.02em'
                 }}
               >
                {quest.title}
              </h3>
              
               <p 
                 className="text-gray-200 text-[13px] sm:text-sm line-clamp-2 leading-relaxed"
                 style={{ 
                   fontFamily: '"Inter", sans-serif',
                   fontWeight: 400,
                   letterSpacing: '0.005em',
                   lineHeight: '1.5'
                 }}
               >
                {quest.description}
              </p>
            </div>

                         {/* Stats optimisées - Style 2025 */}
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-1.5">
                 <FaClock className="text-cyan-400 text-sm" />
                 <span 
                   className="font-extrabold text-sm text-gray-300"
                   style={{ 
                     fontFamily: '"Inter", sans-serif',
                     fontWeight: 800
                   }}
                 >
                   {quest.duration}min
                 </span>
              </div>
              
              <div className="w-px h-4 bg-white/10" />
              
              <div className="flex items-center gap-1.5" aria-label="XP">
                <GiTwoCoins className="text-yellow-400 text-sm" aria-hidden="true" />
                <span 
                  className="font-extrabold text-yellow-300 text-sm"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                >
                  +{quest.xp}
                </span>
              </div>
              
              {isInProgress && (
                <>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.progress || 0}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-300">
                      {Math.round(progress.progress || 0)}%
                    </span>
                  </div>
                </>
              )}
            </div>

             {/* CTA amélioré (accent or/ambre, glow, micro-effets) */}
             <motion.button
               className={`
                 group relative overflow-hidden w-full sm:w-auto sm:min-w-[170px] min-h-12 py-3 px-5
                 rounded-[28px] font-bold text-[16px] tracking-tight font-sans
                 transition-all flex items-center justify-center gap-2
                 ${isLocked
                   ? 'bg-gray-800/70 text-white/70 border border-white/10 backdrop-blur-xs cursor-not-allowed'
                   : isCompleted
                     ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white border border-white/10 hover:from-gray-700 hover:to-gray-600'
                     : isInProgress
                       ? 'text-gray-900 bg-gradient-to-r from-amber-300/90 via-amber-400/90 to-rose-300/90 backdrop-blur-xs border border-amber-300/40 shadow-[0_10px_25px_rgba(251,191,36,0.25),0_6px_12px_rgba(0,0,0,0.35)] hover:shadow-[0_14px_32px_rgba(251,191,36,0.35),0_8px_18px_rgba(0,0,0,0.4)]'
                       : 'text-gray-900 bg-gradient-to-r from-amber-400/90 via-yellow-400/90 to-emerald-500/90 backdrop-blur-xs border border-amber-200/30 shadow-glow-md hover:shadow-glow-lg'
                 }
               `}
               whileHover={{
                 scale: isLocked ? 1 : 1.02,
                 y: isLocked ? 0 : -1,
                 transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
               }}
               whileTap={{
                 scale: isLocked ? 1 : 0.98,
                 transition: { duration: 0.1 }
               }}
               onClick={(e) => onCardActivate(quest, e)}
               aria-label={isLocked ? `Quête premium: ${quest.title}` : `Ouvrir la quête ${quest.title}`}
               layoutId={`cta-${quest.id}`}
             >
               {/* Anneau lumineux or (non affiché si verrouillé) */}
               {!isLocked && (
                 <span className="pointer-events-none absolute -inset-[1px] rounded-[18px] opacity-30 group-hover:opacity-50 blur-[2px] transition-opacity bg-gradient-to-r from-amber-400/60 via-yellow-400/60 to-emerald-400/60" />
               )}
               {/* Reflet léger */}
               {!isLocked && (
                 <span
                   className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                   style={{
                     background:
                       'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)'
                   }}
                 />
               )}
               <span className="relative z-10 flex items-center gap-2 font-sans tracking-tight">
                 {isCompleted ? (
                   <>
                     <FaRedoAlt className="text-[14px]" />
                     <span>Rejouer</span>
                   </>
                 ) : isInProgress ? (
                   <>
                     <FaArrowRight className="text-[14px]" />
                     <span>Continuer</span>
                   </>
                 ) : isLocked ? (
                   <>
                     <FaLock className="text-[14px]" />
                     <span>Premium</span>
                   </>
                 ) : (
                   <>
                     <FaPlay className="text-[14px]" />
                     <span>Commencer</span>
                   </>
                 )}
               </span>
               {/* Liseré haut subtil */}
               <span className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
               {/* Ombre 3D douce en bas pour ancrer dans le thème */}
               {isInProgress && (
                 <span className="pointer-events-none absolute left-2 right-2 bottom-1 h-[10px] rounded-full opacity-40 blur-md bg-gradient-to-r from-amber-400/40 via-yellow-400/40 to-rose-400/40" />
               )}
             </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
  };

  return (
    <AppBackground variant="nebula" grain grid={false} animate>
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
                    Quêtes
                  </span>
                  <span className="text-white ml-2">
                    Financières
                  </span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base mt-0.5">
                  {filteredQuests.length} quêtes disponibles
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
                    <span className="text-purple-300 font-bold text-sm">Niv. {userStats.level || 1}</span>
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
                        placeholder="Rechercher une quête..."
                        value={rawSearch}
                        onChange={(e) => setRawSearch(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder-gray-500 px-3 py-2.5 focus:outline-none text-sm"
                        aria-label="Rechercher une quête"
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
                  <span className="text-white text-sm font-semibold">Trier</span>
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
                        Difficulté
                      </label>
                      <Select
                        value={filters.difficulty}
                        onChange={(val) => handleFilterChange('difficulty', val)}
                        options={[
                          { value: 'all', label: 'Toutes' },
                          { value: 'beginner', label: 'Facile', icon: <FaCircle className="text-emerald-400 text-[9px]" /> },
                          { value: 'intermediate', label: 'Moyen', icon: <FaCircle className="text-amber-400 text-[9px]" /> },
                          { value: 'advanced', label: 'Difficile', icon: <FaCircle className="text-red-400 text-[9px]" /> },
                        ]}
                      />
                    </div>

                    {/* Tri */}
                    <div className="relative">
                      <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">
                        Trier par
                      </label>
                      <Select
                        value={filters.sortBy}
                        onChange={(val) => handleFilterChange('sortBy', val)}
                        options={[
                          { value: 'hot', label: 'Tendance', icon: <FaFire className="text-orange-400 text-[12px]" /> },
                          { value: 'new', label: 'Récent', icon: <BsStars className="text-cyan-300 text-[12px]" /> },
                          { value: 'xp', label: 'XP Max', icon: <GiTwoCoins className="text-yellow-400 text-[12px]" /> },
                          { value: 'quick', label: 'Rapide', icon: <FaBolt className="text-purple-300 text-[12px]" /> },
                        ]}
                      />
                    </div>

                    {/* Catégorie */}
                    <div className="relative">
                      <label className="text-[11px] font-medium text-gray-400 mb-1.5 block">
                        Catégorie
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
                          <span>Réinitialiser</span>
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
                   AUCUNE QUÊTE
                 </h3>
                 <p 
                   className="text-gray-300 text-base sm:text-lg mb-6 max-w-md mx-auto leading-relaxed"
                   style={{ 
                     fontFamily: '"Inter", sans-serif',
                     fontWeight: 400,
                     letterSpacing: '0.005em'
                   }}
                 >
                  Essayez d'ajuster vos filtres ou explorez toutes nos quêtes disponibles
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
                   Voir toutes les quêtes
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