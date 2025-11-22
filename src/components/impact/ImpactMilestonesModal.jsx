import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTrophy, FaLock, FaChevronRight, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { IMPACT_MILESTONES } from '../../config/gamification';

const ImpactMilestonesModal = ({ 
  isOpen, 
  onClose, 
  currentTotal, 
  period, 
  formatCurrency, 
  language 
}) => {
  const { t } = useLanguage();

  // Ne rien rendre si fermé
  if (!isOpen) return null;

  // Calculer l'index du prochain palier
  const sortedMilestones = [...IMPACT_MILESTONES].sort((a, b) => a - b);
  const nextMilestoneIndex = sortedMilestones.findIndex(m => m > currentTotal);
  // Si tous atteints, index = length (hors limites), sinon index du prochain
  const targetIndex = nextMilestoneIndex === -1 ? sortedMilestones.length : nextMilestoneIndex;

  const displaySuffix = period === 'year' 
    ? (language === 'fr' ? '/an' : '/year')
    : (language === 'fr' ? '/mois' : '/month');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 m-0 p-0 bg-black/80 backdrop-blur-sm z-[9998]"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              margin: 0,
              padding: 0,
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] h-[85vh] flex flex-col bg-gray-900 rounded-t-3xl border-t border-white/10 shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(23, 23, 23, 1) 0%, rgba(10, 10, 10, 1) 100%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Sticky */}
            <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/5 bg-gray-900/95 backdrop-blur-md z-10 rounded-t-3xl flex-shrink-0">
              {/* Handle bar for mobile feel */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/10 rounded-full" />
              
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <FaTrophy className="text-amber-400" />
                  {t('impact.milestones.title') || (language === 'fr' ? 'Tous les paliers' : 'All milestones')}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {t('impact.milestones.reached_count', { current: targetIndex, total: sortedMilestones.length }) || `${targetIndex}/${sortedMilestones.length} ${language === 'fr' ? 'atteints' : 'reached'}`}
                </p>
              </div>
              
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="p-6 pb-24 pl-4 sm:pl-8 space-y-8 relative">
                {/* Ligne de timeline verticale continue */}
                <div className="absolute left-[23px] sm:left-[39px] top-6 bottom-24 w-[2px] bg-gradient-to-b from-emerald-500 via-amber-500 to-gray-800 opacity-30 rounded-full" />

                {sortedMilestones.map((milestone, index) => {
                  const isReached = index < targetIndex;
                  const isNext = index === targetIndex;
                  const isLocked = index > targetIndex;
                  
                  const displayAmount = period === 'year' ? milestone : Math.round(milestone / 12);
                  
                  return (
                    <motion.div 
                      key={milestone}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative flex items-center gap-4 sm:gap-6 group ${isLocked ? 'opacity-50 grayscale-[0.5]' : ''}`}
                    >
                      {/* Timeline Node */}
                      <div className={`
                        relative z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-300
                        ${isReached 
                          ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                          : isNext 
                            ? 'bg-gray-900 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-110' 
                            : 'bg-gray-900 border-gray-700'
                        }
                      `}>
                        {isReached && <FaCheck className="text-white text-[10px] sm:text-xs" />}
                        {isNext && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-400 rounded-full animate-pulse" />}
                        {isLocked && <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />}
                      </div>

                      {/* Card Content */}
                      <div className={`
                        flex-1 p-4 rounded-xl border transition-all duration-300 flex items-center justify-between
                        ${isReached 
                          ? 'bg-emerald-500/5 border-emerald-500/20' 
                          : isNext 
                            ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5' 
                            : 'bg-white/5 border-white/5'
                        }
                      `}>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wider ${
                              isReached ? 'text-emerald-400' : isNext ? 'text-amber-400' : 'text-gray-500'
                            }`}>
                              {t('impact.milestones.level', { level: index + 1 }) || (language === 'fr' ? `Palier ${index + 1}` : `Level ${index + 1}`)}
                            </span>
                            {isReached && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                                {t('impact.milestones.status_reached') || (language === 'fr' ? 'ATTEINT' : 'REACHED')}
                              </span>
                            )}
                            {isNext && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/20 animate-pulse">
                                {t('impact.milestones.status_next') || (language === 'fr' ? 'PROCHAIN' : 'NEXT')}
                              </span>
                            )}
                          </div>
                          <div className={`text-lg sm:text-xl font-black ${
                            isReached ? 'text-white' : isNext ? 'text-white' : 'text-gray-400'
                          }`}>
                            {formatCurrency(displayAmount, language)}
                            <span className="text-sm font-medium opacity-60 ml-1">{displaySuffix}</span>
                          </div>
                        </div>

                        {isLocked && <FaLock className="text-gray-700" />}
                        {isNext && <FaChevronRight className="text-amber-400 animate-bounce-x" />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ImpactMilestonesModal;
