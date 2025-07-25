import React from 'react';

const ProgressBar = ({ 
  progress = 0, 
  showPercentage = true, 
  color = 'yellow',
  height = 'h-2',
  animated = true,
  className = ''
}) => {
  // Ensure progress is between 0 and 100
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  
  // Color variants
  const colorVariants = {
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    gradient: 'bg-gradient-to-r from-yellow-400 to-orange-500'
  };

  // Background color variants
  const bgColorVariants = {
    yellow: 'bg-yellow-100',
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    red: 'bg-red-100',
    gradient: 'bg-gray-200'
  };

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(safeProgress)}%</span>
        </div>
      )}
      <div className={`w-full ${bgColorVariants[color] || bgColorVariants.yellow} rounded-full ${height} overflow-hidden`}>
        <div
          className={`
            ${colorVariants[color] || colorVariants.yellow} 
            ${height} 
            rounded-full 
            transition-all 
            ${animated ? 'duration-500 ease-out' : ''}
            relative
            overflow-hidden
          `}
          style={{ width: `${safeProgress}%` }}
        >
          {/* Shimmer effect for gradient */}
          {color === 'gradient' && animated && safeProgress > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
};

// Circular Progress Bar variant
export const CircularProgressBar = ({ 
  progress = 0, 
  size = 120, 
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
    yellow: 'stroke-yellow-500',
    green: 'stroke-green-500',
    blue: 'stroke-blue-500',
    purple: 'stroke-purple-500',
    red: 'stroke-red-500'
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
          strokeWidth={strokeWidth}
          className="stroke-gray-200"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorVariants[color] || colorVariants.yellow} transition-all duration-500 ease-out`}
          fill="none"
        />
      </svg>
      
      {/* Percentage text */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">
            {safeProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;