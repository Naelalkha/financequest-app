import React from 'react';
import QuestListView from '../features/quests/QuestListView';
import { AppBackground, BottomNav } from '../components/layout';

/**
 * QuestList Page - Simplified Router Component
 * 
 * Following the "CARTE" pattern:
 * - No business logic here
 * - Just imports QuestListView from features
 * - Wraps with layout components
 * 
 * Note: QuestListView handles all quest filtering, sorting, and user progress
 */
const QuestList = () => {
    return (
        <AppBackground variant="onyx">
            <QuestListView />
            <BottomNav />
        </AppBackground>
    );
};

export default QuestList;