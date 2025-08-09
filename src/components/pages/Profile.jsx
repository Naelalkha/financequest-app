import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaPalette,
  FaBell,
  FaShieldAlt,
  FaCoins,
  FaStar,
  FaChartLine,
  FaMedal,
  FaGem,
  FaRocket,
  FaLock
} from 'react-icons/fa';
import { GiTwoCoins, GiDiamondTrophy, GiAchievement } from 'react-icons/gi';
import { BsStars, BsLightningChargeFill } from 'react-icons/bs';
import { RiVipCrownFill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import LanguageToggle from '../LanguageToggle';
import LoadingSpinner from '../common/LoadingSpinner';
import AppBackground from '../common/AppBackground';

const Profile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { t, currentLang } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingCountry, setUpdatingCountry] = useState(false);
  const [activeSection, setActiveSection] = useState('account');

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
      toast.error('Veuillez vous connecter pour gérer votre abonnement');
      return;
    }

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: user.stripeCustomerId || user.uid
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        window.open('https://billing.stripe.com/p/login/test_28E14p0n96mxbd0aiLcjS00', '_blank');
      }
    } catch (error) {
      console.error('Erreur portail Stripe:', error);
      window.open('https://billing.stripe.com/p/login/test_28E14p0n96mxbd0aiLcjS00', '_blank');
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
      
      toast.success('✨ Pays mis à jour !', {
        position: "bottom-center",
        autoClose: 2000
      });
    } catch (error) {
      console.error('Error updating country:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdatingCountry(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('👋 À bientôt !', {
        position: "bottom-center",
        autoClose: 2000
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erreur lors de la déconnexion');
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
      label: 'Streak', 
      value: userData?.streak || 0,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      gradient: 'from-orange-400 to-red-400'
    },
    { 
      icon: GiTwoCoins, 
      label: 'XP Total', 
      value: userData?.xp || 0,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      gradient: 'from-yellow-400 to-amber-400'
    },
    { 
      icon: FaTrophy, 
      label: 'Niveau', 
      value: userData?.level || 1,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      gradient: 'from-purple-400 to-pink-400'
    },
    { 
      icon: GiAchievement, 
      label: 'Quêtes', 
      value: userData?.completedQuests || 0,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      gradient: 'from-cyan-400 to-blue-400'
    }
  ];

  const menuItems = [
    { id: 'account', label: 'Compte', icon: FaUser },
    { id: 'preferences', label: 'Préférences', icon: FaCog },
    { id: 'subscription', label: 'Abonnement', icon: FaCrown },
    { id: 'security', label: 'Sécurité', icon: FaShieldAlt }
  ];

  return (
    <AppBackground variant="nebula" grain grid={false} animate>
      <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+88px)]">
        
        {/* Header Hero avec effet néon */}
        <div className="relative px-4 sm:px-6 pt-8 sm:pt-12 pb-8">
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
              className="text-center mb-8"
            >
              {/* Avatar avec effet glow */}
              <div className="relative inline-block mb-6">
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
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-glow-md">
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
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                >
                  <FaGem className="text-purple-400" />
                  <span className="text-purple-300 font-bold text-sm">Membre Premium</span>
                </motion.div>
              ) : (
                <Link
                  to="/premium"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold hover:shadow-glow-md transform hover:scale-105 transition-all"
                >
                  <FaCrown />
                  <span>Passer Premium</span>
                </Link>
              )}
            </motion.div>

            {/* Stats cards avec style gaming */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {statsConfig.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative neon-element rounded-2xl p-4 ${stat.bg} border ${stat.border} group hover:scale-105 transition-transform cursor-pointer`}
                >
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity`} />
                  
                  <div className="relative z-10">
                    <stat.icon className={`${stat.color} text-2xl mb-2`} />
                    <div className={`text-2xl font-black ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
                      Informations du compte
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Nom d'affichage
                        </label>
                        <div className="px-4 py-3 bg-white/[0.02] rounded-lg border border-white/10">
                          <p className="text-white font-medium">
                            {userData?.displayName || 'Non défini'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Email
                        </label>
                        <div className="px-4 py-3 bg-white/[0.02] rounded-lg border border-white/10">
                          <p className="text-white font-medium">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Membre depuis
                        </label>
                        <div className="px-4 py-3 bg-white/[0.02] rounded-lg border border-white/10">
                          <p className="text-white font-medium">
                            {userData?.createdAt ? new Date(userData.createdAt.toDate?.() || userData.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          ID Utilisateur
                        </label>
                        <div className="px-4 py-3 bg-white/[0.02] rounded-lg border border-white/10 font-mono">
                          <p className="text-white text-sm truncate">
                            {user?.uid}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Achievements preview */}
                  <div className="neon-card rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <GiDiamondTrophy className="text-amber-400" />
                      Derniers succès
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 flex items-center justify-center"
                        >
                          <FaMedal className="text-2xl text-gray-600" />
                        </div>
                      ))}
                    </div>
                  </div>
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
                      Préférences
                    </h2>

                    <div className="space-y-6">
                      {/* Langue */}
                      <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/10 hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <FaGlobe className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Langue</p>
                            <p className="text-sm text-gray-400">Interface et contenu</p>
                          </div>
                        </div>
                        <LanguageToggle />
                      </div>

                      {/* Pays */}
                      <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/10 hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                            <FaFlag className="text-green-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Pays</p>
                            <p className="text-sm text-gray-400">Quêtes spécifiques</p>
                          </div>
                        </div>
                        <select
                          value={userData?.country || 'fr-FR'}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          disabled={updatingCountry}
                          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50"
                        >
                          <option value="fr-FR">🇫🇷 France</option>
                          <option value="en-US">🇺🇸 United States</option>
                        </select>
                      </div>

                      {/* Notifications */}
                      <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/10 hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                            <FaBell className="text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Notifications</p>
                            <p className="text-sm text-gray-400">Rappels de streak</p>
                          </div>
                        </div>
                        <button className="relative w-14 h-8 bg-gray-700 rounded-full transition-colors">
                          <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform" />
                        </button>
                      </div>

                      {/* Thème */}
                      <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/10 hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <FaPalette className="text-amber-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Thème</p>
                            <p className="text-sm text-gray-400">Mode sombre</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>Toujours actif</span>
                          <FaLock className="text-gray-500" />
                        </div>
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
                      {/* Background effects */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
                      
                      <div className="relative z-10 text-center">
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="inline-block mb-6"
                        >
                          <RiVipCrownFill className="text-6xl text-amber-400" />
                        </motion.div>
                        
                        <h3 className="text-3xl font-black text-white mb-4">
                          Débloquez Premium
                        </h3>
                        
                        <p className="text-gray-300 mb-8 max-w-md mx-auto">
                          Accédez à toutes les quêtes, défis exclusifs et fonctionnalités avancées
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
                          {[
                            '🎯 Toutes les quêtes',
                            '⚡ Défis exclusifs',
                            '🏆 Badges premium',
                            '📊 Statistiques avancées'
                          ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-left">
                              <FaCheck className="text-green-400 text-sm flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Link
                          to="/premium"
                          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 rounded-full font-bold text-lg hover:shadow-glow-lg transform hover:scale-105 transition-all"
                        >
                          <FaRocket />
                          <span>Commencer l'essai gratuit</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    /* Statut Premium actif */
                    <div className="neon-card rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <FaCrown className="text-amber-400" />
                          Abonnement Premium
                        </h2>
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                          <span className="text-green-400 text-sm font-bold">Actif</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Plan actuel</span>
                            <span className="text-white font-bold">Premium Mensuel</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Prochaine facturation</span>
                            <span className="text-white font-bold">
                              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleManageSubscription}
                          className="w-full px-6 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <FaCog />
                          <span>Gérer l'abonnement</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Avantages Premium */}
                  <div className="neon-card rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">
                      Avantages Premium
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { icon: FaBolt, label: 'Accès illimité', desc: 'Toutes les quêtes' },
                        { icon: FaStar, label: 'Contenu exclusif', desc: 'Défis premium' },
                        { icon: FaChartLine, label: 'Analytics', desc: 'Stats détaillées' },
                        { icon: FaMedal, label: 'Badges', desc: 'Récompenses uniques' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-lg">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                            <item.icon className="text-amber-400 text-sm" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{item.label}</p>
                            <p className="text-gray-400 text-xs">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Section Sécurité */}
              {activeSection === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="neon-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <FaShieldAlt className="text-green-400" />
                      Sécurité & Confidentialité
                    </h2>

                    <div className="space-y-4">
                      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Dernière connexion</span>
                          <span className="text-white text-sm font-medium">Aujourd'hui</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Authentification</span>
                          <span className="text-white text-sm font-medium">Email / Mot de passe</span>
                        </div>
                      </div>

                      <button className="w-full px-6 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white rounded-xl font-semibold transition-all">
                        Changer le mot de passe
                      </button>

                      <button className="w-full px-6 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white rounded-xl font-semibold transition-all">
                        Activer l'authentification à deux facteurs
                      </button>
                    </div>
                  </div>

                  {/* Actions dangereuses */}
                  <div className="neon-card rounded-2xl p-6 border-red-500/20">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <FaExclamationTriangle className="text-red-400" />
                      Zone de danger
                    </h3>

                    <div className="space-y-3">
                      <button
                        onClick={handleLogout}
                        className="w-full px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <FaSignOutAlt />
                        <span>Se déconnecter</span>
                      </button>

                      <button className="w-full px-6 py-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 text-gray-400 rounded-xl font-semibold transition-all opacity-50 cursor-not-allowed">
                        Supprimer le compte
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppBackground>
  );
};

export default Profile;