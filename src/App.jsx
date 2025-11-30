import { BrowserRouter as Router } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/animations.css';
import AppBackground from './components/layout/AppBackground';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AppRouter from './AppRouter';

// Main app content
function AppContent() {
  const { loading } = useAuth();
  const { t } = useTranslation('common');

  // Show loading screen
  if (loading) {
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

  return (
    <AppBackground>
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

      <AppRouter />
    </AppBackground>
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