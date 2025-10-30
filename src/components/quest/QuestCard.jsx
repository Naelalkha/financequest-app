import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaFire, 
  FaCheckCircle,
  FaArrowRight,
  FaPlay,
  FaLock,
  FaCrown,
  FaRedoAlt,
  FaClock
} from 'react-icons/fa';
import { FaWallet, FaPiggyBank, FaChartLine, FaExclamationTriangle, FaCalendarAlt, FaCreditCard, FaShieldAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import { GiTwoCoins } from 'react-icons/gi';

// Import des illustrations pour les catégories
import budgetIcon from '../../assets/budget.png';
import epargneIcon from '../../assets/epargne.png';
import creditIcon from '../../assets/dettes.png';
import investissementIcon from '../../assets/investissement.png';
import impotsIcon from '../../assets/impots.png';
import protectionIcon from '../../assets/protection.png';
import checkIcon from '../../assets/check.png';

// Category and difficulty config, aligned across app
const categoryConfig = {
  budgeting: { 
    icon: FaWallet,
    illustration: budgetIcon,
    gradient: 'from-cyan-400 via-sky-400 to-teal-400',
    neonGlow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30'
  },
  saving: { 
    icon: FaPiggyBank,
    illustration: epargneIcon,
    gradient: 'from-green-400 via-lime-400 to-emerald-400',
    neonGlow: 'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
    color: 'text-green-300',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  credit: { 
    icon: FaCreditCard,
    illustration: creditIcon,
    gradient: 'from-red-400 via-rose-400 to-pink-400',
    neonGlow: 'shadow-[0_0_20px_rgba(248,113,113,0.3)]',
    color: 'text-red-300',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30'
  },
  investing: { 
    icon: FaChartLine,
    illustration: investissementIcon,
    gradient: 'from-blue-400 via-indigo-400 to-purple-400',
    neonGlow: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  taxes: { 
    icon: FaFileInvoiceDollar,
    illustration: impotsIcon,
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
    neonGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  protect: { 
    icon: FaShieldAlt,
    illustration: protectionIcon,
    gradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
    neonGlow: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]',
    color: 'text-pink-300',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/30'
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

const QuestCard = ({ quest, progressData, isPremiumUser, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const progress = progressData;
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'active';
  const hasStarted = isInProgress && (progress?.progress || 0) > 0;
  const isLocked = quest.isPremium && !isPremiumUser;
  const category = categoryConfig[quest.category] || categoryConfig.protect;
  const difficulty = difficultyConfig[quest.difficulty] || difficultyConfig.beginner;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full h-full"
    >
      <div
        className="relative rounded-2xl overflow-hidden w-full h-full focus-visible-ring cursor-pointer flex flex-col"
        role="link"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(e); } }}
        aria-label={`Ouvrir la quête ${quest.title}`}
      >
        {/* Overlay animé */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 rounded-2xl blur-lg opacity-0`}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <div 
          className={`
            relative neon-element rounded-2xl p-4 sm:p-5 lg:p-6 backdrop-blur-sm shadow h-full flex flex-col
            ${isHovered ? `border-white/30 shadow-2xl ${category.neonGlow}` : ''}
            transition-all duration-500
          `}
          style={{
            background: quest.category === 'budgeting'
              ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(13, 148, 136, 0.08) 100%)'
              : quest.category === 'saving'
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(101, 163, 13, 0.08) 100%)'
                : quest.category === 'credit'
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(244, 63, 94, 0.08) 100%)'
                  : quest.category === 'investing'
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.08) 100%)'
                    : quest.category === 'taxes'
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)'
                      : quest.category === 'protect'
                        ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.08) 100%)',
          }}
        >
          {/* Accent succès si terminé */}
          {isCompleted && (
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
          )}

          {/* Shine effect */}
          {isHovered && (
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

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="mb-3 sm:mb-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center justify-center">
                    <img 
                      src={category.illustration} 
                      alt={quest.category}
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
                    />
                  </div>

                  {/* Badges d'état */}
                  {quest.isNew && !isCompleted && (
                    <div 
                      className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border-2 border-cyan-500/40 text-xs sm:text-sm font-extrabold text-cyan-300 uppercase tracking-wider"
                      style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, letterSpacing: '0.05em' }}
                    >
                      NEW
                    </div>
                  )}

                  {quest.isPremium && !isPremiumUser && (
                    <div
                      className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border-2 border-purple-500/50 text-xs sm:text-sm font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-2"
                    >
                      <FaCrown className="text-xs sm:text-sm" />
                      PRO
                    </div>
                  )}

                  {/* Difficulté */}
                  <div 
                    className={`
                      ${quest.isNew && (quest.isPremium && !isPremiumUser) ? 'hidden sm:inline-flex' : 'inline-flex'}
                      px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider
                      ${difficulty.bgStyle} ${difficulty.textColor}
                    `}
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, letterSpacing: '0.05em' }}
                  >
                    {difficulty.label}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <>
                      <img 
                        src={checkIcon} 
                        alt="Terminé"
                        className="w-5 h-5 sm:hidden"
                      />
                      <div 
                        className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-sm font-extrabold text-emerald-300 items-center gap-2 uppercase tracking-wider"
                        style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, letterSpacing: '0.05em' }}
                      >
                        <img 
                          src={checkIcon} 
                          alt="Terminé"
                          className="w-4 h-4"
                        />
                        Terminé
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Titre & description */}
              <h3 
                className="text-white font-extrabold text-[22px] sm:text-2xl lg:text-3xl mb-3 line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-300"
                style={{ fontFamily: '"Inter", "Helvetica Neue", sans-serif', fontWeight: 900, letterSpacing: '-0.03em' }}
              >
                {quest.title}
              </h3>
              <p 
                className="text-gray-200 text-[15px] sm:text-base lg:text-lg line-clamp-2 leading-relaxed"
                style={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, letterSpacing: '0.005em', lineHeight: '1.6' }}
              >
                {quest.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <FaClock className="text-cyan-400 text-base sm:text-lg" />
                <span 
                  className="font-extrabold text-base sm:text-lg text-gray-300"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}
                >
                  {quest.duration}min
                </span>
              </div>
              
              <div className="w-px h-5 bg-white/10" />
              
              <div className="flex items-center gap-2">
                <GiTwoCoins className="text-yellow-400 text-base sm:text-lg" />
                <span 
                  className="font-extrabold text-base sm:text-lg text-yellow-300"
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}
                >
                  +{quest.xp} XP
                </span>
              </div>
              
              {hasStarted && (
                <>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.progress || 0}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-amber-300 whitespace-nowrap">
                      {Math.round(progress.progress || 0)}%
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* CTA Modernisé et harmonisé */}
            <motion.button
              type="button"
              aria-label={
                isLocked
                  ? `Contenu Premium - déverrouiller`
                  : isCompleted
                    ? `Rejouer la quête ${quest.title}`
                    : hasStarted
                      ? `Continuer la quête ${quest.title}`
                      : `Commencer la quête ${quest.title}`
              }
              className={`
                group relative overflow-hidden w-full sm:w-auto sm:min-w-[180px] min-h-[56px] py-4 px-6 mt-auto
                rounded-[32px] font-bold text-lg sm:text-xl tracking-tight font-sans
                transition-all flex items-center justify-center gap-2 will-change-transform
                ${isLocked
                  ? 'bg-gray-800/70 text-white/70 border border-white/10 backdrop-blur-xs cursor-not-allowed'
                  : isCompleted
                    ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white border border-white/10 hover:from-gray-700 hover:to-gray-600 shadow-glow-sm hover:shadow-glow-md'
                    : hasStarted
                      ? 'text-gray-900 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 backdrop-blur-xs border border-amber-400/40 shadow-glow-md hover:shadow-glow-lg'
                      : 'text-gray-900 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 backdrop-blur-xs border border-amber-400/40 shadow-glow-md hover:shadow-glow-lg'
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
                if (!isLocked) onClick?.(e);
              }}
            >
              {!isLocked && (
                <span className="pointer-events-none absolute -inset-[1px] rounded-[18px] opacity-30 group-hover:opacity-50 blur-[2px] transition-opacity bg-gradient-to-r from-amber-400/60 via-amber-300/60 to-orange-400/60" />
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
                ) : hasStarted ? (
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
              {hasStarted && (
                <span className="pointer-events-none absolute left-2 right-2 bottom-1 h-[10px] rounded-full opacity-40 blur-md bg-gradient-to-r from-amber-400/40 via-amber-300/40 to-orange-400/40" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestCard;