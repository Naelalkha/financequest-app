import React from 'react';

// Fun facts en fonction du type de quête
const getFunFact = (quest) => {
  const funFacts = {
    en: {
      budgeting: [
        "The 50/30/20 rule was invented by Elizabeth Warren!",
        "Only 32% of Americans maintain a household budget.",
        "Apps users save 20% more than non-users."
      ],
      saving: [
        "Compound interest was called the 8th wonder by Einstein!",
        "Saving $5/day = $1,825/year!",
        "Millennials save 10% of income on average."
      ],
      investing: [
        "Warren Buffett bought his first stock at age 11!",
        "$1 invested in 1900 = $20,000+ today!",
        "Index funds beat 90% of active managers."
      ],
      debt: [
        "Average US household has $6,194 in credit card debt.",
        "Paying minimums = 30 years to clear debt!",
        "Debt snowball works for 70% of people."
      ],
      credit: [
        "Your credit score can save you $100,000+ lifetime!",
        "35% of score = payment history.",
        "Check your credit report free yearly!"
      ],
      planning: [
        "People with written goals are 42% more likely to achieve them!",
        "Only 30% of Americans have long-term financial plans.",
        "Financial planning can increase net worth by 250%!"
      ]
    },
    fr: {
      budgeting: [
        "La règle 50/30/20 a été inventée par Elizabeth Warren !",
        "Seulement 32% des Américains tiennent un budget.",
        "Les utilisateurs d'apps économisent 20% de plus !"
      ],
      saving: [
        "Einstein appelait les intérêts composés la 8e merveille !",
        "Économiser 5€/jour = 1 825€/an !",
        "Les millennials épargnent 10% en moyenne."
      ],
      investing: [
        "Warren Buffett a acheté sa 1ère action à 11 ans !",
        "1$ investi en 1900 = 20 000$+ aujourd'hui !",
        "Les fonds indiciels battent 90% des gestionnaires."
      ],
      debt: [
        "La dette moyenne par carte de crédit US : 6 194$ !",
        "Payer le minimum = 30 ans pour rembourser !",
        "La boule de neige fonctionne pour 70% des gens."
      ],
      credit: [
        "Votre score peut vous économiser 100 000€+ !",
        "35% du score = historique de paiement.",
        "Vérifiez votre crédit gratuitement chaque année !"
      ],
      planning: [
        "Les objectifs écrits : 42% plus de chances de réussir !",
        "Seulement 30% ont un plan financier long terme.",
        "La planification peut augmenter le patrimoine de 250% !"
      ]
    }
  };
  
  const category = quest.category || 'budgeting';
  const language = quest.language || 'en';
  const facts = funFacts[language]?.[category] || funFacts.en.budgeting;
  return facts[Math.floor(Math.random() * facts.length)];
};

const AchievementCard = ({ quest = {}, userData = {}, score = 100, language = 'en', bonusAwarded = false }) => {
  // Assurer que le titre est correct selon la langue
  const questTitle = language === 'fr' ? (quest.titleFR || quest.title) : (quest.titleEN || quest.title);
  
  // S'assurer que le score est bien un nombre et non 0 par défaut
  const displayScore = score || 100;
  
  return (
    <div 
      style={{
        width: '400px',
        height: '600px',
        backgroundColor: '#111827',
        borderRadius: '20px',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Background decoration */}
      <div style={{ 
        position: 'absolute', 
        top: '-100px', 
        right: '-100px', 
        width: '300px', 
        height: '300px', 
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)', 
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      {/* Header - Sans rectangle orange */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '800', 
          marginBottom: '4px',
          color: '#f59e0b',
          margin: 0
        }}>
          {language === 'fr' ? 'Quête Terminée !' : 'Quest Complete!'}
        </h2>
      </div>

      {/* Quest info */}
      <div style={{ 
        backgroundColor: 'rgba(31, 41, 55, 0.8)', 
        padding: '16px', 
        borderRadius: '12px',
        border: '1px solid #374151',
        position: 'relative',
        zIndex: 1
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#fbbf24', margin: 0 }}>
          {questTitle || 'Finance Quest'}
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '700',
              color: displayScore >= 80 ? '#10b981' : displayScore >= 60 ? '#f59e0b' : '#ef4444'
            }}>
              {displayScore}%
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>
              {language === 'fr' ? 'Complété' : 'Completed'}
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(245, 158, 11, 0.2)', 
            padding: '6px 12px', 
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: '1px solid #f59e0b'
          }}>
            <span style={{ fontSize: '16px' }}>⭐</span>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>
              +{(quest.xp || 50) + (bonusAwarded ? 10 : 0)} XP
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid - Design amélioré */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '12px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Streak */}
        <div style={{ 
          backgroundColor: 'rgba(245, 158, 11, 0.1)', 
          borderRadius: '12px',
          border: '1px solid #f59e0b',
          height: '80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 8px',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            fontSize: '24px', 
            color: '#f59e0b',
            marginBottom: '6px',
            lineHeight: '1'
          }}>🔥</div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#ffffff',
            marginBottom: '4px',
            lineHeight: '1'
          }}>{userData?.streak || 0}</div>
          <div style={{ 
            fontSize: '10px', 
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            lineHeight: '1'
          }}>{language === 'fr' ? 'Jours' : 'Days'}</div>
        </div>
        
        {/* Level */}
        <div style={{ 
          backgroundColor: 'rgba(168, 85, 247, 0.1)', 
          borderRadius: '12px',
          border: '1px solid #a855f7',
          height: '80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 8px',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            fontSize: '24px', 
            color: '#a855f7',
            marginBottom: '6px',
            lineHeight: '1'
          }}>💎</div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            color: '#ffffff',
            marginBottom: '4px',
            lineHeight: '1'
          }}>{userData?.level || 'Novice'}</div>
          <div style={{ 
            fontSize: '10px', 
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            lineHeight: '1'
          }}>{language === 'fr' ? 'Niveau' : 'Level'}</div>
        </div>
        
        {/* Quests */}
        <div style={{ 
          backgroundColor: 'rgba(34, 197, 94, 0.1)', 
          borderRadius: '12px',
          border: '1px solid #22c55e',
          height: '80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 8px',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            fontSize: '24px', 
            color: '#22c55e',
            marginBottom: '6px',
            lineHeight: '1'
          }}>📈</div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#ffffff',
            marginBottom: '4px',
            lineHeight: '1'
          }}>{userData?.completedQuests || 0}</div>
          <div style={{ 
            fontSize: '10px', 
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            lineHeight: '1'
          }}>{language === 'fr' ? 'Quêtes' : 'Quests'}</div>
        </div>
      </div>

      {/* Fun Fact - Design amélioré */}
      <div style={{ 
        backgroundColor: 'rgba(245, 158, 11, 0.1)', 
        padding: '20px 16px', 
        borderRadius: '12px',
        border: '1px solid #f59e0b',
        position: 'relative',
        zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        minHeight: '120px'
      }}>
        <div style={{ 
          fontSize: '16px', 
          color: '#f59e0b', 
          fontWeight: '700', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>💡</span>
          <span>{language === 'fr' ? 'Le Saviez-Vous ?' : 'Fun Fact'}</span>
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: '#e5e7eb', 
          lineHeight: '1.5',
          maxWidth: '320px'
        }}>
          {getFunFact(quest)}
        </div>
      </div>

      {/* Footer avec hashtags centrés */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, marginTop: 'auto' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#f59e0b' }}>
          FinanceQuest
        </div>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
          {language === 'fr' ? 'Maîtrisez vos finances en vous amusant !' : 'Master your finances while having fun!'}
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '8px', 
          flexWrap: 'wrap' 
        }}>
          <span style={{ 
            backgroundColor: 'rgba(245, 158, 11, 0.2)', 
            color: '#f59e0b', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            fontSize: '11px',
            border: '1px solid #f59e0b',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            #MoneyQuest
          </span>
          <span style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.2)', 
            color: '#3b82f6', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            fontSize: '11px',
            border: '1px solid #3b82f6',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            #FinanceQuest
          </span>
          <span style={{ 
            backgroundColor: 'rgba(168, 85, 247, 0.2)', 
            color: '#a855f7', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            fontSize: '11px',
            border: '1px solid #a855f7',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            #GenZFinance
          </span>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;