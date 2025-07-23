import { Link } from 'react-router-dom';
import { FaTrophy, FaCoins, FaFire, FaChartLine, FaSignOutAlt, FaMedal, FaStar, FaCrown, FaGem, FaBolt, FaAward, FaRocket, FaMoon, FaSun, FaGamepad, FaShare, FaCalendarCheck, FaLightbulb, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function Dashboard({ t, currentLang }) {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState({
    points: 0,
    level: 'Novice',
    streaks: 0,
    badges: [],
    lastLogin: null,
    lang: 'en'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [streakChecked, setStreakChecked] = useState(false);

  // Simple level system
  const getLevelFromPoints = (points) => {
    if (points >= 1000) return 'Master';
    if (points >= 600) return 'Expert';
    if (points >= 300) return 'Advanced';
    if (points >= 150) return 'Intermediate';
    if (points >= 50) return 'Apprentice';
    return 'Novice';
  };

  // Get level progress
  const getLevelProgress = (points) => {
    const thresholds = [0, 50, 150, 300, 600, 1000];
    let currentIndex = 0;
    
    for (let i = 0; i < thresholds.length; i++) {
      if (points >= thresholds[i]) {
        currentIndex = i;
      }
    }
    
    if (currentIndex === thresholds.length - 1) {
      return { percentage: 100, current: points, total: points, isMax: true };
    }
    
    const current = points - thresholds[currentIndex];
    const total = thresholds[currentIndex + 1] - thresholds[currentIndex];
    const percentage = Math.round((current / total) * 100);
    
    return { percentage, current, total, isMax: false };
  };

  // Simple badge system
  const availableBadges = [
    { id: 'FirstSteps', name: 'First Steps', icon: FaMedal, color: 'text-yellow-500', requirement: 10, type: 'points' },
    { id: 'BudgetMaster', name: 'Budget Master', icon: FaStar, color: 'text-blue-500', requirement: 100, type: 'points' },
    { id: 'SavingsPro', name: 'Savings Pro', icon: FaCrown, color: 'text-purple-500', requirement: 300, type: 'points' },
    { id: 'StreakWarrior', name: 'Streak Warrior', icon: FaFire, color: 'text-orange-500', requirement: 7, type: 'streak' },
    { id: 'Dedicated', name: 'Dedicated', icon: FaCalendarCheck, color: 'text-green-500', requirement: 30, type: 'streak' }
  ];

  // Check which badges user has earned
  const getEarnedBadges = (points, streaks) => {
    return availableBadges.filter(badge => {
      if (badge.type === 'points') return points >= badge.requirement;
      if (badge.type === 'streak') return streaks >= badge.requirement;
      return false;
    });
  };

  // Update streak logic
  const updateStreak = async (userDoc) => {
    if (streakChecked) return;
    
    const now = new Date();
    const today = now.toDateString();
    const lastLogin = userStats.lastLogin ? new Date(userStats.lastLogin).toDateString() : null;
    
    if (lastLogin !== today) {
      let newStreak = userStats.streaks;
      
      if (lastLogin) {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
        if (lastLogin === yesterday) {
          newStreak += 1;
          toast.success(`🔥 Streak continued: ${newStreak} days!`);
        } else {
          newStreak = 1;
          if (userStats.streaks > 0) {
            toast.warning('💔 Streak broken. Starting over!');
          }
        }
      } else {
        newStreak = 1;
        toast.success('🎯 First streak started!');
      }
      
      const level = getLevelFromPoints(userStats.points);
      const earnedBadges = getEarnedBadges(userStats.points, newStreak);
      
      const newStats = {
        ...userStats,
        streaks: newStreak,
        lastLogin: now.toISOString(),
        level: level,
        badges: earnedBadges.map(b => b.id)
      };
      
      await updateDoc(userDoc, newStats);
      setUserStats(newStats);
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
        const earnedBadges = getEarnedBadges(data.points || 0, data.streaks || 0);
        
        const newStats = {
          points: data.points || 0,
          level: data.level || getLevelFromPoints(data.points || 0),
          streaks: data.streaks || 0,
          badges: data.badges || earnedBadges.map(b => b.id),
          lastLogin: data.lastLogin || null,
          lang: data.lang || currentLang
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
          lang: currentLang
        };
        await updateDoc(userDocRef, initialStats);
        setUserStats(initialStats);
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [user, currentLang, streakChecked]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Share achievement
  const shareAchievement = () => {
    const text = `🎯 I just reached level ${userStats.level} with ${userStats.points} points on FinanceQuest! 💰✨ #FinanceQuest #MoneyGoals`;
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const levelProgress = getLevelProgress(userStats.points);
  const earnedBadges = getEarnedBadges(userStats.points, userStats.streaks);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ToastContainer theme="dark" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-400">Ready for your next financial quest?</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={shareAchievement}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2"
          >
            <FaShare /> Share
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
      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaTrophy className="text-gold-500" />
            Level: {userStats.level}
          </h2>
        </div>
        
        {!levelProgress.isMax && (
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-gold-500 to-gold-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${levelProgress.percentage}%` }}
            ></div>
          </div>
        )}
        
        <div className="flex justify-between text-sm text-gray-400">
          <span>{userStats.points} points</span>
          <span>
            {levelProgress.isMax ? 'Max level reached!' : `${levelProgress.percentage}% to next level`}
          </span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
          <FaCoins className="text-3xl text-yellow-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Points</p>
          <p className="text-xl font-bold text-white">{userStats.points}</p>
        </div>
        
        <div className={`bg-gray-800 p-4 rounded-lg text-center border border-gray-700 ${
          userStats.streaks >= 7 ? 'border-orange-500 bg-orange-900/20' : ''
        }`}>
          <FaFire className={`text-3xl mx-auto mb-2 ${
            userStats.streaks > 0 ? 'text-orange-500' : 'text-gray-500'
          } ${userStats.streaks >= 7 ? 'animate-pulse' : ''}`} />
          <p className="text-sm text-gray-400">Streak</p>
          <p className="text-xl font-bold text-white">{userStats.streaks} days</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
          <FaMedal className="text-3xl text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Badges</p>
          <p className="text-xl font-bold text-white">{earnedBadges.length}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
          <FaChartLine className="text-3xl text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Quests</p>
          <p className="text-xl font-bold text-white">0</p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMedal className="text-yellow-400" />
          Your Badges
        </h3>
        
        {earnedBadges.length === 0 ? (
          <div className="text-center py-8">
            <FaMedal className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No badges yet</p>
            <p className="text-sm text-gray-500 mt-2">Complete quests to earn your first badge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {earnedBadges.map(badge => {
              const IconComponent = badge.icon;
              return (
                <div 
                  key={badge.id}
                  className="bg-gray-700 p-4 rounded-lg text-center border border-gray-600 hover:bg-gray-650 transition-all duration-300"
                  title={badge.name}
                >
                  <IconComponent className={`text-3xl mx-auto mb-2 ${badge.color}`} />
                  <p className="text-sm font-medium text-white">{badge.name}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
        
      {/* Available Badges */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h4 className="text-lg font-semibold text-gray-300 mb-4">Available Badges</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {availableBadges.filter(badge => !earnedBadges.find(earned => earned.id === badge.id)).map(badge => {
            const IconComponent = badge.icon;
            let progress = 0;
            let progressText = '';
            
            if (badge.type === 'points') {
              progress = Math.min((userStats.points / badge.requirement) * 100, 100);
              progressText = `${userStats.points}/${badge.requirement} pts`;
            } else if (badge.type === 'streak') {
              progress = Math.min((userStats.streaks / badge.requirement) * 100, 100);
              progressText = `${userStats.streaks}/${badge.requirement} days`;
            }
            
            const isCloseToUnlock = progress >= 80;
            
            return (
              <div 
                key={badge.id}
                className={`bg-gray-700/50 p-4 rounded-lg text-center border border-gray-600 transition-all duration-300 ${
                  isCloseToUnlock ? 'border-yellow-500/50 bg-yellow-900/10' : ''
                }`}
                title={badge.name}
              >
                <IconComponent className={`text-3xl mx-auto mb-2 ${
                  isCloseToUnlock ? 'text-yellow-400' : 'text-gray-500'
                }`} />
                <p className="text-xs font-medium text-gray-400 mb-2">{badge.name}</p>
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
                  <div className="text-xs text-yellow-400 font-bold mt-1">
                    Almost there!
                  </div>
                )}
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
          <h3 className="text-xl font-bold text-white mb-2">Start Quest</h3>
          <p className="text-gold-100">Explore available quests</p>
        </Link>
        
        <Link 
          to="/premium" 
          className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 rounded-lg text-center hover:from-purple-700 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 group"
        >
          <FaCrown className="text-4xl text-white mx-auto mb-3 group-hover:animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">Go Premium</h3>
          <p className="text-purple-100">Unlock all features</p>
        </Link>
      </div>

      {/* Daily Motivation */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-lg border border-blue-500/30">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          Daily Tip
        </h3>
        <p className="text-gray-300">
          Small steps today lead to big financial wins tomorrow 💪
        </p>
      </div>
    </div>
  );
}

export default Dashboard;