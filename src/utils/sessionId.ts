/**
 * Génère et stocke un UUID de session unique pour le tracking analytics
 * Permet de corréler tous les événements d'une même session utilisateur
 */

let sessionId: string | null = null;

/**
 * Génère un UUID v4 simple
 * @returns {string} UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Récupère le session_id actuel (crée-le s'il n'existe pas)
 * @returns {string} Session ID unique
 */
export function getSessionId() {
  if (!sessionId) {
    sessionId = generateUUID();
    console.log('🔑 New session ID:', sessionId);
  }
  return sessionId;
}

/**
 * Réinitialise le session_id (utile pour les tests)
 */
export function resetSessionId() {
  sessionId = null;
}

export default {
  getSessionId,
  resetSessionId,
};

