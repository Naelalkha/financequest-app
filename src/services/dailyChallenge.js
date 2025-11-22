import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { allQuests } from '../data/quests';
import { localizeQuest } from '../data/quests/questHelpers';

// Types de défis quotidiens
const DAILY_CHALLENGE_TYPES = {
  QUIZ_MASTER: 'quiz_master',
  SPEED_RUNNER: 'speed_runner',
  PERFECTIONIST: 'perfectionist',
  STREAK_KEEPER: 'streak_keeper',
  CATEGORY_EXPLORER: 'category_explorer'
};

// Générer un défi quotidien basé sur la date
export const generateDailyChallenge = (date = new Date(), options = {}) => {
  const { forceRandom, salt, excludeQuestId, lang = 'fr' } = options;
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  let seed = forceRandom ? Math.floor(Math.random() * 100000) + (salt || 0) : (dayOfYear % 365);
  
  const challengeTypes = Object.values(DAILY_CHALLENGE_TYPES);
  const challengeType = challengeTypes[seed % challengeTypes.length];
  
  // Sélectionner une quête basée sur le seed
  let availableQuests = allQuests.filter(q => !q.isPremium);
  if (excludeQuestId) {
    availableQuests = availableQuests.filter(q => q.id !== excludeQuestId);
  }
  
  if (availableQuests.length === 0) {
    availableQuests = allQuests.filter(q => !q.isPremium); // Fallback si toutes les quêtes sont exclues
  }
  
  const selectedQuest = availableQuests[seed % availableQuests.length];
  
  // Localiser la quête pour obtenir le bon titre
  console.log('🔍 DEBUG selectedQuest:', { 
    id: selectedQuest?.id, 
    content: selectedQuest?.content,
    title_fr: selectedQuest?.title_fr,
    title_en: selectedQuest?.title_en,
    title: selectedQuest?.title
  });
  
  const localizedQuest = localizeQuest(selectedQuest, lang);
  console.log('🔍 DEBUG localizedQuest:', { 
    title: localizedQuest?.title,
    lang: lang 
  });
  
  const questTitle = localizedQuest?.title || selectedQuest?.content?.fr?.title || selectedQuest?.content?.en?.title || selectedQuest?.title_fr || selectedQuest?.title_en || selectedQuest?.title || `Quête ${selectedQuest?.id}`;
  console.log('🔍 DEBUG questTitle final:', questTitle);
  
  return {
    id: `daily_${date.toISOString().split('T')[0]}_${seed}`,  // Add seed to make regenerated challenges unique
    type: challengeType,
    questId: selectedQuest?.id,
    questTitle: questTitle,
    date: date.toISOString().split('T')[0],
    seed: seed,
    rewards: {
      xp: (selectedQuest?.xp || 100) * 2, // Double XP pour défi quotidien
      streak: 1,
      badge: challengeType === 'PERFECTIONIST' ? 'daily_perfectionist' : null
    },
    requirements: getChallengeRequirements(challengeType, selectedQuest),
    expiresAt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString()
  };
};

// Obtenir les exigences selon le type de défi
const getChallengeRequirements = (type, quest) => {
  switch (type) {
    case DAILY_CHALLENGE_TYPES.QUIZ_MASTER:
      return {
        description: 'Complete all quiz questions with 100% accuracy',
        target: 'perfect_score',
        value: 100
      };
    case DAILY_CHALLENGE_TYPES.SPEED_RUNNER:
      return {
        description: 'Complete the quest in under 5 minutes',
        target: 'completion_time',
        value: 300 // 5 minutes en secondes
      };
    case DAILY_CHALLENGE_TYPES.PERFECTIONIST:
      return {
        description: 'Complete all tasks without any mistakes',
        target: 'no_mistakes',
        value: 0
      };
    case DAILY_CHALLENGE_TYPES.STREAK_KEEPER:
      return {
        description: 'Maintain your streak by completing this quest',
        target: 'maintain_streak',
        value: 1
      };
    case DAILY_CHALLENGE_TYPES.CATEGORY_EXPLORER:
      return {
        description: `Complete a ${quest.category} quest`,
        target: 'category_complete',
        value: quest.category
      };
    default:
      return {
        description: 'Complete the quest successfully',
        target: 'complete',
        value: 1
      };
  }
};

// Vérifier si l'utilisateur a un défi quotidien actif
export const getUserDailyChallenge = async (userId, lang = 'fr') => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const challengeRef = doc(db, 'dailyChallenges', `${userId}_${today}`);
    const challengeSnap = await getDoc(challengeRef);
    
    if (challengeSnap.exists()) {
      const data = challengeSnap.data();
      // Si pas de questTitle ou questTitle undefined, recalculer avec la bonne langue
      if (!data.questTitle || data.questTitle === 'undefined' || data.questTitle.includes('undefined')) {
        const quest = allQuests.find(q => q.id === data.questId);
        if (quest) {
          const localizedQuest = localizeQuest(quest, lang);
          data.questTitle = localizedQuest?.title || quest?.content?.fr?.title || quest?.content?.en?.title || `Quête ${quest.id}`;
        }
      }
      return data;
    }
    
    // Créer un nouveau défi quotidien
    const newChallenge = generateDailyChallenge(new Date(), { lang });
    const payload = {
      ...newChallenge,
      userId,
      status: 'active',
      progress: 0,
      createdAt: serverTimestamp(), // Requis par les règles Firestore
      startedAt: serverTimestamp(),
      completedAt: null
    };
    const sanitized = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined));
    await setDoc(challengeRef, sanitized);
    
    // Retourner un objet avec les champs ajoutés (sans serverTimestamp résolu)
    return {
      ...newChallenge,
      userId,
      status: 'active',
      progress: 0,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      completedAt: null
    };
  } catch (error) {
    console.error('Error getting daily challenge:', error);
    throw error;
  }
};

// Marquer le défi quotidien comme terminé
export const completeDailyChallenge = async (userId, challengeId, completionData) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const challengeRef = doc(db, 'dailyChallenges', `${userId}_${today}`);
    
    // Vérifier si le défi est valide
    const challengeSnap = await getDoc(challengeRef);
    if (!challengeSnap.exists()) {
      throw new Error('Daily challenge not found');
    }
    
    const challenge = challengeSnap.data();
    
    // Vérifier si les exigences sont remplies
    const isCompleted = checkChallengeCompletion(challenge, completionData);
    
    if (isCompleted) {
      // Mettre à jour le statut
      await updateDoc(challengeRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        completionData
      });
      
      // Attribuer les récompenses
      await awardDailyChallengeRewards(userId, challenge);
      
      return {
        success: true,
        rewards: challenge.rewards,
        message: 'Daily challenge completed!'
      };
    } else {
      return {
        success: false,
        message: 'Challenge requirements not met'
      };
    }
  } catch (error) {
    console.error('Error completing daily challenge:', error);
    throw error;
  }
};

// Vérifier si le défi est terminé selon les exigences
const checkChallengeCompletion = (challenge, completionData) => {
  const { requirements } = challenge;
  
  switch (requirements.target) {
    case 'perfect_score':
      return completionData.score === 100;
    case 'completion_time':
      return completionData.duration <= requirements.value;
    case 'no_mistakes':
      return completionData.mistakes === 0;
    case 'maintain_streak':
      return completionData.streakMaintained;
    case 'category_complete':
      return completionData.category === requirements.value;
    case 'complete':
      return completionData.completed;
    default:
      return completionData.completed;
  }
};

// Attribuer les récompenses du défi quotidien (incrémentales)
const awardDailyChallengeRewards = async (userId, challenge) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    const userData = userSnap.exists() ? userSnap.data() : {};

    const currentXp = userData.xp || userData.points || 0;
    const dailyCompleted = userData.dailyChallengesCompleted || 0;

    await updateDoc(userRef, {
      xp: currentXp + (challenge.rewards.xp || 0),
      dailyChallengesCompleted: dailyCompleted + 1,
      lastDailyChallenge: challenge.date
    });

    if (challenge.rewards.badge) {
      // Placeholder: intégrer la logique d'ajout de badge si nécessaire
      console.log(`Badge earned: ${challenge.rewards.badge}`);
    }
  } catch (error) {
    console.error('Error awarding daily challenge rewards:', error);
    throw error;
  }
};

// Obtenir les statistiques des défis quotidiens
export const getDailyChallengeStats = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        totalCompleted: userData.dailyChallengesCompleted || 0,
        currentStreak: userData.currentStreak || 0,
        longestStreak: userData.longestStreak || 0,
        totalXP: userData.xp || 0
      };
    }
    
    return {
      totalCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalXP: 0
    };
  } catch (error) {
    console.error('Error getting daily challenge stats:', error);
    throw error;
  }
}; 