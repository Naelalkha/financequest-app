import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import ProgressBar from './ProgressBar';

/**
 * Reusable Card component
 */
const Card = ({
  children,
  className = '',
  hover = true,
  gradient = false,
  glow = false,
  to,
  onClick,
  padding = 'p-6'
}) => {
  const baseStyles = `
    bg-gray-800 rounded-xl border border-gray-700
    ${padding}
    ${hover ? 'transition-all duration-300 hover:shadow-xl hover:border-yellow-500/50' : ''}
    ${gradient ? 'bg-gradient-to-br from-gray-800 to-gray-900' : ''}
    ${glow ? 'shadow-lg shadow-yellow-500/10' : ''}
    ${onClick || to ? 'cursor-pointer' : ''}
    ${className}
  `;

  if (to) {
    return (
      <Link to={to} className={baseStyles}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div className={baseStyles} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <div className={baseStyles}>
      {children}
    </div>
  );
};

/**
 * Card Header component
 */
export const CardHeader = ({ children, className = '', icon: Icon, action }) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-gray-700 rounded-lg">
            <Icon className="text-xl text-yellow-400" />
          </div>
        )}
        <div>{children}</div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

/**
 * Card Title component
 */
export const CardTitle = ({ children, className = '', size = 'lg' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  return (
    <h3 className={`font-semibold text-white ${sizeClasses[size]} ${className}`}>
      {children}
    </h3>
  );
};

/**
 * Card Description component
 */
export const CardDescription = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-gray-400 ${className}`}>
      {children}
    </p>
  );
};

/**
 * Card Body component
 */
export const CardBody = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

/**
 * Card Footer component
 */
export const CardFooter = ({ children, className = '', separator = false }) => {
  return (
    <div className={`
      ${separator ? 'border-t border-gray-700 pt-4 mt-4' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

/**
 * Stats Card component
 */
export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'yellow',
  to,
  className = ''
}) => {
  const colorClasses = {
    yellow: 'from-yellow-500 to-amber-500 border-yellow-400',
    orange: 'from-orange-500 to-red-500 border-orange-400',
    green: 'from-green-500 to-emerald-500 border-green-400',
    blue: 'from-blue-500 to-cyan-500 border-blue-400',
    purple: 'from-purple-500 to-pink-500 border-purple-400'
  };

  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
  const trendColor = trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400';

  return (
    <Card
      to={to}
      hover
      className={`border-2 ${colorClasses[color].split(' ')[2]} ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        {Icon && (
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')}`}>
            <Icon className="text-xl text-white" />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend !== undefined && (
            <span className={`text-sm font-medium ${trendColor}`}>
              {trendIcon} {Math.abs(trend)}%
            </span>
          )}
        </div>
        
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </Card>
  );
};

/**
 * Feature Card component
 */
export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  features = [],
  action,
  premium = false,
  className = ''
}) => {
  return (
    <Card gradient hover className={`relative overflow-hidden ${className}`}>
      {premium && (
        <div className="absolute -top-3 -right-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-8 py-1 rotate-45 shadow-lg">
          PREMIUM
        </div>
      )}
      
      <CardHeader icon={Icon}>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      
      <CardBody>
        <CardDescription className="mb-4">{description}</CardDescription>
        
        {features.length > 0 && (
          <ul className="space-y-2 mb-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
      
      {action && (
        <CardFooter separator>
          {action}
        </CardFooter>
      )}
    </Card>
  );
};

/**
 * Quest Card component (specific to quests)
 */
export const QuestCard = ({
  quest,
  status,
  progress,
  isPremium,
  userIsPremium,
  language,
  className = ''
}) => {
  const difficultyColors = {
    beginner: 'text-green-400 bg-green-400/10',
    easy: 'text-green-400 bg-green-400/10',
    intermediate: 'text-yellow-400 bg-yellow-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    advanced: 'text-orange-400 bg-orange-400/10',
    hard: 'text-orange-400 bg-orange-400/10',
    expert: 'text-red-400 bg-red-400/10'
  };

  const categoryColors = {
    budgeting: 'text-blue-400',
    saving: 'text-green-400',
    investing: 'text-purple-400',
    debt: 'text-red-400',
    credit: 'text-yellow-400',
    planning: 'text-cyan-400'
  };

  const locked = quest.isPremium && !userIsPremium;
  const completed = status === 'completed';
  const inProgress = status === 'active';

  return (
    <div
      className={`
        bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300
        ${!locked ? 'hover:shadow-xl hover:transform hover:-translate-y-1 cursor-pointer' : 'opacity-75'}
        ${className}
      `}
    >
      {/* Card content */}
      <Link 
        to={locked ? '#' : `/quests/${quest.id}`}
        onClick={(e) => locked && e.preventDefault()}
        className="block p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-1 pr-2">
              {quest.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {quest.description}
            </p>
          </div>
          {quest.isPremium && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold flex-shrink-0">
              PRO
            </span>
          )}
        </div>

        {/* Quest meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`
            px-2 py-1 text-xs rounded-full font-medium
            ${difficultyColors[quest.difficulty] || difficultyColors.beginner}
          `}>
            {quest.difficulty || 'beginner'}
          </span>
          <span className={`text-xs font-medium ${categoryColors[quest.category] || 'text-gray-400'}`}>
            {quest.category}
          </span>
          <span className="text-xs text-gray-500">
            ~{quest.duration || 15} min
          </span>
          <span className="text-xs text-gray-500 font-semibold">
            +{quest.points || 100} pts
          </span>
        </div>

        {/* Progress */}
        {inProgress && (
          <div className="mb-4">
            <ProgressBar
              progress={progress || 0}
              showPercentage={true}
              color="yellow"
              height="h-2"
            />
          </div>
        )}

        {/* Status */}
        <div className="mt-4">
          {locked ? (
            <div className="flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-400 rounded-lg">
              <FaLock />
              <span className="font-medium">Premium Only</span>
            </div>
          ) : completed ? (
            <div className="flex items-center justify-center gap-2 py-2 bg-green-100 text-green-700 rounded-lg">
              <FaCheckCircle />
              <span className="font-medium">Completed</span>
            </div>
          ) : inProgress ? (
            <div className="py-2 bg-yellow-400 text-gray-900 rounded-lg text-center font-semibold hover:bg-yellow-500 transition-colors">
              Continue Quest
            </div>
          ) : (
            <div className="py-2 bg-green-500 text-white rounded-lg text-center font-semibold hover:bg-green-600 transition-colors">
              Start Quest
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Card;