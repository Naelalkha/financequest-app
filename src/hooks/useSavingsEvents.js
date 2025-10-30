import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createSavingsEventInFirestore,
  updateSavingsEventInFirestore,
  deleteSavingsEventFromFirestore,
  getAllSavingsEvents,
  getSavingsEventById,
  calculateTotalSavings,
  getSavingsByQuest
} from '../services/savingsEvents';

/**
 * Hook personnalisé pour gérer les événements d'économie
 * @returns {Object}
 */
export const useSavingsEvents = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Charge tous les événements d'économie
   */
  const loadEvents = useCallback(async (options = {}) => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedEvents = await getAllSavingsEvents(currentUser.uid, options);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error loading savings events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * Crée un nouvel événement d'économie
   */
  const createEvent = useCallback(async (eventData) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      const newEvent = await createSavingsEventInFirestore(currentUser.uid, eventData);
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      console.error('Error creating savings event:', err);
      setError(err.message);
      throw err;
    }
  }, [currentUser]);

  /**
   * Met à jour un événement d'économie
   */
  const updateEvent = useCallback(async (eventId, updates) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      await updateSavingsEventInFirestore(currentUser.uid, eventId, updates);
      
      // Mettre à jour localement
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, ...updates, updatedAt: new Date() }
          : event
      ));
    } catch (err) {
      console.error('Error updating savings event:', err);
      setError(err.message);
      throw err;
    }
  }, [currentUser]);

  /**
   * Supprime un événement d'économie
   */
  const deleteEvent = useCallback(async (eventId) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      await deleteSavingsEventFromFirestore(currentUser.uid, eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err) {
      console.error('Error deleting savings event:', err);
      setError(err.message);
      throw err;
    }
  }, [currentUser]);

  /**
   * Récupère un événement spécifique par ID
   */
  const getEventById = useCallback(async (eventId) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      return await getSavingsEventById(currentUser.uid, eventId);
    } catch (err) {
      console.error('Error fetching savings event:', err);
      setError(err.message);
      throw err;
    }
  }, [currentUser]);

  /**
   * Calcule le total des économies
   */
  const getTotalSavings = useCallback(async (period = null) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      return await calculateTotalSavings(currentUser.uid, period);
    } catch (err) {
      console.error('Error calculating total savings:', err);
      setError(err.message);
      throw err;
    }
  }, [currentUser]);

  /**
   * Récupère les économies groupées par quête
   */
  const getEventsByQuest = useCallback(async () => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      return await getSavingsByQuest(currentUser.uid);
    } catch (err) {
      console.error('Error fetching savings by quest:', err);
      setError(err.message);
      throw err;
    }
  }, [currentUser]);

  // NOTE: Ne charge PAS automatiquement les événements au montage
  // Pour éviter de surcharger au démarrage
  // Utilisez loadEvents() explicitement ou useSavingsStats() pour les agrégats

  return {
    events,
    loading,
    error,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getTotalSavings,
    getEventsByQuest
  };
};

/**
 * Hook pour récupérer les événements d'économie d'une quête spécifique
 * @param {string} questId - ID de la quête
 * @returns {Object}
 */
export const useQuestSavings = (questId) => {
  const { currentUser } = useAuth();
  const [questEvents, setQuestEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser || !questId) return;

    const loadQuestSavings = async () => {
      setLoading(true);
      setError(null);

      try {
        const events = await getAllSavingsEvents(currentUser.uid, { questId });
        setQuestEvents(events);
      } catch (err) {
        console.error('Error loading quest savings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuestSavings();
  }, [currentUser, questId]);

  return {
    questEvents,
    loading,
    error
  };
};

/**
 * Hook pour calculer les statistiques totales d'économie
 * @returns {Object}
 */
export const useSavingsStats = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    count: 0,
    byPeriod: { month: 0, year: 0 },
    verified: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const [totalData, allEvents] = await Promise.all([
        calculateTotalSavings(currentUser.uid),
        getAllSavingsEvents(currentUser.uid)
      ]);

      const verified = allEvents.filter(e => e.verified).length;
      const pending = allEvents.filter(e => !e.verified && e.proof).length;

      setStats({
        ...totalData,
        verified,
        pending
      });
    } catch (err) {
      console.error('Error loading savings stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    reload: loadStats
  };
};

