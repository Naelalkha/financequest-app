import React, { memo, useMemo, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * AppBackground - Composant de fond animé unifié pour l'application
 * Supporte plusieurs variantes visuelles avec animations performantes
 */
const AppBackground = memo(({
  children,
  variant = 'finance',
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
    },
    finance: {
      gradients: [
        'radial-gradient(ellipse at 20% 30%, rgba(30, 58, 138, 0.35) 0%, transparent 60%)',
        'radial-gradient(ellipse at 80% 70%, rgba(29, 78, 216, 0.3) 0%, transparent 60%)',
        'radial-gradient(ellipse at 50% 50%, rgba(251, 191, 36, 0.18) 0%, transparent 70%)'
      ],
      backgroundColor: 'rgb(24, 33, 57)',
      particleColor: 'rgba(251, 191, 36, 0.12)'
    },
    onyx: {
      gradients: [
        'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 70%)'
      ],
      backgroundColor: '#050505',
      particleColor: '#E5FF00'
    }
  };

  const currentVariant = variants[variant] || variants.nebula;

  // Générer les particules flottantes
  const particles = useMemo(() => {
    if (!animate || reduceMotion) return [];

    const particleCount = variant === 'finance' ? 25 : 30;

    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: variant === 'finance' ? Math.random() * 5 + 3 : Math.random() * 4 + 2,
      duration: Math.random() * 25 + 20,
      delay: Math.random() * 5,
      color: variant === 'finance'
        ? (i % 3 === 0 ? 'rgba(251, 191, 36, 0.2)' : i % 3 === 1 ? 'rgba(30, 58, 138, 0.15)' : 'rgba(29, 78, 216, 0.12)')
        : currentVariant.particleColor
    }));
  }, [animate, reduceMotion, variant, currentVariant.particleColor]);

  // Générer des formes géométriques flottantes pour finance
  const geometricShapes = useMemo(() => {
    if (!animate || reduceMotion || variant !== 'finance') return [];

    const types = ['ring', 'glass-blob', 'gradient-sphere', 'soft-square', 'lens'];
    const colors = [
      { primary: 'rgba(251, 191, 36, 0.18)', secondary: 'rgba(245, 158, 11, 0.12)' },
      { primary: 'rgba(30, 58, 138, 0.15)', secondary: 'rgba(29, 78, 216, 0.1)' },
      { primary: 'rgba(67, 56, 202, 0.12)', secondary: 'rgba(99, 102, 241, 0.08)' },
      { primary: 'rgba(34, 211, 238, 0.15)', secondary: 'rgba(20, 184, 166, 0.1)' },
      { primary: 'rgba(251, 191, 36, 0.16)', secondary: 'rgba(251, 191, 36, 0.08)' }
    ];

    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 140 + 100,
      rotation: Math.random() * 360,
      duration: Math.random() * 40 + 30,
      delay: Math.random() * 20,
      type: types[i % types.length],
      colors: colors[i % colors.length],
      scale: Math.random() * 0.3 + 0.85
    }));
  }, [animate, reduceMotion, variant]);


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
      {currentVariant.gradients.map((gradient, index) => {
        const baseOpacity = variant === 'finance' ? 70 : 60;
        const maxOpacity = variant === 'finance' ? 85 : 80;

        return (
          <motion.div
            key={`gradient-${index}`}
            className="absolute inset-0"
            style={{ background: gradient, opacity: baseOpacity / 100 }}
            animate={animate && !reduceMotion ? {
              scale: [1, 1.08, 1],
              opacity: [baseOpacity / 100, maxOpacity / 100, baseOpacity / 100]
            } : {}}
            transition={{
              duration: 20 + index * 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: index * 0.8
            }}
          />
        );
      })}

      {/* Overlay avec effets visuels */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {/* Particules flottantes - en premier */}
        {particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color || currentVariant.particleColor,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color || currentVariant.particleColor}`,
              zIndex: 3
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

        {/* Vignette effect */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)'
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

        {/* Grid effect moderne pour finance */}
        {variant === 'finance' && (
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `
                linear-gradient(rgba(251, 191, 36, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(251, 191, 36, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />
        )}

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
        {/* Effet de lumière spécifique pour la variante finance - Thème Gold & Teal */}
        {variant === 'finance' && animate && !reduceMotion && (
          <>
            {/* Orbe doré principal - Lumière chaude */}
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 40%, transparent 70%)',
                filter: 'blur(80px)',
                left: '20%',
                top: '15%'
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.25, 0.4, 0.25],
                x: [0, 40, 0],
                y: [0, 25, 0]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Orbe Bleu Indigo - Profondeur & confiance */}
            <motion.div
              className="absolute w-[550px] h-[550px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(30, 58, 138, 0.25) 0%, rgba(29, 78, 216, 0.15) 40%, transparent 70%)',
                filter: 'blur(75px)',
                right: '15%',
                bottom: '20%'
              }}
              animate={{
                scale: [1.1, 1, 1.1],
                opacity: [0.2, 0.35, 0.2],
                x: [0, -35, 0],
                y: [0, -30, 0]
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />

            {/* Orbe Indigo profond - Excellence */}
            <motion.div
              className="absolute w-[450px] h-[450px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(67, 56, 202, 0.2) 0%, transparent 70%)',
                filter: 'blur(60px)',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.3, 0.15]
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />

            {/* Orbe doré secondaire */}
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 70%)',
                filter: 'blur(50px)',
                left: '5%',
                bottom: '30%'
              }}
              animate={{
                scale: [1.05, 1, 1.05],
                opacity: [0.18, 0.28, 0.18]
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />

            {/* Orbe bleu royal - Stabilité */}
            <motion.div
              className="absolute w-[380px] h-[380px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(29, 78, 216, 0.18) 0%, transparent 70%)',
                filter: 'blur(55px)',
                right: '5%',
                top: '30%'
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{
                duration: 19,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
            />

            {/* Formes géométriques modernes et esthétiques */}
            {geometricShapes.map((shape) => {
              const getShapeStyle = () => {
                const baseSize = shape.size * shape.scale;
                const baseStyle = {
                  left: `${shape.x}%`,
                  top: `${shape.y}%`,
                  width: `${baseSize}px`,
                  height: `${baseSize}px`,
                  transform: `rotate(${shape.rotation}deg)`
                };

                switch (shape.type) {
                  case 'ring':
                    return {
                      ...baseStyle,
                      borderRadius: '50%',
                      border: `3px solid ${shape.colors.primary}`,
                      background: 'transparent',
                      filter: 'blur(4px)',
                      boxShadow: `0 0 ${baseSize * 0.4}px ${shape.colors.primary}, inset 0 0 ${baseSize * 0.3}px ${shape.colors.secondary}`
                    };

                  case 'glass-blob':
                    return {
                      ...baseStyle,
                      borderRadius: '50% 40% 60% 50%',
                      background: `linear-gradient(135deg, ${shape.colors.primary}, ${shape.colors.secondary})`,
                      backdropFilter: 'blur(20px)',
                      filter: 'blur(6px)',
                      border: `1px solid ${shape.colors.primary}`,
                      boxShadow: `0 8px 32px ${shape.colors.secondary}`
                    };

                  case 'gradient-sphere':
                    return {
                      ...baseStyle,
                      borderRadius: '50%',
                      background: `radial-gradient(circle at 30% 30%, ${shape.colors.primary}, ${shape.colors.secondary}, transparent)`,
                      filter: 'blur(5px)',
                      boxShadow: `0 0 ${baseSize * 0.6}px ${shape.colors.primary}`
                    };

                  case 'soft-square':
                    return {
                      ...baseStyle,
                      borderRadius: '30%',
                      background: `linear-gradient(135deg, ${shape.colors.primary}, transparent, ${shape.colors.secondary})`,
                      filter: 'blur(5px)',
                      boxShadow: `0 0 ${baseSize * 0.5}px ${shape.colors.primary}`
                    };

                  case 'lens':
                    return {
                      ...baseStyle,
                      borderRadius: '50%',
                      background: `conic-gradient(from ${shape.rotation}deg, ${shape.colors.primary}, transparent 50%, ${shape.colors.secondary}, transparent)`,
                      filter: 'blur(5px)',
                      boxShadow: `0 0 ${baseSize * 0.5}px ${shape.colors.secondary}`
                    };

                  default:
                    return {
                      ...baseStyle,
                      borderRadius: '50%',
                      background: shape.colors.primary,
                      filter: 'blur(5px)',
                      boxShadow: `0 0 ${baseSize * 0.5}px ${shape.colors.primary}`
                    };
                }
              };

              return (
                <motion.div
                  key={`shape-${shape.id}`}
                  className="absolute"
                  style={{
                    ...getShapeStyle(),
                    zIndex: 2
                  }}
                  animate={{
                    scale: [shape.scale, shape.scale * 1.15, shape.scale],
                    rotate: [shape.rotation, shape.rotation + 180, shape.rotation],
                    opacity: [0.25, 0.4, 0.25],
                    x: [0, Math.sin(shape.id) * 25, 0],
                    y: [0, Math.cos(shape.id) * 18, 0]
                  }}
                  transition={{
                    duration: shape.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: shape.delay
                  }}
                />
              );
            })}
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
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.3)',
          zIndex: 5
        }}
      />
    </div>
  );
});

AppBackground.displayName = 'AppBackground';

export default AppBackground;