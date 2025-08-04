import React, { useState, useEffect } from 'react';
import { 
  FaRocket, FaTrophy, FaClock, FaFire, FaCheckCircle, 
  FaLightbulb, FaCamera, FaPhoneAlt, FaStar, FaGift,
  FaChevronRight, FaLock, FaUnlock, FaBolt, FaShare
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import Confetti from 'react-confetti';
import posthog from 'posthog-js';

const ActionChallenge = ({ step, onComplete, userLevel, language }) => {
  const { t, currentLang } = useLanguage();
  const [completedActions, setCompletedActions] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(24 * 60 * 60); // 24h en secondes
  const [showTips, setShowTips] = useState({});
  const [unlockedBonus, setUnlockedBonus] = useState(false);

  // Récupérer les actions depuis le bon chemin dans les données
  const getActions = () => {
    // Essayer différents chemins pour les actions
    const actions = step.actions || 
                   step.content?.actions || 
                   step.content?.[currentLang]?.actions ||
                   [];
    
    // Si c'est un tableau d'actions, les retourner directement
    if (Array.isArray(actions)) {
      return actions;
    }
    
    // Si c'est un objet avec des actions localisées, prendre la bonne langue
    if (actions && typeof actions === 'object') {
      return actions[currentLang] || actions.en || [];
    }
    
    return [];
  };

  const availableActions = getActions();

  // Actions par défaut si aucune action n'est trouvée
  const defaultActions = [
    {
      id: 'default_action_1',
      title: t('action.default_action_1') || 'Review what you learned',
      description: t('action.default_desc_1') || 'Take a moment to reflect on the key concepts',
      verification: 'manual',
      xp: 10
    },
    {
      id: 'default_action_2',
      title: t('action.default_action_2') || 'Apply to your situation',
      description: t('action.default_desc_2') || 'Think about how this applies to your finances',
      verification: 'manual',
      xp: 10
    },
    {
      id: 'default_action_3',
      title: t('action.default_action_3') || 'Plan your next steps',
      description: t('action.default_desc_3') || 'Decide on one concrete action to take',
      verification: 'manual',
      xp: 10
    }
  ];

  // Utiliser les actions disponibles ou les actions par défaut
  const finalActions = availableActions.length > 0 ? availableActions : defaultActions;



  // Différents parcours d'implémentation
  const implementationPaths = {
    quick: {
      id: 'quick',
      name: t('action.quick_path') || '⚡ Quick Wins (10 min)',
      description: t('action.quick_desc') || 'Perfect for busy schedules',
      xpMultiplier: 1.5,
      icon: FaBolt,
      color: 'yellow',
      actions: finalActions.slice(0, 3)
    },
    deep: {
      id: 'deep',
      name: t('action.deep_path') || '🏆 Complete Mastery (30 min)',
      description: t('action.deep_desc') || 'Maximum learning & rewards',
      xpMultiplier: 2.0,
      icon: FaTrophy,
      color: 'purple',
      actions: finalActions
    },
    social: {
      id: 'social',
      name: t('action.social_path') || '👥 Buddy Challenge',
      description: t('action.social_desc') || 'Complete with a friend for 3X rewards',
      xpMultiplier: 3.0,
      icon: FaShare,
      color: 'blue',
      actions: finalActions.slice(0, 4),
      requiresShare: true
    }
  };

  // Timer pour créer l'urgence
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleActionComplete = (actionId) => {
    setCompletedActions(prev => ({
      ...prev,
      [actionId]: true
    }));

    // Effet confetti pour les actions difficiles
    const action = getCurrentActions().find(a => a.id === actionId);
    if (action?.difficulty === 'hard' || action?.xp >= 200) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // Capture l'événement PostHog pour la validation d'action
    posthog.capture('quest_step_complete', {
      step_id: step.id || step.title,
      step_type: 'action',
      quest_id: step.questId,
      action_id: actionId,
      action_difficulty: action?.difficulty,
      action_xp: action?.xp,
      path_type: selectedPath,
      completed_actions_count: Object.keys(completedActions).length + 1
    });

    // Vérifier les milestones
    const completedCount = Object.keys(completedActions).length + 1;
    if (completedCount === 3 && !unlockedBonus) {
      setUnlockedBonus(true);
    }
  };

  const getCurrentActions = () => {
    if (!selectedPath) return [];
    const pathActions = getPathSpecificActions(selectedPath);
    return pathActions;
  };

  const calculateTotalXP = () => {
    const path = implementationPaths[selectedPath];
    if (!path) return 0;
    
    const baseXP = path.actions.reduce((sum, action) => {
      return sum + (completedActions[action.id] ? action.xp : 0);
    }, 0);
    
    return Math.round(baseXP * path.xpMultiplier);
  };

  const isPathComplete = () => {
    const actions = getCurrentActions();
    return actions.length > 0 && actions.every(action => completedActions[action.id]);
  };

  // Actions spécifiques par parcours
  const getPathSpecificActions = (pathType) => {
    const baseActions = finalActions;
    
    switch (pathType) {
      case 'quick':
        return baseActions.slice(0, 2).map(action => ({
          ...action,
          title: `⚡ ${action.title}`,
          xp: Math.round(action.xp * 0.8)
        }));
      
      case 'deep':
        return baseActions.map(action => ({
          ...action,
          title: `🏆 ${action.title}`,
          xp: Math.round(action.xp * 1.2),
          description: `${action.description} (Take your time to do this thoroughly)`
        }));
      
      case 'social':
        return baseActions.slice(0, 3).map(action => ({
          ...action,
          title: `👥 ${action.title}`,
          xp: Math.round(action.xp * 1.5),
          description: `${action.description} (Invite a friend to join you!)`
        }));
      
      default:
        return baseActions;
    }
  };

  const renderPathSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          {t('action.choose_path') || '🎯 Choose Your Action Path'}
        </h3>
        <p className="text-gray-400">
          {t('action.choose_desc') || 'Select how you want to implement what you learned'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(implementationPaths).map(([key, path]) => (
          <button
            key={key}
            onClick={() => setSelectedPath(key)}
            className={`
              p-6 rounded-xl border-2 transition-all duration-300 text-left
              hover:transform hover:scale-105 hover:shadow-xl
              ${key === 'quick' ? 'border-yellow-500 bg-yellow-900/20 hover:bg-yellow-900/30' :
                key === 'deep' ? 'border-purple-500 bg-purple-900/20 hover:bg-purple-900/30' :
                'border-blue-500 bg-blue-900/20 hover:bg-blue-900/30'}
            `}
          >
            <div className="flex items-center gap-3 mb-3">
              <path.icon className={`text-3xl ${
                key === 'quick' ? 'text-yellow-400' :
                key === 'deep' ? 'text-purple-400' :
                'text-blue-400'
              }`} />
              <div className="flex-1">
                <h4 className="font-bold text-white">{path.name}</h4>
                <p className="text-sm text-gray-400">{path.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {path.actions.length} actions
              </span>
              <span className={`text-sm font-bold ${
                key === 'quick' ? 'text-yellow-400' :
                key === 'deep' ? 'text-purple-400' :
                'text-blue-400'
              }`}>
                {path.xpMultiplier}X XP
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderActions = () => {
    const actions = getCurrentActions();
    const path = implementationPaths[selectedPath];

    return (
      <div className="space-y-6">
        {/* Header with timer */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {path.icon && <path.icon className={`text-${path.color}-400`} />}
                {path.name}
              </h3>
              <p className="text-gray-400 text-sm mt-1">{path.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-orange-400">
                <FaClock />
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Time bonus active</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Progress</span>
              <span className="font-bold text-white">
                {Object.keys(completedActions).length}/{actions.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  path.color === 'yellow' ? 'bg-yellow-500' :
                  path.color === 'purple' ? 'bg-purple-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${(Object.keys(completedActions).length / actions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* XP Counter */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">Total XP earned:</span>
            <span className="text-xl font-bold text-green-400">
              +{calculateTotalXP()} XP
            </span>
          </div>
        </div>

        {/* Actions list */}
        <div className="space-y-4">
          {actions.map((action, index) => {
            const isCompleted = completedActions[action.id];
            const isLocked = index > 0 && !completedActions[actions[index - 1].id];

            return (
              <div
                key={action.id}
                className={`
                  relative rounded-xl border-2 transition-all duration-300
                  ${isCompleted ? 'border-green-500 bg-green-900/20' :
                    isLocked ? 'border-gray-700 bg-gray-900/50 opacity-60' :
                    'border-gray-600 bg-gray-800/50 hover:border-yellow-500'}
                `}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Status icon */}
                    <div className="mt-1">
                      {isCompleted ? (
                        <FaCheckCircle className="text-3xl text-green-400" />
                      ) : isLocked ? (
                        <FaLock className="text-3xl text-gray-600" />
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-500" />
                      )}
                    </div>

                    {/* Action content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`font-bold text-lg ${
                          isCompleted ? 'text-green-400' : 'text-white'
                        }`}>
                          {action.title}
                        </h4>
                        {action.difficulty && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            action.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
                            action.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-red-900/50 text-red-400'
                          }`}>
                            {action.difficulty}
                          </span>
                        )}
                        <span className="ml-auto text-sm font-bold text-yellow-400">
                          +{action.xp} XP
                        </span>
                      </div>

                      <p className="text-gray-300 mb-3">{action.description}</p>

                      {/* Action details */}
                      {!isLocked && !isCompleted && (
                        <>
                          {action.timeLimit && (
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                              <FaClock className="text-gray-500" />
                              <span>Estimated time: {action.timeLimit}</span>
                            </div>
                          )}

                          {action.tips && (
                            <button
                              onClick={() => setShowTips(prev => ({
                                ...prev,
                                [action.id]: !prev[action.id]
                              }))}
                              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mb-3"
                            >
                              <FaLightbulb />
                              <span>Show tips</span>
                            </button>
                          )}

                          {showTips[action.id] && action.tips && (
                            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-3">
                              <ul className="space-y-1">
                                {action.tips.map((tip, i) => (
                                  <li key={i} className="text-sm text-blue-300 flex items-start gap-2">
                                    <span className="text-blue-400 mt-0.5">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {action.script && (
                            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 mb-3">
                              <p className="text-xs text-gray-400 mb-1">Sample script:</p>
                              <p className="text-sm text-gray-300 italic">"{action.script}"</p>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleActionComplete(action.id)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-all hover:scale-105"
                            >
                              Mark Complete
                            </button>
                            {action.proof && (
                              <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 font-medium transition-all flex items-center gap-2">
                                <FaCamera />
                                Upload Proof
                              </button>
                            )}
                          </div>
                        </>
                      )}

                      {/* Completion message */}
                      {isCompleted && (
                        <div className="flex items-center gap-2 text-green-400">
                          <FaCheckCircle />
                          <span className="font-medium">Completed!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bonus indicator */}
                {action.xp >= 200 && !isCompleted && !isLocked && (
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <FaStar />
                      HIGH VALUE
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Milestone rewards */}
        {unlockedBonus && (
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500">
            <div className="flex items-center gap-3 mb-3">
              <FaGift className="text-3xl text-purple-400" />
              <div>
                <h4 className="text-lg font-bold text-white">Milestone Bonus Unlocked!</h4>
                <p className="text-purple-300">+150 Bonus XP for completing 3 actions</p>
              </div>
            </div>
          </div>
        )}

        {/* Completion section */}
        {isPathComplete() && (
          <div className="bg-green-900/30 border border-green-600 rounded-xl p-6 text-center">
            <FaTrophy className="text-5xl text-yellow-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-2">
              {t('action.all_complete') || 'All Actions Completed!'}
            </h3>
            <p className="text-green-400 mb-4">
              You earned {calculateTotalXP()} XP with the {path.xpMultiplier}X multiplier!
            </p>
            <button
              onClick={() => onComplete({
                type: 'action_challenge',
                completedActions,
                totalXP: calculateTotalXP(),
                path: selectedPath,
                timestamp: new Date()
              })}
              className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold transition-all transform hover:scale-105"
            >
              Claim Rewards & Continue
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {!selectedPath ? renderPathSelection() : renderActions()}
      
      {/* Back button */}
      {selectedPath && !isPathComplete() && (
        <button
          onClick={() => setSelectedPath(null)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Choose different path
        </button>
      )}
    </div>
  );
};

export default ActionChallenge;