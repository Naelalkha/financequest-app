import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import AppBackground from '../app/AppBackground';
import LoadingSpinner from '../app/LoadingSpinner';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('auth.fill_all_fields') || 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

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
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success(t('auth.login_success') || 'Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login error:', err);
      toast.error(t('auth.google_login_error') || 'Failed to login with Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <LoadingSpinner />;
  }

  return (
    <AppBackground variant="nebula" className="min-h-screen">
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-md">
          {/* Back to home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            {t('ui.back') || 'Back'}
          </Link>

          {/* Login Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden neon-card rounded-2xl p-8 border border-white/10 bg-black/20 backdrop-blur-sm shadow-[0_10px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/5"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 shadow-lg"
              >
                <FaLock className="text-2xl text-gray-900" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('auth.login_title') || 'Welcome back!'}
              </h1>
              <p className="text-gray-400">
                {t('auth.login_subtitle') || 'Login to continue your journey'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('auth.email') || 'Email'}
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/40 transition-colors"
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('auth.password') || 'Password'}
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/40 transition-colors"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 bg-white/[0.04] border-white/10 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-300">
                    {t('auth.remember_me') || 'Remember me'}
                  </span>
                </label>
                
                <Link
                  to="/forgot-password"
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {t('auth.forgot_password') || 'Forgot password?'}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 hover:from-amber-500 hover:to-orange-600 hover:scale-105 shadow-lg transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {t('auth.login') || 'Login'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black/20 text-gray-400">
                    {t('auth.or_continue_with') || 'Or continue with'}
                  </span>
                </div>
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-3 bg-white/[0.04] border border-white/10 rounded-lg font-medium text-white hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <FaGoogle className="text-xl" />
                {t('auth.continue_with_google') || 'Continue with Google'}
              </button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-gray-400 mt-8">
              {t('auth.dont_have_account') || "Don't have an account?"}{' '}
              <Link
                to="/register"
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                {t('auth.register') || 'Sign up'}
              </Link>
            </p>
          </motion.div>


        </div>
      </div>
    </AppBackground>
  );
};

export default Login;