import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { createSavingsEvent, isValidSavingsEvent } from '../types/savingsEvent';
import { recalculateImpactInBackground } from './impactAggregates';

/**
 * Déclenche la mise à jour de gamification en arrière-plan (fire-and-forget)
 */
const updateGamificationInBackground = async (userId) => {
  try {
    // Import dynamique pour éviter les dépendances circulaires
    const { updateGamificationOnSavingsChange } = await import('./gamification');
    
    // Récupérer tous les events pour calculer le total
    const savingsRef = getSavingsEventsCollection(userId);
    const snapshot = await getDocs(query(savingsRef));
    
    const savingsEvents = [];
    snapshot.forEach(doc => {
      savingsEvents.push({ id: doc.id, ...doc.data() });
    });
    
    // Calculer totalAnnualImpact
    let totalAnnualImpact = 0;
    savingsEvents.forEach(event => {
      const annual = event.amount * (event.period === 'month' ? 12 : 1);
      totalAnnualImpact += annual;
    });
    
    // Appeler updateGamificationOnSavingsChange
    await updateGamificationOnSavingsChange(userId, {
      totalAnnualImpact,
      savingsEvents,
      questsById: {}, // Sera récupéré dans le service si nécessaire
      userProgress: {},
      allQuests: [],
      eventSource: 'manual',
      currentStreak: 0,
    });
  } catch (error) {
    console.warn('⚠️ Background gamification update failed (non-blocking):', error.message);
  }
};

/**
 * Récupère la référence de la collection savingsEvents pour un utilisateur
 * @param {string} userId
 * @returns {import('firebase/firestore').CollectionReference}
 */
const getSavingsEventsCollection = (userId) => {
  return collection(db, 'users', userId, 'savingsEvents');
};

/**
 * Crée un nouvel événement d'économie
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} eventData - Données de l'événement
 * @param {string} eventData.title - Titre de l'économie
 * @param {string} eventData.questId - ID de la quête
 * @param {number} eventData.amount - Montant économisé
 * @param {'month'|'year'} eventData.period - Période
 * @param {'quest'|'manual'} [eventData.source] - Source de l'économie
 * @param {Object} [eventData.proof] - Preuve de l'économie
 * @returns {Promise<{id: string, ...}>} L'événement créé avec son ID
 */
export const createSavingsEventInFirestore = async (userId, eventData) => {
  try {
    const newEvent = {
      title: eventData.title,
      questId: eventData.questId,
      amount: eventData.amount,
      period: eventData.period,
      source: eventData.source || 'quest',
      proof: eventData.proof || null,
      verified: false, // Toujours false à la création
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log('📤 Creating savings event:', {
      userId,
      eventData: {
        title: newEvent.title,
        questId: newEvent.questId,
        amount: newEvent.amount,
        period: newEvent.period,
        source: newEvent.source,
        proof: newEvent.proof,
        verified: newEvent.verified,
        hasCreatedAt: !!newEvent.createdAt,
        hasUpdatedAt: !!newEvent.updatedAt,
      },
    });

    // Validation côté client (avant envoi)
    const validationData = {
      ...newEvent,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (!isValidSavingsEvent(validationData)) {
      throw new Error('Invalid savings event data');
    }

    const savingsRef = getSavingsEventsCollection(userId);
    console.log('📁 Savings ref path:', savingsRef.path);
    
    const docRef = await addDoc(savingsRef, newEvent);
    console.log('✅ Savings event created:', docRef.id);

    // Déclencher le recalcul des agrégats en arrière-plan
    recalculateImpactInBackground('create');
    
    // Déclencher la mise à jour de gamification en arrière-plan
    updateGamificationInBackground(userId).catch(() => {});

    return {
      id: docRef.id,
      ...newEvent,
      createdAt: new Date(), // Pour l'état local
      updatedAt: new Date(), // Pour l'état local
    };
  } catch (error) {
    console.error('❌ Error creating savings event:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    throw error;
  }
};

/**
 * Met à jour un événement d'économie existant avec whitelist stricte
 * @param {string} userId - ID de l'utilisateur
 * @param {string} eventId - ID de l'événement
 * @param {Object} updates - Mises à jour
 * @param {string} [updates.title] - Titre de l'économie
 * @param {number} [updates.amount] - Montant économisé
 * @param {'month'|'year'} [updates.period] - Période
 * @param {Object} [updates.proof] - Preuve de l'économie (note uniquement)
 * @returns {Promise<void>}
 */
export const updateSavingsEventInFirestore = async (userId, eventId, updates) => {
  try {
    // Whitelist stricte : seuls ces champs peuvent être modifiés
    const allowedFields = ['title', 'amount', 'period', 'proof'];
    const safeUpdates = {};

    // Filtrer uniquement les champs autorisés
    allowedFields.forEach(field => {
      if (updates.hasOwnProperty(field)) {
        safeUpdates[field] = updates[field];
      }
    });

    // Validation côté client
    if (safeUpdates.amount !== undefined) {
      const amount = Number(safeUpdates.amount);
      if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
        throw new Error('Invalid amount: must be a finite number between 0 and 100,000');
      }
      safeUpdates.amount = amount;
    }

    if (safeUpdates.period !== undefined && !['month', 'year'].includes(safeUpdates.period)) {
      throw new Error('Invalid period: must be "month" or "year"');
    }

    // Si proof est fourni, ne garder que la note
    if (safeUpdates.proof) {
      safeUpdates.proof = {
        type: 'note',
        note: safeUpdates.proof.note || ''
      };
    }

    const eventRef = doc(db, 'users', userId, 'savingsEvents', eventId);
    
    await updateDoc(eventRef, {
      ...safeUpdates,
      updatedAt: serverTimestamp()
    });

    console.log('✅ Savings event updated:', eventId, safeUpdates);

    // Déclencher le recalcul des agrégats en arrière-plan
    recalculateImpactInBackground('update');
    
    // Déclencher la mise à jour de gamification en arrière-plan
    updateGamificationInBackground(userId).catch(() => {});
  } catch (error) {
    console.error('❌ Error updating savings event:', error);
    throw error;
  }
};

/**
 * Supprime un événement d'économie
 * @param {string} userId - ID de l'utilisateur
 * @param {string} eventId - ID de l'événement
 * @returns {Promise<void>}
 */
export const deleteSavingsEventFromFirestore = async (userId, eventId) => {
  try {
    const eventRef = doc(db, 'users', userId, 'savingsEvents', eventId);
    await deleteDoc(eventRef);

    console.log('✅ Savings event deleted:', eventId);

    // Déclencher le recalcul des agrégats en arrière-plan
    recalculateImpactInBackground('delete');
    
    // Déclencher la mise à jour de gamification en arrière-plan
    updateGamificationInBackground(userId).catch(() => {});
  } catch (error) {
    console.error('❌ Error deleting savings event:', error);
    throw error;
  }
};

/**
 * Restaure un événement d'économie supprimé (Undo)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} eventId - ID de l'événement d'origine
 * @param {Object} snapshot - Snapshot des données de l'événement supprimé
 * @returns {Promise<{id: string, ...}>} L'événement restauré avec son ID
 */
export const restoreSavingsEventInFirestore = async (userId, eventId, snapshot) => {
  try {
    // Utiliser setDoc avec l'ID d'origine pour restaurer exactement le même document
    const eventRef = doc(db, 'users', userId, 'savingsEvents', eventId);
    
    // Préparer les données à restaurer (conserver les timestamps d'origine si disponibles)
    const restoreData = {
      title: snapshot.title,
      questId: snapshot.questId,
      amount: snapshot.amount,
      period: snapshot.period,
      source: snapshot.source || 'quest',
      proof: snapshot.proof || null,
      verified: false, // Toujours false côté client
      createdAt: snapshot.createdAt || serverTimestamp(), // Conserver l'original si possible
      updatedAt: serverTimestamp(), // Nouvelle date de mise à jour
    };

    // Utiliser setDoc au lieu de addDoc pour conserver l'ID
    await setDoc(eventRef, restoreData);

    console.log('✅ Savings event restored:', eventId);

    // Déclencher le recalcul des agrégats en arrière-plan
    recalculateImpactInBackground('restore');

    return {
      id: eventId,
      ...restoreData,
      createdAt: snapshot.createdAt instanceof Date ? snapshot.createdAt : new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('❌ Error restoring savings event:', error);
    throw error;
  }
};

/**
 * Récupère les événements d'économie d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} [options] - Options de filtre
 * @param {string} [options.questId] - Filtrer par questId
 * @param {boolean} [options.verified] - Filtrer par statut vérifié
 * @param {number} [options.limitCount] - Nombre maximum d'événements (défaut: 50)
 * @returns {Promise<Array>} Liste des événements
 */
export const getAllSavingsEvents = async (userId, options = {}) => {
  try {
    const savingsRef = getSavingsEventsCollection(userId);
    const limitCount = options.limitCount || 50;
    
    let constraints = [orderBy('createdAt', 'desc'), limit(limitCount)];

    // Appliquer les filtres si fournis
    if (options.questId) {
      constraints = [where('questId', '==', options.questId), orderBy('createdAt', 'desc'), limit(limitCount)];
    }

    if (typeof options.verified === 'boolean') {
      constraints = [where('verified', '==', options.verified), orderBy('createdAt', 'desc'), limit(limitCount)];
    }

    const q = query(savingsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convertir les Timestamps en Dates pour faciliter l'utilisation
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
  } catch (error) {
    console.error('Error fetching savings events:', error);
    throw error;
  }
};

/**
 * Récupère un événement d'économie spécifique
 * @param {string} userId - ID de l'utilisateur
 * @param {string} eventId - ID de l'événement
 * @returns {Promise<Object|null>} L'événement ou null si non trouvé
 */
export const getSavingsEventById = async (userId, eventId) => {
  try {
    const eventRef = doc(db, 'users', userId, 'savingsEvents', eventId);
    const snapshot = await getDoc(eventRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate(),
      updatedAt: snapshot.data().updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error fetching savings event:', error);
    throw error;
  }
};

/**
 * Calcule le total des économies pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {'month'|'year'} [period] - Filtrer par période
 * @returns {Promise<{total: number, count: number, byPeriod: Object}>}
 */
export const calculateTotalSavings = async (userId, period = null) => {
  try {
    const events = await getAllSavingsEvents(userId);
    
    let filteredEvents = events;
    if (period) {
      filteredEvents = events.filter(e => e.period === period);
    }

    const total = filteredEvents.reduce((sum, event) => sum + event.amount, 0);
    
    const byPeriod = {
      month: events.filter(e => e.period === 'month').reduce((sum, e) => sum + e.amount, 0),
      year: events.filter(e => e.period === 'year').reduce((sum, e) => sum + e.amount, 0)
    };

    return {
      total,
      count: filteredEvents.length,
      byPeriod
    };
  } catch (error) {
    console.error('Error calculating total savings:', error);
    throw error;
  }
};

/**
 * Récupère les économies par quête
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Map<string, Array>>} Map des événements groupés par questId
 */
export const getSavingsByQuest = async (userId) => {
  try {
    const events = await getAllSavingsEvents(userId);
    
    const byQuest = new Map();
    events.forEach(event => {
      if (!byQuest.has(event.questId)) {
        byQuest.set(event.questId, []);
      }
      byQuest.get(event.questId).push(event);
    });

    return byQuest;
  } catch (error) {
    console.error('Error fetching savings by quest:', error);
    throw error;
  }
};

