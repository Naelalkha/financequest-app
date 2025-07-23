import { FaGlobe, FaSpinner } from 'react-icons/fa';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function LanguageToggle({ currentLang, onLanguageChange, translations }) {
  const { user } = useAuth();
  const [isChanging, setIsChanging] = useState(false);

  // Translation helper with fallback
  const t = (key) => {
    if (!translations || !translations[currentLang]) {
      return translations?.en?.[key] || key;
    }
    return translations[currentLang][key] || translations.en?.[key] || key;
  };

  // Handle language switch
  const handleLanguageSwitch = async () => {
    if (isChanging) return;
    
    setIsChanging(true);
    const newLang = currentLang === 'en' ? 'fr' : 'en';
    
    try {
      // Update user language in Firestore if logged in
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          lang: newLang
        });
      }
      
      // Update local state via parent callback
      onLanguageChange(newLang);
      
      // Update localStorage as fallback
      localStorage.setItem('language', newLang);
      
      // Show success toast
      const successMessage = newLang === 'fr' 
        ? 'Langue changée en Français !' 
        : 'Language changed to English!';
      
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      
    } catch (error) {
      console.error('Error updating language:', error);
      
      // Fallback to localStorage only
      onLanguageChange(newLang);
      localStorage.setItem('language', newLang);
      
      toast.warn(
        newLang === 'fr' 
          ? 'Langue changée (non synchronisée)' 
          : 'Language changed (not synced)',
        {
          position: "top-right",
          autoClose: 2000,
        }
      );
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleLanguageSwitch}
        disabled={isChanging}
        className={`
          bg-gradient-to-r from-yellow-500 to-orange-500 
          hover:from-yellow-600 hover:to-orange-600 
          disabled:from-gray-500 disabled:to-gray-600
          text-white px-4 py-2 rounded-full 
          flex items-center gap-2 
          font-semibold text-sm
          transition-all duration-300 
          transform hover:scale-105 
          shadow-lg hover:shadow-xl
          ${isChanging ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
        `}
        title={t('switchLanguage') || (currentLang === 'en' ? 'Passer en Français' : 'Switch to English')}
      >
        {isChanging ? (
          <FaSpinner className="animate-spin text-lg" />
        ) : (
          <FaGlobe className={`text-lg transition-transform duration-500 ${
            currentLang === 'fr' ? 'rotate-180' : 'rotate-0'
          }`} />
        )}
        
        <span className="transition-all duration-300">
          {currentLang === 'en' ? 'EN' : 'FR'}
        </span>
        
        {/* Language indicator dot */}
        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
          currentLang === 'en' ? 'bg-blue-300' : 'bg-red-300'
        }`}></div>
        
        {/* Arrow indicator */}
        <div className={`text-xs transition-transform duration-300 ${
          currentLang === 'en' ? 'rotate-0' : 'rotate-180'
        }`}>
          →
        </div>
      </button>
      
      {/* Tooltip on hover */}
      <div className="absolute top-full right-0 mt-2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap border border-gray-700">
          {currentLang === 'en' 
            ? '🇫🇷 Passer en Français' 
            : '🇺🇸 Switch to English'
          }
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
        </div>
      </div>
    </div>
  );
}

export default LanguageToggle;