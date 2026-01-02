/**
 * Dashboard Feature - Barrel Export
 */

// Main view
export { default as DashboardView } from './DashboardView';

// Components
export { default as DashboardHeader } from './components/DashboardHeader';
export { default as DashboardScoreboard } from './components/DashboardScoreboard';
export { default as CategoryGrid } from './components/CategoryGrid';

// Hooks
export { useDashboardData, useDashboardQuests } from './hooks';
export type { UserData, QuestProgress, DailyChallenge, DashboardData } from './hooks';
export type { QuestWithProgress, DashboardQuestsData } from './hooks';
