import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import AuthLayout from '../components/layout/AuthLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error(t('fill_all_fields') || 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('passwords_do_not_match') || 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error(t('password_too_short') || 'Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password, name);
      toast.success(t('register_success') || 'Account created successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = t('register_error') || 'Failed to create account';
      if (err.code === 'auth/email-already-in-use') errorMessage = t('email_in_use') || 'Email already in use';
      else if (err.code === 'auth/invalid-email') errorMessage = t('invalid_email') || 'Invalid email address';
      else if (err.code === 'auth/weak-password') errorMessage = t('weak_password') || 'Password is too weak';
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
          {t('register_title')}
        </h2>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Name Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E2FF00] transition-colors">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder={t('name') || 'Display Name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2FF00] focus:bg-white/10 transition-all font-mono text-sm"
            />
          </div>

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

          {/* Confirm Password Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E2FF00] transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              placeholder={t('confirm_password') || 'Confirm Password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E2FF00] focus:bg-white/10 transition-all font-mono text-sm"
            />
          </div>

          {/* Primary Action */}
          <button
            type="submit"
            className="w-full bg-[#E2FF00] text-black font-black font-sans py-4 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(226,255,0,0.2)] hover:shadow-[0_0_30px_rgba(226,255,0,0.4)] active:scale-[0.98] flex items-center justify-center gap-2 mt-4 uppercase tracking-wide"
          >
            {t('create_account') || 'CREATE ACCOUNT'} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-neutral-400 font-sans">
            Vous avez déjà un compte ?{" "}
            <Link to="/login" className="text-[#E2FF00] font-bold hover:text-[#cce600] transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;