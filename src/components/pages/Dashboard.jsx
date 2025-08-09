import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFire, 
  FaStar, 
  FaCheckCircle,
  FaMedal,
  FaArrowRight,
  FaBolt,
  FaRocket,
  FaPlay,
  FaWallet,
  FaPiggyBank,
  FaChartLine,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCrown,
  FaLock,
  FaClock
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { 
  BsStars,
  BsLightningChargeFill,
  BsShieldFillCheck,
  BsHourglassSplit
} from 'react-icons/bs';
import { 
  GiTwoCoins,
  GiFireGem,
  GiDiamondTrophy,
  GiAchievement
} from 'react-icons/gi';
import { 
  RiVipCrownFill 
} from 'react-icons/ri';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../common/LoadingSpinner';
import AppBackground from '../common/AppBackground';
import { useLocalQuests } from '../../hooks/useLocalQuests';
import { getUserDailyChallenge } from '../../services/dailyChallenge';

// Animation de compteur fluide
const CountUp = ({ end, duration = 1000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Configuration des catégories (cohérent avec QuestList)
const categoryConfig = {
  budgeting: { 
    icon: FaWallet,
    gradient: 'from-cyan-400 via-sky-400 to-teal-400',
    neonGlow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30'
  },
  saving: { 
    icon: FaPiggyBank,
    gradient: 'from-green-400 via-lime-400 to-emerald-400',
    neonGlow: 'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
    color: 'text-green-300',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  investing: { 
    icon: FaChartLine,
    gradient: 'from-blue-400 via-indigo-400 to-purple-400',
    neonGlow: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  debt: { 
    icon: FaExclamationTriangle,
    gradient: 'from-red-400 via-rose-400 to-pink-400',
    neonGlow: 'shadow-[0_0_20px_rgba(248,113,113,0.3)]',
    color: 'text-red-300',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30'
  },
  planning: { 
    icon: FaCalendarAlt,
    gradient: 'from-amber-400 via-orange-400 to-red-400',
    neonGlow: 'shadow-[0_0_20px_rgba(251,146,60,0.3)]',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30'
  }
};

const difficultyConfig = {
  beginner: { 
    label: 'Facile', 
    color: 'text-emerald-300',
    bgStyle: 'bg-emerald-500/20 border border-emerald-500/30',
    gradient: 'from-emerald-400 to-green-400'
  },
  intermediate: { 
    label: 'Moyen', 
    color: 'text-amber-300',
    bgStyle: 'bg-amber-500/20 border border-amber-500/30',
    gradient: 'from-amber-400 to-orange-400'
  },
  advanced: { 
    label: 'Difficile', 
    color: 'text-red-300',
    bgStyle: 'bg-red-500/20 border border-red-500/30',
    gradient: 'from-red-400 to-rose-400'
  }
};

// Main DashboardPage Component
const DashboardPage = () => {
  const { user } = useAuth();
  const { t, currentLang } = useLanguage();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [recentQuests, setRecentQuests] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [activeQuest, setActiveQuest] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  
  const { 
    quests, 
    loading: questsLoading, 
    getRecommendedQuestsForUser
  } = useLocalQuests();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, currentLang]);

  useEffect(() => {
    // Timer pour le défi quotidien
    const calculateTime = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft({ hours, minutes });
    };
    
    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
      }
      
      await Promise.all([
        fetchRecentActivity(),
        fetchDailyChallenge()
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const recentQuery = query(
        collection(db, 'userQuests'),
        where('userId', '==', user.uid),
        limit(10)
      );
      
      const snapshot = await getDocs(recentQuery);
      const activities = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(activity => activity.status === 'active' || activity.status === 'completed')
        .slice(0, 3);
      
      setRecentQuests(activities);
      
      const active = activities.find(a => a.status === 'active');
      if (active) {
        setActiveQuest(active);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentQuests([]);
    }
  };

  const fetchDailyChallenge = async () => {
    try {
      const challenge = await getUserDailyChallenge(user.uid);
      setDailyChallenge(challenge);
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
    }
  };

  const calculateLevel = (points) => Math.floor(points / 1000) + 1;

  if (loading) {
    return (
      <AppBackground variant="nebula" grain grid={false} animate>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppBackground>
    );
  }

  const userPoints = userData?.points || 0;
  const userLevel = calculateLevel(userPoints);
  const streakDays = userData?.streaks || userData?.currentStreak || 0;
  const completedQuests = userData?.completedQuests || 0;
  const recommendations = !questsLoading ? getRecommendedQuestsForUser([], userLevel).slice(0, 6) : [];
  const displayName = userData?.displayName || user?.email?.split('@')[0];
  const avatarLetter = userData?.displayName?.[0] || user?.email?.[0]?.toUpperCase();
  const isPremium = userData?.isPremium || false;
  
  // Calculs pour la progression
  const xpInLevel = userPoints % 1000;
  const xpToNext = 1000 - xpInLevel;
  const progress = (xpInLevel / 1000) * 100;
  
  // Titre de niveau
  const getLevelTitle = () => {
    if (userLevel >= 50) return { text: 'Maître Financier', emoji: '👑', color: 'text-purple-400' };
    if (userLevel >= 25) return { text: 'Expert Confirmé', emoji: '💎', color: 'text-blue-400' };
    if (userLevel >= 10) return { text: 'Apprenti Avancé', emoji: '⭐', color: 'text-yellow-400' };
    if (userLevel >= 5) return { text: 'Novice Ambitieux', emoji: '🚀', color: 'text-green-400' };
    return { text: 'Débutant Motivé', emoji: '🌱', color: 'text-gray-400' };
  };
  
  const levelTitle = getLevelTitle();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <AppBackground variant="nebula" grain grid={false} animate>
      <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]">
        <div className="px-4 sm:px-6 pt-8 sm:pt-10">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {/* Greeting et Avatar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {/* Avatar avec effets premium */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-50"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-glow-md">
                      <span className="text-2xl font-black text-gray-900">
                        {avatarLetter}
                      </span>
                      {isPremium && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-glow-purple"
                        >
                          <FaCrown className="text-white text-xs" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                  
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                      {greeting}, {displayName}
                      {userLevel >= 20 && (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <HiSparkles className="text-yellow-400 text-xl" />
                        </motion.div>
                      )}
                    </h1>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`text-sm font-bold ${levelTitle.color} flex items-center gap-1`}>
                        <span className="text-lg">{levelTitle.emoji}</span>
                        {levelTitle.text}
                      </span>
                      {streakDays >= 3 && (
                        <motion.span
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <FaFire className="text-orange-400 text-xs" />
                          <span className="text-xs font-bold text-orange-400">{streakDays} jours</span>
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="hidden sm:flex items-center gap-3">
                  <Link
                    to="/quests"
                    className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-white font-semibold text-sm transition-all"
                  >
                    Voir les quêtes
                  </Link>
                  {!isPremium && (
                    <Link
                      to="/premium"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 font-semibold text-sm transition-all flex items-center gap-2"
                    >
                      <FaCrown className="text-xs" />
                      Premium
                    </Link>
                  )}
                </div>
              </div>

              {/* Stats Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* XP Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="neon-element rounded-2xl p-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 opacity-50" />
                  <div className="relative">
                    <GiTwoCoins className="text-yellow-400 text-2xl mb-2" />
                    <div className="text-2xl font-black text-white">
                      <CountUp end={userPoints} />
                    </div>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      XP Total
                    </div>
                  </div>
                </motion.div>

                {/* Niveau Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="neon-element rounded-2xl p-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/5 opacity-50" />
                  <div className="relative">
                    <FaStar className="text-purple-400 text-2xl mb-2" />
                    <div className="text-2xl font-black text-white">
                      {userLevel}
                    </div>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Niveau
                    </div>
                  </div>
                </motion.div>

                {/* Streak Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="neon-element rounded-2xl p-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/5 opacity-50" />
                  <div className="relative">
                    <FaFire className="text-orange-400 text-2xl mb-2" />
                    <div className="text-2xl font-black text-white">
                      {streakDays}
                    </div>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Série
                    </div>
                  </div>
                </motion.div>

                {/* Quêtes Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="neon-element rounded-2xl p-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5 opacity-50" />
                  <div className="relative">
                    <FaCheckCircle className="text-emerald-400 text-2xl mb-2" />
                    <div className="text-2xl font-black text-white">
                      <CountUp end={completedQuests} />
                    </div>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Terminées
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Progression du niveau */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="neon-element rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BsLightningChargeFill className="text-amber-400" />
                  Progression
                </h2>
                <span className="text-sm text-gray-400">
                  Niveau {userLevel} → {userLevel + 1}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <GiTwoCoins className="text-yellow-400 text-xs" />
                    {xpInLevel} / 1000 XP
                  </span>
                  <span className="font-bold text-amber-400">
                    {Math.round(progress)}%
                  </span>
                </div>
                
                <div className="relative h-3 bg-gray-800/60 rounded-full overflow-hidden border border-gray-700/50">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                    style={{
                      boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)'
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                </div>
                
                <div className="text-xs text-center text-gray-500">
                  Plus que <span className="font-bold text-amber-400">{xpToNext} XP</span> pour le niveau suivant
                </div>
              </div>
            </motion.div>

            {/* Daily Challenge */}
            {dailyChallenge && !dailyChallenge?.completed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/quests/${dailyChallenge.questId}`)}
                className="relative neon-element rounded-2xl p-6 mb-8 cursor-pointer overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 opacity-30"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/40 flex items-center justify-center"
                      animate={{ 
                        rotate: [0, -5, 5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FaBolt className="text-amber-400 text-2xl" />
                    </motion.div>
                    
                    <div>
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        Défi Quotidien
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-[10px] font-black text-white uppercase">
                          NEW
                        </span>
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-300 flex items-center gap-1">
                          <GiTwoCoins className="text-yellow-400" />
                          +{dailyChallenge?.rewards?.xp || 100} XP bonus
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <BsHourglassSplit />
                          {timeLeft.hours}h {timeLeft.minutes}min
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FaPlay className="text-amber-400 ml-0.5" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Active Quest ou CTA */}
            {activeQuest ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/quests/${activeQuest.questId}`)}
                className="neon-element rounded-2xl p-6 mb-8 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                      Quête en cours
                    </p>
                    <h3 className="text-white font-bold text-lg">
                      {activeQuest.questTitle || 'Quête sans titre'}
                    </h3>
                  </div>
                  <div className="text-2xl font-black text-cyan-400">
                    {activeQuest.progress || 0}%
                  </div>
                </div>
                
                <div className="relative h-3 bg-gray-800/60 rounded-full overflow-hidden border border-gray-700/50">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${activeQuest.progress || 0}%` }}
                    transition={{ duration: 0.8 }}
                    style={{
                      boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)'
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="neon-element rounded-2xl p-8 mb-8 text-center"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <FaRocket className="text-5xl text-gray-600 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Prêt pour l'aventure ?
                </h3>
                <p className="text-gray-400 mb-6">
                  Commence ta première quête financière
                </p>
                <Link
                  to="/quests"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 rounded-full font-bold shadow-glow-md hover:shadow-glow-lg transform hover:scale-105 transition-all"
                >
                  <FaPlay />
                  Explorer les Quêtes
                </Link>
              </motion.div>
            )}

            {/* Quêtes Recommandées */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <HiSparkles className="text-yellow-400" />
                  Recommandé pour toi
                </h2>
                <Link 
                  to="/quests" 
                  className="text-amber-400 text-sm font-bold hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  Tout voir
                  <FaArrowRight className="text-xs" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.slice(0, 3).map((quest, index) => {
                  const category = categoryConfig[quest.category] || categoryConfig.planning;
                  const difficulty = difficultyConfig[quest.difficulty] || difficultyConfig.beginner;
                  
                  return (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/quests/${quest.id}`)}
                      className="neon-element rounded-2xl p-5 cursor-pointer relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${category.bgColor} border ${category.borderColor}`}>
                            <category.icon className={`text-lg ${category.color}`} />
                          </div>
                          
                          {quest.isPremium && !isPremium ? (
                            <div className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center gap-1">
                              <FaCrown className="text-purple-300 text-[10px]" />
                              <span className="text-[10px] font-black text-purple-300">PRO</span>
                            </div>
                          ) : (
                            <div className={`px-2 py-0.5 rounded-full ${difficulty.bgStyle}`}>
                              <span className={`text-[10px] font-black ${difficulty.color} uppercase`}>
                                {difficulty.label}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-white font-bold text-base mb-2 line-clamp-2">
                          {quest.title}
                        </h3>
                        
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {quest.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <FaClock className="text-cyan-400" />
                              {quest.duration}min
                            </span>
                            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                              <GiTwoCoins />
                              +{quest.xp}
                            </span>
                          </div>
                          
                          <motion.div
                            className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center"
                            whileHover={{ scale: 1.1 }}
                          >
                            {quest.isPremium && !isPremium ? (
                              <FaLock className="text-amber-400 text-xs" />
                            ) : (
                              <FaPlay className="text-amber-400 text-xs ml-0.5" />
                            )}
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppBackground>
  );
};

export default DashboardPage;