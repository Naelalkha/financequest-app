import { 
  collection, 
  doc, 
  addDoc, 
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
    const docRef = await addDoc(savingsRef, newEvent);

    return {
      id: docRef.id,
      ...newEvent,
      createdAt: new Date(), // Pour l'état local
      updatedAt: new Date(), // Pour l'état local
    };
  } catch (error) {
    console.error('Error creating savings event:', error);
    throw error;
  }
};

/**
 * Met à jour un événement d'économie existant
 * @param {string} userId - ID de l'utilisateur
 * @param {string} eventId - ID de l'événement
 * @param {Partial<import('../types/savingsEvent').SavingsEvent>} updates - Mises à jour
 * @returns {Promise<void>}
 */
export const updateSavingsEventInFirestore = async (userId, eventId, updates) => {
  try {
    // Empêcher la modification du champ 'verified' côté client
    const { verified, createdAt, ...allowedUpdates } = updates;

    const eventRef = doc(db, 'users', userId, 'savingsEvents', eventId);
    
    await updateDoc(eventRef, {
      ...allowedUpdates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating savings event:', error);
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
  } catch (error) {
    console.error('Error deleting savings event:', error);
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

