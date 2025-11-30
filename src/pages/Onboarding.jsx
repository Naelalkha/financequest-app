import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGlobe, FaLanguage, FaChartLine, FaBullseye, FaArrowRight, FaCheck, FaPiggyBank, FaCreditCard, FaChartBar, FaWallet, FaExclamationTriangle, FaRoute } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import AppBackground from '../components/layout/AppBackground';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getStarterPack } from '../utils/starterPack';

const Onboarding = () => {
  const { user, updateUserProfile } = useAuth();
  const { t, i18n } = useTranslation('onboarding');
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    country: user?.country || 'fr-FR',
    lang: user?.lang || i18n.language || 'en',
    goals: [], // budget, saving, credit, investing
    level: '' // novice, intermediate, advanced
  });

  // Rediriger si l'onboarding est déjà complété
  useEffect(() => {
    if (user?.onboardingCompleted) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Options d'objectifs - Alignées sur les 5 catégories de quêtes
  const goalOptions = [
    {
      id: 'budgeting',
      icon: <FaWallet className="text-2xl" />,
      title: t('onboarding.goals.budgeting.title') || 'Master Budgeting',
      description: t('onboarding.goals.budgeting.desc') || 'Track expenses and create a budget'
    },
    {
      id: 'saving',
      icon: <FaPiggyBank className="text-2xl" />,
      title: t('onboarding.goals.saving.title') || 'Build Savings',
      description: t('onboarding.goals.saving.desc') || 'Create an emergency fund and save money'
    },
    {
      id: 'credit',
      icon: <FaExclamationTriangle className="text-2xl" />,
      title: t('onboarding.goals.credit.title') || 'Manage Credit',
      description: t('onboarding.goals.credit.desc') || 'Understand and improve your credit score'
    },
    {
      id: 'investing',
      icon: <FaChartBar className="text-2xl" />,
      title: t('onboarding.goals.investing.title') || 'Start Investing',
      description: t('onboarding.goals.investing.desc') || 'Learn investment basics and strategies'
    },
    {
      id: 'protect',
      icon: <FaRoute className="text-2xl" />,
      title: t('onboarding.goals.protect.title') || 'Protection & Planning',
      description: t('onboarding.goals.protect.desc') || 'Protect your assets and plan your future'
    }
  ];

  // Options de niveau
  const levelOptions = [
    {
      id: 'novice',
      title: t('onboarding.levels.novice.title') || 'Novice',
      description: t('onboarding.levels.novice.desc') || "I'm new to personal finance"
    },
    {
      id: 'intermediate',
      title: t('onboarding.levels.intermediate.title') || 'Intermediate',
      description: t('onboarding.levels.intermediate.desc') || 'I have some financial knowledge'
    },
    {
      id: 'advanced',
      title: t('onboarding.levels.advanced.title') || 'Advanced',
      description: t('onboarding.levels.advanced.desc') || "I'm experienced with finances"
    }
  ];

  const handleCountryChange = (e) => {
    setFormData({ ...formData, country: e.target.value });
  };

  const handleLanguageChange = (lang) => {
    setFormData({ ...formData, lang });
    setCurrentLang(lang); // Mettre à jour immédiatement la langue de l'interface
  };

  const toggleGoal = (goalId) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleLevelSelect = (levelId) => {
    setFormData({ ...formData, level: levelId });
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.country && formData.lang;
    } else if (currentStep === 2) {
      return formData.goals.length > 0 && formData.level;
    }
    return false;
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);
    try {
      // Générer le starter pack de quêtes
      const starterQuestIds = getStarterPack(formData.goals, formData.level, formData.country);

      // Mettre à jour le profil utilisateur
      await updateUserProfile({
        country: formData.country,
        lang: formData.lang,
        goals: formData.goals,
        level: formData.level,
        onboardingCompleted: true,
        starterPackAssigned: true,
        starterPackQuests: starterQuestIds
      });

      console.log('Onboarding completed successfully for user:', user?.uid);
      console.log('Starter pack assigned:', starterQuestIds);
      console.log('User onboardingCompleted status:', user?.onboardingCompleted);

      toast.success(t('onboarding.success') || 'Welcome aboard! Your journey begins now 🚀');

      // Petit délai pour s'assurer que l'état utilisateur est mis à jour
      setTimeout(() => {
        console.log('Redirecting to starter pack...');
        navigate('/starter-pack', { replace: true });
      }, 500);
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(t('onboarding.error') || 'Failed to complete setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner />;
  }

  return (
    <AppBackground variant="finance" className="min-h-screen">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                {t('onboarding.step') || 'Step'} {currentStep} {t('onboarding.of') || 'of'} 2
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {t('onboarding.skip') || 'Skip for now'}
              </button>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / 2) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Country & Language */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4"
                  >
                    <FaGlobe className="text-2xl text-gray-900" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {t('onboarding.welcome.title') || 'Welcome to FinanceQuest!'}
                  </h2>
                  <p className="text-gray-400">
                    {t('onboarding.welcome.subtitle') || "Let's customize your experience"}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Country Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FaGlobe className="inline mr-2" />
                      {t('onboarding.country.label') || 'Your Country'}
                    </label>
                    <select
                      value={formData.country}
                      onChange={handleCountryChange}
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white focus:outline-none focus:border-amber-400/40 transition-colors"
                    >
                      <option value="fr-FR">🇫🇷 France</option>
                      <option value="en-US">🇺🇸 United States</option>
                    </select>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FaLanguage className="inline mr-2" />
                      {t('onboarding.language.label') || 'Preferred Language'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleLanguageChange('en')}
                        className={`px-4 py-3 rounded-lg border transition-all ${formData.lang === 'en'
                          ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                          : 'bg-white/[0.04] border-white/10 text-gray-300 hover:border-white/20'
                          }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLanguageChange('fr')}
                        className={`px-4 py-3 rounded-lg border transition-all ${formData.lang === 'fr'
                          ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                          : 'bg-white/[0.04] border-white/10 text-gray-300 hover:border-white/20'
                          }`}
                      >
                        Français
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-amber-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    {t('onboarding.continue') || 'Continue'}
                    <FaArrowRight />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Goals & Level */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4"
                  >
                    <FaBullseye className="text-2xl text-gray-900" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {t('onboarding.goals.title') || 'What are your financial goals?'}
                  </h2>
                  <p className="text-gray-400">
                    {t('onboarding.goals.subtitle') || 'Select all that apply'}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Goals Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {goalOptions.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={`p-4 rounded-lg border text-left transition-all ${formData.goals.includes(goal.id)
                          ? 'bg-amber-400/20 border-amber-400'
                          : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${formData.goals.includes(goal.id) ? 'text-amber-400' : 'text-gray-400'}`}>
                            {goal.icon}
                          </div>
                          <div>
                            <h3 className={`font-semibold mb-1 ${formData.goals.includes(goal.id) ? 'text-amber-400' : 'text-white'}`}>
                              {goal.title}
                            </h3>
                            <p className="text-sm text-gray-400">{goal.description}</p>
                          </div>
                          {formData.goals.includes(goal.id) && (
                            <FaCheck className="ml-auto text-amber-400 mt-1" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Level Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {t('onboarding.level.title') || 'Your experience level'}
                    </h3>
                    <div className="space-y-2">
                      {levelOptions.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => handleLevelSelect(level.id)}
                          className={`w-full p-4 rounded-lg border text-left transition-all ${formData.level === level.id
                            ? 'bg-amber-400/20 border-amber-400'
                            : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`font-semibold ${formData.level === level.id ? 'text-amber-400' : 'text-white'}`}>
                                {level.title}
                              </h4>
                              <p className="text-sm text-gray-400">{level.description}</p>
                            </div>
                            {formData.level === level.id && (
                              <FaCheck className="text-amber-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {t('ui.back') || 'Back'}
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={!canProceed() || isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-amber-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    {t('onboarding.complete') || 'Start Your Journey'}
                    <FaArrowRight />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppBackground>
  );
};

export default Onboarding;