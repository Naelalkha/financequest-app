import React, { useState, useRef, useEffect } from 'react';
import { Twitter, Facebook, MessageCircle, Share2, Copy, CheckCircle, Gift, Sparkles } from 'lucide-react';
import { generateAchievementImage, awardShareBonus } from '../utils/achievementSharing';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase-config'; // Assurez-vous d'importer votre config Firebase
import AchievementCard from './common/AchievementCard';
import translations from '../data/lang.json';

const QuestCompletion = ({ quest, score, userData, onNext, onBack, language = 'en' }) => {
  const [shared, setShared] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [bonusAwarded, setBonusAwarded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const achievementCardRef = useRef(null);
  const t = translations[language];

  // Calculer les points gagnés
  const baseXP = quest.xp || 50;
  const scoreMultiplier = score / 100;
  const earnedXP = Math.round(baseXP * scoreMultiplier);
  const totalXP = earnedXP + (bonusAwarded ? 10 : 0);

  // Fonction pour gérer le partage et attribuer le bonus
  const handleShare = async (platform) => {
    setShareLoading(true);
    
    try {
      // Construire le texte de partage
      const shareText = language === 'fr' 
        ? `Je viens de terminer la quête "${quest.titleFR}" sur FinanceQuest avec ${score}% de réussite ! 🎯`
        : `Just completed the "${quest.titleEN}" quest on FinanceQuest with ${score}% score! 🎯`;
      
      const shareUrl = 'https://financequest-app.vercel.app';
      
      let url = '';
      switch(platform) {
        case 'twitter':
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=FinanceQuest,MoneyQuest,GenZFinance`;
          break;
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
          break;
        case 'whatsapp':
          const whatsappText = `${shareText}\n\n${shareUrl}`;
          url = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
          break;
        case 'copy':
          const copyText = `${shareText}\n${shareUrl}`;
          await navigator.clipboard.writeText(copyText);
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 3000);
          break;
      }
      
      if (url) {
        window.open(url, '_blank', 'width=600,height=400');
      }
      
      // Attribuer le bonus XP si pas déjà fait
      if (!bonusAwarded && userData?.uid) {
        try {
          // Vérifier si l'utilisateur a déjà partagé aujourd'hui
          const today = new Date().toISOString().split('T')[0];
          const shareKey = `share_${userData.uid}_${today}`;
          const hasSharedToday = localStorage.getItem(shareKey);
          
          if (!hasSharedToday) {
            // Marquer comme partagé aujourd'hui
            localStorage.setItem(shareKey, 'true');
            
            // Mettre à jour Firebase
            await updateDoc(doc(db, 'users', userData.uid), {
              points: increment(10),
              totalXP: increment(10),
              sharesCount: increment(1),
              lastShareDate: new Date().toISOString()
            });
            
            setBonusAwarded(true);
            setShowShareSuccess(true);
            
            setTimeout(() => setShowShareSuccess(false), 4000);
          }
        } catch (error) {
          console.error('Error awarding bonus:', error);
        }
      }
      
      setShared(true);
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Notification de bonus avec animation améliorée */}
        {showShareSuccess && (
          <div className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in z-50 border border-green-400">
            <Gift className="w-6 h-6 animate-bounce" />
            <div>
              <div className="font-bold">+10 XP Bonus!</div>
              <div className="text-sm opacity-90">Thanks for sharing!</div>
            </div>
          </div>
        )}

        {/* Carte de completion principale */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* Header avec animation */}
          <div className="text-center mb-8 animate-bounce-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {t.quest.questComplete}
            </h1>
            <p className="text-gray-300">{t.quest.quest_complete_msg}</p>
          </div>

          {/* Points gagnés avec effet */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 mb-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 mb-1">{t.quest.earnedPoints}</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-yellow-400">+{totalXP} XP</span>
                  {bonusAwarded && (
                    <span className="text-sm text-green-400 animate-pulse flex items-center gap-1">
                      <Gift className="w-4 h-4" />
                      includes +10 bonus!
                    </span>
                  )}
                </div>
              </div>
              <Sparkles className="w-12 h-12 text-yellow-400 animate-spin-slow" />
            </div>
          </div>

          {/* Carte d'achievement cachée pour la capture */}
          <div 
            ref={achievementCardRef}
            style={{ 
              position: 'absolute', 
              left: '-9999px',
              top: '-9999px',
              opacity: 0
            }}
          >
            <AchievementCard 
              quest={quest} 
              userData={userData} 
              score={score} 
              language={language}
              bonusAwarded={bonusAwarded}
            />
          </div>

          {/* Section de partage améliorée */}
          <div className="bg-gray-700/50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                {t.quest.shareWin}
              </h3>
              {!bonusAwarded && (
                <span className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                  <Gift className="w-4 h-4" />
                  {t.quest.shareBonus}
                </span>
              )}
              {bonusAwarded && (
                <span className="text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-full flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Bonus earned!
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleShare('twitter')}
                disabled={shareLoading}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
              >
                <Twitter className="w-5 h-5" />
                <span className="hidden md:inline">Twitter</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                disabled={shareLoading}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
              >
                <Facebook className="w-5 h-5" />
                <span className="hidden md:inline">Facebook</span>
              </button>

              <button
                onClick={() => handleShare('whatsapp')}
                disabled={shareLoading}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="hidden md:inline">WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('copy')}
                disabled={shareLoading}
                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="hidden md:inline text-green-400">{t.quest.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span className="hidden md:inline">Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Message de succès après partage */}
            {shared && !showShareSuccess && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                <p className="text-green-400 text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Thanks for sharing! Keep spreading financial literacy! 🎉
                </p>
              </div>
            )}
          </div>

          {/* Stats de progression */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xl font-bold">{userData?.streak || 0}</div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">💎</div>
              <div className="text-xl font-bold">{userData?.level || 'Novice'}</div>
              <div className="text-xs text-gray-400">Level</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-xl font-bold">{(userData?.completedQuests || 0) + 1}</div>
              <div className="text-xs text-gray-400">Quests Done</div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all"
            >
              {t.quest.backToDashboard}
            </button>
            <button
              onClick={onNext}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              {t.quest.nextQuest}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestCompletion;