import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVideo, FaMusic, FaTv, FaAmazon, FaPlaystation, FaApple, FaGoogle, FaXbox, FaDumbbell, FaPlus, FaCheck, FaGamepad, FaCloud, FaPalette } from 'react-icons/fa';

// Suggestions d'abonnements avec icônes et prix moyens
const SUBSCRIPTION_SUGGESTIONS = [
  { id: 'netflix', name: 'Netflix', icon: FaVideo, avgPrice: 13.99, color: 'from-red-600 to-red-500' },
  { id: 'spotify', name: 'Spotify Premium', icon: FaMusic, avgPrice: 10.99, color: 'from-green-500 to-green-400' },
  { id: 'canal', name: 'Canal+', icon: FaTv, avgPrice: 20.99, color: 'from-gray-700 to-gray-600' },
  { id: 'prime', name: 'Amazon Prime', icon: FaAmazon, avgPrice: 6.99, color: 'from-blue-600 to-blue-500' },
  { id: 'disney', name: 'Disney+', icon: FaVideo, avgPrice: 8.99, color: 'from-blue-400 to-purple-500' },
  { id: 'icloud', name: 'iCloud+', icon: FaCloud, avgPrice: 2.99, color: 'from-gray-600 to-gray-500' },
  { id: 'google-one', name: 'Google One', icon: FaCloud, avgPrice: 2.99, color: 'from-blue-500 to-green-500' },
  { id: 'adobe', name: 'Adobe Creative', icon: FaPalette, avgPrice: 19.99, color: 'from-red-500 to-pink-500' },
  { id: 'ps-plus', name: 'PlayStation Plus', icon: FaGamepad, avgPrice: 8.99, color: 'from-blue-600 to-blue-500' },
  { id: 'xbox', name: 'Xbox Game Pass', icon: FaGamepad, avgPrice: 12.99, color: 'from-green-600 to-green-500' },
  { id: 'gym', name: 'Salle de sport', icon: FaDumbbell, avgPrice: 29.99, color: 'from-orange-500 to-red-500' },
];

const SubscriptionSelector = ({ value = null, onChange, locale = 'fr' }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuggestions = SUBSCRIPTION_SUGGESTIONS.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (subscription) => {
    onChange({
      serviceName: subscription.name,
      monthlyAmount: subscription.avgPrice,
      id: subscription.id
    });
  };

  const handleCustomSubmit = () => {
    if (customName.trim()) {
      onChange({
        serviceName: customName.trim(),
        monthlyAmount: 0,
        id: 'custom'
      });
      setShowCustomInput(false);
      setCustomName('');
    }
  };

  const t = (key) => {
    const translations = {
      fr: {
        title: 'Quel abonnement veux-tu annuler ?',
        search: 'Rechercher un abonnement...',
        custom: 'Autre abonnement',
        customPlaceholder: 'Nom de l\'abonnement',
        customSubmit: 'Valider',
        popular: 'Abonnements populaires',
        selected: 'Sélectionné'
      },
      en: {
        title: 'Which subscription do you want to cancel?',
        search: 'Search a subscription...',
        custom: 'Other subscription',
        customPlaceholder: 'Subscription name',
        customSubmit: 'Confirm',
        popular: 'Popular subscriptions',
        selected: 'Selected'
      }
    };
    return translations[locale]?.[key] || translations.fr[key];
  };

  return (
    <div className="w-full space-y-8">
      {/* Titre - Style Impact avec plus gros texte */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h3 
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight"
          style={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 900,
            letterSpacing: '-0.03em'
          }}
        >
          <span className="bg-gradient-to-r from-white via-amber-200 to-orange-200 bg-clip-text text-transparent">
            {t('title')}
          </span>
        </h3>
        <p className="text-lg sm:text-xl text-gray-400 font-medium">
          {locale === 'fr' 
            ? 'Sélectionne dans la liste ou ajoute le tien'
            : 'Select from the list or add your own'}
        </p>
      </motion.div>

      {/* Barre de recherche */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('search')}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
        />
      </div>

      {/* Grille d'abonnements - Style gamifié avec cartes plus grosses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredSuggestions.map((subscription, index) => {
            const Icon = subscription.icon;
            const isSelected = value?.id === subscription.id;
            
            return (
              <motion.button
                key={subscription.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.08, y: -8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(subscription)}
                className={`
                  relative p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300
                  ${isSelected 
                    ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/20 border-amber-500/60 shadow-[0_0_30px_rgba(251,191,36,0.4)]' 
                    : 'bg-black/30 border-white/10 hover:bg-black/40 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                  }
                `}
                style={{
                  backdropFilter: 'blur(20px)'
                }}
              >
                {/* Badge sélection + XP */}
                <AnimatePresence>
                  {isSelected && (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-black/50"
                      >
                        <FaCheck className="text-white text-sm" />
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-2 -left-2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-xs font-bold text-white shadow-lg"
                      >
                        +10 XP
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {/* Icône avec gradient - Plus grosse */}
                <div className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br ${subscription.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="text-white text-3xl" />
                </div>

                {/* Nom - Plus gros */}
                <p className="text-sm sm:text-base font-bold text-white text-center mb-2 line-clamp-2">
                  {subscription.name}
                </p>

                {/* Prix moyen - Plus visible */}
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs text-gray-500">~</span>
                  <p className="text-sm font-bold text-amber-400">
                    {subscription.avgPrice.toFixed(2).replace('.', ',')}€
                  </p>
                  <span className="text-xs text-gray-500">/mois</span>
                </div>
              </motion.button>
            );
          })}

          {/* Bouton "Autre" */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: filteredSuggestions.length * 0.03 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCustomInput(true)}
            className="relative p-4 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
              <FaPlus className="text-white text-xl" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-white text-center">
              {t('custom')}
            </p>
          </motion.button>
        </AnimatePresence>
      </div>

      {/* Modal input custom */}
      <AnimatePresence>
        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCustomInput(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-xl font-bold text-white mb-4">
                {t('custom')}
              </h4>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={t('customPlaceholder')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all mb-4"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
                >
                  {locale === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customName.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('customSubmit')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionSelector;

