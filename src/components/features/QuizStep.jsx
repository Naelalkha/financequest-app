import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, FaTimesCircle, FaLightbulb, FaQuestionCircle,
  FaBrain, FaGraduationCap, FaChevronRight, FaRedo,
  FaStar, FaAward, FaInfoCircle, FaClock, FaFire
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import ProgressBar from '../common/ProgressBar';

const QuizStep = ({ step, onComplete, questProgress = {} }) => {
  const { t } = useLanguage();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [animateResult, setAnimateResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Déterminer si c'est un quiz à choix multiples ou texte
  const isMultipleChoice = step.isMultipleChoice || (step.options && Array.isArray(step.options));
  const isTextQuiz = !isMultipleChoice;

  // Timer pour mesurer le temps passé
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formater les options en s'assurant qu'elles sont toujours un tableau
  const getOptions = () => {
    // Si les options sont déjà localisées (format options_en/options_fr)
    if (Array.isArray(step.options)) {
      return step.options;
    }
    
    // Si c'est un quiz à choix multiples avec answers
    if (step.answers && Array.isArray(step.answers)) {
      return step.answers;
    }
    
    // Fallback
    return [];
  };

  const options = getOptions();

  const handleAnswerSelect = (index) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
  };

  const handleTextChange = (e) => {
    if (showFeedback) return;
    setTextAnswer(e.target.value);
  };

  const checkTextAnswer = () => {
    if (!textAnswer.trim()) return false;
    
    // Vérifier si la réponse correspond
    const userAnswer = textAnswer.trim().toLowerCase();
    
    // Si correctAnswer est une chaîne
    if (typeof step.correctAnswer === 'string') {
      return userAnswer === step.correctAnswer.toLowerCase();
    }
    
    // Si on a des réponses acceptées multiples
    if (step.acceptedAnswers && Array.isArray(step.acceptedAnswers)) {
      return step.acceptedAnswers.some(answer => 
        userAnswer === answer.toLowerCase().trim()
      );
    }
    
    return false;
  };

  const handleSubmit = () => {
    if (isMultipleChoice && selectedAnswer === null) return;
    if (isTextQuiz && !textAnswer.trim()) return;

    let correct;
    if (isMultipleChoice) {
      correct = selectedAnswer === (step.correctAnswer || step.correct);
    } else {
      correct = checkTextAnswer();
    }

    setIsCorrect(correct);
    setShowFeedback(true);
    setAnimateResult(true);

    // Animation de feedback
    setTimeout(() => {
      setAnimateResult(false);
    }, 600);

    // Auto-progression après délai
    const delay = correct ? 2000 : 3500;
    setTimeout(() => {
      onComplete({
        answer: isMultipleChoice ? selectedAnswer : textAnswer,
        correct,
        hintUsed,
        timeSpent,
        showedExplanation: !correct || showExplanation
      });
    }, delay);
  };

  const handleShowHint = () => {
    setShowHint(true);
    setHintUsed(true);
  };

  const handleTryAgain = () => {
    if (isMultipleChoice) {
      setSelectedAnswer(null);
    } else {
      setTextAnswer('');
    }
    setShowFeedback(false);
    setIsCorrect(false);
    setShowExplanation(false);
  };

  const getDifficultyStars = () => {
    const difficulty = {
      easy: 1,
      beginner: 1,
      intermediate: 2,
      medium: 2,
      hard: 3,
      advanced: 3,
      expert: 4
    };
    
    const level = difficulty[step.difficulty] || 2;
    return Array(4).fill(0).map((_, i) => (
      <FaStar 
        key={i} 
        className={i < level ? 'text-yellow-400' : 'text-gray-600'} 
      />
    ));
  };

  const getStreakBonus = () => {
    // Si c'est la 3e question correcte d'affilée, bonus
    const streak = questProgress.correctStreak || 0;
    if (streak >= 2 && isCorrect) {
      return (
        <div className="flex items-center gap-2 text-orange-400 animate-pulse">
          <FaFire />
          <span className="text-sm font-medium">
            {t('quiz.streak_bonus') || '🔥 Hot Streak! +10 bonus XP'}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FaBrain className="text-purple-400 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {t('quiz.question') || 'Question'} 
                {step.questionNumber && (
                  <span className="text-gray-400 text-sm">
                    #{step.questionNumber}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                {getDifficultyStars()}
              </div>
            </div>
          </div>
          
          {/* Timer */}
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <FaClock />
            <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Question Text */}
        <p className="text-lg text-gray-200 leading-relaxed">
          {step.question || step.text || step.content}
        </p>

        {/* Context or Additional Info */}
        {step.context && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400 flex items-start gap-2">
              <FaInfoCircle className="mt-0.5 flex-shrink-0" />
              <span>{step.context}</span>
            </p>
          </div>
        )}

        {/* Hint Section */}
        {step.hint && !showFeedback && (
          <div className="mt-4">
            {!showHint ? (
              <button
                onClick={handleShowHint}
                className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-2"
              >
                <FaLightbulb />
                {t('quiz.need_hint') || 'Need a hint?'}
              </button>
            ) : (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg animate-fadeIn">
                <p className="text-sm text-yellow-400 flex items-start gap-2">
                  <FaLightbulb className="mt-0.5 flex-shrink-0" />
                  <span>{step.hint}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answer Input Section */}
      {isTextQuiz ? (
        // Input texte pour les quiz avec réponse libre
        <div className="mb-6">
          <input
            type="text"
            value={textAnswer}
            onChange={handleTextChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={showFeedback}
            placeholder={step.placeholder || t('quiz.enter_answer') || 'Enter your answer...'}
            className={`
              w-full px-4 py-3 bg-gray-700 border-2 rounded-lg text-white placeholder-gray-400 
              focus:outline-none transition-colors
              ${showFeedback 
                ? isCorrect 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-red-500 bg-red-500/10'
                : 'border-gray-600 focus:border-yellow-500'
              }
            `}
          />
          {step.inputHelp && (
            <p className="text-xs text-gray-500 mt-1">{step.inputHelp}</p>
          )}
        </div>
      ) : (
        // Options multiples pour les quiz à choix
        <div className="space-y-3">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === (step.correctAnswer || step.correct);
            const showCorrectness = showFeedback;
            
            let optionClass = 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600';
            let iconComponent = null;
            
            if (showCorrectness) {
              if (isCorrectAnswer) {
                optionClass = 'bg-green-500/10 border-2 border-green-500 transform scale-[1.02]';
                iconComponent = <FaCheckCircle className="text-green-400 text-xl" />;
              } else if (isSelected && !isCorrect) {
                optionClass = 'bg-red-500/10 border-2 border-red-500';
                iconComponent = <FaTimesCircle className="text-red-400 text-xl" />;
              }
            } else if (isSelected) {
              optionClass = 'bg-yellow-500/10 border-2 border-yellow-500 transform scale-[1.02]';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className={`
                  w-full p-4 rounded-xl transition-all duration-300 group
                  ${optionClass}
                  ${!showFeedback && 'hover:transform hover:scale-[1.02] cursor-pointer'}
                  ${showFeedback && 'cursor-default'}
                  ${animateResult && isSelected && !isCorrect && 'animate-shake'}
                  ${animateResult && isCorrectAnswer && 'animate-pulse'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg
                      transition-all duration-300
                      ${showCorrectness && isCorrectAnswer ? 'bg-green-500 text-white' : 
                        showCorrectness && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                        isSelected ? 'bg-yellow-400 text-gray-900' : 
                        'bg-gray-700 text-gray-400 group-hover:bg-gray-600'}
                    `}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className={`
                      text-left font-medium
                      ${showCorrectness && isCorrectAnswer ? 'text-green-400' :
                        showCorrectness && isSelected && !isCorrect ? 'text-red-400' :
                        'text-gray-200'}
                    `}>
                      {option}
                    </span>
                  </div>
                  {iconComponent}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback Section */}
      {showFeedback && (
        <div className={`
          p-6 rounded-xl animate-slideDown
          ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}
        `}>
          <div className="flex items-start gap-4">
            <div className={`
              p-3 rounded-lg
              ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}
            `}>
              {isCorrect ? (
                <FaGraduationCap className="text-2xl text-green-400" />
              ) : (
                <FaQuestionCircle className="text-2xl text-red-400" />
              )}
            </div>
            
            <div className="flex-1">
              <h4 className={`
                text-lg font-semibold mb-2
                ${isCorrect ? 'text-green-400' : 'text-red-400'}
              `}>
                {isCorrect 
                  ? t('quiz.correct_title') || 'Excellent! That\'s correct!' 
                  : t('quiz.incorrect_title') || 'Not quite right'}
              </h4>
              
              {/* Explanation */}
              {(step.explanation || step.feedback) && (
                <div className="mt-3">
                  {!showExplanation && !isCorrect ? (
                    <button
                      onClick={() => setShowExplanation(true)}
                      className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <FaGraduationCap />
                      {t('quiz.show_explanation') || 'Learn why'}
                    </button>
                  ) : (
                    <div className="space-y-2 animate-fadeIn">
                      <p className="text-gray-300 leading-relaxed">
                        {step.explanation || step.feedback}
                      </p>
                      
                      {/* Fun fact ou conseil supplémentaire */}
                      {step.funFact && (
                        <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                          <p className="text-sm text-purple-400 flex items-start gap-2">
                            <FaAward className="mt-0.5 flex-shrink-0" />
                            <span>
                              <strong>{t('quiz.fun_fact') || 'Fun fact:'}</strong> {step.funFact}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Points earned */}
              {isCorrect && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <FaStar />
                    <span className="font-medium">
                      +{step.points || 10} XP
                      {hintUsed && <span className="text-gray-400 text-sm ml-1">(-5 hint)</span>}
                    </span>
                  </div>
                  {getStreakBonus()}
                </div>
              )}

              {/* Try Again (for incorrect answers) */}
              {!isCorrect && step.allowRetry && (
                <button
                  onClick={handleTryAgain}
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaRedo />
                  {t('quiz.try_again') || 'Try Again'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!showFeedback && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isMultipleChoice ? selectedAnswer === null : !textAnswer.trim()}
            className={`
              px-6 py-3 rounded-lg font-semibold transition-all duration-300
              flex items-center gap-2
              ${(isMultipleChoice ? selectedAnswer !== null : textAnswer.trim())
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 shadow-lg'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {t('quiz.submit_answer') || 'Submit Answer'}
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Progress indication */}
      {step.totalQuestions && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              {t('quiz.progress') || 'Quiz Progress'}
            </span>
            <span className="text-sm text-gray-400">
              {step.currentQuestion || 1} / {step.totalQuestions}
            </span>
          </div>
          <ProgressBar 
            progress={(step.currentQuestion || 1) / step.totalQuestions * 100} 
            showPercentage={false}
            height="h-2"
            color="purple"
          />
        </div>
      )}
    </div>
  );
};

export default QuizStep;