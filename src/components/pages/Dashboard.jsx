import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useServerImpactAggregates } from '../../hooks/useServerImpactAggregates';
import { useGamification } from '../../hooks/useGamification';
import { useLocalQuests } from '../../hooks/useLocalQuests';
import { computeLevel } from '../../utils/gamification';
import { trackEvent } from '../../utils/analytics';
import { toast } from 'react-toastify';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getUserDailyChallenge } from '../../services/dailyChallenge';

// Components
import AppBackground from '../app/AppBackground';
import BottomNav from '../app/BottomNav';
import OnyxHeader from '../dashboard/onyx/OnyxHeader';
import OnyxScoreboard from '../dashboard/onyx/OnyxScoreboard';
import OnyxBentoStats from '../dashboard/onyx/OnyxBentoStats';
import OnyxQuestsView from '../dashboard/onyx/OnyxQuestsView';
import OnyxDailyChallenge from '../dashboard/onyx/OnyxDailyChallenge';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // State for Firestore data
  const [userData, setUserData] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hooks
  const { quests, loading: questsLoading } = useLocalQuests();
  const { impactAnnualEstimated } = useServerImpactAggregates();
  const { gamification } = useGamification();

  // Local State
  const [isGenerating, setIsGenerating] = useState(false);

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
          const challenge = await getUserDailyChallenge(user.uid, language || 'fr');
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.info("Scanning for financial opportunities...");
    } catch (error) {
      console.error("Error starting quest:", error);
      toast.error("System malfunction. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteQuest = async (questId) => {
    try {
      // This would update Firestore - for now just track
      trackEvent('quest_completed', { questId });
      toast.success("MISSION ACCOMPLISHED");
    } catch (error) {
      console.error("Error completing quest:", error);
      toast.error("Failed to complete mission.");
    }
  };

  const handleNavigateToQuest = (questId) => {
    navigate(`/quest/${questId}`);
  };

  const handleStartDailyChallenge = () => {
    if (dailyChallenge?.questId) {
      navigate(`/quests/${dailyChallenge.questId}`);
    }
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
        <AppBackground variant="onyx" />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5FF00] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#E5FF00] selection:text-black pb-24">
      <AppBackground variant="onyx" />

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">

        {/* 1. Header */}
        <OnyxHeader
          stats={{
            streakDays: streakDays,
            level: levelData.level,
            currentXp: levelData.currentLevelXP,
            nextLevelXp: levelData.xpForNextLevel
          }}
          userAvatar={userData?.photoURL || user?.photoURL}
        />

        {/* 2. Scoreboard (Impact Hero) */}
        <OnyxScoreboard
          impactAnnual={impactAnnualEstimated || 0}
          currency={userData?.currency || '€'}
          onStartQuest={handleStartQuest}
          isLoading={isGenerating}
        />

        {/* 2.5 Daily Challenge (if exists) */}
        {dailyChallenge && dailyChallenge.status !== 'completed' && (
          <OnyxDailyChallenge
            challenge={dailyChallenge}
            onStart={handleStartDailyChallenge}
            isLoading={isGenerating}
          />
        )}

        {/* 3. Bento Stats (Badges & Log) */}
        <OnyxBentoStats
          badges={badges}
          recentImpact={recentImpact}
        />

        {/* 4. Quests View (Active & Archive) */}
        <OnyxQuestsView
          activeQuests={activeQuests}
          completedQuests={completedQuests}
          onComplete={handleCompleteQuest}
          onStartQuest={handleStartQuest}
          onNavigate={handleNavigateToQuest}
          isLoading={isGenerating}
        />

      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;