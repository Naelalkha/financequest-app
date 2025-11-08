/**
 * 🎮 LevelWidget
 * Affiche le niveau actuel, la progression XP et le prochain palier d'impact
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaChartLine } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { computeLevel, getNextMilestone } from '../../utils/gamification';
import { trackEvent } from '../../utils/analytics';
import { formatEUR } from '../../utils/impact';

const LevelWidget = ({ xpTotal = 0, totalAnnualImpact = 0, className = '' }) => {
  const { t, currentLang } = useLanguage();
  const locale = currentLang === 'fr' ? 'fr-FR' : 'en-US';

  const levelData = computeLevel(xpTotal);
  const nextMilestone = getNextMilestone(totalAnnualImpact);

  useEffect(() => {
    // Track vue du widget niveau
    trackEvent('level_widget_viewed', {
      level: levelData.level,
      xp_to_next: levelData.xpNeededForNext,
    });
  }, [levelData.level, levelData.xpNeededForNext]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`neon-card rounded-2xl p-4 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center gap-4 mb-4">
        {/* Badge niveau */}
        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center border-2 border-white/20 shadow-lg">
          <FaTrophy className="text-white text-xl" />
          <span className="absolute text-white font-extrabold text-sm mt-1">
            {levelData.level}
          </span>
        </div>

        {/* Titre et XP */}
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-lg mb-1">
            {t('gamification.level', { level: levelData.level })}
          </div>
          <div className="text-gray-400 text-sm">
            {t('gamification.xp_progress', {
              current: levelData.xpInCurrentLevel.toLocaleString(),
              target: levelData.nextLevelXP ? (levelData.nextLevelXP - levelData.currentLevelXP).toLocaleString() : '∞',
            })}
          </div>
        </div>
      </div>

      {/* Barre de progression XP */}
      {levelData.nextLevelXP && (
        <div className="mb-4">
          <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelData.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-right">
            {levelData.xpNeededForNext.toLocaleString()} XP pour niveau {levelData.level + 1}
          </div>
        </div>
      )}

      {/* Prochain palier d'impact */}
      {nextMilestone && (
        <div className="pt-3 border-t border-gray-700/50 flex items-center gap-2">
          <FaChartLine className="text-amber-400 text-sm" />
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-0.5">
              {t('gamification.milestones.next', {
                amount: formatCurrency(nextMilestone.amount).replace(/[€$]/g, ''),
                remaining: formatCurrency(nextMilestone.remaining).replace(/[€$]/g, ''),
              })}
            </div>
            <div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(totalAnnualImpact / nextMilestone.amount) * 100}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LevelWidget;



