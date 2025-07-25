import React, { useState } from 'react';
import { FaCheckSquare, FaSquare, FaInfoCircle } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const ChecklistStep = ({ step, onComplete, language }) => {
  const { t } = useLanguage();
  const [checkedItems, setCheckedItems] = useState({});
  const [showTips, setShowTips] = useState({});

  const tasks = step.tasks || [];
  const requiredCount = step.requiredCount || tasks.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const isComplete = checkedCount >= requiredCount;

  const handleToggle = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleComplete = () => {
    onComplete({
      type: 'checklist',
      checkedItems: checkedItems,
      completedCount: checkedCount,
      timestamp: new Date()
    });
  };

  const toggleTip = (index) => {
    setShowTips(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {step.title || t('quest_detail.checklist_title') || 'Complete the following tasks'}
        </h3>
        {step.content && (
          <p className="text-gray-600 mb-4">{step.content}</p>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{t('quest_detail.progress') || 'Progress'}:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(checkedCount / requiredCount) * 100}%` }}
            />
          </div>
          <span className="font-medium">
            {checkedCount}/{requiredCount}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const taskText = typeof task === 'string' ? task : (task.text || task[language] || task.en);
          const taskTip = typeof task === 'object' ? task.tip : null;
          const isChecked = checkedItems[index] || false;

          return (
            <div key={index} className="space-y-2">
              <div
                onClick={() => handleToggle(index)}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${isChecked 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isChecked ? (
                      <FaCheckSquare className="text-green-600 text-xl" />
                    ) : (
                      <FaSquare className="text-gray-400 text-xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`${isChecked ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                      {taskText}
                    </p>
                  </div>
                  {taskTip && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTip(index);
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <FaInfoCircle />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Tip Display */}
              {taskTip && showTips[index] && (
                <div className="ml-10 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">{taskTip}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {isComplete && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
          <p className="text-green-800 font-semibold">
            {t('quest_detail.all_tasks_complete') || 'Great job! All required tasks completed!'}
          </p>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          disabled={!isComplete}
          className={`
            px-6 py-3 rounded-lg font-semibold transition-all duration-200
            ${isComplete
              ? 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isComplete 
            ? (t('quest_detail.steps.next') || 'Continue')
            : t('quest_detail.complete_tasks_first') || `Complete ${requiredCount - checkedCount} more tasks`
          }
        </button>
      </div>
    </div>
  );
};

export default ChecklistStep;