import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaTrophy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { trackEvent } from '../../../utils/analytics';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import AppBackground from '../../app/AppBackground';
import AddSavingsModal from '../../impact/AddSavingsModal';
import QuestCompletion from './QuestCompletion';
import QuestIntro from './QuestIntro';

/**
 * QuestFlowWrapper - Orchestrateur générique pour toutes les quêtes
 * 
 * Props:
 * - questId: string (ex: 'cut-subscription-v1')
 * - questConfig: object (config de la quête depuis data/quests)
 * - coreSteps: array de composants React (les steps spécifiques de la quête)
 * - onStepValidation: function (validation personnalisée par step)
 * - completionConfig: object (config pour QuestCompletion)
 * - showIntro: boolean (afficher la page d'intro, par défaut true)
 */
const QuestFlowWrapper = ({
  questId,
  questConfig = {},
  coreSteps = [],
  onStepValidation = null,
  completionConfig = {},
  impactConfig = {}, // Config pour le modal Impact
  showIntro = true, // Afficher l'intro par défaut
}) => {
  const navigate = useNavigate();
  const { currentLang } = useLanguage();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(showIntro ? -1 : 0); // -1 = intro, 0+ = steps
  const [questData, setQuestData] = useState({});
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Calcul du nombre total de steps (intro + core + completion)
  const introOffset = showIntro ? 1 : 0;
  const totalSteps = introOffset + coreSteps.length + 1; // intro + core + completion
  const isOnIntroStep = showIntro && currentStep === -1;
  const isOnCompletionStep = currentStep === coreSteps.length;

  // Charger la progression sauvegardée
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      
      try {
        const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
        const progressSnap = await getDoc(progressRef);
        
        if (progressSnap.exists()) {
          const data = progressSnap.data();
          const savedStep = data.currentStep || (showIntro ? -1 : 0);
          setCurrentStep(savedStep);
          setQuestData(data.questData || {});
          setIsCompleted(data.status === 'completed');
        }
      } catch (error) {
        console.error('Error loading quest progress:', error);
      }
    };
    
    loadProgress();
  }, [user, questId, showIntro]);

  // Sauvegarder la progression
  const saveProgress = async (step, data) => {
    if (!user) return;
    
    try {
      const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
      await setDoc(progressRef, {
        userId: user.uid,
        questId: questId,
        currentStep: step,
        questData: data,
        status: 'active',
        progress: ((step + 1) / totalSteps) * 100,
        updatedAt: serverTimestamp(),
        startedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Handler pour mettre à jour questData
  const updateQuestData = (newData) => {
    const updated = { ...questData, ...newData };
    setQuestData(updated);
    return updated;
  };

  // Navigation vers l'étape suivante
  const handleNext = async () => {
    // Si on est sur l'intro, juste passer au premier step
    if (isOnIntroStep) {
      const nextStep = 0;
      setCurrentStep(nextStep);
      await saveProgress(nextStep, questData);
      
      trackEvent('quest_intro_completed', {
        quest_id: questId
      });
      return;
    }
    
    // Validation personnalisée si fournie (pour les core steps)
    if (onStepValidation && !isOnIntroStep) {
      const validation = onStepValidation(currentStep, questData, currentLang);
      if (!validation.valid) {
        toast.error(validation.message);
        return;
      }
    }
    
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    await saveProgress(nextStep, questData);
    
    trackEvent('quest_step_completed', {
      quest_id: questId,
      step: currentStep,
      step_name: coreSteps[currentStep]?.id || 'unknown'
    });

    // Si on arrive à la completion, déclencher confetti
    if (nextStep === coreSteps.length) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 300);
    }
  };

  // Navigation vers l'étape précédente
  const handleBack = () => {
    const minStep = showIntro ? -1 : 0;
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/quests');
    }
  };

  // Ouvrir le modal Impact
  const handleAddToImpact = () => {
    setShowImpactModal(true);
    
    trackEvent('impact_add_prompt_shown', {
      quest_id: questId,
      source: 'quest',
      ...questData
    });
  };

  // Success du modal Impact
  const handleImpactModalSuccess = async () => {
    setShowImpactModal(false);
    
    // Marquer la quête comme complétée
    if (user) {
      try {
        const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
        await setDoc(progressRef, {
          userId: user.uid,
          questId: questId,
          status: 'completed',
          progress: 100,
          completedAt: serverTimestamp()
        }, { merge: true });
        
        setIsCompleted(true);
      } catch (error) {
        console.error('Error completing quest:', error);
      }
    }
    
    // Toast de succès
    const annualAmount = questData.monthlyAmount 
      ? (questData.monthlyAmount * 12).toFixed(0)
      : null;
    
    if (annualAmount) {
      toast.success(
        currentLang === 'fr' 
          ? `Économie ajoutée : +${annualAmount}€/an ! 🎉`
          : `Saving added: +€${annualAmount}/yr! 🎉`,
        { icon: '🎉' }
      );
    } else {
      toast.success(
        currentLang === 'fr' ? 'Quête terminée !' : 'Quest completed!',
        { icon: '🎉' }
      );
    }
    
    trackEvent('quest_complete', {
      quest_id: questId,
      xp_gained: questConfig.xp || 120,
      has_impact: !!annualAmount
    });
    
    // Rediriger vers Impact après 2s
    setTimeout(() => {
      navigate('/impact');
    }, 2000);
  };

  // Calculer la progression
  const progressStepCount = currentStep + (showIntro ? 2 : 1); // +1 ou +2 pour compter depuis 0 ou -1
  const progress = (progressStepCount / totalSteps) * 100;

  // Render du step actuel
  const renderCurrentStep = () => {
    // Si on est sur l'intro
    if (isOnIntroStep) {
      return (
        <QuestIntro
          questConfig={questConfig}
          onStart={handleNext}
        />
      );
    }
    
    // Si on est sur la completion
    if (isOnCompletionStep) {
      return (
        <QuestCompletion
          questData={questData}
          xp={questConfig.xp || 120}
          onAddToImpact={handleAddToImpact}
          onViewImpact={() => navigate('/impact')}
          {...completionConfig}
        />
      );
    }

    // Sinon, render le core step
    const StepComponent = coreSteps[currentStep];
    if (!StepComponent) {
      return (
        <div className="text-white text-center">
          <p>Step {currentStep + 1} not configured</p>
        </div>
      );
    }

    // Clone le composant avec les props nécessaires
    return typeof StepComponent === 'function'
      ? <StepComponent 
          questData={questData}
          updateQuestData={updateQuestData}
          onNext={handleNext}
          locale={currentLang}
        />
      : StepComponent;
  };

  // Déterminer si le bouton Next est disabled
  const isNextDisabled = () => {
    // Sur l'intro, toujours enabled
    if (isOnIntroStep) return false;
    
    // Sur les core steps, utiliser la validation
    if (onStepValidation) {
      const validation = onStepValidation(currentStep, questData, currentLang);
      return !validation.valid;
    }
    return false;
  };

  return (
    <AppBackground variant="finance" grain grid={false} animate>
      <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]">
        {/* Header avec progression */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-black/40 border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-4">
            {/* Barre de navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <FaArrowLeft />
                <span className="hidden sm:inline">
                  {currentLang === 'fr' ? 'Retour' : 'Back'}
                </span>
              </button>

              {/* Steps indicator */}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={`
                      w-2 h-2 rounded-full transition-all
                      ${index === currentStep 
                        ? 'bg-amber-400 w-6' 
                        : index < currentStep 
                          ? 'bg-green-400' 
                          : 'bg-white/20'
                      }
                    `}
                  />
                ))}
              </div>

              {/* XP Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <FaTrophy className="text-purple-400" />
                <span className="text-sm font-bold text-purple-300">
                  +{questConfig.xp || 120} XP
                </span>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
              />
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[60vh] flex flex-col items-center justify-center"
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons - Seulement pour les core steps (pas intro, pas completion) */}
          {!isOnIntroStep && !isOnCompletionStep && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mt-8"
            >
              <button
                onClick={handleNext}
                disabled={isNextDisabled()}
                className={`
                  flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all
                  ${!isNextDisabled()
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {currentLang === 'fr' ? 'Continuer' : 'Continue'}
                <FaArrowRight />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal Impact */}
      <AnimatePresence>
        {showImpactModal && (
          <AddSavingsModal
            isOpen={showImpactModal}
            onClose={() => setShowImpactModal(false)}
            onSuccess={handleImpactModalSuccess}
            initialValues={{
              title: typeof impactConfig.title === 'function' 
                ? impactConfig.title(questData)
                : (impactConfig.title || `Quête — ${questId}`),
              amount: questData.monthlyAmount || 0,
              period: impactConfig.period || 'month',
              questId: questId,
              source: 'quest',
              ...impactConfig.initialValues
            }}
          />
        )}
      </AnimatePresence>
    </AppBackground>
  );
};

export default QuestFlowWrapper;

