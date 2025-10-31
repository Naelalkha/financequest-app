/**
 * Helpers pour gérer l'affichage de l'impact estimé des quêtes
 * Compatible avec les quêtes existantes (retourne null si pas d'impact)
 */

/**
 * Annualise un montant d'impact selon sa période
 * @param {Object} impact - Objet impact { amount: number, period: 'month'|'year' }
 * @returns {number|null} - Montant annualisé ou null si pas d'impact
 */
export function annualizeImpact(impact) {
  if (!impact || typeof impact.amount !== 'number' || !impact.period) {
    return null;
  }

  const { amount, period } = impact;

  // Validation du montant
  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  // Annualisation selon la période
  switch (period) {
    case 'month':
      return amount * 12;
    case 'year':
      return amount;
    default:
      return null;
  }
}

/**
 * Formate un montant en euros selon la locale
 * @param {string} locale - Locale (fr-FR, en-US, etc.)
 * @param {number} value - Montant à formater
 * @returns {string|null} - Montant formaté "+€XXX/an" ou null
 */
export function formatEUR(locale, value) {
  if (!Number.isFinite(value) || value === null || value === undefined) {
    return null;
  }

  try {
    // Arrondir à 0 décimale
    const rounded = Math.round(value);

    // Formater selon la locale
    const formatted = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rounded);

    // Ajouter le signe + si positif
    return value > 0 ? `+${formatted}/an` : `${formatted}/an`;
  } catch (error) {
    console.error('Error formatting EUR:', error);
    return null;
  }
}

/**
 * Détermine si une quête est verrouillée pour l'utilisateur
 * @param {Object} user - Utilisateur actuel
 * @param {Object} quest - Quête à vérifier
 * @returns {Object} - { locked: boolean, reason: 'premium'|null }
 */
export function getQuestLockState(user, quest) {
  // Vérification du feature flag (pour désactiver le gating en dev)
  const gatingSwitched = import.meta.env.VITE_PREMIUM_GATING;
  if (gatingSwitched === 'off') {
    return { locked: false, reason: null };
  }

  // Pas de quête = pas de lock
  if (!quest) {
    return { locked: false, reason: null };
  }

  // Utilisateur premium = accès total
  if (user?.isPremium) {
    return { locked: false, reason: null };
  }

  // Quête premium = locked pour non-premium
  if (quest.isPremium) {
    return { locked: true, reason: 'premium' };
  }

  // Par défaut, pas de lock
  return { locked: false, reason: null };
}

/**
 * Obtient l'impact annualisé d'une quête (si disponible)
 * @param {Object} quest - Quête
 * @returns {number|null} - Montant annualisé ou null
 */
export function getQuestAnnualImpact(quest) {
  if (!quest || !quest.estimatedImpact) {
    return null;
  }

  return annualizeImpact(quest.estimatedImpact);
}

/**
 * Obtient l'impact formaté d'une quête (si disponible)
 * @param {Object} quest - Quête
 * @param {string} locale - Locale (fr/en)
 * @returns {string|null} - Impact formaté "+€XXX/an" ou null
 */
export function getQuestFormattedImpact(quest, locale = 'fr') {
  const annualImpact = getQuestAnnualImpact(quest);
  
  if (annualImpact === null) {
    return null;
  }

  return formatEUR(locale, annualImpact);
}

export default {
  annualizeImpact,
  formatEUR,
  getQuestLockState,
  getQuestAnnualImpact,
  getQuestFormattedImpact,
};

