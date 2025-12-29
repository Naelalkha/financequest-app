import React from 'react';
import QuestListView from '../features/quests/QuestListView';
import AppBackground from '../components/layout/AppBackground';
import BottomNav from '../components/layout/BottomNav';

/**
 * QuestList Page - Simplified Router Component
 * Following the "CARTE" pattern
 */
const QuestList: React.FC = () => {
    return (
        <AppBackground>
            <QuestListView />
            <BottomNav />
        </AppBackground>
    );
};

export default QuestList;
