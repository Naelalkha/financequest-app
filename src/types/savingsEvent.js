/**
 * @typedef {'month'|'year'} SavingsPeriod
 */

/**
 * @typedef {'note'|'file'|'screenshot'} ProofType
 */

/**
 * @typedef {Object} Proof
 * @property {ProofType} type - Type de preuve fournie
 * @property {string} [url] - URL du fichier de preuve (optionnel)
 * @property {string} [note] - Note textuelle (optionnel)
 */

/**
 * @typedef {'quest'|'manual'} SavingsSource
 */

/**
 * Modèle représentant un événement d'économie dans Firestore
 * Stocké sous /users/{uid}/savingsEvents
 * 
 * @typedef {Object} SavingsEvent
 * @property {string} id - Identifiant unique de l'événement
 * @property {Date|firebase.firestore.Timestamp} createdAt - Date de création
 * @property {Date|firebase.firestore.Timestamp} updatedAt - Date de dernière mise à jour
 * @property {string} title - Titre de l'économie
 * @property {string} questId - Identifiant de la quête associée
 * @property {number} amount - Montant économisé
 * @property {SavingsPeriod} period - Base de calcul ('month' ou 'year')
 * @property {boolean} verified - Statut de vérification (modifiable serveur uniquement)
 * @property {Proof|null} proof - Preuve de l'économie (peut être null)
 * @property {SavingsSource} source - Source de l'économie ('quest' ou 'manual')
 */

/**
 * Valeurs par défaut pour un nouveau SavingsEvent
 * @type {Partial<SavingsEvent>}
 */
export const DEFAULT_SAVINGS_EVENT = {
  verified: false,
  proof: null,
  source: 'quest',
  period: 'month'
};

/**
 * Champs protégés qui ne peuvent être modifiés que par le serveur
 * @type {string[]}
 */
export const PROTECTED_SAVINGS_FIELDS = ['verified'];

/**
 * Valide si un objet est un SavingsEvent valide
 * @param {any} event
 * @returns {boolean}
 */
export const isValidSavingsEvent = (event) => {
  if (!event || typeof event !== 'object') return false;

  const hasRequiredFields = 
    typeof event.title === 'string' &&
    typeof event.questId === 'string' &&
    typeof event.amount === 'number' &&
    (event.period === 'month' || event.period === 'year') &&
    (event.source === 'quest' || event.source === 'manual');

  if (!hasRequiredFields) return false;

  // Valider la preuve si présente
  if (event.proof !== null && event.proof !== undefined) {
    if (typeof event.proof !== 'object') return false;
    
    const validProofTypes = ['note', 'file', 'screenshot'];
    if (!validProofTypes.includes(event.proof.type)) return false;

    if (event.proof.url && typeof event.proof.url !== 'string') return false;
    if (event.proof.note && typeof event.proof.note !== 'string') return false;
  }

  return true;
};

/**
 * Crée un nouveau SavingsEvent avec les valeurs par défaut
 * @param {Partial<SavingsEvent>} data
 * @returns {Omit<SavingsEvent, 'id'>}
 */
export const createSavingsEvent = (data) => {
  const now = new Date();
  
  return {
    ...DEFAULT_SAVINGS_EVENT,
    ...data,
    createdAt: now,
    updatedAt: now,
    verified: false, // Toujours false à la création
  };
};

