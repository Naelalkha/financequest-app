import React, { useState, useRef, useEffect } from 'react';
import { FaShare, FaTrophy, FaStar } from 'react-icons/fa';
import { shareAchievementWithImage, recordAchievementShare, awardShareBonus, generateShareMessage } from '../../utils/achievementSharing';
import AchievementCard from './AchievementCard';
import { toast } from 'react-toastify';
import { db } from '../../services/firebase';

const AchievementShareButton = ({ 
  quest, 
  userData, 
  score = 100, 
  language = 'en',
  className = '',
  onShareComplete = null,
  showBonus = true
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);
  const [imageBlob, setImageBlob] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const achievementCardRef = useRef(null);

  // Vérification de sécurité pour userData
  if (!userData) {
    console.warn('AchievementShareButton: userData is not provided');
    return null;
  }

  // S'assurer que le score est valide
  const validScore = score && score > 0 ? score : 100;
  console.log('AchievementShareButton - Score:', validScore);

  // Pré-générer l'image au montage du composant
  useEffect(() => {
    const preGenerateImage = async () => {
      if (!achievementCardRef.current || imageGenerated) return;

      try {
        // Attendre plus longtemps pour que le contenu soit complètement rendu
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Importer html2canvas dynamiquement
        const html2canvas = (await import('html2canvas')).default;
        
        // S'assurer que l'élément est visible temporairement pour la capture
        const element = achievementCardRef.current;
        const originalStyles = {
          left: element.style.left,
          visibility: element.style.visibility
        };
        
        // Rendre temporairement visible mais hors écran
        element.style.left = '-9999px';
        element.style.visibility = 'visible';
        
        // Capturer l'image avec des options optimisées
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#111827',
          logging: true,
          width: 400,
          height: 711,
          windowWidth: 400,
          windowHeight: 711,
          foreignObjectRendering: false,
          imageTimeout: 0
        });

        // Restaurer les styles originaux
        element.style.left = originalStyles.left;
        element.style.visibility = originalStyles.visibility;

        // Convertir en blob
        const blob = await new Promise(resolve => 
          canvas.toBlob(resolve, 'image/png', 0.95)
        );

        const dataUrl = canvas.toDataURL('image/png', 0.95);

        setImageBlob(blob);
        setImageDataUrl(dataUrl);
        setImageGenerated(true);
        console.log('Achievement image pre-generated successfully with score:', validScore);
      } catch (error) {
        console.error('Error pre-generating image:', error);
      }
    };

    // Attendre un cycle de rendu avant de commencer
    const timer = setTimeout(preGenerateImage, 100);
    return () => clearTimeout(timer);
  }, [imageGenerated, quest, userData, validScore, language]);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      const shareMessage = generateShareMessage(quest, validScore, language, 'twitter');
      const shareUrl = 'https://financequest-app.vercel.app';
      
      // Stratégie de partage optimisée
      let shareResult = null;

      // 1. Si on a une image pré-générée et que le navigateur supporte le partage avec fichiers
      if (imageBlob && navigator.share && navigator.canShare) {
        try {
          const file = new File([imageBlob], 'achievement.png', {
            type: 'image/png',
            lastModified: Date.now()
          });
          
          const shareDataWithImage = {
            files: [file],
            title: language === 'fr' ? 'Ma réussite FinanceQuest !' : 'My FinanceQuest Achievement!',
            text: shareMessage
          };
          
          // Vérifier si on peut partager avec des fichiers
          if (navigator.canShare(shareDataWithImage)) {
            console.log('Sharing with image...');
            await navigator.share(shareDataWithImage);
            shareResult = { success: true, method: 'native-with-image', platform: 'native' };
          }
        } catch (error) {
          console.log('Share with image failed:', error);
        }
      }

      // 2. Si le partage avec image a échoué, essayer sans image
      if (!shareResult && navigator.share) {
        try {
          const shareDataTextOnly = {
            title: language === 'fr' ? 'Ma réussite FinanceQuest !' : 'My FinanceQuest Achievement!',
            text: shareMessage,
            url: shareUrl
          };
          
          console.log('Sharing text only...');
          await navigator.share(shareDataTextOnly);
          shareResult = { success: true, method: 'native-text', platform: 'native' };
        } catch (error) {
          console.log('Share text failed:', error);
        }
      }

      // 3. Fallback : Copier dans le presse-papier + sauvegarder l'image
      if (!shareResult) {
        const clipboardText = `${shareMessage}\n\n${shareUrl}`;
        await navigator.clipboard.writeText(clipboardText);
        
        // Sauvegarder l'image pour un usage ultérieur
        if (imageDataUrl) {
          localStorage.setItem('financequest_last_achievement', JSON.stringify({
            image: imageDataUrl,
            message: shareMessage,
            timestamp: new Date().toISOString()
          }));
        }
        
        shareResult = {
          success: true,
          method: 'clipboard',
          platform: 'clipboard',
          message: language === 'fr' 
            ? 'Lien copié ! Collez-le sur votre réseau social préféré 📋' 
            : 'Link copied! Paste it on your favorite social network 📋'
        };
      }

      // Enregistrer le partage
      if (shareResult.success) {
        await recordAchievementShare({
          userId: userData?.uid,
          questId: quest?.id,
          platform: shareResult.platform,
          score: validScore,
          language,
          db
        });
        
        // Attribuer le bonus XP
        if (showBonus && userData?.uid) {
          const bonusResult = await awardShareBonus(userData.uid, db);
          if (bonusResult.success) {
            toast.success(bonusResult.message, {
              icon: '🎁',
              autoClose: 3000
            });
          }
        }
        
        // Message de succès
        toast.success(
          shareResult.message || (language === 'fr' ? 'Partagé avec succès !' : 'Shared successfully!'),
          { icon: shareResult.method === 'clipboard' ? '📋' : '✅' }
        );
        
        if (onShareComplete) {
          onShareComplete(shareResult);
        }
      }
      
    } catch (error) {
      console.error('Achievement share error:', error);
      toast.error(
        language === 'fr' 
          ? 'Erreur de partage. Réessayez !' 
          : 'Share failed. Please try again!',
        { icon: '❌' }
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      {/* Bouton de partage principal */}
      <button
        onClick={handleShare}
        disabled={isSharing || !imageGenerated}
        className={`
          inline-flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300
          bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 
          hover:from-yellow-500 hover:to-orange-600 
          transform hover:scale-105 hover:shadow-xl
          ${isSharing || !imageGenerated ? 'opacity-50 cursor-not-allowed' : 'shadow-lg'}
          ${className}
        `}
      >
        {isSharing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
            {language === 'fr' ? 'Partage...' : 'Sharing...'}
          </>
        ) : !imageGenerated ? (
          <>
            <div className="animate-pulse h-5 w-5 bg-gray-900 rounded-full"></div>
            {language === 'fr' ? 'Préparation...' : 'Preparing...'}
          </>
        ) : (
          <>
            <FaShare className="text-lg" />
            <span className="text-lg">
              {language === 'fr' ? 'Partager votre Achievement' : 'Share your Achievement'}
            </span>
            {showBonus && (
              <div className="flex items-center gap-1 bg-white/30 px-3 py-1 rounded-full text-sm border border-white/20">
                <FaStar className="text-yellow-400" />
                <span className="text-yellow-400 font-bold">+10 XP</span>
              </div>
            )}
          </>
        )}
      </button>

      {/* Carte d'achievement toujours rendue mais cachée */}
      <div 
        ref={achievementCardRef}
        style={{ 
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: '400px',
          height: '711px',
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 1
        }}
      >
        <AchievementCard
          quest={quest}
          userData={userData}
          score={validScore}
          language={language}
          bonusAwarded={false}
        />
      </div>

      {/* Aperçu de l'image en dev mode */}
      {process.env.NODE_ENV === 'development' && imageDataUrl && false && (
        <div 
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '100px',
            height: '150px',
            background: `url(${imageDataUrl}) center/cover`,
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: 1000
          }}
          title="Generated achievement image"
        />
      )}
    </>
  );
};

// Alternative : Bouton de partage avec menu d'options
export const AchievementShareMenu = ({ quest, userData, score, language, onShareComplete }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const shareOptions = [
    {
      name: 'Twitter',
      icon: '🐦',
      action: async () => {
        const message = generateShareMessage(quest, score, language, 'twitter');
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent('https://financequest-app.vercel.app')}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Facebook',
      icon: '📘',
      action: async () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://financequest-app.vercel.app')}`;
        window.open(url, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      action: async () => {
        const message = generateShareMessage(quest, score, language, 'whatsapp');
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: language === 'fr' ? 'Copier le lien' : 'Copy Link',
      icon: '📋',
      action: async () => {
        const message = generateShareMessage(quest, score, language, 'twitter');
        await navigator.clipboard.writeText(`${message}\n\nhttps://financequest-app.vercel.app`);
        toast.success(language === 'fr' ? 'Lien copié !' : 'Link copied!');
      }
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="inline-flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 hover:shadow-xl shadow-lg"
      >
        <FaShare className="text-lg" />
        <span className="text-lg">
          {language === 'fr' ? 'Partager' : 'Share'}
        </span>
      </button>

      {showMenu && (
        <div className="absolute top-full mt-2 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-2 min-w-[200px] z-50">
          {shareOptions.map((option, index) => (
            <button
              key={index}
              onClick={async () => {
                await option.action();
                setShowMenu(false);
                if (onShareComplete) {
                  onShareComplete({ success: true, platform: option.name });
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 rounded-lg transition-colors text-left"
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="text-white">{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Export par défaut
export default AchievementShareButton;