/**
 * 🎮 ÉCRAN 2 : LE MINI-TUTO INTERACTIF (La Mécanique)
 * "CIBLER. ÉLIMINER." - Apprendre le geste clé sans texte ennuyeux
 * 
 * L'utilisateur DOIT interagir pour avancer
 * Feedback immédiat avec +XP animation
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Check, Minus, TrendingUp, MousePointerClick, Lightbulb } from 'lucide-react';
import { haptic } from '../../../utils/haptics';
import { onboardingStore } from '../onboardingStore';

// Tutorial expense card data
const TUTORIAL_EXPENSE = {
  name: 'Café Quotidien',
  amount: 60,
  frequency: '/mois',
  icon: Coffee,
  savingsIfReduced: 35,
  xpReward: 20,
  investmentPotential: 6400, // 35€/mois sur 10 ans à 7% (S&P500)
};

const XPPopup = ({ amount, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 400,
        damping: 15
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0],
        }}
        transition={{ duration: 0.4 }}
        className="bg-[#E2FF00] text-black font-black text-2xl px-6 py-3 rounded-xl shadow-[0_0_40px_rgba(226,255,0,0.6)]"
      >
        +{amount} XP
      </motion.div>
    </motion.div>
  );
};

const ExpenseCard = ({ expense, onAction, disabled, actionTaken }) => {
  const Icon = expense.icon;
  
  const handleAction = (action) => {
    if (disabled) return;
    haptic.medium();
    onAction(action);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 30 }}
      animate={{ 
        scale: actionTaken ? 0.95 : 1, 
        opacity: 1, 
        y: 0,
        backgroundColor: actionTaken === 'reduce' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)'
      }}
      exit={{ 
        scale: 0.8, 
        opacity: 0,
        x: actionTaken === 'reduce' ? 100 : 0,
        rotateZ: actionTaken === 'reduce' ? 5 : 0
      }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
      className={`
        relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden
        border transition-colors duration-300
        ${actionTaken === 'reduce' 
          ? 'border-emerald-500/50' 
          : 'border-white/10'
        }
      `}
    >
      {/* Success overlay */}
      <AnimatePresence>
        {actionTaken === 'reduce' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-500/10 z-10 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card header */}
      <div className="bg-white/5 px-5 py-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-[#E2FF00]/10 flex items-center justify-center">
            <Icon className="w-7 h-7 text-[#E2FF00]" />
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">{expense.name}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{expense.amount}€</span>
              <span className="text-neutral-500 text-sm">{expense.frequency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 flex gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAction('keep')}
          disabled={disabled}
          className={`
            flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wide
            border border-white/10 text-neutral-400
            transition-all duration-200
            ${disabled ? 'opacity-50' : 'hover:border-white/20 hover:text-white active:scale-95'}
          `}
        >
          Garder
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAction('reduce')}
          disabled={disabled}
          className={`
            flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wide
            bg-[#E2FF00] text-black
            shadow-[0_0_20px_rgba(226,255,0,0.3)]
            transition-all duration-200
            ${disabled ? 'opacity-50' : 'hover:shadow-[0_0_30px_rgba(226,255,0,0.5)] active:scale-95'}
          `}
        >
          <span className="flex items-center justify-center gap-2">
            <Minus className="w-4 h-4" />
            Réduire & Investir
          </span>
        </motion.button>
      </div>

      {/* Potential savings hint */}
      <AnimatePresence>
        {!actionTaken && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pb-4"
          >
            <p className="text-xs text-neutral-500 text-center flex items-center justify-center gap-1.5">
              <Lightbulb className="w-3 h-3 text-[#E2FF00]" />
              Réduire = <span className="text-emerald-400 font-medium">+{expense.savingsIfReduced}€ économisés</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const TutorialScreen = ({ onNext }) => {
  const [actionTaken, setActionTaken] = useState(null);
  const [showXP, setShowXP] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  const handleAction = (action) => {
    setActionTaken(action);
    
    if (action === 'reduce') {
      // Success flow
      haptic.success();
      
      // Show XP popup after card animation
      setTimeout(() => {
        setShowXP(true);
        onboardingStore.addTutorialXp(TUTORIAL_EXPENSE.xpReward);
      }, 400);
      
      // Show success message
      setTimeout(() => {
        setShowSuccess(true);
        setCanProceed(true);
      }, 1500);
    } else {
      // Keep action - still allow to proceed but no XP
      setTimeout(() => {
        setShowSuccess(true);
        setCanProceed(true);
      }, 500);
    }
  };

  const handleXPComplete = () => {
    setShowXP(false);
  };

  const handleContinue = () => {
    haptic.medium();
    onNext();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden">
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(226, 255, 0, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(226, 255, 0, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-6 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#E2FF00] font-mono text-xs tracking-[0.3em] mb-3"
          >
            PREMIÈRE ACTION
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-black text-white tracking-tight"
          >
            DÉTECTER. OPTIMISER.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-neutral-500 mt-3 text-sm"
          >
            Identifie une dépense. Choisis ton action.
          </motion.p>
        </motion.div>

        {/* Instruction arrow (animated) */}
        <AnimatePresence>
          {!actionTaken && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center mb-6"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-flex items-center gap-2 text-[#E2FF00] text-sm font-medium"
              >
                <MousePointerClick className="w-4 h-4" />
                <span className="font-mono tracking-wide">FAIS TON CHOIX</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tutorial Card */}
        <div className="flex-1 flex items-center justify-center relative">
          <ExpenseCard
            expense={TUTORIAL_EXPENSE}
            onAction={handleAction}
            disabled={actionTaken !== null}
            actionTaken={actionTaken}
          />

          {/* XP Popup */}
          <AnimatePresence>
            {showXP && (
              <XPPopup 
                amount={TUTORIAL_EXPENSE.xpReward} 
                onComplete={handleXPComplete}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Success message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mt-8 max-w-sm mx-auto"
            >
              {actionTaken === 'reduce' ? (
                <>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-emerald-400 font-bold text-lg mb-2"
                  >
                    Bien joué.
                  </motion.p>
                  <p className="text-neutral-400 text-sm mb-4">
                    Tu as libéré <span className="text-white font-bold">{TUTORIAL_EXPENSE.savingsIfReduced}€/mois</span>.
                  </p>
                  
                  {/* Investment projection */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-emerald-500/10 to-[#E2FF00]/10 border border-emerald-500/30 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-400 text-xs font-mono">POTENTIEL SUR 10 ANS</span>
                    </div>
                    <p className="text-2xl font-black text-[#E2FF00]">
                      +{TUTORIAL_EXPENSE.investmentPotential.toLocaleString('fr-FR')} €
                    </p>
                    <p className="text-neutral-500 text-[10px] mt-1">
                      Investi sur le S&P500 à 7%/an
                    </p>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-300 font-bold text-lg mb-2"
                  >
                    Choix noté.
                  </motion.p>
                  <p className="text-neutral-500 text-sm">
                    Parfois garder a du sens. Tu décides.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue button */}
        <AnimatePresence>
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="w-full max-w-sm mx-auto bg-[#E2FF00] text-black font-black py-4 px-8 rounded-xl 
                           shadow-[0_0_30px_rgba(226,255,0,0.3)] 
                           hover:shadow-[0_0_50px_rgba(226,255,0,0.5)]
                           active:scale-[0.98] transition-all duration-200
                           uppercase tracking-wider text-base flex items-center justify-center gap-3"
              >
                CONTINUER
                <span className="text-lg">→</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
        <div className="w-6 h-2 rounded-full bg-[#E2FF00]" />
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
      </div>
    </div>
  );
};

export default TutorialScreen;
