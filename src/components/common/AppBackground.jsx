import React, { memo, useMemo, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * AppBackground - Composant de fond animé unifié pour l'application
 * Supporte plusieurs variantes visuelles avec animations performantes
 */
const AppBackground = memo(({ 
  children, 
  variant = 'nebula',
  grain = true,
  grid = false,
  animate = true,
  className = ''
}) => {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Configuration des variantes
  const variants = {
    nebula: {
      gradients: [
        'radial-gradient(ellipse at 20% 30%, rgba(120, 0, 255, 0.15) 0%, transparent 50%)',
        'radial-gradient(ellipse at 70% 40%, rgba(255, 0, 150, 0.12) 0%, transparent 50%)',
        'radial-gradient(ellipse at 50% 60%, rgba(0, 150, 255, 0.1) 0%, transparent 50%)',
        'radial-gradient(ellipse at 30% 80%, rgba(255, 100, 0, 0.08) 0%, transparent 50%)',
        'radial-gradient(ellipse at 80% 20%, rgba(0, 255, 150, 0.08) 0%, transparent 50%)'
      ],
      backgroundColor: '#0a0a0f',
      particleColor: 'rgba(255, 255, 255, 0.03)'
    },
    aurora: {
      gradients: [
        'linear-gradient(135deg, rgba(0, 255, 150, 0.1) 0%, transparent 40%)',
        'linear-gradient(225deg, rgba(150, 0, 255, 0.1) 0%, transparent 40%)',
        'linear-gradient(45deg, rgba(255, 0, 150, 0.08) 0%, transparent 40%)',
        'radial-gradient(circle at 50% 50%, rgba(0, 150, 255, 0.05) 0%, transparent 70%)'
      ],
      backgroundColor: '#050510',
      particleColor: 'rgba(150, 200, 255, 0.05)'
    },
    cosmic: {
      gradients: [
        'radial-gradient(circle at 25% 25%, rgba(255, 50, 150, 0.12) 0%, transparent 45%)',
        'radial-gradient(circle at 75% 75%, rgba(50, 150, 255, 0.12) 0%, transparent 45%)',
        'radial-gradient(ellipse at center, rgba(150, 50, 255, 0.08) 0%, transparent 60%)',
        'conic-gradient(from 180deg at 50% 50%, rgba(255, 150, 50, 0.05) 0deg, transparent 120deg, rgba(50, 255, 150, 0.05) 240deg, transparent 360deg)'
      ],
      backgroundColor: '#08080f',
      particleColor: 'rgba(255, 150, 255, 0.04)'
    },
    dark: {
      gradients: [
        'radial-gradient(circle at 50% 50%, rgba(30, 30, 40, 0.5) 0%, transparent 70%)'
      ],
      backgroundColor: '#0a0a0a',
      particleColor: 'rgba(255, 255, 255, 0.02)'
    }
  };

  const currentVariant = variants[variant] || variants.nebula;

  // Générer les particules flottantes
  const particles = useMemo(() => {
    if (!animate || reduceMotion) return [];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 5
    }));
  }, [animate, reduceMotion]);

  // Styles pour le grain effect
  const grainStyle = grain ? {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
  } : {};

  // Styles pour la grille
  const gridStyle = grid ? {
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
  } : {};

  if (!mounted) {
    return (
      <div 
        className={`fixed inset-0 ${className}`}
        style={{ backgroundColor: currentVariant.backgroundColor }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`}>
      {/* Fond de base */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: currentVariant.backgroundColor }}
      />

      {/* Gradients animés */}
      {currentVariant.gradients.map((gradient, index) => (
        <motion.div
          key={`gradient-${index}`}
          className="absolute inset-0 opacity-60"
          style={{ background: gradient }}
          animate={animate && !reduceMotion ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
            opacity: [0.6, 0.8, 0.6]
          } : {}}
          transition={{
            duration: 15 + index * 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: index * 0.5
          }}
        />
      ))}

      {/* Overlay avec effets visuels */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vignette effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)'
          }}
        />

        {/* Grain effect */}
        {grain && (
          <div 
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={grainStyle}
          />
        )}

        {/* Grid effect */}
        {grid && (
          <div 
            className="absolute inset-0 opacity-20"
            style={gridStyle}
          />
        )}

        {/* Particules flottantes */}
        {particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: currentVariant.particleColor,
              boxShadow: `0 0 ${particle.size * 2}px ${currentVariant.particleColor}`
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Effet de lumière animée supplémentaire pour certaines variantes */}
        {(variant === 'nebula' || variant === 'aurora') && animate && !reduceMotion && (
          <>
            <motion.div
              className="absolute w-96 h-96 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(120, 0, 255, 0.1) 0%, transparent 70%)',
                filter: 'blur(40px)',
                left: '10%',
                top: '20%'
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute w-96 h-96 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 0, 150, 0.1) 0%, transparent 70%)',
                filter: 'blur(40px)',
                right: '10%',
                bottom: '20%'
              }}
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </>
        )}

        {/* Overlay subtil de brillance */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.01) 50%, transparent 100%)',
            mixBlendMode: 'overlay'
          }}
        />
      </div>

      {/* Contenu de l'application */}
      <div className="relative z-10 w-full h-full overflow-auto">
        {children}
      </div>

      {/* Effet de flou sur les bords pour plus de profondeur */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.5)'
        }}
      />
    </div>
  );
});

AppBackground.displayName = 'AppBackground';

export default AppBackground;