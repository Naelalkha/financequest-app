import React, { useState } from 'react';
import { FaCheckCircle, FaListUl } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import posthog from 'posthog-js';

const ChecklistStep = ({ step, onComplete, language }) => {
  const { t, currentLang } = useLanguage();
  const [completedItems, setCompletedItems] = useState({});

  // Récupérer les items de la checklist
  const getChecklistItems = () => {
    const items = step.items || 
                  step.content?.items || 
                  step.content?.[currentLang]?.items ||
                  [];
    
    if (Array.isArray(items)) {
      return items;
    }
    
    if (items && typeof items === 'object') {
      return items[currentLang] || items.en || [];
    }
    
    return [];
  };

  const checklistItems = getChecklistItems();

  // Items par défaut si aucune checklist n'est trouvée
  const defaultItems = [
    {
      id: 'default_item_1',
      text: t('checklist.default_item_1') || 'I understand the key concepts',
      xp: 5
    },
    {
      id: 'default_item_2',
      text: t('checklist.default_item_2') || 'I can apply this to my situation',
      xp: 5
    }
  ];

  const finalItems = checklistItems.length > 0 ? checklistItems : defaultItems;

  const handleItemToggle = (itemId) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));

    // Capture l'événement PostHog
    const item = finalItems.find(i => i.id === itemId);
    posthog.capture('quest_step_complete', {
      step_id: step.id || step.title,
      step_type: 'checklist',
      quest_id: step.questId,
      item_id: itemId,
      item_text: item?.text,
      completed: !completedItems[itemId]
    });
  };

  const handleContinue = () => {
    const completedCount = Object.values(completedItems).filter(Boolean).length;
    const totalItems = finalItems.length;
    
    // Calculer le score basé sur les items cochés
    const score = Math.round((completedCount / totalItems) * 100);
    
    onComplete({
      type: 'checklist',
      completedItems,
      score,
      totalItems,
      completedCount
    });
  };

  const isAllCompleted = finalItems.every(item => completedItems[item.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start gap-3">
          <FaListUl className="text-purple-600 text-2xl mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {step.title || t('checklist.title') || 'Checklist'}
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

      {/* Checklist Items */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">
          {t('checklist.check_items') || 'Check the items that apply:'}
        </h4>
        
        {finalItems.map((item, index) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              completedItems[item.id]
                ? 'border-green-500 bg-green-900/20'
                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
            }`}
            onClick={() => handleItemToggle(item.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                completedItems[item.id]
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-400 hover:border-green-400'
              }`}>
                {completedItems[item.id] && <FaCheckCircle className="text-sm" />}
              </div>
              
              <div className="flex-1">
                <p className="text-white">
                  {item.text}
                </p>
                {item.xp && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-yellow-400 text-sm font-medium">
                      +{item.xp} XP
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
            {t('checklist.progress') || 'Progress'}
          </span>
          <span className="text-white font-semibold">
            {Object.values(completedItems).filter(Boolean).length} / {finalItems.length}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(Object.values(completedItems).filter(Boolean).length / finalItems.length) * 100}%`
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
          : (t('checklist.complete_all_items') || 'Check all items to continue')
        }
      </button>
    </div>
  );
};

export default ChecklistStep; 