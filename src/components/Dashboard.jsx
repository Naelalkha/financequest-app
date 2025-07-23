import { Link } from 'react-router-dom';
import { FaTrophy, FaCoins, FaFire, FaChartLine, FaSignOutAlt, FaMedal, FaStar, FaCrown, FaGem, FaBolt, FaShield, FaRocket } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Dashboard({ t }) {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState({
    points: 0,
    level: 'Novice',
    streaks: 0,
    badges: [],
    lastLogin: null
  });
  const [newBadges, setNewBadges] = useState([]);
  const [streakChecked, setStreakChecked] = useState(false);

  // Level system with thresholds
  const levelThresholds = {
    0: 'Novice',
    100: 'Intermediate', 
    300: 'Expert',
    600: 'Master'
  };

  // Badge definitions with icons and requirements
  const badgeDefinitions = {
    'FirstSteps': { icon: FaMedal, name: 'First Steps', requirement: 10, color: 'text-bronze' },
    'BudgetMaster': { icon: FaStar, name: 'Budget Master', requirement: 100, color: 'text-yellow-500' },
    'SavingsPro': { icon: FaCrown, name: 'Savings Pro', requirement: 300, color: 'text-purple-500' },
    'InvestmentGuru': { icon: FaGem, name: 'Investment Guru', requirement: 600, color: 'text-blue-500' },
    'StreakWarrior': { icon: FaBolt, name: 'Streak Warrior', requirement: 7, type: 'streak', color: 'text-orange-500' },
    'Dedicated': { icon: FaShield, name: 'Dedicated', requirement: 30, type: 'streak', color: 'text-green-500' },
    'Legendary': { icon: FaRocket, name: 'Legendary', requirement: 1000, color: 'text-red-500' }
  };

  // Get current level based on points
  const getCurrentLevel = (points) => {
    const thresholds = Object.keys(levelThresholds).map(Number).sort((a, b) => b - a);
    for (const threshold of thresholds) {
      if (points >= threshold) {
        return levelThresholds[threshold];
      }
    }
    return 'Novice';
  };

  // Get progress to next level
  const getProgressToNextLevel = (points) => {
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
  };

  // Check for new badges
  const checkForNewBadges = (points, streaks, currentBadges) => {
    const earnedBadges = [];
    
    Object.keys(badgeDefinitions).forEach(badgeKey => {
      const badge = badgeDefinitions[badgeKey];
      if (!currentBadges.includes(badgeKey)) {
        if (badge.type === 'streak' && streaks >= badge.requirement) {
          earnedBadges.push(badgeKey);
        } else if (!badge.type && points >= badge.requirement) {
          earnedBadges.push(badgeKey);
        }
      }
    });

    return earnedBadges;
  };

  // Check daily streak
  const checkDailyStreak = async (lastLogin) => {
    if (streakChecked) return;
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (!lastLogin) {
      // First time login
      await updateDoc(doc(db, 'users', user.uid), {
        streaks: 1,
        lastLogin: today
      });
      setStreakChecked(true);
      return;
    }

    const lastLoginDate = new Date(lastLogin).toDateString();
    
    if (lastLoginDate === today) {
      // Already logged in today
      setStreakChecked(true);
      return;
    }
    
    if (lastLoginDate === yesterday) {
      // Consecutive day - increment streak
      const newStreak = userStats.streaks + 1;
      await updateDoc(doc(db, 'users', user.uid), {
        streaks: newStreak,
        lastLogin: today
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
    } else {
      // Streak broken - reset to 1
      await updateDoc(doc(db, 'users', user.uid), {
        streaks: 1,
        lastLogin: today
      });
    }
    
    setStreakChecked(true);
  };

  useEffect(() => {
    if (!user) return;

    // Real-time listener for user data
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const points = userData.points || 0;
        const streaks = userData.streaks || 0;
        const badges = userData.badges || [];
        const lastLogin = userData.lastLogin;
        
        const currentLevel = getCurrentLevel(points);
        
        setUserStats({
          points,
          level: currentLevel,
          streaks,
          badges,
          lastLogin
        });

        // Check for new badges
        const earnedBadges = checkForNewBadges(points, streaks, badges);
        if (earnedBadges.length > 0) {
          setNewBadges(earnedBadges);
          // Update user badges in Firestore
          updateDoc(doc(db, 'users', user.uid), {
            badges: [...badges, ...earnedBadges]
          });
          
          // Show toast for new badges
          earnedBadges.forEach(badgeKey => {
            const badge = badgeDefinitions[badgeKey];
            toast.success(`🏆 New Badge Unlocked: ${badge.name}!`, {
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
  }, [user, streakChecked]);

  const progressData = getProgressToNextLevel(userStats.points);

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
            <h2 className="text-2xl font-bold text-white">{userStats.level}</h2>
            <p className="text-gray-400">{userStats.points} points</p>
          </div>
          <FaTrophy className="text-4xl text-yellow-400" />
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{progressData.current} pts</span>
            {!progressData.isMax && <span>{progressData.next} pts</span>}
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
          <p className="text-sm text-gray-400">Streak</p>
          <p className="text-xl font-bold text-white">{userStats.streaks} days</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700 col-span-2 md:col-span-1">
          <FaMedal className="text-3xl text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Badges</p>
          <p className="text-xl font-bold text-white">{userStats.badges.length}</p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMedal className="text-yellow-400" />
          Your Badges
        </h3>
        
        {userStats.badges.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No badges earned yet. Complete quests to unlock badges!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userStats.badges.map(badgeKey => {
              const badge = badgeDefinitions[badgeKey];
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
                  <p className="text-sm font-medium text-white">{badge.name}</p>
                  {isNew && (
                    <p className="text-xs text-yellow-400 mt-1 font-bold">NEW!</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Available Badges Preview */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-lg font-semibold text-gray-300 mb-3">Available Badges</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(badgeDefinitions)
              .filter(badgeKey => !userStats.badges.includes(badgeKey))
              .slice(0, 4)
              .map(badgeKey => {
                const badge = badgeDefinitions[badgeKey];
                const IconComponent = badge.icon;
                const progress = badge.type === 'streak' 
                  ? Math.min((userStats.streaks / badge.requirement) * 100, 100)
                  : Math.min((userStats.points / badge.requirement) * 100, 100);
                
                return (
                  <div key={badgeKey} className="bg-gray-700/50 p-4 rounded-lg text-center border border-gray-600">
                    <IconComponent className="text-3xl mx-auto mb-2 text-gray-500" />
                    <p className="text-xs font-medium text-gray-400">{badge.name}</p>
                    <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {badge.type === 'streak' 
                        ? `${userStats.streaks}/${badge.requirement} days`
                        : `${userStats.points}/${badge.requirement} pts`
                      }
                    </p>
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
          <h3 className="text-xl font-bold">Continue Learning</h3>
          <p className="text-sm opacity-90">Explore finance quests</p>
        </Link>
        
        <Link 
          to="/premium" 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-6 rounded-lg text-center transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <FaCrown className="text-3xl mx-auto mb-2" />
          <h3 className="text-xl font-bold">Go Premium</h3>
          <p className="text-sm opacity-90">Unlock all features</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;