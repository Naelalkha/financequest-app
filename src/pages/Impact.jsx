import React from 'react';
import ImpactView from '../features/impact/ImpactView';
import { AppBackground, BottomNav } from '../components/layout';

/**
 * Impact Page - Simplified Router Component
 * 
 * Following the "CARTE" pattern:
 * - No business logic here
 * - Just imports ImpactView from features
 * - Wraps with layout components
 * 
 * Note: ImpactView handles its own data loading via useSavingsEvents hook
 */
const Impact = () => {
  return (
    <AppBackground variant="onyx">
      <ImpactView />
      <BottomNav />
    </AppBackground>
  );
};

export default Impact;
