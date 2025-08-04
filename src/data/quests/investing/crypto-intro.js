import { FaBitcoin, FaLightbulb, FaCheckCircle } from 'react-icons/fa';

export const cryptoIntro = {
  id: 'crypto-intro',
  category: 'investing',
  difficulty: 'intermediate',
  duration: 35,
  xp: 150,
  isPremium: false,
  order: 7,
  
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['crypto', 'investing', 'intermediate'],
    relatedQuests: ['investing-basics', 'real-estate-basics'],
    averageCompletionTime: 18,
    completionRate: 0.75,
    userRating: 4.3,
    featured: false
  },

  icons: {
    main: FaBitcoin,
    steps: [FaLightbulb, FaCheckCircle]
  },
  
  colors: {
    primary: '#F7931A',
    secondary: '#FFD700',
    accent: '#F59E0B'
  },

  content: {
    en: {
      title: 'Crypto Introduction',
      description: 'Learn the basics of cryptocurrency and blockchain technology',
      longDescription: 'Understand cryptocurrency fundamentals, blockchain technology, and how to safely start investing in digital assets.',
      objectives: [
        'Understand what cryptocurrency is',
        'Learn about blockchain technology',
        'Know the risks and benefits',
        'Start with small crypto investments'
      ],
      prerequisites: ['Basic investing knowledge', 'Understanding of risk'],
      whatYouWillLearn: [
        'How blockchain technology works',
        'Major cryptocurrencies and their purposes',
        'Crypto wallet security',
        'Risk management in crypto investing'
      ],
      realWorldApplication: 'You\'ll understand cryptocurrency and be able to make informed decisions about crypto investments.'
    },
    fr: {
      title: 'Introduction à la Crypto',
      description: 'Apprenez les bases de la cryptomonnaie et de la technologie blockchain',
      longDescription: 'Comprenez les fondamentaux de la cryptomonnaie, la technologie blockchain et comment commencer à investir en toute sécurité dans les actifs numériques.',
      objectives: [
        'Comprendre ce qu\'est la cryptomonnaie',
        'Apprendre sur la technologie blockchain',
        'Connaître les risques et avantages',
        'Commencer avec de petits investissements crypto'
      ],
      prerequisites: ['Connaissance de base de l\'investissement', 'Compréhension du risque'],
      whatYouWillLearn: [
        'Comment fonctionne la technologie blockchain',
        'Cryptomonnaies majeures et leurs objectifs',
        'Sécurité des portefeuilles crypto',
        'Gestion des risques dans l\'investissement crypto'
      ],
      realWorldApplication: 'Vous comprendrez la cryptomonnaie et pourrez prendre des décisions éclairées sur les investissements crypto.'
    }
  },

  rewards: {
    badge: {
      id: 'crypto_intro_badge',
      name: { en: 'Crypto Explorer', fr: 'Explorateur Crypto' },
      description: {
        en: 'You\'ve entered the world of cryptocurrency!',
        fr: 'Vous êtes entré dans le monde de la cryptomonnaie !'
      },
      rarity: 'common',
      imageUrl: '/badges/crypto-intro.png'
    },
    unlocks: ['real-estate-basics', 'money-mindset'],
    bonusXP: {
      firstTime: 45,
      speedBonus: 20,
      perfectScore: 25
    }
  },

  steps: [
    {
      id: 'crypto-intro',
      type: 'info',
      title: { en: 'What is Cryptocurrency?', fr: 'Qu\'est-ce que la Cryptomonnaie ?' },
      content: {
        en: {
          text: 'Cryptocurrency is digital money that uses cryptography for security and operates on blockchain technology.',
          funFact: 'Bitcoin, the first cryptocurrency, was created in 2009 and is now worth over $1 trillion!'
        },
        fr: {
          text: 'La cryptomonnaie est de l\'argent numérique qui utilise la cryptographie pour la sécurité et fonctionne sur la technologie blockchain.',
          funFact: 'Bitcoin, la première cryptomonnaie, a été créé en 2009 et vaut maintenant plus de 1 billion de dollars !'
        }
      },
      xp: 15
    },
    {
      id: 'blockchain-basics',
      type: 'multiple_choice',
      title: { en: 'Understanding Blockchain', fr: 'Comprendre la Blockchain' },
      question: { 
        en: 'What is the main advantage of blockchain technology?', 
        fr: 'Quel est l\'avantage principal de la technologie blockchain ?' 
      },
      options: {
        en: [
          'It\'s controlled by banks',
          'It\'s decentralized and transparent',
          'It\'s completely anonymous',
          'It guarantees profits'
        ],
        fr: [
          'Elle est contrôlée par les banques',
          'Elle est décentralisée et transparente',
          'Elle est complètement anonyme',
          'Elle garantit des profits'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Blockchain\'s main advantage is its decentralized nature and transparency - no single entity controls it.',
        fr: 'L\'avantage principal de la blockchain est sa nature décentralisée et sa transparence - aucune entité unique ne la contrôle.'
      },
      hint: {
        en: 'Think about what makes crypto different from traditional banking...',
        fr: 'Pensez à ce qui rend la crypto différente du système bancaire traditionnel...'
      },
      xp: 20
    },
    {
      id: 'crypto-allocation',
      type: 'multiple_choice',
      title: { en: 'Portfolio Allocation', fr: 'Allocation de Portefeuille' },
      question: { 
        en: 'What percentage of your investment portfolio should typically be in cryptocurrency?', 
        fr: 'Quel pourcentage de votre portefeuille d\'investissement devrait typiquement être en cryptomonnaie ?' 
      },
      options: {
        en: [
          '50-75% for maximum returns',
          '5-10% as speculative investment',
          '100% - go all in',
          '0% - too risky'
        ],
        fr: [
          '50-75% pour des rendements maximums',
          '5-10% comme investissement spéculatif',
          '100% - tout miser',
          '0% - trop risqué'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Most financial advisors recommend 5-10% in crypto due to its high volatility and speculative nature.',
        fr: 'La plupart des conseillers financiers recommandent 5-10% en crypto à cause de sa haute volatilité et nature spéculative.'
      },
      hint: {
        en: 'Consider risk management and diversification...',
        fr: 'Considérez la gestion des risques et la diversification...'
      },
      xp: 20
    },
    {
      id: 'crypto-security',
      type: 'checklist',
      title: { en: 'Crypto Security Essentials', fr: 'Essentiels de Sécurité Crypto' },
      items: {
        en: [
          'Use hardware wallet for large amounts',
          'Enable 2FA on all exchanges',
          'Never share private keys',
          'Research projects before investing',
          'Only invest what you can afford to lose'
        ],
        fr: [
          'Utiliser un wallet matériel pour gros montants',
          'Activer 2FA sur tous les échanges',
          'Ne jamais partager les clés privées',
          'Rechercher les projets avant d\'investir',
          'Investir seulement ce qu\'on peut se permettre de perdre'
        ]
      },
      explanation: {
        en: 'Security is paramount in crypto - many investors have lost fortunes due to poor security practices.',
        fr: 'La sécurité est primordiale en crypto - beaucoup d\'investisseurs ont perdu des fortunes à cause de mauvaises pratiques de sécurité.'
      },
      xp: 25
    },
    {
      id: 'major-cryptos',
      type: 'multiple_choice',
      title: { en: 'Major Cryptocurrencies', fr: 'Cryptomonnaies Majeures' },
      question: { 
        en: 'Which cryptocurrency is known for smart contracts and decentralized applications?', 
        fr: 'Quelle cryptomonnaie est connue pour les contrats intelligents et applications décentralisées ?' 
      },
      options: {
        en: [
          'Bitcoin (BTC)',
          'Ethereum (ETH)',
          'Dogecoin (DOGE)',
          'Litecoin (LTC)'
        ],
        fr: [
          'Bitcoin (BTC)',
          'Ethereum (ETH)',
          'Dogecoin (DOGE)',
          'Litecoin (LTC)'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Ethereum is the leading platform for smart contracts and decentralized applications (DApps).',
        fr: 'Ethereum est la plateforme leader pour les contrats intelligents et applications décentralisées (DApps).'
      },
      hint: {
        en: 'Think about which platform most DeFi projects are built on...',
        fr: 'Pensez à la plateforme sur laquelle la plupart des projets DeFi sont construits...'
      },
      xp: 20
    },
    {
      id: 'volatility-understanding',
      type: 'quiz',
      title: { en: 'Understanding Volatility', fr: 'Comprendre la Volatilité' },
      question: { 
        en: 'Bitcoin dropped 50% in 2022. If you invested $1,000, how much would you have left?', 
        fr: 'Bitcoin a chuté de 50% en 2022. Si vous aviez investi 1000€, combien vous resterait-il ?' 
      },
      correctAnswer: { en: '$500', fr: '500€' },
      acceptedAnswers: {
        en: ['500', '$500', '500 dollars', 'five hundred'],
        fr: ['500', '500€', '500 euros', 'cinq cents']
      },
      explanation: {
        en: 'A 50% drop means you lose half your investment. This is why crypto should only be a small part of your portfolio.',
        fr: 'Une chute de 50% signifie que vous perdez la moitié de votre investissement. C\'est pourquoi la crypto ne devrait être qu\'une petite partie de votre portefeuille.'
      },
      hint: {
        en: 'Calculate 50% of $1,000...',
        fr: 'Calculez 50% de 1000€...'
      },
      xp: 25
    },
    {
      id: 'action-challenge',
      type: 'action',
      title: { en: 'Crypto Introduction Action Challenge', fr: 'Défi Action Introduction Crypto' },
      content: {
        en: {
          description: 'Start your crypto journey safely!',
          actions: [
            {
              id: 'crypto-intro_action_1',
              title: 'Research major cryptocurrencies',
              description: 'Learn about Bitcoin, Ethereum, and other major cryptocurrencies',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'crypto-intro_action_2',
              title: 'Set up a crypto wallet',
              description: 'Create a secure cryptocurrency wallet',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'crypto-intro_action_3',
              title: 'Make a small crypto purchase',
              description: 'Buy a small amount of cryptocurrency to learn the process',
              verification: 'manual',
              xp: 15
            }
          ]
        },
        fr: {
          description: 'Commencez votre parcours crypto en toute sécurité !',
          actions: [
            {
              id: 'crypto-intro_action_1',
              title: 'Rechercher les cryptomonnaies majeures',
              description: 'Apprenez sur Bitcoin, Ethereum et autres cryptomonnaies majeures',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'crypto-intro_action_2',
              title: 'Configurer un portefeuille crypto',
              description: 'Créez un portefeuille de cryptomonnaie sécurisé',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'crypto-intro_action_3',
              title: 'Faire un petit achat crypto',
              description: 'Achetez une petite quantité de cryptomonnaie pour apprendre le processus',
              verification: 'manual',
              xp: 15
            }
          ]
        }
      },
      validation: (data) => {
        const { researchDone, walletCreated, purchaseMade } = data;
        if (researchDone && walletCreated && purchaseMade) {
          return { isValid: true, message: 'Great crypto start!' };
        }
        return { isValid: false, message: 'Keep learning about cryptocurrency' };
      },
      xp: 20
    }
  ],

  analytics: {
    completionRate: 0.75,
    averageTime: 18,
    difficultyRating: 3.0,
    userSatisfaction: 4.3,
    retryRate: 0.22,
    dropoffPoints: ['crypto-intro', 'action-challenge'],
    popularFeatures: ['blockchain-basics', 'crypto-wallets', 'risk-management']
  }
};

export const getcryptoIntroHelpers = () => ({
  calculateCryptoRisk: (investment, volatility) => {
    return investment * (volatility / 100);
  },
  
  suggestCryptoAllocation: (totalPortfolio, riskTolerance) => {
    const allocations = {
      conservative: 0.05,
      moderate: 0.10,
      aggressive: 0.20
    };
    return totalPortfolio * (allocations[riskTolerance] || 0.05);
  },
  
  estimateCryptoGrowth: (investment, annualReturn, years) => {
    return investment * Math.pow(1 + annualReturn / 100, years);
  }
}); 