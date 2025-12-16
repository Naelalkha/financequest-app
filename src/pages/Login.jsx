import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertTriangle, UserX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import AuthLayout from '../components/layout/AuthLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Login = () => {
  const { login, loginWithGoogle, user } = useAuth();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is anonymous (logging into existing account will lose progress)
  const isAnonymous = user?.isAnonymous;

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('fill_all_fields') || 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      localStorage.setItem('rememberedEmail', email);
      toast.success(t('login_success') || 'Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = t('login_error') || 'Invalid email or password';
      if (err.code === 'auth/user-not-found') errorMessage = t('user_not_found') || 'No account found with this email';
      else if (err.code === 'auth/wrong-password') errorMessage = t('wrong_password') || 'Incorrect password';
      else if (err.code === 'auth/invalid-email') errorMessage = t('invalid_email') || 'Invalid email address';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success(t('login_success') || 'Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      toast.error(t('google_login_error') || 'Failed to login with Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <AuthLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <h2 className="font-sans font-bold text-xl text-white mb-6 tracking-tight">
          {t('login_title')}
        </h2>

        {/* Warning for anonymous users logging into existing account */}
        {isAnonymous && (
          <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-neutral-300 text-xs">
                <span className="text-amber-500 font-medium">{t('login_warning_attention') || 'Attention :'}</span> {t('login_warning_message') || 'Vous allez basculer sur votre compte existant. La progression "Invité" actuelle (non sauvegardée) sera perdue.'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Email Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E2FF00] transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              placeholder={t('email') || 'Email Address'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2FF00] focus:bg-white/10 transition-all font-mono text-sm"
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E2FF00] transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              placeholder={t('password') || 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2FF00] focus:bg-white/10 transition-all font-mono text-sm"
            />
          </div>

          {/* Primary Action */}
          <button
            type="submit"
            className="w-full bg-[#E2FF00] text-black font-black font-sans py-4 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(226,255,0,0.2)] hover:shadow-[0_0_30px_rgba(226,255,0,0.4)] active:scale-[0.98] flex items-center justify-center gap-2 mt-4 uppercase tracking-wide"
          >
            {t('login') || 'LOG IN'} <ArrowRight className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-black text-neutral-500">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continuer avec Google</span>
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          {/* Primary alternate action */}
          <p className="text-sm text-neutral-400 font-sans">
            {t('no_account') || 'Pas de compte ?'}{' '}
            <Link 
              to="/register" 
              className="text-[#E2FF00] font-bold hover:text-[#cce600] transition-colors"
            >
              {t('create_account') || 'Créer un compte'}
            </Link>
          </p>

          {/* Guest Access Option */}
          {isAnonymous && (
            <Link 
              to="/dashboard"
              className="w-full py-3 rounded-xl border border-dashed border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-500 transition-all font-mono text-xs flex items-center justify-center gap-2"
            >
              <UserX className="w-3 h-3" />
              {t('continue_as_guest') || 'CONTINUER EN INVITÉ'}
            </Link>
          )}

          {/* Forgot password - least important, at the bottom */}
          <Link to="/forgot-password" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors block">
            {t('forgot_password') || 'Mot de passe oublié ?'}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;