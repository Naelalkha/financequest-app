/**
 * 💾 Save Progress Banner
 * Shown to anonymous users to encourage account creation
 * Dismissible but reappears on next session
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const DISMISS_KEY = 'moniyo-banner-dismissed';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

const SaveProgressBanner = () => {
  const { user } = useAuth();
  const { t } = useTranslation('profile');
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if banner was recently dismissed
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const timeSinceDismiss = Date.now() - parseInt(dismissedAt, 10);
      if (timeSinceDismiss < DISMISS_DURATION) {
        setIsDismissed(true);
        return;
      }
    }
    setIsDismissed(false);
  }, []);

  // Don't show if not anonymous or dismissed
  if (!user?.isAnonymous || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  return (
    <div className="px-6 mt-4">
      <div className="relative bg-gradient-to-r from-[#E2FF00]/10 to-[#E2FF00]/5 border border-[#E2FF00]/20 rounded-xl p-4">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 text-neutral-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#E2FF00]/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-[#E2FF00]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-sans text-white font-bold text-sm mb-0.5 tracking-tight">
              {t('saveProgressTitle') || 'Sauvegarde ta progression'}
            </h3>
            <p className="font-sans text-neutral-400 text-xs mb-2.5 leading-relaxed">
              {t('bannerDescription') || 'Crée un compte gratuit pour ne jamais perdre tes XP et badges.'}
            </p>

            {/* CTA */}
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-[#E2FF00] font-mono text-[10px] font-bold uppercase tracking-wider hover:text-white transition-colors"
            >
              {t('createAccount') || 'Créer un compte'}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveProgressBanner;
