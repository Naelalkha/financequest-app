import { FaChartLine, FaLightbulb, FaCheckCircle } from 'react-icons/fa';

export const investingBasics = {
  id: 'investing-basics',
  category: 'investing',
  difficulty: 'beginner',
  duration: 40,
  xp: 175,
  isPremium: false,
  order: 6,
  
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['investing', 'beginner-friendly', 'foundation'],
    relatedQuests: ['emergency-fund-101', 'crypto-intro', 'real-estate-basics'],
    averageCompletionTime: 22,
    completionRate: 0.80,
    userRating: 4.5,
    featured: true
  },

  icons: {
    main: FaChartLine,
    steps: [FaLightbulb, FaCheckCircle]
  },
  
  colors: {
    primary: '#7C3AED',
    secondary: '#A78BFA',
    accent: '#F59E0B'
  },

  content: {
    en: {
      title: 'Investing Basics',
      description: 'Learn the fundamentals of investing and start building wealth',
      longDescription: 'Master the basics of investing including different investment types, risk management, and how to get started with your first investments.',
      objectives: [
        'Understand what investing is',
        'Learn about different investment types',
        'Understand risk and return',
        'Start your first investment'
      ],
      prerequisites: ['Emergency fund established', 'Basic budgeting knowledge'],
      whatYouWillLearn: [
        'How the stock market works',
        'Different types of investments',
        'Risk management strategies',
        'How to start investing with little money'
      ],
      realWorldApplication: 'You\'ll understand how to start investing and have a plan to begin building wealth through investments.'
    },
    fr: {
      title: 'Bases de l\'Investissement',
      description: 'Apprenez les fondamentaux de l\'investissement et commencez à construire votre richesse',
      longDescription: 'Maîtrisez les bases de l\'investissement incluant différents types d\'investissements, la gestion des risques et comment commencer vos premiers investissements.',
      objectives: [
        'Comprendre ce qu\'est l\'investissement',
        'Apprendre sur différents types d\'investissements',
        'Comprendre le risque et le rendement',
        'Commencer votre premier investissement'
      ],
      prerequisites: ['Fonds d\'urgence établi', 'Connaissance de base du budget'],
      whatYouWillLearn: [
        'Comment fonctionne le marché boursier',
        'Différents types d\'investissements',
        'Stratégies de gestion des risques',
        'Comment commencer à investir avec peu d\'argent'
      ],
      realWorldApplication: 'Vous comprendrez comment commencer à investir et aurez un plan pour commencer à construire votre richesse grâce aux investissements.'
    }
  },

  rewards: {
    badge: {
      id: 'investing_basics_badge',
      name: { en: 'Investing Beginner', fr: 'Débutant Investissement' },
      description: {
        en: 'You\'ve taken your first step into the world of investing!',
        fr: 'Vous avez fait votre premier pas dans le monde de l\'investissement !'
      },
      rarity: 'common',
      imageUrl: '/badges/investing-basics.png'
    },
    unlocks: ['crypto-intro', 'real-estate-basics'],
    bonusXP: {
      firstTime: 50,
      speedBonus: 25,
      perfectScore: 30
    }
  },

  steps: [
    {
      id: 'investing-intro',
      type: 'info',
      title: { en: 'What is Investing?', fr: 'Qu\'est-ce que l\'Investissement ?' },
      content: {
        en: {
          text: 'Investing is putting your money to work to generate returns over time.',
          funFact: 'The average annual return of the S&P 500 over the past 90 years is about 10%!'
        },
        fr: {
          text: 'L\'investissement consiste à faire travailler votre argent pour générer des rendements au fil du temps.',
          funFact: 'Le rendement annuel moyen du S&P 500 sur les 90 dernières années est d\'environ 10% !'
        }
      },
      xp: 15
    },
    {
      id: 'risk-return',
      type: 'multiple_choice',
      title: { en: 'Risk vs Return', fr: 'Risque vs Rendement' },
      question: { 
        en: 'What is the relationship between risk and potential return in investing?', 
        fr: 'Quelle est la relation entre le risque et le rendement potentiel en investissement ?' 
      },
      options: {
        en: [
          'Higher risk = guaranteed higher returns',
          'Higher risk = potential for higher returns',
          'Lower risk = higher returns',
          'Risk and return are unrelated'
        ],
        fr: [
          'Risque élevé = rendements élevés garantis',
          'Risque élevé = potentiel de rendements élevés',
          'Risque faible = rendements élevés',
          'Risque et rendement ne sont pas liés'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Higher risk investments offer the potential for higher returns, but also the potential for greater losses.',
        fr: 'Les investissements à risque élevé offrent le potentiel de rendements élevés, mais aussi le potentiel de pertes plus importantes.'
      },
      hint: {
        en: 'Think about the trade-off between safety and potential rewards...',
        fr: 'Pensez au compromis entre sécurité et récompenses potentielles...'
      },
      xp: 20
    },
    {
      id: 'investment-types',
      type: 'multiple_choice',
      title: { en: 'Types of Investments', fr: 'Types d\'Investissements' },
      question: { 
        en: 'Which investment type is generally considered the most diversified for beginners?', 
        fr: 'Quel type d\'investissement est généralement considéré comme le plus diversifié pour les débutants ?' 
      },
      options: {
        en: [
          'Individual stocks',
          'Index funds or ETFs',
          'Cryptocurrency',
          'Real estate'
        ],
        fr: [
          'Actions individuelles',
          'Fonds indiciels ou ETF',
          'Cryptomonnaie',
          'Immobilier'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Index funds and ETFs provide instant diversification by holding hundreds or thousands of stocks in one investment.',
        fr: 'Les fonds indiciels et ETF offrent une diversification instantanée en détenant des centaines ou milliers d\'actions en un seul investissement.'
      },
      hint: {
        en: 'Think about which option spreads risk across many companies...',
        fr: 'Pensez à l\'option qui répartit le risque sur de nombreuses entreprises...'
      },
      xp: 20
    },
    {
      id: 'compound-interest',
      type: 'quiz',
      title: { en: 'The Power of Compound Interest', fr: 'Le Pouvoir des Intérêts Composés' },
      question: { 
        en: 'If you invest $1,000 at 7% annual return for 10 years, approximately how much will you have?', 
        fr: 'Si vous investissez 1000€ avec un rendement annuel de 7% pendant 10 ans, combien aurez-vous approximativement ?' 
      },
      correctAnswer: { en: '$2,000', fr: '2000€' },
      acceptedAnswers: {
        en: ['2000', '$2000', '$2,000', 'two thousand', '1967'],
        fr: ['2000', '2000€', '2000 euros', 'deux mille', '1967']
      },
      explanation: {
        en: 'Using the rule of 72, money doubles every 10 years at 7% return. $1,000 becomes approximately $1,967.',
        fr: 'En utilisant la règle de 72, l\'argent double tous les 10 ans avec un rendement de 7%. 1000€ devient approximativement 1967€.'
      },
      hint: {
        en: 'Remember the rule of 72: divide 72 by the interest rate to find doubling time...',
        fr: 'Rappelez-vous la règle de 72 : divisez 72 par le taux d\'intérêt pour trouver le temps de doublement...'
      },
      xp: 25
    },
    {
      id: 'dollar-cost-averaging',
      type: 'multiple_choice',
      title: { en: 'Dollar-Cost Averaging', fr: 'Moyenne d\'Achat Périodique' },
      question: { 
        en: 'What is dollar-cost averaging?', 
        fr: 'Qu\'est-ce que la moyenne d\'achat périodique ?' 
      },
      options: {
        en: [
          'Buying low and selling high',
          'Investing the same amount regularly regardless of price',
          'Investing only when markets are down',
          'Timing the market perfectly'
        ],
        fr: [
          'Acheter bas et vendre haut',
          'Investir le même montant régulièrement peu importe le prix',
          'Investir seulement quand les marchés baissent',
          'Chronométrer parfaitement le marché'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Dollar-cost averaging means investing a fixed amount regularly, which helps reduce the impact of market volatility.',
        fr: 'La moyenne d\'achat périodique signifie investir un montant fixe régulièrement, ce qui aide à réduire l\'impact de la volatilité du marché.'
      },
      hint: {
        en: 'Think about automatic, regular investing...',
        fr: 'Pensez à l\'investissement automatique et régulier...'
      },
      xp: 20
    },
    {
      id: 'diversification',
      type: 'checklist',
      title: { en: 'Diversification Principles', fr: 'Principes de Diversification' },
      items: {
        en: [
          'Don\'t put all eggs in one basket',
          'Invest across different asset classes',
          'Consider geographic diversification',
          'Rebalance your portfolio regularly',
          'Start with broad index funds'
        ],
        fr: [
          'Ne pas mettre tous ses œufs dans le même panier',
          'Investir dans différentes classes d\'actifs',
          'Considérer la diversification géographique',
          'Rééquilibrer son portefeuille régulièrement',
          'Commencer avec des fonds indiciels larges'
        ]
      },
      explanation: {
        en: 'Diversification helps reduce risk by spreading investments across different assets, sectors, and regions.',
        fr: 'La diversification aide à réduire le risque en répartissant les investissements sur différents actifs, secteurs et régions.'
      },
      xp: 25
    },
    {
      id: 'action-challenge',
      type: 'action',
      title: { en: 'Investing Basics Action Challenge', fr: 'Défi Action Bases de l\'Investissement' },
      content: {
        en: {
          description: 'Start your investing journey!',
          actions: [
            {
              id: 'investing-basics_action_1',
              title: 'Open an investment account',
              description: 'Open a brokerage account or retirement account',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'investing-basics_action_2',
              title: 'Research your first investment',
              description: 'Research and choose your first investment (ETF, mutual fund, etc.)',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'investing-basics_action_3',
              title: 'Make your first investment',
              description: 'Invest a small amount in your chosen investment',
              verification: 'manual',
              xp: 15
            }
          ]
        },
        fr: {
          description: 'Commencez votre parcours d\'investissement !',
          actions: [
            {
              id: 'investing-basics_action_1',
              title: 'Ouvrir un compte d\'investissement',
              description: 'Ouvrez un compte de courtage ou un compte de retraite',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'investing-basics_action_2',
              title: 'Rechercher votre premier investissement',
              description: 'Recherchez et choisissez votre premier investissement (ETF, fonds commun, etc.)',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'investing-basics_action_3',
              title: 'Faire votre premier investissement',
              description: 'Investissez un petit montant dans votre investissement choisi',
              verification: 'manual',
              xp: 15
            }
          ]
        }
      },
      validation: (data) => {
        const { accountOpened, researchDone, firstInvestment } = data;
        if (accountOpened && researchDone && firstInvestment) {
          return { isValid: true, message: 'Great start to investing!' };
        }
        return { isValid: false, message: 'Keep working on your investing goals' };
      },
      xp: 20
    }
  ],

  analytics: {
    completionRate: 0.80,
    averageTime: 22,
    difficultyRating: 2.5,
    userSatisfaction: 4.5,
    retryRate: 0.18,
    dropoffPoints: ['investing-intro', 'action-challenge'],
    popularFeatures: ['investment-types', 'risk-management', 'first-investment']
  }
};

export const getinvestingBasicsHelpers = () => ({
  calculateCompoundInterest: (principal, rate, time) => {
    return principal * Math.pow(1 + rate / 100, time);
  },
  
  suggestInvestmentType: (riskTolerance, timeHorizon) => {
    if (riskTolerance === 'low' && timeHorizon < 5) {
      return 'Bonds or CDs';
    } else if (riskTolerance === 'medium' && timeHorizon >= 5) {
      return 'Index funds or ETFs';
    } else {
      return 'Diversified portfolio';
    }
  },
  
  estimateInvestmentGrowth: (monthlyContribution, years, annualReturn) => {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;
    return monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  }
}); 