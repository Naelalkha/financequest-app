import { motion, AnimatePresence } from 'framer-motion';
import { FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';

const ImpactEventItem = ({
    event,
    categoryStyle,
    displayAmount,
    formatCurrency,
    formatDate,
    language,
    t,
    isMenuOpen,
    onToggleMenu,
    onEdit,
    onDelete,
    period
}) => {
    // Determine suffix based on global period setting
    // If global period is 'year', show '/an'. If 'month', show '/mois'.
    // This clarifies that the amount shown is per that period.
    const amountSuffix = period === 'year'
        ? (language === 'fr' ? '/an' : '/yr')
        : (language === 'fr' ? '/mois' : '/mo');

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -3, scale: 1.01 }}
            className={`neon-element rounded-xl sm:rounded-2xl p-3.5 sm:p-6 border ${categoryStyle.borderColor} hover:border-opacity-70 transition-all relative group cursor-pointer ${categoryStyle.neonGlow}`}
            style={{
                background: categoryStyle.bgGradient,
                overflow: isMenuOpen ? 'visible' : 'hidden'
            }}
        >
            {/* Orbe subtil */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-white/5 to-white/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center gap-3 sm:gap-5 relative z-10">
                {/* Image PNG de catégorie */}
                <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="flex-shrink-0"
                >
                    <img
                        src={categoryStyle.illustration}
                        alt={event.category}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    />
                </motion.div>

                {/* Contenu central */}
                <div className="flex-1 min-w-0">
                    {/* Titre sur 3 lignes max */}
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2 line-clamp-3 leading-tight group-hover:text-amber-100 transition-colors">
                        {event.title}
                    </h3>

                    {/* Métadonnées - badges sur une ligne, date en dessous */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-x-1.5 text-xs text-gray-400">
                            <span className="px-2 py-0.5 bg-white/5 rounded-md font-medium whitespace-nowrap text-[11px]">
                                {event.period === 'month' ? t('impact.ledger.period_month') || 'Mensuel' : t('impact.ledger.period_year') || 'Annuel'}
                            </span>
                            <span className="text-gray-600 text-[10px]">•</span>
                            <span className="font-medium whitespace-nowrap text-[11px] text-gray-400">
                                {event.source === 'quest' ? (t('impact.ledger.source_quest') || 'Quête') : (t(`impact.ledger.source_${event.source}`) || event.source)}
                            </span>
                        </div>
                        {/* Improved contrast for date: text-gray-400 instead of text-gray-500 */}
                        <div className="text-gray-400 text-[10px]">{formatDate(event.createdAt, language)}</div>
                    </div>
                </div>

                {/* Menu et prix alignés verticalement - Menu tout en haut */}
                <div className="flex flex-col items-end justify-start gap-3 flex-shrink-0 self-start -mt-1">
                    {/* Menu ⋯ tout en haut */}
                    <div className="relative z-50">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleMenu(event.id);
                            }}
                            className="p-0 text-gray-400 hover:text-white transition-colors touch-manipulation rounded-lg hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label={t('impact.ledger.actions.menu') || 'Menu'}
                            aria-expanded={isMenuOpen}
                        >
                            <FaEllipsisV className="w-4 h-4" />
                        </motion.button>

                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 bottom-full mb-2 w-40 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl z-[100] overflow-hidden"
                                >
                                    <motion.button
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.95 }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            onEdit(event);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                        {t('impact.ledger.actions.edit') || 'Modifier'}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.95 }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            onDelete(event);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                        {t('impact.ledger.actions.delete') || 'Supprimer'}
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Prix (élément visuel dominant mis en avant) */}
                    <motion.div
                        className="text-right"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                        <div className="text-[21px] sm:text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent whitespace-nowrap leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                            +{formatCurrency(displayAmount, language)}
                        </div>
                        {/* Suffix added here for clarity */}
                        <div className="text-[10px] font-bold text-amber-500/70 mt-0.5 uppercase tracking-wider">
                            {amountSuffix}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default ImpactEventItem;
