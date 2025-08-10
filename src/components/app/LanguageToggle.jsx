import React, { useState } from 'react';
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

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧', active: true },
    { code: 'fr', label: 'Français', flag: '🇫🇷', active: true },
    { code: 'es', label: 'Español', flag: '🇪🇸', active: false },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪', active: false }
  ];

  const handleLanguageChange = async (newLang) => {
    if (newLang === currentLang || isChanging) return;
    
    const selectedLang = languages.find(l => l.code === newLang);
    if (!selectedLang) return;
    
    if (!selectedLang.active) {
      toast.info('This language is coming soon!');
      return;
    }

    setIsChanging(true);
    setShowMenu(false);

    try {
      // Update language in context
      setLanguage(newLang);
      
      // Update in Firebase if user is logged in
      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { 
            lang: newLang,
            language: newLang // Store both for compatibility
          });
        } catch (firebaseError) {
          console.error('Error updating language in Firebase:', firebaseError);
          // Continue even if Firebase update fails
        }
      }
      
      // Show success message
      const messages = {
        en: 'Language changed to English',
        fr: 'Langue changée en Français'
      };
      
      toast.success(messages[newLang] || 'Language updated!', {
        icon: selectedLang.flag,
        autoClose: 2000
      });
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error('Failed to change language');
    } finally {
      setTimeout(() => setIsChanging(false), 500);
    }
  };

  const currentLangData = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isChanging}
        className={`
          flex items-center gap-2 px-4 py-2 
          bg-gray-800 border border-gray-700 rounded-xl
          text-white hover:border-yellow-500 
          transition-all duration-300 group
          ${isChanging ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          ${showMenu ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : ''}
        `}
        aria-label="Change language"
      >
        <FaGlobe className={`text-lg ${showMenu ? 'text-yellow-400' : 'text-gray-400'} group-hover:text-yellow-400 transition-colors`} />
        <span className="font-medium">{currentLangData.flag} {currentLangData.code.toUpperCase()}</span>
        <span className={`text-xs transition-transform ${showMenu ? 'rotate-180' : ''}`}>▼</span>
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
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-slideDown">
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
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-400 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;