// Analytics utilities for Moniyo
import { analytics } from '../services/firebase';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { getSessionId } from './sessionId';

/** Analytics event parameters */
export interface AnalyticsEventParams {
  [key: string]: string | number | boolean | null | undefined;
}

/** Quest data for analytics */
export interface QuestAnalyticsData {
  questId?: string;
  questTitle?: string;
  questCategory?: string;
  questDifficulty?: string;
  questXP?: number;
  [key: string]: string | number | boolean | null | undefined;
}

/** Premium analytics data */
export interface PremiumAnalyticsData {
  plan?: string;
  price?: number;
  currency?: string;
  [key: string]: string | number | boolean | null | undefined;
}

/** User analytics data */
export interface AnalyticsUser {
  uid: string;
  isPremium?: boolean;
  level?: string | number;
  xp?: number;
  completedQuests?: number;
  language?: string;
  createdAt?: string;
}

/**
 * Log a custom analytics event
 */
export const logAnalyticsEvent = (eventName: string, parameters: AnalyticsEventParams = {}): void => {
  try {
    if (analytics) {
      // Enrichir tous les événements avec session_id et timestamp
      const enrichedParams = {
        ...parameters,
        session_id: getSessionId(),
        event_timestamp: new Date().toISOString(),
      };
      logEvent(analytics, eventName, enrichedParams);
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

/**
 * Set the user ID for analytics
 */
export const setAnalyticsUserId = (userId: string): void => {
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
 */
export const setAnalyticsUserProperties = (properties: Record<string, string | number | boolean>): void => {
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
 */
export const logSignupEvent = (method: string = 'email'): void => {
  logAnalyticsEvent('sign_up', { method });
};

/**
 * Log user login event
 */
export const logLoginEvent = (method: string = 'email'): void => {
  logAnalyticsEvent('login', { method });
};

/**
 * Log quest-related events
 */
export const logQuestEvent = (action: string, questData: QuestAnalyticsData = {}): void => {
  const eventName = `quest_${action}`;
  logAnalyticsEvent(eventName, {
    quest_id: questData.questId,
    quest_title: questData.questTitle,
    quest_category: questData.questCategory,
    quest_difficulty: questData.questDifficulty,
    quest_xp: questData.questXP,
    ...questData
  });
};

/**
 * Log premium/subscription events
 */
export const logPremiumEvent = (action: string, data: PremiumAnalyticsData = {}): void => {
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
 */
export const logLevelUpEvent = (newLevel: number, totalXP: number): void => {
  logAnalyticsEvent('level_up', {
    new_level: newLevel,
    total_xp: totalXP
  });
};

/**
 * Log badge earned event
 */
export const logBadgeEarnedEvent = (badgeId: string, badgeName: string): void => {
  logAnalyticsEvent('badge_earned', {
    badge_id: badgeId,
    badge_name: badgeName
  });
};

/**
 * Log streak event
 */
export const logStreakEvent = (streakDays: number, action: string = 'maintained'): void => {
  logAnalyticsEvent(`streak_${action}`, {
    streak_days: streakDays
  });
};

/**
 * Log share event
 */
export const logShareEvent = (contentType: string, method: string): void => {
  logAnalyticsEvent('share', {
    content_type: contentType,
    method: method
  });
};

/**
 * Log navigation event
 */
export const logScreenView = (screenName: string, previousScreen: string | null = null): void => {
  logAnalyticsEvent('screen_view', {
    screen_name: screenName,
    previous_screen: previousScreen
  });
};

/**
 * Log error event
 */
export const logErrorEvent = (errorType: string, errorMessage: string, additionalData: AnalyticsEventParams = {}): void => {
  logAnalyticsEvent('app_error', {
    error_type: errorType,
    error_message: errorMessage,
    ...additionalData
  });
};

/**
 * Log performance event
 */
export const logPerformanceEvent = (metricName: string, value: number, unit: string = 'ms'): void => {
  logAnalyticsEvent('performance_metric', {
    metric_name: metricName,
    value: value,
    unit: unit
  });
};

/**
 * Log user engagement metrics
 */
export const logEngagementEvent = (action: string, data: AnalyticsEventParams = {}): void => {
  logAnalyticsEvent(`engagement_${action}`, data);
};

/**
 * Initialize analytics with user properties
 */
export const initializeAnalytics = (user: AnalyticsUser | null): void => {
  if (!user) return;

  setAnalyticsUserId(user.uid);
  setAnalyticsUserProperties({
    account_type: user.isPremium ? 'premium' : 'free',
    user_level: String(user.level || 'Novice'),
    total_xp: user.xp || 0,
    completed_quests: user.completedQuests || 0,
    preferred_language: user.language || 'en',
    signup_date: user.createdAt || new Date().toISOString()
  });
};

/**
 * Track user session
 */
export const trackSession = (action: string = 'start'): void => {
  logAnalyticsEvent(`session_${action}`, {
    timestamp: new Date().toISOString()
  });
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (featureName: string, data: AnalyticsEventParams = {}): void => {
  logAnalyticsEvent('feature_usage', {
    feature_name: featureName,
    ...data
  });
};

/**
 * Track custom event (alias for logAnalyticsEvent for compatibility)
 */
export const trackEvent = (eventName: string, parameters: AnalyticsEventParams = {}): void => {
  logAnalyticsEvent(eventName, parameters);
};

// Export all functions as default for convenience
export default {
  logAnalyticsEvent,
  trackEvent,
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