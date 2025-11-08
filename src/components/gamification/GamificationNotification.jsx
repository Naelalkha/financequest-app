/**
 * 🎉 GamificationNotification
 * Bannière affichée quand un palier ou badge est débloqué
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatBadge } from '../../utils/gamification';
import { formatEUR } from '../../utils/impact';

const GamificationNotification = ({ 
  type, // 'milestone' | 'badge' | 'level'
  data, // { amount?, badgeId?, level? }
  onClose,
  className = '',
}) => {
  const { t, currentLang } = useLanguage();
  const locale = currentLang === 'fr' ? 'fr-FR' : 'en-US';

  useEffect(() => {
    // Auto-close après 5 secondes
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  let content = null;

  if (type === 'milestone' && data.amount) {
    content = (
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
          <FaTrophy className="text-white text-2xl" />
        </div>
        <div className="flex-1">
          <div className="text-white font-bold text-lg">
            {t('gamification.toasts.milestone', { amount: data.amount })}
          </div>
          <div className="text-gray-300 text-sm">
            {t('gamification.milestones.reached', { amount: formatCurrency(data.amount).replace(/[€$]/g, '') })}
          </div>
        </div>
      </div>
    );
  } else if (type === 'badge' && data.badgeId) {
    const badge = formatBadge(data.badgeId, currentLang, new Date().toISOString());
    content = (
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 text-5xl">
          {badge.icon}
        </div>
        <div className="flex-1">
          <div className="text-white font-bold text-lg">
            {t('gamification.toasts.badge', { name: badge.name })}
          </div>
          <div className="text-gray-300 text-sm">
            {badge.description}
          </div>
        </div>
      </div>
    );
  } else if (type === 'level' && data.level) {
    content = (
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
          <span className="text-white font-extrabold text-2xl">{data.level}</span>
        </div>
        <div className="flex-1">
          <div className="text-white font-bold text-lg">
            {t('gamification.toasts.level_up', { level: data.level })}
          </div>
          <div className="text-gray-300 text-sm">
            {currentLang === 'fr' ? 'Continue pour débloquer plus de badges !' : 'Keep going to unlock more badges!'}
          </div>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={`neon-card rounded-2xl p-6 backdrop-blur-sm border-2 border-amber-500/50 shadow-xl relative overflow-hidden ${className}`}
      >
        {/* Confetti effect background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
          <div className="absolute top-0 right-1/4 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
          <div className="absolute bottom-0 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
        </div>

        {content}

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default GamificationNotification;



