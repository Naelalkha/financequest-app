import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaCheckCircle, FaTrophy, FaCoins, 
  FaClock, FaLock, FaShareAlt, FaChevronRight 
} from 'react-icons/fa';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Header from '../Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProgressBar from '../../components/common/ProgressBar';
import Confetti from 'react-confetti';
import { toast } from 'react-hot-toast';
import { getQuestById } from '../../data/questTemplates'; // Import getQuestById for fallback

const QuestDetail = () => {
  const { questId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [userProgress, setUserProgress] = useState(null);
  const [stepAnswers, setStepAnswers] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(false);

  useEffect(() => {
    if (user && questId) {
      fetchQuestData();
      checkPremiumStatus();
    }
  }, [user, questId, language]);

  const fetchQuestData = async () => {
    try {
      setLoading(true);
      
      // Fetch quest data from Firestore
      const questRef = doc(db, 'quests', questId);
      const questSnap = await getDoc(questRef);
      
      let localizedQuest;
      if (questSnap.exists()) {
        const questData = questSnap.data();
        
        localizedQuest = {
          ...questData,
          title: questData[`title${language}`] || questData.titleEN || questData.title,
          description: questData[`description${language}`] || questData.descriptionEN || questData.description,
          objectives: questData[`objectives${language}`] || questData.objectivesEN || questData.objectives || [],
          steps: questData.steps?.map(step => ({
            ...step,
            title: step[`title${language}`] || step.titleEN || step.title,
            content: step[`content${language}`] || step.contentEN || step.content,
            question: step[`question${language}`] || step.questionEN || step.question,
            options: step.options?.map(opt => 
              typeof opt === 'string' ? opt : 
              opt[language] || opt.EN || opt
            ) || [],
            tasks: step.tasks?.map(task => 
              typeof task === 'string' ? task :
              task[language] || task.EN || task
            ) || []
          })) || []
        };
      } else {
        // Fallback to local templates
        localizedQuest = getQuestById(questId, language);
        if (!localizedQuest) {
          toast.error(t('errors.questLoadFailed'));
          navigate('/quests');
          return;
        }
        toast.info(t('quests.usingLocalData') || 'Using local quest data');
      }
      
      setQuest(localizedQuest);
      
      // Fetch user progress
      const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        const progress = progressSnap.data();
        setUserProgress(progress);
        setCurrentStep(progress.currentStep || 0);
        setStepAnswers(progress.stepAnswers || {});
        if (progress.status === 'completed') {
          setQuestCompleted(true);
        }
      } else {
        // Create initial progress
        const initialProgress = {
          userId: user.uid,
          questId: questId,
          status: 'active',
          currentStep: 0,
          progress: 0,
          startedAt: new Date(),
          stepAnswers: {}
        };
        await setDoc(progressRef, initialProgress);
        setUserProgress(initialProgress);
      }
    } catch (error) {
      console.error('Error fetching quest:', error);
      toast.error(t('errors.generic'));
      navigate('/quests');
    } finally {
      setLoading(false);
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
      const newStepAnswers = {
        ...stepAnswers,
        [currentStep]: stepData
      };
      setStepAnswers(newStepAnswers);

      const progress = ((currentStep + 1) / quest.steps.length) * 100;
      
      const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
      await updateDoc(progressRef, {
        currentStep: currentStep + 1,
        progress: progress,
        stepAnswers: newStepAnswers,
        lastUpdated: new Date()
      });

      if (currentStep + 1 >= quest.steps.length) {
        await completeQuest();
      } else {
        setCurrentStep(currentStep + 1);
        toast.success(t('questDetail.stepCompleted'));
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error(t('errors.generic'));
    }
  };

  const completeQuest = async () => {
    try {
      setShowConfetti(true);
      setQuestCompleted(true);

      const pointsEarned = quest.points || 100;
      
      const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
      await updateDoc(progressRef, {
        status: 'completed',
        progress: 100,
        completedAt: new Date()
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        totalPoints: increment(pointsEarned),
        questsCompleted: increment(1),
        lastCompletedQuest: new Date()
      });

      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const newTotalPoints = userData.totalPoints;
      const newLevel = Math.floor(newTotalPoints / 1000) + 1;
      
      if (newLevel > userData.level) {
        await updateDoc(userRef, {
          level: newLevel
        });
        toast.success(t('notifications.levelUp', { level: newLevel }));
      }

      toast.success(t('questDetail.earnedPoints', { points: pointsEarned }));
    } catch (error) {
      console.error('Error completing quest:', error);
      toast.error(t('errors.generic'));
    }
  };

  const handleShare = () => {
    const shareText = t('questDetail.shareText', { 
      quest: quest.title,
      app: t('app.name')
    });
    
    if (navigator.share) {
      navigator.share({
        title: t('app.name'),
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success(t('ui.copiedToClipboard'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!quest) {
    return null;
  }

  if (quest.isPremium && !isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FaLock className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t('premium.questLocked')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('premium.questLockedDesc')}
            </p>
            <button
              onClick={() => navigate('/premium')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold"
            >
              {t('premium.subscribe')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = quest.steps[currentStep];
  const progress = (currentStep / quest.steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate('/quests')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <FaArrowLeft />
          {t('questDetail.backToQuests')}
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{quest.title}</h1>
              <p className="text-gray-600">{quest.description}</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="text-center">
                <FaCoins className="text-2xl text-yellow-500 mx-auto" />
                <p className="text-sm text-gray-600 mt-1">{quest.points} {t('dashboard.points')}</p>
              </div>
              <div className="text-center">
                <FaClock className="text-2xl text-blue-500 mx-auto" />
                <p className="text-sm text-gray-600 mt-1">{t('quests.estimatedTime', { time: quest.estimatedTime || 15 })}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{t('questDetail.progress')}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgressBar progress={progress} />
          </div>
        </div>

        {!questCompleted ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {t('questDetail.step')} {currentStep + 1} / {quest.steps.length}
              </h2>
              {currentStepData.title && (
                <h3 className="text-lg text-gray-700">{currentStepData.title}</h3>
              )}
            </div>

            {currentStepData.type === 'quiz' && (
              <QuizStep
                step={currentStepData}
                onComplete={handleStepComplete}
                language={language}
              />
            )}
            
            {currentStepData.type === 'checklist' && (
              <ChecklistStep
                step={currentStepData}
                onComplete={handleStepComplete}
                language={language}
              />
            )}
            
            {currentStepData.type === 'challenge' && (
              <ChallengeStep
                step={currentStepData}
                onComplete={handleStepComplete}
                language={language}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FaTrophy className="text-6xl text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {t('questDetail.congratulations')}
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              {t('questDetail.questCompleted')}
            </p>
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <p className="text-lg font-semibold text-gray-800">
                {t('questDetail.earnedPoints', { points: quest.points || 100 })}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 justify-center"
              >
                <FaShareAlt />
                {t('questDetail.shareWin')}
              </button>
              <button
                onClick={() => navigate('/quests')}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-colors flex items-center gap-2 justify-center"
              >
                {t('questDetail.nextQuest')}
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