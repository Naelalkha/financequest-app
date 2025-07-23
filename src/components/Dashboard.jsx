import { Link } from 'react-router-dom';
import { FaTrophy, FaCoins, FaFire, FaChartLine, FaSignOutAlt, FaMedal, FaStar, FaCrown, FaGem, FaBolt, FaAward, FaRocket, FaMoon, FaSun, FaGamepad, FaTachometerAlt, FaShare } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function Dashboard({ t }) {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState({
    points: 0,
    level: 'Novice',
    streaks: 0,
    badges: [],
    lastLogin: null,
    lang: 'en'
  });
  const [newBadges, setNewBadges] = useState([]);
  const [streakChecked, setStreakChecked] = useState(false);
  const [showTooltip, setShowTooltip] = useState({});

  // Level system with thresholds
  const levelThresholds = {
    0: 'Novice',
    100: 'Intermediate', 
    300: 'Expert',
    600: 'Master'
  };

  // Enhanced badge definitions with valid react-icons
  const badgeDefinitions = {
    'FirstSteps': { icon: FaMedal, requirement: 10, color: 'text-yellow-600', type: 'points' },
    'BudgetMaster': { icon: FaStar, requirement: 100, color: 'text-yellow-500', type: 'points' },
    'SavingsPro': { icon: FaCrown, requirement: 300, color: 'text-purple-500', type: 'points' },
    'InvestmentGuru': { icon: FaGem, requirement: 600, color: 'text-blue-500', type: 'points' },
    'Legendary': { icon: FaRocket, requirement: 1000, color: 'text-red-500', type: 'points' },
    'StreakWarrior': { icon: FaBolt, requirement: 7, type: 'streak', color: 'text-orange-500' },
    'Dedicated': { icon: FaAward, requirement: 30, type: 'streak', color: 'text-green-500' },
    'NightOwl': { icon: FaMoon, requirement: 22, type: 'time', color: 'text-indigo-500' },
    'EarlyBird': { icon: FaSun, requirement: 6, type: 'time', color: 'text-yellow-400' },
    'WeekendWarrior': { icon: FaGamepad, requirement: 1, type: 'weekend', color: 'text-pink-500' },
    'Perfectionist': { icon: FaTrophy, requirement: 5, type: 'perfect', color: 'text-emerald-500' },
    'SpeedRunner': { icon: FaTachometerAlt, requirement: 3, type: 'speed', color: 'text-cyan-500' },
    'SocialSharer': { icon: FaShare, requirement: 1, type: 'share', color: 'text-rose-500' }
  };

  // Get current level based on points (with auto-update)
  const getCurrentLevel = (points) => {
    const thresholds = Object.keys(levelThresholds).map(Number).sort((a, b) => b - a);
    for (const threshold of thresholds) {
      if (points >= threshold) {
        return levelThresholds[threshold];
      }
    }
    return 'Novice';
  };

  // Get progress to next level (memoized for performance)
  const progressData = useMemo(() => {
    const points = userStats.points;
    const thresholds = Object.keys(levelThresholds).map(Number).sort((a, b) => a - b);
    let currentThreshold = 0;
    let nextThreshold = thresholds[1];

    for (let i = 0; i < thresholds.length - 1; i++) {
      if (points >= thresholds[i] && points < thresholds[i + 1]) {
        currentThreshold = thresholds[i];
        nextThreshold = thresholds[i + 1];
        break;
      }
    }

    if (points >= thresholds[thresholds.length - 1]) {
      return { percentage: 100, current: points, next: thresholds[thresholds.length - 1], isMax: true };
    }

    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return { percentage: Math.round(progress), current: currentThreshold, next: nextThreshold, isMax: false };
  }, [userStats.points]);

  // Enhanced badge checking with new badge types
  const checkForNewBadges = (points, streaks, currentBadges, loginTime) => {
    const earnedBadges = [];
    const currentHour = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());
    
    Object.keys(badgeDefinitions).forEach(badgeKey => {
      const badge = badgeDefinitions[badgeKey];
      if (!currentBadges.includes(badgeKey)) {
        switch (badge.type) {
          case 'points':
            if (points >= badge.requirement) earnedBadges.push(badgeKey);
            break;
          case 'streak':
            if (streaks >= badge.requirement) earnedBadges.push(badgeKey);
            break;
          case 'time':
            if (badgeKey === 'NightOwl' && currentHour >= badge.requirement) {
              earnedBadges.push(badgeKey);
            } else if (badgeKey === 'EarlyBird' && currentHour <= badge.requirement) {
              earnedBadges.push(badgeKey);
            }
            break;
          case 'weekend':
            if (isWeekend) earnedBadges.push(badgeKey);
            break;
          // Note: 'perfect', 'speed', 'share' badges would be awarded in quest completion logic
          default:
            break;
        }
      }
    });

    return earnedBadges;
  };

  // Enhanced daily streak logic with proper reset
  const checkDailyStreak = async (lastLogin) => {
    if (streakChecked) return;
    
    const today = new Date();
    const todayDateString = today.toDateString();
    
    if (!lastLogin) {
      // First time login
      await updateDoc(doc(db, 'users', user.uid), {
        streaks: 1,
        lastLogin: todayDateString
      });
      setStreakChecked(true);
      return;
    }

    const lastLoginDate = new Date(lastLogin);
    const lastLoginDateString = lastLoginDate.toDateString();
    
    if (lastLoginDateString === todayDateString) {
      // Already logged in today
      setStreakChecked(true);
      return;
    }
    
    // Calculate difference in days
    const diffTime = today.getTime() - lastLoginDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day - increment streak
      const newStreak = userStats.streaks + 1;
      await updateDoc(doc(db, 'users', user.uid), {
        streaks: newStreak,
        lastLogin: todayDateString
      });
      
      if (newStreak > 3) {
        toast.success(`🔥 Amazing! ${newStreak} day streak!`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } else if (diffDays > 1) {
      // Streak broken - reset to 0 (not 1 for true interruption)
      await updateDoc(doc(db, 'users', user.uid), {
        streaks: 0,
        lastLogin: todayDateString
      });
      
      if (userStats.streaks > 0) {
        toast.warn(`💔 Streak broken! Start fresh tomorrow`, {
          position: "top-center",
          autoClose: 3000,
        });
      }
    }
    
    setStreakChecked(true);
  };

  // Get badge name with language support
  const getBadgeName = (badgeKey) => {
    return t(`badges.${badgeKey}`) || badgeKey;
  };

  useEffect(() => {
    if (!user) return;

    // Real-time listener for user data
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const points = userData.points || 0;
        const streaks = userData.streaks || 0;
        const badges = userData.badges || [];
        const lastLogin = userData.lastLogin;
        const userLang = userData.lang || 'en';
        
        const currentLevel = getCurrentLevel(points);
        
        setUserStats({
          points,
          level: currentLevel,
          streaks,
          badges,
          lastLogin,
          lang: userLang
        });

        // Auto-update level in Firestore if changed
        if (currentLevel !== userData.level) {
          await updateDoc(doc(db, 'users', user.uid), {
            level: currentLevel
          });
        }

        // Check for new badges
        const earnedBadges = checkForNewBadges(points, streaks, badges, lastLogin);
        if (earnedBadges.length > 0) {
          setNewBadges(earnedBadges);
          // Update user badges in Firestore
          await updateDoc(doc(db, 'users', user.uid), {
            badges: [...badges, ...earnedBadges]
          });
          
          // Show toast for new badges
          earnedBadges.forEach(badgeKey => {
            const badgeName = getBadgeName(badgeKey);
            toast.success(`🏆 New Badge Unlocked: ${badgeName}!`, {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          });
        }

        // Check daily streak (only once per session)
        if (!streakChecked) {
          checkDailyStreak(lastLogin);
        }
      }
    });

    return () => unsubscribe();
  }, [user, streakChecked, userStats.streaks]);

  // Tooltip handlers
  const handleTooltipShow = (badgeKey) => {
    setShowTooltip(prev => ({ ...prev, [badgeKey]: true }));
  };

  const handleTooltipHide = (badgeKey) => {
    setShowTooltip(prev => ({ ...prev, [badgeKey]: false }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-yellow-400">
          {t('dashboard')}
        </h1>
        <button 
          onClick={logout} 
          className="text-yellow-400 hover:text-yellow-300 flex items-center gap-2 transition-colors"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
      
      {/* Level & Progress Section */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{t(userStats.level.toLowerCase()) || userStats.level}</h2>
            <p className="text-gray-400">{userStats.points} {t('points')}</p>
          </div>
          <FaTrophy className="text-4xl text-yellow-400" />
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{progressData.current} {t('pts') || 'pts'}</span>
            {!progressData.isMax && <span>{progressData.next} {t('pts') || 'pts'}</span>}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressData.percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {progressData.isMax ? 'Max Level Reached!' : `${progressData.percentage}% to next level`}
          </p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
          <FaCoins className="text-3xl text-yellow-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">{t('points')}</p>
          <p className="text-xl font-bold text-white">{userStats.points}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
          <FaFire className={`text-3xl mx-auto mb-2 ${userStats.streaks > 0 ? 'text-orange-500' : 'text-gray-500'}`} />
          <p className="text-sm text-gray-400">{t('streak') || 'Streak'}</p>
          <p className="text-xl font-bold text-white">{userStats.streaks} {t('days') || 'days'}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700 col-span-2 md:col-span-1">
          <FaMedal className="text-3xl text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">{t('badges') || 'Badges'}</p>
          <p className="text-xl font-bold text-white">{userStats.badges.length}</p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMedal className="text-yellow-400" />
          {t('yourBadges') || 'Your Badges'}
        </h3>
        
        {userStats.badges.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No badges earned yet. Complete quests to unlock badges!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userStats.badges.map(badgeKey => {
              const badge = badgeDefinitions[badgeKey];
              if (!badge) return null;
              const IconComponent = badge.icon;
              const isNew = newBadges.includes(badgeKey);
              
              return (
                <div 
                  key={badgeKey}
                  className={`bg-gray-700 p-4 rounded-lg text-center border border-gray-600 transition-all duration-300 ${
                    isNew ? 'animate-bounce border-yellow-400 bg-yellow-900/20' : 'hover:bg-gray-650'
                  }`}
                >
                  <IconComponent className={`text-3xl mx-auto mb-2 ${badge.color}`} />
                  <p className="text-sm font-medium text-white">{getBadgeName(badgeKey)}</p>
                  {isNew && (
                    <p className="text-xs text-yellow-400 mt-1 font-bold">{t('new') || 'NEW!'}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Available Badges Preview with Tooltips */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-lg font-semibold text-gray-300 mb-3">{t('availableBadges') || 'Available Badges'}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(badgeDefinitions)
              .filter(badgeKey => !userStats.badges.includes(badgeKey))
              .slice(0, 8)
              .map(badgeKey => {
                const badge = badgeDefinitions[badgeKey];
                const IconComponent = badge.icon;
                let progress = 0;
                let progressText = '';
                
                switch (badge.type) {
                  case 'points':
                    progress = Math.min((userStats.points / badge.requirement) * 100, 100);
                    progressText = `${userStats.points}/${badge.requirement} ${t('pts') || 'pts'}`;
                    break;
                  case 'streak':
                    progress = Math.min((userStats.streaks / badge.requirement) * 100, 100);
                    progressText = `${userStats.streaks}/${badge.requirement} ${t('days') || 'days'}`;
                    break;
                  default:
                    progress = 0;
                    progressText = 'Complete quests to unlock';
                    break;
                }
                
                return (
                  <div 
                    key={badgeKey} 
                    className="bg-gray-700/50 p-4 rounded-lg text-center border border-gray-600 relative cursor-help"
                    onMouseEnter={() => handleTooltipShow(badgeKey)}
                    onMouseLeave={() => handleTooltipHide(badgeKey)}
                  >
                    <IconComponent className="text-3xl mx-auto mb-2 text-gray-500" />
                    <p className="text-xs font-medium text-gray-400">{getBadgeName(badgeKey)}</p>
                    <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{progressText}</p>
                    
                    {/* Tooltip */}
                    {showTooltip[badgeKey] && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10 border border-gray-600">
                        Complete quests to unlock
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          to="/quests" 
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white p-6 rounded-lg text-center transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <FaChartLine className="text-3xl mx-auto mb-2" />
          <h3 className="text-xl font-bold">{t('continuelearning') || 'Continue Learning'}</h3>
          <p className="text-sm opacity-90">{t('explorequests') || 'Explore finance quests'}</p>
        </Link>
        
        <Link 
          to="/premium" 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-6 rounded-lg text-center transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <FaCrown className="text-3xl mx-auto mb-2" />
          <h3 className="text-xl font-bold">{t('gopremium') || 'Go Premium'}</h3>
          <p className="text-sm opacity-90">{t('unlockfeatures') || 'Unlock all features'}</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;