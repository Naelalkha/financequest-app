import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import posthog from 'posthog-js';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  User,
  Settings,
  Globe,
  Database,
  Shield,
  LogOut,
  ChevronRight,
  Download,
  Lock,
  Check,
  Zap,
  Mail,
  ShieldCheck,
  Smartphone,
  LifeBuoy,
  FileText,
  Edit2,
  Crown,
  AlertTriangle,
  UserPlus,
  Sparkles
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AppBackground from '../../components/layout/AppBackground';
import { onboardingStore } from '../onboarding';
import { resetFirstRun } from '../dashboard/components/FirstRunMissionModal';
import { auth, db } from '../../services/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

const Profile = () => {
  const { user, updateUserProfile, logout, resetPassword } = useAuth();
  const { t, i18n } = useTranslation('profile');
  const navigate = useNavigate();
  const setLanguage = (lang) => i18n.changeLanguage(lang);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingCountry, setUpdatingCountry] = useState(false);
  const [activeTab, setActiveTab] = useState('ID_CARD');
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSending, setDeleteSending] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  // Check if user is anonymous (Guest Mode)
  const isAnonymous = user?.isAnonymous;

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setUserData(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(user);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      return;
    }

    try {
      posthog.capture('portal_open_click');

      if (!auth.currentUser) {
        return;
      }

      const idToken = await auth.currentUser.getIdToken(true);

      if (!idToken) {
        throw new Error('Impossible d\'obtenir le token d\'authentification');
      }

      console.log('Opening portal with token for user:', user.uid);

      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Portal error:', response.status, errorData);
      }
    } catch (error) {
      console.error('Erreur portail Stripe:', error);
    }
  };

  const handleCountryChange = async (newCountry) => {
    if (!user || updatingCountry) return;

    setUpdatingCountry(true);
    try {
      await updateUserProfile({
        country: newCountry
      });

      setUserData(prev => ({
        ...prev,
        country: newCountry
      }));

    } catch (error) {
      console.error('Error updating country:', error);
    } finally {
      setUpdatingCountry(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const cleanupUserData = async (userId) => {
    const batch = writeBatch(db);

    try {
      console.log('Nettoyage des données utilisateur...');

      batch.delete(doc(db, 'users', userId));

      try {
        const progressDoc = doc(db, 'userProgress', userId);
        batch.delete(progressDoc);
      } catch (e) {
        console.log('Pas de userProgress à supprimer');
      }

      const userQuestsQuery = query(
        collection(db, 'userQuests'),
        where('userId', '==', userId)
      );
      const userQuestsSnapshot = await getDocs(userQuestsQuery);
      userQuestsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const dailyChallengesQuery = query(
        collection(db, 'dailyChallenges'),
        where('userId', '==', userId)
      );
      const dailyChallengesSnapshot = await getDocs(dailyChallengesQuery);
      dailyChallengesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const streakIncidentsQuery = query(
        collection(db, 'streakIncidents'),
        where('userId', '==', userId)
      );
      const streakIncidentsSnapshot = await getDocs(streakIncidentsQuery);
      streakIncidentsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log('Données utilisateur nettoyées avec succès');

    } catch (error) {
      console.error('Erreur lors du nettoyage des données:', error);
      throw error;
    }
  };

  const benefits = [
    t('premium_feature_unlimited') || "Unlimited Active Quests",
    t('premium_feature_advanced') || "Advanced Wealth Analytics",
    t('premium_feature_custom') || "Custom Categories",
    t('premium_feature_priority') || "Priority Support Line"
  ];

  if (loading) {
    return (
      <AppBackground variant="finance" grain grid={false} animate>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground variant="finance" grain grid={false} animate>
      <div className="pt-4 px-6 pb-32 animate-slide-up font-sans min-h-screen">

        {/* 1. THE HEADER (Identity Card) */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-800 to-black border-2 border-neutral-700 p-1 relative group overflow-hidden">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <span className="text-3xl font-black text-gray-900">
                  {userData?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
            </div>
            {/* Status Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-800 text-[9px] font-mono font-bold px-3 py-1 rounded-full text-neutral-400 shadow-xl whitespace-nowrap flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${userData?.isPremium ? 'bg-volt' : 'bg-neutral-500'}`}></div>
              {userData?.isPremium ? t('statusProTier') : t('statusFreeTier')}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-sans font-black text-2xl text-white tracking-tight truncate uppercase">
              {isAnonymous 
                ? (t('guestUser') || 'UTILISATEUR')
                : (userData?.displayName || user?.email?.split('@')[0] || t('defaultUsername'))
              }
            </h1>
            <div className="flex items-center gap-2 text-neutral-500 mb-2">
              <Mail className="w-3 h-3" />
              <span className="font-mono text-[10px] truncate">
                {isAnonymous 
                  ? (t('guestMode') || 'Mode Invité')
                  : user?.email
                }
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-neutral-900 text-neutral-300 px-2 py-0.5 rounded text-[10px] font-mono border border-neutral-800">
                {t('userIdLabel')} {user?.uid?.substring(0, 8)}
              </span>
              <span className="bg-volt/10 text-volt px-2 py-0.5 rounded text-[10px] font-mono border border-volt/20 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {t('levelAbbr')} {userData?.level || 'Novice'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. THE NAVIGATION (Segmented Control) */}
        <div className="flex p-1 bg-neutral-900/80 rounded-full border border-neutral-800 mb-8 backdrop-blur-md relative z-10">
          {['ID_CARD', 'SYSTEM', 'UPGRADE'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-[10px] font-mono font-bold rounded-full transition-all duration-300 relative ${isActive
                  ? 'text-black shadow-[0_0_20px_rgba(226,255,0,0.2)]'
                  : 'text-neutral-500 hover:text-white'
                  }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-volt rounded-full -z-10 animate-in zoom-in-95 duration-200"></div>
                )}
                <span className="tracking-widest">[{tab === 'ID_CARD' ? t('tabIdCard') : tab === 'SYSTEM' ? t('tabSystem') : t('tabUpgrade')}]</span>
              </button>
            );
          })}
        </div>

        {/* 3. TAB CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-[300px]"
          >

            {/* --- ID CARD TAB --- */}
            {activeTab === 'ID_CARD' && (
              <div className="space-y-8">
                {/* Guest Mode: Show upgrade CTA prominently */}
                {isAnonymous && (
                  <section className="relative overflow-hidden rounded-2xl border border-[#E2FF00]/30 bg-gradient-to-br from-[#E2FF00]/10 to-transparent p-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#E2FF00]/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-[#E2FF00]/20 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-[#E2FF00]" />
                        </div>
                        <div>
                          <h3 className="font-sans text-white font-bold text-lg tracking-tight">
                            {t('saveProgressTitle') || 'Sauvegarde ta progression'}
                          </h3>
                          <p className="font-mono text-neutral-400 text-[10px] uppercase tracking-wider">
                            {t('saveProgressSubtitle') || 'Crée un compte gratuit'}
                          </p>
                        </div>
                      </div>
                      
                      <p className="font-sans text-neutral-300 text-sm mb-4 leading-relaxed">
                        {t('guestWarning') || 'En mode invité, tes données sont stockées localement. Crée un compte pour ne jamais perdre tes XP, badges et économies.'}
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate('/register')}
                          className="flex-1 py-3.5 bg-[#E2FF00] text-black font-sans font-black text-sm rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(226,255,0,0.2)] hover:shadow-[0_0_30px_rgba(226,255,0,0.4)] flex items-center justify-center gap-2 uppercase tracking-wide"
                        >
                          <UserPlus className="w-4 h-4" />
                          {t('createAccount') || 'Créer un compte'}
                        </button>
                        <button
                          onClick={() => navigate('/login')}
                          className="py-3.5 px-4 border border-neutral-700 text-neutral-300 font-sans font-bold text-sm rounded-xl hover:bg-neutral-900 hover:text-white transition-colors"
                        >
                          {t('login') || 'Connexion'}
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                <section className="space-y-4">
                  <div className="group">
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                      <label className="font-mono text-[10px] text-neutral-500 uppercase flex items-center gap-2">
                        <User className="w-3 h-3" /> {t('displayName') || 'Display Name'}
                      </label>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-mono text-xs flex justify-between items-center group-hover:border-white/20 transition-colors backdrop-blur-sm">
                      <span>{isAnonymous ? (t('guestDisplayName') || 'Invité') : (userData?.displayName || user?.email?.split('@')[0] || 'User')}</span>
                      <Lock className="w-3 h-3 text-neutral-600" />
                    </div>
                  </div>

                  <div className="group">
                    <label className="font-mono text-[10px] text-neutral-500 uppercase mb-1.5 block ml-1 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> {t('email') || 'Email'}
                    </label>
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-mono text-xs flex justify-between items-center group-hover:border-white/20 transition-colors backdrop-blur-sm">
                      <span className="opacity-80">
                        {isAnonymous 
                          ? (t('noEmail') || 'Aucun email (mode invité)')
                          : user?.email
                        }
                      </span>
                      <Lock className="w-3 h-3 text-neutral-600" />
                    </div>
                  </div>
                </section>

                {/* Security Zone - Different for anonymous vs authenticated users */}
                {isAnonymous ? (
                  /* Anonymous User: Show reset progress option */
                  <section className="pt-4 border-t border-neutral-800 space-y-3">
                    <h3 className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest mb-2">
                      {t('guestOptions') || 'Options Invité'}
                    </h3>

                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full py-3.5 border border-red-900/20 rounded-xl text-red-700 hover:text-red-500 hover:border-red-900/50 hover:bg-red-900/10 text-xs font-bold font-mono transition-colors flex items-center justify-center gap-2 bg-black/40"
                    >
                      <Database className="w-3 h-3" />
                      {t('resetProgress') || 'Réinitialiser la progression'}
                    </button>
                  </section>
                ) : (
                  /* Authenticated User: Show full security options */
                  <section className="pt-4 border-t border-neutral-800 space-y-3">
                    <h3 className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest mb-2">
                      {t('securityZone') || 'Security Zone'}
                    </h3>

                    <button
                      onClick={() => {
                        setResetEmail(user?.email || '');
                        setShowPasswordModal(true);
                      }}
                      className="w-full py-3.5 border border-neutral-800 rounded-xl text-neutral-400 text-xs font-bold font-mono hover:bg-neutral-900 hover:text-white transition-colors flex items-center justify-center gap-2 bg-black/40"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {t('changePassword') || 'Changer le mot de passe'}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleLogout}
                        className="w-full py-3.5 border border-neutral-800 rounded-xl text-neutral-400 text-xs font-bold font-mono hover:bg-neutral-900 hover:text-white transition-colors flex items-center justify-center gap-2 bg-black/40"
                      >
                        <LogOut className="w-3 h-3" />
                        {t('logOut') || 'Déconnexion'}
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full py-3.5 border border-red-900/20 rounded-xl text-red-700 hover:text-red-500 hover:border-red-900/50 hover:bg-red-900/10 text-xs font-bold font-mono transition-colors flex items-center justify-center gap-2 bg-black/40"
                      >
                        {t('deleteAccount') || 'Supprimer le compte'}
                      </button>
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* --- SYSTEM TAB --- */}
            {activeTab === 'SYSTEM' && (
              <div className="space-y-6">
                {/* Preferences */}
                <div className="bg-[#0A0A0A] border border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-sans font-bold text-sm text-neutral-200">
                        {t('language') || 'Language'}
                      </span>
                    </div>
                    <div className="flex bg-black rounded-lg p-1 border border-neutral-800">
                      <button
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold font-mono transition-all ${i18n.language === 'en' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-600 hover:text-white'}`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLanguage('fr')}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold font-mono transition-all ${i18n.language === 'fr' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-600 hover:text-white'}`}
                      >
                        FR
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-sans font-bold text-sm text-neutral-200">
                        {t('notifications') || 'Notifications'}
                      </span>
                    </div>
                    <div className="w-10 h-5 bg-neutral-800 rounded-full relative cursor-pointer border border-neutral-700">
                      <div className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-neutral-500 rounded-full transition-all"></div>
                    </div>
                  </div>
                </div>

                {/* Support & Legal */}
                <div>
                  <h3 className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest mb-3 pl-1">
                    {t('supportLegal') || 'Support & Legal'}
                  </h3>
                  <div className="bg-[#0A0A0A] border border-neutral-800 rounded-2xl overflow-hidden">
                    <button className="w-full p-4 flex items-center justify-between border-b border-neutral-800 hover:bg-neutral-900 transition-colors group text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center group-hover:bg-neutral-800 transition-colors">
                          <LifeBuoy className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                        </div>
                        <span className="font-sans font-bold text-sm text-neutral-200">
                          {t('helpCenter') || 'Help Center'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                    </button>
                    <button className="w-full p-4 flex items-center justify-between border-b border-neutral-800 hover:bg-neutral-900 transition-colors group text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center group-hover:bg-neutral-800 transition-colors">
                          <Shield className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                        </div>
                        <span className="font-sans font-bold text-sm text-neutral-200">
                          {t('privacy') || 'Privacy Policy'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                    </button>
                    <button className="w-full p-4 flex items-center justify-between hover:bg-neutral-900 transition-colors group text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center group-hover:bg-neutral-800 transition-colors">
                          <FileText className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                        </div>
                        <span className="font-sans font-bold text-sm text-neutral-200">
                          {t('terms') || 'Terms of Service'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                    </button>
                  </div>
                </div>

                {/* Data Management */}
                <div>
                  <h3 className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest mb-3 pl-1">
                    {t('data') || 'Data Management'}
                  </h3>
                  <div className="bg-[#0A0A0A] border border-neutral-800 rounded-2xl overflow-hidden">
                    <button className="w-full p-4 flex items-center justify-between border-b border-neutral-800 hover:bg-neutral-900 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center group-hover:bg-neutral-800 transition-colors">
                          <Download className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-sans font-bold text-sm text-neutral-200">
                          {t('export') || 'Export Data'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                    </button>

                    <button
                      onClick={() => window.confirm(t('resetConfirm') || 'Are you sure you want to reset all data?')}
                      className="w-full p-4 flex items-center justify-between hover:bg-red-900/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center group-hover:bg-red-900/20 transition-colors">
                          <Database className="w-4 h-4 text-red-500" />
                        </div>
                        <span className="font-sans font-bold text-sm text-red-500">
                          {t('reset') || 'Reset All Data'}
                        </span>
                      </div>
                      <LogOut className="w-4 h-4 text-red-900 opacity-50 group-hover:opacity-100" />
                    </button>
                  </div>
                </div>

                <div className="text-center pt-4 pb-2">
                  <span className="font-mono text-[10px] text-neutral-700">{t('appVersion')}</span>
                </div>
              </div>
            )}

            {/* --- UPGRADE TAB --- */}
            {activeTab === 'UPGRADE' && (
              <div className="space-y-6">

                {/* Pricing Toggle */}
                <div className="flex justify-center mb-4">
                  <div className="bg-neutral-900 p-1 rounded-full border border-neutral-800 flex relative w-full max-w-[280px]">
                    <button
                      onClick={() => setBillingCycle('MONTHLY')}
                      className={`flex-1 py-2.5 rounded-full text-[10px] font-bold font-mono transition-all relative z-10 text-center ${billingCycle === 'MONTHLY' ? 'text-black' : 'text-neutral-500 hover:text-white'}`}
                    >
                      {t('monthly') || 'MONTHLY'}
                    </button>
                    <button
                      onClick={() => setBillingCycle('YEARLY')}
                      className={`flex-1 py-2.5 rounded-full text-[10px] font-bold font-mono transition-all relative z-10 text-center ${billingCycle === 'YEARLY' ? 'text-black' : 'text-neutral-500 hover:text-white'}`}
                    >
                      {t('yearly') || 'YEARLY'} <span className={`${billingCycle === 'YEARLY' ? 'text-black' : 'text-volt'} ml-1 transition-colors`}>-20%</span>
                    </button>

                    {/* Sliding Pill */}
                    <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-volt rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(226,255,0,0.3)] ${billingCycle === 'MONTHLY' ? 'left-1' : 'left-[calc(50%+4px)]'}`}></div>
                  </div>
                </div>

                {!userData?.isPremium ? (
                  /* Hero Card for Free Users */
                  <div className="relative rounded-3xl overflow-hidden border border-volt/30 bg-neutral-900 group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(226,255,0,0.15),transparent_50%)]"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-volt to-transparent opacity-50"></div>

                    <div className="p-6 relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-volt fill-volt/20" />
                            <span className="font-mono text-[10px] text-volt font-bold uppercase tracking-widest">
                              {t('upgradeTitle') || 'Premium Access'}
                            </span>
                          </div>
                          <h2 className="text-3xl font-black text-white italic tracking-tighter">{t('proAccessTitle')}</h2>
                        </div>
                        <div className="text-right">
                          <span className="block text-2xl font-bold text-white">
                            {billingCycle === 'MONTHLY' ? '€4.99' : '€47.99'}
                          </span>
                          <span className="text-[10px] text-neutral-500 uppercase">
                            {billingCycle === 'MONTHLY' ? t('billingCycleMonth') : t('billingCycleYear')}
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-4"></div>

                      <ul className="space-y-3 mb-6">
                        {benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                            <div className="w-5 h-5 rounded-full bg-volt/10 flex items-center justify-center border border-volt/20">
                              <Check className="w-3 h-3 text-volt" strokeWidth={3} />
                            </div>
                            <span className="font-mono text-xs text-neutral-300 font-medium">{benefit}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        to="/premium?from=profile_card"
                        onClick={() => {
                          try {
                            const { trackEvent } = require('../../utils/analytics');
                            trackEvent('premium_entry_profile_card', {});
                          } catch (error) {
                            console.warn('Analytics tracking failed:', error);
                          }
                        }}
                        className="w-full py-4 bg-volt hover:bg-white text-black font-black font-sans text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(226,255,0,0.3)] hover:shadow-[0_0_30px_rgba(226,255,0,0.5)] hover:scale-[1.02] flex items-center justify-center gap-2 uppercase tracking-wide"
                      >
                        <Zap className="w-4 h-4 fill-black" />
                        {t('activatePro') || 'Activate Pro'}
                      </Link>

                      <button className="w-full mt-4 text-center">
                        <span className="text-[10px] text-neutral-500 hover:text-neutral-300 underline cursor-pointer transition-colors">
                          {t('restore') || 'Restore Purchase'}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Premium Status for Premium Users */
                  <div className="bg-[#0A0A0A] border border-neutral-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Crown className="w-5 h-5 text-volt" />
                        {t('profilePage.subscription_title') || 'Premium Subscription'}
                      </h2>
                      <div className={`px-3 py-1 rounded-full ${userData?.premiumStatus === 'canceled'
                        ? 'bg-red-500/20 border border-red-500/30'
                        : userData?.premiumStatus === 'trialing'
                          ? 'bg-blue-500/20 border border-blue-500/30'
                          : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
                        }`}>
                        <span className={`text-sm font-bold ${userData?.premiumStatus === 'canceled' ? 'text-red-400' :
                          userData?.premiumStatus === 'trialing' ? 'text-blue-400' :
                            'text-green-400'
                          }`}>
                          {userData?.premiumStatus === 'canceled' ? t('subscription.canceled') || 'Canceled' :
                            userData?.premiumStatus === 'trialing' ? t('subscription.trial') || 'Trial' :
                              t('subscription.active') || 'Active'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">
                            {t('profilePage.current_plan') || 'Current Plan'}
                          </span>
                          <span className="text-white font-bold">
                            {t('profilePage.premium') || 'Premium'}
                          </span>
                        </div>

                        {userData?.premiumStatus === 'canceled' ? (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">
                              {t('profilePage.access_until') || 'Access Until'}
                            </span>
                            <span className="text-white font-bold">
                              {userData?.currentPeriodEnd
                                ? new Date(userData.currentPeriodEnd).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')
                                : t('profilePage.not_available') || 'N/A'
                              }
                            </span>
                          </div>
                        ) : userData?.premiumStatus === 'trialing' ? (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">
                              {t('profilePage.trial_ends') || 'Trial Ends'}
                            </span>
                            <span className="text-white font-bold">
                              {userData?.currentPeriodEnd
                                ? new Date(userData.currentPeriodEnd).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')
                                : t('profilePage.not_available') || 'N/A'
                              }
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">
                              {t('profilePage.next_billing') || 'Next Billing'}
                            </span>
                            <span className="text-white font-bold">
                              {userData?.currentPeriodEnd
                                ? new Date(userData.currentPeriodEnd).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')
                                : t('profilePage.not_available') || 'N/A'
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {userData?.premiumStatus === 'canceled' && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-red-300 text-sm">
                            {t('profilePage.subscription_canceled_info') ||
                              'Your subscription has been canceled. You will retain Premium access until the end of the paid period.'}
                          </p>
                        </div>
                      )}

                      <button
                        onClick={handleManageSubscription}
                        className="w-full px-6 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <Settings />
                        <span>
                          {userData?.premiumStatus === 'canceled'
                            ? t('profilePage.reactivate_subscription') || 'Reactivate Subscription'
                            : t('profilePage.manage_subscription') || 'Manage Subscription'
                          }
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal de réinitialisation du mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 p-6">
            <h4 className="text-white text-lg font-bold mb-4">
              {t('profilePage.change_password_modal_title') || 'Change Password'}
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              {t('profilePage.change_password_modal_description') || 'A password reset email will be sent to this address.'}
            </p>
            <div className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white mb-4">
              <p className="text-sm">{user?.email || t('profilePage.change_password_modal_no_email') || "No email"}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.06]"
              >
                {t('profilePage.change_password_modal_cancel') || 'Cancel'}
              </button>
              <button
                onClick={async () => {
                  try {
                    setResetSending(true);
                    await resetPassword(user?.email);
                    setShowPasswordModal(false);
                  } catch (e) {
                    console.error('Error resetting password:', e);
                  } finally {
                    setResetSending(false);
                  }
                }}
                disabled={resetSending || !user?.email}
                className="px-4 py-2 rounded-lg bg-volt text-black font-bold disabled:opacity-50 hover:bg-white transition-colors"
              >
                {resetSending ? (t('profilePage.change_password_modal_sending') || 'Sending…') : (t('profilePage.change_password_modal_send') || 'Send')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression de compte / réinitialisation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-red-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-400" />
              </div>
              <div>
                <h4 className="text-white text-lg font-bold">
                  {isAnonymous 
                    ? (t('profilePage.reset_progress_modal_title') || 'Réinitialiser la progression')
                    : (t('profilePage.delete_account_modal_title') || 'Delete Account')
                  }
                </h4>
                <p className="text-red-300 text-xs font-medium">
                  {t('profilePage.delete_account_modal_warning') || 'Action irréversible'}
                </p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-200 text-sm mb-2 font-medium">
                {isAnonymous 
                  ? (t('profilePage.reset_progress_modal_data_warning') || 'Toutes tes données seront supprimées :')
                  : (t('profilePage.delete_account_modal_data_warning') || 'All your data will be deleted:')
                }
              </p>
              <ul className="text-red-300 text-xs space-y-1 list-disc list-inside">
                <li>{t('profilePage.delete_account_modal_data_profile') || 'XP et niveau'}</li>
                <li>{t('profilePage.delete_account_modal_data_progress') || 'Progression des quêtes'}</li>
                <li>{t('profilePage.delete_account_modal_data_achievements') || 'Badges et achievements'}</li>
                <li>{t('profilePage.delete_account_modal_data_settings') || 'Impact et économies'}</li>
              </ul>
            </div>

            {/* For anonymous users, just show a simple confirmation */}
            {isAnonymous ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                <p className="text-amber-200 text-sm">
                  {t('profilePage.reset_progress_modal_anonymous_info') || 
                    'Tu recommenceras à zéro avec un nouveau profil invité.'}
                </p>
              </div>
            ) : user?.providerData?.[0]?.providerId === 'password' ? (
              <div>
                <p className="text-gray-400 text-sm mb-3">
                  {t('profilePage.delete_account_modal_password_instruction') || 'Entre ton mot de passe pour confirmer :'}
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-400/40 mb-4"
                  placeholder={t('profilePage.delete_account_modal_password_placeholder') || "Ton mot de passe"}
                  disabled={deleteSending}
                />
              </div>
            ) : (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-blue-400">
                    {user?.providerData?.[0]?.providerId === 'google.com' && '🔗 Google'}
                  </div>
                  <span className="text-blue-300 text-sm font-medium">
                    {t('profilePage.delete_account_modal_oauth_title') || 'Compte externe'}
                  </span>
                </div>
                <p className="text-blue-200 text-xs">
                  {t('profilePage.delete_account_modal_oauth_instruction') ||
                    'Une fenêtre va s\'ouvrir pour confirmer ton identité.'}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.06]"
              >
                {t('profilePage.delete_account_modal_cancel') || 'Annuler'}
              </button>
              <button
                onClick={async () => {
                  try {
                    setDeleteSending(true);
                    const currentUser = auth.currentUser;
                    if (!currentUser) throw new Error('User not connected');

                    if (isAnonymous) {
                      // For anonymous users: just delete their data and create a new anonymous account
                      console.log('Resetting anonymous user data...');
                      await cleanupUserData(currentUser.uid);
                      await deleteUser(currentUser);
                      // The auth listener will automatically create a new anonymous user
                      
                      // Reset onboarding to restart the full experience
                      onboardingStore.resetOnboarding();
                      
                      // Reset first run modal
                      resetFirstRun();
                      
                      // Also reset banner dismissed state
                      localStorage.removeItem('moniyo-banner-dismissed');
                      
                      setTimeout(() => {
                        window.location.href = '/';
                      }, 1000);
                      return;
                    }

                    const providerId = user?.providerData?.[0]?.providerId;
                    console.log('Reauthenticating for provider:', providerId);

                    if (providerId === 'password') {
                      if (!deletePassword) {
                        return;
                      }
                      const cred = EmailAuthProvider.credential(user?.email || '', deletePassword);
                      await reauthenticateWithCredential(currentUser, cred);
                      console.log('Email/password reauthentication successful');
                    } else if (providerId === 'google.com') {
                      const provider = new GoogleAuthProvider();
                      await reauthenticateWithPopup(currentUser, provider);
                      console.log('Google reauthentication successful');
                    } else {
                      throw new Error(`Unsupported provider: ${providerId}`);
                    }

                    console.log('Cleaning up Firestore data...');
                    await cleanupUserData(currentUser.uid);

                    console.log('Deleting Auth account...');
                    await deleteUser(currentUser);

                    setTimeout(() => {
                      window.location.href = '/';
                    }, 1500);

                  } catch (e) {
                    console.error('Error deleting account:', e);

                    let errorMessage = t('profilePage.delete_account_modal_failed') || 'Échec de la suppression';

                    if (e.code === 'auth/wrong-password') {
                      errorMessage = t('profilePage.delete_account_modal_wrong_password') || 'Mot de passe incorrect';
                    } else if (e.code === 'auth/requires-recent-login') {
                      errorMessage = t('profilePage.delete_account_modal_requires_recent_login') || 'Réauthentification requise. Réessaie.';
                    } else if (e.code === 'auth/popup-closed-by-user') {
                      errorMessage = t('profilePage.delete_account_modal_popup_closed') || 'Authentification annulée. Réessaie.';
                    } else if (e.code === 'auth/network-request-failed') {
                      errorMessage = t('profilePage.delete_account_modal_network_error') || 'Erreur réseau. Vérifie ta connexion.';
                    }

                    console.error('Delete account error:', errorMessage);
                  } finally {
                    setDeleteSending(false);
                    setShowDeleteModal(false);
                    setDeletePassword('');
                  }
                }}
                disabled={deleteSending || (!isAnonymous && user?.providerData?.[0]?.providerId === 'password' && !deletePassword)}
                className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-semibold disabled:opacity-50 transition-all"
              >
                {deleteSending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    {isAnonymous 
                      ? (t('profilePage.reset_progress_modal_resetting') || 'Réinitialisation…')
                      : (t('profilePage.delete_account_modal_deleting') || 'Suppression…')
                    }
                  </div>
                ) : (
                  isAnonymous 
                    ? (t('profilePage.reset_progress_modal_confirm') || 'Réinitialiser')
                    : (t('profilePage.delete_account_modal_confirm') || 'Supprimer définitivement')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppBackground>
  );
};

export default Profile;