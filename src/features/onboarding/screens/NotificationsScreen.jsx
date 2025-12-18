/**
 * 🎮 ÉCRAN 4 : LA CONFIGURATION (Le "Loadout")
 * "CANAL SÉCURISÉ" - Obtenir les permissions notifications intelligemment
 * 
 * Argumentaire: "Pour réussir tes missions, tu as besoin de renseignements en temps réel."
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Bell, BellOff, Shield, Zap, Target } from 'lucide-react';
import { haptic } from '../../../utils/haptics';
import { onboardingStore } from '../onboardingStore';

const RadarAnimation = () => {
  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Outer rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-[#E2FF00]/20"
          style={{
            transform: `scale(${0.4 + i * 0.3})`,
          }}
        />
      ))}
      
      {/* Radar sweep */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
          style={{
            background: 'linear-gradient(90deg, #E2FF00 0%, transparent 100%)',
            transform: 'translateY(-50%)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 origin-left"
          style={{
            width: '50%',
            height: '50%',
            background: 'conic-gradient(from 0deg, rgba(226, 255, 0, 0.15) 0deg, transparent 60deg)',
            transform: 'translateY(-50%)',
            borderRadius: '0 100% 0 0',
          }}
        />
      </motion.div>

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-[#E2FF00]/10 border border-[#E2FF00]/30 
                     flex items-center justify-center"
        >
          <Radio className="w-7 h-7 text-[#E2FF00]" />
        </motion.div>
      </div>

      {/* Blips */}
      {[
        { x: '25%', y: '30%', delay: 0 },
        { x: '70%', y: '45%', delay: 1.5 },
        { x: '40%', y: '75%', delay: 3 },
      ].map((blip, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#E2FF00]"
          style={{ left: blip.x, top: blip.y }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: blip.delay,
          }}
        />
      ))}
    </div>
  );
};

const BenefitItem = ({ icon: Icon, title, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3"
  >
    <div className="w-10 h-10 rounded-xl bg-[#E2FF00]/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-[#E2FF00]" />
    </div>
    <span className="text-neutral-300 text-sm">{title}</span>
  </motion.div>
);

const NotificationsScreen = ({ onComplete }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);

  const requestNotificationPermission = async () => {
    setIsRequesting(true);
    haptic.medium();

    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('Notifications not supported');
        onboardingStore.setNotificationsEnabled(false);
        handleComplete(false);
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        haptic.success();
        onboardingStore.setNotificationsEnabled(true);
        
        // Show a test notification
        new Notification('MONIYO', {
          body: 'Canal sécurisé activé. Prêt pour les missions.',
          icon: '/pwa-192x192.png',
        });
        
        setTimeout(() => handleComplete(true), 1000);
      } else {
        handleComplete(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      handleComplete(false);
    }
  };

  const handleSkip = () => {
    haptic.light();
    onboardingStore.setNotificationsEnabled(false);
    handleComplete(false);
  };

  const handleComplete = (notificationsEnabled) => {
    setTimeout(() => {
      onComplete(notificationsEnabled);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden">
      {/* Background effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(226, 255, 0, 0.03) 0%, transparent 50%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-6 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#E2FF00] font-mono text-xs tracking-[0.3em] mb-3"
          >
            CONFIGURATION FINALE
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-black text-white tracking-tight"
          >
            CANAL SÉCURISÉ
          </motion.h1>
        </motion.div>

        {/* Radar animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <RadarAnimation />
        </motion.div>

        {/* Explanation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-8 max-w-sm mx-auto"
        >
          <p className="text-neutral-400 text-sm leading-relaxed">
            Pour réussir tes missions, tu as besoin de{' '}
            <span className="text-white font-medium">renseignements en temps réel</span>.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="space-y-4 max-w-sm mx-auto w-full mb-auto"
        >
          <BenefitItem 
            icon={Target} 
            title="Alertes de nouvelles missions" 
            delay={1}
          />
          <BenefitItem 
            icon={Zap} 
            title="Rappels pour tes défis quotidiens" 
            delay={1.1}
          />
          <BenefitItem 
            icon={Shield} 
            title="Notifications de dépenses suspectes" 
            delay={1.2}
          />
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-8 space-y-3 max-w-sm mx-auto w-full"
        >
          {/* Main CTA */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={requestNotificationPermission}
            disabled={isRequesting}
            className={`
              w-full bg-[#E2FF00] text-black font-black py-4 px-8 rounded-xl 
              shadow-[0_0_30px_rgba(226,255,0,0.3)] 
              hover:shadow-[0_0_50px_rgba(226,255,0,0.5)]
              active:scale-[0.98] transition-all duration-200
              uppercase tracking-wider text-base flex items-center justify-center gap-3
              ${isRequesting ? 'opacity-70' : ''}
            `}
          >
            <Bell className="w-5 h-5" />
            {isRequesting ? 'ACTIVATION...' : 'ACTIVER LES NOTIFICATIONS'}
          </motion.button>

          {/* Skip button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSkip}
            disabled={isRequesting}
            className="w-full py-3 px-8 rounded-xl font-bold text-sm uppercase tracking-wide
                       text-neutral-500 hover:text-neutral-300 transition-colors
                       flex items-center justify-center gap-2"
          >
            <BellOff className="w-4 h-4" />
            Rester en silence radio
          </motion.button>
        </motion.div>

        {/* Permission status feedback */}
        <AnimatePresence>
          {permissionStatus === 'granted' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-center"
            >
              <p className="text-emerald-400 text-sm font-medium">
                ✓ Canal activé avec succès
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
        <div className="w-6 h-2 rounded-full bg-[#E2FF00]" />
      </div>
    </div>
  );
};

export default NotificationsScreen;
