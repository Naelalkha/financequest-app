import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash, FaGoogle, FaApple, FaEnvelope, FaLock, FaSpinner, FaCoins, FaTrophy, FaFire } from 'react-icons/fa';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function Login({ t, currentLang }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Real-time validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setValidationErrors(prev => ({ ...prev, email: t('invalidEmail') || 'Invalid email format' }));
    } else {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value && !validatePassword(value)) {
      setValidationErrors(prev => ({ ...prev, password: t('passwordTooShort') || 'Password must be at least 6 characters' }));
    } else {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    const errors = {};
    if (!email) errors.email = t('emailRequired') || 'Email is required';
    else if (!validateEmail(email)) errors.email = t('invalidEmail') || 'Invalid email format';
    
    if (!password) errors.password = t('passwordRequired') || 'Password is required';
    else if (!validatePassword(password)) errors.password = t('passwordTooShort') || 'Password must be at least 6 characters';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await login(email, password);
      
      // Success toast
      toast.success(t('loginSuccess') || 'Welcome back! 🎉', {
        position: "top-center",
        autoClose: 3000,
      });
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = t('loginError') || 'Login failed';
      
      // Handle specific error types
      if (err.code === 'auth/user-not-found') {
        errorMessage = t('userNotFound') || 'No account found with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = t('wrongPassword') || 'Incorrect password';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = t('invalidEmail') || 'Invalid email format';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = t('accountDisabled') || 'Account has been disabled';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = t('tooManyAttempts') || 'Too many failed attempts. Please try again later';
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo login for testing
  const handleDemoLogin = async () => {
    setEmail('demo@financequest.com');
    setPassword('demo123');
    setIsSubmitting(true);
    
    try {
      await login('demo@financequest.com', 'demo123');
      toast.success('Demo account logged in! 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Demo account unavailable');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load remembered email on component mount
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
      <Link to="/" className="absolute top-6 left-6 text-gold-400 hover:text-gold-300 transition-colors group">
        <div className="flex items-center gap-2">
          <FaArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="hidden sm:inline">{t('back') || 'Back'}</span>
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
            {t('welcome')} {t('back')}!
          </h2>
          <p className="text-gray-400">{t('loginToContinue') || 'Sign in to continue your financial journey'}</p>
        </div>

        {/* Quick stats preview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg text-center border border-gray-700">
            <FaTrophy className="text-gold-400 text-xl mx-auto mb-1" />
            <p className="text-xs text-gray-400">Level Up</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg text-center border border-gray-700">
            <FaFire className="text-orange-400 text-xl mx-auto mb-1" />
            <p className="text-xs text-gray-400">Streaks</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg text-center border border-gray-700">
            <FaCoins className="text-yellow-400 text-xl mx-auto mb-1" />
            <p className="text-xs text-gray-400">Rewards</p>
          </div>
        </div>
        
        {/* Login Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaEnvelope className="inline mr-2" />
                {t('email')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                    validationErrors.email 
                      ? 'border-red-500 focus:border-red-400' 
                      : 'border-gray-600 focus:border-gold-500'
                  }`}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
                {email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {validateEmail(email) ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
              {validationErrors.email && (
                <p className="text-red-400 text-xs mt-2">{validationErrors.email}</p>
              )}
            </div>
            
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaLock className="inline mr-2" />
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 pr-12 ${
                    validationErrors.password 
                      ? 'border-red-500 focus:border-red-400' 
                      : 'border-gray-600 focus:border-gold-500'
                  }`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-red-400 text-xs mt-2">{validationErrors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-gold-500 bg-gray-700 border-gray-600 rounded focus:ring-gold-500 focus:ring-2"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm text-gray-300">{t('rememberMe') || 'Remember me'}</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-gold-400 hover:text-gold-300 transition-colors"
              >
                {t('forgotPassword')}
              </Link>
            </div>
            
            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting || Object.values(validationErrors).some(error => error)}
              className="w-full bg-gradient-to-r from-gold-500 to-yellow-500 text-gray-900 py-3 rounded-lg font-semibold hover:from-gold-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" />
                  {t('signingIn') || 'Signing in...'}
                </div>
              ) : (
                t('login')
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <div className="px-4 text-gray-400 text-sm">{t('or') || 'or'}</div>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Demo Login */}
          <button
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 mb-4 disabled:opacity-50"
          >
            <div className="flex items-center justify-center gap-2">
              <FaCoins className="text-gold-400" />
              {t('tryDemo') || 'Try Demo Account'}
            </div>
          </button>

          {/* Social Login Buttons (for future implementation) */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              disabled={true}
              title="Coming soon"
            >
              <FaGoogle />
              <span className="hidden sm:inline">Google</span>
            </button>
            <button 
              className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              disabled={true}
              title="Coming soon"
            >
              <FaApple />
              <span className="hidden sm:inline">Apple</span>
            </button>
          </div>
        </div>
        
        {/* Register Link */}
        <p className="mt-8 text-center text-gray-400">
          {t('dontHaveAccount')}{' '}
          <Link to="/register" className="text-gold-400 hover:text-gold-300 font-semibold transition-colors">
            {t('register')}
          </Link>
        </p>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 {t('secureLogin') || 'Your data is encrypted and secure'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;