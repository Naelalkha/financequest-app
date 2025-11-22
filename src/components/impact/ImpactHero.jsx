import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaChevronRight, FaSync, FaBolt, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSavingsEvents } from '../../hooks/useSavingsEvents';
import { useServerImpactAggregates } from '../../hooks/useServerImpactAggregates';
import { trackEvent } from '../../utils/analytics';
import { formatTimeSinceRecalc } from '../../services/impactAggregates';
import { openQuestGuarded } from '../../utils/navguards';
import { getStarterPackQuests } from '../../data/quests/index';
import QuickWinModal from './QuickWinModal';
import impactHeroImg from '../../assets/impact.png';

// Animation de compteur fluide
const CountUp = ({ end, duration = 1000, prefix = '', suffix = '', locale = 'fr-FR' }) => {
  const [count, setCount] = useState(end);
  const previousEndRef = useRef(end);

  useEffect(() => {
    const startValue = previousEndRef.current;
    previousEndRef.current = end;

    if (startValue === end) {
      setCount(end);
      return;
    }

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(startValue + (end - startValue) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
  const formatted = count.toLocaleString(localeCode);

  return (
    <span>{prefix}{formatted}{suffix}</span>
  );
};

/**
 * Calcule le montant annualisé d'un événement d'économie
 */
const calculateAnnual = (event) => {
  return event.amount * (event.period === 'month' ? 12 : 1);
};

const ImpactHero = ({
  totalAnnual: propTotalAnnual = null,
  period: propPeriod = null,
  onPeriodChange = null,
  showActions = true
}) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  // State interne pour le toggle si non contrôlé par le parent
  const [internalPeriod, setInternalPeriod] = useState('year');
  const period = propPeriod || internalPeriod;
  const handlePeriodChange = (newPeriod) => {
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    } else {
      setInternalPeriod(newPeriod);
    }
  };

  // Agrégats serveur (source de vérité si pas de prop fournie)
  const {
    impactAnnualEstimated: serverEstimated,
    lastImpactRecalcAt,
    loading: serverLoading,
    syncing,
  } = useServerImpactAggregates();

  // Charger les événements seulement pour affichage si nécessaire (non utilisé pour calcul)
  const { events, loadEvents, loading: localLoading } = useSavingsEvents();
  const [isQuickWinOpen, setIsQuickWinOpen] = useState(false);

  // Charger les événements seulement si nécessaire
  useEffect(() => {
    if (propTotalAnnual === null) {
      loadEvents({ limitCount: 50 });
    }
  }, [loadEvents, propTotalAnnual]);

  // Déterminer le montant total à afficher (hook a déjà le fallback intégré)
  const totalAnnual = propTotalAnnual !== null ? propTotalAnnual : serverEstimated;

  const displayTotal = period === 'year' ? totalAnnual : Math.round(totalAnnual / 12);
  const displaySuffix = period === 'year'
    ? (language === 'fr' ? '/an' : '/year')
    : (language === 'fr' ? '/mois' : '/month');

  // Loading state seulement si on fetch nous-mêmes
  const loading = propTotalAnnual === null && (serverLoading || localLoading);

  const handleQuickWinClick = () => {
    trackEvent('cta_quickwin_clicked', { total_annual: totalAnnual });

    const starterQuests = getStarterPackQuests();
    if (starterQuests.length > 0) {
      const firstStarterQuest = starterQuests[0];
      trackEvent('starter_pack_started', {
        quest_id: firstStarterQuest.id,
        source: 'impact_hero'
      });
      openQuestGuarded({
        quest: firstStarterQuest,
        user,
        navigate,
        source: 'hero_quickwin'
      });
    } else {
      navigate('/quests?tab=starter');
    }
  };

  const handleQuickWinSuccess = () => {
    loadEvents({ limitCount: 50 });
    setIsQuickWinOpen(false);
  };

  const handleDetailClick = () => {
    trackEvent('impact_ledger_opened', {
      total_annual: totalAnnual,
      events_count: events.length,
    });
    navigate('/impact');
  };

  if (loading) {
    return (
      <div className="relative neon-element rounded-3xl p-8 overflow-hidden border border-white/10 animate-pulse bg-gray-900/50 h-[200px] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si 0€ et qu'on doit montrer les actions (Dashboard), on montre un état vide incitatif
  // Si on est dans Impact.jsx, l'état vide est géré ailleurs, mais ici on affiche quand même 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative neon-element rounded-3xl p-4 sm:p-5 lg:p-6 overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)] group"
      style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.25) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.8) 50%, transparent 60%)',
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />

      {/* Orbes décoratifs */}
      <motion.div
        className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-black/20 to-black/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
          y: [0, 20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-br from-black/20 to-black/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -20, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ligne d'accent en haut */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10 flex flex-col justify-between h-full px-6 py-5 min-h-[140px]">

        {/* TOP ROW: Label (Left) & Toggle (Right) */}
        <div className="flex items-start justify-between w-full mb-2">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center"
          >
            <span className="text-amber-200/50 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
              {t('impact.hero.total_label') || 'Gain Total'}
            </span>
          </motion.div>

          <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/5 backdrop-blur-md">
            <button
              onClick={() => handlePeriodChange('year')}
              className={`px-2 py-1 text-[9px] sm:text-[10px] font-bold rounded transition-all ${period === 'year'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/20'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {language === 'fr' ? 'AN' : 'YR'}
            </button>
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-2 py-1 text-[9px] sm:text-[10px] font-bold rounded transition-all ${period === 'month'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/20'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {language === 'fr' ? 'MOIS' : 'MO'}
            </button>
          </div>
        </div>

        {/* BOTTOM ROW: Amount (Left) & Image (Right) */}
        <div className="flex items-end justify-between w-full">
          {/* Gros Montant */}
          <motion.div
            key={displayTotal}
            initial={{ scale: 0.95, opacity: 0, x: -10 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
            className="flex items-baseline gap-1 -ml-1 relative z-20"
          >
            <span className="text-amber-400/60 text-2xl sm:text-3xl font-black self-start mt-2">+</span>
            <span className="text-6xl sm:text-7xl lg:text-8xl font-black bg-gradient-to-b from-white via-amber-100 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.2)]"
              style={{
                fontFamily: '"Inter", sans-serif',
                letterSpacing: '-0.05em',
                lineHeight: 0.9
              }}
            >
              <CountUp
                end={Math.round(displayTotal)}
                duration={1000}
                locale={language}
              />
            </span>
            <div className="flex flex-col items-start -ml-0.5 opacity-70 transform translate-y-1">
              <span className="text-amber-400 text-xl sm:text-2xl font-black">€</span>
              <span className="text-amber-400/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{displaySuffix}</span>
            </div>
          </motion.div>

          {/* Image à droite (Hero) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: 'backOut' }}
            className="flex-shrink-0 relative -mb-2 -mr-2"
          >
            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full transform translate-y-2 scale-110" />
            <motion.img
              src={impactHeroImg}
              alt="Impact"
              className="w-24 sm:w-32 lg:w-40 h-auto object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Actions (Dashboard only) */}
      {showActions && (
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {totalAnnual === 0 ? (
            <button
              onClick={handleQuickWinClick}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 text-lg"
            >
              <FaBolt /> {t('impact.cta.quickwin') || 'Gain rapide'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/quests')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {t('impact.cta.continue') || 'Continuer'} <FaArrowRight />
            </button>
          )}

          <button
            onClick={handleDetailClick}
            className="px-6 py-3 bg-transparent hover:bg-white/5 border border-white/10 text-amber-200 font-medium rounded-xl transition-all"
          >
            {t('impact.link.detail') || 'Détails'}
          </button>
        </div>
      )}


      <QuickWinModal
        isOpen={isQuickWinOpen}
        onClose={() => setIsQuickWinOpen(false)}
        onSuccess={handleQuickWinSuccess}
      />
    </motion.div >
  );
};

export default ImpactHero;
