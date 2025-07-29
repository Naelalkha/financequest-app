// Utility functions for FinanceQuest

/**
 * Format currency based on locale
 */
export const formatCurrency = (amount, locale = 'en-US') => {
  const currency = locale.startsWith('fr') ? 'EUR' : 'USD';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date based on locale
 */
export const formatDate = (date, locale = 'en-US', options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
};

/**
 * Format relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (date, locale = 'en-US') => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const daysDiff = Math.round((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) return locale.startsWith('fr') ? "aujourd'hui" : 'today';
  if (daysDiff === 1) return locale.startsWith('fr') ? 'demain' : 'tomorrow';
  if (daysDiff === -1) return locale.startsWith('fr') ? 'hier' : 'yesterday';
  
  if (Math.abs(daysDiff) < 7) {
    return rtf.format(daysDiff, 'day');
  } else if (Math.abs(daysDiff) < 30) {
    return rtf.format(Math.round(daysDiff / 7), 'week');
  } else if (Math.abs(daysDiff) < 365) {
    return rtf.format(Math.round(daysDiff / 30), 'month');
  } else {
    return rtf.format(Math.round(daysDiff / 365), 'year');
  }
};

/**
 * Format duration in minutes to human readable
 */
export const formatDuration = (minutes, locale = 'en-US') => {
  if (minutes < 60) {
    return locale.startsWith('fr') 
      ? `${minutes} minutes` 
      : `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return locale.startsWith('fr')
      ? `${hours} ${hours === 1 ? 'heure' : 'heures'}`
      : `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return locale.startsWith('fr')
    ? `${hours}h ${mins}min`
    : `${hours}h ${mins}m`;
};

/**
 * Calculate level from XP
 */
export const calculateLevel = (xp) => {
  const levels = [
    { name: 'Novice', min: 0, max: 499, color: 'text-gray-400', bgColor: 'bg-gray-400' },
    { name: 'Apprentice', min: 500, max: 1499, color: 'text-green-400', bgColor: 'bg-green-400' },
    { name: 'Explorer', min: 1500, max: 2999, color: 'text-blue-400', bgColor: 'bg-blue-400' },
    { name: 'Adventurer', min: 3000, max: 4999, color: 'text-purple-400', bgColor: 'bg-purple-400' },
    { name: 'Expert', min: 5000, max: 9999, color: 'text-yellow-400', bgColor: 'bg-yellow-400' },
    { name: 'Master', min: 10000, max: 19999, color: 'text-orange-400', bgColor: 'bg-orange-400' },
    { name: 'Legend', min: 20000, max: Infinity, color: 'text-red-400', bgColor: 'bg-red-400' }
  ];
  
  const level = levels.find(l => xp >= l.min && xp <= l.max) || levels[0];
  const nextLevel = levels[levels.indexOf(level) + 1];
  
  const progress = nextLevel 
    ? ((xp - level.min) / (nextLevel.min - level.min)) * 100
    : 100;
  
  return {
    ...level,
    current: levels.indexOf(level) + 1,
    progress: Math.min(progress, 100),
    xpToNext: nextLevel ? nextLevel.min - xp : 0,
    nextLevel: nextLevel?.name || null
  };
};

/**
 * Calculate streak status
 */
export const calculateStreakStatus = (lastLoginDate) => {
  if (!lastLoginDate) return { active: false, canContinue: true };
  
  const lastLogin = new Date(lastLoginDate);
  const now = new Date();
  
  // Reset to start of day for accurate comparison
  lastLogin.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
  
  return {
    active: daysDiff <= 1,
    canContinue: daysDiff === 1,
    daysAgo: daysDiff,
    willBreak: daysDiff > 1
  };
};

/**
 * Generate avatar URL based on email
 */
export const getAvatarUrl = (email, size = 200) => {
  const hash = email.trim().toLowerCase();
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${hash}&size=${size}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Debounce function for search inputs
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Shuffle array (for randomizing quests, tips, etc.)
 */
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Calculate reading time for content
 */
export const calculateReadingTime = (text, wordsPerMinute = 200) => {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Generate unique ID (for temporary objects)
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Parse Firebase error messages to user-friendly text
 */
export const parseFirebaseError = (error, t) => {
  const errorMessages = {
    'auth/user-not-found': t('errors.user_not_found'),
    'auth/wrong-password': t('errors.wrong_password'),
    'auth/email-already-in-use': t('errors.email_in_use'),
    'auth/weak-password': t('errors.weak_password'),
    'auth/invalid-email': t('errors.invalid_email'),
    'auth/operation-not-allowed': t('errors.operation_not_allowed'),
    'auth/account-exists-with-different-credential': t('errors.account_exists'),
    'auth/requires-recent-login': t('errors.requires_recent_login'),
    'auth/too-many-requests': t('errors.too_many_requests'),
    'auth/network-request-failed': t('errors.network_error')
  };
  
  return errorMessages[error.code] || t('errors.generic');
};

/**
 * Get color class based on percentage
 */
export const getProgressColor = (percentage) => {
  if (percentage >= 80) return 'text-green-500';
  if (percentage >= 60) return 'text-yellow-500';
  if (percentage >= 40) return 'text-orange-500';
  return 'text-red-500';
};

/**
 * Format number with abbreviation (1.2K, 3.4M, etc.)
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Get greeting based on time of day
 */
export const getTimeGreeting = (locale = 'en-US') => {
  const hour = new Date().getHours();
  
  if (locale.startsWith('fr')) {
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }
  
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Check if user is on mobile device
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Sort quests by various criteria
 */
export const sortQuests = (quests, sortBy = 'order') => {
  const sortedQuests = [...quests];
  
  switch (sortBy) {
    case 'title':
      return sortedQuests.sort((a, b) => a.title.localeCompare(b.title));
    case 'difficulty':
      const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
      return sortedQuests.sort((a, b) => 
        difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      );
    case 'duration':
      return sortedQuests.sort((a, b) => a.duration - b.duration);
    case 'xp':
      return sortedQuests.sort((a, b) => b.xp - a.xp);
    case 'order':
    default:
      return sortedQuests.sort((a, b) => a.order - b.order);
  }
};