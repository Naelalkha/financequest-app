import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaArrowLeft, FaEye, FaEyeSlash, FaRocket, FaGlobe } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-toastify';

const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'fr-FR'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.country) {
      toast.error(t('auth.fill_all_fields') || 'Please fill in all fields');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error(t('auth.password_too_short') || 'Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwords_dont_match') || 'Passwords do not match');
      return false;
    }

    if (!agreedToTerms) {
      toast.error(t('auth.agree_to_terms') || 'Please agree to the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await register(formData.email, formData.password, formData.name, formData.country);
      toast.success(t('auth.register_success') || 'Welcome to FinanceQuest! 🚀');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = t('auth.register_error') || 'Failed to create account';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = t('auth.email_in_use') || 'This email is already registered';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = t('auth.invalid_email') || 'Invalid email address';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = t('auth.weak_password') || 'Password is too weak';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success(t('auth.register_success') || 'Welcome to FinanceQuest! 🚀');
      navigate('/dashboard');
    } catch (err) {
      console.error('Google signup error:', err);
      toast.error(t('auth.google_signup_error') || 'Failed to sign up with Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          {t('ui.back') || 'Back'}
        </Link>

        {/* Register Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4 shadow-lg">
              <FaRocket className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('auth.register_title') || 'Start your journey'}
            </h1>
            <p className="text-gray-400">
              {t('auth.register_subtitle') || 'Join 50,000+ users leveling up their finances'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.full_name') || 'Full Name'}
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.email') || 'Email'}
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Country Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.country') || 'Country'}
              </label>
              <div className="relative">
                <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none cursor-pointer"
                  disabled={isSubmitting}
                >
                  <option value="fr-FR">🇫🇷 France</option>
                  <option value="en-US">🇺🇸 United States</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('auth.country_hint') || 'This will determine which country-specific quests you see'}
              </p>
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
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
              <p className="text-xs text-gray-500 mt-1">
                {t('auth.password_hint') || 'At least 6 characters'}
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.confirm_password') || 'Confirm Password'}
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 bg-gray-900 border-gray-700 rounded text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-300">
                {t('auth.agree_terms_start') || 'I agree to the'}{' '}
                <Link to="/terms" className="text-yellow-400 hover:text-yellow-300">
                  {t('auth.terms') || 'Terms'}
                </Link>{' '}
                {t('auth.and') || 'and'}{' '}
                <Link to="/privacy" className="text-yellow-400 hover:text-yellow-300">
                  {t('auth.privacy') || 'Privacy Policy'}
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-3 rounded-lg font-bold text-lg
                transform transition-all duration-300
                ${isSubmitting
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600 hover:scale-105 shadow-lg'
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                  {t('ui.processing') || 'Processing...'}
                </span>
              ) : (
                t('auth.create_account') || 'Create Account'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  {t('auth.or_continue_with') || 'Or continue with'}
                </span>
              </div>
            </div>

            {/* Google Signup */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isSubmitting}
              className="w-full py-3 bg-gray-900 border border-gray-700 rounded-lg font-medium text-white hover:bg-gray-700 hover:border-gray-600 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <FaGoogle className="text-xl" />
              {t('auth.continue_with_google') || 'Continue with Google'}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-gray-400 mt-8">
            {t('auth.already_have_account') || 'Already have an account?'}{' '}
            <Link
              to="/login"
              className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
            >
              {t('auth.login') || 'Login'}
            </Link>
          </p>
        </div>

        {/* Benefits reminder */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <div className="text-gray-400">
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-xs">{t('home.quests') || 'Quests'}</div>
          </div>
          <div className="text-gray-400">
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-xs">{t('home.free') || 'Free'}</div>
          </div>
          <div className="text-gray-400">
            <div className="text-2xl font-bold text-white">5min</div>
            <div className="text-xs">{t('home.daily') || 'Daily'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;