import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaSpinner, FaCoins, FaRocket, FaShieldAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
<<<<<<< HEAD:src/components/Register.jsx
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
=======
import { useAuth } from '../../contexts/AuthContext';
>>>>>>> working-version:src/components/pages/Register.jsx

function Register({ t, currentLang }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    checks: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false
    }
  });

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return { score, checks };
  };

  // Get password strength color and text
  const getPasswordStrengthInfo = (score) => {
    if (score <= 2) return { color: 'text-red-500', text: t('passwordWeak') || 'Weak', bgColor: 'bg-red-500' };
    if (score <= 3) return { color: 'text-yellow-500', text: t('passwordMedium') || 'Medium', bgColor: 'bg-yellow-500' };
    if (score <= 4) return { color: 'text-blue-500', text: t('passwordGood') || 'Good', bgColor: 'bg-blue-500' };
    return { color: 'text-green-500', text: t('passwordStrong') || 'Strong', bgColor: 'bg-green-500' };
  };

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'email':
        if (value && !validateEmail(value)) {
          errors.email = t('invalidEmail') || 'Invalid email format';
        } else {
          delete errors.email;
        }
        break;
        
      case 'password':
        const strength = calculatePasswordStrength(value);
        setPasswordStrength(strength);
        
        if (value && value.length < 6) {
          errors.password = t('passwordTooShort') || 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        
        // Check confirm password match
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          errors.confirmPassword = t('passwordsDoNotMatch') || 'Passwords do not match';
        } else if (formData.confirmPassword) {
          delete errors.confirmPassword;
        }
        break;
        
      case 'confirmPassword':
        if (value && value !== formData.password) {
          errors.confirmPassword = t('passwordsDoNotMatch') || 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    const errors = {};
    if (!formData.email) errors.email = t('emailRequired') || 'Email is required';
    else if (!validateEmail(formData.email)) errors.email = t('invalidEmail') || 'Invalid email format';
    
    if (!formData.password) errors.password = t('passwordRequired') || 'Password is required';
    else if (formData.password.length < 6) errors.password = t('passwordTooShort') || 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) errors.confirmPassword = t('confirmPasswordRequired') || 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = t('passwordsDoNotMatch') || 'Passwords do not match';
    
    if (!acceptTerms) errors.terms = t('acceptTermsRequired') || 'Please accept the terms and conditions';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await signup(formData.email, formData.password);
      
      // Success toast
      toast.success(t('registerSuccess') || 'Welcome to FinanceQuest! 🎉', {
        position: "top-center",
        autoClose: 3000,
      });
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = t('registerError') || 'Registration failed';
      
      // Handle specific error types
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = t('emailAlreadyInUse') || 'An account with this email already exists';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = t('invalidEmail') || 'Invalid email format';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = t('passwordTooWeak') || 'Password is too weak';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = t('registrationDisabled') || 'Registration is currently disabled';
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

  const strengthInfo = getPasswordStrengthInfo(passwordStrength.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-4 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Back button */}
      <Link to="/" className="absolute top-6 left-6 text-purple-400 hover:text-purple-300 transition-colors group">
        <div className="flex items-center gap-2">
          <FaArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="hidden sm:inline">{t('back') || 'Back'}</span>
        </div>
      </Link>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
              <FaRocket className="text-3xl text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 mb-2">
            {t('joinFinanceQuest') || 'Join FinanceQuest'}
          </h2>
          <p className="text-gray-400">{t('startYourJourney') || 'Start your financial mastery journey today'}</p>
        </div>

        {/* Benefits preview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg text-center border border-gray-700">
            <FaCoins className="text-gold-400 text-xl mx-auto mb-1" />
            <p className="text-xs text-gray-400">{t('earnPoints') || 'Earn Points'}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg text-center border border-gray-700">
            <FaShieldAlt className="text-green-400 text-xl mx-auto mb-1" />
            <p className="text-xs text-gray-400">{t('learnSafely') || 'Learn Safely'}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg text-center border border-gray-700">
            <FaRocket className="text-purple-400 text-xl mx-auto mb-1" />
            <p className="text-xs text-gray-400">{t('levelUp') || 'Level Up'}</p>
          </div>
        </div>
        
        {/* Registration Form */}
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
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                    validationErrors.email 
                      ? 'border-red-500 focus:border-red-400' 
                      : 'border-gray-600 focus:border-purple-500'
                  }`}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
                {formData.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {validateEmail(formData.email) ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
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
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 pr-12 ${
                    validationErrors.password 
                      ? 'border-red-500 focus:border-red-400' 
                      : 'border-gray-600 focus:border-purple-500'
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{t('passwordStrength') || 'Password strength'}:</span>
                    <span className={`text-xs font-medium ${strengthInfo.color}`}>{strengthInfo.text}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${strengthInfo.bgColor}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordStrength.checks.length ? <FaCheck /> : <FaTimes />}
                      {t('8Characters') || '8+ characters'}
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordStrength.checks.uppercase ? <FaCheck /> : <FaTimes />}
                      {t('uppercase') || 'Uppercase'}
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordStrength.checks.lowercase ? <FaCheck /> : <FaTimes />}
                      {t('lowercase') || 'Lowercase'}
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength.checks.number ? 'text-green-400' : 'text-gray-500'}`}>
                      {passwordStrength.checks.number ? <FaCheck /> : <FaTimes />}
                      {t('number') || 'Number'}
                    </div>
                  </div>
                </div>
              )}
              
              {validationErrors.password && (
                <p className="text-red-400 text-xs mt-2">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaLock className="inline mr-2" />
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300 pr-12 ${
                    validationErrors.confirmPassword 
                      ? 'border-red-500 focus:border-red-400' 
                      : 'border-gray-600 focus:border-purple-500'
                  }`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {formData.confirmPassword && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    {formData.password === formData.confirmPassword ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-2">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Newsletter */}
            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 mt-0.5"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-300">
                  {t('acceptTerms') || 'I accept the'}{' '}
                  <Link to="/terms" className="text-purple-400 hover:text-purple-300 underline">
                    {t('termsAndConditions') || 'Terms & Conditions'}
                  </Link>{' '}
                  {t('and')}{' '}
                  <Link to="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                    {t('privacyPolicy') || 'Privacy Policy'}
                  </Link>
                </span>
              </label>
              {validationErrors.terms && (
                <p className="text-red-400 text-xs">{validationErrors.terms}</p>
              )}
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-300">
                  {t('newsletterOptIn') || 'Send me tips and updates about financial learning'}
                </span>
              </label>
            </div>
            
            {/* Register Button */}
            <button
              type="submit"
              disabled={isSubmitting || Object.values(validationErrors).some(error => error) || !acceptTerms}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" />
                  {t('creatingAccount') || 'Creating account...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FaRocket />
                  {t('startJourney') || 'Start My Journey'}
                </div>
              )}
            </button>
          </form>
        </div>
        
        {/* Login Link */}
        <p className="mt-8 text-center text-gray-400">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            {t('login')}
          </Link>
        </p>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 {t('secureRegistration') || 'Your data is encrypted and secure'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;