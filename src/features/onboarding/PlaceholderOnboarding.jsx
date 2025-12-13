/**
 * 🎮 Placeholder Onboarding
 * Temporary screen until real onboarding is developed
 * Features:
 * - Dark background matching app theme
 * - Placeholder content
 * - CTA button that completes onboarding and redirects to Dashboard
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, TrendingUp } from 'lucide-react';
import { onboardingStore } from './onboardingStore';
import AppBackground from '../../components/layout/AppBackground';

const PlaceholderOnboarding = () => {
  const navigate = useNavigate();

  const handleEnterApp = () => {
    // Mark onboarding as completed
    onboardingStore.completeOnboarding();
    // Navigate to Dashboard
    navigate('/dashboard', { replace: true });
  };

  return (
    <AppBackground variant="nebula" grain grid={false} animate>
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        {/* Logo/Brand Area */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E2FF00] to-[#B8CC00] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(226,255,0,0.3)]">
            <Sparkles className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            MONIYO
          </h1>
          <p className="text-neutral-400 mt-2 font-medium">
            Maîtrise tes finances. Gagne de l'XP.
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="w-full max-w-sm space-y-4 mb-8">
          {/* Screen 1 Placeholder */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E2FF00]/10 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-[#E2FF00]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Écran 1</h3>
              <p className="text-neutral-500 text-xs">Découvre tes objectifs financiers</p>
            </div>
          </div>

          {/* Screen 2 Placeholder */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E2FF00]/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-[#E2FF00]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Écran 2</h3>
              <p className="text-neutral-500 text-xs">Comprends ton profil dépenses</p>
            </div>
          </div>

          {/* Screen 3 Placeholder */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E2FF00]/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-[#E2FF00]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Écran 3</h3>
              <p className="text-neutral-500 text-xs">Lance ta première quête</p>
            </div>
          </div>
        </div>

        {/* Dev Notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-8 max-w-sm w-full">
          <p className="text-amber-500 text-xs text-center font-medium">
            ⚠️ Onboarding Placeholder — Les vrais écrans arrivent bientôt
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleEnterApp}
          className="w-full max-w-sm bg-[#E2FF00] text-black font-black py-4 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(226,255,0,0.3)] hover:shadow-[0_0_40px_rgba(226,255,0,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide"
        >
          ENTRER DANS L'APP
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Skip text */}
        <p className="text-neutral-600 text-xs mt-4 text-center">
          Mode Invité • Aucun compte requis
        </p>
      </div>
    </AppBackground>
  );
};

export default PlaceholderOnboarding;
