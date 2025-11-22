import { motion } from 'framer-motion';
import { FaTrophy } from 'react-icons/fa';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * QuestCompletion - Composant générique pour la page de fin de quête
 * 
 * Props:
 * - questData: { serviceName, monthlyAmount } ou autre data spécifique
 * - xp: number (XP gagnés)
 * - title: { fr, en } (titre de félicitations)
 * - message: { fr, en } (message personnalisé avec montant)
 * - onAddToImpact: function (callback pour ouvrir modal Impact)
 * - onViewImpact: function (callback pour aller vers /impact)
 * - showImpactButton: boolean (afficher le bouton "Ajouter à l'Impact")
 */
const QuestCompletion = ({
  questData = {},
  xp = 120,
  title = {
    fr: 'Mission accomplie !',
    en: 'Mission accomplished!'
  },
  message, // Fonction ou objet { fr, en } pour générer le message
  onAddToImpact,
  onViewImpact,
  showImpactButton = true,
  customContent = null, // Pour des contenus spécifiques à la quête
}) => {
  const { currentLang } = useLanguage();

  // Calculer le montant annuel si disponible
  const annualAmount = questData.monthlyAmount 
    ? (questData.monthlyAmount * 12).toFixed(0)
    : null;

  // Générer le message
  const getDisplayMessage = () => {
    if (typeof message === 'function') {
      return message(questData, currentLang);
    }
    if (message && typeof message === 'object') {
      return message[currentLang] || message.fr;
    }
    // Message par défaut avec montant
    if (annualAmount) {
      return currentLang === 'fr'
        ? `Tu vas économiser ${annualAmount}€ par an !`
        : `You'll save €${annualAmount} per year!`;
    }
    return currentLang === 'fr'
      ? 'Tu as terminé cette quête avec succès !'
      : 'You completed this quest successfully!';
  };

  const displayTitle = typeof title === 'object' 
    ? (title[currentLang] || title.fr)
    : title;

  const displayMessage = getDisplayMessage();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Titre de félicitations - Style Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-7xl sm:text-8xl mb-4"
        >
          🎉
        </motion.div>
        <h3 
          className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight"
          style={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 900,
            letterSpacing: '-0.03em'
          }}
        >
          <span className="bg-gradient-to-r from-white via-amber-200 to-orange-200 bg-clip-text text-transparent">
            {displayTitle}
          </span>
        </h3>
        <p className="text-2xl sm:text-3xl text-gray-400 font-medium">
          {displayMessage}
        </p>
      </motion.div>

      {/* Card récap - Style Impact Hero */}
      {annualAmount && questData.serviceName && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.35) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Orbes décoratifs */}
          <motion.div 
            className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 20, 0],
              y: [0, 20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -20, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Ligne d'accent en haut */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Grosse icône trophée - Style Impact Hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: 'backOut' }}
              className="flex-shrink-0"
            >
              <motion.div
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.6)]"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-6xl sm:text-7xl lg:text-8xl">🏆</span>
              </motion.div>
            </motion.div>

            {/* Contenu */}
            <div className="flex-1 w-full min-w-0">
              {/* Label */}
              <div className="flex items-center gap-2 mb-3">
                <FaTrophy className="text-green-400/60 text-lg" />
                <span className="text-sm font-bold text-green-400/60 uppercase tracking-wider">
                  {currentLang === 'fr' ? 'Économie réalisée' : 'Savings achieved'}
                </span>
              </div>
              
              {/* Service */}
              <p className="text-xl sm:text-2xl font-bold text-white mb-4">
                {questData.serviceName}
              </p>
              
              {/* Montant annuel - Énorme */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-green-400/80 text-3xl sm:text-4xl font-black">+</span>
                <p 
                  className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-green-300 via-green-400 to-emerald-400 bg-clip-text text-transparent"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 900,
                    letterSpacing: '-0.03em'
                  }}
                >
                  {annualAmount}€
                </p>
                <span className="text-2xl sm:text-3xl font-black text-green-400/80">
                  /an
                </span>
              </div>
              
              {/* Stats rapides */}
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-xs text-gray-400">
                    {currentLang === 'fr' ? 'Par mois' : 'Per month'}: 
                  </span>
                  <span className="text-sm font-bold text-amber-400 ml-1">
                    {questData.monthlyAmount.toFixed(2)}€
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                  <FaTrophy className="inline text-purple-400 text-xs mr-1" />
                  <span className="text-sm font-bold text-purple-300">
                    +{xp} XP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Contenu personnalisé (si fourni) */}
      {customContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {customContent}
        </motion.div>
      )}

      {/* Boutons d'action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        {showImpactButton && onAddToImpact && (
          <button
            onClick={onAddToImpact}
            className="w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xl shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] hover:scale-[1.02]"
          >
            ✨ {currentLang === 'fr' ? 'Ajouter à mon Impact' : 'Add to my Impact'}
          </button>
        )}

        {onViewImpact && (
          <button
            onClick={onViewImpact}
            className="w-full py-3 text-lg text-gray-400 hover:text-white transition-colors font-medium"
          >
            {currentLang === 'fr' ? 'Voir mon Impact →' : 'See my Impact →'}
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default QuestCompletion;

