import { motion } from 'framer-motion';
import { FaChevronRight, FaTrophy, FaCheck, FaLock } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const ImpactNextMilestone = ({ 
  nextMilestone, 
  formatCurrency, 
  language, 
  onClick 
}) => {
  const { t } = useLanguage();

  if (!nextMilestone || !nextMilestone.target) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl border border-amber-500/20 cursor-pointer group"
      style={{
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%)'
      }}
    >
      {/* Glow Effect */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors duration-500" />

      {/* Progress Bar Background integrated */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-white/5 w-full">
        <motion.div 
          className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${nextMilestone.progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="relative px-5 py-4 flex items-center justify-between gap-4">
        {/* Left: Trophy & Info */}
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:scale-105 transition-transform duration-300">
            <FaTrophy className="text-amber-400 text-lg drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            {/* Petit indicateur de niveau */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-900 border border-amber-500/50 flex items-center justify-center text-[10px] font-bold text-amber-400">
              {nextMilestone.currentIndex + 1}
            </div>
          </div>
          
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-amber-500/80 uppercase tracking-wider mb-0.5 flex items-center gap-2">
              {t('impact.next_milestone.label') || 'PROCHAIN PALIER'}
              <span className="w-1 h-1 rounded-full bg-amber-500/50" />
              <span className="text-gray-500">{nextMilestone.progress.toFixed(0)}%</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white leading-none flex items-baseline gap-1">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {formatCurrency(nextMilestone.target, language)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Remaining & Action */}
        <div className="flex items-center gap-4 text-right">
          <div className="hidden xs:block">
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-0.5">
              {t('impact.next_milestone.remaining_label') || 'MANQUE'}
            </div>
            <div className="text-sm sm:text-base font-bold text-amber-400 tabular-nums">
              {formatCurrency(nextMilestone.remaining, language)}
            </div>
          </div>
          
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-all duration-300">
            <FaChevronRight className="text-gray-400 text-xs group-hover:text-amber-400 transition-colors" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImpactNextMilestone;

