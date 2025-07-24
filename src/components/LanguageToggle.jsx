import React, { useState } from 'react';
import { FaGlobe, FaSpinner } from 'react-icons/fa';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';

function LanguageToggle() {
  const { user } = useAuth();
  const { currentLang, setCurrentLang, t } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleLanguageSwitch = async () => {
    if (isChanging) return;
    
    setIsChanging(true);
    const newLang = currentLang === 'en' ? 'fr' : 'en';
    
    try {
      // Update local state immediately for better UX
      setCurrentLang(newLang);
      localStorage.setItem('language', newLang);
      
      // Update user language in Firestore if logged in
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          lang: newLang,
          lastUpdated: new Date()
        });
      }
      
      // Show success toast
      const successMessage = newLang === 'fr' 
        ? '🇫🇷 Langue changée en français !' 
        : '🇬🇧 Language changed to English!';
      
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: 'bold'
        },
        icon: '✨'
      });
      
    } catch (error) {
      console.error('Error updating language:', error);
      
      // Still keep the local change even if Firestore fails
      toast.warn(
        newLang === 'fr' 
          ? 'Langue changée localement' 
          : 'Language changed locally',
        {
          position: "top-right",
          autoClose: 2000,
        }
      );
    } finally {
      setTimeout(() => setIsChanging(false), 500);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleLanguageSwitch}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isChanging}
        className={`
          relative overflow-hidden
          bg-gradient-to-r from-yellow-500 to-orange-500 
          hover:from-yellow-600 hover:to-orange-600 
          disabled:from-gray-500 disabled:to-gray-600
          text-white px-5 py-2.5 rounded-full 
          flex items-center gap-2.5
          font-semibold text-sm
          transition-all duration-300 
          transform hover:scale-105 active:scale-95
          shadow-lg hover:shadow-xl
          ${isChanging ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
        `}
        aria-label={t('settings.language')}
        title={currentLang === 'en' ? '🇫🇷 Passer en Français' : '🇬🇧 Switch to English'}
      >
        {/* Animated globe icon */}
        <div className={`transition-transform duration-500 ${isChanging ? 'animate-spin' : ''}`}>
          {isChanging ? (
            <FaSpinner className="text-lg" />
          ) : (
            <FaGlobe className={`text-lg ${isHovered ? 'animate-pulse' : ''}`} />
          )}
        </div>
        
        {/* Language text with slide animation */}
        <div className="relative h-5 w-8 overflow-hidden">
          <div className={`absolute inset-0 transition-transform duration-300 ${
            isChanging ? (currentLang === 'en' ? '-translate-y-full' : 'translate-y-0') : ''
          }`}>
            <div className="flex flex-col">
              <span className="h-5 flex items-center justify-center">
                {currentLang === 'en' ? 'EN' : 'FR'}
              </span>
              <span className="h-5 flex items-center justify-center">
                {currentLang === 'en' ? 'FR' : 'EN'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Flag indicator */}
        <span className="text-base ml-1">
          {currentLang === 'en' ? '🇬🇧' : '🇫🇷'}
        </span>
        
        {/* Ripple effect on click */}
        {isChanging && (
          <span className="absolute inset-0 rounded-full animate-ping bg-white opacity-30" />
        )}
      </button>
      
      {/* Tooltip on hover */}
      <div className={`
        absolute top-full right-0 mt-2 
        transition-all duration-300 pointer-events-none
        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}>
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap border border-gray-700 shadow-xl">
          {currentLang === 'en' 
            ? '🇫🇷 Passer en Français' 
            : '🇬🇧 Switch to English'
          }
          <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
}

export default LanguageToggle;