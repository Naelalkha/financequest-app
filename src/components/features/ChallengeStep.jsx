import React, { useState } from 'react';
import { FaCalculator, FaChartLine, FaLightbulb, FaCheckCircle } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const ChallengeStep = ({ step, onComplete, language }) => {
  const { t } = useLanguage();
  const [userInput, setUserInput] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    
    setCompleted(true);
    
    // For challenges, we don't check correctness, just completion
    setTimeout(() => {
      onComplete({
        type: 'challenge',
        userInput: userInput,
        completed: true,
        timestamp: new Date()
      });
    }, 1500);
  };

  const handleShowSolution = () => {
    setShowSolution(true);
  };

  return (
    <div className="space-y-6">
      {/* Challenge Description */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
        <div className="flex items-start gap-3">
          <FaChartLine className="text-yellow-600 text-2xl mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {step.title || t('quest_detail.challenge_title') || 'Challenge'}
            </h3>
            {step.content && (
              <p className="text-gray-700 whitespace-pre-wrap">{step.content}</p>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {step.instruction && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-800">
            <strong>{t('quest_detail.instructions') || 'Instructions'}:</strong> {step.instruction}
          </p>
        </div>
      )}

      {/* Hint Section */}
      {step.hint && !showHint && !completed && (
        <button
          onClick={() => setShowHint(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FaLightbulb />
          <span>{t('quest_detail.steps.hint') || 'Need a hint?'}</span>
        </button>
      )}

      {showHint && step.hint && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <FaLightbulb className="text-amber-600 mt-1" />
          <p className="text-amber-800">{step.hint}</p>
        </div>
      )}

      {/* User Input Area */}
      <div className="space-y-4">
        <label className="block">
          <span className="text-gray-700 font-medium mb-2 block">
            {step.inputLabel || t('quest_detail.your_answer') || 'Your Answer'}:
          </span>
          <textarea
            value={userInput}
            onChange={handleInputChange}
            disabled={completed}
            rows={step.inputRows || 4}
            className={`
              w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500
              ${completed ? 'bg-gray-100 border-gray-300' : 'border-gray-300'}
            `}
            placeholder={step.placeholder || t('quest_detail.enter_answer') || 'Enter your answer here...'}
          />
        </label>

        {/* Character count if needed */}
        {step.maxLength && (
          <p className="text-sm text-gray-500 text-right">
            {userInput.length}/{step.maxLength} {t('ui.characters') || 'characters'}
          </p>
        )}
      </div>

      {/* Example Solution Button */}
      {step.solution && !showSolution && (
        <button
          onClick={handleShowSolution}
          className="text-purple-600 hover:text-purple-700 transition-colors text-sm"
        >
          {t('quest_detail.show_example') || 'Show example solution'}
        </button>
      )}

      {/* Solution Display */}
      {showSolution && step.solution && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <FaCalculator />
            {t('quest_detail.example_solution') || 'Example Solution'}:
          </h4>
          <p className="text-purple-700 whitespace-pre-wrap">{step.solution}</p>
        </div>
      )}

      {/* Completion Message */}
      {completed && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex items-center gap-3">
          <FaCheckCircle className="text-green-600 text-xl" />
          <div>
            <p className="text-green-800 font-semibold">
              {t('quest_detail.challenge_complete') || 'Challenge completed!'}
            </p>
            <p className="text-green-700 text-sm">
              {t('quest_detail.great_effort') || 'Great effort on tackling this challenge!'}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        {!completed ? (
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className={`
              px-6 py-3 rounded-lg font-semibold transition-all duration-200
              ${userInput.trim()
                ? 'bg-yellow-500 text-white hover:bg-yellow-600 transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {t('quest_detail.steps.submit') || 'Submit Challenge'}
          </button>
        ) : (
          <button
            onClick={() => onComplete({
              type: 'challenge',
              userInput: userInput,
              completed: true,
              timestamp: new Date()
            })}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-all duration-200 transform hover:scale-105"
          >
            {t('quest_detail.steps.next') || 'Continue'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChallengeStep;