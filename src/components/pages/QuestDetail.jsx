import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaCheckCircle, FaTrophy, FaCoins, 
  FaClock, FaLock, FaShareAlt, FaChevronRight,
  FaStar, FaFire, FaChartLine
} from 'react-icons/fa';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../LoadingSpinner';
import ProgressBar from '../../components/common/ProgressBar';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';
import { getQuestById } from '../../data/questTemplates';

// Import quest step components
import QuizStep from '../../components/features/QuizStep';
import ChecklistStep from '../../components/features/ChecklistStep';
import ChallengeStep from '../../components/features/ChallengeStep';

const QuestDetail = () => {
  const { id: questId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  // State management
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [userProgress, setUserProgress] = useState(null);
  const [stepAnswers, setStepAnswers] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [animatingProgress, setAnimatingProgress] = useState(false);

  // Initialize quest data
  useEffect(() => {
    if (user && questId) {
      initializeQuest();
    } else if (!user) {
      navigate('/login');
    }
  }, [user, questId, language]);

  const initializeQuest = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchQuestData(),
        checkPremiumStatus()
      ]);
    } catch (error) {
      console.error('Error initializing quest:', error);
      toast.error(t('errors.generic') || 'Something went wrong');
      navigate('/quests');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestData = async () => {
    try {
      // Try Firestore first
      const questRef = doc(db, 'quests', questId);
      const questSnap = await getDoc(questRef);
      
      let questData;
      if (questSnap.exists()) {
        questData = { id: questSnap.id, ...questSnap.data() };
      } else {
        // Fallback to local templates
        questData = getQuestById(questId, language);
        if (!questData) {
          throw new Error('Quest not found');
        }
        toast.info(t('quests.usingLocalData') || 'Using offline data');
      }
      
      // Localize quest content
      const localizedQuest = localizeQuestData(questData);
      setQuest(localizedQuest);
      
      // Load or create user progress
      await loadUserProgress();
    } catch (error) {
      console.error('Error fetching quest:', error);
      throw error;
    }
  };

  const localizeQuestData = (questData) => {
    return {
      ...questData,
      title: questData[`title_${language}`] || questData.title_en || questData.title,
      description: questData[`description_${language}`] || questData.description_en || questData.description,
      objectives: questData[`objectives_${language}`] || questData.objectives_en || questData.objectives || [],
      tips: questData[`tips_${language}`] || questData.tips_en || questData.tips || [],
      steps: (questData.steps || []).map(step => ({
        ...step,
        type: step.type || 'quiz',
        title: step[`title_${language}`] || step.title_en || step.title,
        content: step[`content_${language}`] || step.content_en || step.content,
        question: step[`question_${language}`] || step.question_en || step.question,
        instruction: step[`instruction_${language}`] || step.instruction_en || step.instruction,
        hint: step[`hint_${language}`] || step.hint_en || step.hint,
        explanation: step[`explanation_${language}`] || step.explanation_en || step.explanation,
        solution: step[`solution_${language}`] || step.solution_en || step.solution,
        placeholder: step[`placeholder_${language}`] || step.placeholder_en || step.placeholder,
        inputLabel: step[`inputLabel_${language}`] || step.inputLabel_en || step.inputLabel,
        correctAnswer: step.correctAnswer ?? 0,
        requiredCount: step.requiredCount || 0,
        maxLength: step.maxLength || 500,
        inputRows: step.inputRows || 4,
        options: localizeOptions(step.options || []),
        tasks: localizeTasks(step.tasks || [])
      }))
    };
  };

  const localizeOptions = (options) => {
    return options.map(opt => {
      if (typeof opt === 'string') return opt;
      return opt[language] || opt.en || opt;
    });
  };

  const localizeTasks = (tasks) => {
    return tasks.map(task => {
      if (typeof task === 'string') return task;
      return {
        text: task[`text_${language}`] || task.text_en || task.text || task[language] || task.en || task,
        tip: task[`tip_${language}`] || task.tip_en || task.tip
      };
    });
  };

  const loadUserProgress = async () => {
    try {
      const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        const progress = progressSnap.data();
        setUserProgress(progress);
        setCurrentStep(progress.currentStep || 0);
        setStepAnswers(progress.stepAnswers || {});
        setQuestCompleted(progress.status === 'completed');
      } else {
        // Create initial progress
        const initialProgress = {
          userId: user.uid,
          questId: questId,
          status: 'active',
          currentStep: 0,
          progress: 0,
          startedAt: new Date().toISOString(),
          stepAnswers: {}
        };
        await setDoc(progressRef, initialProgress);
        setUserProgress(initialProgress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      // Continue without saved progress
      setUserProgress({
        currentStep: 0,
        progress: 0,
        stepAnswers: {}
      });
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setIsPremium(userSnap.data().isPremium || false);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const handleStepComplete = async (stepData) => {
    try {
      setAnimatingProgress(true);
      
      const newStepAnswers = {
        ...stepAnswers,
        [currentStep]: stepData
      };
      setStepAnswers(newStepAnswers);

      const newProgress = ((currentStep + 1) / quest.steps.length) * 100;
      
      // Update Firebase
      const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
      await updateDoc(progressRef, {
        currentStep: currentStep + 1,
        progress: newProgress,
        stepAnswers: newStepAnswers,
        lastUpdated: new Date().toISOString()
      });

      // Check if quest is complete
      if (currentStep + 1 >= quest.steps.length) {
        setTimeout(() => completeQuest(), 500);
      } else {
        // Move to next step
        setTimeout(() => {
          setCurrentStep(currentStep + 1);
          setAnimatingProgress(false);
          toast.success(
            t('quest_detail.step_completed') || 'Step completed!',
            { icon: '✨' }
          );
        }, 500);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      setAnimatingProgress(false);
      toast.error(t('errors.save_progress_failed') || 'Failed to save progress');
    }
  };

  const completeQuest = async () => {
    try {
      setShowConfetti(true);
      setQuestCompleted(true);

      const pointsEarned = quest.points || 100;
      const bonusPoints = calculateBonus();
      const totalPoints = pointsEarned + bonusPoints;
      
      // Update quest progress
      const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
      await updateDoc(progressRef, {
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString(),
        pointsEarned: totalPoints
      });

      // Update user stats
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        points: increment(totalPoints),
        questsCompleted: increment(1),
        lastCompletedQuest: new Date().toISOString(),
        [`categoryProgress.${quest.category}`]: increment(1)
      });

      // Check for achievements
      await checkAchievements(userRef);

      // Show completion message
      toast.success(
        t('quest_detail.quest_complete_msg', { points: totalPoints }) || 
        `Quest complete! You earned ${totalPoints} points!`,
        { 
          duration: 5000,
          icon: '🎉'
        }
      );

      // Stop confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (error) {
      console.error('Error completing quest:', error);
      toast.error(t('errors.complete_quest_failed') || 'Failed to complete quest');
    }
  };

  const calculateBonus = () => {
    let bonus = 0;
    // Perfect score bonus
    const perfectScore = Object.values(stepAnswers).every(answer => 
      answer.correct === true || answer.type === 'challenge' || answer.type === 'checklist'
    );
    if (perfectScore) bonus += 50;
    
    // Speed bonus (if completed in under 10 minutes)
    const startTime = new Date(userProgress.startedAt);
    const duration = (new Date() - startTime) / 1000 / 60; // minutes
    if (duration < 10) bonus += 25;
    
    return bonus;
  };

  const checkAchievements = async (userRef) => {
    try {
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      
      // Check for level up
      const oldLevel = Math.floor((userData.points - quest.points) / 1000);
      const newLevel = Math.floor(userData.points / 1000);
      
      if (newLevel > oldLevel) {
        toast.success(
          t('notifications.level_up', { level: newLevel + 1 }) || 
          `Level up! You're now level ${newLevel + 1}!`,
          { 
            duration: 5000,
            icon: '🌟'
          }
        );
      }

      // Check for streaks
      if (userData.lastCompletedQuest) {
        const lastCompleted = new Date(userData.lastCompletedQuest);
        const daysSince = (new Date() - lastCompleted) / 1000 / 60 / 60 / 24;
        if (daysSince <= 1) {
          await updateDoc(userRef, {
            currentStreak: increment(1)
          });
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const handleShare = () => {
    const shareText = t('share.quest_complete', { 
      quest: quest.title,
      points: quest.points
    }) || `I just completed "${quest.title}" on FinanceQuest and earned ${quest.points} points! 🎯`;
    
    if (navigator.share) {
      navigator.share({
        title: 'FinanceQuest Achievement',
        text: shareText,
        url: window.location.origin
      }).catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
          copyToClipboard(shareText);
        }
      });
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(t('ui.copied') || 'Copied to clipboard!', { icon: '📋' });
  };

  const renderStepComponent = () => {
    const step = quest.steps[currentStep];
    const commonProps = {
      step: step,
      onComplete: handleStepComplete,
      language: language
    };

    switch (step.type) {
      case 'quiz':
        return <QuizStep {...commonProps} />;
      case 'checklist':
        return <ChecklistStep {...commonProps} />;
      case 'challenge':
        return <ChallengeStep {...commonProps} />;
      default:
        return <QuizStep {...commonProps} />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" color="yellow" />
          <p className="mt-4 text-gray-400">{t('ui.loading') || 'Loading quest...'}</p>
        </div>
      </div>
    );
  }

  // Quest not found
  if (!quest) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t('errors.quest_not_found') || 'Quest not found'}
            </h2>
            <button
              onClick={() => navigate('/quests')}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors font-bold"
            >
              {t('quest_detail.back_to_quests') || 'Back to Quests'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Premium quest locked
  if (quest.isPremium && !isPremium) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center animate-fadeIn">
            <div className="mb-6">
              <FaLock className="text-6xl text-purple-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">
                {t('premium.quest_locked') || 'Premium Quest'}
              </h2>
              <p className="text-gray-400 text-lg">
                {t('premium.quest_locked_desc') || 'Unlock this quest and many more with Premium!'}
              </p>
            </div>
            
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-purple-300 mb-3">
                {t('premium.benefits_title') || 'Premium Benefits:'}
              </h3>
              <ul className="text-left text-gray-300 space-y-2">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-purple-400" />
                  {t('premium.benefit_1') || 'Access to all premium quests'}
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-purple-400" />
                  {t('premium.benefit_2') || 'Exclusive badges and rewards'}
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-purple-400" />
                  {t('premium.benefit_3') || 'Advanced progress tracking'}
                </li>
              </ul>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/quests')}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                {t('ui.back') || 'Go Back'}
              </button>
              <button
                onClick={() => navigate('/premium')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
              >
                {t('premium.upgrade_now') || 'Upgrade to Premium'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = quest.steps.length > 0 ? (currentStep / quest.steps.length) * 100 : 0;
  const currentStepData = quest.steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} gravity={0.3} />}
      
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => navigate('/quests')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          {t('quest_detail.back_to_quests') || 'Back to Quests'}
        </button>

        {/* Quest header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{quest.title}</h1>
                {quest.isPremium && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-gray-600">{quest.description}</p>
              
              {/* Quest objectives */}
              {quest.objectives && quest.objectives.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    {t('quest_detail.objectives') || 'Learning Objectives:'}
                  </h3>
                  <ul className="space-y-1">
                    {quest.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <FaStar className="text-yellow-400 mt-0.5 text-xs" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Quest stats */}
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <FaCoins className="text-2xl text-yellow-500 mx-auto mb-1" />
                <p className="text-sm font-semibold text-gray-800">{quest.points}</p>
                <p className="text-xs text-gray-600">{t('ui.points') || 'points'}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <FaClock className="text-2xl text-blue-500 mx-auto mb-1" />
                <p className="text-sm font-semibold text-gray-800">~{quest.duration || 15}</p>
                <p className="text-xs text-gray-600">{t('ui.minutes') || 'min'}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <FaChartLine className="text-2xl text-green-500 mx-auto mb-1" />
                <p className="text-sm font-semibold text-gray-800 capitalize">{quest.difficulty || 'Easy'}</p>
                <p className="text-xs text-gray-600">{t('quest_detail.difficulty') || 'Level'}</p>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{t('quest_detail.progress') || 'Progress'}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <ProgressBar 
              progress={progress} 
              showPercentage={false} 
              color="gradient"
              animated={animatingProgress}
              className="h-3"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('quest_detail.steps.step', { 
                current: currentStep + (questCompleted ? 0 : 1), 
                total: quest.steps.length 
              }) || `Step ${currentStep + (questCompleted ? 0 : 1)} of ${quest.steps.length}`}</span>
              {userProgress?.currentStreak > 0 && (
                <span className="flex items-center gap-1">
                  <FaFire className="text-orange-500" />
                  {userProgress.currentStreak} {t('ui.day_streak') || 'day streak'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quest content */}
        {!questCompleted ? (
          <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentStepData.title || t('quest_detail.step_title', { step: currentStep + 1 }) || `Step ${currentStep + 1}`}
                </h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {currentStepData.type ? currentStepData.type.charAt(0).toUpperCase() + currentStepData.type.slice(1) : 'Quiz'}
                </span>
              </div>
            </div>

            <div className={animatingProgress ? 'opacity-50 pointer-events-none' : ''}>
              {renderStepComponent()}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center animate-scaleUp">
            <FaTrophy className="text-7xl text-yellow-500 mx-auto mb-4 animate-bounce-once" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {t('quest_detail.congratulations') || 'Congratulations!'}
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              {t('quest_detail.quest_completed_msg') || 'You\'ve mastered this quest!'}
            </p>
            
            {/* Rewards summary */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                {t('quest_detail.rewards_earned') || 'Rewards Earned:'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <FaCoins className="text-3xl text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{quest.points}</p>
                  <p className="text-sm text-gray-600">{t('ui.points') || 'Points'}</p>
                </div>
                {calculateBonus() > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <FaStar className="text-3xl text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">+{calculateBonus()}</p>
                    <p className="text-sm text-gray-600">{t('quest_detail.bonus') || 'Bonus'}</p>
                  </div>
                )}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <FaFire className="text-3xl text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{userProgress?.currentStreak || 1}</p>
                  <p className="text-sm text-gray-600">{t('ui.day_streak') || 'Day Streak'}</p>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 justify-center transform hover:scale-105"
              >
                <FaShareAlt />
                {t('quest_detail.share_achievement') || 'Share Achievement'}
              </button>
              <button
                onClick={() => navigate('/quests')}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all flex items-center gap-2 justify-center transform hover:scale-105 font-semibold shadow-lg"
              >
                {t('quest_detail.next_quest') || 'Find Next Quest'}
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestDetail;