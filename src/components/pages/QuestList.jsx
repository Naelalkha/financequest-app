import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { 
  FaLock, 
  FaStar, 
  FaClock, 
  FaSearch, 
  FaTrophy, 
  FaFilter, 
  FaTimes, 
  FaCrown, 
  FaFire, 
  FaChartLine,
  FaBolt, 
  FaGem, 
  FaRocket, 
  FaChevronRight,
  FaBookmark, 
  FaBookOpen, 
  FaPlay,
  FaLightbulb,
  FaShare,
  FaCheckCircle,
  FaArrowRight,
  FaCoins,
  FaMedal,
  FaChartBar,
  FaGraduationCap,
  FaPiggyBank,
  FaWallet,
  FaChartPie,
  FaUniversity,
  FaInfoCircle,
  FaUsers,
  FaAward,
  FaBrain,
  FaList,
  FaTh,
  FaShareAlt,
  FaCheck,
  FaBullseye,
  FaLayerGroup
} from 'react-icons/fa';
import { HiSparkles, HiTrendingUp } from 'react-icons/hi';
import { GiTwoCoins } from 'react-icons/gi';
import { RiVipCrownFill, RiFireFill } from 'react-icons/ri';
import { BsLightningChargeFill } from 'react-icons/bs';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ProgressBar from '../../components/common/ProgressBar';
import { toast } from 'react-toastify';
import { useLocalQuests } from '../../hooks/useLocalQuests';
import { usePaywall } from '../../hooks/usePaywall';
import PaywallModal from '../PaywallModal';
import posthog from 'posthog-js';

// Skeleton optimisé
const QuestSkeleton = ({ viewMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-morphism-card rounded-2xl p-5"
    >
      <div className="animate-pulse">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl animate-shimmer" />
          <div className="flex-1">
            <div className="h-5 bg-white/10 rounded-lg w-3/4 mb-2" />
            <div className="h-3 bg-white/5 rounded-md w-1/2" />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-7 w-16 bg-white/5 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-amber-500/20 rounded-xl flex-1" />
          <div className="w-10 h-10 bg-white/5 rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
};

// Particules animées pour l'arrière-plan
const AnimatedParticles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0
          }}
          animate={{
            y: [null, -50, -100],
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
};

// Configuration des catégories optimisée
const categoryConfig = {
  all: { 
    gradient: 'from-violet-400 to-fuchsia-400',
    bgGradient: 'from-violet-500/10 to-fuchsia-500/10',
    label: 'Toutes', 
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    icon: FaLayerGroup,
    shadowColor: 'shadow-violet-500/20'
  },
  budgeting: { 
    gradient: 'from-emerald-400 to-cyan-400',
    bgGradient: 'from-emerald-500/10 to-cyan-500/10',
    label: 'Budget', 
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    icon: FaWallet,
    shadowColor: 'shadow-emerald-500/20'
  },
  saving: { 
    gradient: 'from-green-400 to-teal-400',
    bgGradient: 'from-green-500/10 to-teal-500/10',
    label: 'Épargne', 
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    icon: FaPiggyBank,
    shadowColor: 'shadow-green-500/20'
  },
  investing: { 
    gradient: 'from-blue-400 to-purple-400',
    bgGradient: 'from-blue-500/10 to-purple-500/10',
    label: 'Invest', 
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    icon: FaChartLine,
    shadowColor: 'shadow-blue-500/20'
  },
  debt: { 
    gradient: 'from-red-400 to-pink-400',
    bgGradient: 'from-red-500/10 to-pink-500/10',
    label: 'Dette', 
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    icon: FaFire,
    shadowColor: 'shadow-red-500/20'
  },
  planning: { 
    gradient: 'from-amber-400 to-orange-400',
    bgGradient: 'from-amber-500/10 to-orange-500/10',
    label: 'Planning', 
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: FaBullseye,
    shadowColor: 'shadow-amber-500/20'
  }
};

const QuestList = () => {
  const { user } = useAuth();
  const { t, currentLang } = useLanguage();
  const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedQuests, setBookmarkedQuests] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [hoveredQuest, setHoveredQuest] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [completedQuestsCount, setCompletedQuestsCount] = useState(0);
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    streak: 0,
    totalQuests: 0
  });
  const searchInputRef = useRef(null);

  // Animations avancées
  const { scrollY } = useScroll();
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98]);
  const headerOpacity = useTransform(scrollY, [0, 150], [1, 0.95]);
  const backgroundY = useTransform(scrollY, [0, 500], [0, -50]);

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
    status: 'all',
    duration: 'all',
    search: '',
    sortBy: 'recommended'
  });

  // Tags rapides gamifiés
  const quickTags = [
    { 
      id: 'trending', 
      label: 'Tendance', 
      icon: FaFire,
      gradient: 'from-rose-400 to-red-500',
      filter: (q) => q.trendingScore > 80 
    },
    { 
      id: 'quick', 
      label: 'Rapide', 
      icon: FaBolt,
      gradient: 'from-yellow-400 to-amber-500',
      filter: (q) => q.duration <= 5 
    },
    { 
      id: 'newbie', 
      label: 'Débutant', 
      icon: FaGraduationCap,
      gradient: 'from-green-400 to-emerald-500',
      filter: (q) => q.difficulty === 'beginner' 
    },
    { 
      id: 'maxXP', 
      label: 'Max XP', 
      icon: FaGem,
      gradient: 'from-purple-400 to-indigo-500',
      filter: (q) => q.xp >= 150 
    },
    { 
      id: 'premium', 
      label: 'Premium', 
      icon: FaCrown,
      gradient: 'from-amber-400 to-yellow-500',
      filter: (q) => q.isPremium 
    }
  ];

  useEffect(() => {
    if (user) {
      loadUserData();
    }
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
        
        const savedViewMode = userData.preferredViewMode;
        if (savedViewMode) setViewMode(savedViewMode);
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
          score: data.score || 0,
          timeSpent: data.timeSpent || 0
        };
        if (data.status === 'completed') {
          completedCount++;
        }
      });
      setUserProgress(progress);
      setCompletedQuestsCount(completedCount);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const calculateRecommendationScore = (quest) => {
    let score = 0;
    if (quest.isNew) score += 30;
    score += (quest.trendingScore || 0) * 0.8;
    score += (quest.successRate || 0) / 5;
    if (userProgress[quest.id]?.status === 'completed') score -= 40;
    if (userProgress[quest.id] && userProgress[quest.id].status !== 'completed') score += 40;
    if (bookmarkedQuests.includes(quest.id)) score += 35;
    return score;
  };

  // Quêtes filtrées avec métadonnées enrichies
  const filteredQuests = useMemo(() => {
    if (!quests || quests.length === 0) return [];

    const enrichedQuests = quests.map((quest, index) => ({
      ...quest,
      isNew: index >= quests.length - 5,
      completionCount: Math.floor(Math.random() * 1000) + 50,
      avgCompletionTime: quest.duration + Math.floor(Math.random() * 3) - 1,
      successRate: 75 + Math.floor(Math.random() * 20),
      userRating: 4.2 + Math.random() * 0.7,
      trendingScore: Math.random() * 100,
      difficulty_level: quest.difficulty === 'beginner' ? 1 : quest.difficulty === 'intermediate' ? 2 : 3
    }));

    let filtered = [...enrichedQuests];

    // Application des filtres
    if (filters.category !== 'all') {
      filtered = filtered.filter(quest => quest.category === filters.category);
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(quest => quest.difficulty === filters.difficulty);
    }

    if (filters.duration !== 'all') {
      const durationRanges = {
        quick: [0, 5],
        medium: [6, 15],
        long: [16, 999]
      };
      const [min, max] = durationRanges[filters.duration] || [0, 999];
      filtered = filtered.filter(quest => quest.duration >= min && quest.duration <= max);
    }

    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'free':
          filtered = filtered.filter(quest => !quest.isPremium);
          break;
        case 'premium':
          filtered = filtered.filter(quest => quest.isPremium);
          break;
        case 'completed':
          filtered = filtered.filter(quest => userProgress[quest.id]?.status === 'completed');
          break;
        case 'in_progress':
          filtered = filtered.filter(quest => userProgress[quest.id]?.status === 'active');
          break;
        case 'not_started':
          filtered = filtered.filter(quest => !userProgress[quest.id]);
          break;
      }
    }

    selectedTags.forEach(tagId => {
      const tag = quickTags.find(t => t.id === tagId);
      if (tag && tag.filter) {
        filtered = filtered.filter(tag.filter);
      }
    });

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(quest => 
        quest.title.toLowerCase().includes(searchLower) ||
        quest.description.toLowerCase().includes(searchLower) ||
        quest.category.toLowerCase().includes(searchLower)
      );
    }

    // Tri intelligent
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => b.completionCount - a.completionCount);
        break;
      case 'xp-high':
        filtered.sort((a, b) => b.xp - a.xp);
        break;
      case 'duration-short':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'recommended':
      default:
        filtered.sort((a, b) => calculateRecommendationScore(b) - calculateRecommendationScore(a));
        break;
    }

    return filtered;
  }, [quests, filters, selectedTags, userProgress, bookmarkedQuests]);

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
      toast.info('Connectez-vous pour sauvegarder', { icon: '🔒' });
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
        toast.success('Quête sauvegardée ! 🔖', {
          position: "bottom-center",
          autoClose: 2000
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const shareQuest = async (quest) => {
    const shareData = {
      title: `🎯 ${quest.title}`,
      text: `Découvrez cette quête finance : ${quest.title} - ${quest.xp} XP à gagner !`,
      url: `${window.location.origin}/quests/${quest.id}`
    };

    try {
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share(shareData);
        toast.success('Quête partagée ! 🚀');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Lien copié ! 📋');
      }
      
      posthog.capture('quest_shared', {
        quest_id: quest.id,
        quest_category: quest.category
      });
    } catch (error) {
      console.log('Error sharing:', error);
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

  const toggleViewMode = async () => {
    const newMode = viewMode === 'list' ? 'grid' : 'list';
    setViewMode(newMode);
    
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          preferredViewMode: newMode
        });
      } catch (error) {
        console.error('Error saving view preference:', error);
      }
    }
  };

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      difficulty: 'all',
      status: 'all',
      duration: 'all',
      search: '',
      sortBy: 'recommended'
    });
    setSelectedTags([]);
  };

  // Configuration de difficulté
  const difficultyConfig = {
    beginner: { 
      label: 'Facile', 
      color: 'text-emerald-400', 
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/30',
      icon: '🌱'
    },
    intermediate: { 
      label: 'Moyen', 
      color: 'text-amber-400', 
      bgColor: 'bg-amber-500/15',
      borderColor: 'border-amber-500/30',
      icon: '⚡'
    },
    advanced: { 
      label: 'Expert', 
      color: 'text-red-400', 
      bgColor: 'bg-red-500/15',
      borderColor: 'border-red-500/30',
      icon: '🔥'
    }
  };

  const activeFiltersCount = 
    (filters.category !== 'all' ? 1 : 0) +
    (filters.difficulty !== 'all' ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.duration !== 'all' ? 1 : 0) +
    selectedTags.length;

  // Rendu optimisé des cartes avec gamification maximale
  const renderQuestCard = (quest, index) => {
    const progress = userProgress[quest.id];
    const isCompleted = progress?.status === 'completed';
    const isInProgress = progress?.status === 'active';
    const isLocked = quest.isPremium && !isPremium;
    const isBookmarked = bookmarkedQuests.includes(quest.id);
    const category = categoryConfig[quest.category] || categoryConfig.planning;
    const difficulty = difficultyConfig[quest.difficulty] || difficultyConfig.beginner;

    return (
      <motion.div
        key={quest.id}
        layout
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.9 }}
        transition={{ 
          duration: 0.5,
          delay: Math.min(index * 0.03, 0.15),
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        whileHover={{ 
          y: -8,
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setHoveredQuest(quest.id)}
        onMouseLeave={() => setHoveredQuest(null)}
        className={`group relative glass-morphism-card rounded-2xl overflow-hidden cursor-pointer ${
          viewMode === 'grid' ? 'h-full' : ''
        }`}
        style={{
          background: `linear-gradient(135deg, 
            rgba(255, 255, 255, 0.07) 0%, 
            rgba(255, 255, 255, 0.02) 50%, 
            rgba(255, 255, 255, 0.05) 100%)`,
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Gradient background animé */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient}`}
          animate={{ 
            opacity: hoveredQuest === quest.id ? 0.3 : 0.15 
          }}
        />

        {/* Effet de lueur au hover */}
        <AnimatePresence>
          {hoveredQuest === quest.id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-5 blur-2xl`}
            />
          )}
        </AnimatePresence>

        <div className={`relative z-10 ${viewMode === 'grid' ? 'p-4' : 'p-5'}`}>
          {/* Header optimisé */}
          <div className="flex items-start gap-3 mb-4">
            {/* Icône de catégorie stylisée */}
            <motion.div 
              className={`
                p-2.5 rounded-xl ${category.bgColor} ${category.borderColor} 
                border backdrop-blur-sm flex-shrink-0
                ${category.shadowColor} shadow-lg
              `}
              whileHover={{ 
                scale: 1.1,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.3 }
              }}
            >
              <category.icon className={`text-lg ${category.color}`} />
            </motion.div>
            
            <div className="flex-1 min-w-0">
              {/* Badges en ligne compacts */}
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <span className={`text-[10px] font-black ${category.color} uppercase tracking-wider`}>
                  {category.label}
                </span>
                <span className={`
                  px-2 py-0.5 text-[10px] rounded-md ${difficulty.bgColor} 
                  ${difficulty.borderColor} border ${difficulty.color} font-bold
                `}>
                  {difficulty.icon} {difficulty.label}
                </span>
                {quest.isPremium && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-2 py-0.5 text-[10px] bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-md font-bold flex items-center gap-1"
                  >
                    <FaCrown className="text-[8px]" />
                    PRO
                  </motion.span>
                )}
                {quest.isNew && !isCompleted && (
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 rounded-md font-black"
                  >
                    NEW
                  </motion.span>
                )}
                {quest.trendingScore > 80 && (
                  <motion.span
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-red-400"
                  >
                    <FaFire className="text-xs" />
                  </motion.span>
                )}
              </div>
              
              {/* Titre optimisé */}
              <h3 className="text-white font-bold text-base leading-tight mb-2 line-clamp-2">
                {quest.title}
              </h3>
              
              {/* Description (visible en mode liste) */}
              {viewMode === 'list' && (
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                  {quest.description}
                </p>
              )}
            </div>

            {/* Actions rapides */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              {/* Bookmark */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => toggleBookmark(quest.id, e)}
                className={`
                  p-2 rounded-lg transition-all
                  ${isBookmarked
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'hover:bg-white/10 text-gray-500 hover:text-white'
                  }
                `}
              >
                <FaBookmark className="text-xs" />
              </motion.button>

              {/* Status indicator */}
              {isCompleted && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-2 bg-green-500/20 text-green-400 rounded-lg"
                >
                  <FaCheck className="text-xs" />
                </motion.div>
              )}
              {isInProgress && (
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg"
                >
                  <BsLightningChargeFill className="text-xs" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Stats gamifiées */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <motion.div 
              className="flex items-center gap-1.5 px-2.5 py-1 glass-morphism-element rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <FaClock className="text-cyan-400 text-[10px]" />
              <span className="text-white font-semibold text-xs">{quest.duration}min</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-1.5 px-2.5 py-1 glass-morphism-element rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <GiTwoCoins className="text-yellow-400 text-xs" />
              <span className="text-yellow-400 font-bold text-xs">{quest.xp}XP</span>
            </motion.div>
            
            {quest.completionCount > 100 && (
              <motion.div 
                className="flex items-center gap-1.5 px-2.5 py-1 glass-morphism-element rounded-lg"
                whileHover={{ scale: 1.05 }}
              >
                <FaUsers className="text-purple-400 text-[10px]" />
                <span className="text-white font-semibold text-xs">{quest.completionCount}</span>
              </motion.div>
            )}

            {quest.successRate && viewMode === 'list' && (
              <motion.div 
                className="flex items-center gap-1.5 px-2.5 py-1 glass-morphism-element rounded-lg"
                whileHover={{ scale: 1.05 }}
              >
                <FaChartBar className="text-emerald-400 text-[10px]" />
                <span className="text-white font-semibold text-xs">{quest.successRate}%</span>
              </motion.div>
            )}
          </div>

          {/* Progress bar animée */}
          {isInProgress && (
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Progression</span>
                <span className="text-xs text-cyan-400 font-bold">{Math.round(progress.progress || 0)}%</span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['0%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Boutons d'action gamifiés */}
          <div className="flex gap-2">
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={isLocked ? '#' : `/quests/${quest.id}`}
                onClick={(e) => handleQuestClick(quest, e)}
                className={`
                  w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm 
                  transition-all duration-200 relative overflow-hidden
                  ${isCompleted
                    ? 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/70'
                    : isInProgress
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                    : isLocked
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                  }
                `}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {isCompleted ? (
                    <>
                      <FaCheckCircle className="text-xs" />
                      <span>Revoir</span>
                    </>
                  ) : isInProgress ? (
                    <>
                      <BsLightningChargeFill className="text-xs" />
                      <span>Continuer</span>
                    </>
                  ) : isLocked ? (
                    <>
                      <FaLock className="text-xs" />
                      <span>Premium</span>
                    </>
                  ) : (
                    <>
                      <FaPlay className="text-xs" />
                      <span>{viewMode === 'grid' ? 'GO' : 'Commencer'}</span>
                    </>
                  )}
                </span>
                
                {/* Effet de brillance */}
                {!isLocked && !isCompleted && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                    transition={{ duration: 0.6 }}
                  />
                )}
              </Link>
            </motion.div>

            {/* Share button (visible on hover) */}
            <AnimatePresence>
              {hoveredQuest === quest.id && viewMode === 'list' && (
                <motion.button
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => shareQuest(quest)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <FaShareAlt className="text-sm" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Preview on hover (optimisé) */}
          <AnimatePresence>
            {hoveredQuest === quest.id && quest.objectives && viewMode === 'list' && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 top-full mt-2 glass-morphism-card rounded-xl p-3 z-30 shadow-2xl"
              >
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                  <FaLightbulb className="text-yellow-400" />
                  Objectifs d'apprentissage
                </h4>
                <ul className="space-y-1">
                  {quest.objectives.slice(0, 3).map((obj, idx) => (
                    <motion.li 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="text-[11px] text-gray-300 flex items-start gap-2"
                    >
                      <span className="text-green-400 mt-0.5">•</span>
                      <span className="line-clamp-1">{obj}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0F23] to-[#1A0B2E] relative overflow-hidden pb-20">
      {/* Particules animées */}
      <AnimatedParticles />
      
      {/* Background parallax */}
      <motion.div 
        className="fixed inset-0 opacity-50"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-pink-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      </motion.div>

      {/* Contenu principal */}
      <div className="relative z-10">
        {/* Header gamifié */}
        <motion.div 
          className="px-4 pt-8 pb-6"
          style={{ opacity: headerOpacity, scale: headerScale }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              {/* Titre et stats */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <motion.h1 
                    className="text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text mb-3"
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  >
                    Bibliothèque de Quêtes
                  </motion.h1>
                  
                  {/* Stats gamifiées */}
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="glass-morphism-element px-3 py-1.5 rounded-full flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FaTrophy className="text-amber-400 text-sm" />
                      <span className="text-white font-bold text-sm">{completedQuestsCount}</span>
                      <span className="text-gray-500 text-xs">/ {quests?.length || 0}</span>
                    </motion.div>
                    
                    <motion.div 
                      className="glass-morphism-element px-3 py-1.5 rounded-full flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <GiTwoCoins className="text-yellow-400 text-sm animate-pulse" />
                      <span className="text-white font-bold text-sm">{userStats.xp}</span>
                      <span className="text-gray-500 text-xs">XP</span>
                    </motion.div>
                    
                    <motion.div 
                      className="glass-morphism-element px-3 py-1.5 rounded-full flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FaFire className={`text-orange-400 text-sm ${userStats.streak > 0 ? 'animate-pulse' : ''}`} />
                      <span className="text-white font-bold text-sm">{userStats.streak}</span>
                      <span className="text-gray-500 text-xs">jours</span>
                    </motion.div>
                  </div>
                </div>
                
                {/* Toggle vue */}
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleViewMode}
                  className="glass-morphism-element p-3 rounded-xl group"
                >
                  <motion.div
                    animate={{ rotate: viewMode === 'list' ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {viewMode === 'list' ? (
                      <FaTh className="text-lg text-white group-hover:text-purple-400 transition-colors" />
                    ) : (
                      <FaList className="text-lg text-white group-hover:text-purple-400 transition-colors" />
                    )}
                  </motion.div>
                </motion.button>
              </div>

              {/* Barre de recherche gamifiée */}
              <motion.div 
                className="relative mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="glass-morphism-element rounded-xl p-0.5">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Rechercher une quête épique..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full px-5 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                    />
                    <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-400" />
                    {filters.search && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        onClick={() => handleFilterChange('search', '')}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <FaTimes />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Tags rapides gamifiés */}
              <motion.div 
                className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {quickTags.map((tag, index) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <motion.button
                      key={tag.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTagToggle(tag.id)}
                      className={`
                        px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all
                        flex items-center gap-1.5 relative overflow-hidden
                        ${isSelected
                          ? `bg-gradient-to-r ${tag.gradient} text-gray-900 shadow-lg`
                          : 'glass-morphism-element text-gray-300 hover:text-white'
                        }
                      `}
                    >
                      <tag.icon className="text-[10px]" />
                      <span>{tag.label}</span>
                      
                      {isSelected && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Contrôles de filtres */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="glass-morphism-element px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-2 text-white"
                >
                  <FaFilter className="text-[10px]" />
                  <span>Filtres</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 rounded-md text-[10px] font-black">
                      {activeFiltersCount}
                    </span>
                  )}
                </motion.button>

                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 glass-morphism-element rounded-lg text-white text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="recommended">🎯 Recommandé</option>
                  <option value="newest">🆕 Plus récent</option>
                  <option value="popular">🔥 Populaire</option>
                  <option value="xp-high">💎 Plus d'XP</option>
                  <option value="duration-short">⚡ Plus court</option>
                </select>

                {activeFiltersCount > 0 && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    onClick={clearAllFilters}
                    className="p-2 glass-morphism-element rounded-lg text-gray-400 hover:text-red-400"
                  >
                    <FaTimes className="text-xs" />
                  </motion.button>
                )}
              </div>

              {/* Panel de filtres avancés */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="glass-morphism-card rounded-xl p-4">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          {
                            label: 'Catégorie',
                            key: 'category',
                            options: Object.entries(categoryConfig).map(([key, config]) => ({
                              value: key,
                              label: config.label
                            }))
                          },
                          {
                            label: 'Difficulté',
                            key: 'difficulty',
                            options: [
                              { value: 'all', label: 'Toutes' },
                              { value: 'beginner', label: '🌱 Facile' },
                              { value: 'intermediate', label: '⚡ Moyen' },
                              { value: 'advanced', label: '🔥 Expert' }
                            ]
                          },
                          {
                            label: 'Durée',
                            key: 'duration',
                            options: [
                              { value: 'all', label: 'Toutes' },
                              { value: 'quick', label: '≤5 min' },
                              { value: 'medium', label: '6-15 min' },
                              { value: 'long', label: '16+ min' }
                            ]
                          },
                          {
                            label: 'Statut',
                            key: 'status',
                            options: [
                              { value: 'all', label: 'Tous' },
                              { value: 'not_started', label: 'Nouveau' },
                              { value: 'in_progress', label: 'En cours' },
                              { value: 'completed', label: 'Terminé' }
                            ]
                          }
                        ].map((filter) => (
                          <div key={filter.key}>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                              {filter.label}
                            </label>
                            <select
                              value={filters[filter.key]}
                              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                              className="w-full px-2.5 py-1.5 glass-morphism-element rounded-lg text-white text-xs focus:outline-none appearance-none cursor-pointer"
                            >
                              {filter.options.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pills de catégories gamifiées */}
              <motion.div 
                className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {Object.entries(categoryConfig).map(([key, config], index) => {
                  const isActive = filters.category === key;
                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFilterChange('category', key)}
                      className={`
                        px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all
                        flex items-center gap-1.5 relative overflow-hidden
                        ${isActive
                          ? `bg-gradient-to-r ${config.gradient} text-gray-900 shadow-xl`
                          : 'glass-morphism-element text-gray-300 hover:text-white'
                        }
                      `}
                    >
                      <config.icon className="text-[10px]" />
                      <span>{config.label}</span>
                      
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Liste des quêtes */}
        <div className="px-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {[...Array(6)].map((_, index) => (
                  <QuestSkeleton key={index} viewMode={viewMode} />
                ))}
              </div>
            ) : filteredQuests.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-28 h-28 glass-morphism-element rounded-3xl mb-6"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <FaSearch className="text-5xl text-gray-500" />
                </motion.div>
                <h3 className="text-2xl font-black text-white mb-3">
                  Aucune quête trouvée
                </h3>
                <p className="text-gray-400 mb-6">
                  Ajustez vos filtres pour découvrir des quêtes
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-xl"
                >
                  Réinitialiser les filtres
                </motion.button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`${filters.category}-${viewMode}`}
                  className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                      : 'space-y-4 max-w-4xl mx-auto'
                  }
                >
                  {filteredQuests.map((quest, index) => renderQuestCard(quest, index))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Footer stats gamifiées */}
            {!loading && filteredQuests.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <div className="glass-morphism-element rounded-xl px-4 py-3 inline-flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FaTrophy className="text-amber-400 text-sm animate-pulse" />
                    <span className="text-gray-400 text-xs">
                      <span className="text-white font-bold">{filteredQuests.length}</span> quêtes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GiTwoCoins className="text-yellow-400 text-sm animate-pulse" />
                    <span className="text-gray-400 text-xs">
                      <span className="text-white font-bold">
                        {filteredQuests.reduce((sum, q) => sum + q.xp, 0)}
                      </span> XP total
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
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

// Styles CSS optimisés
const styles = `
  .glass-morphism-element {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  
  .glass-morphism-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }

  select option {
    background-color: #1a1a2e;
    color: white;
  }

  @media (max-width: 768px) {
    .glass-morphism-card {
      margin: 0 0.25rem;
    }
  }
`;

if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('quest-list-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = 'quest-list-styles';
  style.textContent = styles;
  document.head.appendChild(style);
}

export default QuestList;