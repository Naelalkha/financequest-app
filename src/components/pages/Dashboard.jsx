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
import LoadingSpinner from '../common/LoadingSpinner';
import ProgressBar from '../common/ProgressBar';
import { toast } from 'react-toastify';
import { questTemplates, localizeQuest } from '../../data/questTemplates';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, currentLang } = useLanguage();
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
  }, [user, currentLang]);

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
        if (data.currentStreak > 0 || data.streaks > 0) {
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
      // Simplified query without composite index requirement
      const recentQuery = query(
        collection(db, 'userQuests'),
        where('userId', '==', user.uid),
        orderBy('lastUpdated', 'desc'),
        limit(5)
      );
      
      const snapshot = await getDocs(recentQuery);
      const activities = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(activity => activity.status === 'active' || activity.status === 'completed')
        .slice(0, 3); // Take only the first 3 after filtering
      
      setRecentQuests(activities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // If still fails, try without orderBy
      try {
        const fallbackQuery = query(
          collection(db, 'userQuests'),
          where('userId', '==', user.uid),
          limit(10)
        );
        
        const snapshot = await getDocs(fallbackQuery);
        const activities = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(activity => activity.status === 'active' || activity.status === 'completed')
          .sort((a, b) => {
            const dateA = a.lastUpdated?.toDate?.() || new Date(a.lastUpdated || 0);
            const dateB = b.lastUpdated?.toDate?.() || new Date(b.lastUpdated || 0);
            return dateB - dateA;
          })
          .slice(0, 3);
        
        setRecentQuests(activities);
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        setRecentQuests([]);
      }
    }
  };

  const fetchRecommendedQuests = async () => {
    try {
      // Get 3 random quests for recommendations
      const localQuests = questTemplates
        .map(quest => localizeQuest(quest, currentLang))
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
        <LoadingSpinner />
      </div>
    );
  }

  const userPoints = userData?.points || 0;
  const userLevel = calculateLevel(userPoints);
  const levelProgress = calculateLevelProgress(userPoints);
  const nextLevelPoints = (userLevel * 1000) - userPoints;
  const streakDays = userData?.streaks || userData?.currentStreak || 0;

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 px-4 pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-6 animate-fadeIn">
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('dashboard.welcome_back') || 'Welcome back,'} {userData?.displayName || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-gray-400">
              {t('dashboard.subtitle') || 'Ready to continue your financial journey?'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Level */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center animate-fadeIn" style={{ animationDelay: '100ms' }}>
              <FaStar className="text-3xl text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{t('dashboard.level') || 'Level'}</p>
              <p className="text-3xl font-bold text-white">{userLevel}</p>
            </div>

            {/* Total Points */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <FaCoins className="text-3xl text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{t('dashboard.total_points') || 'Total Points'}</p>
              <p className="text-3xl font-bold text-white">{userPoints}</p>
            </div>

            {/* Streak */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center animate-fadeIn" style={{ animationDelay: '300ms' }}>
              <FaFire className={`text-3xl mx-auto mb-2 ${streakDays > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-600'}`} />
              <p className="text-sm text-gray-400">{t('dashboard.streak') || 'Streak'}</p>
              <p className="text-3xl font-bold text-white">
                {streakDays}
              </p>
              <p className="text-sm text-gray-400">
                {streakDays === 1 ? t('ui.day') : t('ui.days')}
              </p>
            </div>

            {/* Quests Completed */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center animate-fadeIn" style={{ animationDelay: '400ms' }}>
              <FaChartLine className="text-3xl text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{t('dashboard.quests_done') || 'Quests Done'}</p>
              <p className="text-3xl font-bold text-white">{userData?.completedQuests || 0}</p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 animate-fadeIn" style={{ animationDelay: '500ms' }}>
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              {t('dashboard.level_progress') || 'Level Progress'}
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              {userPoints % 1000} / 1000 points
            </p>
            <ProgressBar 
              progress={levelProgress} 
              showPercentage={true} 
              color="gradient"
              animated={true}
            />
            <p className="text-xs text-gray-500 mt-2">
              {nextLevelPoints} {t('ui.points')} {t('ui.until')} {t('dashboard.level')} {userLevel + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Daily Challenge */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '600ms' }}>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t('dashboard.daily_challenge') || 'Daily Challenge'}
                </h3>
                <p className="text-purple-100 mb-4">
                  {t('dashboard.daily_challenge_desc') || 'Complete today\'s special challenge and earn double points!'}
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
                  className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-gray-600 transition-all duration-300 animate-fadeIn"
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
                          : `${Math.round(activity.progress || 0)}% ${t('dashboard.complete') || 'complete'}`
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
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '900ms' }}>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaStar className="text-yellow-400" />
            {t('dashboard.recommended') || 'Recommended for You'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedQuests.map((quest, index) => (
              <Link
                key={quest.id}
                to={`/quests/${quest.id}`}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transform hover:scale-105 transition-all duration-300 animate-fadeIn"
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
        {!userData?.isPremium && !userData?.premium && (
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