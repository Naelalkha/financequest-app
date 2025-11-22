import React, { useState, useEffect } from "react";
import { X, Plus, Zap, RefreshCw, Clock, Target } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useLocalQuests } from "../../hooks/useLocalQuests";

/**
 * MissionBoardModal - Refonte UI
 * Modal pour afficher et accepter des missions/quêtes
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal ouvert/fermé
 * @param {Function} props.onClose - Callback de fermeture
 * @param {Function} props.onAccept - Callback d'acceptation de quête (questId)
 * @param {Function} props.onAiScan - Callback pour scan IA
 * @param {boolean} props.isScanning - État de scan
 * @param {Array} props.activeQuestIds - IDs des quêtes actives
 */
const MissionBoardModal = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  onAiScan, 
  isScanning = false,
  activeQuestIds = []
}) => {
  const { t } = useLanguage();
  const { quests, loading } = useLocalQuests();
  const [filteredQuests, setFilteredQuests] = useState([]);

  useEffect(() => {
    if (quests && quests.length > 0) {
      // Afficher seulement les quêtes non commencées
      const available = quests.filter(q => !activeQuestIds.includes(q.id));
      setFilteredQuests(available.slice(0, 10)); // Limiter à 10 quêtes
    }
  }, [quests, activeQuestIds]);

  if (!isOpen) return null;

  const getDifficultyColor = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    if (diff === 'easy' || diff === 'beginner') return 'text-emerald border-emerald/30 bg-emerald/10';
    if (diff === 'medium' || diff === 'intermediate') return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
    return 'text-red-400 border-red-400/30 bg-red-400/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="w-full max-w-md h-[80vh] max-h-[700px] bg-bg-secondary border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/80 backdrop-blur">
          <div>
             <h2 className="font-sans font-bold text-xl text-white">{t('dashboard.explore_quests')}</h2>
             <p className="font-mono text-[10px] text-gold uppercase tracking-widest">Available Missions</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-neutral-500 hover:text-white transition-colors"
            aria-label={t('ui.close')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mission Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
           {loading ? (
             <div className="flex items-center justify-center py-12">
               <RefreshCw className="w-8 h-8 text-gold animate-spin" />
               <span className="ml-3 font-mono text-sm text-neutral-400">{t('ui.loading')}</span>
             </div>
           ) : filteredQuests.length === 0 ? (
             <div className="text-center py-12">
               <Target className="w-12 h-12 mx-auto mb-3 text-neutral-700" />
               <p className="font-mono text-xs text-neutral-500">{t('quests.no_quests')}</p>
             </div>
           ) : (
             filteredQuests.map((quest) => {
               const isActive = activeQuestIds.includes(quest.id);
               
               return (
                 <div 
                   key={quest.id} 
                   className={`relative border rounded-2xl p-4 transition-all ${
                     isActive 
                       ? 'border-emerald/50 bg-emerald/5 opacity-50' 
                       : 'border-neutral-700 bg-neutral-900/50 hover:border-gold/50 hover:bg-neutral-800'
                   }`}
                 >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                         <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${getDifficultyColor(quest.difficulty)}`}>
                           {quest.difficulty?.toUpperCase() || 'MEDIUM'}
                         </span>
                         {quest.premium && (
                           <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border text-purple-400 border-purple-400/30 bg-purple-400/10">
                             PREMIUM
                           </span>
                         )}
                      </div>
                      <span className="font-mono text-[10px] text-gold flex items-center gap-1">
                         <Zap className="w-3 h-3" /> +{quest.xpReward || quest.xp || 100} XP
                      </span>
                    </div>
                    
                    <h3 className="font-sans font-bold text-lg text-white mb-1">
                      {quest.title}
                    </h3>
                    <p className="font-mono text-xs text-neutral-400 mb-3 leading-relaxed line-clamp-2">
                      {quest.description}
                    </p>

                    {quest.estimatedTime && (
                      <div className="flex items-center gap-1 mb-3 text-neutral-500">
                        <Clock className="w-3 h-3" />
                        <span className="font-mono text-[10px]">{quest.estimatedTime}</span>
                      </div>
                    )}
                    
                    {isActive ? (
                       <div className="w-full py-3 rounded-xl border border-emerald/30 text-emerald font-bold text-xs text-center font-mono bg-emerald/10">
                          {t('quests.in_progress')}
                       </div>
                    ) : (
                       <button 
                         onClick={() => onAccept(quest)}
                         className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gold transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95"
                       >
                          <Plus className="w-4 h-4" />
                          {t('quests.start')}
                       </button>
                    )}
                 </div>
               );
             })
           )}
        </div>

        {/* AI Footer */}
        <div className="p-4 border-t border-neutral-800 bg-bg-primary">
            <p className="text-center font-mono text-[9px] text-neutral-500 mb-3 uppercase">
              {t('dashboard.explore')} AI-powered recommendations
            </p>
            <button 
              onClick={onAiScan}
              disabled={isScanning}
              className="w-full border border-dashed border-neutral-700 rounded-xl py-3 text-neutral-400 hover:text-white hover:border-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
                <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
                <span className="font-mono text-xs font-bold">
                  {isScanning ? t('ui.loading') : 'AI SCAN'}
                </span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default MissionBoardModal;

