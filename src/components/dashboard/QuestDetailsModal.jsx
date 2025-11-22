import React, { useState } from "react";
import { X, Zap, CheckCircle2, Target, ArrowRight, Shield, TrendingUp, BookOpen } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const SUBSCRIPTION_SERVICES = [
  { name: "Netflix", color: "bg-red-600", defaultPrice: 13.49 },
  { name: "Spotify", color: "bg-green-500", defaultPrice: 10.99 },
  { name: "Disney+", color: "bg-blue-600", defaultPrice: 8.99 },
  { name: "Amazon", color: "bg-blue-400", defaultPrice: 6.99 },
  { name: "Tinder", color: "bg-pink-500", defaultPrice: 14.99 },
  { name: "Other", color: "bg-neutral-600", defaultPrice: 0 },
];

// Hardcoded Knowledge Base based on Quest Type
const INTEL_DATABASE = {
  NETFLIX: {
    title: "THE VAMPIRE EFFECT",
    text: "Unused subscriptions are 'Vampire Costs'. They drain wealth silently. Cutting one €15 sub invests ~€2,500 into your future over 10 years with compound interest.",
  },
  COFFEE: {
    title: "THE LATTE FACTOR",
    text: "Small daily expenses are the enemy of wealth. A €5 coffee daily is €1,825/year. That's a plane ticket to Tokyo you are drinking.",
  },
  GROCERY: {
    title: "BRAND TAX",
    text: "Generic brands are often made in the same factories as premium ones. You pay 30% more just for the logo on the box.",
  },
  GENERIC: {
    title: "OPPORTUNITY COST",
    text: "Every Euro spent today is a Euro that cannot work for you tomorrow. Wealth is not what you earn, it's what you keep.",
  }
};

/**
 * QuestDetailsModal - Refonte UI
 * Modal pour lancer et compléter une quête avec 3 phases
 * 
 * @param {Object} props
 * @param {Object} props.quest - Quête à compléter
 * @param {Function} props.onClose - Callback de fermeture
 * @param {Function} props.onComplete - Callback de complétion (modifiedQuest)
 */
const QuestDetailsModal = ({ quest, onClose, onComplete }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState('INTEL'); // 'INTEL' | 'EXECUTION' | 'DEBRIEF'
  
  // Form State
  const [selectedService, setSelectedService] = useState(SUBSCRIPTION_SERVICES[0]);
  const [customName, setCustomName] = useState("");
  const [price, setPrice] = useState(quest.monetaryValue > 0 ? quest.monetaryValue.toString() : "");

  // Intel Data
  const questIconType = quest.iconType || quest.category?.toUpperCase() || 'GENERIC';
  const intel = INTEL_DATABASE[questIconType] || INTEL_DATABASE['GENERIC'];

  // Calculations
  const finalPrice = parseFloat(price) || 0;
  const calculatedXp = Math.floor(finalPrice * 10) + 100;
  const yearlySavings = finalPrice * 12;

  const handleServiceSelect = (service) => {
      setSelectedService(service);
      if (service.name !== "Other") {
          setPrice(service.defaultPrice.toString());
      } else {
          setPrice("");
      }
  };

  const handleConfirm = () => {
      const finalTitle = selectedService.name === "Other" && customName 
          ? `CANCEL ${customName.toUpperCase()}` 
          : quest.title; 
      
      const modifiedQuest = {
          ...quest,
          title: finalTitle,
          monetaryValue: finalPrice,
          xpReward: calculatedXp
      };
      
      onComplete(modifiedQuest);
  };

  // Step Progress
  const progressWidth = step === 'INTEL' ? '33%' : step === 'EXECUTION' ? '66%' : '100%';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="w-full max-w-md h-[85vh] max-h-[800px] bg-bg-secondary border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col">
        
        {/* --- HEADER (Fixed) --- */}
        <div className="bg-neutral-900 border-b border-neutral-800 flex-shrink-0 relative">
            {/* Progress Bar - VOLT */}
            <div className="absolute top-0 left-0 h-1 bg-neutral-800 w-full">
                <div className="h-full bg-volt transition-all duration-500" style={{ width: progressWidth }} />
            </div>
            <div className="p-6 pt-7 flex justify-between items-start">
                <div>
                    <span className="font-mono text-[10px] text-volt tracking-widest uppercase block mb-1">
                        {step === 'INTEL' ? 'PHASE 1 - INTEL' : step === 'EXECUTION' ? 'PHASE 2 - EXEC' : 'PHASE 3 - DEBRIEF'}
                    </span>
                    <h2 className="font-sans font-bold text-xl text-white leading-tight uppercase truncate max-w-[200px]">
                        {step === 'INTEL' ? 'MISSION BRIEF' : step === 'EXECUTION' ? 'EXECUTION' : 'DEBRIEF'}
                    </h2>
                </div>
                <button 
                  onClick={onClose} 
                  className="text-neutral-500 hover:text-white transition-colors p-1"
                  aria-label={t('ui.close')}
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* --- BODY (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
            
            {/* PHASE 1: INTEL */}
            {step === 'INTEL' && (
                <div className="space-y-6 animate-slide-up">
                    <div className="flex justify-center py-4">
                        <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center text-4xl border border-neutral-700 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                            <div className="relative z-10">
                                {questIconType === 'NETFLIX' ? 'N' : questIconType === 'COFFEE' ? '☕' : '🧠'}
                            </div>
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20" />
                        </div>
                    </div>

                    <div className="bg-neutral-900/80 border border-white/10 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-20">
                            <BookOpen className="w-16 h-16 text-white" />
                        </div>
                        <h3 className="font-mono text-xs text-volt font-bold mb-2 uppercase flex items-center gap-2">
                            <Shield className="w-3 h-3" /> {intel.title}
                        </h3>
                        <p className="font-sans text-sm text-neutral-300 leading-relaxed">
                            {intel.text}
                        </p>
                    </div>

                    <div className="text-center">
                        <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2 block">
                          {t('quest.objectives') || 'OBJECTIVE'}
                        </span>
                        <p className="text-white font-bold text-lg leading-tight">"{quest.description}"</p>
                    </div>
                </div>
            )}

            {/* PHASE 2: EXECUTION */}
            {step === 'EXECUTION' && (
                <div className="space-y-6 animate-slide-up">
                    {/* Service Selection */}
                    {(questIconType === 'NETFLIX' || quest.category === 'savings') && (
                        <div>
                            <label className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2 block">
                              {t('quickwin.step1_title') || 'TARGET SELECTION'}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {SUBSCRIPTION_SERVICES.map(service => (
                                    <button
                                        key={service.name}
                                        onClick={() => handleServiceSelect(service)}
                                        className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                                            selectedService.name === service.name 
                                            ? 'bg-white text-black border-white shadow-lg' 
                                            : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                                        }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full ${service.color} flex items-center justify-center text-white font-bold text-[10px]`}>
                                            {service.name[0]}
                                        </div>
                                        <span className="font-mono text-[9px] font-bold truncate w-full">{service.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Custom Name Input */}
                    {selectedService.name === "Other" && (
                        <div className="animate-in fade-in">
                            <input 
                                type="text"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                placeholder={t('quickwin.sub_name_placeholder') || 'Service name'}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-volt focus:outline-none font-mono text-sm uppercase"
                            />
                        </div>
                    )}

                    {/* Price Input */}
                    <div>
                         <label className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2 block">
                           {t('quickwin.sub_price_placeholder') || 'VERIFY COST'}
                         </label>
                         <div className="relative group">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-neutral-500 group-focus-within:text-volt transition-colors">€</div>
                             <input 
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-4 pl-12 pr-4 text-white text-2xl font-bold focus:border-volt focus:outline-none font-mono transition-colors"
                                placeholder="0.00"
                                autoFocus
                             />
                         </div>
                         <p className="font-mono text-[9px] text-neutral-500 mt-2 text-right">
                             Enter your monthly cost
                         </p>
                    </div>
                </div>
            )}

            {/* PHASE 3: DEBRIEF */}
            {step === 'DEBRIEF' && (
                <div className="space-y-6 animate-slide-up">
                    
                    {/* Impact Card - VOLT */}
                    <div className="bg-gradient-to-br from-neutral-900 to-black border border-volt/30 rounded-2xl p-6 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(226,255,0,0.2)_0%,transparent_70%)] animate-pulse-slow" />
                        <h3 className="font-mono text-[10px] text-volt uppercase tracking-widest mb-1 relative z-10">
                          {t('impact.hero.total_label') || 'PROJECTED IMPACT'}
                        </h3>
                        <div className="text-4xl font-black text-volt tracking-tighter relative z-10 text-glow-volt">
                            +€{yearlySavings.toFixed(2)}
                        </div>
                        <p className="font-mono text-[10px] text-neutral-500 mt-1 relative z-10">/ {t('ui.year')}</p>
                    </div>

                    {/* Rewards Breakdown - VOLT */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-volt/20 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-volt fill-volt" />
                                </div>
                                <div>
                                    <div className="font-bold text-white text-sm">{t('quest.xp_earned')}</div>
                                    <div className="font-mono text-[9px] text-neutral-500">Performance bonus</div>
                                </div>
                            </div>
                            <span className="font-mono text-lg font-bold text-volt">+{calculatedXp}</span>
                        </div>

                        <div className="flex items-center justify-between bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-volt/20 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-volt" />
                                </div>
                                <div>
                                    <div className="font-bold text-white text-sm">{t('dashboard.streak')}</div>
                                    <div className="font-mono text-[9px] text-neutral-500">Streak maintained</div>
                                </div>
                            </div>
                            <span className="font-mono text-lg font-bold text-volt">+1 {t('ui.day')}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* --- FOOTER (Fixed) --- */}
        <div className="p-6 bg-bg-secondary border-t border-neutral-800 flex-shrink-0 z-20">
            {step === 'INTEL' && (
                <button 
                    onClick={() => setStep('EXECUTION')}
                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-volt-glow hover:scale-[1.02] active:scale-95"
                >
                    {t('ui.continue') || 'PROCEED'} <ArrowRight className="w-4 h-4" />
                </button>
            )}

            {step === 'EXECUTION' && (
                <button 
                    onClick={() => setStep('DEBRIEF')}
                    disabled={!price}
                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-volt-glow hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none active:scale-95"
                >
                    CALCULATE <Target className="w-4 h-4" />
                </button>
            )}

            {step === 'DEBRIEF' && (
                <button 
                    onClick={handleConfirm}
                    className="w-full bg-volt text-black font-bold font-sans py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 shadow-volt-glow hover:scale-[1.02] active:scale-95"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    {t('ui.complete') || 'CLAIM REWARDS'}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuestDetailsModal;

