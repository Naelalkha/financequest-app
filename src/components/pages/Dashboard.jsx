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
  FaClock,
  FaRedoAlt,
  FaTrophy
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
import { doc, getDoc, collection, query, where, limit, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../common/LoadingSpinner';
import AppBackground from '../common/AppBackground';
import { useLocalQuests } from '../../hooks/useLocalQuests';
import { getUserDailyChallenge, generateDailyChallenge } from '../../services/dailyChallenge';

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
    textColor: 'text-emerald-300',
    gradient: 'from-emerald-400 to-green-400'
  },
  intermediate: { 
    label: 'Moyen', 
    color: 'text-amber-300',
    bgStyle: 'bg-amber-500/20 border border-amber-500/30',
    textColor: 'text-amber-300',
    gradient: 'from-amber-400 to-orange-400'
  },
  advanced: { 
    label: 'Difficile', 
    color: 'text-red-300',
    bgStyle: 'bg-red-500/20 border border-red-500/30',
    textColor: 'text-red-300',
    gradient: 'from-red-400 to-rose-400'
  }
};

// Component de carte de quête unifié avec QuestList
const QuestCard = ({ quest, userProgress, isPremium, onNavigate, hoveredQuest, setHoveredQuest }) => {
  const progress = userProgress[quest.id];
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'active';
  const isLocked = quest.isPremium && !isPremium;
  const category = categoryConfig[quest.category] || categoryConfig.planning;
  const difficulty = difficultyConfig[quest.difficulty] || difficultyConfig.beginner;

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      onMouseEnter={() => setHoveredQuest(quest.id)}
      onMouseLeave={() => setHoveredQuest(null)}
      className="group relative w-full"
    >
      <div
        className="relative rounded-2xl overflow-hidden w-full focus-visible-ring cursor-pointer"
        role="link"
        tabIndex={0}
        onClick={() => onNavigate(`/quests/${quest.id}`)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(`/quests/${quest.id}`); } }}
        aria-label={`Ouvrir la quête ${quest.title}`}
      >
        {/* Gradient overlay animé au hover */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 rounded-2xl blur-lg opacity-0`}
          animate={{ opacity: hoveredQuest === quest.id ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        <div 
          className={`
            relative neon-element rounded-2xl p-4 sm:p-5 lg:p-6 backdrop-blur-sm shadow
            ${hoveredQuest === quest.id ? `border-white/30 shadow-2xl ${category.neonGlow}` : ''}
            transition-all duration-500
          `}
          style={{
            background: quest.category === 'budgeting'
              ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(13, 148, 136, 0.08) 100%)'
              : quest.category === 'saving'
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(101, 163, 13, 0.08) 100%)'
                : quest.category === 'investing'
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.08) 100%)'
                  : quest.category === 'debt'
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(244, 63, 94, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.08) 100%)',
          }}
        >
          {/* Accent succès discret en top stripe si terminé */}
          {isCompleted && (
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
          )}
          
          {/* Shine effect */}
          {hoveredQuest === quest.id && (
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.7) 50%, transparent 60%)',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.8 }}
            />
          )}

          <div className="relative z-10">
            {/* Header avec icône de catégorie */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Icône de catégorie */}
                  <div className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
                    ${category.bgColor} border ${category.borderColor}
                  `}>
                    <category.icon className={`text-sm sm:text-lg ${category.color}`} />
                  </div>
                  
                  {/* Badges */}
                  {quest.isNew && !isCompleted && (
                    <div 
                      className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-[11px] sm:text-[12px] font-extrabold text-cyan-300 relative overflow-hidden uppercase tracking-wider"
                      style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: '0.05em' }}
                    >
                      NEW
                    </div>
                  )}

                  {quest.isPremium && !isPremium && (
                    <div
                      className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-purple-500/40 text-[11px] sm:text-[12px] font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <FaCrown className="text-[10px]" />
                      PRO
                    </div>
                  )}

                  {/* Badge de difficulté */}
                  <div 
                    className={`
                      ${quest.isNew && (quest.isPremium && !isPremium) ? 'hidden sm:inline-flex' : 'inline-flex'}
                      px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider
                      ${difficulty.bgStyle} ${difficulty.textColor}
                    `}
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: '0.05em' }}
                  >
                    {difficulty.label}
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <>
                      <FaCheckCircle className="text-emerald-300 text-[14px] sm:hidden" />
                      <div 
                        className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[12px] font-extrabold text-emerald-300 items-center gap-1 uppercase tracking-wider"
                        style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, letterSpacing: '0.05em' }}
                      >
                        <FaCheckCircle className="text-[12px]" />
                        Terminé
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Titre et description */}
              <h3 
                className="text-white font-extrabold text-[17px] sm:text-xl lg:text-2xl mb-2 line-clamp-2 leading-snug group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300"
                style={{ 
                  fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                  fontWeight: 800,
                  letterSpacing: '-0.02em'
                }}
              >
                {quest.title}
              </h3>
              
              <p 
                className="text-gray-200 text-[13px] sm:text-sm line-clamp-2 leading-relaxed"
                style={{ 
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 400,
                  letterSpacing: '0.005em',
                  lineHeight: '1.5'
                }}
              >
                {quest.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-1.5">
                <FaClock className="text-cyan-400 text-sm" />
                <span 
                  className="font-extrabold text-sm text-gray-300"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                >
                  {quest.duration}min
                </span>
              </div>
              
              <div className="w-px h-4 bg-white/10" />
              
              <div className="flex items-center gap-1.5">
                <GiTwoCoins className="text-yellow-400 text-sm" />
                <span 
                  className="font-extrabold text-yellow-300 text-sm"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                >
                  +{quest.xp}
                </span>
              </div>
              
              {isInProgress && (
                <>
                  <div className="w-px h-3 bg-white/10" />
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.progress || 0}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-300">
                      {Math.round(progress.progress || 0)}%
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* CTA Button */}
            <motion.button
              className={`
                group relative overflow-hidden w-full sm:w-auto sm:min-w-[170px] min-h-12 py-3 px-5
                rounded-[28px] font-bold text-[16px] tracking-tight font-sans
                transition-all flex items-center justify-center gap-2
                ${isLocked
                  ? 'bg-gray-800/70 text-white/70 border border-white/10 backdrop-blur-xs cursor-not-allowed'
                  : isCompleted
                    ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white border border-white/10 hover:from-gray-700 hover:to-gray-600'
                    : isInProgress
                      ? 'text-gray-900 bg-gradient-to-r from-amber-300/90 via-amber-400/90 to-rose-300/90 backdrop-blur-xs border border-amber-300/40 shadow-[0_10px_25px_rgba(251,191,36,0.25),0_6px_12px_rgba(0,0,0,0.35)] hover:shadow-[0_14px_32px_rgba(251,191,36,0.35),0_8px_18px_rgba(0,0,0,0.4)]'
                      : 'text-gray-900 bg-gradient-to-r from-amber-400/90 via-yellow-400/90 to-emerald-500/90 backdrop-blur-xs border border-amber-200/30 shadow-glow-md hover:shadow-glow-lg'
                }
              `}
              whileHover={{
                scale: isLocked ? 1 : 1.02,
                y: isLocked ? 0 : -1,
                transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
              }}
              whileTap={{
                scale: isLocked ? 1 : 0.98,
                transition: { duration: 0.1 }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isLocked) onNavigate(`/quests/${quest.id}`);
              }}
            >
              {!isLocked && (
                <span className="pointer-events-none absolute -inset-[1px] rounded-[18px] opacity-30 group-hover:opacity-50 blur-[2px] transition-opacity bg-gradient-to-r from-amber-400/60 via-yellow-400/60 to-emerald-400/60" />
              )}
              {!isLocked && (
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)'
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2 font-sans tracking-tight">
                {isCompleted ? (
                  <>
                    <FaRedoAlt className="text-[14px]" />
                    <span>Rejouer</span>
                  </>
                ) : isInProgress ? (
                  <>
                    <FaArrowRight className="text-[14px]" />
                    <span>Continuer</span>
                  </>
                ) : isLocked ? (
                  <>
                    <FaLock className="text-[14px]" />
                    <span>Premium</span>
                  </>
                ) : (
                  <>
                    <FaPlay className="text-[14px]" />
                    <span>Commencer</span>
                  </>
                )}
              </span>
              <span className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
              {isInProgress && (
                <span className="pointer-events-none absolute left-2 right-2 bottom-1 h-[10px] rounded-full opacity-40 blur-md bg-gradient-to-r from-amber-400/40 via-yellow-400/40 to-rose-400/40" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main DashboardPage Component
const DashboardPage = () => {
  const { user } = useAuth();
  const { t, currentLang } = useLanguage();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [recentQuests, setRecentQuests] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const [hoveredQuest, setHoveredQuest] = useState(null);
  
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
      
      // Fetch user progress
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
          completedAt: data.completedAt,
          score: data.score || 0
        };
      });
      setUserProgress(progress);
      
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
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentQuests([]);
    }
  };

  const fetchDailyChallenge = async () => {
    try {
      const challenge = await getUserDailyChallenge(user.uid);
      if (challenge && challenge.questId) {
        setDailyChallenge(challenge);
      } else {
        // Fallback local si Firestore renvoie un objet inattendu
        const fallback = generateDailyChallenge();
        setDailyChallenge(fallback);
      }
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
      // Fallback local en cas d'erreur réseau
      try {
        const fallback = generateDailyChallenge();
        setDailyChallenge(fallback);
      } catch (e) {
        // ignore
      }
    }
  };

  const regenerateDailyChallenge = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const newChallenge = generateDailyChallenge();
      const challengeRef = doc(db, 'dailyChallenges', `${user.uid}_${today}`);
      await setDoc(challengeRef, {
        ...newChallenge,
        userId: user.uid,
        status: 'active',
        progress: 0,
        startedAt: serverTimestamp(),
        completedAt: null
      });
      setDailyChallenge({ ...newChallenge, status: 'active', progress: 0 });
    } catch (error) {
      console.error('Error regenerating daily challenge:', error);
      // Fallback local
      const fallback = generateDailyChallenge();
      setDailyChallenge({ ...fallback, status: 'active', progress: 0 });
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
  const totalQuests = quests?.length || 0;

  // Statuts des quêtes pour filtrage/affichage
  const activeQuestIds = Object.entries(userProgress)
    .filter(([_, p]) => p?.status === 'active')
    .map(([id]) => id);
  const completedQuestIds = Object.entries(userProgress)
    .filter(([_, p]) => p?.status === 'completed')
    .map(([id]) => id);
  const hasActiveQuests = activeQuestIds.length > 0;
  const showDailyChallenge = Boolean(dailyChallenge && dailyChallenge.status !== 'completed');

  const activeQuestsDetailed = activeQuestIds.map((id) => {
    const questMeta = quests?.find(q => q.id === id);
    return {
      id,
      title: questMeta?.title || 'Quête',
      category: questMeta?.category,
      xp: questMeta?.xp,
      duration: questMeta?.duration,
      progress: userProgress[id]?.progress || 0,
      isPremium: questMeta?.isPremium || false
    };
  });

  // Objets de quêtes actives complets pour affichage (ordonnés par progression desc)
  const activeQuestObjects = (quests || [])
    .filter(q => activeQuestIds.includes(q.id))
    .sort((a, b) => (userProgress[b.id]?.progress || 0) - (userProgress[a.id]?.progress || 0));
  const activeQuestsToRender = activeQuestObjects.slice(0, 3);

  // Recommandations filtrées: exclure actives/terminées, éviter premium si non-premium
  const baseRecommended = !questsLoading ? getRecommendedQuestsForUser(completedQuestIds, userLevel) : [];
  const filteredRecommended = (baseRecommended || [])
    .filter(q => !completedQuestIds.includes(q.id))
    .filter(q => !activeQuestIds.includes(q.id))
    .filter(q => (isPremium ? true : !q.isPremium));
  const recommendedCount = hasActiveQuests ? 2 : 6;
  const recommendedToRender = filteredRecommended.slice(0, recommendedCount).map((quest, index) => ({
    ...quest,
    isNew: index < 2
  }));
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
        <div className="px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Hero Section - Style unifié avec QuestList */}
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
                      <span 
                        className="text-2xl font-black text-gray-900"
                        style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}
                      >
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
                    <h1 
                      className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight"
                      style={{ 
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 900,
                        letterSpacing: '-0.03em'
                      }}
                    >
                      <span className="text-white">{greeting}, </span>
                      <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                        {displayName}
                      </span>
                      {userLevel >= 20 && (
                        <motion.span
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="inline-block ml-2"
                        >
                          <HiSparkles className="text-yellow-400 text-xl" />
                        </motion.span>
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
                
                {/* Quick Actions - Style unifié */}
                <div className="hidden sm:flex items-center gap-3">
                  <Link
                    to="/quests"
                    className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all"
                  >
                    Voir les quêtes
                  </Link>
                  {!isPremium && (
                    <Link
                      to="/premium"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 font-semibold text-sm transition-all flex items-center gap-2"
                    >
                      <FaCrown className="text-xs" />
                      Premium
                    </Link>
                  )}
                </div>
              </div>

            {/* Mini statistiques rapides (placées en haut) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.01 }}
                className="rounded-xl p-3 bg-white/[0.03] border border-white/10 flex items-center gap-3"
                aria-label={`${streakDays} jours de série`}
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <FaFire className="text-orange-400 text-base" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Série
                  </div>
                  <div className="text-sm font-extrabold text-white" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}>
                    {streakDays} <span className="text-gray-300 font-semibold">jours</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                whileHover={{ scale: 1.01 }}
                className="rounded-xl p-3 bg-white/[0.03] border border-white/10 flex items-center gap-3"
                aria-label={`${completedQuests} quêtes terminées`}
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <FaCheckCircle className="text-emerald-400 text-base" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Quêtes terminées
                  </div>
                  <div className="text-sm font-extrabold text-white" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}>
                    <CountUp end={completedQuests} />/{totalQuests}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Progression du niveau - remontée en haut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="neon-element rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 
                  className="text-lg font-bold text-white flex items-center gap-2"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                >
                  <BsLightningChargeFill className="text-amber-400" />
                  Progression
                </h2>
                <span className="text-base sm:text-lg font-extrabold text-white">
                  Niveau {userLevel}
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
            </motion.div>

            {/* Reprendre (si quêtes actives) */}
            {hasActiveQuests && activeQuestsToRender.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 
                    className="text-lg font-bold text-white flex items-center gap-2"
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                  >
                    Reprendre
                  </h2>
                </div>

                {/* Mobile carrousel */}
                <div className="sm:hidden -mx-1 px-1 overflow-x-auto flex gap-3 snap-x snap-mandatory">
                  {activeQuestsToRender.map((quest) => (
                    <div key={quest.id} className="min-w-[85%] snap-start">
                      <QuestCard
                        quest={quest}
                        userProgress={userProgress}
                        isPremium={isPremium}
                        onNavigate={navigate}
                        hoveredQuest={hoveredQuest}
                        setHoveredQuest={setHoveredQuest}
                      />
                    </div>
                  ))}
                </div>

                {/* Desktop grid */}
                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeQuestsToRender.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      userProgress={userProgress}
                      isPremium={isPremium}
                      onNavigate={navigate}
                      hoveredQuest={hoveredQuest}
                      setHoveredQuest={setHoveredQuest}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Daily Challenge - Style unifié (affiché après Reprendre si présent) */}
            {showDailyChallenge && (
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
                    
                    <div className="flex-1">
                      <h3 
                        className="text-white font-bold text-lg flex items-center gap-2"
                        style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                      >
                        Défi Quotidien
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
                  
                  <div
                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center"
                  >
                    <FaPlay className="text-amber-400 ml-0.5" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bouton régénérer (séparé pour éviter le clic sur la carte) */}
            {showDailyChallenge && (
              <div className="-mt-6 mb-8 flex justify-end">
                <button
                  type="button"
                  onClick={regenerateDailyChallenge}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white transition-colors"
                  aria-label="Régénérer le défi quotidien"
                >
                  Régénérer
                </button>
              </div>
            )}


            {/* Quêtes Recommandées - avec carrousel mobile et filtrage */}
            {/* Recommandé: après Progression/Reprendre, et si défi complété, remonter */}
            {recommendedToRender.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 
                    className="text-lg font-bold text-white flex items-center gap-2"
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                  >
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

                {/* Mobile carrousel */}
                <div className="sm:hidden -mx-1 px-1 overflow-x-auto flex gap-3 snap-x snap-mandatory">
                  {recommendedToRender.map((quest, index) => (
                    <div key={quest.id} className="min-w-[85%] snap-start">
                      <QuestCard
                        quest={quest}
                        userProgress={userProgress}
                        isPremium={isPremium}
                        onNavigate={navigate}
                        hoveredQuest={hoveredQuest}
                        setHoveredQuest={setHoveredQuest}
                      />
                    </div>
                  ))}
                </div>

                {/* Desktop grid */}
                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedToRender.map((quest, index) => (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <QuestCard
                        quest={quest}
                        userProgress={userProgress}
                        isPremium={isPremium}
                        onNavigate={navigate}
                        hoveredQuest={hoveredQuest}
                        setHoveredQuest={setHoveredQuest}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Section Achievements/Badges - Style unifié */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 
                  className="text-lg font-bold text-white flex items-center gap-2"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                >
                  <GiDiamondTrophy className="text-purple-400" />
                  Badges & Accomplissements
                </h2>
                <Link 
                  to="/achievements" 
                  className="text-purple-400 text-sm font-bold hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  Tout voir
                  <FaArrowRight className="text-xs" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Badge 1: Première Quête */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="neon-element rounded-2xl p-4 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5 opacity-50" />
                  <div className="relative">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <FaStar className="text-emerald-400 text-xl" />
                    </div>
                    <p className="text-xs font-bold text-white">Première Victoire</p>
                    <p className="text-[10px] text-gray-400 mt-1">1 quête terminée</p>
                  </div>
                </motion.div>

                {/* Badge 2: Streak */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="neon-element rounded-2xl p-4 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/5 opacity-50" />
                  <div className="relative">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <FaFire className="text-orange-400 text-xl" />
                    </div>
                    <p className="text-xs font-bold text-white">En Feu</p>
                    <p className="text-[10px] text-gray-400 mt-1">7 jours de suite</p>
                  </div>
                </motion.div>

                {/* Badge 3: XP Master */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="neon-element rounded-2xl p-4 text-center relative overflow-hidden opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 opacity-50" />
                  <div className="relative">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-700/50 border border-gray-600/50 flex items-center justify-center">
                      <FaLock className="text-gray-500 text-lg" />
                    </div>
                    <p className="text-xs font-bold text-gray-400">XP Master</p>
                    <p className="text-[10px] text-gray-500 mt-1">1000 XP requis</p>
                  </div>
                </motion.div>

                {/* Badge 4: Premium */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`neon-element rounded-2xl p-4 text-center relative overflow-hidden ${!isPremium ? 'opacity-50' : ''}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/5 opacity-50" />
                  <div className="relative">
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${isPremium ? 'bg-purple-500/20 border-purple-500/30' : 'bg-gray-700/50 border-gray-600/50'} border flex items-center justify-center`}>
                      {isPremium ? (
                        <FaCrown className="text-purple-400 text-xl" />
                      ) : (
                        <FaLock className="text-gray-500 text-lg" />
                      )}
                    </div>
                    <p className={`text-xs font-bold ${isPremium ? 'text-white' : 'text-gray-400'}`}>Membre VIP</p>
                    <p className={`text-[10px] ${isPremium ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {isPremium ? 'Actif' : 'Premium requis'}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Section Activité Récente - Style unifié */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 
                  className="text-lg font-bold text-white flex items-center gap-2"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                >
                  <BsStars className="text-cyan-400" />
                  Activité Récente
                </h2>
              </div>

              {recentQuests.length > 0 ? (
                <div className="space-y-3">
                  {recentQuests.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      onClick={() => navigate(`/quests/${activity.questId}`)}
                      className="neon-element rounded-xl p-4 cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.status === 'completed' 
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-amber-500/20 border border-amber-500/30'
                        }`}>
                          {activity.status === 'completed' ? (
                            <FaCheckCircle className="text-emerald-400 text-sm" />
                          ) : (
                            <FaBolt className="text-amber-400 text-sm" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {activity.questTitle || 'Quête'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {activity.status === 'completed' ? 'Terminée' : `En cours - ${activity.progress || 0}%`}
                          </p>
                        </div>
                      </div>
                      <FaArrowRight className="text-gray-500 group-hover:text-white transition-colors text-sm" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="neon-element rounded-xl p-8 text-center">
                  <p className="text-gray-400">Aucune activité récente</p>
                  <Link
                    to="/quests"
                    className="inline-block mt-4 text-amber-400 font-semibold hover:text-amber-300 transition-colors"
                  >
                    Commencer une quête →
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Section Quick Stats Summary - Style unifié */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            >
              {/* Cette semaine */}
              <div className="neon-element rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="text-xs font-bold text-gray-400 uppercase tracking-wider"
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}
                  >
                    Cette semaine
                  </span>
                  <BsStars className="text-cyan-400 text-lg" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Quêtes</span>
                    <span className="text-sm font-bold text-white">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">XP gagné</span>
                    <span className="text-sm font-bold text-yellow-400">+450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Temps</span>
                    <span className="text-sm font-bold text-cyan-400">2h 30min</span>
                  </div>
                </div>
              </div>

              {/* Objectifs */}
              <div className="neon-element rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="text-xs font-bold text-gray-400 uppercase tracking-wider"
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}
                  >
                    Objectifs
                  </span>
                  <FaMedal className="text-amber-400 text-lg" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Niveau 10</span>
                    <span className="text-sm font-bold text-amber-400">{userLevel}/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Streak 30j</span>
                    <span className="text-sm font-bold text-orange-400">{streakDays}/30</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">50 Quêtes</span>
                    <span className="text-sm font-bold text-emerald-400">{completedQuests}/50</span>
                  </div>
                </div>
              </div>

              {/* Rang Global */}
              <div className="neon-element rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="text-xs font-bold text-gray-400 uppercase tracking-wider"
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}
                  >
                    Rang Global
                  </span>
                  <GiDiamondTrophy className="text-purple-400 text-lg" />
                </div>
                <div className="text-center py-2">
                  <div className="text-3xl font-black text-white mb-1">
                    #{Math.max(1, 1000 - userLevel * 10)}
                  </div>
                  <div className="text-xs text-gray-400">
                    Top {Math.max(1, Math.round((1000 - userLevel * 10) / 10))}%
                  </div>
                  <div className="mt-3 text-xs text-purple-400 font-semibold">
                    +{Math.max(5, 50 - userLevel)} places cette semaine
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Footer Actions - Call to Action final */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="text-center py-8"
            >
              <p className="text-gray-400 mb-6">
                Continue ton aventure financière et débloque de nouveaux accomplissements
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/quests"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 rounded-full font-bold shadow-glow-md hover:shadow-glow-lg transform hover:scale-105 transition-all"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                >
                  <FaRocket />
                  Explorer les Quêtes
                </Link>
                {!isPremium && (
                  <Link
                    to="/premium"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white rounded-full font-bold border border-purple-500/30 transition-all"
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}
                  >
                    <FaCrown />
                    Passer Premium
                  </Link>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </AppBackground>
  );
};

export default DashboardPage;