import html2canvas from 'html2canvas';

// Configuration du partage d'achievement
const ACHIEVEMENT_CONFIG = {
  APP_URL: 'https://financequest-app.vercel.app',
  HASHTAGS: ['#MoneyQuest', '#FinanceQuest', '#GenZFinance', '#FinancialFreedom'],
  BONUS_XP: 10, // Bonus XP pour partage (motivation Duolingo-like)
  IMAGE_QUALITY: 0.9,
  IMAGE_WIDTH: 400,
  IMAGE_HEIGHT: 600 // Réduire la hauteur maintenant que les badges sont supprimés
};

// Générer une image d'achievement
export const generateAchievementImage = async (achievementCardRef, quest, userData, score = 100) => {
  try {
    if (!achievementCardRef.current) {
      throw new Error('Achievement card reference not found');
    }

    console.log('Starting image generation...', { quest, userData, score });

    // Reset scroll pour éviter la troncature
    window.scrollTo(0, 0);

    // Rendre la carte temporairement visible pour la capture
    const cardElement = achievementCardRef.current;
    const originalStyles = {
      position: cardElement.style.position,
      left: cardElement.style.left,
      top: cardElement.style.top,
      opacity: cardElement.style.opacity,
      visibility: cardElement.style.visibility,
      zIndex: cardElement.style.zIndex,
      width: cardElement.style.width,
      height: cardElement.style.height,
      overflow: cardElement.style.overflow
    };

    console.log('Original styles:', originalStyles);

    // Positionner la carte pour la capture optimale
    cardElement.style.position = 'fixed';
    cardElement.style.left = '50%';
    cardElement.style.top = '50%';
    cardElement.style.transform = 'translate(-50%, -50%)';
    cardElement.style.opacity = '1';
    cardElement.style.visibility = 'visible';
    cardElement.style.zIndex = '10000';
    cardElement.style.width = '400px';
    cardElement.style.height = '600px';
    cardElement.style.overflow = 'visible';

    console.log('Card element after style changes:', cardElement);

    // Attendre que le DOM soit mis à jour
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Vérifier que la carte est bien visible
    console.log('Card element before capture:', {
      offsetWidth: cardElement.offsetWidth,
      offsetHeight: cardElement.offsetHeight,
      scrollWidth: cardElement.scrollWidth,
      scrollHeight: cardElement.scrollHeight,
      style: {
        position: cardElement.style.position,
        visibility: cardElement.style.visibility,
        opacity: cardElement.style.opacity
      }
    });

    // Configuration html2canvas optimisée pour TikTok (format vertical)
    const canvas = await html2canvas(cardElement, {
      scale: 2, // Haute résolution pour mobile
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#111827',
      width: ACHIEVEMENT_CONFIG.IMAGE_WIDTH,
      height: ACHIEVEMENT_CONFIG.IMAGE_HEIGHT,
      logging: true,
      imageTimeout: 15000,
      removeContainer: false,
      foreignObjectRendering: false,
      // Optimisations pour éviter la troncature
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      scrollX: 0,
      scrollY: 0
    });

    console.log('Canvas generated:', canvas);

    // Restaurer les styles originaux
    Object.assign(cardElement.style, originalStyles);

    // Convertir en blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        console.log('Blob created:', blob);
        resolve(blob);
      }, 'image/png', ACHIEVEMENT_CONFIG.IMAGE_QUALITY);
    });

  } catch (error) {
    console.error('Error generating achievement image:', error);
    throw error;
  }
};

// Partager l'achievement avec image (méthode principale)
export const shareAchievement = async (achievementCardRef, quest, userData, score = 100, language = 'en') => {
  try {
    console.log('Starting achievement share...', { quest, userData, score });
    
    // Générer l'image d'achievement
    const imageBlob = await generateAchievementImage(achievementCardRef, quest, userData, score);
    
    console.log('Image generated successfully', { blobSize: imageBlob?.size });
    
    // Créer le fichier pour le partage
    const imageFile = new File([imageBlob], 'achievement.png', { type: 'image/png' });
    
    // Message de partage optimisé
    const shareMessage = generateShareMessage(quest, userData, score, language);
    
    // Essayer le partage natif (TikTok priorisé)
    if (navigator.share && navigator.canShare) {
      const shareData = {
        title: language === 'fr' ? 'Achievement FinanceQuest !' : 'FinanceQuest Achievement!',
        text: shareMessage,
        url: ACHIEVEMENT_CONFIG.APP_URL,
        files: [imageFile]
      };
      
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return {
          success: true,
          method: 'native',
          platform: 'auto',
          message: 'Achievement shared successfully!'
        };
      }
    }
    
    // Fallback: Partage TikTok spécifique
    const tiktokResult = await shareToTikTokWithImage(imageBlob, shareMessage);
    if (tiktokResult.success) {
      return tiktokResult;
    }
    
    // Fallback: Copier dans le presse-papiers avec instructions
    await copyAchievementToClipboard(imageBlob, shareMessage);
    
    return {
      success: true,
      method: 'clipboard',
      platform: 'manual',
      message: language === 'fr' 
        ? 'Image copiée ! Ouvrez TikTok et collez dans votre post.' 
        : 'Image copied! Open TikTok and paste in your post.',
      data: { imageBlob, message: shareMessage }
    };
    
  } catch (error) {
    console.error('Error sharing achievement:', error);
    return {
      success: false,
      error: error.message,
      method: 'error'
    };
  }
};

// Partager spécifiquement sur TikTok avec image
const shareToTikTokWithImage = async (imageBlob, message) => {
  try {
    // Essayer d'ouvrir TikTok avec l'image
    const tiktokUrl = `tiktok://share?text=${encodeURIComponent(message)}`;
    
    // Créer un lien temporaire pour l'image
    const imageUrl = URL.createObjectURL(imageBlob);
    
    // Ouvrir TikTok (si installé)
    window.open(tiktokUrl, '_blank');
    
    // Fallback: Copier l'image et le message
    await copyAchievementToClipboard(imageBlob, message);
    
    return {
      success: true,
      method: 'tiktok',
      platform: 'tiktok',
      message: 'TikTok opened! Paste the image and text in your post.'
    };
    
  } catch (error) {
    console.error('Error sharing to TikTok:', error);
    return { success: false, error: error.message };
  }
};

// Copier l'achievement dans le presse-papiers
const copyAchievementToClipboard = async (imageBlob, message) => {
  try {
    // Essayer de copier l'image et le texte
    if (navigator.clipboard && navigator.clipboard.write) {
      const clipboardItem = new ClipboardItem({
        'image/png': imageBlob,
        'text/plain': new Blob([message], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
    } else {
      // Fallback: Copier seulement le texte
      await navigator.clipboard.writeText(message);
    }
    
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    // Fallback final: Copier seulement le texte
    try {
      await navigator.clipboard.writeText(message);
      return true;
    } catch (fallbackError) {
      console.error('Fallback clipboard error:', fallbackError);
      return false;
    }
  }
};

// Générer le message de partage optimisé
const generateShareMessage = (quest, userData, score, language) => {
  const hashtags = ACHIEVEMENT_CONFIG.HASHTAGS.join(' ');
  
  const templates = {
    en: {
      perfect: `Just completed "${quest.title}" on FinanceQuest with a perfect score! 🏆 ${score}/100 #FinancialMaster ${hashtags}`,
      excellent: `Achievement unlocked! Completed "${quest.title}" on FinanceQuest! 🎯 ${score}/100 ${hashtags}`,
      good: `Made progress on "${quest.title}" with FinanceQuest! 📈 ${score}/100 ${hashtags}`,
      basic: `Learning finance with FinanceQuest! Completed "${quest.title}" 📚 ${hashtags}`
    },
    fr: {
      perfect: `Je viens de terminer "${quest.title}" sur FinanceQuest avec un score parfait ! 🏆 ${score}/100 #MaîtreFinancier ${hashtags}`,
      excellent: `Achievement débloqué ! Terminé "${quest.title}" sur FinanceQuest ! 🎯 ${score}/100 ${hashtags}`,
      good: `Progrès réalisé sur "${quest.title}" avec FinanceQuest ! 📈 ${score}/100 ${hashtags}`,
      basic: `J'apprends la finance avec FinanceQuest ! Terminé "${quest.title}" 📚 ${hashtags}`
    }
  };
  
  const lang = language === 'fr' ? 'fr' : 'en';
  
  if (score >= 95) return templates[lang].perfect;
  if (score >= 80) return templates[lang].excellent;
  if (score >= 60) return templates[lang].good;
  return templates[lang].basic;
};

// Attribuer le bonus XP pour partage (motivation Duolingo-like)
export const awardShareBonus = async (userId) => {
  try {
    console.log(`Share bonus XP awarded to user ${userId}`);
    
    // Vérifier si l'utilisateur a déjà partagé cette quête aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const shareKey = `share_${userId}_${today}`;
    const hasSharedToday = localStorage.getItem(shareKey);
    
    if (hasSharedToday) {
      return {
        success: false,
        message: 'You already earned bonus XP for sharing today!',
        alreadyShared: true
      };
    }
    
    // Marquer comme partagé aujourd'hui
    localStorage.setItem(shareKey, 'true');
    
    // Ici vous pourriez mettre à jour Firestore
    // await updateDoc(doc(db, 'users', userId), {
    //   xp: increment(ACHIEVEMENT_CONFIG.BONUS_XP),
    //   sharesCount: increment(1)
    // });
    
    return {
      success: true,
      bonusXP: ACHIEVEMENT_CONFIG.BONUS_XP,
      message: `+${ACHIEVEMENT_CONFIG.BONUS_XP} XP bonus for sharing!`
    };
  } catch (error) {
    console.error('Error awarding share bonus:', error);
    return { success: false, error: error.message };
  }
};

// Obtenir les statistiques de partage
export const getShareStats = () => {
  const stats = localStorage.getItem('financequest_achievement_shares');
  return stats ? JSON.parse(stats) : {
    totalShares: 0,
    totalBonusXP: 0,
    lastShare: null,
    shareHistory: []
  };
};

// Enregistrer un partage d'achievement
export const recordAchievementShare = (questId, score, platform = 'auto') => {
  const stats = getShareStats();
  const shareRecord = {
    questId,
    score,
    platform,
    timestamp: new Date().toISOString(),
    bonusXP: ACHIEVEMENT_CONFIG.BONUS_XP
  };
  
  stats.totalShares++;
  stats.totalBonusXP += ACHIEVEMENT_CONFIG.BONUS_XP;
  stats.lastShare = shareRecord;
  stats.shareHistory.push(shareRecord);
  
  // Garder seulement les 50 derniers partages
  if (stats.shareHistory.length > 50) {
    stats.shareHistory = stats.shareHistory.slice(-50);
  }
  
  localStorage.setItem('financequest_achievement_shares', JSON.stringify(stats));
  
  // Analytics
  if (window.gtag) {
    window.gtag('event', 'achievement_share', {
      quest_id: questId,
      score: score,
      platform: platform,
      bonus_xp: ACHIEVEMENT_CONFIG.BONUS_XP
    });
  }
  
  return stats;
}; 