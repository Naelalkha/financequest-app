import { useState, useEffect } from 'react';
import { Plus, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSavingsEvents } from '../../hooks/useSavingsEvents';
import AddSavingsModal from '../impact/AddSavingsModal';

/**
 * Calcule le montant annualisé d'un événement d'économie
 */
const calculateAnnual = (event) => {
  return event.amount * (event.period === 'month' ? 12 : 1);
};

/**
 * Formate un montant en euros selon la locale
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

/**
 * Formate une date en format court
 */
const formatDate = (date, locale) => {
  if (!date) return '';
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.DateTimeFormat(localeCode, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

const Impact = () => {
  const { t, language } = useLanguage();
  const { events, loadEvents, loading } = useSavingsEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalAnnual: 0,
    totalVerified: 0,
    eventsCount: 0,
  });

  // Charger les événements au montage
  useEffect(() => {
    loadEvents({ limitCount: 50 });
  }, [loadEvents]);

  // Calculer les statistiques
  useEffect(() => {
    if (events.length === 0) {
      setStats({
        totalAnnual: 0,
        totalVerified: 0,
        eventsCount: 0,
      });
      return;
    }

    let totalAnnual = 0;
    let totalVerified = 0;

    events.forEach((event) => {
      const annual = calculateAnnual(event);
      totalAnnual += annual;

      if (event.verified) {
        totalVerified += annual;
      }
    });

    setStats({
      totalAnnual,
      totalVerified,
      eventsCount: events.length,
    });
  }, [events]);

  const handleModalSuccess = () => {
    // Recharger les événements
    loadEvents({ limitCount: 50 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('impact.ledger.title')}
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">{t('impact.ledger.add_btn')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Empty State */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="w-12 h-12 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('impact.ledger.empty_title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
              {t('impact.ledger.empty_subtitle')}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <Plus className="w-5 h-5" />
              {t('impact.ledger.empty_cta')}
            </button>
          </div>
        ) : (
          <>
            {/* Résumé - 3 compteurs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {/* Total estimé */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('impact.ledger.total_estimated')}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalAnnual, language)}
                </div>
              </div>

              {/* Vérifié */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('impact.ledger.total_verified')}
                  </span>
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(stats.totalVerified, language)}
                </div>
              </div>

              {/* Événements */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('impact.ledger.events_count')}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.eventsCount}
                </div>
              </div>
            </div>

            {/* Liste des événements */}
            <div className="space-y-3">
              {events.map((event) => {
                const annual = calculateAnnual(event);
                
                return (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {event.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                              event.verified
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {event.verified
                              ? t('impact.ledger.badge_verified')
                              : t('impact.ledger.badge_estimated')}
                          </span>
                        </div>
                        
                        {/* Métadonnées */}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">
                              {t(`impact.ledger.period_${event.period}`)}
                            </span>
                          </span>
                          <span>•</span>
                          <span>
                            {t(`impact.ledger.source_${event.source}`)}
                          </span>
                          <span>•</span>
                          <span>{formatDate(event.createdAt, language)}</span>
                        </div>

                        {/* Note de preuve si présente */}
                        {event.proof && event.proof.note && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                            "{event.proof.note}"
                          </p>
                        )}
                      </div>

                      {/* Montant annualisé */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          +{formatCurrency(annual, language)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t('impact.ledger.per_year')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal d'ajout */}
      <AddSavingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Impact;

