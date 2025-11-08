import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaFire, FaTrophy, FaStar, FaClock, FaChartLine, FaLock, FaCheckCircle, FaCircle, FaCalculator, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { GiTwoCoins } from 'react-icons/gi';
// Import par défaut au lieu d'import nommé
import AchievementShareButton from '../quest/AchievementShareButton';
import { updateStreakWithProtection } from '../../utils/streakProtection';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalQuestDetail } from '../../hooks/useLocalQuests';
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { logQuestEvent, trackEvent } from '../../utils/analytics';
import ProgressBar from '../quest/ProgressBar';
import LoadingSpinner from '../app/LoadingSpinner';
import AppBackground from '../app/AppBackground';
import { QuizStep, ActionChallenge, ChallengeStep, InteractiveChallenge } from '../features';
import SimpleActionStep from '../features/SimpleActionStep';
import ChecklistStep from '../features/ChecklistStep';
import posthog from 'posthog-js';
import { usePaywall } from '../../hooks/usePaywall';
import PaywallModal from '../app/PaywallModal';
import { completeDailyChallenge, getUserDailyChallenge } from '../../services/dailyChallenge';
import { ImpactPromptModal, AddSavingsModal } from '../impact';
import { annualizeImpact, formatEUR } from '../../utils/impact';
import { updateGamificationOnQuestComplete } from '../../services/gamification';
import { allQuests } from '../../data/quests';

// Import des illustrations pour les catégories
import budgetIcon from '../../assets/budget.png';
import epargneIcon from '../../assets/epargne.png';
import creditIcon from '../../assets/dettes.png';
import investissementIcon from '../../assets/investissement.png';
import impotsIcon from '../../assets/impots.png';
import protectionIcon from '../../assets/protection.png';

// Category and difficulty config (aligné avec QuestCard)
const categoryConfig = {
  budgeting: { 
    gradient: 'from-cyan-400 via-sky-400 to-teal-400',
    neonGlow: 'shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    illustration: budgetIcon
  },
  savings: { 
    gradient: 'from-green-400 via-lime-400 to-emerald-400',
    neonGlow: 'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
    color: 'text-green-300',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    illustration: epargneIcon
  },
  saving: { // Fallback pour compatibilité
    gradient: 'from-green-400 via-lime-400 to-emerald-400',
    neonGlow: 'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
    color: 'text-green-300',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    illustration: epargneIcon
  },
  debts: { 
    gradient: 'from-red-400 via-rose-400 to-pink-400',
    neonGlow: 'shadow-[0_0_20px_rgba(248,113,113,0.3)]',
    color: 'text-red-300',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    illustration: creditIcon
  },
  credit: { // Fallback pour compatibilité
    gradient: 'from-red-400 via-rose-400 to-pink-400',
    neonGlow: 'shadow-[0_0_20px_rgba(248,113,113,0.3)]',
    color: 'text-red-300',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    illustration: creditIcon
  },
  investing: { 
    gradient: 'from-blue-400 via-indigo-400 to-purple-400',
    neonGlow: 'shadow-[0_0_20px_rgba(96,165,250,0.3)]',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    illustration: investissementIcon
  },
  taxes: { 
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
    neonGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    illustration: impotsIcon
  },
  planning: { 
    gradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
    neonGlow: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]',
    color: 'text-pink-300',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/30',
    illustration: protectionIcon
  },
  protect: { // Fallback pour compatibilité
    gradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
    neonGlow: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]',
    color: 'text-pink-300',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/30',
    illustration: protectionIcon
  }
};

const difficultyConfig = {
  beginner: { 
    label: 'Facile', 
    color: 'text-emerald-300',
    bgStyle: 'bg-emerald-500/20 border border-emerald-500/30',
    textColor: 'text-emerald-300',
    gradient: 'from-emerald-400 to-green-400'
  },
  intermediate: { 
    label: 'Moyen', 
    color: 'text-amber-300',
    bgStyle: 'bg-amber-500/20 border border-amber-500/30',
    textColor: 'text-amber-300',
    gradient: 'from-amber-400 to-orange-400'
  },
  advanced: { 
    label: 'Difficile', 
    color: 'text-red-300',
    bgStyle: 'bg-red-500/20 border border-red-500/30',
    textColor: 'text-red-300',
    gradient: 'from-red-400 to-rose-400'
  }
};

const QuestDetail = () => {
  const { id: questId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, currentLang } = useLanguage();
  const { user } = useAuth();
  
  // Use the new local quest detail hook
  const { quest, loading: questLoading, error: questError } = useLocalQuestDetail(questId);
  
  // State
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepAnswers, setStepAnswers] = useState({});
  const [userProgress, setUserProgress] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [animatingProgress, setAnimatingProgress] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [answer, setAnswer] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showImpactPrompt, setShowImpactPrompt] = useState(false);
  const [showAddSavingsModal, setShowAddSavingsModal] = useState(false);
  const [savingsInitialValues, setSavingsInitialValues] = useState(null);

  // Utiliser le hook usePaywall
  const { show: shouldShowPaywall, variant } = usePaywall(quest);

  // Calculer le nombre total de questions
  const totalQuestions = quest?.steps?.filter(step => 
    step.type === 'quiz' || step.type === 'multiple_choice' || step.isMultipleChoice
  ).length || 0;

  // Load quest data
  useEffect(() => {
    const loadQuest = async () => {
      try {
        setLoading(true);
        
        // Détecter le contexte d'où vient l'utilisateur
        const searchParams = new URLSearchParams(location.search);
        const fromStarterPack = searchParams.get('from') === 'starter-pack';
        
        console.log('🔍 QuestDetail context debug:', {
          questId,
          userId: user?.uid,
          fromStarterPack,
          searchParams: location.search,
          starterPackQuests: user?.starterPackQuests,
          isStarterPackQuest: user?.starterPackQuests?.includes(questId)
        });
        
        if (questError) {
          toast.error(t('errors.quest_not_found') || 'Quest not found');
          navigate('/quests');
          return;
        }

        if (!quest) {
          return; // Wait for quest to load
        }

        // Ensure quest has steps
        if (!quest.steps || quest.steps.length === 0) {
          console.error('Quest has no steps:', questId);
          toast.error('Quest data is incomplete');
          navigate('/quests');
          return;
        }
        
        if (user) {
          await loadUserProgress();
          await checkPremiumStatus();
        }
        
        // Capture PostHog quest_start event
        posthog.capture('quest_start', {
          quest_id: questId,
          category: quest.category
        });
        
        logQuestEvent('quest_view', { questId });
      } catch (error) {
        console.error('Error loading quest:', error);
        toast.error(t('errors.quest_load_failed') || 'Failed to load quest');
      } finally {
        setLoading(false);
      }
    };

    loadQuest();
  }, [quest, questError, questId, user, navigate, t]);

  const loadUserProgress = async () => {
    if (!user) return;
    
    try {
      const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        const progress = progressSnap.data();
        setUserProgress(progress);
        setCurrentStep(progress.currentStep || 0);
        setStepAnswers(progress.stepAnswers || {});
        setQuestCompleted(progress.status === 'completed');
        if (progress.finalScore !== undefined) {
          setFinalScore(progress.finalScore);
        }
      } else {
        // Create initial progress
        const initialProgress = {
          userId: user.uid,
          questId: questId,
          status: 'active',
          currentStep: 0,
          progress: 0,
          startedAt: new Date().toISOString(),
          stepAnswers: {}
        };
        await setDoc(progressRef, initialProgress);
        setUserProgress(initialProgress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      // Continue without saved progress
      setUserProgress({
        currentStep: 0,
        progress: 0,
        stepAnswers: {}
      });
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setIsPremium(userSnap.data().isPremium || false);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  // Calculer le score basé sur les réponses
  const calculateScore = () => {
    if (!quest.steps || quest.steps.length === 0) return 100;
    
    let correctAnswers = 0;
    let totalQuestions = 0;
    
    quest.steps.forEach((step, index) => {
      // Only count steps that have correct/incorrect answers (quiz, multiple_choice)
      if (step.type === 'quiz' || step.type === 'multiple_choice' || step.isMultipleChoice) {
        totalQuestions++;
        const stepData = stepAnswers[index];
        if (stepData && stepData.correct) {
          correctAnswers++;
        }
      }
    });
    
    // Si aucune question scorable, retourner 100
    if (totalQuestions === 0) return 100;
    
    // Calculer le pourcentage
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const handleStepComplete = async (stepData) => {
    try {
      setAnimatingProgress(true);
      
      const newStepAnswers = {
        ...stepAnswers,
        [currentStep]: stepData
      };
      setStepAnswers(newStepAnswers);

      const newProgress = ((currentStep + 1) / quest.steps.length) * 100;
      
      // Update Firebase
      if (user) {
        const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
        await updateDoc(progressRef, {
          currentStep: currentStep + 1,
          progress: newProgress,
          stepAnswers: newStepAnswers,
          lastUpdated: new Date().toISOString()
        });
      }

      // Check if quest is complete
      if (currentStep + 1 >= quest.steps.length) {
        // Délai pour permettre à l'utilisateur de voir le résultat final
        setTimeout(() => completeQuest(newStepAnswers), 1500);
      } else {
        // Move to next step après un court délai
        setTimeout(() => {
          setCurrentStep(currentStep + 1);
          setAnimatingProgress(false);
          // Reset answer pour reflection steps
          setAnswer('');
          toast.success(
            t('quest_detail.step_completed') || 'Step completed!',
            { icon: '✨' }
          );
        }, 300);
      }
      
      logQuestEvent('step_complete', {
        questId,
        stepIndex: currentStep,
        progress: newProgress
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error(t('errors.save_progress_failed') || 'Failed to save progress');
      setAnimatingProgress(false);
    }
  };

  const completeQuest = async (allStepAnswers) => {
    try {
      // Calculer le score final avec toutes les réponses
      const score = calculateScoreFromAnswers(allStepAnswers);
      setFinalScore(score);
      
      setShowConfetti(true);
      setQuestCompleted(true);
      
      if (user) {
        // Update quest status
        const progressRef = doc(db, 'userQuests', `${user.uid}_${questId}`);
        await updateDoc(progressRef, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          progress: 100,
          finalScore: score
        });

        // Update user stats
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const newXP = (userData.xp || 0) + quest.xp;
          const completedQuests = (userData.completedQuests || 0) + 1;
          
          // Update user data with streak protection
          const streakUpdate = await updateStreakWithProtection(
            user.uid, 
            (userData.currentStreak || 0) + 1, 
            'quest_completion'
          );
          
          await updateDoc(userRef, {
            xp: newXP,
            completedQuests: completedQuests,
            lastActivityAt: new Date().toISOString(),
            ...(streakUpdate.success && { currentStreak: streakUpdate.appliedValue })
          });
        }

        // Si la quête complétée est celle du défi quotidien, marquer le défi comme terminé
        try {
          const todayChallenge = await getUserDailyChallenge(user.uid);
          if (todayChallenge && todayChallenge.questId === questId && todayChallenge.status !== 'completed') {
            await completeDailyChallenge(user.uid, todayChallenge.id, {
              completed: true,
              score: score,
              duration: null,
              streakMaintained: true,
              category: quest?.category
            });
            
            // Track daily challenge completion
            logQuestEvent('daily_challenge_completed', {
              quest_id: questId,
              quest_title: quest?.title || quest?.description,
              score,
              category: quest?.category,
            });
          }
        } catch (err) {
          console.warn('Daily challenge completion skipped or failed:', err);
        }

        // Mettre à jour la gamification (Étape 9)
        try {
          // Récupérer toutes les quêtes complétées pour le contexte
          const userQuestsRef = collection(db, 'userQuests');
          const userQuestsQuery = query(userQuestsRef, where('userId', '==', user.uid));
          const userQuestsSnap = await getDocs(userQuestsQuery);
          
          const userProgressMap = {};
          userQuestsSnap.forEach(doc => {
            const data = doc.data();
            if (data.status === 'completed') {
              userProgressMap[data.questId] = { completed: true };
            }
          });

          // Appeler updateGamificationOnQuestComplete
          await updateGamificationOnQuestComplete(user.uid, {
            quest,
            score,
            userProgress: userProgressMap,
            allQuests,
          });
        } catch (err) {
          console.warn('Gamification update skipped or failed:', err);
          // Ne pas bloquer la completion si la gamification échoue
        }
      }
      
      toast.success(
        t('quest_detail.quest_completed') || 'Quest completed!',
        { icon: '🏆' }
      );
      
      // Capture PostHog quest_complete event
      posthog.capture('quest_complete', {
        quest_id: questId,
        xp_gained: quest.xp
      });
      
      logQuestEvent('quest_complete', {
        questId,
        has_impact: !!quest?.estimatedImpact,
        xp: quest.xp,
        score
      });

      // Variante B : Vérifier si on doit afficher le paywall après 3 quêtes
      if (variant === 'B_after_3' && !user?.isPremium) {
        const updatedCompletedQuests = (user?.completedQuests || 0) + 1;
        console.log('Checking Paywall B after quest completion:', {
          completedQuests: updatedCompletedQuests,
          shouldShow: updatedCompletedQuests >= 3,
          variant
        });
        
        if (updatedCompletedQuests >= 3) {
          console.log('🎯 PAYWALL B TRIGGERED after quest completion');
          
          // Attendre un peu pour laisser le temps à l'utilisateur de voir la completion
          setTimeout(() => {
            setShowPaywall(true);
          }, 2000);
        }
      }

      // Afficher le prompt Impact si la quête a un estimatedImpact
      if (quest?.estimatedImpact && quest.estimatedImpact.amount > 0) {
        console.log('🎯 Quest has estimatedImpact, showing prompt', quest.estimatedImpact);
        
        // Track analytics
        trackEvent('impact_add_prompt_shown', {
          quest_id: questId,
          source: 'quest',
          amount: quest.estimatedImpact.amount,
          period: quest.estimatedImpact.period,
        });

        // Attendre un peu pour laisser le temps à l'utilisateur de voir la completion
        setTimeout(() => {
          setShowImpactPrompt(true);
        }, 3000); // 3s après la completion pour laisser voir confetti
      }

    } catch (error) {
      console.error('Error completing quest:', error);
      toast.error(t('errors.complete_quest_failed') || 'Failed to complete quest');
    }
  };

  // Handlers pour le prompt Impact
  const handleImpactPromptConfirm = () => {
    // Fermer le prompt
    setShowImpactPrompt(false);
    
    // Préparer les valeurs initiales pour AddSavingsModal
    const questTitle = typeof quest.title === 'object' ? quest.title[currentLang] : quest.title;
    const initialValues = {
      title: questTitle || t('quest.impact_added_from_quest'),
      amount: quest.estimatedImpact.amount,
      period: quest.estimatedImpact.period,
      note: t('quest.impact_added_note', { title: questTitle }),
      source: 'quest',
      questId: questId,
    };
    
    setSavingsInitialValues(initialValues);
    
    // Ouvrir la modal AddSavings
    setShowAddSavingsModal(true);
  };

  const handleAddSavingsSuccess = () => {
    // Fermer la modal
    setShowAddSavingsModal(false);
    
    // Réinitialiser les valeurs
    setSavingsInitialValues(null);
    
    // Toast de succès
    toast.success(
      t('impact.modal.success') || 'Savings added successfully!',
      { icon: '💰' }
    );
  };

  // Fonction helper pour calculer le score à partir des réponses
  const calculateScoreFromAnswers = (answers) => {
    if (!quest.steps || quest.steps.length === 0) return 100;
    
    let correctAnswers = 0;
    let totalQuestions = 0;
    
    quest.steps.forEach((step, index) => {
      if (step.type === 'quiz' || step.type === 'multiple_choice' || step.isMultipleChoice) {
        totalQuestions++;
        const stepData = answers[index];
        if (stepData && stepData.correct) {
          correctAnswers++;
        }
      }
    });
    
    if (totalQuestions === 0) return 100;
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  // Check premium access avec variantes A/B
  console.log('QuestDetail Paywall Check:', {
    loading,
    shouldShowPaywall,
    quest: quest ? { id: quest.id, isPremium: quest.isPremium } : null,
    variant,
    user: user ? { isPremium: user.isPremium, completedQuests: user.completedQuests } : null
  });

  // Variante A : Paywall immédiat sur quête premium
  if (!loading && shouldShowPaywall && quest && variant === 'A_direct') {
    console.log('🎯 PAYWALL A TRIGGERED:', { variant, questId: quest.id });
    
    // Capture l'événement d'ouverture du paywall
    posthog.capture('checkout_start', { 
      variant, 
      quest_id: quest.id 
    });
    
    return (
      <PaywallModal 
        quest={quest} 
        variant={variant} 
        onClose={() => setShowPaywall(false)} 
      />
    );
  }

  // Variante B : Paywall après completion de quête
  if (showPaywall && variant === 'B_after_3' && quest) {
    console.log('🎯 PAYWALL B DISPLAYED:', { variant, questId: quest.id });
    
    // Capture l'événement d'ouverture du paywall
    posthog.capture('checkout_start', { 
      variant, 
      quest_id: quest.id 
    });
    
    return (
      <PaywallModal 
        quest={quest} 
        variant={variant} 
        onClose={() => setShowPaywall(false)} 
      />
    );
  }

  // Fallback pour l'ancien système premium
  if (!loading && quest?.isPremium && !isPremium && user && !shouldShowPaywall) {
    return (
      <AppBackground variant="finance" grain grid={false} animate>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="neon-card rounded-2xl p-8 text-center max-w-md">
            <FaLock className="text-5xl text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              {t('premium.quest_locked') || 'Premium Quest'}
            </h2>
            <p className="text-gray-400 mb-6">
              {t('premium.unlock_quest') || 'Unlock this quest with FinanceQuest Premium'}
            </p>
            <Link
              to="/premium"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-bold hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {t('dashboard.upgrade_now') || 'Upgrade Now'}
            </Link>
            <button
              onClick={() => navigate('/quests')}
              className="mt-4 text-gray-400 hover:text-white transition-colors block mx-auto"
            >
              {t('quest_detail.back_to_quests') || 'Back to Quests'}
            </button>
          </div>
        </div>
      </AppBackground>
    );
  }

  if (loading || !quest) {
    return (
      <AppBackground variant="finance" grain grid={false} animate>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      </AppBackground>
    );
  }

  // Calculer la progression basée sur les étapes complétées
  const progress = quest.steps && quest.steps.length > 0 
    ? (currentStep / quest.steps.length) * 100 
    : 0;
    
  // Calculer le score actuel basé sur les réponses
  const currentScore = calculateScore();
  const currentStepData = quest.steps[currentStep] || {};
  
  // Config catégorie et difficulté (aligné avec QuestCard)
  const category = categoryConfig[quest.category] || categoryConfig.budgeting;
  const difficulty = difficultyConfig[quest.difficulty] || difficultyConfig.beginner;
  const locale = currentLang === 'fr' ? 'fr-FR' : 'en-US';
  
  // Impact estimé annualisé pour le badge
  const estimatedAnnual = quest.estimatedImpact ? annualizeImpact(quest.estimatedImpact) : null;
  const formattedImpact = estimatedAnnual ? formatEUR(locale, estimatedAnnual) : null;
  
  // Gradient de fond selon la catégorie (aligné avec QuestCard)
  const getCategoryGradient = () => {
    const categoryKey = quest.category;
    if (categoryKey === 'budgeting') {
      return 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(13, 148, 136, 0.08) 100%)';
    } else if (categoryKey === 'saving' || categoryKey === 'savings') {
      return 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(101, 163, 13, 0.08) 100%)';
    } else if (categoryKey === 'credit' || categoryKey === 'debts') {
      return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(244, 63, 94, 0.08) 100%)';
    } else if (categoryKey === 'investing') {
      return 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.08) 100%)';
    } else if (categoryKey === 'taxes') {
      return 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)';
    } else if (categoryKey === 'protect' || categoryKey === 'planning') {
      return 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.08) 100%)';
    }
    return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.08) 100%)';
  };

  const renderStep = () => {
    if (!currentStepData) return null;

    switch (currentStepData.type) {
      case 'info':
        return (
          <div>
            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-gray-300 whitespace-pre-wrap">{currentStepData.content}</p>
            </div>
            <motion.button
              onClick={() => handleStepComplete({ read: true })}
              className="group relative overflow-hidden w-full sm:w-auto min-w-[180px] min-h-[56px] py-4 px-6 rounded-[32px] font-bold text-lg sm:text-xl tracking-tight text-gray-900 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 backdrop-blur-xs border border-amber-400/40 shadow-glow-md hover:shadow-glow-lg transition-all flex items-center justify-center gap-2 will-change-transform"
              whileHover={{ scale: 1.02, y: -1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
              whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
            >
              <span className="pointer-events-none absolute -inset-[1px] rounded-[18px] opacity-30 group-hover:opacity-50 blur-[2px] transition-opacity bg-gradient-to-r from-amber-400/60 via-amber-300/60 to-orange-400/60" />
              <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)' }} />
              <span className="relative z-10 flex items-center gap-2 font-sans tracking-tight">
                {t('ui.continue') || 'Continue'}
              </span>
            </motion.button>
          </div>
        );

      case 'quiz':
      case 'multiple_choice':
        // Utiliser le même composant QuizStep pour les deux types
        return (
          <QuizStep 
            step={currentStepData}
            onComplete={handleStepComplete}
            questProgress={{
              correctStreak: userProgress?.correctStreak || 0
            }}
          />
        );

      case 'checklist':
        return (
          <ChecklistStep
            step={currentStepData}
            onComplete={handleStepComplete}
            language={currentLang}
          />
        );

      case 'action':
        // ActionChallenge uniquement à la fin de la quête
        if (currentStep === quest.steps.length - 1) {
          return (
            <ActionChallenge
              step={currentStepData}
              onComplete={handleStepComplete}
              language={currentLang}
            />
          );
        } else {
          // Pour les étapes d'action intermédiaires, utiliser un composant simple
          return (
            <SimpleActionStep
              step={currentStepData}
              onComplete={handleStepComplete}
              language={currentLang}
            />
          );
        }

      case 'interactive_challenge':
        return (
          <InteractiveChallenge
            step={currentStepData}
            onComplete={handleStepComplete}
          />
        );

      case 'challenge':
        return (
          <ChallengeStep
            step={currentStepData}
            onComplete={handleStepComplete}
          />
        );

      case 'reflection':
        return (
          <div>
            <div className="mb-6">
              <p className="text-lg text-gray-300 mb-4">{currentStepData.prompt}</p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t('quest_detail.your_thoughts') || 'Share your thoughts...'}
                rows={6}
                minLength={currentStepData.minLength || 50}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
              <p className="text-sm text-gray-500 mt-2">
                {answer.length} / {currentStepData.minLength || 50} {t('ui.characters') || 'characters'}
              </p>
            </div>
            
            <motion.button
              onClick={() => handleStepComplete({ reflection: answer })}
              disabled={answer.length < (currentStepData.minLength || 50)}
              className="group relative overflow-hidden w-full sm:w-auto min-w-[180px] min-h-[56px] py-4 px-6 rounded-[32px] font-bold text-lg sm:text-xl tracking-tight text-gray-900 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 backdrop-blur-xs border border-amber-400/40 shadow-glow-md hover:shadow-glow-lg transition-all flex items-center justify-center gap-2 will-change-transform disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={answer.length >= (currentStepData.minLength || 50) ? { scale: 1.02, y: -1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } } : {}}
              whileTap={answer.length >= (currentStepData.minLength || 50) ? { scale: 0.98, transition: { duration: 0.1 } } : {}}
            >
              {answer.length >= (currentStepData.minLength || 50) && (
                <>
                  <span className="pointer-events-none absolute -inset-[1px] rounded-[18px] opacity-30 group-hover:opacity-50 blur-[2px] transition-opacity bg-gradient-to-r from-amber-400/60 via-amber-300/60 to-orange-400/60" />
                  <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)' }} />
                </>
              )}
              <span className="relative z-10 flex items-center gap-2 font-sans tracking-tight">
                {t('ui.submit') || 'Submit'}
              </span>
            </motion.button>
          </div>
        );

      case 'interactive':
        return (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {typeof currentStepData.title === 'string' ? currentStepData.title : 'Interactive Step'}
            </h3>
            <p className="text-gray-400 mb-6">
              {currentStepData.instruction}
            </p>
            <div className="bg-gray-700 rounded-lg p-8 text-center">
              <FaCalculator className="text-6xl text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-300">
                {t('quest_detail.interactive_placeholder') || 'Interactive calculator would appear here'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t('quest_detail.interactive_instruction') || 'For now, imagine you\'ve calculated your budget using the 50/30/20 rule'}
              </p>
            </div>
            <motion.button
              onClick={() => handleStepComplete({ completed: true })}
              className="mt-6 group relative overflow-hidden w-full sm:w-auto min-w-[180px] min-h-[56px] py-4 px-6 rounded-[32px] font-bold text-lg sm:text-xl tracking-tight text-gray-900 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 backdrop-blur-xs border border-amber-400/40 shadow-glow-md hover:shadow-glow-lg transition-all flex items-center justify-center gap-2 will-change-transform"
              whileHover={{ scale: 1.02, y: -1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
              whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
            >
              <span className="pointer-events-none absolute -inset-[1px] rounded-[18px] opacity-30 group-hover:opacity-50 blur-[2px] transition-opacity bg-gradient-to-r from-amber-400/60 via-amber-300/60 to-orange-400/60" />
              <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)' }} />
              <span className="relative z-10 flex items-center gap-2 font-sans tracking-tight">
                {t('ui.continue') || 'Continue'}
              </span>
            </motion.button>
          </div>
        );

      default:
        console.warn('Unknown step type:', currentStepData.type);
        return (
          <div className="text-center py-8">
            <p className="text-gray-400">Unknown step type: {currentStepData.type}</p>
            <motion.button
              onClick={() => handleStepComplete({ completed: true })}
              className="mt-4 group relative overflow-hidden w-full sm:w-auto min-w-[180px] min-h-[56px] py-4 px-6 rounded-[32px] font-bold text-lg sm:text-xl tracking-tight text-gray-900 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 backdrop-blur-xs border border-amber-400/40 shadow-glow-md hover:shadow-glow-lg transition-all flex items-center justify-center gap-2 will-change-transform"
              whileHover={{ scale: 1.02, y: -1, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
              whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
            >
              <span className="pointer-events-none absolute -inset-[1px] rounded-[18px] opacity-30 group-hover:opacity-50 blur-[2px] transition-opacity bg-gradient-to-r from-amber-400/60 via-amber-300/60 to-orange-400/60" />
              <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)' }} />
              <span className="relative z-10 flex items-center gap-2 font-sans tracking-tight">
                {t('ui.continue') || 'Continue'}
              </span>
            </motion.button>
          </div>
        );
    }
  };

  return (
    <AppBackground variant="finance" grain grid={false} animate>
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} gravity={0.3} />}
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl pb-[calc(env(safe-area-inset-bottom)+88px)]">
        {/* Back button */}
        <button
          onClick={() => navigate('/quests')}
          className="flex items-center gap-2 text-gray-400 hover:text-amber-400 mb-6 transition-colors group font-medium"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          {t('quest_detail.back_to_quests') || 'Back to Quests'}
        </button>

        {/* Quest header */}
        <div 
          className="neon-card rounded-2xl p-6 mb-6 animate-fadeIn relative overflow-hidden backdrop-blur-sm"
          style={{ background: getCategoryGradient() }}
        >
          <div className="relative z-10">
            {/* Image + Badges (aligné avec QuestCard) */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Image de catégorie */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <img 
                    src={category.illustration} 
                    alt={quest.category}
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
                  />
                </div>

                {/* Badges d'état */}
                {quest.isPremium && (
                  <div
                    className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border-2 border-purple-500/50 text-xs sm:text-sm font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-2"
                    style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, letterSpacing: '0.05em' }}
                  >
                    <FaCrown className="text-xs sm:text-sm" />
                    PRO
                  </div>
                )}

                {/* Badge Difficulté */}
                <div 
                  className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider ${difficulty.bgStyle} ${difficulty.textColor}`}
                  style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, letterSpacing: '0.05em' }}
                >
                  {difficulty.label}
                </div>

                {/* Badge Impact estimé */}
                {formattedImpact && (
                  <div className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500/25 to-orange-500/25 border-2 border-amber-500/40 text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <FaChartLine className="text-xs sm:text-sm" />
                    {formattedImpact.replace('+', '')}
                  </div>
                )}
              </div>
            </div>

            {/* Titre & Description (aligné avec QuestCard) */}
            <h1 
              className="text-white font-extrabold text-[22px] sm:text-2xl lg:text-3xl mb-3 line-clamp-2 leading-tight"
              style={{ fontFamily: '"Inter", "Helvetica Neue", sans-serif', fontWeight: 900, letterSpacing: '-0.03em' }}
            >
              {quest.title}
            </h1>
            <p 
              className="text-gray-200 text-[15px] sm:text-base lg:text-lg line-clamp-3 leading-relaxed mb-4"
              style={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, letterSpacing: '0.005em', lineHeight: '1.6' }}
            >
              {quest.description}
            </p>
            
            {/* Quest objectives */}
            {quest.objectives && quest.objectives.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  {t('quest_detail.objectives') || 'Learning Objectives:'}
                </h3>
                <ul className="space-y-1">
                  {quest.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                      <FaStar className="text-yellow-400 mt-0.5 text-xs flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quest stats */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-center px-4 py-2.5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl border border-amber-500/20 shadow-lg shadow-amber-500/5 min-w-[80px]">
                <FaStar className="text-xl text-amber-400 mx-auto mb-1" />
                <p className="text-base font-semibold text-white">{quest.xp}</p>
                <p className="text-xs text-gray-400">{t('ui.xp') || 'XP'}</p>
              </div>
              <div className="text-center px-4 py-2.5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl border border-cyan-500/20 shadow-lg shadow-cyan-500/5 min-w-[80px]">
                <FaClock className="text-xl text-cyan-400 mx-auto mb-1" />
                <p className="text-base font-semibold text-white">~{quest.duration || 15}</p>
                <p className="text-xs text-gray-400">{t('ui.minutes') || 'min'}</p>
              </div>
            </div>
          
            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{t('quest_detail.progress') || 'Progress'}</span>
              <span className="font-medium text-white">{Math.round(progress)}%</span>
            </div>
            <ProgressBar 
              progress={progress} 
              showPercentage={false} 
              color="gradient"
              animated={animatingProgress}
              className="h-3"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('quest_detail.steps.step', { 
                current: currentStep + (questCompleted ? 0 : 1), 
                total: quest.steps.length 
              }) || `Step ${currentStep + (questCompleted ? 0 : 1)} of ${quest.steps.length}`}</span>
              <div className="flex items-center gap-4">
                {userProgress?.currentStreak > 0 && (
                  <span className="flex items-center gap-1">
                    <FaFire className="text-orange-500" />
                    {userProgress.currentStreak} {t('ui.day_streak') || 'day streak'}
                  </span>
                )}
                {currentScore !== null && totalQuestions > 0 && (
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    {currentScore}% {t('ui.score') || 'Score'}
                  </span>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Quest content */}
        {!questCompleted ? (
          <div 
            className="neon-card rounded-2xl p-6 animate-fadeIn backdrop-blur-sm"
            style={{ background: getCategoryGradient() }}
          >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {(typeof currentStepData.title === 'string' ? currentStepData.title : null) || t('quest_detail.step_title', { step: currentStep + 1 }) || `Step ${currentStep + 1}`}
                </h2>
                <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
                  {currentStepData.type === 'multiple_choice' || currentStepData.isMultipleChoice ? t('quiz.multiple_choice') || 'Multiple Choice' :
                   currentStepData.type === 'quiz' ? t('quiz.question') || 'Question' :
                   currentStepData.type ? currentStepData.type.charAt(0).toUpperCase() + currentStepData.type.slice(1) : 'Quiz'}
                </span>
              </div>
            </div>

            <div className={animatingProgress ? 'opacity-0 transition-opacity' : 'opacity-100 transition-opacity'}>
              {renderStep()}
            </div>
          </div>
        ) : (
          // Quest complete screen
          <div 
            className="neon-card rounded-2xl p-8 text-center animate-fadeIn backdrop-blur-sm"
            style={{ background: getCategoryGradient() }}
          >
            <div className="mb-6">
              <div className="relative inline-block">
                <FaTrophy className="text-6xl text-yellow-400 animate-bounce" />
                <div className="absolute -top-2 -right-2">
                  <span className="flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-yellow-500"></span>
                  </span>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              {t('quest_detail.congratulations') || 'Congratulations!'}
            </h2>
            <p className="text-xl text-gray-400 mb-6">
              {t('quest_detail.quest_complete_msg') || "You've mastered this quest!"}
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
              <div className="bg-gray-700 rounded-lg px-6 py-3">
                <p className="text-sm text-gray-400">{t('ui.xp_earned') || 'XP Earned'}</p>
                <p className="text-2xl font-bold text-blue-400">+{quest?.xp || 0}</p>
              </div>
              {finalScore !== null && (
                <div className="bg-gray-700 rounded-lg px-6 py-3">
                  <p className="text-sm text-gray-400">{t('ui.score') || 'Score'}</p>
                  <p className="text-2xl font-bold text-green-400">{finalScore}%</p>
                </div>
              )}
            </div>

            {/* Single CTA: Share Achievement */}
            <div className="flex flex-col items-center gap-4 mb-6">
              {user && quest && (
                <AchievementShareButton
                  quest={quest}
                  userData={{
                    ...user,
                    level: user.level || 'Novice',
                    streak: userProgress?.currentStreak || 0,
                    completedQuests: user.completedQuests || 0
                  }}
                  score={finalScore || calculateScore()}
                  language={currentLang}
                  className="text-lg"
                  showBonus={true}
                  onShareComplete={(result) => {
                    console.log('Achievement shared:', result);
                    if (result.success) {
                      // Optionally update UI or stats after share
                    }
                  }}
                />
              )}
              
              {(() => {
                // Détecter le contexte d'où vient l'utilisateur
                const searchParams = new URLSearchParams(location.search);
                const fromStarterPack = searchParams.get('from') === 'starter-pack';
                const redirectTo = fromStarterPack ? "/starter-pack" : "/quests";
                const buttonText = fromStarterPack 
                  ? (t('starterPack.backToStarterPack') || 'Back to Starter Pack')
                  : (t('ui.back_to_quests') || 'Back to Quests');
                
                return (
                  <Link
                    to={redirectTo}
                    className="group relative overflow-hidden min-w-[180px] min-h-[56px] py-4 px-6 rounded-[32px] font-bold text-lg sm:text-xl tracking-tight text-gray-900 bg-gradient-to-r from-gray-800 to-gray-700 text-white border border-white/10 hover:from-gray-700 hover:to-gray-600 shadow-glow-sm hover:shadow-glow-md transition-all flex items-center justify-center gap-2 will-change-transform"
                    onClick={() => {
                      console.log('🔍 Quest completion redirect debug:', {
                        questId,
                        fromStarterPack,
                        searchParams: location.search,
                        userStarterPackQuests: user?.starterPackQuests,
                        isStarterPackQuest: user?.starterPackQuests?.includes(questId),
                        redirectTo
                      });
                    }}
                  >
                    <span className="pointer-events-none absolute -inset-[1px] rounded-[18px] opacity-30 group-hover:opacity-50 blur-[2px] transition-opacity bg-gradient-to-r from-gray-600/60 via-gray-500/60 to-gray-600/60" />
                    <span className="relative z-10 flex items-center gap-2 font-sans tracking-tight">
                      {buttonText}
                    </span>
                  </Link>
                );
              })()}
            </div>
          </div>
        )}

        {/* Step indicators */}
        {!questCompleted && quest?.steps && quest.steps.length > 1 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            {quest.steps.map((_, index) => (
              <div
                key={index}
                className={`transition-all duration-300 ${
                  index < currentStep 
                    ? 'text-green-400' 
                    : index === currentStep 
                    ? 'text-yellow-400 scale-125' 
                    : 'text-gray-600'
                }`}
              >
                {index < currentStep ? (
                  <FaCheckCircle className="text-sm" />
                ) : (
                  <FaCircle className="text-sm" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Impact Prompt Modal - Affiché après complétion si estimatedImpact existe */}
        {quest && (
          <ImpactPromptModal
            isOpen={showImpactPrompt}
            onClose={() => setShowImpactPrompt(false)}
            onConfirm={handleImpactPromptConfirm}
            quest={quest}
            estimatedImpact={quest.estimatedImpact}
          />
        )}

        {/* Add Savings Modal - Prérempli avec les données de la quête */}
        <AddSavingsModal
          isOpen={showAddSavingsModal}
          onClose={() => {
            setShowAddSavingsModal(false);
            setSavingsInitialValues(null);
          }}
          onSuccess={handleAddSavingsSuccess}
          initialValues={savingsInitialValues}
        />
      </main>
    </AppBackground>
  );
};

export default QuestDetail;