/**
 * 💾 Save Progress Banner
 * Shown to anonymous users to encourage account creation
 * Dismissible but reappears on next session
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { DURATION, EASE } from '../../styles/animationConstants';

const DISMISS_KEY = 'moniyo-banner-dismissed';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

// Compute initial dismissed state synchronously to avoid layout shift
const getInitialDismissedState = (): boolean => {
    if (typeof window === 'undefined') return true;
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
        const timeSinceDismiss = Date.now() - parseInt(dismissedAt, 10);
        return timeSinceDismiss < DISMISS_DURATION;
    }
    return false;
};

const SaveProgressBanner: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation('profile');
    // Initialize synchronously to prevent layout shift
    const [isDismissed, setIsDismissed] = useState(getInitialDismissedState);

    // Don't show if not anonymous or dismissed
    // TODO: Type user properly when AuthContext is migrated
    const isAnonymous = (user as { isAnonymous?: boolean })?.isAnonymous;
    const shouldShow = isAnonymous && !isDismissed;

    if (!isAnonymous) {
        return null;
    }

    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
        setIsDismissed(true);
    };

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    className="px-6 mt-4"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: DURATION.medium, ease: EASE.outExpo }}
                >
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
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SaveProgressBanner;
