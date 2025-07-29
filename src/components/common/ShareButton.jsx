import React, { useState } from 'react';
import { FaShare, FaTiktok, FaTwitter, FaFacebook, FaLinkedin, FaCopy } from 'react-icons/fa';
import { shareToTikTok, shareToTwitter, shareToFacebook, shareToLinkedIn, recordShare } from '../../utils/socialSharing';
import { toast } from 'react-toastify';

const ShareButton = ({ 
  shareType, 
  data, 
  language = 'en', 
  className = '', 
  showPlatforms = true,
  autoShare = false,
  onShareComplete = null 
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);

  const handleShare = async (platform) => {
    try {
      setIsSharing(true);
      setShowPlatformMenu(false);

      let result;
      switch (platform) {
        case 'tiktok':
          result = await shareToTikTok(shareType, data, language);
          break;
        case 'twitter':
          result = await shareToTwitter(shareType, data, language);
          break;
        case 'facebook':
          result = await shareToFacebook(shareType, data, language);
          break;
        case 'linkedin':
          result = await shareToLinkedIn(shareType, data, language);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      if (result.success) {
        // Enregistrer le partage
        recordShare(platform, shareType);
        
        // Afficher le message de succès
        if (result.method === 'clipboard') {
          toast.success(result.message || 'Content copied to clipboard!', {
            icon: '📋',
            autoClose: 3000
          });
        } else {
          toast.success('Shared successfully!', {
            icon: '✅',
            autoClose: 2000
          });
        }

        // Callback de partage terminé
        if (onShareComplete) {
          onShareComplete(result);
        }
      } else {
        throw new Error(result.error || 'Share failed');
      }

    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share. Please try again.', {
        icon: '❌'
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleAutoShare = async () => {
    if (autoShare) {
      await handleShare('tiktok');
    } else {
      setShowPlatformMenu(!showPlatformMenu);
    }
  };

  const platforms = [
    { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: 'text-black bg-white hover:bg-gray-100' },
    { id: 'twitter', name: 'Twitter', icon: FaTwitter, color: 'text-white bg-blue-400 hover:bg-blue-500' },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'text-white bg-blue-600 hover:bg-blue-700' },
    { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: 'text-white bg-blue-700 hover:bg-blue-800' }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal */}
      <button
        onClick={handleAutoShare}
        disabled={isSharing}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
          ${autoShare 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' 
            : 'bg-gray-700 text-white hover:bg-gray-600'
          }
          ${isSharing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          shadow-lg hover:shadow-xl
        `}
      >
        {isSharing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Sharing...
          </>
        ) : (
          <>
            <FaShare className="text-sm" />
            {autoShare ? 'Share on TikTok' : 'Share'}
          </>
        )}
      </button>

      {/* Menu des plateformes */}
      {showPlatformMenu && showPlatforms && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-2 z-50 min-w-[200px]">
          <div className="text-xs text-gray-400 mb-2 px-2">Share on:</div>
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handleShare(platform.id)}
              disabled={isSharing}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${platform.color}
                ${isSharing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `}
            >
              <platform.icon className="text-lg" />
              {platform.name}
            </button>
          ))}
          
          {/* Bouton copier le lien */}
          <button
            onClick={() => {
              const url = 'https://financequest-app.vercel.app';
              navigator.clipboard.writeText(url);
              toast.success('Link copied to clipboard!', { icon: '📋' });
              setShowPlatformMenu(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 bg-gray-600 text-white hover:bg-gray-500 hover:scale-105 mt-1"
          >
            <FaCopy className="text-lg" />
            Copy Link
          </button>
        </div>
      )}

      {/* Overlay pour fermer le menu */}
      {showPlatformMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowPlatformMenu(false)}
        />
      )}
    </div>
  );
};

export default ShareButton; 