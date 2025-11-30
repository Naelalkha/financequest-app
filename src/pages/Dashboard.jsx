import React from 'react';
import DashboardView from '../features/dashboard/DashboardView';
import { AppBackground, BottomNav } from '../components/layout';

/**
 * Dashboard Page - Simplified Router Component
 * 
 * Following the "CARTE" pattern:
 * - No business logic here
 * - Just imports DashboardView from features
 * - Wraps with layout components (AppBackground, BottomNav)
 */
const Dashboard = () => {
  return (
    <>
      <DashboardView />
    </>
  );
};

export default Dashboard;