/**
 * Navigation guards pour gérer l'accès aux quêtes avec gating Premium
 * Centralise la logique de navigation et tracking analytics
 */

import { getQuestLockState } from './impact';
import { trackEvent } from './analytics';

/** Sources de navigation possibles vers une quête */
type NavigationSource = 'quest_card' | 'daily_challenge' | 'continue_card' | 'search' | 'deeplink';

/** Quest interface for navigation */
interface NavQuest {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  isPremium?: boolean;
  isStarterPack?: boolean;
}

/** User interface for navigation */
interface NavUser {
  uid?: string;
  isPremium?: boolean;
  [key: string]: unknown;
}

/** Options for quest guarding */
interface GuardOptions {
  bypassGating?: boolean;
  trialDays?: number;
}

/** Parameters for openQuestGuarded */
interface OpenQuestGuardedParams {
  quest: NavQuest | null;
  user: NavUser | null;
  navigate: (path: string) => void;
  source: NavigationSource;
  options?: GuardOptions;
}

/**
 * Ouvre une quête avec vérification du gating Premium
 * Gère la redirection vers /premium si nécessaire
 */
export function openQuestGuarded({ quest, user, navigate, source, options = {} }: OpenQuestGuardedParams): void {
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
 */
export function isStarterPackQuest(quest: NavQuest | null): boolean {
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
 */
export function openStarterPackQuest(params: OpenQuestGuardedParams): void {
  return openQuestGuarded({
    ...params,
    options: {
      ...params.options,
      bypassGating: true,
    },
  });
}

/** Return type for canAccessQuest */
interface AccessResult {
  canAccess: boolean;
  reason: string | null;
}

/**
 * Vérifie si l'utilisateur peut accéder à une quête
 * Fonction helper pour composants (sans navigation)
 */
export function canAccessQuest(user: NavUser | null, quest: NavQuest | null): AccessResult {
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

