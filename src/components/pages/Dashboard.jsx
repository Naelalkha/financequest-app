import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaTrophy, FaFire, FaCoins, FaStar, FaChartLine, 
  FaLock, FaArrowRight, FaBolt, FaGem, FaBullseye, FaCrown
} from 'react-icons/fa';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CircularProgressBar } from '../../components/common/ProgressBar';
import { toast } from 'react-toastify';
import { questTemplates, localizeQuest } from '../../data/questTemplates';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [recentQuests, setRecentQuests] = useState([]);
  const [recommendedQuests, setRecommendedQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streakAnimation, setStreakAnimation] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, language]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user data
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        
        // Animate streak if it exists
        if (data.currentStreak > 0) {
          setTimeout(() => setStreakAnimation(true), 500);
        }
      }
      
      // Fetch recent activity
      await fetchRecentActivity();
      
      // Get recommended quests
      await fetchRecommendedQuests();
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(t('errors.load_dashboard_failed') || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const recentQuery = query(
        collection(db, 'userQuests'),
        where('userId', '==', user.uid),
        where('status', 'in', ['active', 'completed']),
        orderBy('lastUpdated', 'desc'),
        limit(3)
      );
      
      const snapshot = await getDocs(recentQuery);
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setRecentQuests(activities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchRecommendedQuests = async () => {
    try {
      // Get 3 random quests for recommendations
      const localQuests = questTemplates
        .map(quest => localizeQuest(quest, language))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      setRecommendedQuests(localQuests);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const calculateLevel = (points) => {
    return Math.floor(points / 1000) + 1;
  };

  const calculateLevelProgress = (points) => {
    return (points % 1000) / 10;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" color="yellow" />
      </div>
    );
  }

  const userLevel = calculateLevel(userData?.points || 0);
  const levelProgress = calculateLevelProgress(userData?.points || 0);
  const nextLevelPoints = (userLevel * 1000) - (userData?.points || 0);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 px-4 pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-6 animate-fadeIn">
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('dashboard.welcome_back') || 'Welcome back,'} {userData?.displayName || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-gray-400">
              {t('dashboard.subtitle') || "Let's continue your financial journey"}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Level Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 transform hover:scale-105 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-2">
                <FaStar className="text-yellow-400 text-xl" />
                <span className="text-xs text-gray-500 font-medium">
                  {t('dashboard.level') || 'Level'}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">{userLevel}</div>
                <div className="text-xs text-gray-400">
                  {nextLevelPoints} {t('ui.points_to_next') || 'to next'}
                </div>
              </div>
            </div>

            {/* Points Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 transform hover:scale-105 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-2">
                <FaCoins className="text-yellow-400 text-xl" />
                <span className="text-xs text-gray-500 font-medium">
                  {t('dashboard.total_points') || 'Points'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {userData?.points || 0}
              </div>
            </div>

            {/* Streak Card */}
            <div className={`bg-gray-800 border border-gray-700 rounded-xl p-4 transform hover:scale-105 transition-all duration-300 animate-fadeIn ${streakAnimation ? 'animate-pulse' : ''}`} style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-2">
                <FaFire className={`text-xl ${userData?.currentStreak > 0 ? 'text-orange-500' : 'text-gray-600'}`} />
                <span className="text-xs text-gray-500 font-medium">
                  {t('dashboard.streak') || 'Streak'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {userData?.currentStreak || 0}
                <span className="text-sm text-gray-400 ml-1">
                  {t('ui.days') || 'days'}
                </span>
              </div>
            </div>

            {/* Quests Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 transform hover:scale-105 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center justify-between mb-2">
                <FaTrophy className="text-green-400 text-xl" />
                <span className="text-xs text-gray-500 font-medium">
                  {t('dashboard.quests_done') || 'Quests'}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {userData?.questsCompleted || 0}
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-fadeIn" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {t('dashboard.level_progress') || 'Level Progress'}
                </h3>
                <p className="text-sm text-gray-400">
                  {userData?.points || 0} / {userLevel * 1000} {t('ui.points') || 'points'}
                </p>
              </div>
              <CircularProgressBar 
                progress={levelProgress} 
                size={80} 
                strokeWidth={6}
                color="yellow"
                showPercentage={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 py-8 max-w-4xl mx-auto">
        {/* Daily Challenge */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '600ms' }}>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FaBolt className="text-yellow-300 text-xl" />
                  <h3 className="text-xl font-bold text-white">
                    {t('dashboard.daily_challenge') || 'Daily Challenge'}
                  </h3>
                </div>
                <p className="text-purple-100 mb-4">
                  {t('dashboard.daily_challenge_desc') || 'Complete today\'s challenge for bonus rewards!'}
                </p>
                <Link
                  to="/quests"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300"
                >
                  {t('dashboard.start_challenge') || 'Start Challenge'}
                  <FaArrowRight />
                </Link>
              </div>
              <div className="hidden md:block">
                <FaGem className="text-yellow-300 text-6xl opacity-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '700ms' }}>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-green-400" />
            {t('dashboard.recent_activity') || 'Recent Activity'}
          </h2>
          
          {recentQuests.length > 0 ? (
            <div className="space-y-3">
              {recentQuests.map((activity, index) => (
                <div 
                  key={activity.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-gray-600 transition-all duration-300"
                  style={{ animationDelay: `${800 + index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {activity.status === 'completed' ? <FaTrophy /> : <FaBullseye />}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {activity.questTitle || `Quest ${activity.questId}`}
                      </p>
                      <p className="text-sm text-gray-400">
                        {activity.status === 'completed' 
                          ? t('dashboard.completed') || 'Completed'
                          : `${activity.progress || 0}% ${t('dashboard.complete') || 'complete'}`
                        }
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/quests/${activity.questId}`}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <FaArrowRight />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-400 mb-4">
                {t('dashboard.no_activity') || 'No recent activity'}
              </p>
              <Link
                to="/quests"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {t('dashboard.start_first_quest') || 'Start Your First Quest'}
                <FaArrowRight />
              </Link>
            </div>
          )}
        </div>

        {/* Recommended Quests */}
        <div className="animate-fadeIn" style={{ animationDelay: '900ms' }}>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaStar className="text-yellow-400" />
            {t('dashboard.recommended') || 'Recommended for You'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedQuests.map((quest, index) => (
              <Link
                key={quest.id}
                to={`/quests/${quest.id}`}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${1000 + index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white flex-1 pr-2">{quest.title}</h3>
                  {quest.isPremium && (
                    <FaCrown className="text-purple-400 text-sm flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{quest.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">~{quest.duration || 15} min</span>
                  <span className="text-yellow-400 font-medium">+{quest.points || 100} pts</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Premium CTA */}
        {!userData?.isPremium && (
          <div className="mt-12 animate-fadeIn" style={{ animationDelay: '1100ms' }}>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 shadow-lg text-center">
              <FaCrown className="text-5xl text-yellow-300 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {t('dashboard.unlock_premium') || 'Unlock Premium'}
              </h3>
              <p className="text-purple-100 mb-6">
                {t('dashboard.premium_desc') || 'Get access to exclusive quests and features'}
              </p>
              <Link
                to="/premium"
                className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {t('dashboard.upgrade_now') || 'Upgrade Now'}
                <FaArrowRight />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;