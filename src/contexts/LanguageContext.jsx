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

  // Initialize language from user data or localStorage
  useEffect(() => {
    const initLanguage = async () => {
      if (user?.uid) {
        // Listen to user's language preference from Firestore
        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const userLang = userData.lang || 'en';
            setCurrentLang(userLang);
            localStorage.setItem('language', userLang);
          }
          setIsLoading(false);
        }, (error) => {
          console.error('Error fetching user language:', error);
          // Fallback to localStorage
          const savedLang = localStorage.getItem('language') || 'en';
          setCurrentLang(savedLang);
          setIsLoading(false);
        });

        return () => unsubscribe();
      } else {
        // No user, use localStorage
        const savedLang = localStorage.getItem('language') || 'en';
        setCurrentLang(savedLang);
        setIsLoading(false);
      }
    };

    initLanguage();
  }, [user]);

  const value = {
    currentLang,
    setCurrentLang,
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