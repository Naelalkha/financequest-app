import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { questTemplates } from '../data/questTemplates';

// Types de défis quotidiens
const DAILY_CHALLENGE_TYPES = {
  QUIZ_MASTER: 'quiz_master',
  SPEED_RUNNER: 'speed_runner',
  PERFECTIONIST: 'perfectionist',
  STREAK_KEEPER: 'streak_keeper',
  CATEGORY_EXPLORER: 'category_explorer'
};

// Générer un défi quotidien basé sur la date
export const generateDailyChallenge = (date = new Date()) => {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const seed = dayOfYear % 365; // Seed basé sur le jour de l'année
  
  const challengeTypes = Object.values(DAILY_CHALLENGE_TYPES);
  const challengeType = challengeTypes[seed % challengeTypes.length];
  
  // Sélectionner une quête basée sur le seed
  const availableQuests = questTemplates.filter(q => !q.isPremium);
  const selectedQuest = availableQuests[seed % availableQuests.length];
  
  return {
    id: `daily_${date.toISOString().split('T')[0]}`,
    type: challengeType,
    questId: selectedQuest.id,
    questTitle: selectedQuest.title_en,
    date: date.toISOString().split('T')[0],
    seed: seed,
    rewards: {
      xp: selectedQuest.xp * 2, // Double XP pour défi quotidien
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
export const getUserDailyChallenge = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const challengeRef = doc(db, 'dailyChallenges', `${userId}_${today}`);
    const challengeSnap = await getDoc(challengeRef);
    
    if (challengeSnap.exists()) {
      return challengeSnap.data();
    }
    
    // Créer un nouveau défi quotidien
    const newChallenge = generateDailyChallenge();
    await setDoc(challengeRef, {
      ...newChallenge,
      userId,
      status: 'active',
      progress: 0,
      startedAt: serverTimestamp(),
      completedAt: null
    });
    
    return newChallenge;
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

// Attribuer les récompenses du défi quotidien
const awardDailyChallengeRewards = async (userId, challenge) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Mettre à jour les stats utilisateur
    await updateDoc(userRef, {
      xp: challenge.rewards.xp,
      currentStreak: challenge.rewards.streak,
      dailyChallengesCompleted: 1,
      lastDailyChallenge: challenge.date
    });
    
    // Ajouter le badge si applicable
    if (challenge.rewards.badge) {
      // Logique pour ajouter le badge
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