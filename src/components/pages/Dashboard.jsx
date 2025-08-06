import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { 
  FaTrophy, 
  FaFire, 
  FaStar, 
  FaCheckCircle,
  FaMedal,
  FaLock,
  FaArrowRight,
  FaBolt,
  FaChevronRight,
  FaCoins,
  FaRocket,
  FaGem,
  FaCrown,
  FaChartLine,
  FaRegClock,
  FaPlay
} from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { BsGraphUpArrow } from 'react-icons/bs';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { useLocalQuests } from '../../hooks/useLocalQuests';
import { getUserDailyChallenge } from '../../services/dailyChallenge';
import confetti from 'canvas-confetti';

// Animation pour compter les chiffres - Version smooth
const CountUp = ({ end, duration = 1200, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const rawProgress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing pour animation plus fluide
      const progress = rawProgress < 0.5 
        ? 2 * rawProgress * rawProgress 
        : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
      
      setCount(Math.floor(progress * end));
      
      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// ➊ HeroHeader Component - Version plus compacte
const HeroHeader = ({ displayName, userLevel, avatarLetter, streak }) => {
  const { t } = useLanguage();
  const hour = new Date().getHours();
  
  // Message personnalisé selon l'heure
  const getGreeting = () => {
    if (hour < 12) return t('dashboard.good_morning') || 'Bonjour';
    if (hour < 18) return t('dashboard.good_afternoon') || 'Bon après-midi';
    return t('dashboard.good_evening') || 'Bonsoir';
  };

  // Badge selon le niveau
  const getLevelBadge = () => {
    if (userLevel >= 50) return { icon: <FaCrown className="text-purple-400 text-[10px]" />, glow: 'shadow-purple-400/30' };
    if (userLevel >= 20) return { icon: <FaGem className="text-blue-400 text-[10px]" />, glow: 'shadow-blue-400/30' };
    if (userLevel >= 10) return { icon: <FaStar className="text-yellow-400 text-[10px]" />, glow: 'shadow-yellow-400/30' };
    return null;
  };

  const levelBadge = getLevelBadge();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-2.5">
        <motion.div 
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <div className={`w-14 h-14 bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center text-lg font-bold text-gray-900 shadow-xl border border-yellow-300/25 ${levelBadge?.glow ? levelBadge.glow : ''}`}>
            <span className="relative z-10 drop-shadow-sm">{avatarLetter}</span>
            {/* Effet de brillance amélioré */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-2xl" />
          </div>
          
          {/* Streak Badge simplifié */}
          {streak >= 7 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <FaFire className="text-white text-[10px] animate-pulse" />
            </motion.div>
          )}
          
          {/* Level Badge simplifié */}
          {levelBadge && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-gray-700`}
            >
              {levelBadge.icon}
            </motion.div>
          )}
        </motion.div>
        
        <div>
          <p className="text-white text-base font-bold flex items-center gap-1.5 leading-tight">
            {getGreeting()}, {displayName}
            {userLevel >= 20 && <HiSparkles className="text-yellow-400 text-sm animate-pulse" />}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-gray-300 text-xs font-medium">
              {t('dashboard.level') || 'Niveau'} {userLevel}
            </p>
            {streak >= 3 && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-orange-400 text-xs bg-gradient-to-r from-orange-500/20 to-red-500/20 px-2 py-0.5 rounded-full border border-orange-500/20"
              >
                🔥 {streak}j
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ➋ DailyQuestBanner - Gradient doré subtil mais distinctif
const DailyQuestBanner = ({ dailyChallenge, dailyCompleted }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const [isUrgent, setIsUrgent] = useState(false);
  
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft({ hours, minutes });
      setIsUrgent(hours < 3);
    };
    
    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  if (dailyCompleted) return null;
  
  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => dailyChallenge && navigate(`/quests/${dailyChallenge.questId}`)}
      className={`relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border ${
        isUrgent 
          ? 'border-orange-500/40 shadow-orange-500/10' 
          : 'border-yellow-500/30 shadow-yellow-500/10'
      } rounded-2xl p-4 shadow-xl cursor-pointer overflow-hidden transition-all hover:shadow-yellow-500/20`}
    >
      {/* Gradient doré léger pour différenciation */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        isUrgent 
          ? 'from-orange-400/[0.08] via-transparent to-red-400/[0.06]' 
          : 'from-yellow-400/[0.06] via-transparent to-amber-400/[0.04]'
      }`} />
      
      {/* Effet de brillance très subtil */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-12"
        animate={{ x: [-200, 200] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Accent lumineux subtil en haut */}
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${
        isUrgent ? 'via-orange-400/40' : 'via-yellow-400/30'
      } to-transparent`} />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            className={`w-11 h-11 ${
              isUrgent 
                ? 'bg-gradient-to-br from-orange-500/20 to-red-500/15' 
                : 'bg-gradient-to-br from-yellow-500/15 to-amber-500/10'
            } backdrop-blur rounded-xl flex items-center justify-center shadow-lg border ${
              isUrgent ? 'border-orange-500/30' : 'border-yellow-500/20'
            }`}
            animate={{ 
              rotate: isUrgent ? [0, 10, -10, 0] : [0, 5, -5, 0],
              scale: isUrgent ? [1, 1.03, 1] : 1
            }}
            transition={{ duration: isUrgent ? 0.5 : 2, repeat: Infinity }}
          >
            <FaBolt className={`text-xl ${
              isUrgent ? 'text-orange-400' : 'text-yellow-400'
            } drop-shadow-md`} />
          </motion.div>
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              {t('dashboard.daily_challenge') || 'Défi du jour'}
              {isUrgent ? (
                <span className="text-[9px] bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30 font-bold animate-pulse">
                  URGENT
                </span>
              ) : (
                <span className="text-[9px] bg-gradient-to-r from-yellow-500/15 to-amber-500/15 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/20">
                  NOUVEAU
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-gray-300 text-xs font-medium">
                +{dailyChallenge?.rewards?.xp || 100} XP bonus
              </p>
              <span className={`text-xs font-mono ${isUrgent ? 'text-orange-400 font-semibold' : 'text-gray-400'}`}>
                • {timeLeft.hours}h {timeLeft.minutes}min
              </span>
            </div>
          </div>
        </div>
        <motion.div 
          className="w-8 h-8 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center border border-gray-700/50"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <FaPlay className="text-white text-xs ml-0.5" />
        </motion.div>
      </div>
    </motion.section>
  );
};

// ➌ LevelProgress - Avec couleurs et emojis pour les titres
const LevelProgress = ({ currentXP, currentLevel, streak }) => {
  const { t } = useLanguage();
  const progress = (currentXP % 1000) / 10;
  const xpInLevel = currentXP % 1000;
  const xpToNext = 1000 - xpInLevel;
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(currentLevel);
  
  useEffect(() => {
    if (currentLevel > prevLevel && prevLevel !== 0) {
      setShowLevelUp(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706']
      });
      toast.success(`🎉 Niveau ${currentLevel} atteint!`, {
        position: 'top-center',
        autoClose: 3000
      });
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    setPrevLevel(currentLevel);
  }, [currentLevel, prevLevel]);

  // Titre dynamique avec emojis et couleurs
  const getLevelTitle = () => {
    if (currentLevel >= 50) return { 
      text: t('dashboard.level_titles.financial_master') || 'Maître Financier', 
      emoji: '👑',
      color: 'from-purple-400 to-purple-600' 
    };
    if (currentLevel >= 25) return { 
      text: t('dashboard.level_titles.confirmed_expert') || 'Expert confirmé', 
      emoji: '💎',
      color: 'from-blue-400 to-blue-600' 
    };
    if (currentLevel >= 10) return { 
      text: t('dashboard.level_titles.advanced_apprentice') || 'Apprenti avancé', 
      emoji: '⭐',
      color: 'from-green-400 to-green-600' 
    };
    if (currentLevel >= 5) return { 
      text: t('dashboard.level_titles.ambitious_novice') || 'Novice ambitieux', 
      emoji: '🚀',
      color: 'from-yellow-400 to-yellow-600' 
    };
    return { 
      text: t('dashboard.level_titles.motivated_beginner') || 'Débutant motivé', 
      emoji: '🌱',
      color: 'from-emerald-400 to-emerald-600' 
    };
  };

  const levelTitle = getLevelTitle();
  const nextMilestone = currentLevel < 10 ? 10 : currentLevel < 25 ? 25 : currentLevel < 50 ? 50 : 100;
  
  return (
    <motion.section 
      className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-5 shadow-2xl overflow-hidden"
      animate={showLevelUp ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Background decoration ultra subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/[0.02] via-transparent to-purple-600/[0.02] pointer-events-none" />
      
      {/* Header avec titre coloré et emoji */}
      <div className="flex items-center justify-between mb-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-xs font-bold bg-gradient-to-r ${levelTitle.color} bg-clip-text text-transparent flex items-center gap-1.5`}
        >
          <span className="text-base">{levelTitle.emoji}</span>
          {levelTitle.text}
        </motion.div>
      </div>
      
      <div className="relative">
        {/* Stats Row - Optimisé mobile avec effets subtils */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <motion.div 
            className="text-center group"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <CountUp end={currentXP} />
            </motion.div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">XP Total</div>
          </motion.div>
          
          <motion.div 
            className="text-center border-x border-gray-700/40"
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
              {currentLevel}
              {currentLevel % 10 === 0 && currentLevel > 0 && (
                <motion.span 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1 }}
                  className="text-xs"
                >
                  ✨
                </motion.span>
              )}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Niveau</div>
          </motion.div>
          
          <motion.div 
            className="text-center"
            whileTap={{ scale: 0.95 }}
          >
            <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              streak > 0 ? 'text-transparent bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text' : 'text-gray-500'
            }`}>
              {streak}
              {streak >= 3 && <FaFire className="text-sm text-orange-400 animate-pulse" />}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Série</div>
          </motion.div>
        </div>
        
        {/* Progress Bar - Version premium mobile */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <FaCoins className="text-yellow-500 text-[10px]" />
              {xpInLevel} / 1000
            </span>
            <motion.span 
              className="font-bold"
              animate={{ 
                color: progress >= 80 ? ['#fbbf24', '#f59e0b', '#fbbf24'] : '#fbbf24',
                scale: progress >= 80 ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
          
          {/* Progress bar avec effet de vague */}
          <div className="relative h-3 bg-gray-900/60 rounded-full overflow-hidden border border-gray-800/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 20, duration: 1.2 }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: progress >= 80 
                  ? 'linear-gradient(90deg, #10b981, #34d399, #10b981)' 
                  : 'linear-gradient(90deg, #fbbf24, #fcd34d, #f59e0b)',
                boxShadow: progress >= 80 
                  ? '0 0 16px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                  : '0 0 16px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Shine effect simplifié */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
            </motion.div>
            
            {/* Milestones avec animation */}
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className={`absolute h-full w-px transition-colors ${
                  progress >= milestone ? 'bg-white/20' : 'bg-gray-700/50'
                }`}
                style={{ left: `${milestone}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

// ➍ CurrentQuest - Design amélioré avec indicateurs visuels
const CurrentQuest = ({ activeQuest, navigate }) => {
  const { t } = useLanguage();
  const isAlmostDone = activeQuest?.progress >= 75;
  
  if (!activeQuest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-6 text-center overflow-hidden"
      >
        {/* Pattern de fond animé */}
        <div className="absolute inset-0 opacity-5">
          <motion.div 
            className="absolute inset-0"
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
        </div>
        
        <div className="relative">
          <motion.div
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <FaRocket className="text-5xl text-gray-600 mx-auto mb-3" />
          </motion.div>
          <h3 className="text-lg font-bold text-white mb-2">
            {t('dashboard.ready_to_learn') || 'Prêt à apprendre ?'}
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {t('dashboard.start_journey') || 'Commence ton parcours'}
          </p>
          <motion.div 
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            className="w-full"
          >
            <Link 
              to="/quests"
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-gray-900 rounded-2xl font-bold text-base shadow-2xl border border-yellow-300/40 hover:shadow-yellow-500/25 transition-all duration-200"
            >
              {t('dashboard.explore_quests') || 'Explorer'}
              <FaArrowRight className="text-sm" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }
  
  const stepsCompleted = Math.floor((activeQuest.progress / 100) * (activeQuest.totalSteps || 5));
  const timeLeft = activeQuest.estimatedMinutes ? Math.max(0, activeQuest.estimatedMinutes - Math.floor((activeQuest.progress / 100) * activeQuest.estimatedMinutes)) : 5;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/quests/${activeQuest.questId}`)}
      className={`relative ${
        isAlmostDone 
          ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30' 
          : 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30'
      } backdrop-blur-xl border rounded-2xl p-5 cursor-pointer overflow-hidden`}
    >
      {/* Indicateur de temps restant */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-3 right-3 text-[10px] text-gray-400 flex items-center gap-1"
      >
        <FaRegClock className="text-[8px]" />
        ~{timeLeft} min
      </motion.div>
      
      {/* Badge "Presque fini" amélioré */}
      {isAlmostDone && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute bottom-3 right-3"
        >
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-[10px] px-2 py-1 rounded-full font-bold border border-green-500/30">
            Bientôt fini! 🎉
          </div>
        </motion.div>
      )}
      
      <div className="relative">
        <div className="mb-3">
          <p className={`${isAlmostDone ? 'text-green-400' : 'text-blue-400'} text-[10px] uppercase tracking-wider font-bold mb-1`}>
            {t('dashboard.quest_in_progress') || 'En cours'}
          </p>
          <h3 className="text-white font-semibold text-sm">
            {activeQuest.questTitle}
          </h3>
        </div>
        
        {/* Stats en ligne */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{stepsCompleted}/{activeQuest.totalSteps || 5} étapes</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FaCoins className="text-yellow-400 text-[10px]" />
              {activeQuest.xp || 100} XP
            </span>
          </div>
          <div className={`text-2xl font-bold ${
            isAlmostDone ? 'text-green-400' : 'text-blue-400'
          }`}>
            {activeQuest.progress || 0}%
          </div>
        </div>
        
        {/* Progress bar améliorée */}
        <div className="space-y-2">
          <div className="h-3 bg-black/40 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${
                isAlmostDone 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                  : 'bg-gradient-to-r from-blue-400 to-cyan-400'
              } rounded-full relative`}
              initial={{ width: 0 }}
              animate={{ width: `${activeQuest.progress || 0}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer" />
            </motion.div>
          </div>
          
          <motion.div 
            className="flex items-center justify-center gap-1 text-xs font-medium text-gray-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>{isAlmostDone ? 'Touche pour terminer' : 'Touche pour continuer'}</span>
            <FaArrowRight className="text-[10px]" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// ➎ QuickStats - Design plus compact et moderne
const QuickStats = ({ questsCompleted, achievements }) => {
  const { t } = useLanguage();
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.96 }}
        className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-5 overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white mb-1">
              <CountUp end={questsCompleted} />
            </div>
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              {t('dashboard.quests_done') || 'Quêtes'}
            </div>
          </div>
          <FaCheckCircle className="text-green-400/50 text-3xl" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.96 }}
        className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-5 overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white mb-1">
              <CountUp end={achievements} />
            </div>
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              {t('dashboard.badges') || 'Badges'}
            </div>
          </div>
          <FaMedal className="text-purple-400/50 text-3xl" />
        </div>
      </motion.div>
    </div>
  );
};

// ➏ RecommendedQuests - Scroll horizontal corrigé avec alignement
const RecommendedQuests = ({ recommendations }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  if (!recommendations || recommendations.length === 0) return null;
  
  const categoryData = {
    budgeting: { emoji: '💰', color: 'from-blue-500/10 to-blue-600/10', border: 'border-blue-500/20', accent: 'text-blue-400' },
    saving: { emoji: '🏦', color: 'from-green-500/10 to-green-600/10', border: 'border-green-500/20', accent: 'text-green-400' },
    investing: { emoji: '📈', color: 'from-purple-500/10 to-purple-600/10', border: 'border-purple-500/20', accent: 'text-purple-400' },
    debt: { emoji: '💳', color: 'from-red-500/10 to-red-600/10', border: 'border-red-500/20', accent: 'text-red-400' },
    planning: { emoji: '📊', color: 'from-cyan-500/10 to-cyan-600/10', border: 'border-cyan-500/20', accent: 'text-cyan-400' },
    crypto: { emoji: '🪙', color: 'from-yellow-500/10 to-yellow-600/10', border: 'border-yellow-500/20', accent: 'text-yellow-400' },
    retirement: { emoji: '🏖️', color: 'from-indigo-500/10 to-indigo-600/10', border: 'border-indigo-500/20', accent: 'text-indigo-400' }
  };

  const difficultyStars = (level) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <FaStar 
            key={i} 
            className={`text-[8px] ${i <= level ? 'text-yellow-400' : 'text-gray-700'}`} 
          />
        ))}
      </div>
    );
  };
  
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-base flex items-center gap-2">
          {t('dashboard.recommended') || 'Pour toi'}
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <HiSparkles className="text-yellow-400 text-sm" />
          </motion.div>
        </h3>
        <Link 
          to="/quests" 
          className="text-yellow-400 text-sm font-semibold active:text-yellow-300 flex items-center gap-1.5 hover:gap-2 transition-all duration-200"
        >
          {t('dashboard.view_all') || 'Voir tout'}
          <FaArrowRight className="text-[10px]" />
        </Link>
      </div>
      
      {/* Scroll horizontal qui s'étend jusqu'aux bords de l'écran */}
      <div className="-mx-4">
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide pl-4"
          style={{ 
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollPaddingLeft: '1rem'
          }}
        >
          {recommendations.map((quest, index) => {
            const category = categoryData[quest.category] || categoryData.planning;
            const difficulty = quest.difficulty === 'beginner' ? 1 : quest.difficulty === 'intermediate' ? 2 : 3;
            const isLast = index === recommendations.length - 1;
            
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => navigate(`/quests/${quest.id}`)}
                className={`relative bg-gradient-to-br ${category.color} ${category.border} border rounded-xl p-4 cursor-pointer flex-shrink-0 transition-all duration-200 hover:shadow-lg active:shadow-sm${isLast ? ' mr-20' : ''}`}
                style={{ 
                  width: '180px',
                  scrollSnapAlign: 'start',
                  minWidth: '180px'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{category.emoji}</span>
                  {difficultyStars(difficulty)}
                </div>
                
                <h4 className="text-white font-semibold text-xs line-clamp-2 mb-3 min-h-[2rem] leading-relaxed">
                  {quest.title}
                </h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <FaCoins className="text-yellow-400 text-[10px]" />
                      <span className="text-yellow-400 text-xs font-bold">{quest.xp}</span>
                    </div>
                    {quest.estimatedTime && (
                      <span className="text-gray-500 text-[10px]">
                        {quest.estimatedTime}min
                      </span>
                    )}
                  </div>
                  <motion.div
                    animate={{ x: [0, 2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FaArrowRight className={`text-[10px] ${category.accent} opacity-50`} />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
          
          {/* Card "Voir plus" à la fin */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: recommendations.length * 0.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/quests')}
            className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-4 cursor-pointer flex-shrink-0 flex items-center justify-center -ml-16 mr-4 overflow-hidden"
            style={{ 
              width: '120px',
              scrollSnapAlign: 'start',
              minWidth: '120px'
            }}
          >
            <div className="text-center">
              <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-2">
                <FaArrowRight className="text-gray-400" />
              </div>
              <span className="text-gray-300 text-xs font-medium">{t('dashboard.view_more') || 'Voir plus'}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Main DashboardPage Component - Mobile First avec ordre optimisé
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
  
  const { 
    quests, 
    loading: questsLoading, 
    getRecommendedQuestsForUser
  } = useLocalQuests();

  const achievementsList = [
    { id: 'first_quest', name: 'First Steps', icon: '👶', unlocked: false },
    { id: 'streak_7', name: 'Week Warrior', icon: '🔥', unlocked: false },
    { id: 'level_5', name: 'Rising Star', icon: '⭐', unlocked: false },
    { id: 'speedrun', name: 'Speed Demon', icon: '⚡', unlocked: false },
    { id: 'perfectionist', name: 'Perfectionist', icon: '💯', unlocked: false },
    { id: 'explorer', name: 'Explorer', icon: '🗺️', unlocked: false }
  ];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, currentLang]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        
        // Check achievements
        const userAchievements = achievementsList.map(achievement => {
          let unlocked = false;
          
          if (achievement.id === 'first_quest' && data.completedQuests > 0) {
            unlocked = true;
          } else if (achievement.id === 'streak_7' && (data.streaks >= 7 || data.currentStreak >= 7)) {
            unlocked = true;
          } else if (achievement.id === 'level_5' && calculateLevel(data.points || 0) >= 5) {
            unlocked = true;
          }
          
          return { ...achievement, unlocked };
        });
        setAchievements(userAchievements);
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
      
      // Find active quest
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
      <div className="min-h-screen bg-gradient-to-b from-[#0F0F0F] via-gray-900 to-[#0F0F0F] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const userPoints = userData?.points || 0;
  const userLevel = calculateLevel(userPoints);
  const streakDays = userData?.streaks || userData?.currentStreak || 0;
  const completedQuests = userData?.completedQuests || 0;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const recommendations = !questsLoading ? getRecommendedQuestsForUser([], userLevel).slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0F0F] via-gray-900 to-[#0F0F0F] pb-20">
      {/* Background pattern ultra subtil avec gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.01]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.02) 0%, transparent 50%)'
        }} />
      </div>
      
      {/* Container optimisé mobile avec ordre UX amélioré */}
      <div className="relative max-w-lg mx-auto px-4 pt-6 pb-6">
        <div className="space-y-6">
          {/* 1. Header - Plus compact */}
          <HeroHeader 
            displayName={userData?.displayName || user?.email?.split('@')[0]}
            userLevel={userLevel}
            avatarLetter={userData?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
            streak={streakDays}
          />
          
          {/* 2. Daily Quest - Gradient doré subtil */}
          {dailyChallenge && !dailyChallenge?.completed && (
            <DailyQuestBanner 
              dailyChallenge={dailyChallenge}
              dailyCompleted={false}
            />
          )}
          
          {/* 3. Current Quest ou CTA - Action principale */}
          <CurrentQuest 
            activeQuest={activeQuest}
            navigate={navigate}
          />
          
          {/* 4. Level Progress - Avec couleurs et emojis */}
          <LevelProgress 
            currentXP={userPoints}
            currentLevel={userLevel}
            streak={streakDays}
          />
          
          {/* 5. Quick Stats - Vue d'ensemble */}
          <QuickStats 
            questsCompleted={completedQuests}
            achievements={unlockedAchievements}
          />
          
          {/* 6. Recommended Quests - Découverte */}
          <RecommendedQuests recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
};

// Add animations CSS optimisé
const gradientStyle = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.9; }
  }
  .animate-shimmer {
    animation: shimmer 3s infinite;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = gradientStyle;
  document.head.appendChild(style);
}

export default DashboardPage;