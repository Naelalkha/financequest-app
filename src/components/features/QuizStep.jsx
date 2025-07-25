import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const QuizStep = ({ step, onComplete, language }) => {
  const { t } = useLanguage();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleAnswerSelect = (index) => {
    if (!answered) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setAnswered(true);
    setShowFeedback(true);
    
    // Auto-advance after 2 seconds if correct
    if (selectedAnswer === step.correctAnswer) {
      setTimeout(() => {
        onComplete({
          type: 'quiz',
          answer: selectedAnswer,
          correct: true,
          timestamp: new Date()
        });
      }, 2000);
    }
  };

  const handleNext = () => {
    onComplete({
      type: 'quiz',
      answer: selectedAnswer,
      correct: selectedAnswer === step.correctAnswer,
      timestamp: new Date()
    });
  };

  const isCorrect = selectedAnswer === step.correctAnswer;

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {step.question}
        </h3>
        {step.content && (
          <p className="text-gray-600">{step.content}</p>
        )}
      </div>

      {/* Hint Button */}
      {step.hint && !showHint && !answered && (
        <button
          onClick={() => setShowHint(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FaLightbulb />
          <span>{t('quest_detail.steps.hint') || 'Show Hint'}</span>
        </button>
      )}

      {/* Hint Display */}
      {showHint && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <FaLightbulb className="text-blue-500 mt-1" />
          <p className="text-blue-800">{step.hint}</p>
        </div>
      )}

      {/* Answer Options */}
      <div className="space-y-3">
        {step.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const showCorrect = showFeedback && index === step.correctAnswer;
          const showIncorrect = showFeedback && isSelected && index !== step.correctAnswer;

          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={answered}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                ${!answered && 'hover:border-yellow-400 hover:bg-yellow-50'}
                ${isSelected && !showFeedback && 'border-yellow-500 bg-yellow-50'}
                ${showCorrect && 'border-green-500 bg-green-50'}
                ${showIncorrect && 'border-red-500 bg-red-50'}
                ${!isSelected && !showCorrect && showFeedback && 'opacity-50'}
                ${answered && 'cursor-not-allowed'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className={`
                  ${showCorrect && 'text-green-800 font-semibold'}
                  ${showIncorrect && 'text-red-800'}
                `}>
                  {option}
                </span>
                {showCorrect && <FaCheckCircle className="text-green-600 text-xl" />}
                {showIncorrect && <FaTimesCircle className="text-red-600 text-xl" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`
          rounded-lg p-4 
          ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        `}>
          <p className="font-semibold mb-2">
            {isCorrect 
              ? (t('quest_detail.correct') || 'Correct! Well done!') 
              : (t('quest_detail.incorrect') || 'Not quite right.')}
          </p>
          {step.explanation && (
            <p>{step.explanation}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        {!answered ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className={`
              px-6 py-3 rounded-lg font-semibold transition-all duration-200
              ${selectedAnswer !== null
                ? 'bg-yellow-500 text-white hover:bg-yellow-600 transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {t('quest_detail.steps.check_answer') || 'Check Answer'}
          </button>
        ) : (
          <>
            {!isCorrect && (
              <button
                onClick={() => {
                  setSelectedAnswer(null);
                  setShowFeedback(false);
                  setAnswered(false);
                }}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {t('quest_detail.steps.try_again') || 'Try Again'}
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-all duration-200 transform hover:scale-105"
            >
              {t('quest_detail.steps.next') || 'Continue'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizStep;