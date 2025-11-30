import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useServerImpactAggregates } from '../../hooks/useServerImpactAggregates';
import { useGamification } from '../../hooks/useGamification';
import { useLocalQuests } from '../../hooks/useLocalQuests';
import { computeLevel } from '../../utils/gamification';
import { trackEvent } from '../../utils/analytics';
import { toast } from 'react-toastify';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getUserDailyChallenge } from '../../services/dailyChallenge';
import { createSavingsEventInFirestore } from '../../services/savingsEvents';
import { updateGamificationOnQuestComplete } from '../../services/gamification';

// Components
import DashboardHeader from './components/DashboardHeader';
import DashboardScoreboard from './components/DashboardScoreboard';
import DashboardBentoStats from './components/DashboardBentoStats';
import DashboardDailyChallenge from './components/DashboardDailyChallenge';
import CategoryGrid from './components/CategoryGrid';
import SmartMissionModal from './components/SmartMissionModal';
import QuestDetailsModal from './components/QuestDetailsModal';

/**
 * DashboardView - Main dashboard feature view
 * Contains all dashboard logic and composition
 */
const DashboardView = () => {
    const { t, i18n } = useTranslation('dashboard');
    const { user } = useAuth();
    const navigate = useNavigate();

    // State for Firestore data
    const [userData, setUserData] = useState(null);
    const [userProgress, setUserProgress] = useState({});
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hooks
    const { quests, loading: questsLoading } = useLocalQuests();
    const { impactAnnualEstimated, manualRecalculate } = useServerImpactAggregates();
    const { gamification } = useGamification();

    // Local State
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSmartMission, setShowSmartMission] = useState(false);
    const [recommendedQuest, setRecommendedQuest] = useState(null);
    const [showQuestDetails, setShowQuestDetails] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState(null);

    // Local impact override for optimistic updates
    const [localImpactBoost, setLocalImpactBoost] = useState(0);

    // Fetch user data from Firestore
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch user document
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserData(userSnap.data());
                }

                // Fetch user quest progress
                const progressQuery = query(
                    collection(db, 'userQuests'),
                    where('userId', '==', user.uid)
                );
                const progressSnapshot = await getDocs(progressQuery);
                const progress = {};
                progressSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    progress[data.questId] = {
                        status: data.status,
                        progress: data.progress || 0,
                        completedAt: data.completedAt,
                        score: data.score || 0
                    };
                });
                setUserProgress(progress);

                // Fetch or generate daily challenge
                try {
                    const challenge = await getUserDailyChallenge(user.uid, i18n.language || 'fr');
                    setDailyChallenge(challenge);
                } catch (err) {
                    console.error('❌ Error with daily challenge:', err);
                    setDailyChallenge(null);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    // Derived State
    const levelData = computeLevel(gamification?.xpTotal || 0);
    const streakDays = userData?.currentStreak || userData?.streaks || 0;

    // Filter quests by status
    const activeQuestIds = Object.entries(userProgress)
        .filter(([_, p]) => p?.status === 'active' && (p?.progress || 0) > 0)
        .map(([id]) => id);

    const completedQuestIds = Object.entries(userProgress)
        .filter(([_, p]) => p?.status === 'completed')
        .map(([id]) => id);

    // Map quest IDs to full quest objects
    const activeQuests = (quests || [])
        .filter(q => activeQuestIds.includes(q.id))
        .map(q => ({
            ...q,
            progress: userProgress[q.id]?.progress || 0
        }));

    const completedQuests = (quests || [])
        .filter(q => completedQuestIds.includes(q.id));

    // Map gamification badges to proper format
    const badges = (gamification?.badges || []).map((badgeId) => ({
        id: badgeId,
        icon: '🏆',
        name: badgeId,
        achievedAt: new Date()
    }));

    // Effects
    useEffect(() => {
        trackEvent('dashboard_viewed');
    }, []);

    // Handlers
    const handleStartQuest = async () => {
        if (isGenerating) return;
        setIsGenerating(true);

        try {
            // Get available quests
            const availableQuests = (quests || []).filter(
                q => !completedQuestIds.includes(q.id)
            );

            if (availableQuests.length === 0) {
                toast.info(t('quests.no_quests') || 'All quests completed! 🎉');
                setIsGenerating(false);
                return;
            }

            // Generate a recommendation
            const recommended = getRecommendedQuest(availableQuests);
            setRecommendedQuest(recommended);
            setShowSmartMission(true);

        } catch (error) {
            console.error("❌ Error starting quest:", error);
            toast.error("System malfunction. Try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Get recommended quest based on user data
    const getRecommendedQuest = (availableQuests) => {
        if (!availableQuests || availableQuests.length === 0) return null;

        const userXP = gamification?.xpTotal || 0;

        if (userXP < 500) {
            const beginnerQuests = availableQuests.filter(
                q => q.difficulty === 'beginner' || q.difficulty === 'easy'
            );
            if (beginnerQuests.length > 0) {
                return beginnerQuests[Math.floor(Math.random() * beginnerQuests.length)];
            }
        }

        return availableQuests[Math.floor(Math.random() * availableQuests.length)];
    };

    // Handle accepting a quest from SmartMissionModal
    const handleAcceptQuest = async (quest) => {
        try {
            trackEvent('quest_accepted', { questId: quest.id, source: 'smart_mission' });
            setShowSmartMission(false);
            setSelectedQuest(quest);
            setShowQuestDetails(true);
        } catch (error) {
            console.error("Error accepting quest:", error);
            toast.error(t('errors.generic'));
        }
    };

    // Handle quest completion from QuestDetailsModal
    const handleCompleteQuestFromDetails = async (modifiedQuest) => {
        try {
            // Create savings event in Firebase if there's monetary value
            if (modifiedQuest.monetaryValue && modifiedQuest.monetaryValue > 0) {
                const annualSavings = modifiedQuest.monetaryValue * 12;

                // OPTIMISTIC UPDATE
                setLocalImpactBoost(prev => prev + annualSavings);

                await createSavingsEventInFirestore(user.uid, {
                    title: modifiedQuest.title,
                    questId: modifiedQuest.id,
                    amount: modifiedQuest.monetaryValue,
                    period: 'month',
                    source: 'quest',
                    proof: {
                        type: 'note',
                        note: `Completed via SmartMission flow - ${new Date().toLocaleDateString()}`
                    }
                });
            }

            // Update gamification (XP, level, badges)
            const gamificationResult = await updateGamificationOnQuestComplete(user.uid, {
                quest: modifiedQuest,
                score: null,
                userProgress: userProgress,
                allQuests: quests || []
            });

            if (gamificationResult) {
                const xpGained = gamificationResult.xpGained || 0;
                const annualSavings = modifiedQuest.monetaryValue ? modifiedQuest.monetaryValue * 12 : 0;

                if (annualSavings > 0) {
                    toast.success(
                        `🎉 ${modifiedQuest.title} completed!\n💰 +€${annualSavings.toFixed(2)}/year\n⚡ +${xpGained} XP`,
                        { autoClose: 5000 }
                    );
                } else {
                    toast.success(`🎉 ${modifiedQuest.title} completed! +${xpGained} XP`);
                }
            } else {
                toast.success(`🎉 ${modifiedQuest.title} completed!`);
            }

            // Track analytics
            trackEvent('quest_completed', {
                questId: modifiedQuest.id,
                monetaryValue: modifiedQuest.monetaryValue,
                xpReward: modifiedQuest.xpReward,
                source: 'smart_mission_flow'
            });

            // Close modal
            setShowQuestDetails(false);
            setSelectedQuest(null);

            // Force impact recalculation
            setTimeout(async () => {
                try {
                    if (manualRecalculate) {
                        await manualRecalculate();
                    }
                } catch (err) {
                    console.warn('⚠️ Manual recalculation failed');
                }
            }, 500);

        } catch (error) {
            console.error("❌ Error completing quest:", error);
            toast.error(t('errors.complete_quest_failed') || 'Failed to save quest completion');
        }
    };

    // Handle rerolling quest recommendation
    const handleRerollQuest = () => {
        const availableQuests = (quests || []).filter(
            q => !completedQuestIds.includes(q.id) &&
                q.id !== recommendedQuest?.id
        );

        if (availableQuests.length === 0) {
            toast.info('No other quests available');
            return recommendedQuest;
        }

        const newRecommendation = availableQuests[Math.floor(Math.random() * availableQuests.length)];
        setRecommendedQuest(newRecommendation);
        return newRecommendation;
    };

    const handleStartDailyChallenge = () => {
        if (dailyChallenge?.questId) {
            navigate(`/quests/${dailyChallenge.questId}`);
        }
    };

    const handleSelectCategory = (category) => {
        navigate(`/quests?category=${category}`);
    };

    // Mock Data for Bento
    const recentImpact = [
        { id: 1, label: 'Netflix Cancel', time: '2h ago', val: '15€' },
        { id: 2, label: 'Coffee Skip', time: '1d ago', val: '5€' },
        { id: 3, label: 'Bike Commute', time: '2d ago', val: '12€' },
    ];

    if (loading || questsLoading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5FF00] mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white font-sans selection:bg-[#E5FF00] selection:text-black pb-24">
            <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">

                {/* 1. Header */}
                <DashboardHeader
                    stats={{
                        streakDays: streakDays,
                        level: levelData.level,
                        currentXp: levelData.currentLevelXP,
                        nextLevelXp: levelData.xpForNextLevel
                    }}
                    userAvatar={userData?.photoURL || user?.photoURL}
                />

                {/* 2. Scoreboard (Impact Hero) */}
                <div className="space-y-6">
                    <DashboardScoreboard
                        impactAnnual={(impactAnnualEstimated || 0) + localImpactBoost}
                        currency={userData?.currency || '€'}
                        onStartQuest={handleStartQuest}
                        isLoading={isGenerating}
                    />
                </div>

                {/* 2.5 Daily Challenge (if exists) */}
                {dailyChallenge && dailyChallenge.status !== 'completed' && (
                    <div className="mt-8">
                        <h2 className="px-6 font-mono text-sm text-neutral-500 font-medium tracking-widest uppercase mb-4">{t('dailyChallenge') || 'DAILY CHALLENGE'}</h2>
                        <DashboardDailyChallenge
                            challenge={dailyChallenge}
                            onStart={handleStartDailyChallenge}
                            isLoading={isGenerating}
                        />
                    </div>
                )}

                {/* 2.6 Category Grid */}
                <div className="mt-8">
                    <h2 className="px-6 font-mono text-sm text-neutral-500 font-medium tracking-widest uppercase mb-4">{t('categories') || 'CATEGORIES'}</h2>
                    <CategoryGrid onSelectCategory={handleSelectCategory} />
                </div>

                {/* 3. Bento Stats (Badges & Log) */}
                <div className="mt-8">
                    <div className="px-6 flex justify-between items-end mb-4">
                        <h2 className="font-mono text-sm text-neutral-500 font-medium tracking-widest uppercase">COLLECTION</h2>
                        <button className="text-xs text-neutral-600 hover:text-[#E2FF00] transition-colors font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                            View All <span className="text-[10px]">&gt;</span>
                        </button>
                    </div>
                    <DashboardBentoStats
                        badges={badges}
                        recentImpact={recentImpact}
                        levelData={levelData}
                    />
                </div>

            </div>

            {/* SmartMission Modal */}
            <SmartMissionModal
                isOpen={showSmartMission}
                onClose={() => setShowSmartMission(false)}
                onAccept={handleAcceptQuest}
                onReroll={handleRerollQuest}
                initialQuest={recommendedQuest}
            />

            {/* QuestDetails Modal (3-step flow) */}
            {selectedQuest && (
                <QuestDetailsModal
                    quest={selectedQuest}
                    onClose={() => {
                        setShowQuestDetails(false);
                        setSelectedQuest(null);
                    }}
                    onComplete={handleCompleteQuestFromDetails}
                />
            )}
        </div>
    );
};

export default DashboardView;
