import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { COLLECTIONS, QUEST_STATUS } from '../utils/constants';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing quests
 */
export const useQuests = (filters = {}) => {
  const { user } = useAuth();
  const { t, currentLang } = useLanguage();
  const [quests, setQuests] = useState([]);
  const [userQuests, setUserQuests] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all quests
  useEffect(() => {
    if (!user) {
      setQuests([]);
      setLoading(false);
      return;
    }

    const questsQuery = query(
      collection(db, COLLECTIONS.QUESTS),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(
      questsQuery,
      (snapshot) => {
        const questsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Apply language-specific content
            title: data[`title_${currentLang}`] || data[`title_en`] || data.title,
            description: data[`description_${currentLang}`] || data[`description_en`] || data.description,
            objectives: data[`objectives_${currentLang}`] || data[`objectives_en`] || data.objectives
          };
        });

        // Apply filters
        let filteredQuests = questsData;

        if (filters.category && filters.category !== 'all') {
          filteredQuests = filteredQuests.filter(q => q.category === filters.category);
        }

        if (filters.difficulty && filters.difficulty !== 'all') {
          filteredQuests = filteredQuests.filter(q => q.difficulty === filters.difficulty);
        }

        if (filters.isPremium !== undefined) {
          filteredQuests = filteredQuests.filter(q => q.isPremium === filters.isPremium);
        }

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredQuests = filteredQuests.filter(q => 
            q.title.toLowerCase().includes(searchLower) ||
            q.description.toLowerCase().includes(searchLower)
          );
        }

        setQuests(filteredQuests);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching quests:', err);
        setError(err);
        setLoading(false);
        toast.error(t('errors.quest_load_failed'));
      }
    );

    return () => unsubscribe();
  }, [user, filters, currentLang, t]);

  // Fetch user's quest progress
  useEffect(() => {
    if (!user) {
      setUserQuests({});
      return;
    }

    const userQuestsQuery = query(
      collection(db, COLLECTIONS.USER_QUESTS),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      userQuestsQuery,
      (snapshot) => {
        const userQuestsData = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          userQuestsData[data.questId] = {
            id: doc.id,
            ...data
          };
        });
        setUserQuests(userQuestsData);
      },
      (err) => {
        console.error('Error fetching user quests:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  /**
   * Start a quest for the user
   */
  const startQuest = async (questId) => {
    if (!user) {
      toast.error(t('errors.unauthorized'));
      return false;
    }

    try {
      const userQuestRef = doc(db, COLLECTIONS.USER_QUESTS, `${user.uid}_${questId}`);
      const quest = quests.find(q => q.id === questId);

      if (!quest) {
        toast.error(t('errors.quest_not_found'));
        return false;
      }

      await setDoc(userQuestRef, {
        userId: user.uid,
        questId: questId,
        status: QUEST_STATUS.ACTIVE,
        progress: 0,
        currentStep: 0,
        stepAnswers: {},
        startedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp()
      });

      toast.success(t('quest.started', { quest: quest.title }));
      return true;
    } catch (error) {
      console.error('Error starting quest:', error);
      toast.error(t('errors.generic'));
      return false;
    }
  };

  /**
   * Update quest progress
   */
  const updateQuestProgress = async (questId, updates) => {
    if (!user) return false;

    try {
      const userQuestRef = doc(db, COLLECTIONS.USER_QUESTS, `${user.uid}_${questId}`);
      
      await updateDoc(userQuestRef, {
        ...updates,
        lastActivityAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error updating quest progress:', error);
      toast.error(t('errors.generic'));
      return false;
    }
  };

  /**
   * Complete a quest
   */
  const completeQuest = async (questId, earnedPoints = 0) => {
    if (!user) return false;

    try {
      const userQuestRef = doc(db, COLLECTIONS.USER_QUESTS, `${user.uid}_${questId}`);
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);

      // Update quest status
      await updateDoc(userQuestRef, {
        status: QUEST_STATUS.COMPLETED,
        progress: 100,
        completedAt: serverTimestamp()
      });

      // Update user stats
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      await updateDoc(userRef, {
        xp: (userData.xp || 0) + earnedPoints,
        completedQuests: (userData.completedQuests || 0) + 1,
        lastCompletedQuest: serverTimestamp()
      });

      const quest = quests.find(q => q.id === questId);
      toast.success(t('quest.completed', { quest: quest?.title || 'Quest' }));
      
      return true;
    } catch (error) {
      console.error('Error completing quest:', error);
      toast.error(t('errors.generic'));
      return false;
    }
  };

  /**
   * Get quest with user progress
   */
  const getQuestWithProgress = (questId) => {
    const quest = quests.find(q => q.id === questId);
    const userProgress = userQuests[questId];

    if (!quest) return null;

    return {
      ...quest,
      userProgress: userProgress || {
        status: QUEST_STATUS.NOT_STARTED,
        progress: 0,
        currentStep: 0
      }
    };
  };

  /**
   * Get active quests
   */
  const getActiveQuests = () => {
    return quests.filter(quest => {
      const userProgress = userQuests[quest.id];
      return userProgress?.status === QUEST_STATUS.ACTIVE;
    });
  };

  /**
   * Get completed quests
   */
  const getCompletedQuests = () => {
    return quests.filter(quest => {
      const userProgress = userQuests[quest.id];
      return userProgress?.status === QUEST_STATUS.COMPLETED;
    });
  };

  /**
   * Get quest statistics
   */
  const getQuestStats = () => {
    const total = quests.length;
    const completed = Object.values(userQuests).filter(q => q.status === QUEST_STATUS.COMPLETED).length;
    const active = Object.values(userQuests).filter(q => q.status === QUEST_STATUS.ACTIVE).length;
    const notStarted = total - completed - active;

    return {
      total,
      completed,
      active,
      notStarted,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  /**
   * Check if user can access quest
   */
  const canAccessQuest = (questId, isPremiumUser = false) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return false;

    // Check if quest is premium and user has access
    if (quest.isPremium && !isPremiumUser) return false;

    // Check prerequisites
    if (quest.prerequisites?.length > 0) {
      const allPrerequisitesCompleted = quest.prerequisites.every(prereqId => {
        const prereqProgress = userQuests[prereqId];
        return prereqProgress?.status === QUEST_STATUS.COMPLETED;
      });
      
      if (!allPrerequisitesCompleted) return false;
    }

    return true;
  };

  return {
    quests,
    userQuests,
    loading,
    error,
    startQuest,
    updateQuestProgress,
    completeQuest,
    getQuestWithProgress,
    getActiveQuests,
    getCompletedQuests,
    getQuestStats,
    canAccessQuest
  };
};

/**
 * Hook for single quest details
 */
export const useQuestDetail = (questId) => {
  const { user } = useAuth();
  const { currentLang } = useLanguage();
  const [quest, setQuest] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!questId || !user) {
      setLoading(false);
      return;
    }

    const fetchQuestDetail = async () => {
      try {
        // Fetch quest data
        const questRef = doc(db, COLLECTIONS.QUESTS, questId);
        const questSnap = await getDoc(questRef);

        if (!questSnap.exists()) {
          setError('Quest not found');
          setLoading(false);
          return;
        }

        const questData = questSnap.data();
        const localizedQuest = {
          id: questSnap.id,
          ...questData,
          title: questData[`title_${currentLang}`] || questData[`title_en`] || questData.title,
          description: questData[`description_${currentLang}`] || questData[`description_en`] || questData.description,
          objectives: questData[`objectives_${currentLang}`] || questData[`objectives_en`] || questData.objectives,
          steps: questData.steps?.map(step => ({
            ...step,
            title: step[`title_${currentLang}`] || step[`title_en`] || step.title,
            content: step[`content_${currentLang}`] || step[`content_en`] || step.content,
            question: step[`question_${currentLang}`] || step[`question_en`] || step.question,
            instruction: step[`instruction_${currentLang}`] || step[`instruction_en`] || step.instruction
          }))
        };

        setQuest(localizedQuest);

        // Fetch user progress
        const userQuestRef = doc(db, COLLECTIONS.USER_QUESTS, `${user.uid}_${questId}`);
        const userQuestSnap = await getDoc(userQuestRef);

        if (userQuestSnap.exists()) {
          setUserProgress(userQuestSnap.data());
        } else {
          setUserProgress({
            status: QUEST_STATUS.NOT_STARTED,
            progress: 0,
            currentStep: 0
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching quest detail:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchQuestDetail();
  }, [questId, user, currentLang]);

  return {
    quest,
    userProgress,
    loading,
    error
  };
};