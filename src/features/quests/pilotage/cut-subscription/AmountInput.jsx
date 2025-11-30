import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEuroSign, FaChartLine, FaCalculator, FaTrophy } from 'react-icons/fa';

const AmountInput = ({ value, onChange, serviceName, locale = 'fr' }) => {
  const [amount, setAmount] = useState(value?.toString() || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value) {
      setAmount(value.toString());
    }
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    // Accepter uniquement les nombres et virgule/point
    const sanitized = inputValue.replace(/[^0-9.,]/g, '').replace(',', '.');
    
    setAmount(sanitized);
    
    const numericValue = parseFloat(sanitized);
    if (!isNaN(numericValue) && numericValue > 0 && numericValue <= 1000) {
      onChange(numericValue);
    }
  };

  const annualSavings = amount ? (parseFloat(amount) * 12).toFixed(0) : 0;
  const isValid = amount && parseFloat(amount) > 0 && parseFloat(amount) <= 1000;

  const t = (key) => {
    const translations = {
      fr: {
        title: 'Combien économises-tu ?',
        subtitle: 'Entre le montant mensuel de',
        placeholder: '0.00',
        hint: 'Montant mensuel en euros',
        annual: 'Par an',
        tip: '💡 Trouve le montant sur ton relevé bancaire ou dans l\'app'
      },
      en: {
        title: 'How much will you save?',
        subtitle: 'Enter the monthly amount for',
        placeholder: '0.00',
        hint: 'Monthly amount in euros',
        annual: 'Per year',
        tip: '💡 Find the amount on your bank statement or in the app'
      }
    };
    return translations[locale]?.[key] || translations.fr[key];
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Titre - Style Impact */}
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
        <p className="text-xl sm:text-2xl text-gray-400 font-medium">
          {t('subtitle')} <span className="text-amber-400 font-bold">{serviceName}</span>
        </p>
      </motion.div>

      {/* Card principale style Impact Hero */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)] group"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.35) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Glow effect quand focus */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl"
            />
          )}
        </AnimatePresence>

        {/* Orbes décoratifs */}
        <motion.div 
          className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Ligne d'accent en haut */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Grosse icône à gauche - Style Impact Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'backOut' }}
            className="flex-shrink-0"
          >
            <motion.div
              className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.6)]"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 3, -3, 0]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <FaEuroSign className="text-white text-5xl sm:text-6xl lg:text-7xl" />
            </motion.div>
          </motion.div>

          {/* Input principal - Très gros texte */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <FaCalculator className="text-amber-400/60 text-lg" />
              <span className="text-sm font-bold text-amber-400/60 uppercase tracking-wider">
                {t('hint')}
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={t('placeholder')}
                className="flex-1 bg-transparent text-5xl sm:text-6xl lg:text-7xl font-black text-white placeholder-white/20 focus:outline-none"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 900,
                  letterSpacing: '-0.03em'
                }}
              />
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-400/80">
                €/mois
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Économies annuelles - Card gamifiée style Impact */}
      {isValid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-green-500/30 backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(101, 163, 13, 0.15) 100%)',
          }}
        >
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-20"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.8) 50%, transparent 60%)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          
          {/* Ligne d'accent en haut */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent" />
          
          <div className="relative z-10 flex items-center gap-6">
            {/* Icône animée */}
            <motion.div
              className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <FaChartLine className="text-white text-3xl sm:text-4xl" />
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FaTrophy className="text-green-400/60 text-sm" />
                <span className="text-xs font-bold text-green-400/60 uppercase tracking-wider">
                  {t('annual')}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-green-400/80 text-2xl font-black">+</span>
                <p 
                  className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-green-300 via-green-400 to-emerald-400 bg-clip-text text-transparent"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 900,
                    letterSpacing: '-0.03em'
                  }}
                >
                  {annualSavings}€
                </p>
              </div>
              
              {/* Badge XP */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full"
              >
                <FaTrophy className="text-purple-400 text-xs" />
                <span className="text-xs font-bold text-purple-300">+20 XP</span>
              </motion.div>
            </div>
            
            {/* Indicateur visuel */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-5xl"
            >
              🎯
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Quick amounts */}
      <div className="grid grid-cols-4 gap-2">
        {[5, 10, 15, 20].map((quickAmount) => (
          <motion.button
            key={quickAmount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAmount(quickAmount.toString());
              onChange(quickAmount);
            }}
            className={`
              px-3 py-2 rounded-lg font-medium transition-all
              ${amount === quickAmount.toString()
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
              } border
            `}
          >
            {quickAmount}€
          </motion.button>
        ))}
      </div>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
      >
        <FaCalculator className="text-blue-400 mt-1 flex-shrink-0" />
        <p className="text-sm text-blue-300">
          {t('tip')}
        </p>
      </motion.div>
    </div>
  );
};

export default AmountInput;

