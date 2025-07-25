// Analytics utilities for FinanceQuest
import { analytics } from '../services/firebase';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';

/**
 * Log a custom analytics event
 * @param {string} eventName - Name of the event
 * @param {object} parameters - Event parameters
 */
export const logAnalyticsEvent = (eventName, parameters = {}) => {
  try {
    if (analytics) {
      logEvent(analytics, eventName, parameters);
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

/**
 * Set the user ID for analytics
 * @param {string} userId - User ID
 */
export const setAnalyticsUserId = (userId) => {
  try {
    if (analytics && userId) {
      setUserId(analytics, userId);
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

/**
 * Set user properties for analytics
 * @param {object} properties - User properties
 */
export const setAnalyticsUserProperties = (properties) => {
  try {
    if (analytics && properties) {
      setUserProperties(analytics, properties);
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

// Specific event logging functions

/**
 * Log user signup event
 * @param {string} method - Signup method (email, google, etc.)
 */
export const logSignupEvent = (method = 'email') => {
  logAnalyticsEvent('sign_up', { method });
};

/**
 * Log user login event
 * @param {string} method - Login method
 */
export const logLoginEvent = (method = 'email') => {
  logAnalyticsEvent('login', { method });
};

/**
 * Log quest-related events
 * @param {string} action - Quest action (view, start, complete, abandon)
 * @param {object} questData - Quest information
 */
export const logQuestEvent = (action, questData = {}) => {
  const eventName = `quest_${action}`;
  logAnalyticsEvent(eventName, {
    quest_id: questData.questId,
    quest_title: questData.questTitle,
    quest_category: questData.questCategory,
    quest_difficulty: questData.questDifficulty,
    quest_points: questData.questPoints,
    ...questData
  });
};

/**
 * Log premium/subscription events
 * @param {string} action - Premium action (view, subscribe, cancel)
 * @param {object} data - Additional data
 */
export const logPremiumEvent = (action, data = {}) => {
  const eventName = `premium_${action}`;
  logAnalyticsEvent(eventName, {
    plan: data.plan,
    price: data.price,
    currency: data.currency || 'USD',
    ...data
  });
};

/**
 * Log level up event
 * @param {number} newLevel - New user level
 * @param {number} totalPoints - Total points earned
 */
export const logLevelUpEvent = (newLevel, totalPoints) => {
  logAnalyticsEvent('level_up', {
    new_level: newLevel,
    total_points: totalPoints
  });
};

/**
 * Log badge earned event
 * @param {string} badgeId - Badge identifier
 * @param {string} badgeName - Badge name
 */
export const logBadgeEarnedEvent = (badgeId, badgeName) => {
  logAnalyticsEvent('badge_earned', {
    badge_id: badgeId,
    badge_name: badgeName
  });
};

/**
 * Log streak event
 * @param {number} streakDays - Current streak days
 * @param {string} action - Streak action (maintained, broken, milestone)
 */
export const logStreakEvent = (streakDays, action = 'maintained') => {
  logAnalyticsEvent(`streak_${action}`, {
    streak_days: streakDays
  });
};

/**
 * Log share event
 * @param {string} contentType - Type of content shared
 * @param {string} method - Share method (social, copy, etc.)
 */
export const logShareEvent = (contentType, method) => {
  logAnalyticsEvent('share', {
    content_type: contentType,
    method: method
  });
};

/**
 * Log navigation event
 * @param {string} screenName - Screen/page name
 * @param {string} previousScreen - Previous screen name
 */
export const logScreenView = (screenName, previousScreen = null) => {
  logAnalyticsEvent('screen_view', {
    screen_name: screenName,
    previous_screen: previousScreen
  });
};

/**
 * Log error event
 * @param {string} errorType - Type of error
 * @param {string} errorMessage - Error message
 * @param {object} additionalData - Additional error data
 */
export const logErrorEvent = (errorType, errorMessage, additionalData = {}) => {
  logAnalyticsEvent('app_error', {
    error_type: errorType,
    error_message: errorMessage,
    ...additionalData
  });
};

/**
 * Log performance event
 * @param {string} metricName - Performance metric name
 * @param {number} value - Metric value
 * @param {string} unit - Unit of measurement
 */
export const logPerformanceEvent = (metricName, value, unit = 'ms') => {
  logAnalyticsEvent('performance_metric', {
    metric_name: metricName,
    value: value,
    unit: unit
  });
};

/**
 * Log user engagement metrics
 * @param {string} action - Engagement action
 * @param {object} data - Engagement data
 */
export const logEngagementEvent = (action, data = {}) => {
  logAnalyticsEvent(`engagement_${action}`, data);
};

/**
 * Initialize analytics with user properties
 * @param {object} user - User object
 */
export const initializeAnalytics = (user) => {
  if (!user) return;

  setAnalyticsUserId(user.uid);
  setAnalyticsUserProperties({
    account_type: user.isPremium ? 'premium' : 'free',
    user_level: user.level || 'Novice',
    total_points: user.points || 0,
    completed_quests: user.completedQuests || 0,
    preferred_language: user.language || 'en',
    signup_date: user.createdAt || new Date().toISOString()
  });
};

/**
 * Track user session
 * @param {string} action - Session action (start, end)
 */
export const trackSession = (action = 'start') => {
  logAnalyticsEvent(`session_${action}`, {
    timestamp: new Date().toISOString()
  });
};

/**
 * Track feature usage
 * @param {string} featureName - Name of the feature
 * @param {object} data - Additional feature data
 */
export const trackFeatureUsage = (featureName, data = {}) => {
  logAnalyticsEvent('feature_usage', {
    feature_name: featureName,
    ...data
  });
};

// Export all functions as default for convenience
export default {
  logAnalyticsEvent,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
  logSignupEvent,
  logLoginEvent,
  logQuestEvent,
  logPremiumEvent,
  logLevelUpEvent,
  logBadgeEarnedEvent,
  logStreakEvent,
  logShareEvent,
  logScreenView,
  logErrorEvent,
  logPerformanceEvent,
  logEngagementEvent,
  initializeAnalytics,
  trackSession,
  trackFeatureUsage
};