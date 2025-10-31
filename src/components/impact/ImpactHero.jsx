import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaChevronRight } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useImpactAggregates } from '../../hooks/useImpactAggregates';
import { trackEvent } from '../../utils/analytics';
import QuickWinModal from './QuickWinModal';

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
  const { 
    impactAnnualEstimated, 
    impactAnnualVerified, 
    proofsVerifiedCount, 
    loading 
  } = useImpactAggregates();
  const [isQuickWinOpen, setIsQuickWinOpen] = useState(false);

  // Utiliser les agrégats serveur comme source de vérité
  const stats = {
    totalAnnual: impactAnnualEstimated || 0,
    totalVerified: impactAnnualVerified || 0,
    proofsVerifiedCount: proofsVerifiedCount || 0,
    proofsPendingCount: 0, // TODO: Ajouter ce compteur côté serveur si nécessaire
  };

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
    // Les agrégats seront automatiquement mis à jour par le listener temps réel
    // grâce au trigger Cloud Function qui met à jour le user document
    setIsQuickWinOpen(false);
  };

  const handleContinueClick = () => {
    trackEvent('cta_continue_clicked', { total_annual: stats.totalAnnual });
    navigate('/quests');
  };

  const handleDetailClick = () => {
    trackEvent('impact_ledger_opened', {
      total_annual: stats.totalAnnual,
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

