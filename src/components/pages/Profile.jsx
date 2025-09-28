import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import posthog from 'posthog-js';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  FaUser, 
  FaCrown, 
  FaCog, 
  FaGlobe,
  FaTrophy,
  FaFire,
  FaBolt,
  FaCheck,
  FaChevronRight,
  FaSignOutAlt,
  FaCalendarAlt,
  FaEnvelope,
  FaFlag,
  FaShieldAlt,
  FaCoins,
  FaStar,
  FaChartLine,
  FaMedal,
  FaGem,
  FaRocket,
  FaExclamationTriangle
} from 'react-icons/fa';
import { GiTwoCoins, GiDiamondTrophy, GiAchievement } from 'react-icons/gi';
import { BsStars, BsLightningChargeFill } from 'react-icons/bs';
import { RiVipCrownFill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import LanguageToggle from '../app/LanguageToggle';
import CountryToggle from '../app/CountryToggle';
import LoadingSpinner from '../app/LoadingSpinner';
import AppBackground from '../app/AppBackground';
import { auth, db } from '../../services/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

const Profile = () => {
  const { user, updateUserProfile, logout, resetPassword } = useAuth();
  const { t, currentLang } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingCountry, setUpdatingCountry] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSending, setDeleteSending] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

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
      toast.error(t('profilePage.toast.login_required_subscription') || 'Veuillez vous connecter pour gérer votre abonnement');
      return;
    }
  
    try {
      posthog.capture('portal_open_click');
      
      // IMPORTANT: Obtenir le token Firebase pour l'authentification
      if (!auth.currentUser) {
        toast.error(t('profilePage.toast.session_expired_refresh') || 'Session expirée. Veuillez rafraîchir la page.');
        return;
      }
      
      const idToken = await auth.currentUser.getIdToken(true); // true = force refresh
      
      if (!idToken) {
        throw new Error('Impossible d\'obtenir le token d\'authentification');
      }
      
      console.log('Opening portal with token for user:', user.uid);
      
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}` // AJOUT: Token dans les headers
        },
        body: JSON.stringify({}) // Body vide (l'API récupère le userId du token)
      });
  
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Portal error:', response.status, errorData);
        
        if (response.status === 401) {
          toast.error(t('profilePage.toast.session_expired_relogin') || 'Session expirée. Veuillez vous reconnecter.');
          return;
        }
        
        toast.error(t('profilePage.toast.portal_open_failed') || 'Impossible d\'ouvrir le portail client');
      }
    } catch (error) {
      console.error('Erreur portail Stripe:', error);
      toast.error(t('profilePage.toast.portal_error') || 'Erreur lors de l\'ouverture du portail');
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
      
      toast.success(t('profilePage.toast.country_updated') || '✨ Pays mis à jour !', {
        position: "bottom-center",
        autoClose: 2000
      });
    } catch (error) {
      console.error('Error updating country:', error);
      toast.error(t('profilePage.toast.update_error') || 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingCountry(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('profilePage.toast.logout_success') || '👋 À bientôt !', {
        position: "bottom-center",
        autoClose: 2000
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error(t('profilePage.toast.logout_error') || 'Erreur lors de la déconnexion');
    }
  };

  // Fonction pour nettoyer toutes les données utilisateur dans Firestore
  const cleanupUserData = async (userId) => {
    const batch = writeBatch(db);
    
    try {
      console.log('Nettoyage des données utilisateur...');
      
      // 1. Supprimer le profil utilisateur principal
      batch.delete(doc(db, 'users', userId));
      
      // 2. Supprimer la progression des quêtes (userProgress)
      try {
        const progressDoc = doc(db, 'userProgress', userId);
        batch.delete(progressDoc);
      } catch (e) {
        console.log('Pas de userProgress à supprimer');
      }
      
      // 3. Supprimer toutes les quêtes individuelles (userQuests)
      const userQuestsQuery = query(
        collection(db, 'userQuests'),
        where('userId', '==', userId)
      );
      const userQuestsSnapshot = await getDocs(userQuestsQuery);
      userQuestsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // 4. Supprimer les défis quotidiens (dailyChallenges)
      const dailyChallengesQuery = query(
        collection(db, 'dailyChallenges'),
        where('userId', '==', userId)
      );
      const dailyChallengesSnapshot = await getDocs(dailyChallengesQuery);
      dailyChallengesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // 5. Supprimer les incidents de streak (streakIncidents)
      const streakIncidentsQuery = query(
        collection(db, 'streakIncidents'),
        where('userId', '==', userId)
      );
      const streakIncidentsSnapshot = await getDocs(streakIncidentsQuery);
      streakIncidentsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Exécuter toutes les suppressions en batch
      await batch.commit();
      console.log('Données utilisateur nettoyées avec succès');
      
    } catch (error) {
      console.error('Erreur lors du nettoyage des données:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <AppBackground variant="nebula" grain grid={false} animate>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppBackground>
    );
  }

  // Configuration des stats avec style néon
  const statsConfig = [
    { 
      icon: FaFire, 
      label: t('profilePage.stats.streak') || 'Streak', 
      value: userData?.streak || 0,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      gradient: 'from-orange-400 to-red-400'
    },
    { 
      icon: GiTwoCoins, 
      label: t('profilePage.stats.total_xp') || 'XP Total', 
      value: userData?.xp || 0,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      gradient: 'from-yellow-400 to-amber-400'
    },
    { 
      icon: FaTrophy, 
      label: t('profilePage.stats.level') || 'Niveau', 
      value: userData?.level || 1,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      gradient: 'from-purple-400 to-pink-400'
    },
    { 
      icon: GiAchievement, 
      label: t('profilePage.stats.quests') || 'Quêtes', 
      value: userData?.completedQuests || 0,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      gradient: 'from-cyan-400 to-blue-400'
    }
  ];

  const menuItems = [
    { id: 'account', label: t('profilePage.menu.account') || 'Compte', icon: FaUser },
    { id: 'preferences', label: t('profilePage.menu.preferences') || 'Préférences', icon: FaCog },
    { id: 'subscription', label: t('profilePage.menu.subscription') || 'Abonnement', icon: FaCrown }
  ];

  return (
    <AppBackground variant="nebula" grain grid={false} animate>
      <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]">
        
        {/* Header Hero avec effet néon */}
        <div className="relative px-4 sm:px-6 pt-6 sm:pt-8 pb-6">
          {/* Gradient overlay animé */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-purple-600/10 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          
          <div className="relative max-w-6xl mx-auto">
            {/* Avatar et infos principales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6"
            >
              {/* Avatar avec effet glow */}
              <div className="relative inline-block mb-4">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400 rounded-full blur-xl opacity-50"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-glow-md">
                  <span className="text-4xl sm:text-5xl font-black text-gray-900">
                    {userData?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  {userData?.isPremium && (
                    <motion.div 
                      className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2.5 shadow-glow-purple"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <RiVipCrownFill className="text-white text-xl" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Nom et email */}
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 text-title">
                {userData?.displayName || user?.email?.split('@')[0]}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base flex items-center justify-center gap-2">
                <FaEnvelope className="text-gray-500 text-xs" />
                {user?.email}
              </p>

              {/* Badge Premium ou bouton upgrade */}
                {userData?.isPremium ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                >
                  <FaGem className="text-purple-400" />
                  <span className="text-purple-300 font-bold text-sm">{t('profilePage.premium_member') || 'Membre Premium'}</span>
                </motion.div>
              ) : (
                <Link
                  to="/premium"
                    className="inline-flex items-center gap-2 mt-3 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold hover:shadow-glow-md transform hover:scale-105 transition-all"
                >
                  <FaCrown />
                  <span>{t('profilePage.go_premium') || 'Passer Premium'}</span>
                </Link>
              )}
            </motion.div>

            {/* Section stats retirée pour réduire la redondance avec le dashboard */}
          </div>
        </div>

        {/* Navigation tabs avec style néon */}
        <div className="px-4 sm:px-6 mb-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all
                    ${activeSection === item.id
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 shadow-glow-sm'
                      : 'bg-white/[0.03] text-gray-400 hover:text-gray-300 hover:bg-white/[0.06] border border-white/10'
                    }
                  `}
                >
                  <item.icon className="text-xs" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content sections avec animations */}
        <div className="px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {/* Section Compte */}
              {activeSection === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="neon-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <FaUser className="text-cyan-400" />
                      {t('profilePage.account_info_title') || 'Informations du compte'}
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {t('profilePage.username_label') || "Nom d'utilisateur"}
                          </label>
                        <div className="px-4 py-3 bg-white/[0.02] rounded-lg border border-white/10">
                          <p className="text-white font-medium">
                            {userData?.displayName || userData?.username || (user?.email ? user.email.split('@')[0] : t('profilePage.default_username') || 'Utilisateur')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {t('profilePage.email_label') || 'Email'}
                          </label>
                        <div className="px-4 py-3 bg-white/[0.02] rounded-lg border border-white/10">
                          <p className="text-white font-medium">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {t('profilePage.member_since_label') || 'Membre depuis'}
                          </label>
                        <div className="px-4 py-3 bg-white/[0.02] rounded-lg border border-white/10">
                          <p className="text-white font-medium">
                            {userData?.createdAt ? new Date(userData.createdAt.toDate?.() || userData.createdAt).toLocaleDateString('fr-FR') : t('profilePage.not_available') || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sécurité du compte */}
                  <div className="neon-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <FaShieldAlt className="text-green-400" />
                      {t('profilePage.security_title') || 'Sécurité du compte'}
                    </h2>

                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          setResetEmail(user?.email || '');
                          setShowPasswordModal(true);
                        }}
                        className="w-full px-6 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white rounded-xl font-semibold transition-all"
                      >
                        {t('profilePage.change_password') || 'Changer le mot de passe'}
                      </button>
 
                       <div className="pt-4 mt-2 border-t border-white/10 flex flex-col sm:flex-row gap-2 items-start">
                          <button
                           onClick={handleLogout}
                           className="w-full sm:w-auto px-6 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-white rounded-xl font-semibold transition-all"
                         >
                            {t('profilePage.logout') || 'Se déconnecter'}
                         </button>
                         <button
                           onClick={() => setShowDeleteModal(true)}
                           className="w-full sm:w-auto px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                         >
                            <FaExclamationTriangle className="text-xs" />
                            {t('profilePage.delete_account') || 'Supprimer le compte'}
                         </button>
                       </div>
                     </div>
                   </div>

                  {/* Bloc séparé supprimé: actions regroupées ci-dessus */}
                </motion.div>
              )}

              {/* Section Préférences */}
              {activeSection === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="neon-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <FaCog className="text-blue-400" />
                      {t('profilePage.preferences_title') || 'Préférences'}
                    </h2>

                    <div className="space-y-6">
                      {/* Langue */}
                      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/10 hover:bg-white/[0.04] transition-colors">
                        <LanguageToggle />
                      </div>

                      {/* Pays */}
                      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/10 hover:bg-white/[0.04] transition-colors">
                        <CountryToggle />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

             {/* Section Abonnement */}
{activeSection === 'subscription' && (
  <motion.div
    key="subscription"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    {!userData?.isPremium ? (
      /* Carte upsell Premium */
      <div className="relative overflow-hidden neon-card rounded-2xl p-8">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 shadow-glow-md"
            >
              <FaCrown className="text-2xl text-gray-900" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('profilePage.upgrade_to_premium') || 'Passez à Premium'}
            </h2>
            <p className="text-gray-400 text-sm">
              {t('profilePage.unlock_full_potential') || 'Débloquez tout le potentiel de FinanceQuest'}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-white">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-400 text-xs" />
              </div>
              <span className="text-sm">{t('profilePage.premium_feature_unlimited') || 'Quêtes illimitées'}</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-400 text-xs" />
              </div>
              <span className="text-sm">{t('profilePage.premium_feature_advanced') || 'Outils avancés de suivi'}</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-400 text-xs" />
              </div>
              <span className="text-sm">{t('profilePage.premium_feature_priority') || 'Support prioritaire'}</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-400 text-xs" />
              </div>
              <span className="text-sm">{t('profilePage.premium_feature_exclusive') || 'Contenu exclusif'}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/premium"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 rounded-xl font-bold hover:from-amber-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-glow-md"
            >
              <FaRocket />
              <span>{t('profilePage.upgrade_now') || 'Passer à Premium'}</span>
            </Link>
            <p className="text-xs text-gray-500 mt-3">
              {t('profilePage.cancel_anytime') || 'Annulable à tout moment'}
            </p>
          </div>
        </div>
      </div>
    ) : (
      /* Statut Premium actif - CORRIGÉ */
      <div className="neon-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaCrown className="text-amber-400" />
            {t('profilePage.subscription_title') || 'Abonnement Premium'}
          </h2>
          <div className={`px-3 py-1 rounded-full ${
            userData?.premiumStatus === 'canceled' 
              ? 'bg-red-500/20 border border-red-500/30'
              : userData?.premiumStatus === 'trialing'
              ? 'bg-blue-500/20 border border-blue-500/30'
              : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
          }`}>
            <span className={`text-sm font-bold ${
              userData?.premiumStatus === 'canceled' ? 'text-red-400' :
              userData?.premiumStatus === 'trialing' ? 'text-blue-400' : 
              'text-green-400'
            }`}>
              {userData?.premiumStatus === 'canceled' ? t('subscription.canceled') || 'Annulé' :
               userData?.premiumStatus === 'trialing' ? t('subscription.trial') || 'Essai' :
               t('subscription.active') || 'Actif'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">
                {t('profilePage.current_plan') || 'Plan actuel'}
              </span>
              <span className="text-white font-bold">
                {t('profilePage.premium') || 'Premium'}
              </span>
            </div>
            
            {/* Affichage conditionnel selon le statut */}
            {userData?.premiumStatus === 'canceled' ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">
                  {t('profilePage.access_until') || 'Accès jusqu\'au'}
                </span>
                <span className="text-white font-bold">
                  {userData?.currentPeriodEnd 
                    ? new Date(userData.currentPeriodEnd).toLocaleDateString('fr-FR')
                    : t('profilePage.not_available') || 'N/A'
                  }
                </span>
              </div>
            ) : userData?.premiumStatus === 'trialing' ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">
                  {t('profilePage.trial_ends') || 'Fin de l\'essai'}
                </span>
                <span className="text-white font-bold">
                  {userData?.currentPeriodEnd 
                    ? new Date(userData.currentPeriodEnd).toLocaleDateString('fr-FR')
                    : t('profilePage.not_available') || 'N/A'
                  }
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">
                  {t('profilePage.next_billing') || 'Prochaine facturation'}
                </span>
                <span className="text-white font-bold">
                  {userData?.currentPeriodEnd 
                    ? new Date(userData.currentPeriodEnd).toLocaleDateString('fr-FR')
                    : t('profilePage.not_available') || 'N/A'
                  }
                </span>
              </div>
            )}
          </div>

          {/* Message d'info si annulé */}
          {userData?.premiumStatus === 'canceled' && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-300 text-sm">
                {t('profilePage.subscription_canceled_info') || 
                 'Votre abonnement a été annulé. Vous conservez l\'accès Premium jusqu\'à la fin de la période payée.'}
              </p>
            </div>
          )}

          <button
            onClick={handleManageSubscription}
            className="w-full px-6 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <FaCog />
            <span>
              {userData?.premiumStatus === 'canceled' 
                ? t('profilePage.reactivate_subscription') || 'Réactiver l\'abonnement'
                : t('profilePage.manage_subscription') || 'Gérer l\'abonnement'
              }
            </span>
          </button>
        </div>
      </div>
    )}
  </motion.div>
)}

              {/* Section Sécurité supprimée (contenu déplacé dans Compte) */}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal de réinitialisation du mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 p-6">
            <h4 className="text-white text-lg font-bold mb-4">{t('profilePage.change_password_modal_title') || 'Changer le mot de passe'}</h4>
            <p className="text-gray-400 text-sm mb-4">{t('profilePage.change_password_modal_description') || 'Un email de réinitialisation sera envoyé à cette adresse.'}</p>
            <div className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white mb-4">
              <p className="text-sm">{user?.email || t('profilePage.change_password_modal_no_email') || "Aucun email"}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.06]"
              >
                {t('profilePage.change_password_modal_cancel') || 'Annuler'}
              </button>
              <button
                onClick={async () => {
                  try {
                    setResetSending(true);
                    // Utiliser l'email de l'utilisateur connecté
                    await resetPassword(user?.email);
                    toast.success(t('profilePage.change_password_modal_success') || 'Email de réinitialisation envoyé');
                    setShowPasswordModal(false);
                  } catch (e) {
                    console.error('Erreur reset password:', e);
                    toast.error(t('profilePage.change_password_modal_failed') || "Échec de l'envoi de l'email");
                  } finally {
                    setResetSending(false);
                  }
                }}
                disabled={resetSending || !user?.email}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold disabled:opacity-50"
              >
                {resetSending ? (t('profilePage.change_password_modal_sending') || 'Envoi…') : (t('profilePage.change_password_modal_send') || 'Envoyer')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression de compte */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-red-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-400" />
              </div>
              <div>
                <h4 className="text-white text-lg font-bold">{t('profilePage.delete_account_modal_title') || 'Supprimer le compte'}</h4>
                <p className="text-red-300 text-xs font-medium">{t('profilePage.delete_account_modal_warning') || 'Action irréversible'}</p>
              </div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-200 text-sm mb-2 font-medium">
                {t('profilePage.delete_account_modal_data_warning') || 'Toutes vos données seront supprimées :'}
              </p>
              <ul className="text-red-300 text-xs space-y-1 list-disc list-inside">
                <li>{t('profilePage.delete_account_modal_data_profile') || 'Profil utilisateur'}</li>
                <li>{t('profilePage.delete_account_modal_data_progress') || 'Progression des quêtes'}</li>
                <li>{t('profilePage.delete_account_modal_data_achievements') || 'Succès et badges'}</li>
                <li>{t('profilePage.delete_account_modal_data_settings') || 'Préférences et paramètres'}</li>
              </ul>
            </div>

            {user?.providerData?.[0]?.providerId === 'password' ? (
              <div>
                <p className="text-gray-400 text-sm mb-3">
                  {t('profilePage.delete_account_modal_password_instruction') || 'Saisissez votre mot de passe pour confirmer :'}
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-400/40 mb-4"
                  placeholder={t('profilePage.delete_account_modal_password_placeholder') || "Votre mot de passe"}
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
                   'Une fenêtre s\'ouvrira pour confirmer votre identité via votre fournisseur de connexion.'}
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
      if (!currentUser) throw new Error('Utilisateur non connecté');
      
      // Étape 1: Réauthentification OBLIGATOIRE
      const providerId = user?.providerData?.[0]?.providerId;
      console.log('Réauthentification pour provider:', providerId);
      
      if (providerId === 'password') {
        if (!deletePassword) {
          toast.error(t('profilePage.delete_account_modal_password_required') || 'Mot de passe requis');
          return;
        }
        const cred = EmailAuthProvider.credential(user?.email || '', deletePassword);
        await reauthenticateWithCredential(currentUser, cred);
        console.log('Réauthentification email/password réussie');
      } else if (providerId === 'google.com') {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(currentUser, provider);
        console.log('Réauthentification Google réussie');
      } else {
        throw new Error(`Provider non supporté: ${providerId}`);
      }
      
      // Étape 2: Nettoyer TOUTES les données Firestore AVANT de supprimer Auth
      console.log('Nettoyage des données Firestore...');
      await cleanupUserData(currentUser.uid);
      
      // Étape 3: Supprimer le compte Firebase Auth
      console.log('Suppression du compte Auth...');
      await deleteUser(currentUser);
      
      toast.success(t('profilePage.delete_account_modal_success') || 'Compte et données supprimés avec succès');
      
      // Rediriger vers la page d'accueil après suppression
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (e) {
      console.error('Erreur suppression compte:', e);
      
      let errorMessage = t('profilePage.delete_account_modal_failed') || 'Échec de la suppression';
      
      if (e.code === 'auth/wrong-password') {
        errorMessage = t('profilePage.delete_account_modal_wrong_password') || 'Mot de passe incorrect';
      } else if (e.code === 'auth/requires-recent-login') {
        errorMessage = t('profilePage.delete_account_modal_requires_recent_login') || 'Réauthentification requise. Veuillez fermer cette fenêtre et réessayer.';
      } else if (e.code === 'auth/popup-closed-by-user') {
        errorMessage = t('profilePage.delete_account_modal_popup_closed') || 'Authentification annulée. Veuillez réessayer.';
      } else if (e.code === 'auth/network-request-failed') {
        errorMessage = t('profilePage.delete_account_modal_network_error') || 'Erreur réseau. Vérifiez votre connexion.';
      }
      
      toast.error(errorMessage);
    } finally {
      setDeleteSending(false);
      setShowDeleteModal(false);
      setDeletePassword(''); // Reset du mot de passe
    }
  }}
  disabled={deleteSending || (user?.providerData?.[0]?.providerId === 'password' && !deletePassword)}
  className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-semibold disabled:opacity-50 transition-all"
>
  {deleteSending ? (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
      {t('profilePage.delete_account_modal_deleting') || 'Suppression…'}
    </div>
  ) : (
    t('profilePage.delete_account_modal_confirm') || 'Supprimer définitivement'
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