import React, { memo, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * AppBackground - Composant de fond "Atmospheric Guilloche"
 * Style: High-Tech Security / Premium Finance
 */
const AppBackground = memo(({
  children,
  className = ''
}) => {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`fixed inset-0 ${className}`}
        style={{ backgroundColor: '#050505' }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`}>
      {/* Background with Atmospheric Guilloche Pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#050505',
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(26, 33, 0, 0.03) 0%, transparent 70%),
            repeating-radial-gradient(circle at 0 0, transparent 0, transparent 29px, rgba(255, 255, 255, 0.07) 29px, rgba(255, 255, 255, 0.07) 30px),
            repeating-radial-gradient(circle at 100% 0, transparent 0, transparent 29px, rgba(255, 255, 255, 0.07) 29px, rgba(255, 255, 255, 0.07) 30px)
          `,
          backgroundAttachment: 'fixed',
          backgroundSize: '100% 100%, 100% 100%, 100% 100%'
        }}
      />

      {/* Vignette Effect - Darken edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, transparent 20%, #050505 120%)',
          zIndex: 2
        }}
      />

      {/* Contenu de l'application */}
      <div className="relative z-10 w-full h-full overflow-auto">
        {children}
      </div>
    </div>
  );
});

AppBackground.displayName = 'AppBackground';

export default AppBackground;