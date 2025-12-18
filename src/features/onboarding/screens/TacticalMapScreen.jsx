/**
 * 🎮 ÉCRAN 5 : LA CARTE TACTIQUE (Tutorial Beacon)
 * "TON QG" - Aperçu rapide des zones du dashboard avec hot spots pulsants
 * 
 * Oriente l'utilisateur avant de le lâcher dans l'app
 * Évite l'effet "je suis perdu" après l'onboarding
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Zap, 
  Trophy, 
  Calendar,
  ChevronRight,
  Crosshair
} from 'lucide-react';
import { haptic } from '../../../utils/haptics';

// Dashboard zones configuration
const DASHBOARD_ZONES = [
  {
    id: 'impact',
    name: 'ZONE IMPACT',
    description: 'Ton score annuel d\'économies. L\'objectif ultime.',
    icon: TrendingUp,
    color: '#E2FF00',
    position: { top: '18%', left: '50%' },
    size: 'large',
  },
  {
    id: 'mission',
    name: 'LANCEUR DE MISSION',
    description: 'Démarre une nouvelle quête tactique ici.',
    icon: Target,
    color: '#E2FF00',
    position: { top: '38%', left: '50%' },
    size: 'medium',
  },
  {
    id: 'daily',
    name: 'DÉFI QUOTIDIEN',
    description: 'Une mission flash chaque jour. Bonus XP garanti.',
    icon: Calendar,
    color: '#10B981',
    position: { top: '58%', left: '50%' },
    size: 'medium',
  },
  {
    id: 'categories',
    name: 'CATÉGORIES',
    description: 'Explore les missions par domaine.',
    icon: Crosshair,
    color: '#8B5CF6',
    position: { top: '78%', left: '30%' },
    size: 'small',
  },
  {
    id: 'collection',
    name: 'COLLECTION',
    description: 'Tes badges et trophées débloqués.',
    icon: Trophy,
    color: '#F59E0B',
    position: { top: '78%', left: '70%' },
    size: 'small',
  },
];

// Pulsing hotspot component
const HotSpot = ({ zone, isActive, onClick, index }) => {
  const Icon = zone.icon;
  const sizes = {
    large: { outer: 'w-20 h-20', inner: 'w-14 h-14', icon: 'w-7 h-7' },
    medium: { outer: 'w-16 h-16', inner: 'w-11 h-11', icon: 'w-5 h-5' },
    small: { outer: 'w-14 h-14', inner: 'w-10 h-10', icon: 'w-4 h-4' },
  };
  const size = sizes[zone.size];

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
      onClick={() => onClick(zone)}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ top: zone.position.top, left: zone.position.left }}
    >
      {/* Outer pulsing ring */}
      <motion.div
        className={`absolute inset-0 ${size.outer} rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2`}
        style={{ backgroundColor: `${zone.color}20` }}
        animate={{
          scale: isActive ? [1, 1.5, 1] : [1, 1.3, 1],
          opacity: isActive ? [0.8, 0, 0.8] : [0.4, 0, 0.4],
        }}
        transition={{
          duration: isActive ? 1 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Second pulsing ring */}
      <motion.div
        className={`absolute inset-0 ${size.outer} rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2`}
        style={{ backgroundColor: `${zone.color}15` }}
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />

      {/* Inner circle with icon */}
      <motion.div
        className={`relative ${size.inner} rounded-full flex items-center justify-center border-2 transition-all duration-300`}
        style={{
          backgroundColor: isActive ? zone.color : `${zone.color}20`,
          borderColor: zone.color,
          boxShadow: isActive 
            ? `0 0 30px ${zone.color}60` 
            : `0 0 15px ${zone.color}30`,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon 
          className={`${size.icon} transition-colors duration-300`}
          style={{ color: isActive ? '#0A0A0A' : zone.color }}
          strokeWidth={2.5}
        />
      </motion.div>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 + index * 0.1 }}
        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <span 
          className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded"
          style={{ 
            color: zone.color,
            backgroundColor: `${zone.color}15`,
          }}
        >
          {zone.name}
        </span>
      </motion.div>
    </motion.button>
  );
};

// Zone detail panel
const ZoneDetailPanel = ({ zone, onClose }) => {
  const Icon = zone.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25 }}
      className="absolute bottom-24 left-4 right-4 z-30"
    >
      <div 
        className="rounded-2xl p-5 border"
        style={{
          backgroundColor: '#0A0A0A',
          borderColor: `${zone.color}40`,
          boxShadow: `0 0 40px ${zone.color}20`,
        }}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${zone.color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: zone.color }} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 
              className="font-black text-sm mb-1"
              style={{ color: zone.color }}
            >
              {zone.name}
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {zone.description}
            </p>
          </div>

          {/* Close hint */}
          <button 
            onClick={onClose}
            className="text-neutral-600 hover:text-white transition-colors p-1"
          >
            <span className="text-xs">✕</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Simplified dashboard preview
const DashboardPreview = ({ activeZone, onZoneClick }) => {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[9/16] rounded-3xl overflow-hidden border border-white/10">
      {/* Dashboard background */}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(226, 255, 0, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(226, 255, 0, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />

        {/* Simplified dashboard elements (blurred) */}
        <div className="absolute inset-0 p-4 space-y-3 opacity-30 blur-[2px]">
          {/* Header placeholder */}
          <div className="flex justify-between items-center">
            <div className="w-24 h-6 bg-white/20 rounded" />
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full" />
              <div className="w-8 h-8 bg-white/20 rounded-full" />
            </div>
          </div>

          {/* Impact card placeholder */}
          <div className="mt-4 h-32 bg-white/10 rounded-2xl" />

          {/* Mission button placeholder */}
          <div className="h-14 bg-[#E2FF00]/20 rounded-xl" />

          {/* Daily challenge placeholder */}
          <div className="h-24 bg-white/10 rounded-xl" />

          {/* Categories placeholder */}
          <div className="flex gap-2">
            <div className="flex-1 h-20 bg-white/10 rounded-xl" />
            <div className="flex-1 h-20 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Hot spots overlay */}
      {DASHBOARD_ZONES.map((zone, index) => (
        <HotSpot
          key={zone.id}
          zone={zone}
          index={index}
          isActive={activeZone?.id === zone.id}
          onClick={onZoneClick}
        />
      ))}

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(5, 5, 5, 0.8) 100%)',
        }}
      />
    </div>
  );
};

const TacticalMapScreen = ({ onNext }) => {
  const [activeZone, setActiveZone] = useState(null);
  const [visitedZones, setVisitedZones] = useState(new Set());
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    haptic.medium();
    
    // Auto-cycle through zones for demo if user doesn't interact
    const timer = setTimeout(() => {
      if (visitedZones.size === 0) {
        setActiveZone(DASHBOARD_ZONES[0]);
        setVisitedZones(new Set(['impact']));
        setShowHint(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [visitedZones.size]);

  const handleZoneClick = (zone) => {
    haptic.light();
    setActiveZone(zone);
    setVisitedZones(prev => new Set([...prev, zone.id]));
    setShowHint(false);
  };

  const handleCloseDetail = () => {
    setActiveZone(null);
  };

  const handleContinue = () => {
    haptic.medium();
    onNext();
  };

  // Calculate progress (how many zones visited)
  const progress = (visitedZones.size / DASHBOARD_ZONES.length) * 100;
  const allVisited = visitedZones.size >= 3; // Require at least 3 zones explored

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden">
      {/* Background radial */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(226, 255, 0, 0.03) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-6 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#E2FF00] font-mono text-xs tracking-[0.3em] mb-2"
          >
            RECONNAISSANCE
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-black text-white tracking-tight"
          >
            TON QG
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-neutral-500 mt-2 text-sm"
          >
            Ici tu surveilles tout. Explore les zones.
          </motion.p>
        </motion.div>

        {/* Hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mb-4"
            >
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[#E2FF00]/70 text-xs font-mono"
              >
                👆 TOUCHE LES POINTS POUR EXPLORER
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard preview with hotspots */}
        <div className="flex-1 flex items-center justify-center relative">
          <DashboardPreview 
            activeZone={activeZone}
            onZoneClick={handleZoneClick}
          />

          {/* Zone detail panel */}
          <AnimatePresence>
            {activeZone && (
              <ZoneDetailPanel 
                zone={activeZone} 
                onClose={handleCloseDetail}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Exploration progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 max-w-sm mx-auto w-full"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-neutral-500 text-xs font-mono">EXPLORATION</span>
            <span className="text-[#E2FF00] text-xs font-mono">
              {visitedZones.size}/{DASHBOARD_ZONES.length}
            </span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#E2FF00] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-6"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className={`
              w-full max-w-sm mx-auto py-4 px-8 rounded-xl font-black uppercase tracking-wider text-base 
              flex items-center justify-center gap-3 transition-all duration-300
              ${allVisited 
                ? 'bg-[#E2FF00] text-black shadow-[0_0_30px_rgba(226,255,0,0.3)] hover:shadow-[0_0_50px_rgba(226,255,0,0.5)]' 
                : 'bg-white/10 text-white/70 border border-white/20'
              }
            `}
          >
            {allVisited ? (
              <>
                ENTRER DANS LE QG
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <span className="text-neutral-400">Explore encore {3 - visitedZones.size} zone{3 - visitedZones.size > 1 ? 's' : ''}</span>
              </>
            )}
          </motion.button>

          {/* Skip option */}
          {!allVisited && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={handleContinue}
              className="w-full text-center mt-3 text-neutral-600 text-xs hover:text-neutral-400 transition-colors"
            >
              Passer cette étape →
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
        <div className="w-2 h-2 rounded-full bg-[#E2FF00]/30" />
        <div className="w-6 h-2 rounded-full bg-[#E2FF00]" />
      </div>
    </div>
  );
};

export default TacticalMapScreen;
