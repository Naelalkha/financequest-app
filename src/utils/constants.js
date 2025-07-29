// Application constants for FinanceQuest

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  QUESTS: '/quests',
  QUEST_DETAIL: '/quests/:id',
  PREMIUM: '/premium',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  FORGOT_PASSWORD: '/forgot-password',
  SUCCESS: '/success'
};

// Quest categories
export const QUEST_CATEGORIES = {
  BUDGETING: 'budgeting',
  SAVING: 'saving',
  INVESTING: 'investing',
  DEBT: 'debt',
  CREDIT: 'credit',
  RETIREMENT: 'retirement',
  TAXES: 'taxes',
  EMERGENCY: 'emergency'
};

// Quest difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};

// Quest status
export const QUEST_STATUS = {
  NOT_STARTED: 'not_started',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  LOCKED: 'locked'
};

// User levels
export const USER_LEVELS = [
  { name: 'Novice', min: 0, max: 499, color: 'text-gray-400', bgColor: 'bg-gray-400' },
  { name: 'Apprentice', min: 500, max: 1499, color: 'text-green-400', bgColor: 'bg-green-400' },
  { name: 'Explorer', min: 1500, max: 2999, color: 'text-blue-400', bgColor: 'bg-blue-400' },
  { name: 'Adventurer', min: 3000, max: 4999, color: 'text-purple-400', bgColor: 'bg-purple-400' },
  { name: 'Expert', min: 5000, max: 9999, color: 'text-yellow-400', bgColor: 'bg-yellow-400' },
  { name: 'Master', min: 10000, max: 19999, color: 'text-orange-400', bgColor: 'bg-orange-400' },
  { name: 'Legend', min: 20000, max: Infinity, color: 'text-red-400', bgColor: 'bg-red-400' }
];

// Storage keys
export const STORAGE_KEYS = {
  LANGUAGE: 'financequest_language',
  THEME: 'financequest_theme',
  REMEMBERED_EMAIL: 'financequest_remembered_email',
  ONBOARDING_COMPLETE: 'financequest_onboarding_complete',
  LAST_ACTIVE_QUEST: 'financequest_last_active_quest',
  NOTIFICATION_SETTINGS: 'financequest_notifications',
  QUEST_FILTERS: 'financequest_quest_filters'
};

// API endpoints (if using external APIs)
export const API_ENDPOINTS = {
  STRIPE_CHECKOUT: '/api/create-checkout-session',
  STRIPE_PORTAL: '/api/create-portal-session',
  WEBHOOK: '/api/webhook'
};

// Stripe pricing
export const PRICING = {
  MONTHLY: {
    AMOUNT: 499, // $4.99
    CURRENCY: 'usd',
    INTERVAL: 'month',
    PRODUCT_ID: process.env.REACT_APP_STRIPE_MONTHLY_PRICE_ID
  },
  YEARLY: {
    AMOUNT: 3999, // $39.99
    CURRENCY: 'usd',
    INTERVAL: 'year',
    PRODUCT_ID: process.env.REACT_APP_STRIPE_YEARLY_PRICE_ID
  }
};

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Toast messages duration
export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000
};

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  QUEST_TITLE_MAX_LENGTH: 100,
  QUEST_DESCRIPTION_MAX_LENGTH: 500
};

// Firebase collections
export const COLLECTIONS = {
  USERS: 'users',
  QUESTS: 'quests',
  USER_QUESTS: 'userQuests',
  BADGES: 'badges',
  USER_BADGES: 'userBadges',
  NOTIFICATIONS: 'notifications',
  FEEDBACK: 'feedback',
  ANALYTICS: 'analytics'
};

// Quest rewards multipliers
export const REWARDS_MULTIPLIERS = {
  FIRST_COMPLETION: 1.5,
  PERFECT_SCORE: 2.0,
  SPEED_BONUS: 1.2,
  STREAK_BONUS: 1.1
};

// Notification types
export const NOTIFICATION_TYPES = {
  QUEST_COMPLETE: 'quest_complete',
  BADGE_EARNED: 'badge_earned',
  LEVEL_UP: 'level_up',
  STREAK_REMINDER: 'streak_reminder',
  NEW_QUEST: 'new_quest',
  PREMIUM_EXPIRING: 'premium_expiring'
};

// Social share templates
export const SHARE_TEMPLATES = {
  QUEST_COMPLETE: {
    en: "I just completed '{{quest}}' on FinanceQuest! 🎯 Join me in mastering personal finance! #FinanceQuest #PersonalFinance",
    fr: "Je viens de terminer '{{quest}}' sur FinanceQuest ! 🎯 Rejoignez-moi pour maîtriser les finances personnelles ! #FinanceQuest #FinancesPersonnelles"
  },
  LEVEL_UP: {
    en: "I just reached {{level}} level on FinanceQuest! 🚀 {{xp}} XP and counting! #FinanceQuest #LevelUp",
    fr: "Je viens d'atteindre le niveau {{level}} sur FinanceQuest ! 🚀 {{xp}} XP et ça continue ! #FinanceQuest #NiveauSupérieur"
  },
  BADGE_EARNED: {
    en: "New badge unlocked: {{badge}} on FinanceQuest! 🏆 #FinanceQuest #Achievement",
    fr: "Nouveau badge débloqué : {{badge}} sur FinanceQuest ! 🏆 #FinanceQuest #Accomplissement"
  }
};

// Feature flags
export const FEATURES = {
  SOCIAL_LOGIN: false,
  REFERRAL_PROGRAM: false,
  ACHIEVEMENTS_V2: false,
  DARK_MODE: false,
  OFFLINE_MODE: true,
  PUSH_NOTIFICATIONS: true,
  ANALYTICS: true,
  A_B_TESTING: false
};

// External links
export const EXTERNAL_LINKS = {
  SUPPORT: 'https://support.financequest.app',
  PRIVACY: 'https://financequest.app/privacy',
  TERMS: 'https://financequest.app/terms',
  BLOG: 'https://blog.financequest.app',
  TWITTER: 'https://twitter.com/financequest',
  FACEBOOK: 'https://facebook.com/financequest',
  INSTAGRAM: 'https://instagram.com/financequest'
};

// Default values
export const DEFAULTS = {
  AVATAR_URL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  QUEST_IMAGE: '/assets/default-quest.png',
  BADGE_IMAGE: '/assets/default-badge.png',
  LANGUAGE: 'en',
  THEME: 'light',
  CURRENCY: 'USD',
  TIMEZONE: 'UTC'
};

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  PAYMENT_FAILED: 'PAYMENT_FAILED'
};

// Success codes
export const SUCCESS_CODES = {
  QUEST_COMPLETED: 'QUEST_COMPLETED',
  BADGE_EARNED: 'BADGE_EARNED',
  LEVEL_UP: 'LEVEL_UP',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS'
};

// PWA config
export const PWA_CONFIG = {
  CACHE_NAME: 'financequest-v1',
  STATIC_CACHE: 'financequest-static-v1',
  DYNAMIC_CACHE: 'financequest-dynamic-v1',
  MAX_CACHE_SIZE: 50,
  CACHE_DURATION: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Analytics events
export const ANALYTICS_EVENTS = {
  // User events
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_PROFILE_UPDATE: 'user_profile_update',
  
  // Quest events
  QUEST_START: 'quest_start',
  QUEST_COMPLETE: 'quest_complete',
  QUEST_ABANDON: 'quest_abandon',
  QUEST_STEP_COMPLETE: 'quest_step_complete',
  
  // Premium events
  PREMIUM_VIEW: 'premium_view',
  PREMIUM_SUBSCRIBE: 'premium_subscribe',
  PREMIUM_CANCEL: 'premium_cancel',
  
  // Engagement events
  APP_OPEN: 'app_open',
  SHARE_CONTENT: 'share_content',
  BADGE_EARNED: 'badge_earned',
  STREAK_MAINTAINED: 'streak_maintained'
};

// Regex patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Time constants
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000
};