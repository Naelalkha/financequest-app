// Exemple de comment mettre à jour Login.jsx avec la nouvelle structure

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCoins, FaArrowLeft, FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext'; // CHANGÉ : nouveau path
import { useLanguage } from '../../contexts/LanguageContext'; // NOUVEAU : ajout du contexte langue
import { toast } from 'react-toastify';

function Login() { // CHANGÉ : plus de props t et currentLang
  const { login } = useAuth();
  const { t } = useLanguage(); // NOUVEAU : récupérer t depuis le contexte
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('auth.fill_all_fields') || 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      toast.success(t('auth.login_success') || 'Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific Firebase errors
      let errorMessage = t('auth.login_error') || 'Invalid email or password';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = t('auth.user_not_found') || 'No account found with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = t('auth.wrong_password') || 'Incorrect password';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = t('auth.invalid_email') || 'Invalid email address';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo login
  const handleDemoLogin = async () => {
    setEmail('demo@financequest.com');
    setPassword('demo123');
    setIsSubmitting(true);
    
    try {
      await login('demo@financequest.com', 'demo123');
      toast.success(t('auth.demo_welcome') || 'Welcome to the demo! 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(t('auth.demo_unavailable') || 'Demo account unavailable');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check for remembered email on mount
  useState(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-gold-400 hover:text-gold-300 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <FaArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="hidden sm:inline">{t('back')}</span>
        </div>
      </Link>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-gold-500 to-yellow-500 p-4 rounded-full">
              <FaCoins className="text-3xl text-gray-900" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-yellow-300 mb-2">
            {t('auth.welcome_back')}!
          </h2>
          <p className="text-gray-400">
            {t('auth.login_subtitle') || 'Continue your financial journey'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              {t('auth.email')}
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                placeholder={t('auth.email_placeholder') || 'your@email.com'}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              {t('auth.password')}
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-gray-800 border-gray-700 rounded text-gold-500 focus:ring-gold-500"
              />
              <span className="ml-2 text-sm text-gray-400">
                {t('auth.remember_me')}
              </span>
            </label>
            <Link 
              to="/forgot-password" 
              className="text-sm text-gold-400 hover:text-gold-300 transition-colors"
            >
              {t('auth.forgot_password')}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-gold-500 to-yellow-500 text-gray-900 font-bold rounded-lg hover:from-gold-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? t('auth.logging_in') || 'Logging in...' : t('auth.login')}
          </button>

          {/* Demo Account */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="w-full py-3 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {t('auth.demo_login')}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-500">{t('auth.or')}</span>
            </div>
          </div>

          {/* Social Login */}
          <button
            type="button"
            disabled={isSubmitting}
            className="w-full py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaGoogle className="text-lg" />
            {t('auth.continue_with_google')}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-8 text-center text-gray-400">
          {t('auth.no_account')}{' '}
          <Link 
            to="/register" 
            className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
          >
            {t('auth.signup')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login; // Pas de changement ici