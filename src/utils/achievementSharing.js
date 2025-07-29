import html2canvas from 'html2canvas';
import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';

// Configuration du système de partage
export const SHARING_CONFIG = {
  APP_URL: 'https://financequest-app.vercel.app',
  APP_NAME: 'FinanceQuest',
  BONUS_XP: 10,
  DAILY_SHARE_LIMIT: 1,
  IMAGE: {
    WIDTH: 400,
    HEIGHT: 600,
    QUALITY: 0.95,
    BACKGROUND: '#111827'
  },
  HASHTAGS: {
    en: ['#FinanceQuest', '#MoneyQuest', '#GenZFinance', '#FinancialFreedom', '#MoneyTips'],
    fr: ['#FinanceQuest', '#MoneyQuest', '#GenZFinance', '#LibertéFinancière', '#ConseilsArgent']
  }
};

// Alias pour compatibilité
export const ACHIEVEMENT_CONFIG = SHARING_CONFIG;

// Générer le message de partage
export const generateShareMessage = (quest, score, language = 'en', platform = 'twitter') => {
  const questTitle = language === 'fr' ? (quest.titleFR || quest.title) : (quest.titleEN || quest.title);
  const hashtags = SHARING_CONFIG.HASHTAGS[language].slice(0, 3).join(' ');
  
  const messages = {
    perfect: {
      en: `🏆 PERFECT SCORE! Just aced "${questTitle}" on ${SHARING_CONFIG.APP_NAME}! 💯\n\n${hashtags}`,
      fr: `🏆 SCORE PARFAIT ! J'ai réussi "${questTitle}" sur ${SHARING_CONFIG.APP_NAME} ! 💯\n\n${hashtags}`
    },
    excellent: {
      en: `🎯 Crushed it! ${score}% on "${questTitle}" with ${SHARING_CONFIG.APP_NAME}!\n\n${hashtags}`,
      fr: `🎯 Écrasé ! ${score}% sur "${questTitle}" avec ${SHARING_CONFIG.APP_NAME} !\n\n${hashtags}`
    },
    good: {
      en: `💪 Making progress! Scored ${score}% on "${questTitle}"\n\nJoin me on ${SHARING_CONFIG.APP_NAME} 🚀\n\n${hashtags}`,
      fr: `💪 En progrès ! Score de ${score}% sur "${questTitle}"\n\nRejoins-moi sur ${SHARING_CONFIG.APP_NAME} 🚀\n\n${hashtags}`
    }
  };
  
  let messageType = 'good';
  if (score >= 95) messageType = 'perfect';
  else if (score >= 80) messageType = 'excellent';
  
  return messages[messageType][language];
};

// Capturer l'image de l'achievement card
export const captureAchievementCard = async (cardRef) => {
  try {
    if (!cardRef?.current) {
      throw new Error('Card reference not found');
    }

    console.log('Starting image capture...');
    const element = cardRef.current;
    
    // Sauvegarder les styles originaux
    const originalStyles = {
      position: element.style.position,
      left: element.style.left,
      top: element.style.top,
      transform: element.style.transform,
      opacity: element.style.opacity,
      visibility: element.style.visibility,
      zIndex: element.style.zIndex
    };

    // Positionner pour la capture
    Object.assign(element.style, {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      opacity: '1',
      visibility: 'visible',
      zIndex: '10000'
    });

    // Attendre le rendu
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capturer avec html2canvas
    const canvas = await html2canvas(element, {
      width: SHARING_CONFIG.IMAGE.WIDTH,
      height: SHARING_CONFIG.IMAGE.HEIGHT,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: SHARING_CONFIG.IMAGE.BACKGROUND,
      logging: false,
      imageTimeout: 15000,
      windowWidth: SHARING_CONFIG.IMAGE.WIDTH,
      windowHeight: SHARING_CONFIG.IMAGE.HEIGHT
    });

    // Restaurer les styles
    Object.assign(element.style, originalStyles);

    // Convertir en blob
    const blob = await new Promise(resolve => 
      canvas.toBlob(resolve, 'image/png', SHARING_CONFIG.IMAGE.QUALITY)
    );

    console.log('Image captured successfully');

    return {
      success: true,
      blob,
      dataUrl: canvas.toDataURL('image/png', SHARING_CONFIG.IMAGE.QUALITY)
    };

  } catch (error) {
    console.error('Error capturing achievement card:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Alias pour compatibilité
export const generateAchievementImage = captureAchievementCard;

// Partager avec image (fonction principale)
export const shareAchievementWithImage = async (cardRef, quest, userData, score, language = 'en') => {
  try {
    console.log('Starting shareAchievementWithImage...');
    
    // 1. Capturer l'image
    const imageResult = await captureAchievementCard(cardRef);
    
    if (!imageResult.success) {
      throw new Error(imageResult.error || 'Failed to capture image');
    }
    
    // 2. Générer le message
    const shareMessage = generateShareMessage(quest, score, language);
    const shareUrl = SHARING_CONFIG.APP_URL;
    
    // 3. Essayer le partage natif avec image
    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([imageResult.blob], 'achievement.png', {
          type: 'image/png',
          lastModified: Date.now()
        });
        
        const shareData = {
          title: language === 'fr' ? 'Ma réussite FinanceQuest !' : 'My FinanceQuest Achievement!',
          text: shareMessage,
          url: shareUrl,
          files: [file]
        };
        
        if (navigator.canShare(shareData)) {
          console.log('Sharing with native API (with image)...');
          await navigator.share(shareData);
          
          return {
            success: true,
            method: 'native-with-image',
            platform: 'native',
            message: language === 'fr' ? 'Partagé avec succès !' : 'Shared successfully!'
          };
        }
      } catch (error) {
        console.log('Native share with image failed:', error);
      }
    }
    
    // 4. Fallback : Partage sans image
    if (navigator.share) {
      try {
        const shareData = {
          title: language === 'fr' ? 'Ma réussite FinanceQuest !' : 'My FinanceQuest Achievement!',
          text: shareMessage,
          url: shareUrl
        };
        
        console.log('Sharing with native API (text only)...');
        await navigator.share(shareData);
        
        return {
          success: true,
          method: 'native-text',
          platform: 'native',
          message: language === 'fr' ? 'Partagé avec succès !' : 'Shared successfully!'
        };
      } catch (error) {
        console.log('Native share text failed:', error);
      }
    }
    
    // 5. Fallback ultime : Copier dans le presse-papier
    const clipboardText = `${shareMessage}\n\n${shareUrl}`;
    await navigator.clipboard.writeText(clipboardText);
    
    // Sauvegarder l'image localement pour usage futur
    localStorage.setItem('financequest_last_achievement', JSON.stringify({
      image: imageResult.dataUrl,
      message: shareMessage,
      timestamp: new Date().toISOString()
    }));
    
    return {
      success: true,
      method: 'clipboard',
      platform: 'clipboard',
      message: language === 'fr' 
        ? 'Lien copié ! Collez-le sur votre réseau social préféré 📋' 
        : 'Link copied! Paste it on your favorite social network 📋',
      clipboardText,
      imageDataUrl: imageResult.dataUrl
    };
    
  } catch (error) {
    console.error('Error in shareAchievementWithImage:', error);
    return {
      success: false,
      error: error.message,
      message: language === 'fr' 
        ? 'Erreur lors du partage. Réessayez !' 
        : 'Error sharing. Please try again!'
    };
  }
};

// Enregistrer le partage pour analytics
export const recordAchievementShare = async (shareData) => {
  try {
    const {
      userId,
      questId,
      platform,
      score,
      language,
      timestamp = new Date().toISOString()
    } = shareData;

    const shareId = `share_${userId}_${questId}_${Date.now()}`;
    
    const shareRecord = {
      shareId,
      userId,
      questId,
      platform,
      score,
      language,
      timestamp,
      url: SHARING_CONFIG.APP_URL
    };

    // Stocker localement
    localStorage.setItem(`financequest_achievement_${shareId}`, JSON.stringify(shareRecord));

    // Mettre à jour les stats
    updatePlatformStats(platform);

    // Si Firebase disponible
    if (shareData.db) {
      try {
        const shareRef = doc(shareData.db, 'achievement_shares', shareId);
        await setDoc(shareRef, shareRecord);
      } catch (error) {
        console.warn('Could not save to Firebase:', error);
      }
    }

    return {
      success: true,
      shareId,
      message: 'Achievement share recorded'
    };

  } catch (error) {
    console.error('Error recording share:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Attribuer le bonus XP
export const awardShareBonus = async (userId, db) => {
  try {
    if (!userId) {
      throw new Error('User ID required');
    }

    // Vérifier la limite quotidienne
    const today = new Date().toISOString().split('T')[0];
    const shareKey = `financequest_share_${userId}_${today}`;
    const hasShared = localStorage.getItem(shareKey);
    
    if (hasShared) {
      return {
        success: false,
        message: 'Already shared today',
        alreadyShared: true
      };
    }

    // Marquer comme partagé
    localStorage.setItem(shareKey, 'true');

    // Si pas de db, utiliser localStorage seulement
    if (!db) {
      return {
        success: true,
        bonusXP: SHARING_CONFIG.BONUS_XP,
        message: `+${SHARING_CONFIG.BONUS_XP} XP bonus earned!`,
        localOnly: true
      };
    }

    // Mettre à jour Firebase
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      points: increment(SHARING_CONFIG.BONUS_XP),
      totalXP: increment(SHARING_CONFIG.BONUS_XP),
      sharesCount: increment(1),
      lastShareDate: new Date().toISOString()
    });

    return {
      success: true,
      bonusXP: SHARING_CONFIG.BONUS_XP,
      message: `+${SHARING_CONFIG.BONUS_XP} XP bonus earned!`
    };

  } catch (error) {
    console.error('Error awarding bonus:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Mettre à jour les stats de plateforme
const updatePlatformStats = (platform) => {
  const statsKey = 'financequest_platform_stats';
  const stats = JSON.parse(localStorage.getItem(statsKey) || '{}');
  
  if (!stats[platform]) {
    stats[platform] = { count: 0, lastShare: null };
  }
  
  stats[platform].count += 1;
  stats[platform].lastShare = new Date().toISOString();
  
  localStorage.setItem(statsKey, JSON.stringify(stats));
};

// Obtenir les statistiques
export const getShareStats = () => {
  const stats = localStorage.getItem('financequest_share_stats');
  return stats ? JSON.parse(stats) : {
    totalShares: 0,
    shareStreak: 0,
    lastShareDate: null,
    totalBonusXP: 0
  };
};

// Générer le texte de partage (alias pour compatibilité)
export const generateShareText = generateShareMessage;

// Export par défaut
export default {
  SHARING_CONFIG,
  ACHIEVEMENT_CONFIG,
  generateShareMessage,
  captureAchievementCard,
  generateAchievementImage,
  shareAchievementWithImage,
  recordAchievementShare,
  awardShareBonus,
  getShareStats,
  generateShareText,
  updatePlatformStats
};