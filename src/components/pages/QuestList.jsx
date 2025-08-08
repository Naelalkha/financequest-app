import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from 'framer-motion';
import '../../styles/questList.css';
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
  FaCrown
} from 'react-icons/fa';
import { GiDiamondTrophy, GiTwoCoins } from 'react-icons/gi';
import { BsStars } from 'react-icons/bs';
import { RiFireFill } from 'react-icons/ri';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { useLocalQuests } from '../../hooks/useLocalQuests';
import { usePaywall } from '../../hooks/usePaywall';
import PaywallModal from '../PaywallModal';
import posthog from 'posthog-js';

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
  const particlesRef = useRef(null);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

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

  // Tags rapides pour filtrage rapide (non redondants) - Version gamifiée
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
    },
    { 
      id: 'bookmarked', 
      label: 'Favoris',
      icon: FaBookmark,
      color: 'text-amber-300',
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
      filter: (q) => bookmarkedQuests.includes(q.id)
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

  // Particules stables (positions calculées une seule fois)
  if (!particlesRef.current) {
    const isNarrow = typeof window !== 'undefined' ? window.matchMedia('(max-width: 1024px)').matches : false;
    const particleCount = isNarrow ? 6 : 12;
    particlesRef.current = Array.from({ length: particleCount }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: (isNarrow ? 4 : 3) + Math.random() * 2,
      delay: Math.random() * 2,
    }));
  }

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

             {/* CTA avec micro-animations */}
             <motion.button
                 className={`
                   w-full sm:w-auto sm:min-w-[150px] py-2.5 sm:py-3 px-4 sm:px-5 rounded-[14px] font-semibold text-[15px]
                   transition-all flex items-center justify-center gap-2 relative overflow-hidden
                   ${isCompleted
                    ? 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 hover:border-white/15'
                    : isInProgress
                    ? `bg-white/5 hover:bg-white/10 text-white border ${category.borderColor || 'border-white/10'} shadow-md hover:shadow-lg group`
                    : isLocked
                    ? 'bg-white/5 text-white/70 border border-white/10'
                    : `bg-white/5 hover:bg-white/10 text-white border ${category.borderColor || 'border-white/10'} shadow-md hover:shadow-lg group`
                  }
                `}
                whileHover={{ 
                  scale: isLocked ? 1 : 1.02,
                  y: isLocked ? 0 : -1,
                  boxShadow: isLocked ? undefined : '0 8px 24px rgba(255,255,255,0.08)',
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
                <span className="relative z-10 flex items-center gap-2">
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
                
                 {/* Barre de progression et pourcentage retirés pour un CTA plus simple */}
               </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Animated gradient orbs et particules gamifiées */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none gpu-hint">
        <motion.div 
          className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-600/20 rounded-full lg:blur-[120px] blur-[60px]"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-3/4 -right-48 w-96 h-96 bg-emerald-600/20 rounded-full lg:blur-[120px] blur-[60px]"
          animate={{ 
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-600/10 rounded-full lg:blur-[150px] blur-[80px]"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Particules flottantes gamifiées */}
        {particlesRef.current.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full opacity-20"
            style={{ left: p.left, top: p.top }}
            animate={reduceMotion ? {} : {
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Lignes de connexion subtiles */}
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
                         backgroundImage: `radial-gradient(circle at 20% 50%, gold 1px, transparent 1px),
                              radial-gradient(circle at 80% 50%, emerald 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        

        {/* Header avec effet parallax */}
        <div 
          className="px-2 sm:px-4 pt-6 sm:pt-8 pb-4 sm:pb-6"
        >
          <div className="w-full max-w-full sm:max-w-[1400px] mx-auto">
            {/* Titre ultra lisible style Duolingo/Habitica */}
            <div className="text-center mb-8 sm:mb-12">
              <motion.h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight tracking-tight"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ 
                  fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                  fontWeight: 900,
                  letterSpacing: '-0.02em'
                }}
              >
                <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-emerald-300 bg-clip-text text-transparent block drop-shadow">
                  Quêtes financières
                </span>
              </motion.h1>
            </div>


          </div>
        </div>

        {/* Filtres optimisés et mobile-friendly */}
        <div className="mb-4 px-2 sm:px-4">
          <div className="w-full max-w-full sm:max-w-[1400px] mx-auto">
                {/* Filtres principaux en accordéon mobile */}
                   <div className="space-y-3">
              {/* Barre de filtres principale */}
              <div className="flex flex-col lg:flex-row gap-3">
                  {/* Recherche - toujours visible */}
                <div className="flex-1 relative group mb-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative neon-element rounded-xl p-3 flex items-center w-full max-w-[640px] border border-white/5">
                      <FaSearch className="text-gray-400 mr-3 text-sm" />
                   <input
                      type="text"
                        placeholder="Budget, retraite, impôts…"
                      value={rawSearch}
                      onChange={(e) => setRawSearch(e.target.value)}
                        className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                      aria-label="Rechercher une quête"
                    />
                   {rawSearch && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                       onClick={() => setRawSearch('')}
                        className="text-gray-400 hover:text-white ml-2 p-1"
                      >
                          <FaTimes className="text-xs" />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Bouton filtres avancés sur mobile */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAdvancedFilters(prev => !prev)}
                    className="lg:hidden neon-element px-4 py-3 rounded-xl text-white font-semibold bg-transparent hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                       aria-expanded={showAdvancedFilters}
                       aria-controls="advanced-filters"
                >
                    <FaLayerGroup className="text-amber-400 text-sm" />
                                         <span 
                       className="text-sm font-extrabold"
                       style={{ 
                         fontFamily: '"Inter", sans-serif',
                         fontWeight: 800
                       }}
                     >
                       Filtres
                     </span>
                  <motion.div
                    animate={{ rotate: showAdvancedFilters ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                      <FaArrowRight className="text-xs" />
                  </motion.div>
                </motion.button>
              </div>

                {/* Filtres avancés - visible sur desktop, accordéon sur mobile */}
                <motion.div
                  initial={false}
                  animate={{ 
                    height: showAdvancedFilters || isDesktop ? 'auto' : 0,
                    opacity: showAdvancedFilters || isDesktop ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                  aria-expanded={showAdvancedFilters || isDesktop}
                  id="advanced-filters"
                >
                  <div className="space-y-3 px-[10px]">
                    {/* Filtres en grille responsive avec boutons modernes */}
                    <div className="space-y-4">
                      {/* Catégories */}
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FaLayerGroup className="text-purple-400" />
                          Catégories
                        </h3>
                   <div className="flex flex-wrap gap-2">
                          {Object.entries(categoryConfig).map(([key, config]) => {
                            const isSelected = filters.category === key;
                            const IconComponent = config.icon;
                            return (
                               <motion.button
                                key={key}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleFilterChange('category', key)}
                                  className={`
                                   relative px-3 py-2 rounded-xl font-extrabold text-xs
                                    transition-all flex items-center gap-2 overflow-hidden focus-visible-ring
                                   ${isSelected
                                     ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                                     : 'bg-white/5 text-gray-400 hover:text-gray-300 hover:bg-white/10 border border-white/10'
                                   }
                              `}
                                 style={{ 
                                   fontFamily: '"Inter", sans-serif',
                                   fontWeight: 800
                                 }}
                                  aria-pressed={isSelected}
                                  aria-label={`Catégorie: ${config.label}`}
                                  tabIndex={0}
                                  role="button"
                              >
                                {IconComponent && <IconComponent className="text-sm" />}
                                <span>{config.label}</span>
                                {isSelected && (
                                  <div
                                    className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-10`}
                                  />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Difficulté */}
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FaChartLine className="text-emerald-400" />
                          Difficulté
                        </h3>
                         <div className="flex flex-wrap gap-2">
                          {[
                            { key: 'all', label: 'Tous', config: { color: 'text-gray-300', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' }},
                            { key: 'beginner', label: 'Facile', config: difficultyConfig.beginner },
                            { key: 'intermediate', label: 'Moyen', config: difficultyConfig.intermediate },
                            { key: 'advanced', label: 'Difficile', config: difficultyConfig.advanced }
                          ].map(({ key, label, config }) => {
                            const isSelected = filters.difficulty === key;
                            return (
                              <motion.button
                                key={key}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleFilterChange('difficulty', key)}
                                className={`
                                  relative px-3 py-2 rounded-xl font-semibold text-xs
                                  transition-all overflow-hidden
                                  ${isSelected
                                    ? `${config.bgStyle || config.bgColor} ${config.textColor || config.color} border ${config.borderColor}`
                                    : 'bg-white/5 text-gray-400 hover:text-gray-300 hover:bg-white/10 border border-white/10'
                                  }
                                  `}
                                  aria-pressed={isSelected}
                                  aria-label={`Difficulté: ${label}`}
                              >
                                <span>{label}</span>
                                {isSelected && (
                                  <div
                                    className={`absolute inset-0 bg-gradient-to-r ${config.gradient || 'from-gray-400 to-gray-500'} opacity-10`}
                                  />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tri */}
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FaArrowRight className="text-amber-400" />
                          Ordre d'affichage
                        </h3>
                         <div className="flex flex-wrap gap-2">
                          {[
                            { key: 'hot', label: 'Tendance', icon: FaFire, color: 'text-orange-300', bg: 'bg-orange-500/20', border: 'border-orange-500/30', desc: 'Recommandé' },
                            { key: 'new', label: 'Récent', icon: BsStars, color: 'text-cyan-300', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', desc: 'Nouveautés' },
                            { key: 'xp', label: 'XP', icon: GiTwoCoins, color: 'text-yellow-300', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', desc: 'Gains XP' },
                            { key: 'quick', label: 'Rapide', icon: FaBolt, color: 'text-purple-300', bg: 'bg-purple-500/20', border: 'border-purple-500/30', desc: 'Durée' }
                          ].map(({ key, label, icon: IconComponent, color, bg, border, desc }) => {
                            const isSelected = filters.sortBy === key;
                            return (
                              <motion.button
                                key={key}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleFilterChange('sortBy', key)}
                                className={`
                                  relative px-3 py-2 rounded-xl font-semibold text-xs
                                  transition-all flex items-center gap-2 overflow-hidden group
                                  ${isSelected
                                    ? `${bg} ${color} border ${border}`
                                    : 'bg-white/5 text-gray-400 hover:text-gray-300 hover:bg-white/10 border border-white/10'
                                  }
                                  `}
                                title={desc}
                                  aria-pressed={isSelected}
                                  aria-label={`Trier par: ${label}`}
                              >
                                <IconComponent className="text-sm" />
                                <span>{label}</span>
                                {isSelected && (
                                  <div
                                    className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"
                                  />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Tags rapides et actions */}
                    <div className="space-y-3">
                      {/* Tags rapides gamifiés avec animations */}
                      <div>
                                                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                           <FaBookmark className="text-amber-400" />
                           Filtres rapides
                         </h3>
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
                          {quickTags.map((tag, index) => {
                            const isSelected = selectedTags.includes(tag.id);
                            const IconComponent = tag.icon;
                             return (
                              <motion.button
                                key={tag.id}
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                                whileHover={{ 
                                  scale: 1.1, 
                                  y: -3,
                                   // Éviter d'animer le box-shadow pour la perf
                                }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleTagToggle(tag.id)}
                                className={`
                                  px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap
                                  transition-all relative overflow-hidden flex-shrink-0 flex items-center gap-2
                                  ${isSelected
                                    ? `${tag.bg} ${tag.color} border ${tag.border} shadow-lg`
                                    : 'bg-white/5 text-gray-400 hover:text-gray-300 hover:bg-white/10 border border-white/10'
                                  }
                                `}
                                  aria-pressed={isSelected}
                                  aria-label={`Filtre rapide: ${tag.label}`}
                              >
                                <IconComponent className="text-sm" />
                                <span className="relative z-10">{tag.label}</span>
                                {isSelected && (
                                  <div
                                    className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                                  />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bouton réinitialiser */}
                      {(filters.category !== 'all' || filters.difficulty !== 'all' || selectedTags.length > 0 || debouncedSearch) && (
                        <div className="flex justify-center">
                          <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ 
                              scale: 1.05, 
                              boxShadow: "0 5px 15px rgba(239, 68, 68, 0.3)",
                              transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                            onClick={clearAllFilters}
                            className="w-full sm:w-auto sm:min-w-[200px] px-5 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-2 relative overflow-hidden"
                          >
                            <FaTimes className="text-[10px]" />
                            Réinitialiser
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
            </div>
          </div>
        </div>

        {/* Divider subtil sous la zone de filtres */}
        <div className="px-2 sm:px-4">
          <div className="w-full max-w-full sm:max-w-[1400px] mx-auto">
            <div className="h-px bg-white/5 mb-3" />
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
                   className="px-8 py-4 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-white rounded-xl font-extrabold text-base uppercase tracking-wider border border-amber-500/30 transition-all"
                   style={{ 
                     fontFamily: '"Inter", sans-serif',
                     fontWeight: 800,
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
  );
};

export default QuestList;