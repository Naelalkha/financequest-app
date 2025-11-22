import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Dashboard from './components/pages/Dashboard';
import QuestList from './components/pages/QuestList';
import QuestRouter from './components/pages/QuestRouter';
import Premium from './components/pages/Premium';
import Profile from './components/pages/Profile';
import Onboarding from './components/pages/Onboarding';
import StarterPackHub from './components/pages/StarterPackHub';
import Impact from './components/pages/Impact';
import Achievements from './components/pages/Achievements';
import BottomNav from './components/app/BottomNav';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/animations.css';
import LoadingSpinner from './components/app/LoadingSpinner';
import AppBackground from './components/app/AppBackground';

// Private route wrapper
function PrivateRoute({ children, skipOnboarding = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <AppBackground variant="nebula" grain grid={false} animate>
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="" />
      </div>
    </AppBackground>
  );

  if (!user) return <Navigate to="/login" />;

  // Vérifier si l'onboarding est complété (sauf pour la route onboarding elle-même)
  if (!skipOnboarding && user.onboardingCompleted === false && location.pathname !== '/onboarding') {
    console.log('🔄 PrivateRoute: Redirecting to onboarding. User:', user?.uid, 'onboardingCompleted:', user?.onboardingCompleted, 'path:', location.pathname);
    return <Navigate to="/onboarding" />;
  }

  console.log('✅ PrivateRoute: Access granted. User:', user?.uid, 'onboardingCompleted:', user?.onboardingCompleted, 'path:', location.pathname);

  return children;
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
      <AppBackground variant="nebula" grain grid={false} animate>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="mb-6 flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
            <p className="text-gray-400 text-lg font-medium">
              {t('ui.loading_app') || 'Loading FinanceQuest...'}
            </p>
          </div>
        </div>
      </AppBackground>
    );
  }

  // Routes that don't show bottom nav
  const noNavRoutes = ['/', '/login', '/register', '/onboarding', '/starter-pack'];
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
            path="/onboarding"
            element={
              <PrivateRoute skipOnboarding={true}>
                <Onboarding />
              </PrivateRoute>
            }
          />
          <Route
            path="/starter-pack"
            element={
              <PrivateRoute>
                <StarterPackHub />
              </PrivateRoute>
            }
          />
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
                <QuestRouter />
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
          <Route
            path="/impact"
            element={
              <PrivateRoute>
                <Impact />
              </PrivateRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <PrivateRoute>
                <Achievements />
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
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;