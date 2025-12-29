import React from 'react';
import ImpactView from '../features/impact/ImpactView';
import AppBackground from '../components/layout/AppBackground';
import BottomNav from '../components/layout/BottomNav';

/**
 * Impact Page - Simplified Router Component
 * Following the "CARTE" pattern
 */
const Impact: React.FC = () => {
    return (
        <AppBackground>
            <ImpactView />
            <BottomNav />
        </AppBackground>
    );
};

export default Impact;
