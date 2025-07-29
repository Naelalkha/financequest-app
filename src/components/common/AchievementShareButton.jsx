import React, { useState, useRef } from 'react';
import { FaShare, FaTrophy, FaStar } from 'react-icons/fa';
import { shareAchievement, recordAchievementShare, awardShareBonus } from '../../utils/achievementSharing';
import AchievementCard from './AchievementCard';
import { toast } from 'react-toastify';

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
  const [showAchievementCard, setShowAchievementCard] = useState(false);
  const achievementCardRef = useRef(null);

  // Vérification de sécurité pour userData
  if (!userData) {
    console.warn('AchievementShareButton: userData is not provided');
    return null;
  }

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // Afficher la carte d'achievement pour génération d'image
      setShowAchievementCard(true);
      
      // Attendre que la carte soit rendue et que le DOM soit mis à jour
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Partager l'achievement
      const result = await shareAchievement(
        achievementCardRef, 
        quest, 
        userData, 
        score, 
        language
      );
      
      if (result.success) {
        // Enregistrer le partage
        recordAchievementShare(quest.id, score, result.platform);
        
        // Attribuer le bonus XP (motivation Duolingo-like)
        if (showBonus && userData?.uid) {
          const bonusResult = await awardShareBonus(userData.uid);
          if (bonusResult.success) {
            toast.success(bonusResult.message, {
              icon: '🎁',
              autoClose: 3000
            });
          }
        }
        
        // Afficher le message de succès
        toast.success(result.message, {
          icon: result.method === 'clipboard' ? '📋' : '✅',
          autoClose: 4000
        });
        
        // Callback de partage terminé
        if (onShareComplete) {
          onShareComplete(result);
        }
      } else {
        throw new Error(result.error || 'Share failed');
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
      setShowAchievementCard(false);
    }
  };

  return (
    <>
      {/* Bouton de partage principal */}
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`
          inline-flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300
          bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 
          hover:from-yellow-500 hover:to-orange-600 
          transform hover:scale-105 hover:shadow-xl
          ${isSharing ? 'opacity-50 cursor-not-allowed' : 'shadow-lg'}
          ${className}
        `}
      >
        {isSharing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
            {language === 'fr' ? 'Partage...' : 'Sharing...'}
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

      {/* Carte d'achievement cachée pour génération d'image */}
      {showAchievementCard && (
        <div 
          ref={achievementCardRef}
          className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none"
          style={{ 
            zIndex: -9999,
            width: '400px',
            height: '600px',
            position: 'absolute',
            left: '-9999px',
            top: '-9999px'
          }}
        >
          <AchievementCard
            quest={quest}
            userData={userData}
            score={score}
            language={language}
          />
        </div>
      )}
      
      {/* Debug: Afficher la carte temporairement pour test */}
      {process.env.NODE_ENV === 'development' && showAchievementCard && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            background: 'white',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ fontSize: '12px', color: 'black' }}>
            Debug: Achievement Card Rendered
          </div>
        </div>
      )}
    </>
  );
};

export default AchievementShareButton; 