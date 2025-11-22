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
import { createSavingsEventInFirestore } from '../../services/savingsEvents';

// Components
import AppBackground from '../app/AppBackground';
import BottomNav from '../app/BottomNav';
import DashboardHeader from '../dashboard/DashboardHeader';
import DashboardScoreboard from '../dashboard/DashboardScoreboard';
import DashboardBentoStats from '../dashboard/DashboardBentoStats';
import DashboardQuestsView from '../dashboard/DashboardQuestsView';
import DashboardDailyChallenge from '../dashboard/DashboardDailyChallenge';
import SmartMissionModal from '../dashboard/SmartMissionModal';
import QuestDetailsModal from '../dashboard/QuestDetailsModal';

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
      // Simulate AI scanning
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Debug logs
      console.log('🔍 Total quests:', quests?.length);
      console.log('🔍 Active quest IDs:', activeQuestIds);
      console.log('🔍 Completed quest IDs:', completedQuestIds);
      
      // Get available quests
      // For SmartMission: Include active quests but exclude completed ones
      // (User might want to see recommended quests even if already started)
      const availableQuests = (quests || []).filter(
        q => !completedQuestIds.includes(q.id)
      );
      
      console.log('✅ Available quests:', availableQuests.length);
      console.log('✅ Including active quests for SmartMission');
      
      if (availableQuests.length === 0) {
        console.warn('⚠️ No quests found (all completed or no quests loaded)');
        toast.info(t('quests.no_quests') || 'All quests completed! 🎉');
        setIsGenerating(false);
        return;
      }
      
      // Generate a recommendation (simple random for now, can be improved with AI logic)
      const recommended = getRecommendedQuest(availableQuests);
      console.log('🎯 Recommended quest:', recommended);
      
      setRecommendedQuest(recommended);
      setShowSmartMission(true);
      console.log('✨ Opening SmartMission modal');
      
    } catch (error) {
      console.error("❌ Error starting quest:", error);
      toast.error("System malfunction. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Get recommended quest based on user data (simple algorithm)
  const getRecommendedQuest = (availableQuests) => {
    if (!availableQuests || availableQuests.length === 0) return null;
    
    // Priority logic:
    // 1. Beginner quests if user is new (< 500 XP)
    // 2. High impact quests
    // 3. Shorter quests
    const userXP = gamification?.xpTotal || 0;
    
    if (userXP < 500) {
      const beginnerQuests = availableQuests.filter(
        q => q.difficulty === 'beginner' || q.difficulty === 'easy'
      );
      if (beginnerQuests.length > 0) {
        return beginnerQuests[Math.floor(Math.random() * beginnerQuests.length)];
      }
    }
    
    // Otherwise return a random available quest
    return availableQuests[Math.floor(Math.random() * availableQuests.length)];
  };

  // Handle accepting a quest from SmartMissionModal
  const handleAcceptQuest = async (quest) => {
    try {
      trackEvent('quest_accepted', { questId: quest.id, source: 'smart_mission' });
      console.log('✅ Quest accepted:', quest.title);
      
      // Close SmartMission and open QuestDetails
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
      console.log('🎯 Quest completed:', modifiedQuest);
      
      // 1. Create savings event in Firebase if there's monetary value
      if (modifiedQuest.monetaryValue && modifiedQuest.monetaryValue > 0) {
        console.log('💰 Creating savings event...');
        
        // Calculate annual savings
        const annualSavings = modifiedQuest.monetaryValue * 12;
        
        // OPTIMISTIC UPDATE: Add to local impact immediately
        setLocalImpactBoost(prev => prev + annualSavings);
        console.log('⚡ Optimistic update: +€' + annualSavings.toFixed(2));
        
        const savingsEvent = await createSavingsEventInFirestore(user.uid, {
          title: modifiedQuest.title,
          questId: modifiedQuest.id,
          amount: modifiedQuest.monetaryValue,
          period: 'month', // Default to monthly for subscriptions
          source: 'quest',
          proof: {
            type: 'note',
            note: `Completed via SmartMission flow - ${new Date().toLocaleDateString()}`
          }
        });
        
        console.log('✅ Savings event created:', savingsEvent.id);
        
        // Show detailed success with savings
        toast.success(
          `🎉 ${modifiedQuest.title} completed!\n💰 +€${annualSavings.toFixed(2)}/year\n⚡ +${modifiedQuest.xpReward} XP`,
          { autoClose: 5000 }
        );
      } else {
        // No monetary value, just show XP
        toast.success(`🎉 ${modifiedQuest.title} completed! +${modifiedQuest.xpReward} XP`);
      }
      
      // 2. Track analytics
      trackEvent('quest_completed', { 
        questId: modifiedQuest.id, 
        monetaryValue: modifiedQuest.monetaryValue,
        xpReward: modifiedQuest.xpReward,
        source: 'smart_mission_flow'
      });
      
      // 3. Close modal
      setShowQuestDetails(false);
      setSelectedQuest(null);
      
      // 4. Force impact recalculation to update dashboard immediately
      console.log('🔄 Forcing impact recalculation...');
      setTimeout(async () => {
        try {
          if (manualRecalculate) {
            await manualRecalculate();
            console.log('✅ Impact updated on dashboard');
          }
        } catch (err) {
          console.warn('⚠️ Manual recalculation failed, impact will update on next load');
        }
      }, 500); // Small delay to ensure Firebase write is complete
      
    } catch (error) {
      console.error("❌ Error completing quest:", error);
      toast.error(t('errors.complete_quest_failed') || 'Failed to save quest completion');
    }
  };

  // Handle rerolling quest recommendation
  const handleRerollQuest = () => {
    // For reroll: Include active quests but exclude completed and current quest
    const availableQuests = (quests || []).filter(
      q => !completedQuestIds.includes(q.id) &&
           q.id !== recommendedQuest?.id // Exclude current quest
    );
    
    if (availableQuests.length === 0) {
      toast.info('No other quests available');
      return recommendedQuest; // Return current if no other options
    }
    
    const newRecommendation = availableQuests[Math.floor(Math.random() * availableQuests.length)];
    setRecommendedQuest(newRecommendation);
    return newRecommendation;
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
    navigate(`/quests/${questId}`);
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
        <DashboardScoreboard
          impactAnnual={(impactAnnualEstimated || 0) + localImpactBoost}
          currency={userData?.currency || '€'}
          onStartQuest={handleStartQuest}
          isLoading={isGenerating}
        />

        {/* 2.5 Daily Challenge (if exists) */}
        {dailyChallenge && dailyChallenge.status !== 'completed' && (
          <DashboardDailyChallenge
            challenge={dailyChallenge}
            onStart={handleStartDailyChallenge}
            isLoading={isGenerating}
          />
        )}

        {/* 3. Bento Stats (Badges & Log) */}
        <DashboardBentoStats
          badges={badges}
          recentImpact={recentImpact}
        />

        {/* 4. Quests View (Active & Archive) */}
        <DashboardQuestsView
          activeQuests={activeQuests}
          completedQuests={completedQuests}
          onComplete={handleCompleteQuest}
          onStartQuest={handleStartQuest}
          onNavigate={handleNavigateToQuest}
          isLoading={isGenerating}
        />

      </div>

      <BottomNav />

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

export default Dashboard;