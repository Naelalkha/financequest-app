/**
 * 🏆 Achievements Page
 * Page dédiée pour afficher tous les badges et accomplissements
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGamification } from '../../hooks/useGamification';
import { BadgeGrid } from '../gamification';
import AppBackground from '../app/AppBackground';
import LoadingSpinner from '../app/LoadingSpinner';

const Achievements = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { gamification, loading } = useGamification();

  // Préparer les badges pour BadgeGrid
  // Les badges sont stockés comme un tableau d'IDs dans gamification.badges
  const badges = gamification?.badges || [];

  if (loading) {
    return (
      <AppBackground variant="finance" grain grid={false} animate>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground variant="finance" grain grid={false} animate>
      <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]">
        <div className="px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
              >
                <FaArrowLeft className="text-sm" />
                <span className="text-sm font-semibold">
                  {t('ui.back') || 'Retour'}
                </span>
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/40 flex items-center justify-center">
                  <FaTrophy className="text-amber-400 text-3xl" />
                </div>
                <div>
                  <h1 
                    className="text-3xl font-bold text-white mb-1"
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}
                  >
                    {t('dashboard.badges') || 'Badges'} & {t('dashboard.achievements') || 'Accomplissements'}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {t('gamification.badges.see_all') || 'Découvre tous tes badges et accomplissements'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Badge Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BadgeGrid badges={badges} />
            </motion.div>
          </div>
        </div>
      </div>
    </AppBackground>
  );
};

export default Achievements;

