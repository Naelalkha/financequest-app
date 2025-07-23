import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaClock, FaStar, FaTrophy, FaRocket, FaShare, FaBolt } from 'react-icons/fa';
import { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import quests from '../data/quests.json';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function QuestDetail({ t }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const quest = quests.find(q => q.id === parseInt(id));
  const { user } = useAuth();
  
  const [answers, setAnswers] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [shuffledOptions, setShuffledOptions] = useState({});

  const userLang = user?.lang || 'en';

  // Shuffle options for quiz steps
  useEffect(() => {
    if (!quest) return;
    
    const shuffled = {};
    quest.steps.forEach((step, index) => {
      if (step.type === 'quiz' && step.optionsEN) {
        const options = userLang === 'fr' ? step.optionsFR : step.optionsEN;
        const shuffledIndexes = [...Array(options.length).keys()].sort(() => Math.random() - 0.5);
        shuffled[index] = {
          options: shuffledIndexes.map(i => options[i]),
          correctIndex: shuffledIndexes.indexOf(step.correct)
        };
      }
    });
    setShuffledOptions(shuffled);
  }, [quest, userLang]);

  // Calculate difficulty multiplier
  const getDifficultyMultiplier = () => {
    switch (quest?.difficulty) {
      case 'Easy': return 1;
      case 'Medium': return 1.2;
      case 'Hard': return 1.5;
      default: return 1;
    }
  };

  // Calculate time bonus (bonus if completed under expected duration)
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

  // Handle answer change
  const handleAnswer = (stepIndex, value) => {
    setAnswers(prev => ({ ...prev, [stepIndex]: value }));
    
    // Check if step is completed
    const step = quest.steps[stepIndex];
    let isStepComplete = false;
    
    switch (step.type) {
      case 'quiz':
        isStepComplete = value !== undefined;
        break;
      case 'checklist':
        const items = userLang === 'fr' ? step.itemsFR : step.itemsEN;
        isStepComplete = value === items.length;
        break;
      case 'challenge':
        isStepComplete = value && value.length > 10;
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

  // Calculate current score
  const currentScore = useMemo(() => {
    let score = 0;
    quest?.steps.forEach((step, index) => {
      if (!completedSteps.has(index)) return;
      
      switch (step.type) {
        case 'quiz':
          if (answers[index] === shuffledOptions[index]?.correctIndex) {
            score += 50;
          }
          break;
        case 'checklist':
          const items = userLang === 'fr' ? step.itemsFR : step.itemsEN;
          if (answers[index] === items.length) {
            score += 30;
          }
          break;
        case 'challenge':
          if (answers[index] && answers[index].length > 10) {
            score += 20;
          }
          break;
        default:
          break;
      }
    });
    
    return Math.round(score * getDifficultyMultiplier() * getPremiumMultiplier());
  }, [answers, completedSteps, shuffledOptions, userLang, quest, user]);

  // Check for new badges
  const checkForNewBadges = (newPoints, questType) => {
    const badges = [];
    
    // Point-based badges
    if (newPoints >= 100 && !user.badges?.includes('BudgetMaster')) {
      badges.push('BudgetMaster');
    }
    if (newPoints >= 300 && !user.badges?.includes('SavingsPro')) {
      badges.push('SavingsPro');
    }
    
    // Quest-specific badges
    if (currentScore === getMaxPossibleScore() && !user.badges?.includes('Perfectionist')) {
      badges.push('Perfectionist');
    }
    
    const timeBonus = getTimeBonus();
    if (timeBonus >= 50 && !user.badges?.includes('SpeedRunner')) {
      badges.push('SpeedRunner');
    }
    
    return badges;
  };

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

  // Get current level
  const getCurrentLevel = (points) => {
    if (points >= 600) return 'Master';
    if (points >= 300) return 'Expert';
    if (points >= 100) return 'Intermediate';
    return 'Novice';
  };

  // Confetti animation
  const triggerConfetti = () => {
    // Simple confetti effect with emojis
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

  // Handle quest submission
  const handleSubmit = async () => {
    if (!user || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const baseScore = currentScore;
      const timeBonus = getTimeBonus();
      const totalScore = baseScore + timeBonus;
      const newTotalPoints = user.points + totalScore;
      const newLevel = getCurrentLevel(newTotalPoints);
      
      // Update Firestore
      const updates = {
        points: newTotalPoints,
        level: newLevel,
        [`completedQuests.${quest.id}`]: {
          score: totalScore,
          completedAt: new Date().toISOString(),
          timeBonus: timeBonus
        }
      };

      // Check for new badges
      const newBadges = checkForNewBadges(newTotalPoints, quest.difficulty);
      if (newBadges.length > 0) {
        updates.badges = [...(user.badges || []), ...newBadges];
      }

      await updateDoc(doc(db, 'users', user.uid), updates);
      
      // Trigger confetti
      triggerConfetti();
      
      // Show success toast
      toast.success(`🎉 Quest Completed! Score: ${totalScore} points!`, {
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
          toast.info(`⚡ Speed Bonus: +${timeBonus} points!`, {
            position: "top-center",
            autoClose: 3000,
          });
        }, 1000);
      }

      // Show badge notifications
      newBadges.forEach((badge, index) => {
        setTimeout(() => {
          toast.success(`🏆 New Badge Unlocked: ${badge}!`, {
            position: "top-center",
            autoClose: 4000,
          });
        }, 2000 + (index * 1000));
      });

      // Show level up notification
      if (newLevel !== user.level) {
        setTimeout(() => {
          toast.success(`🚀 Level Up! You are now ${newLevel}!`, {
            position: "top-center",
            autoClose: 4000,
          });
        }, 3000);
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

  // Share achievement
  const shareAchievement = () => {
    const text = `🎉 Just completed "${quest.titleEN}" quest in FinanceQuest and scored ${finalScore} points! 💰 #FinanceQuest #MoneySkills`;
    
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

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Quest Not Found</h2>
          <Link to="/quests" className="text-yellow-400 hover:text-yellow-300">
            ← Back to Quests
          </Link>
        </div>
      </div>
    );
  }

  const title = userLang === 'fr' ? quest.titleFR : quest.titleEN;
  const difficulty = userLang === 'fr' ? quest.difficultyFR : quest.difficulty;
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
            {t('back') || 'Back to Quests'}
          </Link>
          
          {!isCompleted && (
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <FaClock />
              <span>{userLang === 'fr' ? 'Temps estimé' : 'Estimated time'}: {quest.duration} min</span>
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
                  <span className="text-gray-400">{difficulty}</span>
                </div>
                <div className="text-gray-400">
                  {quest.steps.length} {userLang === 'fr' ? 'étapes' : 'steps'}
                </div>
              </div>
            </div>
            
            {/* Current Score Display */}
            <div className="bg-gray-700 px-4 py-2 rounded-lg">
              <div className="text-center">
                <div className="text-yellow-400 text-2xl font-bold">{currentScore}</div>
                <div className="text-xs text-gray-400">
                  {userLang === 'fr' ? 'Points' : 'Points'} / {getMaxPossibleScore()}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{userLang === 'fr' ? 'Progression' : 'Progress'}</span>
              <span>{completedSteps.size}/{quest.steps.length} {userLang === 'fr' ? 'complété' : 'completed'}</span>
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
                      {userLang === 'fr' ? 'Étape' : 'Step'} {index + 1}
                    </h3>
                    
                    {isStepCompleted && (
                      <FaCheckCircle className="text-green-500 text-xl animate-pulse" />
                    )}
                  </div>

                  {/* Step Content */}
                  {step.type === 'quiz' && (
                    <div>
                      <p className="text-white mb-4 text-lg">
                        {userLang === 'fr' ? step.questionFR : step.questionEN}
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
                      <div className="mt-3 text-sm text-gray-400">
                        💡 {userLang === 'fr' ? '50 points si correct' : '50 points if correct'}
                      </div>
                    </div>
                  )}

                  {step.type === 'checklist' && (
                    <div>
                      <p className="text-white mb-4">
                        {userLang === 'fr' ? 'Complétez toutes les tâches :' : 'Complete all tasks:'}
                      </p>
                      <div className="space-y-3">
                        {(userLang === 'fr' ? step.itemsFR : step.itemsEN).map((item, itemIndex) => (
                          <label 
                            key={itemIndex}
                            className="flex items-center p-3 rounded-lg border border-gray-600 hover:border-gray-500 cursor-pointer transition-all"
                          >
                            <input
                              type="checkbox"
                              checked={answers[index]?.includes && answers[index].includes(itemIndex)}
                              onChange={(e) => {
                                const currentChecked = answers[index] || [];
                                const newChecked = e.target.checked 
                                  ? [...currentChecked, itemIndex]
                                  : currentChecked.filter(i => i !== itemIndex);
                                handleAnswer(index, newChecked.length);
                              }}
                              className="mr-3 text-yellow-500"
                            />
                            <span className="text-white">{item}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 text-sm text-gray-400">
                        ✅ {userLang === 'fr' ? '30 points si tout complété' : '30 points if all completed'} 
                        ({(answers[index] || 0)}/{(userLang === 'fr' ? step.itemsFR : step.itemsEN).length})
                      </div>
                    </div>
                  )}

                  {step.type === 'challenge' && (
                    <div>
                      <p className="text-white mb-4">
                        {userLang === 'fr' ? step.descriptionFR : step.descriptionEN}
                      </p>
                      <textarea
                        value={answers[index] || ''}
                        onChange={(e) => handleAnswer(index, e.target.value)}
                        placeholder={userLang === 'fr' ? 'Décrivez votre approche...' : 'Describe your approach...'}
                        className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                        rows={4}
                      />
                      <div className="mt-3 text-sm text-gray-400">
                        📝 {userLang === 'fr' ? '20 points si >10 caractères' : '20 points if >10 characters'} 
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
                    {userLang === 'fr' ? 'Prêt à soumettre ?' : 'Ready to Submit?'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {userLang === 'fr' ? 'Score estimé' : 'Estimated score'}: <span className="text-yellow-400 font-bold">{currentScore}</span> {userLang === 'fr' ? 'points' : 'points'}
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
                      {userLang === 'fr' ? 'Soumission...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <FaTrophy />
                      {userLang === 'fr' ? 'Soumettre Quête' : 'Submit Quest'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Completion Screen */
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 rounded-lg text-center">
            <FaTrophy className="text-6xl text-yellow-300 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              {userLang === 'fr' ? 'Quête Terminée !' : 'Quest Completed!'}
            </h2>
            <p className="text-green-100 text-xl mb-6">
              {userLang === 'fr' ? 'Score final' : 'Final Score'}: <span className="font-bold text-yellow-300">{finalScore}</span> {userLang === 'fr' ? 'points' : 'points'}
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={shareAchievement}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <FaShare />
                {userLang === 'fr' ? 'Partager' : 'Share Achievement'}
              </button>
              
              <Link
                to="/quests"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <FaRocket />
                {userLang === 'fr' ? 'Autres Quêtes' : 'More Quests'}
              </Link>
              
              <Link
                to="/dashboard"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <FaBolt />
                {userLang === 'fr' ? 'Tableau de Bord' : 'Dashboard'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestDetail;