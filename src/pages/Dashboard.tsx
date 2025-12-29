import React from 'react';
import DashboardView from '../features/dashboard/DashboardView';

/**
 * Dashboard Page - Simplified Router Component
 * 
 * Following the "CARTE" pattern:
 * - No business logic here
 * - Just imports DashboardView from features
 */
const Dashboard: React.FC = () => {
    return (
        <>
            <DashboardView />
        </>
    );
};

export default Dashboard;
