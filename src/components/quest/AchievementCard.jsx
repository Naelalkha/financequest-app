import React from 'react';

const AchievementCard = ({ 
  quest = {}, 
  userData = {}, 
  score = 100, 
  language = 'en', 
  bonusAwarded = false 
}) => {
  // Récupération des données
  const questTitle = language === 'fr' ? (quest.titleFR || quest.title) : (quest.titleEN || quest.title);
  const displayScore = score || 100;
  const scoreColor = displayScore >= 80 ? '#10b981' : displayScore >= 60 ? '#f59e0b' : '#ef4444';
  const xpAmount = (quest.xp || 50) + (bonusAwarded ? 10 : 0);
  const userName = userData?.displayName || userData?.name || '';
  const hasUserName = userName && userName.length > 0;

  return (
    <div 
      style={{
        width: '400px',
        height: '711px', // Ratio 9:16 pour format smartphone
        backgroundColor: '#0f172a',
        borderRadius: '0',
        padding: '0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Background gradient */}
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        pointerEvents: 'none'
      }} />

      {/* Decorative circle */}
      <div style={{ 
        position: 'absolute',
        top: '-150px',
        right: '-150px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {/* Header compact - ESPACE RÉDUIT */}
      <div style={{
        padding: '24px 32px 24px', // Réduit de 40px à 24px en haut
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ 
          fontSize: '16px',
          fontWeight: '600',
          color: '#94a3b8',
          marginBottom: hasUserName ? '8px' : '20px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}>
          FinanceQuest
        </div>
        
        {/* User info - Only show if userName exists */}
        {hasUserName ? (
          <div style={{
            marginBottom: '20px' // Réduit de 24px
          }}>
            <div style={{ 
              fontSize: '24px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '4px'
            }}>
              {userName}
            </div>
            <div style={{ 
              fontSize: '14px',
              color: '#64748b'
            }}>
              {language === 'fr' ? 'vient de terminer' : 'just completed'}
            </div>
          </div>
        ) : (
          <div style={{
            marginBottom: '20px'
          }}>
            <div style={{ 
              fontSize: '14px',
              fontWeight: '500',
              color: '#94a3b8',
              marginBottom: '6px'
            }}>
              {language === 'fr' ? 'J\'ai complété une quête' : 'I completed a quest'}
            </div>
            <div style={{ 
              fontSize: '16px',
              fontWeight: '600',
              color: '#e2e8f0',
              lineHeight: '1.3'
            }}>
              {language === 'fr' ? 'en apprenant à mieux gérer mes finances 💰' : 'while learning to manage my money better 💰'}
            </div>
          </div>
        )}

        {/* Trophy */}
        <div style={{ 
          fontSize: '72px',
          marginBottom: '16px',
          filter: 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.3))'
        }}>
          🏆
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        padding: '0 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Quest card */}
        <div style={{ 
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '20px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: '20px',
            fontWeight: '600',
            color: '#fbbf24',
            margin: '0 0 16px 0',
            lineHeight: '1.3'
          }}>
            {questTitle || 'Finance Quest'}
          </h3>
          
          {/* Score - TAILLE RÉDUITE */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <div style={{ 
              fontSize: '36px', // Réduit de 48px à 36px
              fontWeight: '800',
              color: scoreColor,
              lineHeight: '1'
            }}>
              {displayScore}%
            </div>
            <div style={{
              textAlign: 'left'
            }}>
              <div style={{ 
                fontSize: '14px',
                color: '#94a3b8',
                marginBottom: '4px'
              }}>
                {language === 'fr' ? 'Score' : 'Score'}
              </div>
              <div style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ⭐ +{xpAmount} XP
              </div>
            </div>
          </div>
        </div>

        {/* Stats minimalistes */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          {/* Streak */}
          <div style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔥</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>
              {userData?.streak || 0}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {language === 'fr' ? 'JOURS' : 'DAYS'}
            </div>
          </div>

          {/* Level */}
          <div style={{
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>💎</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#a855f7' }}>
              {userData?.level || 1}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {language === 'fr' ? 'NIVEAU' : 'LEVEL'}
            </div>
          </div>

          {/* Quests */}
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📈</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#22c55e' }}>
              {userData?.completedQuests || 0}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {language === 'fr' ? 'QUÊTES' : 'QUESTS'}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer - SIMPLIFIÉ */}
      <div style={{
        padding: '32px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Message d'encouragement seulement */}
        <div style={{ 
          fontSize: '18px',
          color: '#e2e8f0',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>🎯</span>
          {language === 'fr' 
            ? 'Rejoins-moi sur FinanceQuest !' 
            : 'Join me on FinanceQuest!'}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;