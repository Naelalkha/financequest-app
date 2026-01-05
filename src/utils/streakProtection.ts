import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

// Configuration de protection des streaks
const STREAK_PROTECTION_CONFIG = {
  MAX_STREAK_INCREMENT: 1, // Max streak increment per day
  MAX_STREAK_VALUE: 365, // Max streak value (1 year)
  COOLDOWN_HOURS: 24, // Hours between streak updates
  MAX_DAILY_UPDATES: 5, // Max streak updates per day
  ROLLBACK_THRESHOLD: 1000 // Streak value that triggers rollback check
};

/** Validation result type */
interface ValidationResult {
  valid: boolean;
  reason: string;
  message: string;
  suggestedValue?: number;
}

/** Streak update result type */
interface StreakUpdateResult {
  success: boolean;
  reason: string;
  message: string;
  appliedValue: number;
}

/** Incident data type */
interface IncidentData {
  attemptedValue: number;
  safeValue: number;
  reason: string;
  message: string;
  timestamp: Date;
}

// Vérifier si un streak update est valide
export const validateStreakUpdate = async (
  userId: string,
  newStreakValue: number
): Promise<ValidationResult> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    const userData = userSnap.data();
    const currentStreak = userData.currentStreak || 0;
    const lastStreakUpdate = userData.lastStreakUpdate?.toDate() || new Date(0);
    const dailyStreakUpdates = userData.dailyStreakUpdates || 0;
    const today = new Date();

    // Vérification 1: Streak ne peut pas augmenter de plus de 1 par jour
    const streakIncrement = newStreakValue - currentStreak;
    if (streakIncrement > STREAK_PROTECTION_CONFIG.MAX_STREAK_INCREMENT) {
      console.warn(`Streak increment too high: ${streakIncrement} for user ${userId}`);
      return {
        valid: false,
        reason: 'streak_increment_too_high',
        message: 'Streak can only increase by 1 per day',
        suggestedValue: currentStreak + STREAK_PROTECTION_CONFIG.MAX_STREAK_INCREMENT
      };
    }

    // Vérification 2: Streak ne peut pas dépasser la limite maximale
    if (newStreakValue > STREAK_PROTECTION_CONFIG.MAX_STREAK_VALUE) {
      console.warn(`Streak value too high: ${newStreakValue} for user ${userId}`);
      return {
        valid: false,
        reason: 'streak_value_too_high',
        message: 'Streak value exceeds maximum limit',
        suggestedValue: STREAK_PROTECTION_CONFIG.MAX_STREAK_VALUE
      };
    }

    // Vérification 3: Cooldown entre les mises à jour
    const hoursSinceLastUpdate = (today.getTime() - lastStreakUpdate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastUpdate < STREAK_PROTECTION_CONFIG.COOLDOWN_HOURS && streakIncrement > 0) {
      console.warn(`Streak update too soon: ${hoursSinceLastUpdate}h for user ${userId}`);
      return {
        valid: false,
        reason: 'streak_update_too_soon',
        message: 'Streak can only be updated once per day',
        suggestedValue: currentStreak
      };
    }
    
    // Vérification 4: Limite de mises à jour quotidiennes
    const isNewDay = !isSameDay(lastStreakUpdate, today);
    if (!isNewDay && dailyStreakUpdates >= STREAK_PROTECTION_CONFIG.MAX_DAILY_UPDATES) {
      console.warn(`Too many daily streak updates: ${dailyStreakUpdates} for user ${userId}`);
      return {
        valid: false,
        reason: 'too_many_daily_updates',
        message: 'Maximum daily streak updates reached',
        suggestedValue: currentStreak
      };
    }
    
    // Vérification 5: Détection de valeurs suspectes
    if (newStreakValue > STREAK_PROTECTION_CONFIG.ROLLBACK_THRESHOLD) {
      const shouldRollback = await checkForStreakAnomaly(userId, newStreakValue);
      if (shouldRollback) {
        console.error(`Streak anomaly detected for user ${userId}, rolling back to safe value`);
        return {
          valid: false,
          reason: 'streak_anomaly_detected',
          message: 'Streak value anomaly detected, rolling back',
          suggestedValue: Math.min(currentStreak, 100)
        };
      }
    }
    
    return {
      valid: true,
      reason: 'valid_update',
      message: 'Streak update is valid'
    };
    
  } catch (error) {
    console.error('Error validating streak update:', error);
    return {
      valid: false,
      reason: 'validation_error',
      message: 'Error validating streak update',
      suggestedValue: 0
    };
  }
};

// Mettre à jour le streak avec protection
export const updateStreakWithProtection = async (
  userId: string,
  newStreakValue: number,
  reason: string = 'quest_completion'
): Promise<StreakUpdateResult> => {
  try {
    // Valider la mise à jour
    const validation = await validateStreakUpdate(userId, newStreakValue);

    if (!validation.valid) {
      console.warn(`Streak update rejected: ${validation.reason} for user ${userId}`);

      // Utiliser la valeur suggérée si disponible
      const safeValue = validation.suggestedValue !== undefined ? validation.suggestedValue : 0;

      // Enregistrer l'incident
      await logStreakIncident(userId, {
        attemptedValue: newStreakValue,
        safeValue,
        reason: validation.reason,
        message: validation.message,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        reason: validation.reason,
        message: validation.message,
        appliedValue: safeValue
      };
    }

    // Récupérer les données utilisateur pour la mise à jour
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : null;
    const lastStreakUpdate = userData?.lastStreakUpdate?.toDate() || new Date(0);

    const today = new Date();
    const isNewDay = !isSameDay(lastStreakUpdate, today);

    const updateData: Record<string, unknown> = {
      currentStreak: newStreakValue,
      lastStreakUpdate: new Date().toISOString(),
      lastStreakUpdateReason: reason,
      dailyStreakUpdates: isNewDay ? 1 : (userData?.dailyStreakUpdates || 0) + 1
    };

    // Mettre à jour le streak le plus long si nécessaire
    if (newStreakValue > (userData?.longestStreak || 0)) {
      updateData.longestStreak = newStreakValue;
    }

    await updateDoc(userRef, updateData);

    console.log(`Streak updated successfully for user ${userId}: ${newStreakValue}`);

    return {
      success: true,
      reason: 'streak_updated',
      message: 'Streak updated successfully',
      appliedValue: newStreakValue
    };

  } catch (error) {
    console.error('Error updating streak with protection:', error);
    return {
      success: false,
      reason: 'update_error',
      message: 'Error updating streak',
      appliedValue: 0
    };
  }
};

// Vérifier les anomalies de streak
const checkForStreakAnomaly = async (userId: string, streakValue: number): Promise<boolean> => {
  try {
    // Vérifier l'historique des streaks
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return true;
    
    const userData = userSnap.data();
    const lastStreak = userData.currentStreak || 0;
    const longestStreak = userData.longestStreak || 0;
    
    // Anomalie 1: Augmentation soudaine massive
    if (streakValue - lastStreak > 50) {
      console.warn(`Sudden massive streak increase detected: ${streakValue - lastStreak}`);
      return true;
    }
    
    // Anomalie 2: Streak dépasse de loin le record
    if (streakValue > longestStreak * 2) {
      console.warn(`Streak exceeds record by more than 2x: ${streakValue} vs ${longestStreak}`);
      return true;
    }
    
    // Anomalie 3: Streak négatif
    if (streakValue < 0) {
      console.warn(`Negative streak value detected: ${streakValue}`);
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('Error checking streak anomaly:', error);
    return true; // En cas d'erreur, considérer comme anomalie
  }
};

// Enregistrer un incident de streak
const logStreakIncident = async (userId: string, incidentData: IncidentData): Promise<void> => {
  try {
    const incidentRef = doc(db, 'streakIncidents', `${userId}_${Date.now()}`);
    await setDoc(incidentRef, {
      userId,
      ...incidentData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error logging streak incident:', error);
  }
};

// Vérifier si deux dates sont le même jour
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

// Réinitialiser les compteurs quotidiens (à appeler une fois par jour)
export const resetDailyStreakCounters = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      dailyStreakUpdates: 0,
      lastStreakReset: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting daily streak counters:', error);
  }
};

/** Streak protection stats type */
interface StreakProtectionStats {
  currentStreak: number;
  longestStreak: number;
  dailyStreakUpdates: number;
  lastStreakUpdate: Date | undefined;
  lastStreakUpdateReason: string | undefined;
  isProtected: boolean;
}

// Obtenir les statistiques de protection des streaks
export const getStreakProtectionStats = async (userId: string): Promise<StreakProtectionStats | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return null;
    
    const userData = userSnap.data();
    
    return {
      currentStreak: userData.currentStreak || 0,
      longestStreak: userData.longestStreak || 0,
      dailyStreakUpdates: userData.dailyStreakUpdates || 0,
      lastStreakUpdate: userData.lastStreakUpdate?.toDate(),
      lastStreakUpdateReason: userData.lastStreakUpdateReason,
      isProtected: true
    };
  } catch (error) {
    console.error('Error getting streak protection stats:', error);
    return null;
  }
}; 