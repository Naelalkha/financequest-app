import React from 'react';

/**
 * GamifiedAvatar - Avatar avec anneau de progression XP et badge de niveau
 * Style cyberpunk/tactique avec anneau SVG et badge de niveau
 */
const GamifiedAvatar = ({ 
  currentLevel = 1, 
  currentXP = 0, 
  xpToNextLevel = 100, 
  avatarUrl 
}) => {
  // Calcul du pourcentage de progression
  // currentXP est l'XP dans le niveau actuel (xpInCurrentLevel)
  // xpToNextLevel est l'XP nécessaire pour passer au niveau suivant
  const progressPercentage = xpToNextLevel > 0 
    ? Math.min(100, Math.max(0, (currentXP / xpToNextLevel) * 100))
    : 0;
  
  // Debug temporaire pour vérifier les valeurs (à retirer après test)
  if (process.env.NODE_ENV === 'development') {
    console.log('[GamifiedAvatar]', {
      currentLevel,
      currentXP,
      xpToNextLevel,
      progressPercentage: `${progressPercentage.toFixed(1)}%`
    });
  }

  // Configuration SVG pour l'anneau circulaire
  const size = 36; // ViewBox size
  const strokeWidth = 3;
  const center = size / 2;
  const radius = 15.9155; // Rayon pour correspondre à l'ancien code
  
  // Calcul de la circonférence du cercle
  const circumference = 2 * Math.PI * radius;
  
  // Calcul du stroke-dashoffset pour afficher la progression
  // On masque la partie non remplie en décalant le début du trait
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  // Génération des initiales si pas d'URL d'avatar
  const getInitials = () => {
    // Si pas d'avatar, on utilise des initiales par défaut
    return 'U';
  };

  // Couleur jaune néon principale
  const neonYellow = '#E2FF00';

  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      {/* SVG Ring - Anneau de progression circulaire */}
      <svg 
        className="absolute inset-0 w-full h-full transform -rotate-90 z-0" 
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {/* Piste de fond (gris foncé) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth={strokeWidth}
        />
        
        {/* Anneau de progression (jaune néon avec glow) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={neonYellow}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="drop-shadow-[0_0_4px_rgba(226,255,0,0.6)]"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>

      {/* Avatar Circle */}
      <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center overflow-hidden border border-white/20 z-[5]">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover opacity-80 grayscale hover:grayscale-0 transition-all" 
          />
        ) : (
          <span className="text-white/80 text-xs font-bold">
            {getInitials()}
          </span>
        )}
      </div>

      {/* Level Badge - Positionné en bas au centre, chevauchant l'avatar */}
      <div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20
                   bg-[#E2FF00] text-black font-bold text-[10px] 
                   px-1.5 py-0.5 rounded-full
                   border border-black/20
                   shadow-[0_0_4px_rgba(226,255,0,0.4)]"
        style={{ lineHeight: '1.2' }}
      >
        {currentLevel}
      </div>
    </div>
  );
};

export default GamifiedAvatar;