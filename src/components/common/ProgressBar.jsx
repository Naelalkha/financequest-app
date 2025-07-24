import React from 'react';

/**
 * Reusable ProgressBar component
 */
const ProgressBar = ({
  progress = 0,
  color = 'yellow',
  height = 'h-2',
  showPercentage = false,
  animated = true,
  striped = false,
  className = '',
  label = null
}) => {
  // Ensure progress is between 0 and 100
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  // Color variants
  const colorVariants = {
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    pink: 'bg-pink-500',
    gradient: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    premiumGradient: 'bg-gradient-to-r from-purple-600 to-pink-600'
  };

  // Striped pattern
  const stripedStyles = striped ? `
    bg-gradient-to-r from-transparent via-white/10 to-transparent
    bg-[length:20px_100%]
    ${animated ? 'animate-shimmer' : ''}
  ` : '';

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>{label}</span>
          {showPercentage && <span>{safeProgress}%</span>}
        </div>
      )}

      {/* Progress bar container */}
      <div className={`w-full bg-gray-700 rounded-full ${height} overflow-hidden relative`}>
        {/* Progress bar fill */}
        <div
          className={`
            ${height} rounded-full transition-all duration-500 ease-out relative
            ${colorVariants[color] || colorVariants.yellow}
            ${animated && safeProgress > 0 ? 'animate-pulse-subtle' : ''}
          `}
          style={{ width: `${safeProgress}%` }}
        >
          {/* Striped overlay */}
          {striped && (
            <div className={`absolute inset-0 ${stripedStyles}`} />
          )}

          {/* Glow effect for high progress */}
          {safeProgress >= 80 && animated && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
        </div>

        {/* Percentage text inside bar (if enabled and progress > 20%) */}
        {showPercentage && safeProgress > 20 && !label && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-white drop-shadow">
              {safeProgress}%
            </span>
          </div>
        )}
      </div>

      {/* Milestone indicators */}
      {safeProgress >= 100 && animated && (
        <div className="mt-1 text-xs text-green-400 font-semibold animate-bounce">
          ✨ Complete!
        </div>
      )}
    </div>
  );
};

/**
 * Multi-segment progress bar for showing multiple values
 */
export const SegmentedProgressBar = ({ segments = [], height = 'h-2', className = '' }) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  
  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-700 rounded-full ${height} overflow-hidden flex`}>
        {segments.map((segment, index) => {
          const percentage = total > 0 ? (segment.value / total) * 100 : 0;
          
          return (
            <div
              key={index}
              className={`${height} ${segment.color} transition-all duration-500`}
              style={{ width: `${percentage}%` }}
              title={`${segment.label}: ${segment.value}`}
            />
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${segment.color}`} />
            <span className="text-xs text-gray-400">
              {segment.label} ({((segment.value / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Circular progress indicator
 */
export const CircularProgress = ({ 
  progress = 0, 
  size = 100, 
  strokeWidth = 8,
  color = 'yellow',
  showPercentage = true,
  className = ''
}) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (safeProgress / 100) * circumference;

  const colorVariants = {
    yellow: 'text-yellow-500',
    orange: 'text-orange-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    red: 'text-red-500'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorVariants[color] || colorVariants.yellow} transition-all duration-500 ease-out`}
        />
      </svg>
      
      {/* Percentage text */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {safeProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

// Add CSS for animations (add to your global CSS or animations.css)
const animationStyles = `
@keyframes shimmer {
  0% {
    background-position: -20px 0;
  }
  100% {
    background-position: calc(100% + 20px) 0;
  }
}

@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}

.animate-shimmer {
  animation: shimmer 2s linear infinite;
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}
`;

export default ProgressBar;