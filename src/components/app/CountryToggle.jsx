import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FaFlag } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';

const CountryToggle = () => {
  const { user, updateUserProfile } = useAuth();
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef(null);

  const countries = useMemo(() => ([
    { code: 'fr-FR', label: 'France', flag: '🇫🇷', active: true },
    { code: 'en-US', label: 'United States', flag: '🇺🇸', active: true },
    { code: 'de-DE', label: 'Deutschland', flag: '🇩🇪', active: false },
  ]), []);

  const currentCode = user?.country || 'fr-FR';
  const currentCountry = countries.find(c => c.code === currentCode) || countries[0];

  // Decide whether to open up to avoid bottom nav overlap
  useEffect(() => {
    if (!showMenu) return;
    const estimateMenuHeight = 200; // approx
    const safeBottom = 88; // bottom nav + safe area
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUpwards(spaceBelow < estimateMenuHeight + safeBottom);
  }, [showMenu]);

  const handleCountryChange = async (newCode) => {
    if (newCode === currentCode || isChanging) return;
    const selected = countries.find(c => c.code === newCode);
    if (!selected) return;
    if (!selected.active) {
      toast.info('Ce pays arrive bientôt !');
      return;
    }

    setIsChanging(true);
    setShowMenu(false);

    try {
      await updateUserProfile({ country: newCode });
      toast.success('✨ Pays mis à jour !', { autoClose: 1800 });
    } catch (e) {
      console.error('Error updating country:', e);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setTimeout(() => setIsChanging(false), 400);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Toggle Button styled like language select */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isChanging}
        className={`
          flex flex-col sm:flex-row sm:items-center sm:justify-between w-full
          text-white hover:bg-white/[0.02] transition-colors
          ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label="Changer de pays"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
            <FaFlag className="text-green-400" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-white font-semibold">Pays</p>
            <p className="text-sm text-gray-400 sm:whitespace-nowrap">{t('profilePage.country_sub') || 'Quêtes spécifiques'}</p>
          </div>
        </div>
        <div className="w-full sm:w-64 sm:ml-3 mt-3 sm:mt-0 flex items-center justify-between sm:justify-center gap-2 px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-base flex-shrink-0">
          <span className="font-medium">{currentCountry.flag} {currentCountry.label}</span>
          <span className={`text-sm transition-transform ${showMenu ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {/* Menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className={`absolute left-0 right-0 ${openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'} w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-[120] animate-slideDown text-base`}>
            {countries.map((c) => (
              <button
                key={c.code}
                onClick={() => handleCountryChange(c.code)}
                disabled={!c.active || c.code === currentCode || isChanging}
                className={`
                  w-full px-4 py-3 flex items-center gap-3
                  transition-all duration-300
                  ${c.code === currentCode
                    ? 'bg-emerald-500/15 text-emerald-300 cursor-default'
                    : c.active
                      ? 'text-white hover:bg-gray-700 hover:text-amber-300'
                      : 'text-gray-500 cursor-not-allowed opacity-50'}
                `}
              >
                <span className="text-xl">{c.flag}</span>
                <span className="font-medium">{c.label}</span>
                {c.code === currentCode && (
                  <span className="ml-auto text-xs">✓</span>
                )}
                {!c.active && (
                  <span className="ml-auto text-xs text-gray-600">Soon</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Loading overlay */}
      {isChanging && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-xl">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-400 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default CountryToggle;


