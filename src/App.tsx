import { BrowserRouter as Router } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './contexts/AuthContext';
import { BackgroundProvider } from './contexts/BackgroundContext';
import './styles/animations.css';
import AppBackground from './components/layout/AppBackground';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AppRouter from './AppRouter';

// Main app content
function AppContent(): React.ReactElement {
    const { loading } = useAuth();
    const { t } = useTranslation('common');

    // Show loading screen
    if (loading) {
        return (
            <AppBackground>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="mb-6 flex items-center justify-center">
                            <LoadingSpinner size="lg" />
                        </div>
                        <p className="text-gray-400 text-lg font-medium">
                            {t('ui.loading_app') || 'Loading Moniyo...'}
                        </p>
                    </div>
                </div>
            </AppBackground>
        );
    }

    return (
        <AppBackground>
            <AppRouter />
        </AppBackground>
    );
}

// Main App component
function App(): React.ReactElement {
    return (
        <Router>
            <BackgroundProvider>
                <AppContent />
            </BackgroundProvider>
        </Router>
    );
}

export default App;
