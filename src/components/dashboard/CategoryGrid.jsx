import React from "react";
import { Zap, Shield, TrendingUp, Target } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useLocalQuests } from "../../hooks/useLocalQuests";

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

  // Tactical Categories: OPS, DEFENSE, GROWTH, STRATEGY
  const categories = [
    {
      id: 'OPS',
      icon: Zap,
      labelKey: 'categories.ops.label',
      descKey: 'categories.ops.desc',
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/10',
      borderColor: 'border-blue-500/30 shadow-blue-500/20 group-hover:shadow-blue-500/40',
    },
    {
      id: 'DEFENSE',
      icon: Shield,
      labelKey: 'categories.defense.label',
      descKey: 'categories.defense.desc',
      color: 'text-emerald-400',
      bgGradient: 'from-emerald-500/10',
      borderColor: 'border-emerald-500/30 shadow-emerald-500/20 group-hover:shadow-emerald-500/40',
    },
    {
      id: 'GROWTH',
      icon: TrendingUp,
      labelKey: 'categories.growth.label',
      descKey: 'categories.growth.desc',
      color: 'text-[#E5FF00]',
      bgGradient: 'from-[#E5FF00]/10',
      borderColor: 'border-[#E5FF00]/30 shadow-[#E5FF00]/20 group-hover:shadow-[#E5FF00]/40',
    },
    {
      id: 'STRATEGY',
      icon: Target,
      labelKey: 'categories.strategy.label',
      descKey: 'categories.strategy.desc',
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
        const Icon = cat.icon;
        const count = getQuestCount(cat.id);

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="group relative h-32 bg-[#0A0A0A] border border-neutral-800 hover:border-neutral-600 rounded-2xl overflow-hidden text-left transition-all active:scale-95 flex flex-col justify-between p-4"
          >
            {/* Animated Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.bgGradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Watermark Icon (Giant, rotated, decorative) */}
            <Icon
              className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.07] transform -rotate-12 group-hover:rotate-0 transition-all duration-500 ${cat.color}`}
              strokeWidth={1}
            />

            {/* Top Row: Icon & Index */}
            <div className="flex justify-between items-start w-full relative z-10">
              {/* Tactical Badge */}
              <div className={`w-10 h-10 rounded-xl bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center border shadow-[0_0_15px_rgba(0,0,0,0)] transition-all duration-300 ${cat.borderColor} ${cat.color}`}>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>

              {/* Industrial Index Number */}
              <span className="font-mono text-[10px] text-neutral-600 border border-neutral-800 px-1.5 py-0.5 rounded bg-black/50">
                {index + 1}
              </span>
            </div>

            {/* Bottom Row: Text Info */}
            <div className="relative z-10">
              <h3 className="font-sans font-bold text-white text-sm tracking-tight uppercase">
                {t(cat.labelKey)}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="block font-mono text-[9px] text-neutral-500 uppercase">
                  {t(cat.descKey)}
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

