/**
 * 🏆 BadgeGrid
 * Grille affichant tous les badges (débloqués et verrouillés)
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { BADGES, BADGE_DISPLAY_ORDER } from '../../../config/gamification';
import { formatBadge, FormattedBadge } from '../../../utils/gamification';
import { trackEvent } from '../../../utils/analytics';

/** Badge data that can be either a string ID or an object */
type BadgeInput = string | { id: string; unlockedAt?: Date | string | null };

/** BadgeGrid props */
interface BadgeGridProps {
  badges?: BadgeInput[];
  className?: string;
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges = [], className = '' }) => {
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    // Track vue des badges
    trackEvent('badges_viewed', { count_unlocked: badges.length });
  }, [badges.length]);

  // Créer un Set pour vérification rapide (only IDs)
  const badgeIds = badges.map(b => typeof b === 'string' ? b : b.id);
  const badgesSet = new Set(badgeIds);

  // Trier les badges selon l'ordre d'affichage
  const sortedBadges: FormattedBadge[] = BADGE_DISPLAY_ORDER.map((badgeId: string) => {
    const badge = BADGES[badgeId];
    if (!badge) return null;

    const unlockedAt = badgesSet.has(badgeId)
      ? (badges.find(b => (typeof b === 'string' ? b : b.id) === badgeId) as BadgeInput | undefined)
      : null;

    const unlockedDate = unlockedAt && typeof unlockedAt === 'object' ? unlockedAt.unlockedAt : (unlockedAt ? true : null);

    return formatBadge(badgeId, i18n.language, unlockedDate);
  }).filter((b): b is FormattedBadge => b !== null);

  // Ajouter les badges non listés dans l'ordre (au cas où)
  Object.keys(BADGES).forEach((badgeId: string) => {
    if (!BADGE_DISPLAY_ORDER.includes(badgeId)) {
      const unlockedAt = badgesSet.has(badgeId)
        ? (badges.find(b => (typeof b === 'string' ? b : b.id) === badgeId) as BadgeInput | undefined)
        : null;

      const unlockedDate = unlockedAt && typeof unlockedAt === 'object' ? unlockedAt.unlockedAt : (unlockedAt ? true : null);
      sortedBadges.push(formatBadge(badgeId, i18n.language, unlockedDate));
    }
  });

  const unlockedCount = badges.length;
  const totalCount = Object.keys(BADGES).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-xl flex items-center gap-2">
          <span>🏆</span>
          {t('gamification.badges.title')}
        </h3>
        <span className="text-gray-400 text-sm">
          {t('gamification.badges.count', { count: unlockedCount, total: totalCount })}
        </span>
      </div>

      {/* Grille de badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`neon-card rounded-xl p-4 backdrop-blur-sm border-2 flex flex-col items-center gap-3 ${badge.unlocked
              ? 'border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/10'
              : 'border-gray-700/50 bg-gray-900/30 opacity-60'
              }`}
          >
            {/* Icône badge */}
            <div className={`text-5xl ${badge.unlocked ? '' : 'grayscale opacity-50'}`}>
              {badge.icon || '🏆'}
            </div>

            {/* Nom */}
            <div className="text-center">
              <div className={`font-bold text-sm mb-1 ${badge.unlocked ? 'text-white' : 'text-gray-500'
                }`}>
                {badge.name}
              </div>
              <div className={`text-xs ${badge.unlocked ? 'text-gray-400' : 'text-gray-600'
                }`}>
                {badge.description}
              </div>
            </div>

            {/* État */}
            {badge.unlocked ? (
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <FaCheckCircle className="text-xs" />
                {badge.unlockedAt && typeof badge.unlockedAt === 'string' ? (
                  <span>{t('gamification.badges.unlocked_on', { date: new Date(badge.unlockedAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US') })}</span>
                ) : (
                  <span>{t('gamification.badges.unlocked')}</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <FaLock className="text-xs" />
                <span>{t('gamification.badges.locked')}</span>
              </div>
            )}

            {/* Effet de brillance si débloqué */}
            {badge.unlocked && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${badge.color}20, transparent)`,
                  pointerEvents: 'none',
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty state si aucun badge */}
      {unlockedCount === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">🔒</div>
          <p>{t('gamification.badges.locked')}</p>
          <p className="text-sm mt-2">
            {i18n.language === 'fr'
              ? 'Termine des quêtes et enregistre des économies pour débloquer tes premiers badges !'
              : 'Complete quests and save money to unlock your first badges!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BadgeGrid;



