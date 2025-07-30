import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLock, FaStar, FaClock, FaSearch, FaTrophy, 
  FaFilter, FaTimes, FaCrown, FaFire, FaChartLine,
  FaBolt, FaLightbulb, FaGem, FaRocket, FaChevronRight,
  FaBookmark, FaBookOpen, FaPlay
} from 'react-icons/fa';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ProgressBar from '../../components/common/ProgressBar';
import { toast } from 'react-toastify';
import { questTemplates, localizeQuest } from '../../data/questTemplates';

const QuestList = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [quests, setQuests] = useState([]);
  const [filteredQuests, setFilteredQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredQuest, setHoveredQuest] = useState(null);
  const [bookmarkedQuests, setBookmarkedQuests] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    status: 'all',
    search: '',
    sortBy: 'recommended'
  });

  // Catégories améliorées avec émojis et couleurs
  const categories = [
    { value: 'all', label: t('quests.all_categories') || 'All Categories', icon: '🎯', color: 'bg-gray-500' },
    { value: 'budgeting', label: t('quests.categories_list.budgeting') || 'Budgeting', icon: '💰', color: 'bg-blue-500' },
    { value: 'saving', label: t('quests.categories_list.saving') || 'Saving', icon: '🏦', color: 'bg-green-500' },
    { value: 'investing', label: t('quests.categories_list.investing') || 'Investing', icon: '📈', color: 'bg-purple-500' },
    { value: 'debt', label: t('quests.categories_list.debt') || 'Debt', icon: '💳', color: 'bg-red-500' },
    { value: 'planning', label: t('quests.categories_list.planning') || 'Planning', icon: '📊', color: 'bg-cyan-500' }
  ];

  // Tags pour filtrage rapide
  const questTags = [
    { id: 'quick', label: '⚡ Quick (< 5min)', filter: (q) => q.duration <= 5 },
    { id: 'beginner', label: '🌱 Beginner Friendly', filter: (q) => q.difficulty === 'beginner' },
    { id: 'highXP', label: '💎 High XP', filter: (q) => q.xp >= 150 },
    { id: 'new', label: '✨ New', filter: (q) => q.isNew },
    { id: 'trending', label: '🔥 Popular', filter: (q) => q.completionCount > 100 }
  ];

  useEffect(() => {
    loadQuests();
    if (user) {
      loadUserData();
    }
  }, [user, language]);

  useEffect(() => {
    filterAndSortQuests();
  }, [quests, filters, selectedTags, userProgress]);

  const loadQuests = () => {
    try {
      // Enrichir les quêtes avec des métadonnées
      const enrichedQuests = questTemplates.map((quest, index) => ({
        ...localizeQuest(quest, language),
        isNew: index >= questTemplates.length - 3,
        completionCount: Math.floor(Math.random() * 500),
        avgCompletionTime: quest.duration + Math.floor(Math.random() * 5) - 2,
        successRate: 70 + Math.floor(Math.random() * 25),
        userRating: 4 + Math.random()
      }));
      setQuests(enrichedQuests);
    } catch (error) {
      console.error('Error loading quests:', error);
      toast.error(t('errors.quest_load_failed') || 'Failed to load quests');
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setIsPremium(userDoc.data().isPremium || false);
        setBookmarkedQuests(userDoc.data().bookmarkedQuests || []);
      }

      const progressQuery = query(
        collection(db, 'userQuests'),
        where('userId', '==', user.uid)
      );
      const progressSnapshot = await getDocs(progressQuery);
      const progress = {};
      progressSnapshot.docs.forEach(doc => {
        const data = doc.data();
        progress[data.questId] = {
          status: data.status,
          progress: data.progress || 0,
          completedAt: data.completedAt,
          score: data.score || 0,
          timeSpent: data.timeSpent || 0
        };
      });
      setUserProgress(progress);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationScore = (quest) => {
    let score = 0;
    
    if (!userProgress[quest.id]) score += 50;
    
    const completedCount = Object.values(userProgress).filter(p => p.status === 'completed').length;
    if (completedCount < 5 && quest.difficulty === 'beginner') score += 30;
    else if (completedCount >= 5 && completedCount < 15 && quest.difficulty === 'intermediate') score += 30;
    else if (completedCount >= 15 && quest.difficulty === 'advanced') score += 30;
    
    score += quest.completionCount / 20;
    
    if (quest.isNew) score += 20;
    if (bookmarkedQuests.includes(quest.id)) score += 25;
    
    return score;
  };

  const filterAndSortQuests = () => {
    let filtered = [...quests];

    if (filters.category !== 'all') {
      filtered = filtered.filter(quest => quest.category === filters.category);
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(quest => quest.difficulty === filters.difficulty);
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
      const tag = questTags.find(t => t.id === tagId);
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

    switch (filters.sortBy) {
      case 'recommended':
        filtered.sort((a, b) => getRecommendationScore(b) - getRecommendationScore(a));
        break;
      case 'difficulty':
        const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
        filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'xp':
        filtered.sort((a, b) => b.xp - a.xp);
        break;
    }

    setFilteredQuests(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleBookmark = async (questId) => {
    if (!user) {
      toast.info(t('auth.login_required') || 'Please login to bookmark quests');
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
      
      toast.success(
        bookmarkedQuests.includes(questId) 
          ? t('quest.bookmark_removed') || 'Bookmark removed'
          : t('quest.bookmark_added') || 'Quest bookmarked!'
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error(t('errors.bookmark_failed') || 'Failed to update bookmark');
    }
  };

  const QuestCard = ({ quest }) => {
    const progress = userProgress[quest.id];
    const isCompleted = progress?.status === 'completed';
    const isInProgress = progress?.status === 'active';
    const isLocked = quest.isPremium && !isPremium;
    const isBookmarked = bookmarkedQuests.includes(quest.id);

    const difficultyConfig = {
      beginner: { color: 'text-green-400 bg-green-500/20', icon: '🌱' },
      intermediate: { color: 'text-yellow-400 bg-yellow-500/20', icon: '⚡' },
      advanced: { color: 'text-orange-400 bg-orange-500/20', icon: '🔥' },
      expert: { color: 'text-red-400 bg-red-500/20', icon: '💎' }
    };

    const categoryConfig = categories.find(cat => cat.value === quest.category) || categories[0];

    return (
      <div
        className="relative bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6 hover:border-yellow-500/50 transition-all duration-300 group"
        onMouseEnter={() => setHoveredQuest(quest.id)}
        onMouseLeave={() => setHoveredQuest(null)}
      >
        {/* Status Badge - Position absolue avec z-index élevé */}
        <div className="absolute top-3 right-3 z-10">
          {isCompleted && (
            <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
              <FaTrophy className="text-xs" />
              <span className="hidden sm:inline">{t('quests.completed_badge') || 'Completed'}</span>
              <span className="sm:hidden">✓</span>
            </div>
          )}
          {isInProgress && (
            <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs sm:text-sm font-medium animate-pulse">
              {Math.round(progress.progress)}%
            </div>
          )}
          {quest.isNew && !isCompleted && !isInProgress && (
            <div className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
              {t('quests.new') || 'NEW'}
            </div>
          )}
        </div>

        {/* Bookmark Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleBookmark(quest.id);
          }}
          className={`absolute top-3 left-3 p-2 rounded-lg transition-all ${
            isBookmarked 
              ? 'bg-yellow-500/20 text-yellow-400' 
              : 'bg-gray-700 text-gray-400 hover:text-yellow-400 hover:bg-gray-600'
          }`}
        >
          <FaBookmark className="text-xs sm:text-sm" />
        </button>

        {/* Main Content avec padding pour éviter chevauchement */}
        <div className="mt-10 sm:mt-8">
          {/* Category & Difficulty - Disposition flex wrap pour mobile */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${categoryConfig.color} bg-opacity-20`}>
              {categoryConfig.icon} <span className="hidden sm:inline">{categoryConfig.label}</span>
            </span>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${difficultyConfig[quest.difficulty].color}`}>
              {difficultyConfig[quest.difficulty].icon} {quest.difficulty}
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors pr-16">
            {quest.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {quest.description}
          </p>

          {/* Quest Stats - Grid responsive pour mobile */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <FaClock className="text-xs" />
              <span>{quest.avgCompletionTime || quest.duration} min</span>
            </span>
            <span className="flex items-center gap-1">
              <FaStar className="text-xs text-yellow-400" />
              <span>{quest.xp} XP</span>
            </span>
            <span className="flex items-center gap-1">
              <FaChartLine className="text-xs" />
              <span>{quest.successRate}%</span>
            </span>
            {quest.completionCount > 50 && (
              <span className="flex items-center gap-1 text-orange-400">
                <FaFire className="text-xs" />
                <span>{quest.completionCount}</span>
              </span>
            )}
          </div>

          {/* Progress Bar (if in progress) */}
          {isInProgress && (
            <div className="mb-4">
              <ProgressBar 
                progress={progress.progress} 
                showPercentage={false}
                height="h-2"
                color="yellow"
              />
            </div>
          )}

          {/* Hover Preview - Hidden sur mobile */}
          {hoveredQuest === quest.id && quest.objectives && (
            <div className="hidden lg:block absolute left-0 right-0 top-full mt-2 bg-gray-900 border border-gray-700 rounded-lg p-4 z-20 shadow-xl animate-fadeIn">
              <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <FaLightbulb className="text-yellow-400" />
                {t('quest.objectives') || 'What you\'ll learn:'}
              </h4>
              <ul className="space-y-1">
                {quest.objectives.slice(0, 3).map((obj, idx) => (
                  <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
              {quest.steps && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    {quest.steps.length} steps • {quest.steps.filter(s => s.type === 'quiz').length} quiz questions
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Button - Full width sur mobile */}
          <Link
            to={isLocked ? '#' : `/quests/${quest.id}`}
            onClick={(e) => isLocked && e.preventDefault()}
            className={`
              w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all text-sm
              ${isLocked 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : isCompleted
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : isInProgress
                    ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:scale-105'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600 hover:scale-105'
              }
            `}
          >
            {isLocked ? (
              <>
                <FaLock className="text-sm" />
                <span>{t('quests.premium') || 'Premium'}</span>
              </>
            ) : isCompleted ? (
              <>
                <FaPlay className="text-sm" />
                <span>{t('quests.replay') || 'Replay'}</span>
              </>
            ) : isInProgress ? (
              <>
                <FaBookOpen className="text-sm" />
                <span>{t('quests.continue') || 'Continue'}</span>
              </>
            ) : (
              <>
                <FaRocket className="text-sm" />
                <span>{t('quests.start') || 'Start Quest'}</span>
              </>
            )}
            {!isLocked && <FaChevronRight className="text-xs hidden sm:inline" />}
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-3 sm:py-4 max-w-7xl">
        {/* Header - Compact sur tous les écrans */}
        <div className="mb-3 sm:mb-4 animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            {t('quests.title') || 'Finance Quests'}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            {t('quests.subtitle') || 'Choose your learning adventure'}
          </p>
        </div>

        {/* Search, Tags et Filters en une section compacte */}
        <div className="space-y-3 sm:space-y-2 mb-4 sm:mb-5">
          {/* Search Bar avec Filters intégrés */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="text"
                placeholder={t('quests.search_placeholder') || 'Search quests...'}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors text-sm"
              />
            </div>

            {/* Sort et Filter toujours sur la même ligne */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-2 sm:px-3 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors text-sm"
            >
              <option value="recommended">{window.innerWidth < 640 ? '⭐' : t('filters.recommended') || 'Recommended'}</option>
              <option value="difficulty">{window.innerWidth < 640 ? '📊' : t('filters.difficulty') || 'Difficulty'}</option>
              <option value="duration">{window.innerWidth < 640 ? '⏱️' : t('filters.duration') || 'Duration'}</option>
              <option value="xp">{window.innerWidth < 640 ? '💎' : t('filters.xp') || 'XP Reward'}</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all flex items-center gap-1.5 text-sm
                ${showFilters 
                  ? 'bg-yellow-400 text-gray-900' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              <FaFilter className="text-sm" />
              <span className="hidden sm:inline">{t('ui.filters') || 'Filters'}</span>
              {(filters.category !== 'all' || filters.difficulty !== 'all' || filters.status !== 'all') && (
                <span className="bg-gray-900 text-yellow-400 px-1.5 py-0.5 rounded-full text-xs ml-1">
                  {[filters.category !== 'all', filters.difficulty !== 'all', filters.status !== 'all'].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Tags - Intégrés juste sous la search bar */}
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {questTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`
                  px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0
                  ${selectedTags.includes(tag.id)
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Panel - Plus compact */}
        {showFilters && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 animate-slideDown">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Category Filter */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  {t('quests.category') || 'Category'}
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  {t('quests.difficulty') || 'Difficulty'}
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 text-sm"
                >
                  <option value="all">{t('quests.difficulties.all') || 'All'}</option>
                  <option value="beginner">🌱 {t('quests.difficulties.beginner') || 'Beginner'}</option>
                  <option value="intermediate">⚡ {t('quests.difficulties.intermediate') || 'Intermediate'}</option>
                  <option value="advanced">🔥 {t('quests.difficulties.advanced') || 'Advanced'}</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  {t('quests.status') || 'Status'}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 text-sm"
                >
                  <option value="all">{t('filters.all') || 'All'}</option>
                  <option value="not_started">🆕 {t('filters.not_started') || 'New'}</option>
                  <option value="in_progress">⏳ {t('filters.in_progress') || 'Active'}</option>
                  <option value="completed">✅ {t('filters.completed') || 'Done'}</option>
                  <option value="free">🆓 {t('filters.free') || 'Free'}</option>
                  <option value="premium">👑 {t('filters.premium') || 'Pro'}</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-2.5 flex justify-end">
              <button
                onClick={() => {
                  setFilters({
                    category: 'all',
                    difficulty: 'all',
                    status: 'all',
                    search: '',
                    sortBy: 'recommended'
                  });
                  setSelectedTags([]);
                }}
                className="text-gray-400 hover:text-white transition-colors text-xs"
              >
                {t('filters.clear_all') || 'Clear all'}
              </button>
            </div>
          </div>
        )}



        {/* Quest Stats Summary - Intégré en ligne sur desktop */}
        {user && (
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2 sm:p-3 mb-4">
            <div className="flex gap-3 sm:gap-6 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-fit">
                <span className="text-2xl sm:text-3xl font-bold text-green-400">
                  {Object.values(userProgress).filter(p => p.status === 'completed').length}
                </span>
                <span className="text-xs sm:text-sm text-gray-400">{t('stats.completed') || 'Done'}</span>
              </div>
              <div className="flex items-center gap-2 min-w-fit">
                <span className="text-2xl sm:text-3xl font-bold text-yellow-400">
                  {Object.values(userProgress).filter(p => p.status === 'active').length}
                </span>
                <span className="text-xs sm:text-sm text-gray-400">{t('stats.in_progress') || 'Active'}</span>
              </div>
              <div className="flex items-center gap-2 min-w-fit">
                <span className="text-2xl sm:text-3xl font-bold text-blue-400">
                  {Object.values(userProgress).reduce((sum, p) => sum + (p.score || 0), 0)}
                </span>
                <span className="text-xs sm:text-sm text-gray-400">{t('stats.total_xp') || 'XP'}</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-purple-400">
              <span className="text-2xl font-bold">{filteredQuests.length}</span>
              <span className="text-sm text-gray-400">{t('stats.available') || 'Available'}</span>
            </div>
          </div>
        )}

        {/* Quest Grid - Responsive columns */}
        {filteredQuests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaSearch className="text-5xl sm:text-6xl text-gray-700 mx-auto mb-4" />
            <p className="text-lg sm:text-xl text-gray-400 mb-2">
              {t('quests.no_quests') || 'No quests found'}
            </p>
            <p className="text-gray-500 text-sm">
              {t('quests.try_different_filters') || 'Try adjusting your filters'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestList;