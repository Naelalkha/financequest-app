import React from 'react';

const AchievementCard = ({ 
  quest, 
  userData, 
  score = 100, 
  language = 'en',
  className = '' 
}) => {
  // Fonction pour obtenir le message de score
  const getScoreMessage = (score) => {
    if (score >= 90) return language === 'fr' ? 'Excellent !' : 'Excellent!';
    if (score >= 70) return language === 'fr' ? 'Très bien !' : 'Great job!';
    if (score >= 50) return language === 'fr' ? 'Bien joué !' : 'Good job!';
    return language === 'fr' ? 'Continuez !' : 'Keep going!';
  };

  // Fonction pour obtenir le fun fact selon la quête
  const getFunFact = (quest) => {
    const facts = {
      'budget-basics': language === 'fr' 
        ? '78% des Français vivent de salaire en salaire. Un budget peut changer cela !'
        : '78% of people live paycheck to paycheck. A budget can change that!',
      'investing-101': language === 'fr'
        ? 'Investir 100€/mois à 7% = 100,000€ en 30 ans !'
        : 'Investing $100/month at 7% = $100,000 in 30 years!',
      'debt-management': language === 'fr'
        ? 'La dette moyenne des ménages français est de 33,000€.'
        : 'Average household debt is $33,000.',
      'emergency-fund': language === 'fr'
        ? '3-6 mois de dépenses en épargne = tranquillité d\'esprit !'
        : '3-6 months of expenses saved = peace of mind!',
      'credit-score': language === 'fr'
        ? 'Un bon crédit peut vous faire économiser 100,000€ !'
        : 'Good credit can save you $100,000!'
    };
    return facts[quest.id] || (language === 'fr' ? 'La finance n\'est pas compliquée !' : 'Finance isn\'t complicated!');
  };



  return (
    <div 
      style={{ 
        width: '400px', 
        height: '600px', // Réduire la hauteur maintenant que les badges sont supprimés
        backgroundColor: '#111827',
        color: 'white',
        padding: '20px',
        borderRadius: '16px',
        border: '2px solid #f59e0b',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        background: 'linear-gradient(45deg, #f59e0b, #f97316)',
        borderRadius: '14px',
        zIndex: 0
      }}></div>

      {/* Header */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: '22px', color: '#f59e0b', marginBottom: '8px', fontWeight: 'bold' }}>
          🏆 {language === 'fr' ? 'Réussite' : 'Achievement'}
        </h1>
        <h2 style={{ fontSize: '16px', marginBottom: '4px', fontWeight: 'bold' }}>
          {quest.title}
        </h2>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          {quest.description}
        </p>
      </div>

      {/* Score Section */}
      <div style={{ 
        backgroundColor: '#374151', 
        padding: '16px', 
        borderRadius: '12px',
        textAlign: 'center',
        margin: '20px 0',
        position: 'relative',
        zIndex: 1,
        border: '1px solid #4b5563'
      }}>
        <div style={{ fontSize: '32px', color: '#f59e0b', marginBottom: '8px', fontWeight: 'bold' }}>
          {score}/100
        </div>
        <div style={{ fontSize: '14px', marginBottom: '12px', fontWeight: 'bold' }}>
          {getScoreMessage(score)}
        </div>
        <div style={{ 
          width: '100%', 
          height: '12px', 
          backgroundColor: '#4b5563',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div 
            style={{ 
              width: `${score}%`, 
              height: '100%', 
              backgroundColor: '#f59e0b',
              borderRadius: '6px',
              transition: 'width 0.5s ease'
            }}
          ></div>
        </div>
      </div>

      {/* Stats Grid - Version compacte */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '8px',
        margin: '12px 0',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ 
          backgroundColor: 'rgba(59, 130, 246, 0.1)', 
          padding: '10px', 
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #3b82f6'
        }}>
          <div style={{ fontSize: '14px', color: '#3b82f6', marginBottom: '2px' }}>⭐</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>+{quest.xp}</div>
          <div style={{ fontSize: '9px', color: '#9ca3af' }}>XP</div>
        </div>
        
        <div style={{ 
          backgroundColor: 'rgba(249, 115, 22, 0.1)', 
          padding: '10px', 
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #f97316'
        }}>
          <div style={{ fontSize: '14px', color: '#f97316', marginBottom: '2px' }}>🔥</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{userData?.currentStreak || 0}</div>
          <div style={{ fontSize: '9px', color: '#9ca3af' }}>{language === 'fr' ? 'Jours' : 'Days'}</div>
        </div>
        
        <div style={{ 
          backgroundColor: 'rgba(168, 85, 247, 0.1)', 
          padding: '10px', 
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #a855f7'
        }}>
          <div style={{ fontSize: '14px', color: '#a855f7', marginBottom: '2px' }}>💎</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{userData?.level || 'Novice'}</div>
          <div style={{ fontSize: '9px', color: '#9ca3af' }}>{language === 'fr' ? 'Niveau' : 'Level'}</div>
        </div>
        
        <div style={{ 
          backgroundColor: 'rgba(34, 197, 94, 0.1)', 
          padding: '10px', 
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #22c55e'
        }}>
          <div style={{ fontSize: '14px', color: '#22c55e', marginBottom: '2px' }}>📈</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{userData?.completedQuests || 0}</div>
          <div style={{ fontSize: '9px', color: '#9ca3af' }}>{language === 'fr' ? 'Quêtes' : 'Quests'}</div>
        </div>
      </div>



      {/* Fun Fact - Version compacte */}
      <div style={{ 
        backgroundColor: 'rgba(245, 158, 11, 0.1)', 
        padding: '12px', 
        borderRadius: '8px',
        border: '1px solid #f59e0b',
        margin: '15px 0',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold', marginBottom: '6px' }}>
          💡 {language === 'fr' ? 'Fun Fact' : 'Fun Fact'}
        </div>
        <div style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.3' }}>
          {getFunFact(quest)}
        </div>
      </div>

      {/* Footer - Version compacte */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px', color: '#f59e0b' }}>
          FinanceQuest
        </div>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>
          {language === 'fr' ? 'Maîtrisez vos finances en vous amusant !' : 'Master your finances while having fun!'}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ 
            backgroundColor: 'rgba(245, 158, 11, 0.2)', 
            color: '#f59e0b', 
            padding: '4px 8px', 
            borderRadius: '10px', 
            fontSize: '10px',
            border: '1px solid #f59e0b',
            fontWeight: 'bold'
          }}>
            #MoneyQuest
          </span>
          <span style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.2)', 
            color: '#3b82f6', 
            padding: '4px 8px', 
            borderRadius: '10px', 
            fontSize: '10px',
            border: '1px solid #3b82f6',
            fontWeight: 'bold'
          }}>
            #FinanceQuest
          </span>
          <span style={{ 
            backgroundColor: 'rgba(168, 85, 247, 0.2)', 
            color: '#a855f7', 
            padding: '4px 8px', 
            borderRadius: '10px', 
            fontSize: '10px',
            border: '1px solid #a855f7',
            fontWeight: 'bold'
          }}>
            #GenZFinance
          </span>
        </div>
      </div>


    </div>
  );
};

export default AchievementCard; 