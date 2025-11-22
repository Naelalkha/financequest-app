import React, { useState, useEffect, useRef } from 'react';
import { FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const LanguageToggle = () => {
  const { t, currentLang, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef(null);

  const languages = [
    { code: 'en', label: currentLang === 'fr' ? 'Anglais' : 'English', flag: '🇬🇧', active: true },
    { code: 'fr', label: currentLang === 'fr' ? 'Français' : 'French', flag: '🇫🇷', active: true },
    { code: 'es', label: currentLang === 'fr' ? 'Espagnol' : 'Spanish', flag: '🇪🇸', active: false },
    { code: 'de', label: currentLang === 'fr' ? 'Allemand' : 'German', flag: '🇩🇪', active: false }
  ];

  const handleLanguageChange = async (newLang) => {
    if (newLang === currentLang || isChanging) return;
    
    const selectedLang = languages.find(l => l.code === newLang);
    if (!selectedLang) return;
    
    if (!selectedLang.active) {
      toast.info(t('profilePage.language_coming_soon') || 'This language is coming soon!');
      return;
    }

    setIsChanging(true);
    setShowMenu(false);

    try {
      // Update language in context IMMEDIATELY for instant UI feedback
      setLanguage(newLang);
      
      // Update in Firebase if user is logged in
      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { 
            lang: newLang,
            language: newLang // Store both for compatibility
          });
          console.log('Language updated in Firebase:', newLang);
        } catch (firebaseError) {
          console.error('Error updating language in Firebase:', firebaseError);
          // Language already updated locally, so UI is already correct
        }
      }
      
      // Show success message
      const messages = {
        en: t('profilePage.language_changed_en') || 'Language changed to English',
        fr: t('profilePage.language_changed_fr') || 'Langue changée en Français'
      };
      
      toast.success(messages[newLang] || t('profilePage.language_updated') || 'Language updated!', {
        icon: selectedLang.flag,
        autoClose: 2000
      });
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error(t('profilePage.language_change_failed') || 'Failed to change language');
      // Fallback to local update
      setLanguage(newLang);
    } finally {
      setTimeout(() => setIsChanging(false), 500);
    }
  };

  const currentLangData = languages.find(l => l.code === currentLang) || languages[0];

  // Decide whether to open the menu upward to avoid overlapping the bottom nav
  useEffect(() => {
    if (!showMenu) return;
    const estimateMenuHeight = 260; // px (approx 4 items)
    const safeBottom = 88; // px (bottom nav + safe area)
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUpwards(spaceBelow < estimateMenuHeight + safeBottom);
  }, [showMenu]);

  return (
    <div ref={containerRef} className="relative">
      {/* Toggle Button styled like country select */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isChanging}
        className={`
          flex flex-col sm:flex-row sm:items-center sm:justify-between w-full
          text-white hover:bg-white/[0.02] transition-colors
          ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label={t('profilePage.change_language') || 'Change language'}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <FaGlobe className="text-blue-400" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-white font-semibold">{t('profilePage.language_label') || 'Langue'}</p>
            <p className="text-sm text-gray-400 whitespace-nowrap">{t('profilePage.language_sub') || 'Interface et contenu'}</p>
          </div>
        </div>
        <div className="w-full sm:w-64 sm:ml-3 mt-3 sm:mt-0 flex items-center justify-between sm:justify-center gap-2 px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-base flex-shrink-0">
          <span className="font-medium">{currentLangData.flag} {currentLangData.label}</span>
          <span className={`text-sm transition-transform ${showMenu ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {/* Language Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className={`absolute left-0 right-0 ${openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'} w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-[120] animate-slideDown text-base`}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={!lang.active || lang.code === currentLang || isChanging}
                className={`
                  w-full px-4 py-3 flex items-center gap-3
                  transition-all duration-300
                  ${lang.code === currentLang 
                    ? 'bg-yellow-500/20 text-yellow-400 cursor-default' 
                    : lang.active
                      ? 'text-white hover:bg-gray-700 hover:text-yellow-400'
                      : 'text-gray-500 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.label}</span>
                {lang.code === currentLang && (
                  <span className="ml-auto text-xs">✓</span>
                )}
                {!lang.active && (
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
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;