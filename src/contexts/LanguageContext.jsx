import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import translations from '../data/lang.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  // Translation helper function with nested key support
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let translation = translations[currentLang] || translations.en;
    
    // Navigate through nested keys
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        // Fallback to English if translation not found
        translation = translations.en;
        for (const fallbackKey of keys) {
          if (translation && translation[fallbackKey]) {
            translation = translation[fallbackKey];
          } else {
            return key; // Return key if no translation found
          }
        }
        break;
      }
    }

    // Handle string translations with parameters
    if (typeof translation === 'string') {
      // Replace parameters like {{name}} with actual values
      Object.keys(params).forEach(param => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      });
      return translation;
    }

    return translation || key;
  };

  // Change language function
  const changeLanguage = (newLang) => {
    if (newLang && (newLang === 'en' || newLang === 'fr')) {
      setCurrentLang(newLang);
      localStorage.setItem('financequest_language', newLang);
    }
  };

  // Initialize language from user data or localStorage
  useEffect(() => {
    const initLanguage = async () => {
      try {
        // First check localStorage
        const savedLang = localStorage.getItem('financequest_language');
        if (savedLang && (savedLang === 'en' || savedLang === 'fr')) {
          setCurrentLang(savedLang);
        }

        // If user is logged in, sync with Firestore
        if (user?.uid) {
          const userRef = doc(db, 'users', user.uid);
          
          // Set up real-time listener
          const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              const userLang = userData.lang || userData.language || 'en';
              
              if (userLang === 'en' || userLang === 'fr') {
                setCurrentLang(userLang);
                localStorage.setItem('financequest_language', userLang);
              }
            }
            setIsLoading(false);
          }, (error) => {
            console.error('Error fetching user language:', error);
            setIsLoading(false);
          });

          return () => unsubscribe();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        setIsLoading(false);
      }
    };

    initLanguage();
  }, [user]);

  const value = {
    currentLang,
    setCurrentLang: changeLanguage,
    language: currentLang, // Alias for compatibility
    setLanguage: changeLanguage, // Alias for compatibility
    t,
    translations,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};