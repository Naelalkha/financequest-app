import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaClock, FaStar, FaTrophy, FaRocket, FaShare, FaBolt, FaLightbulb, FaRedo, FaEye, FaEyeSlash, FaMedal } from 'react-icons/fa';
import { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import quests from '../data/quests.json';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function QuestDetail({ t, currentLang }) {
  const { id } = useParams();
  const quest = quests.find(q => q.id === parseInt(id));
  const { user } = useAuth();
  
  const [answers, setAnswers] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [shuffledOptions, setShuffledOptions] = useState({});
  const [hints, setHints] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [showExplanations, setShowExplanations] = useState({});
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [levelUp, setLevelUp] = useState(null);

  // Level system with thresholds
  const levelThresholds = {
    0: 'Novice',      // 0-99 points
    100: 'Intermediate', // 100-299 points
    300: 'Expert',    // 300-599 points
    600: 'Master'     // 600+ points
  };

  // Badge definitions for quest completion
  const badgeDefinitions = {
    'FirstSteps': { requirement: 10, type: 'points', name: 'First Steps' },
    'BudgetMaster': { requirement: 100, type: 'points', name: 'Budget Master' },
    'SavingsPro': { requirement: 300, type: 'points', name: 'Savings Pro' },
    'InvestmentGuru': { requirement: 600, type: 'points', name: 'Investment Guru' },
    'Legendary': { requirement: 1000, type: 'points', name: 'Legendary' },
    'StreakWarrior': { requirement: 7, type: 'streak', name: 'Streak Warrior' },
    'Dedicated': { requirement: 30, type: 'streak', name: 'Dedicated' },
    'Perfectionist': { requirement: 1, type: 'perfect', name: 'Perfectionist' },
    'SpeedRunner': { requirement: 1, type: 'speed', name: 'Speed Runner' },
    'NightOwl': { requirement: 22, type: 'time', name: 'Night Owl' },
    'EarlyBird': { requirement: 6, type: 'time', name: 'Early Bird' }
  };

  // Timer for time tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Load saved progress from localStorage
  useEffect(() => {
    if (!quest) return;
    
    const savedProgress = localStorage.getItem(`quest-${id}-progress`);
    if (savedProgress) {
      try {
        const { answers: savedAnswers, hints: savedHints } = JSON.parse(savedProgress);
        setAnswers(savedAnswers || {});
        setHints(savedHints || {});
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
  }, [quest, id]);

  // Save progress to localStorage
  useEffect(() => {
    if (quest && !isCompleted) {
      localStorage.setItem(`quest-${id}-progress`, JSON.stringify({
        answers,
        hints,
        timestamp: Date.now()
      }));
    }
  }, [answers, hints, quest, id, isCompleted]);

  // Shuffle options for quiz steps
  useEffect(() => {
    if (!quest) return;
    
    const shuffled = {};
    quest.steps.forEach((step, index) => {
      if (step.type === 'quiz' && step.optionsEN) {
        const options = currentLang === 'fr' ? step.optionsFR : step.optionsEN;
        const shuffledIndexes = [...Array(options.length).keys()].sort(() => Math.random() - 0.5);
        shuffled[index] = {
          options: shuffledIndexes.map(i => options[i]),
          correctIndex: shuffledIndexes.indexOf(step.correct),
          originalCorrect: step.correct
        };
      }
    });
    setShuffledOptions(shuffled);
  }, [quest, currentLang]);

  // Get current level based on points
  const getCurrentLevel = (points) => {
    const thresholds = Object.keys(levelThresholds).map(Number).sort((a, b) => b - a);
    for (const threshold of thresholds) {
      if (points >= threshold) {
        return levelThresholds[threshold];
      }
    }
    return 'Novice';
  };

  // Calculate difficulty multiplier
  const getDifficultyMultiplier = () => {
    switch (quest?.difficulty) {
      case 'Easy': return 1;
      case 'Medium': return 1.2;
      case 'Hard': return 1.5;
      default: return 1;
    }
  };

  // Calculate time bonus
  const getTimeBonus = () => {
    const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
    const expectedDuration = quest?.duration || 10;
    
    if (elapsedMinutes <= expectedDuration * 0.7) {
      return 50; // Fast completion bonus
    } else if (elapsedMinutes <= expectedDuration) {
      return 20; // Normal completion bonus
    }
    return 0;
  };

  // Get premium multiplier
  const getPremiumMultiplier = () => {
    return user?.premium ? 1.5 : 1;
  };

  // Check for new badges based on points and achievements
  const checkForNewBadges = (newTotalPoints, questData) => {
    const newBadges = [];
    const currentBadges = user?.badges || [];
    const currentHour = new Date().getHours();
    
    // Points-based badges
    Object.keys(badgeDefinitions).forEach(badgeKey => {
      const badge = badgeDefinitions[badgeKey];
      if (!currentBadges.includes(badgeKey)) {
        switch (badge.type) {
          case 'points':
            if (newTotalPoints >= badge.requirement) {
              newBadges.push(badgeKey);
            }
            break;
          case 'streak':
            if (user?.streaks >= badge.requirement) {
              newBadges.push(badgeKey);
            }
            break;
          case 'perfect':
            // Perfect score (100% without hints)
            if (questData.isPerfect && Object.keys(hints).length === 0) {
              newBadges.push(badgeKey);
            }
            break;
          case 'speed':
            // Speed bonus earned
            if (questData.timeBonus >= 50) {
              newBadges.push(badgeKey);
            }
            break;
          case 'time':
            // Time-based badges (Night Owl, Early Bird)
            if (badgeKey === 'NightOwl' && currentHour >= badge.requirement) {
              newBadges.push(badgeKey);
            } else if (badgeKey === 'EarlyBird' && currentHour <= badge.requirement) {
              newBadges.push(badgeKey);
            }
            break;
          default:
            break;
        }
      }
    });
    
    return newBadges;
  };

  // Handle answer change with proper type checking
  const handleAnswer = (stepIndex, value) => {
    setAnswers(prev => ({ ...prev, [stepIndex]: value }));
    
    // Check if step is completed
    const step = quest.steps[stepIndex];
    let isStepComplete = false;
    
    switch (step.type) {
      case 'quiz':
        isStepComplete = value !== undefined && value !== null;
        break;
      case 'checklist':
        const items = currentLang === 'fr' ? step.itemsFR : step.itemsEN;
        isStepComplete = Array.isArray(value) && value.length === items.length;
        break;
      case 'challenge':
        isStepComplete = typeof value === 'string' && value.length > 10;
        break;
      default:
        break;
    }

    if (isStepComplete) {
      setCompletedSteps(prev => new Set([...prev, stepIndex]));
    } else {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(stepIndex);
        return newSet;
      });
    }
  };

  // Handle checkbox change properly
  const handleCheckboxChange = (stepIndex, itemIndex, checked) => {
    const currentChecked = answers[stepIndex] || [];
    const newChecked = checked 
      ? [...currentChecked, itemIndex]
      : currentChecked.filter(i => i !== itemIndex);
    
    handleAnswer(stepIndex, newChecked);
  };

  // Show hint for a step
  const showHint = (stepIndex) => {
    setHints(prev => ({ ...prev, [stepIndex]: true }));
    toast.info(`💡 ${t('hint')} ${t('revealed')}! (-10 ${t('points')})`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // Get hint text
  const getHint = (step, stepIndex) => {
    const hintTexts = {
      quiz: {
        en: "Think about the most logical and commonly accepted answer in finance.",
        fr: "Pensez à la réponse la plus logique et généralement acceptée en finance."
      },
      checklist: {
        en: "Make sure to complete all items on the list for full points.",
        fr: "Assurez-vous de compléter tous les éléments de la liste pour tous les points."
      },
      challenge: {
        en: "Provide a detailed response with specific examples and explanations.",
        fr: "Fournissez une réponse détaillée avec des exemples et explications spécifiques."
      }
    };
    
    return hintTexts[step.type]?.[currentLang] || hintTexts[step.type]?.en;
  };

  // Calculate current score
  const currentScore = useMemo(() => {
    let score = 0;
    let hintPenalty = 0;
    
    quest?.steps.forEach((step, index) => {
      if (!completedSteps.has(index)) return;
      
      // Add hint penalty
      if (hints[index]) {
        hintPenalty += 10;
      }
      
      switch (step.type) {
        case 'quiz':
          if (answers[index] === shuffledOptions[index]?.correctIndex) {
            score += 50;
          }
          break;
        case 'checklist':
          const items = currentLang === 'fr' ? step.itemsFR : step.itemsEN;
          const checkedItems = answers[index] || [];
          if (Array.isArray(checkedItems) && checkedItems.length === items.length) {
            score += 30;
          }
          break;
        case 'challenge':
          const text = answers[index] || '';
          if (typeof text === 'string' && text.length > 10) {
            score += 20;
          }
          break;
        default:
          break;
      }
    });
    
    const baseScore = score - hintPenalty;
    return Math.round(Math.max(0, baseScore) * getDifficultyMultiplier() * getPremiumMultiplier());
  }, [answers, completedSteps, shuffledOptions, currentLang, quest, user, hints]);

  // Get max possible score
  const getMaxPossibleScore = () => {
    if (!quest) return 0;
    
    let maxScore = 0;
    quest.steps.forEach(step => {
      switch (step.type) {
        case 'quiz': maxScore += 50; break;
        case 'checklist': maxScore += 30; break;
        case 'challenge': maxScore += 20; break;
        default: break;
      }
    });
    
    return Math.round(maxScore * getDifficultyMultiplier() * getPremiumMultiplier());
  };

  // Confetti animation
  const triggerConfetti = () => {
    const confettiCount = 50;
    const container = document.body;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.innerHTML = ['🎉', '🏆', '💰', '⭐', '🔥'][Math.floor(Math.random() * 5)];
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.fontSize = '24px';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`;
      
      container.appendChild(confetti);
      
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 5000);
    }
  };

  // Handle quest submission with gamification
  const handleSubmit = async () => {
    if (!user || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const baseScore = currentScore;
      const timeBonus = getTimeBonus();
      const totalScore = baseScore + timeBonus;
      const newTotalPoints = user.points + totalScore;
      const oldLevel = user.level || getCurrentLevel(user.points);
      const newLevel = getCurrentLevel(newTotalPoints);
      
      // Check if quest was completed perfectly
      const isPerfect = currentScore === getMaxPossibleScore() && Object.keys(hints).length === 0;
      
      // Quest completion data
      const questData = {
        score: totalScore,
        completedAt: new Date().toISOString(),
        timeBonus: timeBonus,
        hintsUsed: Object.keys(hints).length,
        timeSpent: timeSpent,
        isPerfect: isPerfect
      };

      // Check for new badges
      const newBadges = checkForNewBadges(newTotalPoints, questData);
      
      // Prepare Firestore updates
      const updates = {
        points: newTotalPoints,
        level: newLevel,
        [`completedQuests.${quest.id}`]: questData
      };

      // Add new badges to user's collection
      if (newBadges.length > 0) {
        updates.badges = [...(user.badges || []), ...newBadges];
        setUnlockedBadges(newBadges);
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), updates);
      
      // Clear saved progress
      localStorage.removeItem(`quest-${id}-progress`);
      
      // Trigger confetti
      triggerConfetti();
      
      // Show success toast with gamification elements
      toast.success(`🎉 ${t('questCompleted')} ${t('finalScore')}: ${totalScore} ${t('points')}!`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Show time bonus if applicable
      if (timeBonus > 0) {
        setTimeout(() => {
          toast.info(`⚡ ${t('speedBonus')}: +${timeBonus} ${t('points')}!`, {
            position: "top-center",
            autoClose: 3000,
          });
        }, 1000);
      }

      // Show level up notification
      if (newLevel !== oldLevel) {
        setLevelUp({ from: oldLevel, to: newLevel });
        setTimeout(() => {
          toast.success(`🚀 ${t('levelUp')} ${t(newLevel.toLowerCase())}!`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }, 2000);
      }

      // Show badge notifications with staggered timing
      newBadges.forEach((badge, index) => {
        setTimeout(() => {
          const badgeName = t(`badges.${badge}`) || badgeDefinitions[badge]?.name || badge;
          toast.success(`🏆 ${t('newBadgeUnlocked')}: ${badgeName}!`, {
            position: "top-center",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }, 3000 + (index * 1000));
      });

      // Show perfect score achievement
      if (isPerfect) {
        setTimeout(() => {
          toast.success(`⭐ ${t('perfect')}`, {
            position: "top-center",
            autoClose: 4000,
          });
        }, 4000);
      }

      setFinalScore(totalScore);
      setIsCompleted(true);
      
    } catch (error) {
      console.error('Error submitting quest:', error);
      toast.error('Failed to submit quest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Replay quest
  const replayQuest = () => {
    setAnswers({});
    setCompletedSteps(new Set());
    setIsCompleted(false);
    setFinalScore(0);
    setHints({});
    setShowExplanations({});
    setUnlockedBadges([]);
    setLevelUp(null);
    localStorage.removeItem(`quest-${id}-progress`);
    toast.info('Quest reset! Try to beat your previous score!');
  };

  // Share achievement
  const shareAchievement = () => {
    const badgeText = unlockedBadges.length > 0 ? ` and unlocked ${unlockedBadges.length} badge(s)` : '';
    const levelText = levelUp ? ` and leveled up to ${levelUp.to}` : '';
    const text = `🎉 Just completed "${quest.titleEN}" quest in FinanceQuest and scored ${finalScore} points${badgeText}${levelText}! 💰 #FinanceQuest #MoneySkills`;
    
    if (navigator.share) {
      navigator.share({
        title: 'FinanceQuest Achievement',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.info('Achievement copied to clipboard!');
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{t('questNotFound')}</h2>
          <Link to="/quests" className="text-yellow-400 hover:text-yellow-300">
            ← {t('backToQuests')}
          </Link>
        </div>
      </div>
    );
  }

  const title = currentLang === 'fr' ? quest.titleFR : quest.titleEN;
  const difficulty = currentLang === 'fr' ? quest.difficultyFR : quest.difficulty;
  const progressPercentage = (completedSteps.size / quest.steps.length) * 100;
  const allStepsCompleted = completedSteps.size === quest.steps.length;

  return (
    <div className="min-h-screen p-4">
      <ToastContainer />
      
      {/* Add confetti CSS */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            to="/quests" 
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <FaArrowLeft />
            {t('backToQuests')}
          </Link>
          
          {!isCompleted && (
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <FaClock />
                <span>{formatTime(timeSpent)} / {quest.duration}:00</span>
              </div>
              {Object.keys(hints).length > 0 && (
                <div className="text-orange-400">
                  💡 {Object.keys(hints).length} {t('hintsUsed')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quest Header */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <FaStar className={`${quest.difficulty === 'Easy' ? 'text-green-500' : quest.difficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`} />
                  <span className="text-gray-400">{t(difficulty.toLowerCase())}</span>
                </div>
                <div className="text-gray-400">
                  {quest.steps.length} {t('steps')}
                </div>
                {user?.premium && (
                  <div className="text-yellow-400 text-xs">
                    👑 {t('premium')} 1.5x multiplier
                  </div>
                )}
              </div>
            </div>
            
            {/* Current Score Display */}
            <div className="bg-gray-700 px-4 py-2 rounded-lg">
              <div className="text-center">
                <div className="text-yellow-400 text-2xl font-bold">{currentScore}</div>
                <div className="text-xs text-gray-400">
                  {t('points')} / {getMaxPossibleScore()}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{t('progression')}</span>
              <span>{completedSteps.size}/{quest.steps.length} {t('completed')}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quest Steps */}
        {!isCompleted ? (
          <div className="space-y-6">
            {quest.steps.map((step, index) => {
              const isStepCompleted = completedSteps.has(index);
              const hasHint = hints[index];
              
              return (
                <div 
                  key={index}
                  className={`bg-gray-800 p-6 rounded-lg border-2 transition-all duration-300 ${
                    isStepCompleted ? 'border-green-500' : 'border-gray-700'
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="bg-gray-700 text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      {t('step')} {index + 1}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      {/* Hint Button */}
                      {!hasHint && (
                        <button
                          onClick={() => showHint(index)}
                          className="text-orange-400 hover:text-orange-300 p-2 rounded-lg border border-orange-400 hover:border-orange-300 transition-colors"
                          title={t('getHint')}
                        >
                          <FaLightbulb />
                        </button>
                      )}
                      
                      {isStepCompleted && (
                        <FaCheckCircle className="text-green-500 text-xl animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Hint Display */}
                  {hasHint && (
                    <div className="bg-orange-900/30 border border-orange-500 p-3 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-orange-400 text-sm font-medium mb-1">
                        <FaLightbulb />
                        {t('hint')}
                      </div>
                      <p className="text-orange-200 text-sm">{getHint(step, index)}</p>
                    </div>
                  )}

                  {/* Step Content */}
                  {step.type === 'quiz' && (
                    <div>
                      <p className="text-white mb-4 text-lg">
                        {currentLang === 'fr' ? step.questionFR : step.questionEN}
                      </p>
                      <div className="space-y-3">
                        {shuffledOptions[index]?.options.map((option, optionIndex) => (
                          <label 
                            key={optionIndex}
                            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              answers[index] === optionIndex 
                                ? 'border-yellow-500 bg-yellow-900/20' 
                                : 'border-gray-600 hover:border-gray-500'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`quiz-${index}`}
                              value={optionIndex}
                              checked={answers[index] === optionIndex}
                              onChange={(e) => handleAnswer(index, parseInt(e.target.value))}
                              className="mr-3 text-yellow-500"
                            />
                            <span className="text-white">{option}</span>
                          </label>
                        ))}
                      </div>
                      
                      {/* Show explanation after answer */}
                      {answers[index] !== undefined && (
                        <div className="mt-4">
                          <button
                            onClick={() => setShowExplanations(prev => ({ ...prev, [index]: !prev[index] }))}
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {showExplanations[index] ? <FaEyeSlash /> : <FaEye />}
                            {t('explanation')}
                          </button>
                          
                          {showExplanations[index] && (
                            <div className={`mt-2 p-3 rounded-lg ${
                              answers[index] === shuffledOptions[index]?.correctIndex 
                                ? 'bg-green-900/30 border border-green-500' 
                                : 'bg-red-900/30 border border-red-500'
                            }`}>
                              <p className={`text-sm ${
                                answers[index] === shuffledOptions[index]?.correctIndex 
                                  ? 'text-green-200' 
                                  : 'text-red-200'
                              }`}>
                                {answers[index] === shuffledOptions[index]?.correctIndex 
                                  ? `✅ ${t('correct')}! ${t('accurateAnswer')}`
                                  : `❌ ${t('incorrect')}. ${t('correctAnswer')}...`
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-3 text-sm text-gray-400">
                        💡 50 {t('pointsIfCorrect')}
                        {hasHint && <span className="text-orange-400"> (-10 {t('pointsForHint')})</span>}
                      </div>
                    </div>
                  )}

                  {step.type === 'checklist' && (
                    <div>
                      <p className="text-white mb-4">
                        {t('completeAllTasks')}
                      </p>
                      <div className="space-y-3">
                        {(currentLang === 'fr' ? step.itemsFR : step.itemsEN).map((item, itemIndex) => {
                          const currentChecked = answers[index] || [];
                          const isChecked = Array.isArray(currentChecked) && currentChecked.includes(itemIndex);
                          
                          return (
                            <label 
                              key={itemIndex}
                              className="flex items-center p-3 rounded-lg border border-gray-600 hover:border-gray-500 cursor-pointer transition-all"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleCheckboxChange(index, itemIndex, e.target.checked)}
                                className="mr-3 text-yellow-500"
                              />
                              <span className="text-white">{item}</span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="mt-3 text-sm text-gray-400">
                        ✅ 30 {t('pointsIfAllCompleted')} 
                        ({(answers[index] || []).length}/{(currentLang === 'fr' ? step.itemsFR : step.itemsEN).length})
                      </div>
                    </div>
                  )}

                  {step.type === 'challenge' && (
                    <div>
                      <p className="text-white mb-4">
                        {currentLang === 'fr' ? step.descriptionFR : step.descriptionEN}
                      </p>
                      <textarea
                        value={answers[index] || ''}
                        onChange={(e) => handleAnswer(index, e.target.value)}
                        placeholder={t('describeApproach')}
                        className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                        rows={4}
                      />
                      <div className="mt-3 text-sm text-gray-400">
                        📝 20 {t('pointsIfMinChars')} 
                        ({(answers[index] || '').length}/10)
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Submit Button */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-white">
                  <h3 className="text-lg font-semibold mb-1">
                    {t('readyToSubmit')}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {t('estimatedScore')}: <span className="text-yellow-400 font-bold">{currentScore}</span> {t('points')}
                    {getTimeBonus() > 0 && (
                      <span className="text-green-400"> + {getTimeBonus()} {t('timeBonus')}</span>
                    )}
                  </p>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={!allStepsCompleted || isSubmitting}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                    allStepsCompleted && !isSubmitting
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transform hover:scale-105'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('submitting')}
                    </>
                  ) : (
                    <>
                      <FaTrophy />
                      {t('submitQuest')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Completion Screen with Gamification */
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 rounded-lg text-center">
            <FaTrophy className="text-6xl text-yellow-300 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              {t('questCompleted')}
            </h2>
            <p className="text-green-100 text-xl mb-2">
              {t('finalScore')}: <span className="font-bold text-yellow-300">{finalScore}</span> {t('points')}
            </p>
            <p className="text-green-200 text-sm mb-4">
              {t('time')}: {formatTime(timeSpent)} | 
              {t('hintsUsed')}: {Object.keys(hints).length}
            </p>

            {/* Gamification Achievements */}
            {levelUp && (
              <div className="bg-purple-600/30 border border-purple-400 p-4 rounded-lg mb-4 animate-bounce">
                <h3 className="text-lg font-bold text-purple-200 mb-1">🚀 {t('levelUp')}!</h3>
                <p className="text-purple-100">{t(levelUp.from.toLowerCase())} → {t(levelUp.to.toLowerCase())}</p>
              </div>
            )}

            {unlockedBadges.length > 0 && (
              <div className="bg-yellow-600/30 border border-yellow-400 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-bold text-yellow-200 mb-2">🏆 {t('newBadgeUnlocked')}!</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {unlockedBadges.map(badge => (
                    <span key={badge} className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      <FaMedal className="inline mr-1" />
                      {t(`badges.${badge}`) || badgeDefinitions[badge]?.name || badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={replayQuest}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <FaRedo />
                {t('replay')}
              </button>
              
              <button
                onClick={shareAchievement}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <FaShare />
                {t('shareAchievement')}
              </button>
              
              <Link
                to="/quests"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <FaRocket />
                {t('moreQuests')}
              </Link>
              
              <Link
                to="/dashboard"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <FaBolt />
                {t('dashboard')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestDetail;