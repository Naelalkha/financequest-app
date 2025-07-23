import { Link } from 'react-router-dom';
import { FaTrophy, FaCoins, FaFire, FaChartLine, FaSignOutAlt, FaMedal, FaStar, FaCrown, FaGem, FaBolt, FaAward, FaRocket, FaMoon, FaSun, FaGamepad, FaTachometerAlt, FaShare, FaCalendarCheck, FaHeartbeat, FaLightbulb, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Dashboard({ t, currentLang }) {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState({
    points: 0,
    level: 'Novice',
    streaks: 0,
    badges: [],
    lastLogin: null,
    lang: 'en',
    completedQuests: [],
    totalTimeSpent: 0,
    loginStreak: 0
  });
  const [newBadges, setNewBadges] = useState([]);
  const [streakChecked, setStreakChecked] = useState(false);
  const [showTooltip, setShowTooltip] = useState({});
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Level system with enhanced thresholds
  const levelThresholds = {
    0: 'Novice',
    50: 'Apprentice',
    150: 'Intermediate', 
    350: 'Advanced',
    600: 'Expert',
    1000: 'Master',
    1500: 'Grandmaster',
    2500: 'Legend'
  };

  // Enhanced badge definitions with proper structure
  const badgeDefinitions = {
    'FirstSteps': { 
      iconName: 'medal', 
      requirement: 10, 
      color: 'text-yellow-600', 
      type: 'points',
      description: 'Complete your first quest'
    },
    'BudgetMaster': { 
      iconName: 'star', 
      requirement: 100, 
      color: 'text-yellow-500', 
      type: 'points',
      description: 'Master the art of budgeting'
    },
    'SavingsPro': { 
      iconName: 'crown', 
      requirement: 300, 
      color: 'text-purple-500', 
      type: 'points',
      description: 'Become a savings expert'
    },
    'InvestmentGuru': { 
      iconName: 'gem', 
      requirement: 600, 
      color: 'text-blue-500', 
      type: 'points',
      description: 'Master investment strategies'
    },
    'StreakWarrior': { 
      iconName: 'fire', 
      requirement: 7, 
      color: 'text-orange-500', 
      type: 'streak',
      description: 'Maintain a 7-day streak'
    },
    'Dedicated': { 
      iconName: 'calendar-check', 
      requirement: 30, 
      color: 'text-green-500', 
      type: 'streak',
      description: '30-day learning streak'
    },
    'Legendary': { 
      iconName: 'rocket', 
      requirement: 1000, 
      color: 'text-gold-500', 
      type: 'points',
      description: 'Achieve legendary status'
    },
    'NightOwl': { 
      iconName: 'moon', 
      requirement: 'night_learning', 
      color: 'text-indigo-500', 
      type: 'special',
      description: 'Complete quests after 10 PM'
    },
    'EarlyBird': { 
      iconName: 'sun', 
      requirement: 'early_learning', 
      color: 'text-yellow-400', 
      type: 'special',
      description: 'Complete quests before 8 AM'
    },
    'WeekendWarrior': { 
      iconName: 'gamepad', 
      requirement: 'weekend_learning', 
      color: 'text-purple-400', 
      type: 'special',
      description: 'Active learner on weekends'
    },
    'Perfectionist': { 
      iconName: 'shield-alt', 
      requirement: 'perfect_scores', 
      color: 'text-cyan-500', 
      type: 'special',
      description: 'Get perfect scores on 5 quests'
    },
    'SpeedRunner': { 
      iconName: 'bolt', 
      requirement: 'fast_completion', 
      color: 'text-red-500', 
      type: 'special',
      description: 'Complete quests in record time'
    },
    'SocialSharer': { 
      iconName: 'share', 
      requirement: 'social_shares', 
      color: 'text-pink-500', 
      type: 'special',
      description: 'Share your achievements'
    }
  };

  // Helper function to get icon component
  const getIconComponent = (iconName) => {
    const iconMap = {
      'medal': FaMedal,
      'star': FaStar,
      'crown': FaCrown,
      'gem': FaGem,
      'fire': FaFire,
      'calendar-check': FaCalendarCheck,
      'rocket': FaRocket,
      'moon': FaMoon,
      'sun': FaSun,
      'gamepad': FaGamepad,
      'shield-alt': FaShieldAlt,
      'bolt': FaBolt,
      'share': FaShare,
      'trophy': FaTrophy,
      'award': FaAward,
      'lightbulb': FaLightbulb,
      'heartbeat': FaHeartbeat,
      'thunderbolt': FaBolt // Using FaBolt instead of non-existent FaThunderbolt
    };
    return iconMap[iconName] || FaMedal;
  };

  // Get badge name with translation fallback
  const getBadgeName = (badgeKey) => {
    const translationKey = `badges.${badgeKey}`;
    const translated = t(translationKey);
    return translated !== translationKey ? translated : badgeKey.replace(/([A-Z])/g, ' $1').trim();
  };

  // Calculate level and progress
  const levelData = useMemo(() => {
    const sortedThresholds = Object.entries(levelThresholds).sort(([a], [b]) => Number(a) - Number(b));
    let currentLevel = 'Novice';
    let nextThreshold = 50;
    let currentThreshold = 0;
    
    for (let i = 0; i < sortedThresholds.length; i++) {
      const [threshold, level] = sortedThresholds[i];
      const numThreshold = Number(threshold);
      
      if (userStats.points >= numThreshold) {
        currentLevel = level;
        currentThreshold = numThreshold;
        nextThreshold = i < sortedThresholds.length - 1 ? Number(sortedThresholds[i + 1][0]) : null;
      }
    }
    
    const progressData = nextThreshold ? {
      current: userStats.points - currentThreshold,
      total: nextThreshold - currentThreshold,
      percentage: Math.round(((userStats.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    } : null;
    
    return { currentLevel, nextThreshold, progressData };
  }, [userStats.points]);

  // Check for new badges and level up
  const checkAchievements = (newStats) => {
    const earnedBadges = [];
    
    Object.entries(badgeDefinitions).forEach(([badgeKey, badge]) => {
      if (!newStats.badges.includes(badgeKey)) {
        let shouldEarn = false;
        
        switch (badge.type) {
          case 'points':
            shouldEarn = newStats.points >= badge.requirement;
            break;
          case 'streak':
            shouldEarn = newStats.streaks >= badge.requirement;
            break;
          case 'special':
            // Add logic for special badges based on user behavior
            shouldEarn = false; // For now, these are manually awarded
            break;
        }
        
        if (shouldEarn) {
          earnedBadges.push(badgeKey);
        }
      }
    });
    
    if (earnedBadges.length > 0) {
      setNewBadges(earnedBadges);
      earnedBadges.forEach(badge => {
        toast.success(`🏆 ${t('newBadgeEarned')}: ${getBadgeName(badge)}!`, {
          position: "top-center",
          autoClose: 5000,
          className: 'bg-gray-800 text-white'
        });
      });
      
      // Clear new badges after animation
      setTimeout(() => setNewBadges([]), 5000);
    }
    
    // Check level up
    if (levelData.currentLevel !== newStats.level) {
      setLevelUpAnimation(true);
      toast.success(`🎉 ${t('levelUp')}: ${levelData.currentLevel}!`, {
        position: "top-center",
        autoClose: 5000,
        className: 'bg-gold-900 text-white'
      });
      setTimeout(() => setLevelUpAnimation(false), 3000);
    }
  };

  // Update streak logic
  const updateStreak = async (userDoc) => {
    const now = new Date();
    const today = now.toDateString();
    const lastLogin = userStats.lastLogin ? new Date(userStats.lastLogin).toDateString() : null;
    
    if (lastLogin !== today && !streakChecked) {
      let newStreak = userStats.streaks;
      
      if (lastLogin) {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
        if (lastLogin === yesterday) {
          newStreak += 1;
          toast.success(`🔥 ${t('streakContinued')}: ${newStreak} ${t('days')}!`);
        } else {
          newStreak = 1;
          if (userStats.streaks > 0) {
            toast.warning(`💔 ${t('streakBroken')}. ${t('startingOver')}!`);
          }
        }
      } else {
        newStreak = 1;
        toast.success(`🎯 ${t('firstStreak')}!`);
      }
      
      const newStats = {
        ...userStats,
        streaks: newStreak,
        lastLogin: now.toISOString(),
        level: levelData.currentLevel
      };
      
      await updateDoc(userDoc, newStats);
      setUserStats(newStats);
      checkAchievements(newStats);
      setStreakChecked(true);
    }
  };

  // Load user data
  useEffect(() => {
    if (!user) return;
    
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newStats = {
          points: data.points || 0,
          level: data.level || 'Novice',
          streaks: data.streaks || 0,
          badges: data.badges || [],
          lastLogin: data.lastLogin || null,
          lang: data.lang || currentLang,
          completedQuests: data.completedQuests || [],
          totalTimeSpent: data.totalTimeSpent || 0,
          loginStreak: data.loginStreak || 0
        };
        setUserStats(newStats);
        
        if (!streakChecked) {
          await updateStreak(userDocRef);
        }
      } else {
        // Create initial user document
        const initialStats = {
          points: 0,
          level: 'Novice',
          streaks: 0,
          badges: [],
          lastLogin: new Date().toISOString(),
          lang: currentLang,
          completedQuests: [],
          totalTimeSpent: 0,
          loginStreak: 1
        };
        await updateDoc(userDocRef, initialStats);
        setUserStats(initialStats);
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [user, currentLang, streakChecked]);

  // Tooltip handlers
  const handleTooltipShow = (badgeKey) => {
    setShowTooltip(prev => ({ ...prev, [badgeKey]: true }));
  };

  const handleTooltipHide = (badgeKey) => {
    setShowTooltip(prev => ({ ...prev, [badgeKey]: false }));
  };

  // Share achievement
  const shareAchievement = () => {
    const text = `🎯 I just reached level ${levelData.currentLevel} with ${userStats.points} points on FinanceQuest! 💰✨ #FinanceQuest #MoneyGoals`;
    
    if (navigator.share) {
      navigator.share({
        title: 'FinanceQuest Achievement',
        text: text,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Achievement copied to clipboard!');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ToastContainer theme="dark" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('welcome')} {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-400">{t('readyForQuests')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={shareAchievement}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2"
          >
            <FaShare /> {t('share')}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
      
      {/* Level Progress */}
      <div className={`bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700 transition-all duration-500 ${
        levelUpAnimation ? 'animate-pulse border-gold-500 bg-gold-900/20' : ''
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaTrophy className="text-gold-500" />
            {t('level')}: {levelData.currentLevel}
          </h2>
          {levelUpAnimation && (
            <div className="text-gold-500 animate-bounce font-bold">
              🎉 {t('levelUp')}!
            </div>
          )}
        </div>
        
        {levelData.progressData && (
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-gold-500 to-gold-400 h-full rounded-full transition-all duration-1000 relative"
              style={{ width: `${levelData.progressData.percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between text-sm text-gray-400">
          <span>{userStats.points} {t('points')}</span>
          <span>
            {levelData.progressData ? 
              `${levelData.progressData.percentage}% ${t('tonextlevel')}` : 
              t('maxlevelreached')
            }
          </span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700 hover:border-yellow-500 transition-all duration-300">
          <FaCoins className="text-3xl text-yellow-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">{t('points')}</p>
          <p className="text-xl font-bold text-white">{userStats.points}</p>
        </div>
        
        <div className={`bg-gray-800 p-4 rounded-lg text-center border border-gray-700 transition-all duration-300 ${
          userStats.streaks >= 7 ? 'border-orange-500 bg-orange-900/20' : 'hover:border-orange-500'
        }`}>
          <FaFire className={`text-3xl mx-auto mb-2 transition-all duration-300 ${
            userStats.streaks > 0 ? 'text-orange-500' : 'text-gray-500'
          } ${userStats.streaks >= 7 ? 'animate-pulse' : ''}`} />
          <p className="text-sm text-gray-400">{t('streak')}</p>
          <p className="text-xl font-bold text-white">{userStats.streaks} {t('days')}</p>
          {userStats.streaks >= 7 && (
            <div className="text-xs text-orange-400 font-bold animate-bounce">
              🏆 {t('onFire')}!
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700 hover:border-purple-500 transition-all duration-300">
          <FaMedal className="text-3xl text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">{t('badges')}</p>
          <p className="text-xl font-bold text-white">{userStats.badges.length}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700 hover:border-green-500 transition-all duration-300">
          <FaChartLine className="text-3xl text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">{t('quests')}</p>
          <p className="text-xl font-bold text-white">{userStats.completedQuests.length}</p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMedal className="text-yellow-400" />
          {t('yourBadges')}
        </h3>
        
        {userStats.badges.length === 0 ? (
          <div className="text-center py-8">
            <FaMedal className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{t('noBadgesYet')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('completQuestsToEarn')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userStats.badges.map(badgeKey => {
              const badge = badgeDefinitions[badgeKey];
              if (!badge) return null;
              
              const IconComponent = getIconComponent(badge.iconName);
              const isNew = newBadges.includes(badgeKey);
              
              return (
                <div 
                  key={badgeKey}
                  className={`bg-gray-700 p-4 rounded-lg text-center border border-gray-600 transition-all duration-500 relative group ${
                    isNew ? 'animate-bounce border-yellow-400 bg-yellow-900/20 scale-110' : 'hover:bg-gray-650 hover:scale-105'
                  }`}
                  title={badge.description}
                >
                  <IconComponent className={`text-3xl mx-auto mb-2 ${badge.color} transition-all duration-300 ${
                    isNew ? 'animate-pulse' : ''
                  }`} />
                  <p className="text-sm font-medium text-white">{getBadgeName(badgeKey)}</p>
                  {isNew && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                      {t('new')}!
                    </div>
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                    {badge.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        
      {/* Available Badges Preview */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h4 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <FaAward className="text-gray-400" />
          {t('availableBadges')}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.keys(badgeDefinitions)
            .filter(badgeKey => !userStats.badges.includes(badgeKey))
            .slice(0, 8)
            .map(badgeKey => {
              const badge = badgeDefinitions[badgeKey];
              const IconComponent = getIconComponent(badge.iconName);
              let progress = 0;
              let progressText = '';
              let isCloseToUnlock = false;
              
              switch (badge.type) {
                case 'points':
                  progress = Math.min((userStats.points / badge.requirement) * 100, 100);
                  progressText = `${userStats.points}/${badge.requirement} ${t('pts')}`;
                  isCloseToUnlock = userStats.points >= badge.requirement * 0.8;
                  break;
                case 'streak':
                  progress = Math.min((userStats.streaks / badge.requirement) * 100, 100);
                  progressText = `${userStats.streaks}/${badge.requirement} ${t('days')}`;
                  isCloseToUnlock = userStats.streaks >= badge.requirement * 0.8;
                  break;
                default:
                  progress = 0;
                  progressText = t('completeQuestsToUnlock');
                  break;
              }
              
              return (
                <div 
                  key={badgeKey} 
                  className={`bg-gray-700/50 p-4 rounded-lg text-center border border-gray-600 relative cursor-help transition-all duration-300 group ${
                    isCloseToUnlock ? 'border-yellow-500/50 bg-yellow-900/10' : 'hover:bg-gray-700/70'
                  }`}
                  title={badge.description}
                >
                  <IconComponent className={`text-3xl mx-auto mb-2 transition-all duration-300 ${
                    isCloseToUnlock ? 'text-yellow-400' : 'text-gray-500'
                  }`} />
                  <p className="text-xs font-medium text-gray-400 mb-2">{getBadgeName(badgeKey)}</p>
                  <div className="w-full bg-gray-600 rounded-full h-1 mb-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCloseToUnlock ? 'bg-yellow-400' : 'bg-gray-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{progressText}</p>
                  
                  {isCloseToUnlock && (
                    <div className="absolute -top-1 -right-1">
                      <div className="bg-yellow-400 text-gray-900 text-xs px-1.5 py-0.5 rounded-full font-bold animate-bounce">
                        {t('soon')}!
                      </div>
                    </div>
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                    {badge.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link 
          to="/quests" 
          className="bg-gradient-to-r from-gold-600 to-gold-500 p-6 rounded-lg text-center hover:from-gold-700 hover:to-gold-600 transition-all duration-300 transform hover:scale-105 group"
        >
          <FaRocket className="text-4xl text-white mx-auto mb-3 group-hover:animate-bounce" />
          <h3 className="text-xl font-bold text-white mb-2">{t('startQuest')}</h3>
          <p className="text-gold-100">{t('exploreQuests')}</p>
        </Link>
        
        <Link 
          to="/premium" 
          className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 rounded-lg text-center hover:from-purple-700 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 group"
        >
          <FaCrown className="text-4xl text-white mx-auto mb-3 group-hover:animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">{t('goPremium')}</h3>
          <p className="text-purple-100">{t('unlockAllFeatures')}</p>
        </Link>
      </div>

      {/* Daily Motivation */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-lg border border-blue-500/30">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          {t('dailyTip')}
        </h3>
        <p className="text-gray-300">
          {t('motivationalMessage')} 💪
        </p>
      </div>
    </div>
  );
}

export default Dashboard;