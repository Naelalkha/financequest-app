import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLock, FaUnlock, FaStar, FaClock, FaChartLine, 
  FaFilter, FaSearch, FaTrophy, FaCoins 
} from 'react-icons/fa';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Header from '../Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import QuestCard from '../../components/common/Card';
import { toast } from 'react-hot-toast';
import { questTemplates, localizeQuest } from '../../data/questTemplates'; // Import local templates and localizer

const QuestList = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [quests, setQuests] = useState([]);
  const [filteredQuests, setFilteredQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    status: 'all',
    search: ''
  });

  const categories = [
    { value: 'all', label: t('quests.allQuests') },
    { value: 'budgeting', label: t('quests.categories.budgeting') },
    { value: 'saving', label: t('quests.categories.saving') },
    { value: 'investing', label: t('quests.categories.investing') },
    { value: 'debt', label: t('quests.categories.debt') },
    { value: 'planning', label: t('quests.categories.planning') }
  ];

  const difficulties = [
    { value: 'all', label: t('ui.all') },
    { value: 'easy', label: t('quests.difficulty.easy') },
    { value: 'medium', label: t('quests.difficulty.medium') },
    { value: 'hard', label: t('quests.difficulty.hard') }
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
          title: data[`title${language}`] || data.titleEN || data.title,
          description: data[`description${language}`] || data.descriptionEN || data.description,
          steps: data.steps?.map(step => ({
            ...step,
            question: step[`question${language}`] || step.questionEN || step.question,
            content: step[`content${language}`] || step.contentEN || step.content
          })) || []
        };
      });
      
      // Fallback to local templates if no data in Firestore
      if (questList.length === 0) {
        questList = questTemplates.map(quest => localizeQuest(quest, language));
        toast.info(t('quests.usingLocalData') || 'Using local quest data');
      }
      
      setQuests(questList);
    } catch (error) {
      console.error('Error fetching quests:', error);
      toast.error(t('errors.questLoadFailed'));
      
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
    return userProgress[questId]?.status || 'notStarted';
  };

  const getQuestProgress = (questId) => {
    return userProgress[questId]?.progress || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FaTrophy className="text-yellow-500" />
            {t('quests.title')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('quests.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('ui.search')}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {difficulties.map(diff => (
                <option key={diff.value} value={diff.value}>{diff.label}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('status', 'all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.status === 'all' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('ui.all')}
              </button>
              <button
                onClick={() => handleFilterChange('status', 'free')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.status === 'free' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('quests.freeQuests')}
              </button>
              <button
                onClick={() => handleFilterChange('status', 'premium')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.status === 'premium' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t('quests.premiumQuests')}
              </button>
            </div>
          </div>
        </div>

        {filteredQuests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                status={getQuestStatus(quest.id)}
                progress={getQuestProgress(quest.id)}
                isPremium={quest.isPremium}
                userIsPremium={isPremium}
                language={language}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">{t('quests.noQuestsFound')}</p>
            <p className="text-gray-500">{t('quests.tryDifferentFilters')}</p>
          </div>
        )}

        {!isPremium && (
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <FaLock className="text-yellow-300" />
                  {t('premium.title')}
                </h3>
                <p className="text-purple-100">
                  {t('premium.subtitle')}
                </p>
              </div>
              <Link
                to="/premium"
                className="px-6 py-3 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-300 transition-colors font-semibold flex items-center gap-2"
              >
                <FaCoins />
                {t('premium.subscribe')}
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestList;