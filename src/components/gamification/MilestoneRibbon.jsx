/**
 * 🎯 MilestoneRibbon
 * Ruban affichant les paliers d'impact atteints et non atteints
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAllMilestonesStatus } from '../../utils/gamification';
import { formatEUR } from '../../utils/impact';

const MilestoneRibbon = ({ totalAnnualImpact = 0, milestones = {}, className = '' }) => {
  const { t, currentLang } = useLanguage();
  const locale = currentLang === 'fr' ? 'fr-FR' : 'en-US';

  const milestonesStatus = getAllMilestonesStatus(totalAnnualImpact, milestones);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`neon-card rounded-2xl p-4 backdrop-blur-sm ${className}`}>
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <FaCheckCircle className="text-amber-500" />
        {t('gamification.milestones.title')}
      </h3>

      <div className="flex flex-wrap gap-3">
        {milestonesStatus.map((milestone, index) => (
          <motion.div
            key={milestone.amount}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 ${
              milestone.unlocked
                ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50'
                : milestone.reached
                ? 'bg-gray-800/50 border-gray-700/50'
                : 'bg-gray-900/30 border-gray-800/50 opacity-50'
            }`}
          >
            {milestone.unlocked && (
              <FaCheckCircle className="text-amber-400 text-sm flex-shrink-0" />
            )}
            <div className="text-center">
              <div className={`font-bold text-sm ${
                milestone.unlocked ? 'text-amber-300' : milestone.reached ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {formatCurrency(milestone.amount)}
              </div>
              <div className="text-xs text-gray-500">
                {currentLang === 'fr' ? '/an' : '/year'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progression globale */}
      {milestonesStatus.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">
              {t('gamification.milestones.progress')}
            </span>
            <span className="text-xs text-gray-400">
              {milestonesStatus.filter(m => m.unlocked).length} / {milestonesStatus.length}
            </span>
          </div>
          <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(milestonesStatus.filter(m => m.unlocked).length / milestonesStatus.length) * 100}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneRibbon;



