import React, { useState } from 'react';
import { FaCheckCircle, FaLightbulb, FaRocket } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import posthog from 'posthog-js';

const SimpleActionStep = ({ step, onComplete, language }) => {
  const { t, currentLang } = useLanguage();
  const [completedActions, setCompletedActions] = useState({});
  const [showHint, setShowHint] = useState(false);

  // Récupérer les actions depuis le bon chemin dans les données
  const getActions = () => {
    const actions = step.actions || 
                   step.content?.actions || 
                   step.content?.[currentLang]?.actions ||
                   [];
    
    if (Array.isArray(actions)) {
      return actions;
    }
    
    if (actions && typeof actions === 'object') {
      return actions[currentLang] || actions.en || [];
    }
    
    return [];
  };

  const actions = getActions();

  // Actions par défaut si aucune action n'est trouvée
  const defaultActions = [
    {
      id: 'default_action_1',
      title: t('action.default_action_1') || 'Review what you learned',
      description: t('action.default_desc_1') || 'Take a moment to reflect on the key concepts',
      xp: 10
    },
    {
      id: 'default_action_2',
      title: t('action.default_action_2') || 'Apply to your situation',
      description: t('action.default_desc_2') || 'Think about how this applies to your finances',
      xp: 10
    }
  ];

  const finalActions = actions.length > 0 ? actions : defaultActions;

  const handleActionComplete = (actionId) => {
    setCompletedActions(prev => ({
      ...prev,
      [actionId]: true
    }));

    // Capture l'événement PostHog
    const action = finalActions.find(a => a.id === actionId);
    posthog.capture('quest_step_complete', {
      step_id: step.id || step.title,
      step_type: 'simple_action',
      quest_id: step.questId,
      action_id: actionId,
      action_title: action?.title,
      action_xp: action?.xp
    });
  };

  const handleContinue = () => {
    const completedCount = Object.keys(completedActions).length;
    const totalActions = finalActions.length;
    
    // Calculer le score basé sur les actions complétées
    const score = Math.round((completedCount / totalActions) * 100);
    
    onComplete({
      type: 'simple_action',
      completedActions,
      score,
      totalActions,
      completedCount
    });
  };

  const isAllCompleted = finalActions.every(action => completedActions[action.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <FaRocket className="text-blue-600 text-2xl mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {step.title || t('action.simple_action_title') || 'Action Step'}
            </h3>
            {step.content && (
              <p className="text-gray-700 whitespace-pre-wrap">
                {typeof step.content === 'string' 
                  ? step.content 
                  : step.content[currentLang] || step.content.en || step.content.description
                }
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">
          {t('action.complete_actions') || 'Complete these actions:'}
        </h4>
        
        {finalActions.map((action, index) => (
          <div
            key={action.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              completedActions[action.id]
                ? 'border-green-500 bg-green-900/20'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleActionComplete(action.id)}
                disabled={completedActions[action.id]}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  completedActions[action.id]
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-400 hover:border-green-400 hover:bg-green-400/20'
                }`}
              >
                {completedActions[action.id] && <FaCheckCircle className="text-sm" />}
              </button>
              
              <div className="flex-1">
                <h5 className="font-semibold text-white mb-1">
                  {action.title}
                </h5>
                <p className="text-gray-400 text-sm">
                  {action.description}
                </p>
                {action.xp && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-yellow-400 text-sm font-medium">
                      +{action.xp} XP
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 text-sm">
            {t('action.progress') || 'Progress'}
          </span>
          <span className="text-white font-semibold">
            {Object.keys(completedActions).length} / {finalActions.length}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(Object.keys(completedActions).length / finalActions.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!isAllCompleted}
        className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isAllCompleted 
          ? (t('ui.continue') || 'Continue')
          : (t('action.complete_all_actions') || 'Complete all actions to continue')
        }
      </button>
    </div>
  );
};

export default SimpleActionStep; 