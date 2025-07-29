// Configuration du partage social pour FinanceQuest
const SOCIAL_CONFIG = {
  TIKTOK: {
    HASHTAGS: ['#MoneyQuest', '#FinanceQuest', '#FinancialFreedom', '#MoneyTips', '#GenZFinance', '#Investing', '#Budgeting', '#MoneyHacks'],
    BASE_URL: 'https://www.tiktok.com/share',
    APP_URL: 'https://financequest-app.vercel.app'
  },
  TWITTER: {
    HASHTAGS: ['#FinanceQuest', '#MoneyTips', '#FinancialEducation'],
    BASE_URL: 'https://twitter.com/intent/tweet'
  },
  FACEBOOK: {
    BASE_URL: 'https://www.facebook.com/sharer/sharer.php'
  },
  LINKEDIN: {
    BASE_URL: 'https://www.linkedin.com/sharing/share-offsite'
  }
};

// Templates de messages pour différents types de partage
const SHARE_TEMPLATES = {
  QUEST_COMPLETE: {
    en: {
      tiktok: "Just completed '{{quest}}' on FinanceQuest! 🎯 Learning finance has never been this fun! {{hashtags}}",
      twitter: "Just completed '{{quest}}' on FinanceQuest! 🎯 Learning finance has never been this fun! {{hashtags}}",
      facebook: "Just completed '{{quest}}' on FinanceQuest! 🎯 Learning finance has never been this fun!",
      linkedin: "Just completed '{{quest}}' on FinanceQuest! 🎯 Learning finance has never been this fun!"
    },
    fr: {
      tiktok: "Je viens de terminer '{{quest}}' sur FinanceQuest ! 🎯 Apprendre la finance n'a jamais été aussi amusant ! {{hashtags}}",
      twitter: "Je viens de terminer '{{quest}}' sur FinanceQuest ! 🎯 Apprendre la finance n'a jamais été aussi amusant ! {{hashtags}}",
      facebook: "Je viens de terminer '{{quest}}' sur FinanceQuest ! 🎯 Apprendre la finance n'a jamais été aussi amusant !",
      linkedin: "Je viens de terminer '{{quest}}' sur FinanceQuest ! 🎯 Apprendre la finance n'a jamais été aussi amusant !"
    }
  },
  LEVEL_UP: {
    en: {
      tiktok: "Just reached {{level}} level on FinanceQuest! 🚀 {{xp}} XP and counting! Level up your financial game! {{hashtags}}",
      twitter: "Just reached {{level}} level on FinanceQuest! 🚀 {{xp}} XP and counting! Level up your financial game! {{hashtags}}",
      facebook: "Just reached {{level}} level on FinanceQuest! 🚀 {{xp}} XP and counting! Level up your financial game!",
      linkedin: "Just reached {{level}} level on FinanceQuest! 🚀 {{xp}} XP and counting! Level up your financial game!"
    },
    fr: {
      tiktok: "Je viens d'atteindre le niveau {{level}} sur FinanceQuest ! 🚀 {{xp}} XP et ça continue ! Montez de niveau dans vos finances ! {{hashtags}}",
      twitter: "Je viens d'atteindre le niveau {{level}} sur FinanceQuest ! 🚀 {{xp}} XP et ça continue ! Montez de niveau dans vos finances ! {{hashtags}}",
      facebook: "Je viens d'atteindre le niveau {{level}} sur FinanceQuest ! 🚀 {{xp}} XP et ça continue ! Montez de niveau dans vos finances !",
      linkedin: "Je viens d'atteindre le niveau {{level}} sur FinanceQuest ! 🚀 {{xp}} XP et ça continue ! Montez de niveau dans vos finances !"
    }
  },
  STREAK_MILESTONE: {
    en: {
      tiktok: "{{streak}} day streak on FinanceQuest! 🔥 Consistency is key to financial success! {{hashtags}}",
      twitter: "{{streak}} day streak on FinanceQuest! 🔥 Consistency is key to financial success! {{hashtags}}",
      facebook: "{{streak}} day streak on FinanceQuest! 🔥 Consistency is key to financial success!",
      linkedin: "{{streak}} day streak on FinanceQuest! 🔥 Consistency is key to financial success!"
    },
    fr: {
      tiktok: "{{streak}} jours de série sur FinanceQuest ! 🔥 La constance est la clé du succès financier ! {{hashtags}}",
      twitter: "{{streak}} jours de série sur FinanceQuest ! 🔥 La constance est la clé du succès financier ! {{hashtags}}",
      facebook: "{{streak}} jours de série sur FinanceQuest ! 🔥 La constance est la clé du succès financier !",
      linkedin: "{{streak}} jours de série sur FinanceQuest ! 🔥 La constance est la clé du succès financier !"
    }
  },
  BADGE_EARNED: {
    en: {
      tiktok: "New badge unlocked: {{badge}} on FinanceQuest! 🏆 Achievement unlocked! {{hashtags}}",
      twitter: "New badge unlocked: {{badge}} on FinanceQuest! 🏆 Achievement unlocked! {{hashtags}}",
      facebook: "New badge unlocked: {{badge}} on FinanceQuest! 🏆 Achievement unlocked!",
      linkedin: "New badge unlocked: {{badge}} on FinanceQuest! 🏆 Achievement unlocked!"
    },
    fr: {
      tiktok: "Nouveau badge débloqué : {{badge}} sur FinanceQuest ! 🏆 Accomplissement débloqué ! {{hashtags}}",
      twitter: "Nouveau badge débloqué : {{badge}} sur FinanceQuest ! 🏆 Accomplissement débloqué ! {{hashtags}}",
      facebook: "Nouveau badge débloqué : {{badge}} sur FinanceQuest ! 🏆 Accomplissement débloqué !",
      linkedin: "Nouveau badge débloqué : {{badge}} sur FinanceQuest ! 🏆 Accomplissement débloqué !"
    }
  },
  DAILY_CHALLENGE: {
    en: {
      tiktok: "Completed today's daily challenge on FinanceQuest! 💪 Double XP earned! {{hashtags}}",
      twitter: "Completed today's daily challenge on FinanceQuest! 💪 Double XP earned! {{hashtags}}",
      facebook: "Completed today's daily challenge on FinanceQuest! 💪 Double XP earned!",
      linkedin: "Completed today's daily challenge on FinanceQuest! 💪 Double XP earned!"
    },
    fr: {
      tiktok: "Défi quotidien terminé sur FinanceQuest ! 💪 XP double gagné ! {{hashtags}}",
      twitter: "Défi quotidien terminé sur FinanceQuest ! 💪 XP double gagné ! {{hashtags}}",
      facebook: "Défi quotidien terminé sur FinanceQuest ! 💪 XP double gagné !",
      linkedin: "Défi quotidien terminé sur FinanceQuest ! 💪 XP double gagné !"
    }
  }
};

// Générer des hashtags aléatoires pour la variété
const generateHashtags = (platform, count = 3) => {
  const hashtags = SOCIAL_CONFIG[platform.toUpperCase()]?.HASHTAGS || SOCIAL_CONFIG.TIKTOK.HASHTAGS;
  const shuffled = [...hashtags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join(' ');
};

// Remplacer les variables dans le template
const replaceTemplateVariables = (template, data, platform, language = 'en') => {
  let message = template[language]?.[platform] || template.en[platform] || template;
  
  // Remplacer les variables
  Object.keys(data).forEach(key => {
    const placeholder = `{{${key}}}`;
    message = message.replace(new RegExp(placeholder, 'g'), data[key]);
  });
  
  // Remplacer les hashtags
  if (message.includes('{{hashtags}}')) {
    const hashtags = generateHashtags(platform);
    message = message.replace('{{hashtags}}', hashtags);
  }
  
  return message;
};

// Partager sur TikTok (méthode principale)
export const shareToTikTok = async (shareType, data, language = 'en') => {
  try {
    const template = SHARE_TEMPLATES[shareType];
    if (!template) {
      throw new Error(`Unknown share type: ${shareType}`);
    }
    
    const message = replaceTemplateVariables(template, data, 'tiktok', language);
    const url = SOCIAL_CONFIG.TIKTOK.APP_URL;
    
    // TikTok Web Share API (si supporté)
    if (navigator.share && navigator.canShare) {
      const shareData = {
        title: 'FinanceQuest Achievement',
        text: message,
        url: url
      };
      
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return { success: true, platform: 'tiktok', method: 'native' };
      }
    }
    
    // Fallback: Copier dans le presse-papiers avec instructions TikTok
    await copyToClipboard(`${message}\n\n${url}`);
    
    return {
      success: true,
      platform: 'tiktok',
      method: 'clipboard',
      message: 'Content copied! Open TikTok and paste in your post.',
      data: { message, url }
    };
    
  } catch (error) {
    console.error('Error sharing to TikTok:', error);
    return { success: false, error: error.message };
  }
};

// Partager sur Twitter
export const shareToTwitter = (shareType, data, language = 'en') => {
  try {
    const template = SHARE_TEMPLATES[shareType];
    const message = replaceTemplateVariables(template, data, 'twitter', language);
    const url = SOCIAL_CONFIG.TIKTOK.APP_URL;
    
    const twitterUrl = `${SOCIAL_CONFIG.TWITTER.BASE_URL}?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`;
    
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    
    return { success: true, platform: 'twitter' };
  } catch (error) {
    console.error('Error sharing to Twitter:', error);
    return { success: false, error: error.message };
  }
};

// Partager sur Facebook
export const shareToFacebook = (shareType, data, language = 'en') => {
  try {
    const template = SHARE_TEMPLATES[shareType];
    const message = replaceTemplateVariables(template, data, 'facebook', language);
    const url = SOCIAL_CONFIG.TIKTOK.APP_URL;
    
    const facebookUrl = `${SOCIAL_CONFIG.FACEBOOK.BASE_URL}?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`;
    
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    
    return { success: true, platform: 'facebook' };
  } catch (error) {
    console.error('Error sharing to Facebook:', error);
    return { success: false, error: error.message };
  }
};

// Partager sur LinkedIn
export const shareToLinkedIn = (shareType, data, language = 'en') => {
  try {
    const template = SHARE_TEMPLATES[shareType];
    const message = replaceTemplateVariables(template, data, 'linkedin', language);
    const url = SOCIAL_CONFIG.TIKTOK.APP_URL;
    
    const linkedinUrl = `${SOCIAL_CONFIG.LINKEDIN.BASE_URL}?url=${encodeURIComponent(url)}&title=${encodeURIComponent('FinanceQuest Achievement')}&summary=${encodeURIComponent(message)}`;
    
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
    
    return { success: true, platform: 'linkedin' };
  } catch (error) {
    console.error('Error sharing to LinkedIn:', error);
    return { success: false, error: error.message };
  }
};

// Copier dans le presse-papiers
const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback pour les contextes non sécurisés
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// Partager générique (choix de plateforme)
export const shareAchievement = async (platform, shareType, data, language = 'en') => {
  const shareFunctions = {
    tiktok: shareToTikTok,
    twitter: shareToTwitter,
    facebook: shareToFacebook,
    linkedin: shareToLinkedIn
  };
  
  const shareFunction = shareFunctions[platform.toLowerCase()];
  if (!shareFunction) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  
  return await shareFunction(shareType, data, language);
};

// Partager automatiquement après une quête terminée
export const autoShareQuestComplete = async (questData, userData, language = 'en') => {
  const shareData = {
    quest: questData.title,
    xp: questData.xp,
    level: userData.level || 'Novice'
  };
  
  // Partager sur TikTok par défaut (plateforme principale)
  return await shareToTikTok('QUEST_COMPLETE', shareData, language);
};

// Partager automatiquement après un level up
export const autoShareLevelUp = async (newLevel, xp, language = 'en') => {
  const shareData = {
    level: newLevel,
    xp: xp
  };
  
  return await shareToTikTok('LEVEL_UP', shareData, language);
};

// Partager automatiquement après un streak milestone
export const autoShareStreakMilestone = async (streakDays, language = 'en') => {
  const shareData = {
    streak: streakDays
  };
  
  return await shareToTikTok('STREAK_MILESTONE', shareData, language);
};

// Partager automatiquement après un badge gagné
export const autoShareBadgeEarned = async (badgeName, language = 'en') => {
  const shareData = {
    badge: badgeName
  };
  
  return await shareToTikTok('BADGE_EARNED', shareData, language);
};

// Partager automatiquement après un défi quotidien terminé
export const autoShareDailyChallenge = async (challengeData, language = 'en') => {
  const shareData = {
    challenge: challengeData.questTitle,
    xp: challengeData.rewards.xp
  };
  
  return await shareToTikTok('DAILY_CHALLENGE', shareData, language);
};

// Obtenir les statistiques de partage
export const getShareStats = () => {
  const stats = localStorage.getItem('financequest_share_stats');
  return stats ? JSON.parse(stats) : {
    totalShares: 0,
    platformShares: {
      tiktok: 0,
      twitter: 0,
      facebook: 0,
      linkedin: 0
    },
    lastShare: null
  };
};

// Enregistrer un partage
export const recordShare = (platform, shareType) => {
  const stats = getShareStats();
  stats.totalShares++;
  stats.platformShares[platform] = (stats.platformShares[platform] || 0) + 1;
  stats.lastShare = {
    platform,
    shareType,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem('financequest_share_stats', JSON.stringify(stats));
  
  // Analytics (si disponible)
  if (window.gtag) {
    window.gtag('event', 'share', {
      method: platform,
      content_type: shareType
    });
  }
}; 