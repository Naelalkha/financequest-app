// Badge system for FinanceQuest gamification
import { 
    FaRocket, FaFire, FaBolt, FaTrophy, 
    FaChartLine, FaGem, FaPiggyBank, FaGraduationCap,
    FaMedal, FaStar, FaCrown, FaShieldAlt, FaAward,
    FaUserGraduate, FaLightbulb, FaHandHoldingUsd,
    FaWallet, FaBalanceScale, FaCalculator
  } from 'react-icons/fa';
  
  export const badges = [
    // STARTER BADGES
    {
      id: 'first_quest',
      category: 'starter',
      name_en: 'First Steps',
      name_fr: 'Premiers Pas',
      description_en: 'Complete your first quest',
      description_fr: 'Complétez votre première quête',
      icon: FaRocket,
      color: 'bg-green-500',
      xp: 50,
      requirement: {
        type: 'quests_completed',
        value: 1
      }
    },
    {
      id: 'profile_complete',
      category: 'starter',
      name_en: 'Identity Established',
      name_fr: 'Identité Établie',
      description_en: 'Complete your profile',
      description_fr: 'Complétez votre profil',
      icon: FaUserGraduate,
      color: 'bg-blue-500',
      xp: 25,
      requirement: {
        type: 'profile_complete',
        value: true
      }
    },
  
    // STREAK BADGES
    {
      id: 'week_streak',
      category: 'streak',
      name_en: 'Week Warrior',
      name_fr: 'Guerrier de la Semaine',
      description_en: 'Maintain a 7-day streak',
      description_fr: 'Maintenez une série de 7 jours',
      icon: FaFire,
      color: 'bg-orange-500',
      xp: 100,
      requirement: {
        type: 'streak',
        value: 7
      }
    },
    {
      id: 'month_streak',
      category: 'streak',
      name_en: 'Monthly Master',
      name_fr: 'Maître du Mois',
      description_en: 'Maintain a 30-day streak',
      description_fr: 'Maintenez une série de 30 jours',
      icon: FaBolt,
      color: 'bg-red-500',
      xp: 300,
      requirement: {
        type: 'streak',
        value: 30
      }
    },
    {
      id: 'quarter_streak',
      category: 'streak',
      name_en: 'Quarter Champion',
      name_fr: 'Champion du Trimestre',
      description_en: 'Maintain a 90-day streak',
      description_fr: 'Maintenez une série de 90 jours',
      icon: FaCrown,
      color: 'bg-purple-600',
      xp: 1000,
      requirement: {
        type: 'streak',
        value: 90
      },
      rare: true
    },
  
    // QUEST COMPLETION BADGES
    {
      id: 'ten_quests',
      category: 'quests',
      name_en: 'Quest Enthusiast',
      name_fr: 'Enthousiaste des Quêtes',
      description_en: 'Complete 10 quests',
      description_fr: 'Complétez 10 quêtes',
      icon: FaTrophy,
      color: 'bg-yellow-500',
      xp: 200,
      requirement: {
        type: 'quests_completed',
        value: 10
      }
    },
    {
      id: 'fifty_quests',
      category: 'quests',
      name_en: 'Quest Master',
      name_fr: 'Maître des Quêtes',
      description_en: 'Complete 50 quests',
      description_fr: 'Complétez 50 quêtes',
      icon: FaMedal,
      color: 'bg-gold-500',
      xp: 500,
      requirement: {
        type: 'quests_completed',
        value: 50
      }
    },
    {
      id: 'hundred_quests',
      category: 'quests',
      name_en: 'Quest Legend',
      name_fr: 'Légende des Quêtes',
      description_en: 'Complete 100 quests',
      description_fr: 'Complétez 100 quêtes',
      icon: FaStar,
      color: 'bg-purple-700',
      xp: 1000,
      requirement: {
        type: 'quests_completed',
        value: 100
      },
      rare: true
    },
  
    // CATEGORY SPECIFIC BADGES
    {
      id: 'budgeting_expert',
      category: 'skills',
      name_en: 'Budget Master',
      name_fr: 'Maître du Budget',
      description_en: 'Complete all budgeting quests',
      description_fr: 'Complétez toutes les quêtes de budget',
      icon: FaCalculator,
      color: 'bg-green-600',
      xp: 300,
      requirement: {
        type: 'category_complete',
        value: 'budgeting'
      }
    },
    {
      id: 'saving_expert',
      category: 'skills',
      name_en: 'Savings Guru',
      name_fr: 'Gourou de l\'Épargne',
      description_en: 'Complete all saving quests',
      description_fr: 'Complétez toutes les quêtes d\'épargne',
      icon: FaPiggyBank,
      color: 'bg-pink-500',
      xp: 300,
      requirement: {
        type: 'category_complete',
        value: 'saving'
      }
    },
    {
      id: 'investing_expert',
      category: 'skills',
      name_en: 'Investment Wizard',
      name_fr: 'Magicien de l\'Investissement',
      description_en: 'Complete all investing quests',
      description_fr: 'Complétez toutes les quêtes d\'investissement',
      icon: FaChartLine,
      color: 'bg-purple-500',
      xp: 400,
      requirement: {
        type: 'category_complete',
        value: 'investing'
      }
    },
    {
      id: 'debt_crusher',
      category: 'skills',
      name_en: 'Debt Destroyer',
      name_fr: 'Destructeur de Dettes',
      description_en: 'Complete all debt management quests',
      description_fr: 'Complétez toutes les quêtes de gestion de dettes',
      icon: FaShieldAlt,
      color: 'bg-red-600',
      xp: 350,
      requirement: {
        type: 'category_complete',
        value: 'debt'
      }
    },
  
    // XP BADGES
    {
      id: 'xp_1000',
      category: 'xp',
      name_en: 'Rising Star',
      name_fr: 'Étoile Montante',
      description_en: 'Earn 1,000 XP',
      description_fr: 'Gagnez 1 000 XP',
      icon: FaStar,
      color: 'bg-bronze-500',
      xp: 0, // No additional XP for XP badges
      requirement: {
        type: 'xp',
        value: 1000
      }
    },
    {
      id: 'xp_5000',
      category: 'xp',
      name_en: 'High Achiever',
      name_fr: 'Haut Performeur',
      description_en: 'Earn 5,000 XP',
      description_fr: 'Gagnez 5 000 XP',
      icon: FaGem,
      color: 'bg-silver-500',
      xp: 0,
      requirement: {
        type: 'xp',
        value: 5000
      }
    },
    {
      id: 'xp_10000',
      category: 'xp',
      name_en: 'Elite Member',
      name_fr: 'Membre Élite',
      description_en: 'Earn 10,000 XP',
      description_fr: 'Gagnez 10 000 XP',
      icon: FaAward,
      color: 'bg-gold-600',
      xp: 0,
      requirement: {
        type: 'xp',
        value: 10000
      },
      rare: true
    },
  
    // SPECIAL BADGES
    {
      id: 'early_bird',
      category: 'special',
      name_en: 'Early Bird',
      name_fr: 'Lève-tôt',
      description_en: 'Complete 5 quests before 8 AM',
      description_fr: 'Complétez 5 quêtes avant 8h',
      icon: FaLightbulb,
      color: 'bg-yellow-400',
      xp: 150,
      requirement: {
        type: 'special',
        value: 'early_bird'
      }
    },
    {
      id: 'night_owl',
      category: 'special',
      name_en: 'Night Owl',
      name_fr: 'Oiseau de Nuit',
      description_en: 'Complete 5 quests after 10 PM',
      description_fr: 'Complétez 5 quêtes après 22h',
      icon: FaMedal,
      color: 'bg-indigo-600',
      xp: 150,
      requirement: {
        type: 'special',
        value: 'night_owl'
      }
    },
    {
      id: 'speed_demon',
      category: 'special',
      name_en: 'Speed Demon',
      name_fr: 'Démon de Vitesse',
      description_en: 'Complete 3 quests in one day',
      description_fr: 'Complétez 3 quêtes en un jour',
      icon: FaBolt,
      color: 'bg-red-500',
      xp: 200,
      requirement: {
        type: 'special',
        value: 'speed_demon'
      }
    },
    {
      id: 'perfectionist',
      category: 'special',
      name_en: 'Perfectionist',
      name_fr: 'Perfectionniste',
      description_en: 'Get 100% on 10 quizzes',
      description_fr: 'Obtenez 100% sur 10 quiz',
      icon: FaStar,
      color: 'bg-purple-500',
      xp: 250,
      requirement: {
        type: 'special',
        value: 'perfectionist'
      }
    },
  
    // PREMIUM BADGES
    {
      id: 'premium_member',
      category: 'premium',
      name_en: 'Premium Member',
      name_fr: 'Membre Premium',
      description_en: 'Become a premium member',
      description_fr: 'Devenez membre premium',
      icon: FaCrown,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      xp: 100,
      requirement: {
        type: 'premium',
        value: true
      },
      isPremium: true
    },
    {
      id: 'premium_veteran',
      category: 'premium',
      name_en: 'Premium Veteran',
      name_fr: 'Vétéran Premium',
      description_en: '6 months of premium membership',
      description_fr: '6 mois d\'abonnement premium',
      icon: FaAward,
      color: 'bg-gradient-to-r from-gold-500 to-yellow-500',
      xp: 500,
      requirement: {
        type: 'premium_months',
        value: 6
      },
      isPremium: true,
      rare: true
    }
  ];
  
  // Helper functions
  
  /**
   * Get badge by ID with language support
   */
  export const getBadgeById = (badgeId, lang = 'en') => {
    const badge = badges.find(b => b.id === badgeId);
    if (!badge) return null;
    
    return {
      ...badge,
      name: badge[`name_${lang}`] || badge.name_en,
      description: badge[`description_${lang}`] || badge.description_en
    };
  };
  
  /**
   * Get badges by category
   */
  export const getBadgesByCategory = (category, lang = 'en') => {
    return badges
      .filter(badge => badge.category === category)
      .map(badge => ({
        ...badge,
        name: badge[`name_${lang}`] || badge.name_en,
        description: badge[`description_${lang}`] || badge.description_en
      }));
  };
  
  /**
   * Check which badges a user has earned
   */
  export const checkEarnedBadges = (userStats) => {
    const earnedBadges = [];
    
    badges.forEach(badge => {
      let earned = false;
      
      switch (badge.requirement.type) {
        case 'quests_completed':
          earned = userStats.completedQuests >= badge.requirement.value;
          break;
        case 'streak':
          earned = userStats.currentStreak >= badge.requirement.value || 
                   userStats.longestStreak >= badge.requirement.value;
          break;
        case 'xp':
          earned = userStats.totalXP >= badge.requirement.value;
          break;
        case 'profile_complete':
          earned = userStats.profileComplete === true;
          break;
        case 'premium':
          earned = userStats.isPremium === true;
          break;
        case 'premium_months':
          earned = userStats.premiumMonths >= badge.requirement.value;
          break;
        case 'category_complete':
          earned = userStats.completedCategories?.includes(badge.requirement.value);
          break;
        case 'special':
          earned = userStats.specialBadges?.includes(badge.requirement.value);
          break;
        default:
          earned = false;
      }
      
      if (earned) {
        earnedBadges.push(badge.id);
      }
    });
    
    return earnedBadges;
  };
  
  /**
   * Get next achievable badges for a user
   */
  export const getNextBadges = (userStats, limit = 3) => {
    const earnedBadgeIds = userStats.badges || [];
    const nextBadges = [];
    
    badges.forEach(badge => {
      if (earnedBadgeIds.includes(badge.id)) return;
      
      let progress = 0;
      let current = 0;
      let target = badge.requirement.value;
      
      switch (badge.requirement.type) {
        case 'quests_completed':
          current = userStats.completedQuests || 0;
          progress = (current / target) * 100;
          break;
        case 'streak':
          current = Math.max(userStats.currentStreak || 0, userStats.longestStreak || 0);
          progress = (current / target) * 100;
          break;
        case 'xp':
          current = userStats.totalXP || 0;
          progress = (current / target) * 100;
          break;
        default:
          progress = 0;
      }
      
      if (progress > 0 && progress < 100) {
        nextBadges.push({
          ...badge,
          progress,
          current,
          target
        });
      }
    });
    
    // Sort by progress (closest to completion first)
    return nextBadges
      .sort((a, b) => b.progress - a.progress)
      .slice(0, limit);
  };
  
  /**
 * Calculate total XP from badges
 */
export const calculateBadgeXP = (badgeIds) => {
  return badgeIds.reduce((total, badgeId) => {
    const badge = badges.find(b => b.id === badgeId);
    return total + (badge?.xp || 0);
  }, 0);
};
  
  /**
   * Get badge statistics
   */
  export const getBadgeStats = () => {
    const total = badges.length;
    const byCategory = badges.reduce((acc, badge) => {
      acc[badge.category] = (acc[badge.category] || 0) + 1;
      return acc;
    }, {});
    
    const rare = badges.filter(b => b.rare).length;
    const premium = badges.filter(b => b.premium).length;
    
    return {
      total,
      byCategory,
      rare,
      premium
    };
  };