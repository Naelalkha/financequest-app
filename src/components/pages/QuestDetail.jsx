import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaFire, FaTrophy, FaStar, FaClock, FaChartLine, FaLock, FaCheckCircle, FaCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Confetti from 'react-confetti';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getQuestById } from '../../data/questTemplates';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { logQuestEvent } from '../../utils/analytics';
import ProgressBar from '../common/ProgressBar';
import LoadingSpinner from '../common/LoadingSpinner';

const QuestDetail = () => {
  const { id: questId } = useParams();
  const navigate = useNavigate();
  const { t, currentLang } = useLanguage();
  const { user } = useAuth();
  
  // State
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepAnswers, setStepAnswers] = useState({});
  const [userProgress, setUserProgress] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [animatingProgress, setAnimatingProgress] = useState(false);

  // Load quest data
  useEffect(() => {
    const loadQuest = async () => {
      try {
        setLoading(true);
        
        // Get quest from templates
        const questData = getQuestById(questId, currentLang);
        
        if (!questData) {
          toast.error(t('errors.quest_not_found') || 'Quest not found');
          navigate('/quests');
          return;
        }

        // Ensure quest has steps
        if (!questData.steps || questData.steps.length === 0) {
          console.error('Quest has no steps:', questId);
          toast.error('Quest data is incomplete');
          navigate('/quests');
          return;
        }

        setQuest(questData);
        
        if (user) {
          await loadUserProgress();
          await checkPremiumStatus();
        }
        
        logQuestEvent('quest_view', { questId });
      } catch (error) {
        console.error('Error loading quest:', error);
        toast.error(t('errors.quest_load_failed') || 'Failed to load quest');
      } finally {
        setLoading(false);
      }
    };

    loadQuest();
  }, [questId, currentLang, user, navigate, t]);

  const loadUserProgress = async () => {
    if (!user) return;
    
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
      
      logQuestEvent('step_complete', {
        questId,
        stepIndex: currentStep,
        progress: newProgress
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error(t('errors.save_progress_failed') || 'Failed to save progress');
      setAnimatingProgress(false);
    }
  };

  const completeQuest = async () => {
    try {
      setShowConfetti(true);
      setQuestCompleted(true);
      
      // Update quest status
      const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
      await updateDoc(progressRef, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        progress: 100
      });

      // Update user stats
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
            const newXP = (userData.xp || 0) + quest.xp;
        const completedQuests = (userData.completedQuests || 0) + 1;
        
        await updateDoc(userRef, {
          xp: newXP,
          completedQuests: completedQuests,
          lastActivityAt: new Date().toISOString()
        });
      }
      
      toast.success(
        t('quest_detail.quest_completed') || 'Quest completed!',
        { icon: '🏆' }
      );
      
      logQuestEvent('quest_complete', {
        questId,
        xp: quest.xp
      });
    } catch (error) {
      console.error('Error completing quest:', error);
      toast.error(t('errors.complete_quest_failed') || 'Failed to complete quest');
    }
  };

  // Check premium access
  if (!loading && quest?.isPremium && !isPremium && user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center max-w-md">
          <FaLock className="text-5xl text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            {t('premium.quest_locked') || 'Premium Quest'}
          </h2>
          <p className="text-gray-400 mb-6">
            {t('premium.unlock_quest') || 'Unlock this quest with FinanceQuest Premium'}
          </p>
          <Link
            to="/premium"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-bold hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            {t('dashboard.upgrade_now') || 'Upgrade Now'}
          </Link>
          <button
            onClick={() => navigate('/quests')}
            className="mt-4 text-gray-400 hover:text-white transition-colors block mx-auto"
          >
            {t('quest_detail.back_to_quests') || 'Back to Quests'}
          </button>
        </div>
      </div>
    );
  }

  if (loading || !quest) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const progress = quest.steps && quest.steps.length > 0 
    ? (currentStep / quest.steps.length) * 100 
    : 0;
  const currentStepData = quest.steps[currentStep] || {};

  return (
    <div className="min-h-screen bg-gray-900">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} gravity={0.3} />}
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => navigate('/quests')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          {t('quest_detail.back_to_quests') || 'Back to Quests'}
        </button>

        {/* Quest header */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{quest.title}</h1>
                {quest.isPremium && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full font-medium border border-purple-500/30">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-gray-400">{quest.description}</p>
              
              {/* Quest objectives */}
              {quest.objectives && quest.objectives.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">
                    {t('quest_detail.objectives') || 'Learning Objectives:'}
                  </h3>
                  <ul className="space-y-1">
                    {quest.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
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
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <FaStar className="text-2xl text-blue-400 mx-auto mb-1" />
                <p className="text-sm font-semibold text-white">{quest.xp}</p>
                <p className="text-xs text-gray-400">{t('ui.xp') || 'XP'}</p>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <FaClock className="text-2xl text-blue-400 mx-auto mb-1" />
                <p className="text-sm font-semibold text-white">~{quest.duration || 15}</p>
                <p className="text-xs text-gray-400">{t('ui.minutes') || 'min'}</p>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <FaChartLine className="text-2xl text-green-400 mx-auto mb-1" />
                <p className="text-sm font-semibold text-white capitalize">{quest.difficulty || 'Easy'}</p>
                <p className="text-xs text-gray-400">{t('quest_detail.difficulty') || 'Level'}</p>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{t('quest_detail.progress') || 'Progress'}</span>
              <span className="font-medium text-white">{Math.round(progress)}%</span>
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
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-fadeIn">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {currentStepData.title || t('quest_detail.step_title', { step: currentStep + 1 }) || `Step ${currentStep + 1}`}
                </h2>
                <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
                  {currentStepData.type ? currentStepData.type.charAt(0).toUpperCase() + currentStepData.type.slice(1) : 'Quiz'}
                </span>
              </div>
            </div>

            <div className={animatingProgress ? 'opacity-0 transition-opacity' : 'opacity-100 transition-opacity'}>
              <StepRenderer
                step={currentStepData}
                onComplete={handleStepComplete}
                previousAnswer={stepAnswers[currentStep]}
                t={t}
                currentLang={currentLang}
              />
            </div>
          </div>
        ) : (
          // Quest complete screen
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center animate-fadeIn">
            <div className="mb-6">
              <div className="relative inline-block">
                <FaTrophy className="text-6xl text-yellow-400 animate-bounce" />
                <div className="absolute -top-2 -right-2">
                  <span className="flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-yellow-500"></span>
                  </span>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              {t('quest_detail.congratulations') || 'Congratulations!'}
            </h2>
            <p className="text-xl text-gray-400 mb-6">
              {t('quest_detail.quest_complete_msg') || "You've mastered this quest!"}
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
              <div className="bg-gray-700 rounded-lg px-6 py-3">
                <p className="text-sm text-gray-400">{t('ui.xp_earned') || 'XP Earned'}</p>
                <p className="text-2xl font-bold text-blue-400">+{quest.xp}</p>
              </div>
              {quest.xp && (
                <div className="bg-gray-700 rounded-lg px-6 py-3">
                  <p className="text-sm text-gray-400">{t('ui.xp_earned') || 'XP Earned'}</p>
                  <p className="text-2xl font-bold text-blue-400">+{quest.xp}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const shareText = t('share.quest_complete', {
                    quest: quest.title,
                    points: quest.points
                  }) || `I just completed "${quest.title}" on FinanceQuest and earned ${quest.points} points! 🎯`;
                  
                  if (navigator.share) {
                    navigator.share({
                      title: 'FinanceQuest Achievement',
                      text: shareText,
                      url: window.location.origin
                    });
                  } else {
                    navigator.clipboard.writeText(shareText);
                    toast.success(t('ui.copied') || 'Copied to clipboard!');
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {t('ui.share_achievement') || 'Share Achievement'}
              </button>
              <Link
                to="/quests"
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                {t('ui.back_to_quests') || 'Back to Quests'}
              </Link>
            </div>
          </div>
        )}

        {/* Step indicators */}
        {!questCompleted && quest.steps && quest.steps.length > 1 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            {quest.steps.map((_, index) => (
              <div
                key={index}
                className={`transition-all duration-300 ${
                  index < currentStep 
                    ? 'text-green-400' 
                    : index === currentStep 
                    ? 'text-yellow-400 scale-125' 
                    : 'text-gray-600'
                }`}
              >
                {index < currentStep ? (
                  <FaCheckCircle className="text-sm" />
                ) : (
                  <FaCircle className="text-sm" />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Step renderer component
const StepRenderer = ({ step, onComplete, previousAnswer, t, currentLang }) => {
  const [answer, setAnswer] = useState(previousAnswer !== undefined ? previousAnswer : '');
  const [selectedOptions, setSelectedOptions] = useState(previousAnswer?.selectedOptions || []);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleQuizSubmit = () => {
    // Handle both string and localized answer formats
    let correctAnswer = step.correctAnswer;
    
    // If correctAnswer is localized (e.g., for multiple_choice)
    if (step.correctAnswer_en || step.correctAnswer_fr) {
      const lang = currentLang || 'en';
      correctAnswer = step[`correctAnswer_${lang}`] || step.correctAnswer_en || step.correctAnswer;
    }
    
    // Convert to string and compare
    const isCorrect = answer.toLowerCase() === String(correctAnswer).toLowerCase();
    setIsCorrect(isCorrect);
    setShowFeedback(true);
    
    setTimeout(() => {
      onComplete({ answer, correct: isCorrect });
    }, isCorrect ? 1500 : 2500);
  };

  const handleMultipleChoiceSubmit = () => {
    // correctAnswer is an index (0, 1, 2, etc.)
    const isCorrect = answer === step.correctAnswer;
    setIsCorrect(isCorrect);
    setShowFeedback(true);
    
    setTimeout(() => {
      onComplete({ answer, correct: isCorrect });
    }, isCorrect ? 1500 : 2500);
  };

  const handleChecklistComplete = () => {
    const tasks = step.tasks || step.items || [];
    const allChecked = selectedOptions.length === tasks.length;
    if (allChecked) {
      onComplete({ selectedOptions, completed: true });
    } else {
      toast.warning(t('quest_detail.complete_tasks_first') || 'Please complete all tasks first');
    }
  };

  // Render based on step type
  switch (step.type) {
    case 'info':
      return (
        <div>
          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-gray-300 whitespace-pre-wrap">{step.content}</p>
          </div>
          <button
            onClick={() => onComplete({ read: true })}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            {t('ui.continue') || 'Continue'}
          </button>
        </div>
      );

    case 'quiz':
      return (
        <div>
          <div className="mb-6">
            <p className="text-lg text-gray-300 mb-4">{step.question}</p>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t('quest_detail.enter_answer') || 'Enter your answer...'}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && handleQuizSubmit()}
            />
          </div>
          
          {showFeedback && (
            <div className={`mb-4 p-4 rounded-lg animate-fadeIn ${
              isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
            }`}>
              <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect 
                  ? t('quest_detail.correct') || 'Correct! Well done!' 
                  : t('quest_detail.incorrect') || 'Not quite right.'}
              </p>
              {!isCorrect && step.hint && (
                <p className="text-gray-400 text-sm mt-2">
                  {t('ui.hint') || 'Hint'}: {step.hint}
                </p>
              )}
            </div>
          )}
          
          <button
            onClick={handleQuizSubmit}
            disabled={!answer || showFeedback}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {t('ui.submit') || 'Submit'}
          </button>
        </div>
      );

    case 'multiple_choice':
      return (
        <div>
          <p className="text-lg text-gray-300 mb-4">{step.question}</p>
          <div className="space-y-3 mb-6">
            {step.options?.map((option, index) => {
              // Handle localized options
              const optionText = typeof option === 'object' 
                ? (option[currentLang] || option.en || option.fr || option)
                : option;
                
              return (
                <label
                  key={index}
                  className={`block p-4 bg-gray-700 border rounded-lg cursor-pointer transition-all ${
                    answer === index 
                      ? 'border-yellow-400 bg-gray-600' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    value={index}
                    checked={answer === index}
                    onChange={(e) => setAnswer(parseInt(e.target.value))}
                    className="sr-only"
                  />
                  <span className="text-white">{optionText}</span>
                </label>
              );
            })}
          </div>
          
          {showFeedback && (
            <div className={`mb-4 p-4 rounded-lg animate-fadeIn ${
              isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
            }`}>
              <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect 
                  ? t('quest_detail.correct') || 'Correct! Well done!' 
                  : t('quest_detail.incorrect') || 'Not quite right.'}
              </p>
              {!isCorrect && step.hint && (
                <p className="text-gray-400 text-sm mt-2">
                  {t('ui.hint') || 'Hint'}: {step.hint}
                </p>
              )}
            </div>
          )}
          
          <button
            onClick={handleMultipleChoiceSubmit}
            disabled={answer === null || answer === '' || showFeedback}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {t('ui.submit') || 'Submit'}
          </button>
        </div>
      );

    case 'checklist':
      const tasks = step.tasks || step.items || [];
      const localizedTasks = tasks.map(task => {
        if (typeof task === 'string') return task;
        if (typeof task === 'object') {
          return task[currentLang] || task.en || task.fr || task.text || task;
        }
        return String(task);
      });
      
      return (
        <div>
          <p className="text-lg text-gray-300 mb-4">
            {step.description || step.instruction || step.content}
          </p>
          <div className="space-y-3 mb-6">
            {localizedTasks.map((item, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(index)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOptions([...selectedOptions, index]);
                    } else {
                      setSelectedOptions(selectedOptions.filter(opt => opt !== index));
                    }
                  }}
                  className="w-5 h-5 text-yellow-400 bg-gray-600 border-gray-500 rounded focus:ring-yellow-400 focus:ring-2"
                />
                <span className="text-white flex-1">{item}</span>
              </label>
            ))}
          </div>
          
          {selectedOptions.length === localizedTasks.length && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg animate-fadeIn">
              <p className="text-green-400 font-medium">
                {t('quest_detail.all_tasks_complete') || 'Great job! All tasks completed!'}
              </p>
            </div>
          )}
          
          <button
            onClick={handleChecklistComplete}
            disabled={selectedOptions.length !== localizedTasks.length}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {t('ui.complete') || 'Complete'}
          </button>
        </div>
      );

    case 'challenge':
      return (
        <div>
          <div className="mb-6">
            <p className="text-lg text-gray-300 mb-4">{step.description}</p>
            {step.example && (
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-2">
                  {t('quest_detail.example_solution') || 'Example:'}
                </p>
                <p className="text-white font-mono text-sm">{step.example}</p>
              </div>
            )}
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t('quest_detail.your_answer') || 'Your answer...'}
              rows={6}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
          
          {showFeedback && (
            <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg animate-fadeIn">
              <p className="text-blue-400 font-medium">
                {t('quest_detail.challenge_complete') || 'Challenge completed!'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {t('quest_detail.great_effort') || 'Great effort on tackling this challenge!'}
              </p>
            </div>
          )}
          
          <button
            onClick={() => {
              setShowFeedback(true);
              setTimeout(() => onComplete({ answer, completed: true }), 1500);
            }}
            disabled={!answer || showFeedback}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {t('ui.submit_challenge') || 'Submit Challenge'}
          </button>
        </div>
      );

    case 'interactive':
    case 'calculator':
    case 'calculation':
      return (
        <div>
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-3">
              {step.title || 'Interactive Exercise'}
            </h3>
            <p className="text-gray-300 mb-4">
              {step.instruction || step.content || 'Complete this interactive exercise'}
            </p>
            
            {/* Simple calculator simulation */}
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-yellow-400 text-lg mb-2">
                💡 {t('quest_detail.interactive_placeholder') || 'Interactive calculator would appear here'}
              </p>
              <p className="text-gray-400 text-sm">
                {t('quest_detail.interactive_instruction') || 'For now, imagine you\'ve calculated your budget using the 50/30/20 rule'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => onComplete({ completed: true, type: 'interactive' })}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            {t('ui.continue') || 'Continue'}
          </button>
        </div>
      );

    case 'reflection':
      return (
        <div>
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-3">
              {step.title || t('quest_detail.reflection_title') || 'Reflection Time'}
            </h3>
            <p className="text-gray-300 mb-4">
              {step.prompt || step.content || 'Take a moment to reflect on what you\'ve learned'}
            </p>
            
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t('quest_detail.reflection_placeholder') || 'Share your thoughts...'}
              rows={6}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
              minLength={step.minLength || 50}
            />
            
            <div className="mt-2 text-right">
              <span className="text-sm text-gray-400">
                {answer.length} / {step.minLength || 50} {t('ui.characters') || 'characters'}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => onComplete({ answer, completed: true, type: 'reflection' })}
            disabled={answer.length < (step.minLength || 50)}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {t('ui.submit') || 'Submit'}
          </button>
        </div>
      );

    default:
      return (
        <div className="text-center text-gray-400 p-8 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-lg mb-4">{t('errors.step_type_unknown') || 'Unknown step type'}: {step.type}</p>
          <p className="text-sm mb-6">Step ID: {step.id}</p>
          <button
            onClick={() => onComplete({ skipped: true })}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {t('ui.skip_step') || 'Skip this step'}
          </button>
        </div>
      );
  }
};

export default QuestDetail;