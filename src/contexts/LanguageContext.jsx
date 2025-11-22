import React, { createContext, useState, useEffect, useContext, useRef, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import translations from '../data/lang.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context) return context;
  // Fallback sûr si le Provider n'est pas encore monté (HMR, tests, rendu isolé)
  const fallbackT = (key, params = {}) => {
    try {
      const keys = key.split('.');
      let translation = translations.en;
      for (const k of keys) {
        if (translation && translation[k]) {
          translation = translation[k];
        } else {
          return key;
        }
      }
      if (typeof translation === 'string') {
        Object.keys(params).forEach(param => {
          translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
        });
        return translation;
      }
      return translation || key;
    } catch {
      return key;
    }
  };
  return {
    currentLang: 'en',
    setCurrentLang: () => {},
    language: 'en',
    setLanguage: () => {},
    t: fallbackT,
    translations,
    isLoading: false
  };
};

export const LanguageProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const localUpdateRef = useRef(null); // Track local updates to prevent Firebase override

  // Translation helper function with nested key support
  // Memoize to ensure it updates when currentLang changes
  const t = useMemo(() => {
    return (key, params = {}) => {
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
  }, [currentLang]);

  // Change language function
  const changeLanguage = (newLang) => {
    if (newLang && (newLang === 'en' || newLang === 'fr')) {
      setCurrentLang(prevLang => {
        if (newLang !== prevLang) {
          console.log('LanguageContext: Changing language from', prevLang, 'to', newLang);
      localStorage.setItem('financequest_language', newLang);
          // Mark this as a local update to prevent Firebase override
          localUpdateRef.current = { lang: newLang, timestamp: Date.now() };
          return newLang;
        }
        return prevLang;
      });
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
              
              // Always update if language changed (use functional update to avoid stale closure)
              if (userLang === 'en' || userLang === 'fr') {
                setCurrentLang(prevLang => {
                  // Ignore Firebase update if we just made a local update (within last 2 seconds)
                  if (localUpdateRef.current && 
                      localUpdateRef.current.lang === userLang && 
                      Date.now() - localUpdateRef.current.timestamp < 2000) {
                    console.log('LanguageContext: Ignoring Firebase update (recent local update)');
                    return prevLang;
                  }
                  
                  if (userLang !== prevLang) {
                    console.log('LanguageContext: Firebase listener updating language from', prevLang, 'to', userLang);
                localStorage.setItem('financequest_language', userLang);
                    // Clear local update ref since Firebase confirmed the change
                    localUpdateRef.current = null;
                    return userLang;
                  }
                  return prevLang;
                });
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