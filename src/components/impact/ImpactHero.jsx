import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaChevronRight, FaSync } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSavingsEvents } from '../../hooks/useSavingsEvents';
import { useServerImpactAggregates } from '../../hooks/useServerImpactAggregates';
import { trackEvent } from '../../utils/analytics';
import { formatTimeSinceRecalc } from '../../services/impactAggregates';
import QuickWinModal from './QuickWinModal';

/**
 * Calcule le montant annualisé d'un événement d'économie
 * @param {Object} event - Événement d'économie
 * @returns {number} Montant annualisé
 */
const calculateAnnual = (event) => {
  return event.amount * (event.period === 'month' ? 12 : 1);
};

/**
 * Formate un montant en euros selon la locale
 * @param {number} amount - Montant à formatter
 * @param {string} locale - Locale (fr-FR ou en-US)
 * @returns {string} Montant formaté
 */
const formatCurrency = (amount, locale) => {
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ImpactHero = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  // Agrégats serveur (source de vérité)
  const {
    impactAnnualEstimated: serverEstimated,
    impactAnnualVerified: serverVerified,
    proofsVerifiedCount: serverProofsCount,
    lastImpactRecalcAt,
    loading: serverLoading,
    syncing,
  } = useServerImpactAggregates();
  
  // Fallback local si serveur non dispo
  const { events, loadEvents, loading: localLoading } = useSavingsEvents();
  const [isQuickWinOpen, setIsQuickWinOpen] = useState(false);
  const [localStats, setLocalStats] = useState({
    totalAnnual: 0,
    totalVerified: 0,
    proofsVerifiedCount: 0,
    proofsPendingCount: 0,
  });

  // Charger les événements au montage (pour fallback)
  useEffect(() => {
    loadEvents({ limitCount: 50 });
  }, [loadEvents]);

  // Calculer les statistiques locales (fallback)
  useEffect(() => {
    if (events.length === 0) {
      setLocalStats({
        totalAnnual: 0,
        totalVerified: 0,
        proofsVerifiedCount: 0,
        proofsPendingCount: 0,
      });
      return;
    }

    let totalAnnual = 0;
    let totalVerified = 0;
    let proofsVerifiedCount = 0;
    let proofsPendingCount = 0;

    events.forEach((event) => {
      const annual = calculateAnnual(event);
      totalAnnual += annual;

      if (event.verified) {
        totalVerified += annual;
        proofsVerifiedCount++;
      } else if (event.proof && event.proof.note) {
        proofsPendingCount++;
      }
    });

    setLocalStats({
      totalAnnual,
      totalVerified,
      proofsVerifiedCount,
      proofsPendingCount,
    });
  }, [events]);
  
  // Stats finales : priorité serveur, sinon fallback local
  const stats = {
    totalAnnual: serverEstimated !== null ? serverEstimated : localStats.totalAnnual,
    totalVerified: serverVerified !== null ? serverVerified : localStats.totalVerified,
    proofsVerifiedCount: serverProofsCount !== null ? serverProofsCount : localStats.proofsVerifiedCount,
    proofsPendingCount: localStats.proofsPendingCount, // Uniquement local pour l'instant
  };
  
  const loading = serverLoading || localLoading;

  // Track event au montage
  useEffect(() => {
    trackEvent('impact_viewed', {
      total_annual: stats.totalAnnual,
      verified_count: stats.proofsVerifiedCount,
      pending_count: stats.proofsPendingCount,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleQuickWinClick = () => {
    trackEvent('cta_quickwin_clicked', { total_annual: stats.totalAnnual });
    trackEvent('quickwin_opened', { source: 'impact_hero' });
    setIsQuickWinOpen(true);
  };

  const handleQuickWinSuccess = () => {
    // Recharger les événements après Quick Win
    loadEvents({ limitCount: 50 });
    setIsQuickWinOpen(false);
  };

  const handleContinueClick = () => {
    trackEvent('cta_continue_clicked', { total_annual: stats.totalAnnual });
    navigate('/quests');
  };

  const handleDetailClick = () => {
    trackEvent('impact_ledger_opened', {
      total_annual: stats.totalAnnual,
      events_count: events.length,
    });
    navigate('/impact');
  };

  // Déterminer le chip de preuves
  const getProofChip = () => {
    if (stats.proofsVerifiedCount > 0) {
      return t('impact.hero.proofs.verified', { count: stats.proofsVerifiedCount });
    }
    if (stats.proofsPendingCount > 0) {
      return t('impact.hero.proofs.pending', { count: stats.proofsPendingCount });
    }
    return t('impact.hero.proofs.none');
  };

  if (loading) {
    return (
      <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 animate-pulse">
        <div className="h-32 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-shadow">
      {/* En-tête avec icône et chip */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaShieldAlt 
            className="w-5 h-5 text-amber-600 dark:text-amber-400" 
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
            {t('impact.hero.title')}
          </span>
        </div>
        
        <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
          {getProofChip()}
        </div>
        
        {/* Chip "MAJ il y a..." */}
        {lastImpactRecalcAt && (
          <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-700 flex items-center gap-1">
            {syncing ? (
              <>
                <FaSync className="animate-spin text-xs" />
                <span>{t('impact.sync.syncing')}</span>
              </>
            ) : (
              <span>{t('impact.sync.last_update', { time: formatTimeSinceRecalc(lastImpactRecalcAt, language) })}</span>
            )}
          </div>
        )}
      </div>

      {/* Valeur principale */}
      <div className="mb-2">
        <div className="text-4xl md:text-5xl font-bold text-amber-900 dark:text-amber-100 tracking-tight">
          +{formatCurrency(stats.totalAnnual, language)}
          <span className="text-2xl md:text-3xl font-normal text-amber-700 dark:text-amber-300">
            {t('impact.ledger.per_year')}
          </span>
        </div>
      </div>

      {/* Sous-texte */}
      <p className="text-sm text-amber-700 dark:text-amber-300 mb-6">
        {t('impact.hero.subtitle')}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* CTA Primaire (conditionnel) */}
        {stats.totalAnnual === 0 ? (
          <button
            onClick={handleQuickWinClick}
            className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {t('impact.cta.quickwin')}
          </button>
        ) : (
          <button
            onClick={handleContinueClick}
            className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {t('impact.cta.continue')}
          </button>
        )}

        {/* Lien secondaire */}
        <button
          onClick={handleDetailClick}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-amber-900 dark:text-amber-100 font-medium rounded-xl border border-amber-200 dark:border-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          {t('impact.link.detail')}
          <FaChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Quick Win Modal */}
      <QuickWinModal
        isOpen={isQuickWinOpen}
        onClose={() => setIsQuickWinOpen(false)}
        onSuccess={handleQuickWinSuccess}
      />
    </div>
  );
};

export default ImpactHero;

