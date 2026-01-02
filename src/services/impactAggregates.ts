/**
 * Service pour gérer les agrégats d'impact côté serveur
 * Communique avec l'API Vercel /api/recalculate-impact
 */

import { auth } from './firebase';
import { trackEvent } from '../utils/analytics';

/**
 * URL de l'API (env var ou localhost en dev)
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/** Result from impact recalculation */
interface ImpactAggregates {
  impactAnnualEstimated: number;
  impactAnnualVerified: number;
  proofsVerifiedCount: number;
  lastImpactRecalcAt: string;
}

/**
 * Recalcule les agrégats d'impact côté serveur
 */
export const recalculateImpactAggregates = async (
  source: string = 'unknown'
): Promise<ImpactAggregates | null> => {
  const startTime = Date.now();
  
  try {
    // Vérifier que l'utilisateur est connecté
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('⚠️ Cannot recalculate impact: user not logged in');
      return null;
    }
    
    // En développement (localhost), skip l'API et utiliser le fallback client
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev && !API_BASE_URL) {
      console.log('🏠 Dev mode: skipping server API, using client-side fallback');
      return null; // Le hook useServerImpactAggregates utilisera le fallback local
    }
    
    // Obtenir l'ID Token
    const idToken = await currentUser.getIdToken();
    
    console.log(`🔄 Recalculating impact aggregates (source: ${source})...`);
    
    // Track analytics
    trackEvent('impact_recalc_triggered', {
      source,
      user_id: currentUser.uid,
    });
    
    // Appeler l'API
    const response = await fetch(`${API_BASE_URL}/api/recalculate-impact`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API returned ${response.status}`);
    }
    
    const result = await response.json();
    const duration = Date.now() - startTime;
    
    if (result.success) {
      console.log('✅ Impact aggregates recalculated:', result.data);
      
      // Track analytics success
      trackEvent('impact_recalc_completed', {
        source,
        estimated: result.data.impactAnnualEstimated,
        verified: result.data.impactAnnualVerified,
        proofs_count: result.data.proofsVerifiedCount,
        duration_ms: duration,
        server_duration_ms: result.meta?.duration,
      });
      
      return result.data;
    } else {
      throw new Error(result.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Error recalculating impact aggregates:', error);

    const duration = Date.now() - startTime;

    // Track analytics failure
    trackEvent('impact_recalc_failed', {
      source,
      reason: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: duration,
    });

    return null;
  }
};

/**
 * Recalcule les agrégats en arrière-plan (fire-and-forget)
 * Ne bloque pas l'UI et ne retourne rien
 */
export const recalculateImpactInBackground = (source: string = 'background'): void => {
  // Fire and forget
  recalculateImpactAggregates(source).catch((error) => {
    console.warn('⚠️ Background recalculation failed (non-blocking):', error);
  });
};

/**
 * Vérifie si les agrégats sont "stale" (trop vieux)
 */
export const areAggregatesStale = (
  lastImpactRecalcAt: string | null,
  maxAgeHours: number = 6
): boolean => {
  if (!lastImpactRecalcAt) return true; // Jamais calculés

  try {
    const lastRecalc = new Date(lastImpactRecalcAt);
    const now = new Date();
    const diffMs = now.getTime() - lastRecalc.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours > maxAgeHours;
  } catch {
    return true; // En cas d'erreur de parsing, considérer comme stale
  }
};

/**
 * Formatte la durée depuis le dernier recalcul pour l'affichage UI
 */
export const formatTimeSinceRecalc = (
  lastImpactRecalcAt: string | null,
  locale: string = 'fr'
): string => {
  if (!lastImpactRecalcAt) {
    return locale === 'fr' ? 'Jamais mis à jour' : 'Never updated';
  }

  try {
    const lastRecalc = new Date(lastImpactRecalcAt);
    const now = new Date();
    const diffMs = now.getTime() - lastRecalc.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return locale === 'fr' ? 'À l\'instant' : 'Just now';
    } else if (diffMinutes < 60) {
      return locale === 'fr' ? `il y a ${diffMinutes} min` : `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return locale === 'fr' ? `il y a ${diffHours}h` : `${diffHours}h ago`;
    } else {
      return locale === 'fr' ? `il y a ${diffDays}j` : `${diffDays}d ago`;
    }
  } catch {
    return locale === 'fr' ? 'Inconnu' : 'Unknown';
  }
};

