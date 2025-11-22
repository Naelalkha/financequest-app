import React from "react";
import { LayoutList, PenTool } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * DashboardActions Component (Refonte UI)
 * 
 * Affiche deux actions principales pour le dashboard :
 * - MISSIONS LOG : Gestion des contrats/quêtes actives
 * - QUICK LOG : Enregistrement rapide d'une action
 * 
 * @param {Object} props
 * @param {Function} props.onOpenMissions - Callback lors du clic sur "Missions Log"
 * @param {Function} props.onQuickLog - Callback lors du clic sur "Quick Log"
 */
export const DashboardActions = ({ onOpenMissions, onQuickLog }) => {
  const { t } = useLanguage();

  return (
    <div className="px-6 mt-4 grid grid-cols-2 gap-4 animate-slide-up delay-75">
      
      {/* Action A: MISSIONS LOG (Active) */}
      <button 
        onClick={onOpenMissions}
        className="group relative bg-neutral-900 border border-neutral-800 hover:border-volt/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all overflow-hidden active:scale-95"
        aria-label={t('dashboard.missionsLog')}
      >
        {/* Holographic effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-volt/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000" />
        
        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-volt group-hover:text-black transition-colors">
          <LayoutList className="w-5 h-5" />
        </div>
        <div className="text-center">
          <span className="block font-sans font-bold text-white text-sm">{t('dashboard.missionsLog')}</span>
          <span className="block font-mono text-[9px] text-neutral-500 uppercase mt-1">{t('dashboard.manageContracts')}</span>
        </div>
      </button>

      {/* Action B: QUICK LOG */}
      <button 
        onClick={onQuickLog}
        className="group relative bg-white text-black border border-transparent rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:bg-neutral-200"
        aria-label={t('dashboard.quickLog')}
      >
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
          <PenTool className="w-4 h-4" />
        </div>
        <div className="text-center">
          <span className="block font-sans font-bold text-black text-sm">{t('dashboard.quickLog')}</span>
          <span className="block font-mono text-[9px] text-neutral-600 uppercase mt-1">{t('dashboard.quickLogDesc')}</span>
        </div>
      </button>

    </div>
  );
};

export default DashboardActions;

