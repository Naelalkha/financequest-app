import React from 'react';

const LoadingSpinner = ({ size = 'md', label = null }) => {
  const sizeMap = {
    sm: { ring: 'w-6 h-6', glow: 'w-10 h-10', dot: 'w-1.5 h-1.5' },
    md: { ring: 'w-10 h-10', glow: 'w-16 h-16', dot: 'w-2 h-2' },
    lg: { ring: 'w-14 h-14', glow: 'w-24 h-24', dot: 'w-2.5 h-2.5' },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        {/* Halo glow */}
        <div className={`absolute inset-0 ${s.glow} -m-3 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-full blur-2xl`} />
        {/* Ring */}
        <div
          className={`relative ${s.ring} rounded-full border-4 border-t-transparent border-solid animate-spin`}
          style={{
            borderImage: 'conic-gradient(from 0deg, #fbbf24, #f97316, #fbbf24) 1',
            borderColor: 'transparent',
            WebkitMask: 'conic-gradient(#0000 10%, #000 0)',
            mask: 'conic-gradient(#0000 10%, #000 0)'
          }}
        >
          {/* Center dot */}
          <div className={`absolute inset-0 m-auto ${s.dot} rounded-full bg-gradient-to-br from-amber-400 to-orange-500`} />
        </div>
      </div>
      {label && <div className="text-xs text-gray-400">{label}</div>}
    </div>
  );
};

export default LoadingSpinner;