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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/animations.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  
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
      // Premium update will be handled by Stripe webhook
      // This is just for UI feedback
    }
  }, [search, user]);

  return <Navigate to="/dashboard" />;
}

function AppContent() {
  const { user, loading } = useAuth();
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
      <LanguageProvider>
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;