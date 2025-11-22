import { motion } from 'framer-motion';
import { FaClock, FaTrophy, FaCheckCircle, FaFire, FaStar, FaArrowRight, FaBolt } from 'react-icons/fa';
import { GiTwoCoins } from 'react-icons/gi';
import { useLanguage } from '../../../contexts/LanguageContext';

// Import des icônes de catégories
import budgetIcon from '../../../assets/budget.png';
import epargneIcon from '../../../assets/epargne.png';
import dettesIcon from '../../../assets/dettes.png';
import investissementIcon from '../../../assets/investissement.png';
import impotsIcon from '../../../assets/impots.png';
import protectionIcon from '../../../assets/protection.png';

/**
 * QuestIntro - Page d'intro gamifiée et moderne pour les quêtes
 * 
 * Affiche :
 * - Hero section avec titre énorme + icône catégorie
 * - Stats visuelles (durée, XP, impact, difficulté)
 * - Objectifs stylisés en cards
 * - Fun fact
 * - CTA énorme animé
 * 
 * Props:
 * - questConfig: objet complet de la quête (depuis data/quests)
 * - onStart: fonction callback pour démarrer la quête
 */

// Mapping des catégories vers les icônes
const CATEGORY_ICONS = {
  budget: budgetIcon,
  budgeting: budgetIcon,
  saving: epargneIcon,
  epargne: epargneIcon,
  credit: dettesIcon,
  dettes: dettesIcon,
  investing: investissementIcon,
  investissement: investissementIcon,
  taxes: impotsIcon,
  impots: impotsIcon,
  protect: protectionIcon,
  protection: protectionIcon,
};

const DIFFICULTY_CONFIG = {
  beginner: {
    label_fr: 'Débutant',
    label_en: 'Beginner',
    emoji: '🌱',
    gradient: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-300',
    neonGlow: 'shadow-[0_0_20px_rgba(74,222,128,0.4)]'
  },
  intermediate: {
    label_fr: 'Intermédiaire',
    label_en: 'Intermediate',
    emoji: '⚡',
    gradient: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-300',
    neonGlow: 'shadow-[0_0_20px_rgba(251,191,36,0.4)]'
  },
  advanced: {
    label_fr: 'Avancé',
    label_en: 'Advanced',
    emoji: '🔥',
    gradient: 'from-red-400 to-rose-500',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-300',
    neonGlow: 'shadow-[0_0_20px_rgba(248,113,113,0.4)]'
  }
};

const QuestIntro = ({ questConfig = {}, onStart }) => {
  const { currentLang } = useLanguage();

  // Extract data avec fallbacks
  const title = questConfig[`title_${currentLang}`] || questConfig.title || 'Quest';
  const description = questConfig[`description_${currentLang}`] || questConfig.description || '';
  const objectives = questConfig[`objectives_${currentLang}`] || questConfig.objectives || [];
  const difficulty = DIFFICULTY_CONFIG[questConfig.difficulty] || DIFFICULTY_CONFIG.beginner;
  const categoryIcon = CATEGORY_ICONS[questConfig.category] || budgetIcon;
  
  // Calculer l'impact annuel
  const annualImpact = questConfig.estimatedImpact?.amount 
    ? (questConfig.estimatedImpact.amount * 12).toFixed(0)
    : null;

  // Fun fact
  const funFact = questConfig.steps?.[0]?.[`funFact_${currentLang}`] || questConfig.steps?.[0]?.funFact;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Hero Card - Style QuestCompletion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.35) 100%)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Orbes décoratifs style QuestCompletion */}
        <motion.div 
          className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full blur-3xl"
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
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          {/* Header : Icône + Badge */}
          <div className="flex items-center justify-between mb-8">
            {/* Icône catégorie */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 sm:w-20 sm:h-20"
            >
              <img 
                src={categoryIcon} 
                alt="Category"
                className="w-full h-full object-contain opacity-80"
              />
            </motion.div>

            {/* Badge difficulté */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${difficulty.bgColor} border ${difficulty.borderColor} backdrop-blur-sm`}
            >
              <span className="text-base">{difficulty.emoji}</span>
              <span className={`text-sm font-bold ${difficulty.textColor} uppercase tracking-wider whitespace-nowrap`}>
                {difficulty[`label_${currentLang}`]}
              </span>
            </motion.div>
          </div>

          {/* Titre + Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-5 mb-10"
          >
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight"
              style={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 900,
                letterSpacing: '-0.03em'
              }}
            >
              <span className="bg-gradient-to-r from-white via-amber-200 to-orange-200 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-400 font-medium leading-relaxed max-w-3xl">
              {description}
            </p>
          </motion.div>

          {/* Stats rapides - Style QuestCompletion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            {questConfig.duration && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FaClock className="text-cyan-400 text-sm" />
                  <div>
                    <span className="text-xs text-gray-400">
                      {currentLang === 'fr' ? 'Durée' : 'Duration'}:
                    </span>
                    <span className="text-sm font-bold text-white ml-1">
                      {questConfig.duration} min
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {questConfig.xp && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FaTrophy className="text-purple-400 text-xs" />
                  <span className="text-sm font-bold text-purple-300">
                    +{questConfig.xp} XP
                  </span>
                </div>
              </motion.div>
            )}
            
            {questConfig.estimatedImpact?.amount && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {currentLang === 'fr' ? 'Par mois' : 'Per month'}:
                  </span>
                  <span className="text-sm font-bold text-amber-400">
                    ~{questConfig.estimatedImpact.amount}€
                  </span>
                </div>
              </motion.div>
            )}
            
            {annualImpact && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {currentLang === 'fr' ? 'Par an' : 'Per year'}:
                  </span>
                  <span className="text-sm font-bold text-green-400">
                    ~{annualImpact}€
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Objectifs - Card QuestCompletion style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.35) 100%)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Ligne d'accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        
        <div className="flex items-center gap-3 mb-6">
          <FaCheckCircle className="text-amber-400 text-xl" />
          <h3 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900 }}>
            {currentLang === 'fr' ? 'Tes objectifs' : 'Your objectives'}
          </h3>
        </div>

        <div className="space-y-3">
          {objectives.map((objective, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/10"
            >
              {/* Numéro */}
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                {index + 1}
              </div>

              {/* Texte */}
              <span className="text-base sm:text-lg text-gray-200 font-medium leading-relaxed pt-0.5">
                {objective}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fun fact - Card QuestCompletion style */}
      {funFact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)] text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.35) 100%)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Ligne d'accent */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">💡</span>
            <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              {currentLang === 'fr' ? 'Le savais-tu ?' : 'Did you know?'}
            </span>
          </div>
          <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
            {funFact}
          </p>
        </motion.div>
      )}

      {/* CTA - Bouton QuestCompletion style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <button
          onClick={onStart}
          className="w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xl shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] hover:scale-[1.02]"
        >
          ✨ {currentLang === 'fr' ? 'Commencer la quête' : 'Start quest'}
        </button>
      </motion.div>
    </div>
  );
};

export default QuestIntro;

