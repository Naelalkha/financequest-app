import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLock, FaStar, FaClock, FaSearch, FaTrophy, 
  FaCoins, FaFilter, FaTimes, FaCrown, FaFire
} from 'react-icons/fa';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
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
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    status: 'all',
    search: ''
  });

  const categories = [
    { value: 'all', label: t('quests.all_categories') || 'All Categories', icon: '🎯' },
    { value: 'budgeting', label: t('quests.categories_list.budgeting') || 'Budgeting', icon: '💰' },
    { value: 'saving', label: t('quests.categories_list.saving') || 'Saving', icon: '🏦' },
    { value: 'investing', label: t('quests.categories_list.investing') || 'Investing', icon: '📈' },
    { value: 'debt', label: t('quests.categories_list.debt') || 'Debt', icon: '💳' },
    { value: 'planning', label: t('quests.categories_list.planning') || 'Planning', icon: '📊' }
  ];

  const difficulties = [
    { value: 'all', label: t('ui.all') || 'All Levels' },
    { value: 'beginner', label: t('quests.difficulty_levels.beginner') || 'Beginner', color: 'text-green-400' },
    { value: 'intermediate', label: t('quests.difficulty_levels.intermediate') || 'Intermediate', color: 'text-yellow-400' },
    { value: 'advanced', label: t('quests.difficulty_levels.advanced') || 'Advanced', color: 'text-orange-400' }
  ];

  useEffect(() => {
    if (user) {
      fetchQuests();
      checkPremiumStatus();
      fetchUserProgress();
    }
  }, [user, language]);

  useEffect(() => {
    filterQuests();
  }, [quests, filters]);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const questsCollection = collection(db, 'quests');
      const questSnapshot = await getDocs(questsCollection);
      
      let questList = questSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          title: data[`title_${language}`] || data.title_en || data.title,
          description: data[`description_${language}`] || data.description_en || data.description,
          category: data.category || 'general',
          difficulty: data.difficulty || 'beginner',
          duration: data.duration || 15,
          points: data.points || 100,
          isPremium: data.isPremium || false
        };
      });
      
      // Fallback to local templates if no data in Firestore
      if (questList.length === 0) {
        questList = questTemplates.map(quest => localizeQuest(quest, language));
        toast.info(t('quests.usingLocalData') || 'Using offline data');
      }
      
      setQuests(questList);
    } catch (error) {
      console.error('Error fetching quests:', error);
      toast.error(t('errors.quest_load_failed') || 'Failed to load quests');
      
      // Fallback to local on error
      const localQuests = questTemplates.map(quest => localizeQuest(quest, language));
      setQuests(localQuests);
    } finally {
      setLoading(false);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setIsPremium(userSnap.data().isPremium || false);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const fetchUserProgress = async () => {
    try {
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
          completedAt: data.completedAt
        };
      });
      setUserProgress(progress);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const filterQuests = () => {
    let filtered = [...quests];

    if (filters.category !== 'all') {
      filtered = filtered.filter(quest => quest.category === filters.category);
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(quest => quest.difficulty === filters.difficulty);
    }

    if (filters.status !== 'all') {
      if (filters.status === 'free') {
        filtered = filtered.filter(quest => !quest.isPremium);
      } else if (filters.status === 'premium') {
        filtered = filtered.filter(quest => quest.isPremium);
      }
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(quest => 
        quest.title.toLowerCase().includes(searchLower) ||
        quest.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredQuests(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getQuestStatus = (questId) => {
    return userProgress[questId]?.status || 'not_started';
  };

  const getQuestProgress = (questId) => {
    return userProgress[questId]?.progress || 0;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
      easy: 'bg-green-500/20 text-green-400 border-green-500/30',
      intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      advanced: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      hard: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return colors[difficulty] || colors.beginner;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" color="yellow" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 px-4 pt-16 pb-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3 animate-fadeIn">
            <FaTrophy className="text-yellow-400" />
            {t('quests.all_quests') || 'All Quests'}
          </h1>
          <p className="text-gray-400 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            {t('quests.subtitle') || 'Choose your next financial adventure'}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="sticky top-0 z-30 bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder={t('quests.search_placeholder') || 'Search quests...'}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white hover:border-yellow-500 transition-all duration-300 flex items-center gap-2 animate-fadeIn"
              style={{ animationDelay: '300ms' }}
            >
              <FaFilter className={showFilters ? 'text-yellow-400' : 'text-gray-400'} />
              <span className="hidden sm:inline">{t('ui.filters') || 'Filters'}</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-xl animate-slideDown">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    {t('quests.category') || 'Category'}
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
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
                  <label className="text-sm text-gray-400 mb-2 block">
                    {t('quests.difficulty') || 'Difficulty'}
                  </label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    {t('quests.status') || 'Status'}
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFilterChange('status', 'all')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                        filters.status === 'all' 
                          ? 'bg-yellow-500 text-gray-900' 
                          : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {t('ui.all') || 'All'}
                    </button>
                    <button
                      onClick={() => handleFilterChange('status', 'free')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                        filters.status === 'free' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {t('quests.free') || 'Free'}
                    </button>
                    <button
                      onClick={() => handleFilterChange('status', 'premium')}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                        filters.status === 'premium' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <FaCrown className="inline mr-1" />
                      {t('quests.premium') || 'Pro'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quest Grid */}
      <div className="px-4 py-8 max-w-4xl mx-auto">
        {filteredQuests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuests.map((quest, index) => {
              const status = getQuestStatus(quest.id);
              const progress = getQuestProgress(quest.id);
              const locked = quest.isPremium && !isPremium;
              const completed = status === 'completed';
              const inProgress = status === 'active';
              
              return (
                <Link
                  key={quest.id}
                  to={locked ? '#' : `/quests/${quest.id}`}
                  onClick={(e) => {
                    if (locked) {
                      e.preventDefault();
                      toast.info(t('premium.unlock_quest') || 'Unlock Premium to access this quest');
                    }
                  }}
                  className={`
                    bg-gray-800 border border-gray-700 rounded-xl p-6 
                    transform transition-all duration-300 animate-fadeIn
                    ${!locked ? 'hover:scale-105 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10' : 'opacity-75'}
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Quest Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white flex-1 pr-2">
                      {quest.title}
                    </h3>
                    {quest.isPremium && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full font-medium border border-purple-500/30">
                        PRO
                      </span>
                    )}
                  </div>

                  {/* Quest Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {quest.description}
                  </p>

                  {/* Quest Meta */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 text-xs rounded-lg font-medium border ${getDifficultyColor(quest.difficulty)}`}>
                      {quest.difficulty}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-lg font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {quest.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FaClock className="text-gray-600" />
                      ~{quest.duration} min
                    </span>
                  </div>

                  {/* Progress Bar (if in progress) */}
                  {inProgress && (
                    <div className="mb-4">
                      <ProgressBar
                        progress={progress}
                        showPercentage={true}
                        color="yellow"
                        height="h-2"
                      />
                    </div>
                  )}

                  {/* Quest Status/Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-400 font-medium">
                      <FaCoins />
                      <span>+{quest.points} pts</span>
                    </div>
                    
                    <div className="text-sm font-medium">
                      {locked ? (
                        <span className="flex items-center gap-1 text-gray-500">
                          <FaLock />
                          {t('ui.locked') || 'Locked'}
                        </span>
                      ) : completed ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <FaStar />
                          {t('ui.completed') || 'Completed'}
                        </span>
                      ) : inProgress ? (
                        <span className="text-yellow-400">
                          {t('ui.continue') || 'Continue'}
                        </span>
                      ) : (
                        <span className="text-green-400">
                          {t('ui.start') || 'Start'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 animate-fadeIn">
            <FaSearch className="text-6xl text-gray-700 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">{t('quests.no_results') || 'No quests found'}</p>
            <p className="text-gray-500">{t('quests.try_different') || 'Try different filters'}</p>
          </div>
        )}

        {/* Premium CTA */}
        {!isPremium && (
          <div className="mt-12 animate-fadeIn" style={{ animationDelay: '500ms' }}>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <FaCrown className="text-yellow-300" />
                    {t('premium.unlock_all') || 'Unlock All Premium Quests'}
                  </h3>
                  <p className="text-purple-100">
                    {t('premium.get_access') || 'Get unlimited access to all quests and exclusive features'}
                  </p>
                </div>
                <Link
                  to="/premium"
                  className="px-8 py-3 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 shadow-lg whitespace-nowrap"
                >
                  {t('premium.upgrade_now') || 'Upgrade Now'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestList;