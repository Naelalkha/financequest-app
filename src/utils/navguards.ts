/**
 * Navigation guards pour gérer l'accès aux quêtes avec gating Premium
 * Centralise la logique de navigation et tracking analytics
 */

import { getQuestLockState } from './impact';
import { trackEvent } from './analytics';

/**
 * Sources de navigation possibles vers une quête
 * @typedef {'quest_card'|'daily_challenge'|'continue_card'|'search'|'deeplink'} NavigationSource
 */

/**
 * Ouvre une quête avec vérification du gating Premium
 * Gère la redirection vers /premium si nécessaire
 * 
 * @param {Object} params - Paramètres
 * @param {Object} params.quest - Quête à ouvrir
 * @param {Object} params.user - Utilisateur actuel
 * @param {Function} params.navigate - Fonction de navigation (react-router-dom)
 * @param {NavigationSource} params.source - Source de la navigation
 * @param {Object} [params.options] - Options supplémentaires
 * @param {boolean} [params.options.bypassGating] - Bypass le gating (pour starter pack)
 * @param {number} [params.options.trialDays=7] - Jours d'essai à proposer
 */
export function openQuestGuarded({ quest, user, navigate, source, options = {} }) {
  // Options
  const { bypassGating = false, trialDays = 7 } = options;

  // Vérifier que tous les paramètres requis sont présents
  if (!quest || !navigate || !source) {
    console.error('openQuestGuarded: Missing required parameters', { quest, navigate, source });
    return;
  }

  // Déterminer le lock state
  const lockState = getQuestLockState(user, quest);
  const { locked, reason } = lockState;

  // Bypass gating si demandé (ex: starter pack)
  const isLocked = bypassGating ? false : locked;

  // Track l'intention de clic sur la quête
  trackEvent('quest_card_clicked', {
    quest_id: quest.id,
    quest_title: quest.title || quest.description,
    quest_category: quest.category,
    quest_difficulty: quest.difficulty,
    is_premium: quest.isPremium || false,
    has_access: !isLocked,
    source,
    bypass_gating: bypassGating,
  });

  // Si la quête est locked, rediriger vers /premium
  if (isLocked && reason === 'premium') {
    // Track le gate shown
    trackEvent('premium_gate_shown', {
      quest_id: quest.id,
      quest_title: quest.title || quest.description,
      source,
      reason,
    });

    // Track la redirection
    trackEvent('premium_redirect', {
      quest_id: quest.id,
      source,
      trial_days: trialDays,
      from_page: 'quest_gate',
    });

    // Construire l'URL de redirection avec paramètres
    const premiumUrl = `/premium?from=${source}&questId=${quest.id}&trial=${trialDays}`;
    
    console.log('🔒 Quest locked, redirecting to:', premiumUrl);
    navigate(premiumUrl);
    return;
  }

  // Si la quête est accessible, naviguer normalement
  console.log('✅ Quest accessible, navigating to:', `/quests/${quest.id}`);
  navigate(`/quests/${quest.id}`);
}

/**
 * Vérifie si une quête est dans le starter pack (toujours gratuit)
 * @param {Object} quest - Quête à vérifier
 * @returns {boolean} - True si la quête est dans le starter pack
 */
export function isStarterPackQuest(quest) {
  if (!quest) return false;

  // Liste des IDs de quêtes du starter pack (à adapter selon ton app)
  const starterPackIds = [
    'budget-basics-101',
    'emergency-fund-starter',
    'debt-snowball',
    // Ajoute d'autres IDs ici
  ];

  return starterPackIds.includes(quest.id) || quest.isStarterPack === true;
}

/**
 * Wrapper pour ouvrir une quête du starter pack (bypass gating)
 * @param {Object} params - Mêmes params que openQuestGuarded
 */
export function openStarterPackQuest(params) {
  return openQuestGuarded({
    ...params,
    options: {
      ...params.options,
      bypassGating: true,
    },
  });
}

/**
 * Vérifie si l'utilisateur peut accéder à une quête
 * Fonction helper pour composants (sans navigation)
 * 
 * @param {Object} user - Utilisateur actuel
 * @param {Object} quest - Quête à vérifier
 * @returns {Object} - { canAccess: boolean, reason: string|null }
 */
export function canAccessQuest(user, quest) {
  // Vérifier le gating
  const lockState = getQuestLockState(user, quest);
  
  // Si starter pack, toujours accessible
  if (isStarterPackQuest(quest)) {
    return { canAccess: true, reason: 'starter_pack' };
  }

  // Sinon, utiliser le lock state
  return {
    canAccess: !lockState.locked,
    reason: lockState.locked ? lockState.reason : null,
  };
}

export default {
  openQuestGuarded,
  isStarterPackQuest,
  openStarterPackQuest,
  canAccessQuest,
};

