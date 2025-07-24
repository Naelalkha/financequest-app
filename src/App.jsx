import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Dashboard from './components/pages/Dashboard';
import QuestList from './components/pages/QuestList';
import QuestDetail from './components/pages/QuestDetail';
import Premium from './components/pages/Premium';
import LanguageToggle from './components/LanguageToggle';
<<<<<<< HEAD
import translations from './lang.json';
import { AuthProvider, useAuth } from './context/AuthContext';
import Premium from './components/Premium';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
=======
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/animations.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  
>>>>>>> working-version
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
    </div>
  );
<<<<<<< HEAD
=======
  
>>>>>>> working-version
  return user ? children : <Navigate to="/login" />;
}

function SuccessRedirect() {
  const { search } = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get('success') === 'true' && user) {
      // Premium update will be handled by Stripe webhook
      // This is just for UI feedback
    }
  }, [search, user]);

  return <Navigate to="/dashboard" />;
}

function AppContent() {
  const { user, loading } = useAuth();
<<<<<<< HEAD
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
=======
  const { t, isLoading: langLoading } = useLanguage();

  if (loading || langLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400 animate-pulse">Loading FinanceQuest...</p>
        </div>
      </div>
    );
  }
>>>>>>> working-version

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
    <div className="min-h-screen bg-gray-900 text-transition">
      {/* Language Toggle - Always visible */}
      <LanguageToggle />
      
      {/* Toast Container with custom styling */}
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
        toastClassName="rounded-lg shadow-xl"
      />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/quests" 
          element={
            <PrivateRoute>
              <QuestList />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/quests/:id" 
          element={
            <PrivateRoute>
              <QuestDetail />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/premium" 
          element={
            <PrivateRoute>
              <Premium />
            </PrivateRoute>
          } 
        />
        <Route path="/success" element={<SuccessRedirect />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-yellow-400 mb-4">404</h1>
              <p className="text-xl text-gray-400 mb-8">{t('errors.not_found')}</p>
              <a href="/" className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors">
                {t('home.cta_start')}
              </a>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
<<<<<<< HEAD
      <Router>
        <AppContent />
      </Router>
=======
      <LanguageProvider>
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
>>>>>>> working-version
    </AuthProvider>
  );
}

export default App;