import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createSavingsEventInFirestore,
  updateSavingsEventInFirestore,
  deleteSavingsEventFromFirestore,
  restoreSavingsEventInFirestore,
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
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const deletedSnapshotRef = useRef(null); // Pour stocker le snapshot lors d'un delete

  /**
   * Charge tous les événements d'économie
   */
  const loadEvents = useCallback(async (options = {}) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedEvents = await getAllSavingsEvents(user.uid, options);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error loading savings events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Crée un nouvel événement d'économie
   */
  const createEvent = useCallback(async (eventData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      const newEvent = await createSavingsEventInFirestore(user.uid, eventData);
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      console.error('Error creating savings event:', err);
      setError(err.message);
      throw err;
    }
  }, [user]);

  /**
   * Met à jour un événement d'économie (alias pour editEvent)
   */
  const updateEvent = useCallback(async (eventId, updates) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      await updateSavingsEventInFirestore(user.uid, eventId, updates);
      
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
  }, [user]);

  /**
   * Édite un événement d'économie avec optimistic UI
   */
  const editEvent = useCallback(async (eventId, updates) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    // Sauvegarder l'ancien état pour rollback
    const oldEvent = events.find(e => e.id === eventId);
    if (!oldEvent) {
      throw new Error('Event not found');
    }

    try {
      // Optimistic UI : mettre à jour immédiatement
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, ...updates, updatedAt: new Date() }
          : event
      ));

      // Puis envoyer au serveur
      await updateSavingsEventInFirestore(user.uid, eventId, updates);
      
      console.log('✅ Event edited successfully:', eventId);
    } catch (err) {
      console.error('❌ Error editing savings event:', err);
      
      // Rollback en cas d'erreur
      setEvents(prev => prev.map(event => 
        event.id === eventId ? oldEvent : event
      ));
      
      setError(err.message);
      throw err;
    }
  }, [user, events]);

  /**
   * Supprime un événement d'économie avec snapshot pour undo
   */
  const deleteEvent = useCallback(async (eventId) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    // Trouver l'événement à supprimer et créer un snapshot
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) {
      throw new Error('Event not found');
    }

    // Stocker le snapshot pour un éventuel undo
    deletedSnapshotRef.current = {
      id: eventId,
      data: { ...eventToDelete }
    };

    try {
      // Optimistic UI : supprimer immédiatement de l'affichage
      setEvents(prev => prev.filter(event => event.id !== eventId));

      // Puis supprimer du serveur
      await deleteSavingsEventFromFirestore(user.uid, eventId);
      
      console.log('✅ Event deleted successfully:', eventId);
    } catch (err) {
      console.error('❌ Error deleting savings event:', err);
      
      // Rollback en cas d'erreur
      if (deletedSnapshotRef.current) {
        setEvents(prev => [deletedSnapshotRef.current.data, ...prev]);
        deletedSnapshotRef.current = null;
      }
      
      setError(err.message);
      throw err;
    }
  }, [user, events]);

  /**
   * Annule la suppression d'un événement (Undo)
   * Doit être appelé dans les 10 secondes après deleteEvent
   */
  const undoDelete = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!deletedSnapshotRef.current) {
      throw new Error('No deleted event to restore');
    }

    setError(null);

    const { id, data } = deletedSnapshotRef.current;

    try {
      // Optimistic UI : restaurer immédiatement dans l'affichage
      setEvents(prev => [data, ...prev]);

      // Puis restaurer sur le serveur
      await restoreSavingsEventInFirestore(user.uid, id, data);
      
      console.log('✅ Event restored successfully:', id);
      
      // Effacer le snapshot après restauration réussie
      deletedSnapshotRef.current = null;
    } catch (err) {
      console.error('❌ Error restoring savings event:', err);
      
      // Rollback en cas d'erreur
      setEvents(prev => prev.filter(event => event.id !== id));
      
      setError(err.message);
      throw err;
    }
  }, [user]);

  /**
   * Récupère un événement spécifique par ID
   */
  const getEventById = useCallback(async (eventId) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      return await getSavingsEventById(user.uid, eventId);
    } catch (err) {
      console.error('Error fetching savings event:', err);
      setError(err.message);
      throw err;
    }
  }, [user]);

  /**
   * Calcule le total des économies
   */
  const getTotalSavings = useCallback(async (period = null) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      return await calculateTotalSavings(user.uid, period);
    } catch (err) {
      console.error('Error calculating total savings:', err);
      setError(err.message);
      throw err;
    }
  }, [user]);

  /**
   * Récupère les économies groupées par quête
   */
  const getEventsByQuest = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      return await getSavingsByQuest(user.uid);
    } catch (err) {
      console.error('Error fetching savings by quest:', err);
      setError(err.message);
      throw err;
    }
  }, [user]);

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
    editEvent, // Nouvelle fonction avec optimistic UI
    deleteEvent,
    undoDelete, // Nouvelle fonction pour annuler une suppression
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
  const { user } = useAuth();
  const [questEvents, setQuestEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !questId) return;

    const loadQuestSavings = async () => {
      setLoading(true);
      setError(null);

      try {
        const events = await getAllSavingsEvents(user.uid, { questId });
        setQuestEvents(events);
      } catch (err) {
        console.error('Error loading quest savings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuestSavings();
  }, [user, questId]);

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
  const { user } = useAuth();
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
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [totalData, allEvents] = await Promise.all([
        calculateTotalSavings(user.uid),
        getAllSavingsEvents(user.uid)
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
  }, [user]);

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

