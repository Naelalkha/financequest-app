import React, { useEffect, useState, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DURATION, EASE } from '../../styles/animationConstants';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useServerImpactAggregates } from '../../hooks/useServerImpactAggregates';
import { useGamification } from '../../hooks/useGamification';
import { useLocalQuests, Quest } from '../../hooks/useLocalQuests';
import { useBackground } from '../../contexts/BackgroundContext';
import { computeLevel } from '../../utils/gamification';
import { trackEvent } from '../../utils/analytics';
import { createSavingsEventInFirestore } from '../../services/savingsEvents';
import { updateGamificationOnQuestComplete } from '../../services/gamification';

// Custom hooks for data management
import { useDashboardData, useDashboardQuests } from './hooks';

// Components (eagerly loaded - critical path)
import DashboardHeader from './components/DashboardHeader';
import DashboardScoreboard from './components/DashboardScoreboard';
import DashboardBentoStats from './components/DashboardBentoStats';
import DashboardDailyChallenge from './components/DashboardDailyChallenge';
import CategoryGrid from './components/CategoryGrid';
import { markFirstRunShown } from './components/FirstRunMissionModal';
import { SaveProgressBanner } from '../../components/ui';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { onboardingStore } from '../onboarding/onboardingStore';

// Lazy-loaded components (not on critical path)
const SmartMissionModal = lazy(() => import('./components/SmartMissionModal'));
const SpotlightOverlay = lazy(() => import('./components/SpotlightOverlay'));
const QuestDetailsModal = lazy(() => import('./components/QuestDetailsModal'));
const CutSubscriptionFlow = lazy(() =>
    import('../quests/pilotage/cut-subscription').then(m => ({ default: m.CutSubscriptionFlow }))
);
const MicroExpensesFlow = lazy(() =>
    import('../quests/pilotage/micro-expenses').then(m => ({ default: m.MicroExpensesFlow }))
);

/** Modified quest with extra fields */
interface ModifiedQuest extends Quest {
    monetaryValue?: number;
    annualSavings?: number;
}

/** Fallback for lazy-loaded modals */
const ModalFallback = () => null;

/** Black overlay fallback for SpotlightOverlay during lazy load */
const SpotlightFallback = () => (
    <div className="fixed inset-0 z-[1000] bg-black" />
);

/**
 * DashboardView - Main dashboard feature view
 * Optimized with custom hooks and memoization
 */
const DashboardView: React.FC = () => {
    const { t, i18n } = useTranslation('dashboard');
    const { t: tCommon } = useTranslation('common');
    const { setBackgroundMode } = useBackground();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Refs for spotlight targets
    const missionButtonRef = useRef<HTMLButtonElement>(null);
    const scoreboardContainerRef = useRef<HTMLDivElement>(null);

    // Custom hooks for data fetching (extracted from component)
    const { userData, userProgress, dailyChallenge, loading } = useDashboardData();
    const { quests, loading: questsLoading } = useLocalQuests();
    const { impactAnnualEstimated, manualRecalculate } = useServerImpactAggregates();
    const { gamification } = useGamification();

    // Memoized quest filtering (extracted from component)
    const { completedQuestIds, availableQuests } = useDashboardQuests(quests, userProgress);

    // Local UI State
    const [showSmartMission, setShowSmartMission] = useState(false);
    const [recommendedQuest, setRecommendedQuest] = useState<Quest | null>(null);
    const [showQuestDetails, setShowQuestDetails] = useState(false);
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
    const [isFirstRunMission, setIsFirstRunMission] = useState(false);
    const [localImpactBoost, setLocalImpactBoost] = useState(0);

    // Delayed loader state
    const [showLoader, setShowLoader] = useState(false);

    // Spotlight state
    const spotlightDismissedRef = useRef(false);
    const hasProcessedFirstRun = useRef(false);
    const [showSpotlight, setShowSpotlight] = useState(() => {
        const isFirstRun = searchParams.get('firstRun') === 'true';
        return isFirstRun && !spotlightDismissedRef.current;
    });

    // Memoized derived state
    const levelData = useMemo(() => computeLevel(gamification?.xpTotal || 0), [gamification?.xpTotal]);
    const streakDays = useMemo(() => userData?.currentStreak || userData?.streaks || 0, [userData]);
    const badges = useMemo(() => gamification?.badges || [], [gamification?.badges]);

    // Memoized stats object for DashboardHeader (prevents re-renders)
    const headerStats = useMemo(() => ({
        streakDays,
        level: levelData.level,
        xpInCurrentLevel: levelData.xpInCurrentLevel,
        xpForNextLevel: levelData.nextLevelXP ? (levelData.nextLevelXP - levelData.currentLevelXP) : 100
    }), [streakDays, levelData]);

    // Memoized recent impact (static mock data)
    const recentImpact = useMemo(() => [
        { id: 1, label: 'Netflix Cancel', time: '2h ago', val: '15€' },
        { id: 2, label: 'Coffee Skip', time: '1d ago', val: '5€' },
        { id: 3, label: 'Bike Commute', time: '2d ago', val: '12€' },
    ], []);

    // Get recommended quest based on user XP
    const getRecommendedQuest = useCallback((quests: Quest[]) => {
        if (!quests || quests.length === 0) return null;

        const userXP = gamification?.xpTotal || 0;

        if (userXP < 500) {
            const beginnerQuests = quests.filter(
                q => q.difficulty === 'beginner' || q.difficulty === 'easy'
            );
            if (beginnerQuests.length > 0) {
                return beginnerQuests[Math.floor(Math.random() * beginnerQuests.length)];
            }
        }

        return quests[Math.floor(Math.random() * quests.length)];
    }, [gamification?.xpTotal]);

    // Handlers with useCallback
    const handleStartQuest = useCallback(() => {
        if (showSmartMission) return;
        if (availableQuests.length === 0) return;

        const recommended = getRecommendedQuest(availableQuests);
        setRecommendedQuest(recommended);
        setShowSmartMission(true);
    }, [showSmartMission, availableQuests, getRecommendedQuest]);

    const handleAcceptQuest = useCallback(async (quest: Quest) => {
        try {
            trackEvent('quest_accepted', { questId: quest.id, source: 'smart_mission' });

            setSelectedQuest(quest);
            setShowQuestDetails(true);

            setTimeout(() => {
                setShowSmartMission(false);
            }, 500);
        } catch (error) {
            console.error("Error accepting quest:", error);
        }
    }, []);

    const handleCompleteQuestFromDetails = useCallback(async (modifiedQuest: ModifiedQuest) => {
        if (!user) {
            console.error('❌ Cannot complete quest: user not authenticated');
            return;
        }

        try {
            const annualSavings = modifiedQuest.annualSavings
                || (modifiedQuest.monetaryValue ? modifiedQuest.monetaryValue * 12 : 0);

            if (annualSavings > 0) {
                setLocalImpactBoost(prev => prev + annualSavings);

                await createSavingsEventInFirestore(user.uid, {
                    title: modifiedQuest.title || 'Quest completed',
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

            // Transform userProgress for gamification service
            const progressForGamification = Object.fromEntries(
                Object.entries(userProgress).map(([id, p]) => [id, { completed: p.status === 'completed' }])
            );

            const questForGamification = {
                id: modifiedQuest.id,
                xp: modifiedQuest.xp,
                xpReward: modifiedQuest.xpReward,
                difficulty: modifiedQuest.difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | undefined
            };

            await updateGamificationOnQuestComplete(user.uid, {
                quest: questForGamification,
                score: null,
                userProgress: progressForGamification,
                allQuests: quests || []
            });

            trackEvent('quest_completed', {
                questId: modifiedQuest.id,
                monetaryValue: modifiedQuest.monetaryValue,
                xpReward: modifiedQuest.xpReward,
                source: 'smart_mission_flow'
            });

            setShowQuestDetails(false);
            setSelectedQuest(null);

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
    }, [user, userProgress, quests, manualRecalculate]);

    const handleRerollQuest = useCallback(() => {
        const filteredQuests = availableQuests.filter(q => q.id !== recommendedQuest?.id);

        if (filteredQuests.length === 0) {
            return recommendedQuest;
        }

        const newRecommendation = filteredQuests[Math.floor(Math.random() * filteredQuests.length)];
        setRecommendedQuest(newRecommendation);
        return newRecommendation;
    }, [availableQuests, recommendedQuest]);

    const handleStartDailyChallenge = useCallback(() => {
        if (dailyChallenge?.questId) {
            navigate(`/quests/${dailyChallenge.questId}`);
        }
    }, [dailyChallenge, navigate]);

    const handleSelectCategory = useCallback((category: string) => {
        navigate(`/quests?category=${category}`);
    }, [navigate]);

    const handleCloseSmartMission = useCallback(() => {
        setShowSmartMission(false);
        setIsFirstRunMission(false);
    }, []);

    const handleCloseQuestDetails = useCallback(() => {
        setShowQuestDetails(false);
        setSelectedQuest(null);
    }, []);

    const handleSpotlightDismiss = useCallback(() => {
        setShowSpotlight(false);
        spotlightDismissedRef.current = true;
        markFirstRunShown();
    }, []);

    const handleSpotlightClick = useCallback(() => {
        const selectedMissionId = onboardingStore.getSelectedMissionId();
        const targetQuest = (quests || []).find(q => q.id === selectedMissionId);
        const questToShow = targetQuest || (quests || []).find(q => q.id === 'micro-expenses');

        if (questToShow) {
            setRecommendedQuest(questToShow);
            setIsFirstRunMission(true);
            setShowSmartMission(true);

            setTimeout(() => {
                setShowSpotlight(false);
                spotlightDismissedRef.current = true;
                markFirstRunShown();
            }, 300);
        } else {
            setShowSpotlight(false);
            spotlightDismissedRef.current = true;
            markFirstRunShown();
        }
    }, [quests]);

    // Effects
    useEffect(() => {
        trackEvent('dashboard_viewed');
        setBackgroundMode('macro');
    }, [setBackgroundMode]);

    useEffect(() => {
        const isFirstRun = searchParams.get('firstRun') === 'true';

        if (isFirstRun && !hasProcessedFirstRun.current && !spotlightDismissedRef.current) {
            hasProcessedFirstRun.current = true;
            markFirstRunShown();

            searchParams.delete('firstRun');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Delayed loader effect
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (loading || questsLoading) {
            timer = setTimeout(() => {
                setShowLoader(true);
            }, 150);
        } else {
            setShowLoader(false);
        }
        return () => clearTimeout(timer);
    }, [loading, questsLoading]);

    // Block scroll when spotlight is visible
    useEffect(() => {
        const scrollContainer = document.getElementById('app-scroll-container');
        if (!scrollContainer) return;

        if (showSpotlight) {
            const scrollY = scrollContainer.scrollTop;
            scrollContainer.style.overflow = 'hidden';
            scrollContainer.dataset.scrollPosition = String(scrollY);
        } else {
            const savedScrollY = scrollContainer.dataset.scrollPosition;
            scrollContainer.style.overflow = '';
            if (savedScrollY) {
                scrollContainer.scrollTop = parseInt(savedScrollY, 10);
                delete scrollContainer.dataset.scrollPosition;
            }
        }

        return () => {
            if (scrollContainer) {
                scrollContainer.style.overflow = '';
                delete scrollContainer.dataset.scrollPosition;
            }
        };
    }, [showSpotlight]);

    // Loading states
    const isFirstRun = showSpotlight || searchParams.get('firstRun') === 'true';
    const isLoading = (loading || questsLoading) && !isFirstRun;

    if (isLoading) {
        if (showLoader) {
            return (
                <motion.div
                    className="min-h-screen flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DURATION.medium, ease: EASE.premium }}
                >
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: DURATION.normal, ease: EASE.outExpo, delay: 0.05 }}
                    >
                        <div className="mb-6 flex items-center justify-center">
                            <LoadingSpinner size="lg" />
                        </div>
                        <motion.p
                            className="text-gray-400 text-lg font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15, duration: DURATION.normal }}
                        >
                            {tCommon('ui.loading_app') || 'Loading Moniyo...'}
                        </motion.p>
                    </motion.div>
                </motion.div>
            );
        }
        return <div className="min-h-screen" />;
    }

    return (
        <motion.div
            className="min-h-screen text-white font-sans selection:bg-[#E5FF00] selection:text-black pb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION.medium, ease: EASE.premium }}
        >
            <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">

                {/* 1. Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DURATION.medium, ease: EASE.outExpo, delay: 0.05 }}
                >
                    <DashboardHeader
                        stats={headerStats}
                        userAvatar={userData?.photoURL ?? user?.photoURL ?? undefined}
                    />
                </motion.div>

                {/* 1.5 Save Progress Banner */}
                <SaveProgressBanner />

                {/* 2. Scoreboard */}
                <motion.div
                    className="space-y-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DURATION.medium, ease: EASE.outExpo, delay: 0.1 }}
                >
                    <DashboardScoreboard
                        impactAnnual={(impactAnnualEstimated || 0) + localImpactBoost}
                        currency={userData?.currency || '€'}
                        onStartQuest={handleStartQuest}
                        buttonRef={missionButtonRef}
                        containerRef={scoreboardContainerRef}
                    />
                </motion.div>

                {/* 2.5 Daily Challenge */}
                {dailyChallenge && dailyChallenge.status !== 'completed' && (
                    <motion.div
                        className="mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: DURATION.medium, ease: EASE.outExpo, delay: 0.15 }}
                    >
                        <h2 className="px-6 font-mono text-sm text-neutral-500 font-medium tracking-widest uppercase mb-4">
                            {t('dailyChallenge') || 'DAILY CHALLENGE'}
                        </h2>
                        <DashboardDailyChallenge
                            challenge={dailyChallenge}
                            onStart={handleStartDailyChallenge}
                        />
                    </motion.div>
                )}

                {/* 2.6 Category Grid */}
                <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DURATION.medium, ease: EASE.outExpo, delay: 0.2 }}
                >
                    <h2 className="px-6 font-mono text-sm text-neutral-500 font-medium tracking-widest uppercase mb-4">
                        {t('categories') || 'CATEGORIES'}
                    </h2>
                    <CategoryGrid onSelectCategory={handleSelectCategory} />
                </motion.div>

                {/* 3. Bento Stats */}
                <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DURATION.medium, ease: EASE.outExpo, delay: 0.25 }}
                >
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
                </motion.div>

            </div>

            {/* Lazy-loaded Modals */}
            <Suspense fallback={<ModalFallback />}>
                <SmartMissionModal
                    isOpen={showSmartMission}
                    onClose={handleCloseSmartMission}
                    onAccept={handleAcceptQuest}
                    onReroll={handleRerollQuest}
                    initialQuest={recommendedQuest}
                    hideReroll={isFirstRunMission}
                />
            </Suspense>

            {/* Quest Details Modal */}
            <AnimatePresence mode="wait">
                {selectedQuest && (
                    <Suspense fallback={<ModalFallback />}>
                        {selectedQuest.id === 'cut-subscription' ? (
                            <CutSubscriptionFlow
                                key="cut-subscription-flow"
                                quest={selectedQuest}
                                onClose={handleCloseQuestDetails}
                                onComplete={(result) => {
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
                                    xpProgress: Math.round((levelData.currentLevelXP / (levelData.xpForNextLevel || 100)) * 100)
                                }}
                            />
                        ) : selectedQuest.id === 'micro-expenses' ? (
                            <MicroExpensesFlow
                                key="micro-expenses-flow"
                                quest={selectedQuest}
                                onClose={handleCloseQuestDetails}
                                onComplete={(result) => {
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
                                    xpProgress: Math.round((levelData.currentLevelXP / (levelData.xpForNextLevel || 100)) * 100)
                                }}
                            />
                        ) : (
                            <QuestDetailsModal
                                key="quest-details-modal"
                                quest={selectedQuest}
                                onClose={handleCloseQuestDetails}
                                onComplete={handleCompleteQuestFromDetails}
                            />
                        )}
                    </Suspense>
                )}
            </AnimatePresence>

            {/* Spotlight Overlay */}
            {/* Use SpotlightFallback (black screen) when spotlight should be visible during lazy load */}
            <Suspense fallback={showSpotlight ? <SpotlightFallback /> : <ModalFallback />}>
                <SpotlightOverlay
                    isVisible={showSpotlight}
                    buttonRef={missionButtonRef}
                    onDismiss={handleSpotlightDismiss}
                    onSpotlightClick={handleSpotlightClick}
                />
            </Suspense>
        </motion.div>
    );
};

export default DashboardView;
