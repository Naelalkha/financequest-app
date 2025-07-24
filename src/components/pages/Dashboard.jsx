import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTrophy, FaFire, FaCoins, FaMedal, FaChartLine, 
  FaCheckCircle, FaCrown, FaRocket, FaBolt, FaGem 
} from 'react-icons/fa';
import { collection, query, where, getDocs, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, currentLang } = useLanguage();
  const [userStats, setUserStats] = useState({
    points: 0,
    level: 'Novice',
    streaks: 0,
    badges: [],
    totalQuests: 0,
    activeQuests: [],
    completedQuests: 0,
    lastLogin: null
  });
  const [activeQuests, setActiveQuests] = useState([]);
  const [recommendedQuests, setRecommendedQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);

  // Level calculation
  const getLevelFromPoints = (points) => {
    const levels = [
      { name: 'Novice', min: 0, color: 'text-gray-400' },
      { name: 'Apprentice', min: 500, color: 'text-green-400' },
      { name: 'Explorer', min: 1500, color: 'text-blue-400' },
      { name: 'Adventurer', min: 3000, color: 'text-purple-400' },
      { name: 'Expert', min: 5000, color: 'text-yellow-400' },
      { name: 'Master', min: 10000, color: 'text-orange-400' },
      { name: 'Legend', min: 20000, color: 'text-red-400' }
    ];
    
    const level = levels.reverse().find(l => points >= l.min) || levels[0];
    return level;
  };

  // Calculate next level progress
  const getNextLevelProgress = (points) => {
    const currentLevel = getLevelFromPoints(points);
    const levels = [0, 500, 1500, 3000, 5000, 10000, 20000, 50000];
    const currentIndex = levels.findIndex(l => l === currentLevel.min);
    
    if (currentIndex === -1 || currentIndex === levels.length - 1) return 100;
    
    const nextThreshold = levels[currentIndex + 1];
    const progress = ((points - currentLevel.min) / (nextThreshold - currentLevel.min)) * 100;
    
    return Math.min(progress, 100);
  };

  // Badges data
  const allBadges = [
    { id: 'first_quest', name: t('badges.first_quest'), icon: FaRocket, color: 'bg-green-500' },
    { id: 'week_streak', name: t('badges.week_streak'), icon: FaFire, color: 'bg-orange-500' },
    { id: 'month_streak', name: t('badges.month_streak'), icon: FaBolt, color: 'bg-red-500' },
    { id: 'ten_quests', name: t('badges.ten_quests'), icon: FaTrophy, color: 'bg-yellow-500' },
    { id: 'money_saver', name: t('badges.money_saver'), icon: FaCoins, color: 'bg-green-600' },
    { id: 'investor', name: t('badges.investor'), icon: FaChartLine, color: 'bg-purple-500' },
    { id: 'debt_crusher', name: t('badges.debt_crusher'), icon: FaGem, color: 'bg-blue-500' }
  ];

  // Update streak
  const updateStreak = async (userDoc) => {
    const now = new Date();
    const lastLogin = userStats.lastLogin ? new Date(userStats.lastLogin) : null;
    
    if (lastLogin) {
      const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
      
      let newStreak = userStats.streaks;
      if (daysDiff === 1) {
        newStreak += 1;
        toast.success(t('dashboard.streak_continued', { days: newStreak }), {
          icon: '🔥',
          position: 'top-center'
        });
      } else if (daysDiff > 1) {
        newStreak = 1;
        toast.info(t('dashboard.streak_reset'), {
          icon: '😅',
          position: 'top-center'
        });
      }
      
      await updateDoc(userDoc, {
        streaks: newStreak,
        lastLogin: now.toISOString()
      });
    } else {
      await updateDoc(userDoc, {
        streaks: 1,
        lastLogin: now.toISOString()
      });
    }
  };

  // Load user data
  useEffect(() => {
    if (!user) return;
    
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const level = getLevelFromPoints(data.points || 0);
        
        setUserStats({
          points: data.points || 0,
          level: level.name,
          levelColor: level.color,
          streaks: data.streaks || 0,
          badges: data.badges || [],
          totalQuests: data.totalQuests || 0,
          completedQuests: data.completedQuests || 0,
          lastLogin: data.lastLogin,
          isPremium: data.isPremium || false
        });
        
        // Update streak on first load
        if (!loading) {
          await updateStreak(userDocRef);
        }
      } else {
        // Create initial user document
        const initialData = {
          email: user.email,
          points: 0,
          streaks: 0,
          badges: [],
          totalQuests: 0,
          completedQuests: 0,
          lastLogin: new Date().toISOString(),
          isPremium: false,
          lang: currentLang
        };
        await updateDoc(userDocRef, initialData);
        setUserStats({
          ...initialData,
          level: 'Novice',
          levelColor: 'text-gray-400'
        });
      }
    });
    
    return () => unsubscribe();
  }, [user, currentLang]);

  // Load active quests
  useEffect(() => {
    const loadActiveQuests = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'userQuests'),
          where('userId', '==', user.uid),
          where('status', '==', 'active')
        );
        
        const querySnapshot = await getDocs(q);
        const quests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setActiveQuests(quests);
        setLoading(false);
      } catch (error) {
        console.error('Error loading quests:', error);
        setLoading(false);
      }
    };
    
    loadActiveQuests();
  }, [user]);

  // Generate daily challenge
  useEffect(() => {
    const challenges = [
      {
        id: 'save_5',
        title: currentLang === 'fr' ? 'Économisez 5€ aujourd\'hui' : 'Save $5 today',
        points: 50,
        icon: FaCoins
      },
      {
        id: 'track_expenses',
        title: currentLang === 'fr' ? 'Suivez toutes vos dépenses' : 'Track all expenses',
        points: 30,
        icon: FaChartLine
      },
      {
        id: 'no_impulse',
        title: currentLang === 'fr' ? 'Évitez les achats impulsifs' : 'Avoid impulse purchases',
        points: 40,
        icon: FaCrown
      }
    ];
    
    const today = new Date().getDay();
    setDailyChallenge(challenges[today % challenges.length]);
  }, [currentLang]);

  // Progress bar component
  const ProgressBar = ({ progress, color = 'bg-yellow-500', height = 'h-2' }) => (
    <div className={`w-full bg-gray-700 rounded-full ${height} overflow-hidden`}>
      <div 
        className={`${color} ${height} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const nextLevelProgress = getNextLevelProgress(userStats.points);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
            {t('dashboard.welcome_back', { 
              name: user?.displayName || user?.email?.split('@')[0] || 'Adventurer' 
            })}
          </h1>
          <p className="text-gray-400 text-lg">
            {userStats.streaks > 0 
              ? t('dashboard.streak_message', { days: userStats.streaks })
              : t('dashboard.start_streak')
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Level Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-yellow-500 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm">{t('level')}</h3>
              <FaTrophy className={`text-2xl ${userStats.levelColor}`} />
            </div>
            <p className={`text-3xl font-bold ${userStats.levelColor} mb-2`}>
              {userStats.level}
            </p>
            <p className="text-sm text-gray-500 mb-3">
              {userStats.points} {t('points')}
            </p>
            <ProgressBar progress={nextLevelProgress} />
            <p className="text-xs text-gray-500 mt-2">
              {t('dashboard.next_level_progress', { progress: Math.round(nextLevelProgress) })}
            </p>
          </div>

          {/* Streak Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-orange-500 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm">{t('streak')}</h3>
              <FaFire className="text-2xl text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-400 flex items-center gap-2">
              {userStats.streaks}
              {userStats.streaks > 0 && <FaFire className="text-xl animate-pulse" />}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {t('dashboard.days_consecutive')}
            </p>
            {userStats.streaks >= 7 && (
              <div className="mt-2 text-xs bg-orange-900/30 text-orange-400 px-2 py-1 rounded-full inline-block">
                🔥 {t('dashboard.on_fire')}
              </div>
            )}
          </div>

          {/* Quests Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-green-500 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm">{t('quests.my_quests')}</h3>
              <FaCheckCircle className="text-2xl text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              {userStats.completedQuests}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {t('dashboard.quests_completed')}
            </p>
            <Link 
              to="/quests" 
              className="text-sm text-green-400 hover:text-green-300 mt-2 inline-block"
            >
              {t('dashboard.view_all_quests')} →
            </Link>
          </div>

          {/* Badges Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm">{t('badges_title')}</h3> {/* Correction : utilisez 'badges_title' pour la chaîne, au lieu de 'badges' qui renvoie l'objet */}
              <FaMedal className="text-2xl text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {userStats.badges.length}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {t('dashboard.badges_earned')}
            </p>
            <div className="flex gap-1 mt-2">
              {allBadges.slice(0, 4).map((badge, idx) => {
                const earned = userStats.badges.includes(badge.id);
                return (
                  <div
                    key={idx}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      earned ? badge.color : 'bg-gray-700'
                    }`}
                  >
                    <badge.icon className={`text-sm ${earned ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                );
              })}
              {allBadges.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                  +{allBadges.length - 4}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Quests Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-yellow-400">
              {t('dashboard.active_quests')}
            </h2>
            <Link 
              to="/quests" 
              className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
            >
              <FaRocket />
              {t('dashboard.start_new_quest')}
            </Link>
          </div>

          {activeQuests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeQuests.map((quest) => (
                <div 
                  key={quest.id} 
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {quest[`title_${currentLang}`] || quest.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {quest[`description_${currentLang}`] || quest.description}
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>{t('progress')}</span>
                      <span>{quest.progress || 0}%</span>
                    </div>
                    <ProgressBar progress={quest.progress || 0} />
                  </div>
                  <Link 
                    to={`/quests/${quest.questId}`}
                    className="w-full block text-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                  >
                    {t('continue')}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
              <FaTrophy className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-6">
                {t('dashboard.no_active_quests')}
              </p>
              <Link 
                to="/quests" 
                className="inline-block px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                {t('dashboard.explore_quests')}
              </Link>
            </div>
          )}
        </div>

        {/* Daily Challenge */}
        {dailyChallenge && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">
              {t('dashboard.daily_challenge')}
            </h2>
            <div className="bg-gradient-to-r from-purple-800 to-pink-800 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10">
                <dailyChallenge.icon className="text-[200px]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <dailyChallenge.icon className="text-2xl" />
                  {dailyChallenge.title}
                </h3>
                <p className="text-purple-100 mb-4">
                  {t('dashboard.complete_for_points', { points: dailyChallenge.points })}
                </p>
                <button className="px-6 py-2 bg-white text-purple-800 rounded-lg hover:bg-purple-50 transition-colors font-semibold">
                  {t('dashboard.accept_challenge')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Premium Banner */}
        {!userStats.isPremium && (
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              {t('dashboard.unlock_premium')}
            </h3>
            <p className="text-yellow-100 mb-4">
              {t('dashboard.premium_benefits')}
            </p>
            <Link 
              to="/premium" 
              className="inline-block px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-yellow-50 transition-colors font-semibold"
            >
              {t('dashboard.upgrade_now')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;