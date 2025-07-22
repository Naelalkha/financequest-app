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

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
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

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('language') || 'en');
  const t = (key) => translations[lang][key] || key;

  useEffect(() => {
    localStorage.setItem('language', lang);
  }, [lang]);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <LanguageToggle lang={lang} setLang={setLang} t={t} />
          <Routes>
            <Route path="/" element={<Home t={t} />} />
            <Route path="/login" element={<Login t={t} />} />
            <Route path="/register" element={<Register t={t} />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard t={t} /></PrivateRoute>} />
            <Route path="/quests" element={<PrivateRoute><QuestList t={t} /></PrivateRoute>} />
            <Route path="/quests/:id" element={<PrivateRoute><QuestDetail t={t} /></PrivateRoute>} />
            <Route path="/premium" element={<PrivateRoute><Premium t={t} /></PrivateRoute>} />
            <Route path="/success" element={<SuccessRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;