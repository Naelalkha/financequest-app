import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Dashboard from './components/pages/Dashboard';
import QuestList from './components/pages/QuestList';
import QuestDetail from './components/pages/QuestDetail';
import Premium from './components/pages/Premium';
import Profile from './components/pages/Profile';
import BottomNav from './components/BottomNav';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/animations.css';

// Private route wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-700 border-t-yellow-400"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
  
  return user ? children : <Navigate to="/login" />;
}

// Premium route wrapper - redirect to profile if user is premium
function PremiumRoute() {
  const { user } = useAuth();
  
  // Si l'utilisateur est premium, rediriger vers /profile
  if (user?.isPremium) {
    return <Navigate to="/profile" replace />;
  }
  
  // Sinon, afficher la page Premium
  return <Premium />;
}

// Success redirect handler
function SuccessRedirect() {
  const { search } = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get('success') === 'true' && user) {
      // Premium update handled by Stripe webhook
    }
  }, [search, user]);

  return <Navigate to="/dashboard" />;
}

// Main app content with layout
function AppContent() {
  const { user, loading } = useAuth();
  const { t, isLoading: langLoading } = useLanguage();
  const location = useLocation();

  // Show loading screen
  if (loading || langLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-700 border-t-yellow-400"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-400 animate-pulse text-lg font-medium">
            {t('ui.loading_app') || 'Loading FinanceQuest...'}
          </p>
        </div>
      </div>
    );
  }

  // Routes that don't show bottom nav
  const noNavRoutes = ['/', '/login', '/register'];
  const showBottomNav = user && !noNavRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen text-white relative overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#1A1508] to-[#2E1F0A]">



      
      {/* Toast Container with custom dark theme */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: '#2D2D2D',
          color: '#FFFFFF',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}
        progressStyle={{
          background: 'linear-gradient(to right, #FFD700, #FFA500)'
        }}
      />
      
      {/* Main content with padding for bottom nav */}
      <div className={showBottomNav ? 'pb-20' : ''}>
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
                <PremiumRoute />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route path="/success" element={<SuccessRedirect />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center px-4">
              <div className="text-center animate-fadeIn">
                <div className="text-8xl font-bold text-yellow-400 mb-4 animate-bounce">404</div>
                <p className="text-xl text-gray-400 mb-8">{t('errors.not_found') || 'Page not found'}</p>
                <a 
                  href="/" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  {t('ui.go_home') || 'Go Home'}
                </a>
              </div>
            </div>
          } />
        </Routes>
      </div>
      
      {/* Bottom Navigation */}
      {showBottomNav && <BottomNav />}
    </div>
  );
}

// Main App component
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