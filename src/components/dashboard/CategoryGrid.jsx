import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useLocalQuests } from "../../hooks/useLocalQuests";

// Import 3D Assets
import pilotageIcon from '../../assets/3d/credit-card.jpeg';
import defenseIcon from '../../assets/3d/vault.jpeg';
import growthIcon from '../../assets/3d/coins.jpeg';
import strategyIcon from '../../assets/3d/chess-piece.jpeg';

/**
 * CategoryGrid - Tactical Mission Categories
 * Grille des catégories de missions avec design tactique
 * 
 * @param {Object} props
 * @param {Function} props.onSelectCategory - Callback de sélection (category)
 */
const CategoryGrid = ({ onSelectCategory }) => {
  const { t } = useLanguage();
  const { quests } = useLocalQuests();

  // Tactical Categories: PILOTAGE, DEFENSE, GROWTH, STRATEGY
  const categories = [
    {
      id: 'PILOTAGE',
      image: pilotageIcon,
      labelKey: 'PILOTAGE',
      subtitle: 'Budget & Cashflow',
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/10',
      borderColor: 'border-blue-500/30 shadow-blue-500/20 group-hover:shadow-blue-500/40',
    },
    {
      id: 'DEFENSE',
      image: defenseIcon,
      labelKey: 'DÉFENSE',
      subtitle: 'Épargne & Sécurité',
      color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/10',
      borderColor: 'border-emerald-500/30 shadow-emerald-500/20 group-hover:shadow-emerald-500/40',
    },
    {
      id: 'GROWTH',
      image: growthIcon,
      labelKey: 'CROISSANCE',
      subtitle: 'Investir & Revenus',
      color: 'text-[#E5FF00]',
      bgGradient: 'from-[#E5FF00]/10',
      borderColor: 'border-[#E5FF00]/30 shadow-[#E5FF00]/20 group-hover:shadow-[#E5FF00]/40',
    },
    {
      id: 'STRATEGY',
      image: strategyIcon,
      labelKey: 'STRATÉGIE',
      subtitle: 'Optimisation & Avenir',
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/10',
      borderColor: 'border-purple-500/30 shadow-purple-500/20 group-hover:shadow-purple-500/40',
    },
  ];

  // Compter les quêtes par catégorie
  const getQuestCount = (categoryId) => {
    return quests?.filter(q => q.category === categoryId).length || 0;
  };

  return (
    <div className="grid grid-cols-2 gap-3 px-6">
      {categories.map((cat, index) => {
        const count = getQuestCount(cat.id);

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="group relative h-32 bg-black border border-white/15 shadow-lg hover:border-[#E2FF00] rounded-2xl overflow-hidden text-left transition-all active:scale-95 flex flex-col justify-end p-4"
          >

            {/* 3D Asset (Main Visual) */}
            <div className="absolute right-0 bottom-0 w-24 h-24 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 z-0 pointer-events-none">
              <img
                src={cat.image}
                alt=""
                className="w-full h-full object-contain opacity-95"
              />
            </div>

            {/* Gradient Overlay (Envelops the card and image) */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-0" />

            {/* Text Info */}
            <div className="relative z-10 pointer-events-none">
              <h3 className="font-sans font-bold text-white text-sm tracking-tight uppercase drop-shadow-md">
                {cat.labelKey}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="block font-mono text-[9px] text-neutral-400 uppercase bg-black/40 pr-1 rounded backdrop-blur-sm">
                  {cat.subtitle}
                </span>
                {count > 0 && (
                  <span className={`w-1.5 h-1.5 rounded-full ${cat.color.replace('text-', 'bg-')} animate-pulse`} />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;

