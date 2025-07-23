import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import QuestList from './components/QuestList';
import QuestDetail from './components/QuestDetail';
import LanguageToggle from './components/LanguageToggle';
import translations from './lang.json';
import { AuthProvider, useAuth } from './context/AuthContext';
import Premium from './components/Premium';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function SuccessRedirect() {
  const { search } = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get('success') === 'true' && user) {
      // Simule update premium (en vrai, webhook Stripe le ferait)
      user.premium = true; // À remplacer par Firestore update via webhook
    }
  }, [search, user]);

  return <Navigate to="/dashboard" />;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');

  // Translation helper with fallback
  const t = (key) => {
    if (!translations || !translations[currentLang]) {
      return translations?.en?.[key] || key;
    }
    return translations[currentLang][key] || translations.en?.[key] || key;
  };

  // Handle language change
  const handleLanguageChange = (newLang) => {
    setCurrentLang(newLang);
  };

  // Initialize language from user or localStorage
  useEffect(() => {
    if (user?.lang) {
      // Use user's language from Firestore
      setCurrentLang(user.lang);
    } else {
      // Fallback to localStorage or default 'en'
      const savedLang = localStorage.getItem('language') || 'en';
      setCurrentLang(savedLang);
    }
  }, [user]);

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', currentLang);
  }, [currentLang]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading FinanceQuest...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Language Toggle - Always visible */}
      <LanguageToggle 
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        translations={translations}
      />
      
      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <Routes>
        <Route 
          path="/" 
          element={<Home t={t} currentLang={currentLang} />} 
        />
        <Route 
          path="/login" 
          element={<Login t={t} currentLang={currentLang} />} 
        />
        <Route 
          path="/register" 
          element={<Register t={t} currentLang={currentLang} />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard t={t} currentLang={currentLang} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/quests" 
          element={
            <PrivateRoute>
              <QuestList t={t} currentLang={currentLang} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/quests/:id" 
          element={
            <PrivateRoute>
              <QuestDetail t={t} currentLang={currentLang} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/premium" 
          element={
            <PrivateRoute>
              <Premium t={t} currentLang={currentLang} />
            </PrivateRoute>
          } 
        />
        <Route path="/success" element={<SuccessRedirect />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;