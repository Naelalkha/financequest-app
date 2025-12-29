import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useServerImpactAggregates } from '../../hooks/useServerImpactAggregates';
import { useGamification } from '../../hooks/useGamification';
import { useLocalQuests, Quest } from '../../hooks/useLocalQuests';
import { useBackground } from '../../contexts/BackgroundContext';
import { computeLevel } from '../../utils/gamification';
import { trackEvent } from '../../utils/analytics';
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
import { markFirstRunShown } from './components/FirstRunMissionModal';
import SpotlightOverlay from './components/SpotlightOverlay';
import { CutSubscriptionFlow } from '../quests/pilotage/cut-subscription';
import { MicroExpensesFlow } from '../quests/pilotage/micro-expenses';
import { SaveProgressBanner } from '../../components/ui';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { onboardingStore } from '../onboarding/onboardingStore';

/** User data from Firestore */
interface UserData {
    photoURL?: string;
    currency?: string;
    currentStreak?: number;
    streaks?: number;
}

/** Quest progress entry */
interface QuestProgress {
    status: 'active' | 'completed' | 'pending';
    progress: number;
    completedAt?: Date;
    score: number;
}

/** Daily challenge data */
interface DailyChallenge {
    questId?: string;
    questTitle?: string;
    status?: string;
    rewards?: {
        xp?: number;
        savings?: string | number;
    };
}

/** Modified quest with extra fields */
interface ModifiedQuest extends Quest {
    monetaryValue?: number;
    annualSavings?: number;
}

/**
 * DashboardView - Main dashboard feature view
 * Contains all dashboard logic and composition
 */
const DashboardView: React.FC = () => {
    const { t, i18n } = useTranslation('dashboard');
    const { t: tCommon } = useTranslation('common');
    const { setBackgroundMode } = useBackground();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Refs for spotlight targets (Impact card + button)
    const missionButtonRef = useRef<HTMLButtonElement>(null);
    const scoreboardContainerRef = useRef<HTMLDivElement>(null);

    // State for Firestore data
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userProgress, setUserProgress] = useState<Record<string, QuestProgress>>({});
    const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
    const [loading, setLoading] = useState(true);

    // Hooks
    const { quests, loading: questsLoading } = useLocalQuests();
    const { impactAnnualEstimated, manualRecalculate } = useServerImpactAggregates();
    const { gamification } = useGamification();

    // Local State
    const [showSmartMission, setShowSmartMission] = useState(false);
    const [recommendedQuest, setRecommendedQuest] = useState<Quest | null>(null);
    const [showQuestDetails, setShowQuestDetails] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

    // Spotlight overlay state (shown after new onboarding)
    // Track si le spotlight a été fermé pour éviter toute réactivation
    const spotlightDismissedRef = useRef(false);

    // Initialiser showSpotlight directement à true si firstRun est détecté
    // Ceci évite le clignotement où le dashboard est visible sans overlay
    // Utiliser une fonction pour calculer la valeur initiale de façon synchrone
    const [showSpotlight, setShowSpotlight] = useState(() => {
        const isFirstRun = searchParams.get('firstRun') === 'true';
        return isFirstRun && !spotlightDismissedRef.current;
    });

    // Track if this is the first run mission (to hide reroll button)
    const [isFirstRunMission, setIsFirstRunMission] = useState(false);

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

    // Track if we've already processed firstRun to prevent race conditions
    const hasProcessedFirstRun = useRef(false);

    // Effect for dashboard init (no spotlight logic here)
    useEffect(() => {
        trackEvent('dashboard_viewed');
        setBackgroundMode('macro');
    }, [setBackgroundMode]);

    // Check firstRun on mount and clean URL if needed
    // Note: showSpotlight est déjà initialisé à true dans useState si firstRun est détecté
    useEffect(() => {
        const isFirstRun = searchParams.get('firstRun') === 'true';
        console.log('🎯 Dashboard - firstRun check:', isFirstRun, 'hasProcessed:', hasProcessedFirstRun.current);

        if (isFirstRun && !hasProcessedFirstRun.current && !spotlightDismissedRef.current) {
            hasProcessedFirstRun.current = true;
            markFirstRunShown();

            // Clean URL (showSpotlight est déjà true grâce à l'initialisation dans useState)
            searchParams.delete('firstRun');
            setSearchParams(searchParams, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // Handlers
    const handleStartQuest = () => {
        if (showSmartMission) return; // Prevent double-open

        // Get available quests
        const availableQuests = (quests || []).filter(
            q => !completedQuestIds.includes(q.id)
        );

        if (availableQuests.length === 0) return;

        // Generate a recommendation and open modal immediately
        const recommended = getRecommendedQuest(availableQuests);
        setRecommendedQuest(recommended);
        setShowSmartMission(true);
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

            // Show the quest FIRST - it appears on top (z-100) covering the modal (z-50)
            setSelectedQuest(quest);
            setShowQuestDetails(true);

            // Close the modal during the warp animation
            // The warp takes 400ms, so we close it slightly after (500ms)
            // to ensure the new quest view is fully mounted and opaque
            setTimeout(() => {
                setShowSmartMission(false);
            }, 500);
        } catch (error) {
            console.error("Error accepting quest:", error);
        }
    };

    // Handle quest completion from QuestDetailsModal
    const handleCompleteQuestFromDetails = async (modifiedQuest) => {
        try {
            // Calculate annual savings - use direct annual value if provided, otherwise monthly × 12
            const annualSavings = modifiedQuest.annualSavings
                || (modifiedQuest.monetaryValue ? modifiedQuest.monetaryValue * 12 : 0);

            // Create savings event in Firebase if there's monetary value
            if (annualSavings > 0) {
                // OPTIMISTIC UPDATE
                setLocalImpactBoost(prev => prev + annualSavings);

                // Store annual amount directly to avoid rounding errors (monthly × 12 ≠ yearly)
                await createSavingsEventInFirestore(user.uid, {
                    title: modifiedQuest.title,
                    questId: modifiedQuest.id,
                    amount: annualSavings,
                    period: 'year',
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

            // Succès silencieux - animations intégrées à implémenter

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
        }
    };

    // Handle rerolling quest recommendation
    const handleRerollQuest = () => {
        const availableQuests = (quests || []).filter(
            q => !completedQuestIds.includes(q.id) &&
                q.id !== recommendedQuest?.id
        );

        if (availableQuests.length === 0) {
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

    // If this is firstRun (from onboarding), bypass loading screen
    // The spotlight overlay will cover everything anyway
    const isFirstRun = showSpotlight || searchParams.get('firstRun') === 'true';

    if ((loading || questsLoading) && !isFirstRun) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-6 flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                    </div>
                    <p className="text-gray-400 text-lg font-medium">
                        {tCommon('ui.loading_app') || 'Loading Moniyo...'}
                    </p>
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
                        xpInCurrentLevel: levelData.xpInCurrentLevel,
                        xpForNextLevel: levelData.nextLevelXP ? (levelData.nextLevelXP - levelData.currentLevelXP) : 100
                    }}
                    userAvatar={userData?.photoURL || user?.photoURL}
                />

                {/* 1.5 Save Progress Banner (for anonymous users) */}
                <SaveProgressBanner />

                {/* 2. Scoreboard (Impact Hero) */}
                <div className="space-y-6 mb-8">
                    <DashboardScoreboard
                        impactAnnual={(impactAnnualEstimated || 0) + localImpactBoost}
                        currency={userData?.currency || '€'}
                        onStartQuest={handleStartQuest}
                        buttonRef={missionButtonRef}
                        containerRef={scoreboardContainerRef}
                    />
                </div>

                {/* 2.5 Daily Challenge (if exists) */}
                {dailyChallenge && dailyChallenge.status !== 'completed' && (
                    <div className="mt-8">
                        <h2 className="px-6 font-mono text-sm text-neutral-500 font-medium tracking-widest uppercase mb-4">{t('dailyChallenge') || 'DAILY CHALLENGE'}</h2>
                        <DashboardDailyChallenge
                            challenge={dailyChallenge}
                            onStart={handleStartDailyChallenge}
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

            {/* SmartMission Modal (Briefing Mission) */}
            <SmartMissionModal
                isOpen={showSmartMission}
                onClose={() => {
                    setShowSmartMission(false);
                    setIsFirstRunMission(false);
                }}
                onAccept={handleAcceptQuest}
                onReroll={handleRerollQuest}
                initialQuest={recommendedQuest}
                hideReroll={isFirstRunMission}
            />

            {/* QuestDetails Modal (3-step flow) */}
            <AnimatePresence mode="wait">
                {selectedQuest && (
                    selectedQuest.id === 'cut-subscription' ? (
                        <CutSubscriptionFlow
                            key="cut-subscription-flow"
                            quest={selectedQuest}
                            onClose={() => {
                                setShowQuestDetails(false);
                                setSelectedQuest(null);
                            }}
                            onComplete={(result) => {
                                // Transform result to match expected format
                                handleCompleteQuestFromDetails({
                                    ...selectedQuest,
                                    id: result.questId,
                                    title: result.serviceName
                                        ? `${t('quests:cutSubscription.title')} - ${result.serviceName}`
                                        : selectedQuest.title,
                                    monetaryValue: result.monthlyAmount,
                                    xpReward: result.xpEarned
                                });
                            }}
                            userProgress={{
                                streak: streakDays,
                                xpProgress: Math.round((levelData.currentLevelXP / levelData.xpForNextLevel) * 100)
                            }}
                        />
                    ) : selectedQuest.id === 'micro-expenses' ? (
                        <MicroExpensesFlow
                            key="micro-expenses-flow"
                            quest={selectedQuest}
                            onClose={() => {
                                setShowQuestDetails(false);
                                setSelectedQuest(null);
                            }}
                            onComplete={(result) => {
                                // Transform result to match expected format
                                // Pass yearlySavings directly to avoid rounding errors (monthly × 12 ≠ yearly)
                                handleCompleteQuestFromDetails({
                                    ...selectedQuest,
                                    id: result.questId,
                                    title: result.expenseName
                                        ? `${t('quests:microExpenses.title')} - ${result.expenseName}`
                                        : selectedQuest.title,
                                    annualSavings: result.yearlySavings,
                                    xpReward: result.xpEarned
                                });
                            }}
                            userProgress={{
                                streak: streakDays,
                                xpProgress: Math.round((levelData.currentLevelXP / levelData.xpForNextLevel) * 100)
                            }}
                        />
                    ) : (
                        <QuestDetailsModal
                            key="quest-details-modal"
                            quest={selectedQuest}
                            onClose={() => {
                                setShowQuestDetails(false);
                                setSelectedQuest(null);
                            }}
                            onComplete={handleCompleteQuestFromDetails}
                        />
                    )
                )}
            </AnimatePresence>

            {/* Note: FirstRunMissionModal (legacy) has been replaced by SpotlightOverlay + SmartMissionModal flow */}

            {/* Spotlight Overlay (shown after new onboarding) */}
            <SpotlightOverlay
                isVisible={showSpotlight}
                buttonRef={missionButtonRef}
                onDismiss={() => {
                    setShowSpotlight(false);
                    spotlightDismissedRef.current = true; // Marquer comme fermé pour éviter toute réactivation
                    markFirstRunShown();
                }}
                onSpotlightClick={() => {
                    // Get the mission based on pain point selection and open briefing modal
                    const selectedMissionId = onboardingStore.getSelectedMissionId();
                    const targetQuest = (quests || []).find(q => q.id === selectedMissionId);
                    const questToShow = targetQuest || (quests || []).find(q => q.id === 'micro-expenses');

                    if (questToShow) {
                        // FIRST: Open the SmartMissionModal (its overlay will cover the screen)
                        setRecommendedQuest(questToShow);
                        setIsFirstRunMission(true);
                        setShowSmartMission(true);

                        // THEN: Close spotlight after modal overlay is fully visible
                        // SmartMissionModal backdrop animation takes 250ms (DURATION.normal)
                        setTimeout(() => {
                            setShowSpotlight(false);
                            spotlightDismissedRef.current = true;
                            markFirstRunShown();
                        }, 300); // Wait for modal backdrop to be fully opaque
                    } else {
                        // No quest available - just close
                        setShowSpotlight(false);
                        spotlightDismissedRef.current = true;
                        markFirstRunShown();
                    }
                }}
            />
        </div>
    );
};

export default DashboardView;
