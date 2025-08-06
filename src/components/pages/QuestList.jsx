import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FaUniversity
} from 'react-icons/fa';
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
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [hoveredQuest, setHoveredQuest] = useState(null);
  const searchInputRef = useRef(null);

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

  // Category configuration with icons and colors
  const categoryConfig = {
    all: { icon: FaChartBar, color: 'from-gray-500 to-gray-600', label: t('quests.all_categories') || 'All Categories', emoji: '🎯' },
    budgeting: { icon: FaWallet, color: 'from-blue-500 to-blue-600', label: t('quests.categories_list.budgeting') || 'Budgeting', emoji: '💰' },
    saving: { icon: FaPiggyBank, color: 'from-green-500 to-green-600', label: t('quests.categories_list.saving') || 'Saving', emoji: '🏦' },
    investing: { icon: FaChartLine, color: 'from-purple-500 to-purple-600', label: t('quests.categories_list.investing') || 'Investing', emoji: '📈' },
    debt: { icon: FaUniversity, color: 'from-red-500 to-red-600', label: t('quests.categories_list.debt') || 'Debt Management', emoji: '💳' },
    planning: { icon: FaChartPie, color: 'from-cyan-500 to-cyan-600', label: t('quests.categories_list.planning') || 'Planning', emoji: '📊' }
  };

  // Quick filter tags
  const quickTags = [
    { id: 'quick', label: '⚡ Quick Win', icon: FaBolt, filter: (q) => q.duration <= 5 },
    { id: 'beginner', label: '🌱 Beginner', icon: FaGraduationCap, filter: (q) => q.difficulty === 'beginner' },
    { id: 'highXP', label: '💎 High XP', icon: FaGem, filter: (q) => q.xp >= 150 },
    { id: 'trending', label: '🔥 Trending', icon: FaFire, filter: (q) => q.completionCount > 100 },
    { id: 'new', label: '✨ New', icon: FaRocket, filter: (q) => q.isNew }
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
    }
  };

  const calculateRecommendationScore = (quest) => {
    let score = 0;
    
    // Boost new quests
    if (quest.isNew) score += 20;
    
    // Boost trending quests
    score += (quest.trendingScore || 0);
    
    // Boost based on success rate
    score += (quest.successRate || 0) / 10;
    
    // Penalize already completed quests
    if (userProgress[quest.id]?.status === 'completed') score -= 50;
    
    // Boost in-progress quests
    if (userProgress[quest.id] && userProgress[quest.id].status !== 'completed') score += 30;
    
    // Boost bookmarked quests
    if (bookmarkedQuests.includes(quest.id)) score += 25;
    
    return score;
  };

  // Use useMemo to filter and sort quests
  const filteredQuests = useMemo(() => {
    if (!quests || quests.length === 0) return [];

    // Enrich quests with metadata
    const enrichedQuests = quests.map((quest, index) => ({
      ...quest,
      isNew: index >= quests.length - 3,
      completionCount: Math.floor(Math.random() * 500),
      avgCompletionTime: quest.duration + Math.floor(Math.random() * 5) - 2,
      successRate: 70 + Math.floor(Math.random() * 25),
      userRating: 4 + Math.random(),
      trendingScore: Math.random() * 100
    }));

    let filtered = [...enrichedQuests];

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(quest => quest.category === filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(quest => quest.difficulty === filters.difficulty);
    }

    // Apply duration filter
    if (filters.duration !== 'all') {
      const durationRanges = {
        quick: [0, 5],
        medium: [6, 15],
        long: [16, 999]
      };
      const [min, max] = durationRanges[filters.duration] || [0, 999];
      filtered = filtered.filter(quest => quest.duration >= min && quest.duration <= max);
    }

    // Apply status filter
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

    // Apply tag filters
    selectedTags.forEach(tagId => {
      const tag = quickTags.find(t => t.id === tagId);
      if (tag && tag.filter) {
        filtered = filtered.filter(tag.filter);
      }
    });

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(quest => 
        quest.title.toLowerCase().includes(searchLower) ||
        quest.description.toLowerCase().includes(searchLower) ||
        quest.category.toLowerCase().includes(searchLower)
      );
    }

    // Sort quests
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
      case 'xp-low':
        filtered.sort((a, b) => a.xp - b.xp);
        break;
      case 'duration-short':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'duration-long':
        filtered.sort((a, b) => b.duration - a.duration);
        break;
      case 'difficulty-easy':
        filtered.sort((a, b) => {
          const diffOrder = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
          return (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0);
        });
        break;
      case 'recommended':
      default:
        filtered.sort((a, b) => calculateRecommendationScore(b) - calculateRecommendationScore(a));
        break;
    }

    return filtered;
  }, [quests, filters, selectedTags, userProgress, bookmarkedQuests, quickTags]);

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
      
      if (!bookmarkedQuests.includes(questId)) {
        toast.success('Quest bookmarked! 🔖');
      } else {
        toast('Bookmark removed');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const shareQuest = (quest) => {
    if (navigator.share) {
      navigator.share({
        title: quest.title,
        text: `Check out this quest: ${quest.title}`,
        url: window.location.origin + `/quests/${quest.id}`
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.origin + `/quests/${quest.id}`);
      toast.success('Link copied to clipboard! 📋');
    }
  };

  const handleQuestClick = (quest, e) => {
    // Check active variant from PostHog
    const activeVariant = posthog.getFeatureFlag('paywall_variant');
    
    // If quest is premium, user is not premium, AND variant A is active
    if (quest.isPremium && !isPremium && activeVariant === 'A_direct') {
      e.preventDefault();
      
      // Capture event for variant A
      posthog.capture('checkout_start', {
        variant: 'A_direct',
        quest_id: quest.id,
        price_id: 'premium_quest_click'
      });
      
      // Show paywall
      setSelectedQuest(quest);
      setShowPaywall(true);
      return;
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
    toast('Filters cleared');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const activeFiltersCount = 
    (filters.category !== 'all' ? 1 : 0) +
    (filters.difficulty !== 'all' ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.duration !== 'all' ? 1 : 0) +
    selectedTags.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pb-20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header Section */}
      <div className="relative bg-gradient-to-b from-gray-800/50 to-transparent backdrop-blur-sm px-4 pt-16 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8 animate-slideDown">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FaRocket className="text-yellow-400" />
              {t('quests.title') || 'Quest Library'}
            </h1>
            <p className="text-gray-400 text-lg">
              {filteredQuests.length} quests available • Start your journey to financial mastery
            </p>
          </div>

          {/* Search Bar with Advanced Options */}
          <div className="mb-6 animate-fadeIn">
            <div className="relative max-w-2xl mx-auto">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('quests.search_placeholder') || 'Search quests by title, category, or keyword...'}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-12 py-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:shadow-lg focus:shadow-yellow-500/20 transition-all text-lg"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
              
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap gap-2 mb-6 animate-fadeIn animation-delay-200">
            {quickTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 ${
                  selectedTags.includes(tag.id)
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg'
                    : 'bg-gray-800/50 backdrop-blur-sm text-gray-300 border border-gray-700 hover:border-yellow-500/50'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 animate-fadeIn animation-delay-300">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white hover:border-yellow-500/50 transition-all flex items-center gap-2"
              >
                <FaFilter />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-yellow-500 text-gray-900 rounded-full text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="recommended">Recommended</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="xp-high">Highest XP</option>
                <option value="xp-low">Lowest XP</option>
                <option value="duration-short">Shortest First</option>
                <option value="duration-long">Longest First</option>
                <option value="difficulty-easy">Easiest First</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-yellow-500 text-gray-900'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-yellow-500 text-gray-900'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl animate-slideDown">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  >
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.emoji} {config.label}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">🌱 Beginner</option>
                    <option value="intermediate">⚡ Intermediate</option>
                    <option value="advanced">🔥 Advanced</option>
                  </select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Duration
                  </label>
                  <select
                    value={filters.duration}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="all">Any Duration</option>
                    <option value="quick">Quick (≤5 min)</option>
                    <option value="medium">Medium (6-15 min)</option>
                    <option value="long">Long (16+ min)</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="all">All Status</option>
                    <option value="not_started">🆕 Not Started</option>
                    <option value="in_progress">⏳ In Progress</option>
                    <option value="completed">✅ Completed</option>
                    <option value="free">🆓 Free Only</option>
                    <option value="premium">👑 Premium Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = filters.category === key;
              
              return (
                <button
                  key={key}
                  onClick={() => handleFilterChange('category', key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 whitespace-nowrap ${
                    isActive
                      ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                      : 'bg-gray-800/50 backdrop-blur-sm text-gray-300 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <Icon className="text-lg" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quest Grid/List */}
      <div className="px-4">
        <div className="max-w-7xl mx-auto">
          {filteredQuests.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-800 rounded-full mb-6">
                <FaSearch className="text-4xl text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No quests found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold hover:scale-105 transform transition-all shadow-lg"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredQuests.map((quest, index) => {
                const progress = userProgress[quest.id];
                const isCompleted = progress?.status === 'completed';
                const isInProgress = progress?.status === 'active';
                const isLocked = quest.isPremium && !isPremium;
                const isBookmarked = bookmarkedQuests.includes(quest.id);
                const CategoryIcon = categoryConfig[quest.category]?.icon || FaChartBar;

                return (
                  <div
                    key={quest.id}
                    className={`
                      relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden
                      hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/10
                      transform hover:scale-105 transition-all duration-300 group
                      animate-fadeIn
                    `}
                    style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                    onMouseEnter={() => setHoveredQuest(quest.id)}
                    onMouseLeave={() => setHoveredQuest(null)}
                  >
                    {/* Category Banner */}
                    <div className={`h-2 bg-gradient-to-r ${categoryConfig[quest.category]?.color || 'from-gray-500 to-gray-600'}`}></div>

                    {/* Card Content */}
                    <div className={`p-6 ${viewMode === 'list' ? 'flex items-center gap-6' : ''}`}>
                      {/* Badge Section */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        {quest.isNew && (
                          <span className="px-2 py-1 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs rounded-full font-bold">
                            NEW
                          </span>
                        )}
                        {quest.isPremium && (
                          <span className="px-2 py-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs rounded-full font-bold flex items-center gap-1">
                            <FaCrown className="text-yellow-300" /> PRO
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-bold">
                            ✓ DONE
                          </span>
                        )}
                      </div>

                      {viewMode === 'grid' ? (
                        <>
                          {/* Grid View Content */}
                          <div className="mb-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryConfig[quest.category]?.color || 'from-gray-500 to-gray-600'} shadow-lg`}>
                                <CategoryIcon className="text-2xl text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">
                                  {quest.title}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  {categoryConfig[quest.category]?.label || quest.category}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                              {quest.description}
                            </p>

                            {/* Quest Stats */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <FaClock className="text-blue-400" />
                                <span>{quest.avgCompletionTime || quest.duration} min</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <FaCoins className="text-yellow-400" />
                                <span className="font-bold">{quest.xp} XP</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <FaChartLine className="text-green-400" />
                                <span>{quest.successRate}% success</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <FaFire className="text-orange-400" />
                                <span>{quest.completionCount} done</span>
                              </div>
                            </div>

                            {/* Progress Bar if in progress */}
                            {isInProgress && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                  <span>Progress</span>
                                  <span>{Math.round(progress.progress || 0)}%</span>
                                </div>
                                <ProgressBar 
                                  progress={progress.progress || 0} 
                                  showPercentage={false}
                                  height="h-2"
                                  color="yellow"
                                  animated={true}
                                />
                              </div>
                            )}

                            {/* Difficulty Badge */}
                            <div className="flex items-center justify-between mb-4">
                              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                quest.difficulty === 'beginner' 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : quest.difficulty === 'intermediate'
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
                              </span>
                              
                              {/* Rating */}
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar 
                                    key={i} 
                                    className={`text-xs ${
                                      i < Math.floor(quest.userRating) 
                                        ? 'text-yellow-400' 
                                        : 'text-gray-600'
                                    }`} 
                                  />
                                ))}
                                <span className="text-xs text-gray-400 ml-1">
                                  {quest.userRating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Link
                              to={isLocked ? '#' : `/quests/${quest.id}`}
                              onClick={(e) => handleQuestClick(quest, e)}
                              className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-center transition-all transform hover:scale-105 ${
                                isCompleted
                                  ? 'bg-gray-700 text-gray-400'
                                  : isInProgress
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg'
                                  : isLocked
                                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                              }`}
                            >
                              {isCompleted ? 'Review' : isInProgress ? 'Continue' : isLocked ? '🔒 Premium' : 'Start Quest'}
                            </Link>
                            
                            <button
                              onClick={() => toggleBookmark(quest.id)}
                              className={`p-2.5 rounded-xl transition-all hover:scale-110 ${
                                isBookmarked
                                  ? 'bg-yellow-500 text-gray-900'
                                  : 'bg-gray-700 text-gray-400 hover:text-yellow-400'
                              }`}
                            >
                              <FaBookmark />
                            </button>
                            
                            <button
                              onClick={() => shareQuest(quest)}
                              className="p-2.5 rounded-xl bg-gray-700 text-gray-400 hover:text-white transition-all hover:scale-110"
                            >
                              <FaShare />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* List View Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryConfig[quest.category]?.color || 'from-gray-500 to-gray-600'}`}>
                                <CategoryIcon className="text-lg text-white" />
                              </div>
                              <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                                {quest.title}
                              </h3>
                              {quest.isNew && (
                                <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs rounded-full font-bold">
                                  NEW
                                </span>
                              )}
                              {quest.isPremium && (
                                <FaCrown className="text-purple-400" />
                              )}
                              {isCompleted && (
                                <FaCheckCircle className="text-green-400" />
                              )}
                            </div>
                            
                            <p className="text-gray-400 text-sm mb-3">
                              {quest.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-gray-400">
                                <FaClock className="text-blue-400" />
                                {quest.duration} min
                              </span>
                              <span className="flex items-center gap-1 text-gray-400">
                                <FaCoins className="text-yellow-400" />
                                <span className="font-bold">{quest.xp} XP</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                quest.difficulty === 'beginner' 
                                  ? 'bg-green-500/20 text-green-400'
                                  : quest.difficulty === 'intermediate'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {quest.difficulty}
                              </span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar 
                                    key={i} 
                                    className={`text-xs ${
                                      i < Math.floor(quest.userRating) 
                                        ? 'text-yellow-400' 
                                        : 'text-gray-600'
                                    }`} 
                                  />
                                ))}
                              </div>
                              {isInProgress && (
                                <div className="flex items-center gap-2">
                                  <ProgressBar 
                                    progress={progress.progress || 0} 
                                    showPercentage={false}
                                    height="h-2"
                                    width="w-20"
                                    color="yellow"
                                  />
                                  <span className="text-xs text-gray-400">
                                    {Math.round(progress.progress || 0)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* List View Actions */}
                          <div className="flex items-center gap-2">
                            <Link
                              to={isLocked ? '#' : `/quests/${quest.id}`}
                              onClick={(e) => handleQuestClick(quest, e)}
                              className={`px-6 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 ${
                                isCompleted
                                  ? 'bg-gray-700 text-gray-400'
                                  : isInProgress
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg'
                                  : isLocked
                                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                              }`}
                            >
                              {isCompleted ? 'Review' : isInProgress ? 'Continue' : isLocked ? '🔒' : 'Start'}
                            </Link>
                            
                            <button
                              onClick={() => toggleBookmark(quest.id)}
                              className={`p-2.5 rounded-xl transition-all hover:scale-110 ${
                                isBookmarked
                                  ? 'bg-yellow-500 text-gray-900'
                                  : 'bg-gray-700 text-gray-400 hover:text-yellow-400'
                              }`}
                            >
                              <FaBookmark />
                            </button>
                            
                            <button
                              onClick={() => shareQuest(quest)}
                              className="p-2.5 rounded-xl bg-gray-700 text-gray-400 hover:text-white transition-all hover:scale-110"
                            >
                              <FaShare />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Hover Preview Overlay */}
                    {hoveredQuest === quest.id && viewMode === 'grid' && quest.objectives && (
                      <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm p-6 flex flex-col justify-center animate-fadeIn">
                        <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                          <FaLightbulb className="text-yellow-400" />
                          What you'll learn:
                        </h4>
                        <ul className="space-y-2 mb-4">
                          {quest.objectives?.slice(0, 4).map((obj, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="text-green-400 mt-0.5">✓</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                        {quest.steps && (
                          <div className="text-xs text-gray-400 border-t border-gray-700 pt-3">
                            <span className="flex items-center gap-2">
                              <FaMedal /> {quest.steps.length} steps to complete
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      {user && (
        <button
          onClick={() => searchInputRef.current?.focus()}
          className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-all z-10"
        >
          <FaSearch className="text-xl" />
        </button>
      )}

      {/* Paywall Modal */}
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
    </div>
  );
};

export default QuestList;