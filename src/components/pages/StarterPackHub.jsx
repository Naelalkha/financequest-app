import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaLock, FaCheck, FaStar, FaGift, FaRoute } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { toast } from 'react-toastify';
import AppBackground from '../app/AppBackground';
import LoadingSpinner from '../app/LoadingSpinner';
import { allQuests, localizeQuest } from '../../data/quests';

const StarterPackHub = () => {
  const { user } = useAuth();
  const { t, currentLang } = useLanguage();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [starterQuests, setStarterQuests] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [completedCount, setCompletedCount] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    loadStarterPack();
  }, [user, currentLang]);

  const loadStarterPack = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      
      // Récupérer le profil utilisateur pour obtenir les IDs des quêtes du starter pack
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (!userData?.starterPackQuests || userData.starterPackQuests.length === 0) {
        // Si pas de starter pack, rediriger vers les quêtes
        navigate('/quests');
        return;
      }

      // Filtrer pour obtenir les quêtes du starter pack et les localiser
      const starterQuestData = userData.starterPackQuests
        .map(questId => {
          const quest = allQuests.find(q => q.id === questId);
          return quest ? localizeQuest(quest, currentLang) : null;
        })
        .filter(Boolean);
      
      setStarterQuests(starterQuestData);

      // Récupérer la progression de l'utilisateur
      const progressQuery = query(
        collection(db, 'userQuests'),
        where('userId', '==', user.uid)
      );
      const progressSnapshot = await getDocs(progressQuery);
      
      const progress = {};
      let completed = 0;
      
      progressSnapshot.forEach(doc => {
        const data = doc.data();
        progress[data.questId] = data;
        
        // Vérifier si c'est une quête du starter pack et si elle est complétée
        if (userData.starterPackQuests.includes(data.questId) && data.status === 'completed') {
          completed++;
        }
      });
      
      setUserProgress(progress);
      setCompletedCount(completed);
      
      // Si toutes les quêtes sont complétées, afficher l'écran de victoire
      if (completed === userData.starterPackQuests.length) {
        setShowCompletionScreen(true);
      }
      
    } catch (error) {
      console.error('Error loading starter pack:', error);
      toast.error(t('starterPack.loadError') || 'Failed to load starter pack');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestClick = (questId) => {
    // Vérifier si la quête précédente est complétée (progression linéaire)
    const questIndex = starterQuests.findIndex(q => q.id === questId);
    
    if (questIndex > 0) {
      const previousQuest = starterQuests[questIndex - 1];
      if (!userProgress[previousQuest.id]?.status || userProgress[previousQuest.id].status !== 'completed') {
        toast.info(t('starterPack.completePrevious') || 'Please complete the previous quest first');
        return;
      }
    }
    
    // Ajouter le paramètre from=starter-pack pour indiquer le contexte
    navigate(`/quests/${questId}?from=starter-pack`);
  };

  const handleStartTrial = async () => {
    setIsRedirecting(true);
    // Rediriger vers la page premium pour démarrer l'essai
    navigate('/premium');
  };

  const handleExploreFreeQuests = () => {
    setIsRedirecting(true);
    navigate('/quests');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AppBackground />
        <LoadingSpinner />
      </div>
    );
  }

  if (showCompletionScreen) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <AppBackground />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            {/* Confetti animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center"
            >
              <FaTrophy className="text-4xl text-white" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white text-center mb-4">
              {t('starterPack.completion.title') || 'Starter Pack Completed! 🎉'}
            </h1>
            
            <p className="text-white/80 text-center mb-8">
              {t('starterPack.completion.subtitle') || 'You\'ve mastered the basics. Ready to level up your financial journey?'}
            </p>

            {/* Premium upsell card */}
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 mb-6 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FaStar className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {t('starterPack.completion.premiumTitle') || 'Continue Your Journey'}
                  </h3>
                  <p className="text-sm text-white/70">
                    {t('starterPack.completion.premiumSubtitle') || 'Unlock advanced quests & personalized guidance'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-400 text-sm" />
                  <span className="text-white/80 text-sm">
                    {t('starterPack.completion.benefit1') || 'Access to 50+ premium quests'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-400 text-sm" />
                  <span className="text-white/80 text-sm">
                    {t('starterPack.completion.benefit2') || 'Advanced financial strategies'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-400 text-sm" />
                  <span className="text-white/80 text-sm">
                    {t('starterPack.completion.benefit3') || 'Country-specific expert content'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleStartTrial}
                disabled={isRedirecting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl py-3 font-semibold 
                         hover:from-purple-700 hover:to-pink-700 transition-all duration-300 
                         transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-2">
                  <FaGift />
                  <span>{t('starterPack.completion.trialCTA') || 'Start 7-Day Free Trial'}</span>
                </div>
              </button>
            </div>

            {/* Alternative: explore free quests */}
            <button
              onClick={handleExploreFreeQuests}
              disabled={isRedirecting}
              className="w-full text-white/70 hover:text-white text-sm underline transition-colors duration-300 disabled:opacity-50"
            >
              {t('starterPack.completion.exploreFree') || 'Explore free quests instead'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      <AppBackground />
      
      <div className="relative z-10 p-4 max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 mt-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('starterPack.title') || 'Your Starter Pack'}
          </h1>
          <p className="text-white/70">
            {t('starterPack.subtitle') || 'Complete these 3 free quests to begin your financial journey'}
          </p>
          
          {/* Progress indicator */}
          <div className="mt-6 bg-white/10 backdrop-blur-xl rounded-full p-1">
            <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / starterQuests.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
              />
            </div>
            <p className="text-white/70 text-sm mt-2">
              {completedCount}/{starterQuests.length} {t('starterPack.completed') || 'completed'}
            </p>
          </div>
        </motion.div>

        {/* Quest cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {starterQuests.map((quest, index) => {
              const progress = userProgress[quest.id];
              const isCompleted = progress?.status === 'completed';
              const isActive = progress?.status === 'active';
              const isLocked = index > 0 && !userProgress[starterQuests[index - 1].id]?.status;
              
              return (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => !isLocked && handleQuestClick(quest.id)}
                  className={`relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-300 cursor-pointer
                    ${isCompleted ? 'border-green-500/50 bg-green-500/10' : 
                      isActive ? 'border-amber-500/50 bg-amber-500/10' :
                      isLocked ? 'border-white/10 opacity-60 cursor-not-allowed' :
                      'border-white/20 hover:border-amber-500/50 hover:bg-white/15'}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Quest number or status icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                      ${isCompleted ? 'bg-green-500/20 text-green-400' :
                        isActive ? 'bg-amber-500/20 text-amber-400' :
                        isLocked ? 'bg-white/10 text-white/30' :
                        'bg-white/20 text-white'}`}
                    >
                      {isCompleted ? <FaCheck /> : 
                       isLocked ? <FaLock className="text-sm" /> : 
                       index + 1}
                    </div>

                    {/* Quest info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {quest.title}
                      </h3>
                      <p className="text-white/70 text-sm mb-3">
                        {quest.description}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/70">
                          {quest.duration}
                        </span>
                        <span className="px-2 py-1 bg-amber-500/20 rounded-lg text-xs text-amber-400">
                          {quest.xp} XP
                        </span>
                        {isCompleted && (
                          <span className="px-2 py-1 bg-green-500/20 rounded-lg text-xs text-green-400">
                            {t('starterPack.questCompleted') || 'Completed'}
                          </span>
                        )}
                        {isActive && (
                          <span className="px-2 py-1 bg-amber-500/20 rounded-lg text-xs text-amber-400">
                            {t('starterPack.questInProgress') || 'In Progress'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress indicator for active quest */}
                    {isActive && progress?.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Call to action */}
        {completedCount < starterQuests.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-white/70 text-sm">
              {t('starterPack.encouragement') || 'Complete all 3 quests to unlock your personalized financial roadmap!'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StarterPackHub;
