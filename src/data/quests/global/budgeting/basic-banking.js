import { FaUniversity, FaShieldAlt, FaCalculator } from 'react-icons/fa';

export const basicBanking = {
  id: 'basic-banking',
  category: 'budgeting',
  difficulty: 'beginner',
  duration: 35,
  xp: 190,
  isPremium: false,
  order: 7,
  
  // Métadonnées enrichies
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['essential', 'banking', 'foundation'],
    relatedQuests: ['credit-score-basics', 'investment-accounts'],
    averageCompletionTime: 18,
    completionRate: 0.85,
    userRating: 4.6
  },

  // Icônes spécifiques
  icons: {
    main: FaUniversity,
    steps: [FaShieldAlt, FaCalculator]
  },
  
  // Couleurs thématiques
  colors: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#FBBF24'
  },

  // Contenu localisé structuré
  content: {
    en: {
      title: 'Banking Basics & Account Types',
      description: 'Navigate the banking system like a pro',
      longDescription: 'Master the fundamentals of banking, understand different account types, avoid fees, and choose the right bank for your financial needs.',
      objectives: [
        'Understand different account types',
        'Learn about banking fees and how to avoid them',
        'Choose the right bank for your needs',
        'Master online banking safety'
      ],
      prerequisites: ['None'],
      whatYouWillLearn: [
        'Checking vs savings accounts',
        'Online vs traditional banks',
        'Fee avoidance strategies',
        'Digital banking security'
      ],
      realWorldApplication: 'Apply banking knowledge to reduce fees, earn better interest rates, and manage your money more efficiently.'
    },
    fr: {
      title: 'Bases Bancaires & Types de Comptes',
      description: 'Naviguez le système bancaire comme un pro',
      longDescription: 'Maîtrisez les fondamentaux bancaires, comprenez les différents types de comptes, évitez les frais, et choisissez la bonne banque pour vos besoins financiers.',
      objectives: [
        'Comprendre les différents types de comptes',
        'Apprendre sur les frais bancaires et comment les éviter',
        'Choisir la bonne banque pour vos besoins',
        'Maîtriser la sécurité bancaire en ligne'
      ],
      prerequisites: ['Aucun'],
      whatYouWillLearn: [
        'Comptes chèques vs épargne',
        'Banques en ligne vs traditionnelles',
        'Stratégies d\'évitement des frais',
        'Sécurité bancaire numérique'
      ],
      realWorldApplication: 'Appliquez les connaissances bancaires pour réduire les frais, gagner de meilleurs taux d\'intérêt, et gérer votre argent plus efficacement.'
    }
  },

  // Rewards enrichis
  rewards: {
    badge: {
      id: 'banking_basics',
      name: { en: 'Banking Basics', fr: 'Bases Bancaires' },
      description: { 
        en: 'Mastered the fundamentals of banking and account management',
        fr: 'Maîtrisé les fondamentaux bancaires et la gestion de comptes'
      },
      rarity: 'common',
      imageUrl: '/badges/banking-basics.png'
    },
    unlocks: ['credit-score-basics', 'investment-accounts'],
    bonusXP: {
      firstTime: 50,
      speedBonus: 25,
      perfectScore: 30
    }
  },

  // Steps avec ACTION CHALLENGE
  steps: [
    {
      type: 'info',
      title_en: 'Account Types Explained',
      title_fr: 'Types de Comptes Expliqués',
      content_en: 'Checking accounts for daily use, savings for goals, money market for higher yields.',
      content_fr: 'Comptes chèques pour usage quotidien, épargne pour objectifs, marché monétaire pour meilleurs rendements.',
      funFact_en: 'The average American pays $329 in bank fees per year - most are avoidable!',
      funFact_fr: 'L\'Américain moyen paie 329$ en frais bancaires par an - la plupart évitables !'
    },
    {
      type: 'multiple_choice',
      question_en: 'What\'s the main advantage of online banks?',
      question_fr: 'Quel est l\'avantage principal des banques en ligne ?',
      options_en: [
        'Physical branch locations',
        'Higher interest rates & lower fees',
        'Personal banker relationships',
        'Cash deposit convenience'
      ],
      options_fr: [
        'Agences physiques',
        'Taux plus élevés & frais réduits',
        'Relations banquier personnel',
        'Commodité dépôts espèces'
      ],
      correct: 1,
      explanation_en: 'Online banks have lower overhead costs, so they offer better rates and fewer fees.',
      explanation_fr: 'Les banques en ligne ont moins de coûts, donc offrent de meilleurs taux et moins de frais.',
      hint_en: 'Think about what costs traditional banks have that online banks don\'t...',
      hint_fr: 'Pensez aux coûts des banques traditionnelles que les banques en ligne n\'ont pas...',
      difficulty: 'easy',
      points: 10
    },
    {
      type: 'checklist',
      title_en: 'Avoid Banking Fees',
      title_fr: 'Éviter les Frais Bancaires',
      items_en: [
        'Maintain minimum balance requirements',
        'Use in-network ATMs only',
        'Set up overdraft protection',
        'Choose accounts with no monthly fees'
      ],
      items_fr: [
        'Maintenir les soldes minimums requis',
        'Utiliser seulement les GAB du réseau',
        'Configurer la protection découvert',
        'Choisir des comptes sans frais mensuels'
      ],
      explanation_en: 'These simple steps can save you hundreds per year!',
      explanation_fr: 'Ces étapes simples peuvent vous économiser des centaines par an !'
    },
    {
      id: 'account-types',
      type: 'multiple_choice',
      title: { en: 'Types of Bank Accounts', fr: 'Types de Comptes Bancaires' },
      question: { 
        en: 'Which type of account typically offers the highest interest rates?', 
        fr: 'Quel type de compte offre généralement les taux d\'intérêt les plus élevés ?' 
      },
      options: {
        en: [
          'Checking account',
          'Traditional savings account',
          'High-yield savings account',
          'Certificate of Deposit (CD)'
        ],
        fr: [
          'Compte courant',
          'Compte d\'épargne traditionnel',
          'Compte d\'épargne à haut rendement',
          'Certificat de dépôt (CD)'
        ]
      },
      correct: 3,
      explanation: {
        en: 'CDs typically offer the highest rates because you agree to lock up your money for a specific period.',
        fr: 'Les CD offrent généralement les taux les plus élevés car vous acceptez de bloquer votre argent pour une période spécifique.'
      },
      hint: {
        en: 'Think about which requires you to commit your money longest...',
        fr: 'Pensez à celui qui vous demande d\'engager votre argent le plus longtemps...'
      },
      xp: 20
    },
    {
      id: 'banking-fees',
      type: 'checklist',
      title: { en: 'Common Banking Fees to Avoid', fr: 'Frais Bancaires Courants à Éviter' },
      items: {
        en: [
          'Monthly maintenance fees (choose no-fee accounts)',
          'ATM fees (use in-network ATMs)',
          'Overdraft fees (set up alerts and protection)',
          'Minimum balance fees (maintain required balances)',
          'Wire transfer fees (use alternative methods when possible)'
        ],
        fr: [
          'Frais de tenue de compte mensuel (choisir comptes sans frais)',
          'Frais de GAB (utiliser GAB du réseau)',
          'Frais de découvert (configurer alertes et protection)',
          'Frais solde minimum (maintenir soldes requis)',
          'Frais de virement (utiliser méthodes alternatives si possible)'
        ]
      },
      explanation: {
        en: 'These fees can add up to hundreds of dollars per year. Most are completely avoidable with the right choices.',
        fr: 'Ces frais peuvent totaliser des centaines d\'euros par an. La plupart sont complètement évitables avec les bons choix.'
      },
      xp: 25
    },
    {
      id: 'online-vs-traditional',
      type: 'multiple_choice',
      title: { en: 'Online vs Traditional Banking', fr: 'Banque en Ligne vs Traditionnelle' },
      question: { 
        en: 'What is the main advantage of online banks over traditional banks?', 
        fr: 'Quel est l\'avantage principal des banques en ligne sur les banques traditionnelles ?' 
      },
      options: {
        en: [
          'Better customer service',
          'More physical locations',
          'Higher interest rates and lower fees',
          'More complex products'
        ],
        fr: [
          'Meilleur service client',
          'Plus de succursales physiques',
          'Taux d\'intérêt plus élevés et frais plus bas',
          'Produits plus complexes'
        ]
      },
      correct: 2,
      explanation: {
        en: 'Online banks have lower overhead costs, allowing them to offer higher interest rates and lower fees to customers.',
        fr: 'Les banques en ligne ont des coûts généraux plus bas, leur permettant d\'offrir des taux plus élevés et frais plus bas aux clients.'
      },
      hint: {
        en: 'Think about what online banks save on compared to brick-and-mortar banks...',
        fr: 'Pensez à ce que les banques en ligne économisent par rapport aux banques physiques...'
      },
      xp: 20
    },
    {
      id: 'banking-security',
      type: 'quiz',
      title: { en: 'Banking Security', fr: 'Sécurité Bancaire' },
      question: { 
        en: 'What does FDIC insurance protect up to for each depositor per bank?', 
        fr: 'Jusqu\'à quel montant l\'assurance FDIC protège-t-elle chaque déposant par banque ?' 
      },
      correctAnswer: { en: '$250,000', fr: '250000$' },
      acceptedAnswers: {
        en: ['250000', '$250000', '$250,000', 'two hundred fifty thousand', '250k'],
        fr: ['250000', '250000$', '250 000$', 'deux cent cinquante mille', '250k']
      },
      explanation: {
        en: 'FDIC insurance protects up to $250,000 per depositor, per bank, per ownership category in case of bank failure.',
        fr: 'L\'assurance FDIC protège jusqu\'à 250 000$ par déposant, par banque, par catégorie de propriété en cas de faillite bancaire.'
      },
      hint: {
        en: 'It\'s a quarter of a million dollars...',
        fr: 'C\'est un quart de million de dollars...'
      },
      xp: 25
    },
    {
      id: 'action-challenge',
      type: 'action',
      duration: 15,
      content: {
        en: {
          title: '🏦 Banking Action Challenge',
          subtitle: 'Optimize your banking setup!',
          description: 'Take real actions to improve your banking experience and save money on fees',
          timeLimit: 48, // hours
          actions: [
            {
              id: 'banking_action_1',
              title: '📱 Quick Win: Review your current bank fees',
              description: 'Check your last 3 months of bank statements for any fees',
              difficulty: 'easy',
              xp: 50,
              timeEstimate: '10 min',
              tips: [
                'Look for monthly maintenance fees',
                'Check for ATM fees',
                'Review overdraft charges'
              ],
              verificationMethod: 'screenshot',
              successCriteria: 'Show fee analysis with total amount found'
            },
            {
              id: 'banking_action_2',
              title: '💰 Compare 3 Online Banks',
              description: 'Research and compare features of 3 online banking options',
              difficulty: 'medium',
              xp: 100,
              timeEstimate: '20 min',
              verificationMethod: 'self_report',
              reflection: 'Which bank offers the best rates and lowest fees?'
            },
            {
              id: 'banking_action_3',
              title: '🏆 Boss Mode: Switch to a Better Account',
              description: 'Open a new account with better terms or switch existing accounts',
              difficulty: 'hard',
              xp: 200,
              timeEstimate: '30-45 min',
              tools: ['Online banking access', 'ID documents'],
              bonus: 'Share your savings calculation for 50 bonus XP!'
            }
          ]
        },
        fr: {
          title: '🏦 Défi Action Bancaire',
          subtitle: 'Optimisez votre configuration bancaire !',
          description: 'Prenez des actions réelles pour améliorer votre expérience bancaire et économiser sur les frais',
          timeLimit: 48, // heures
          actions: [
            {
              id: 'banking_action_1',
              title: '📱 Victoire Rapide : Examinez vos frais bancaires actuels',
              description: 'Vérifiez vos 3 derniers relevés bancaires pour tout frais',
              difficulty: 'easy',
              xp: 50,
              timeEstimate: '10 min',
              tips: [
                'Cherchez les frais de maintenance mensuels',
                'Vérifiez les frais de GAB',
                'Examinez les frais de découvert'
              ],
              verificationMethod: 'screenshot',
              successCriteria: 'Montrer l\'analyse des frais avec le montant total trouvé'
            },
            {
              id: 'banking_action_2',
              title: '💰 Comparez 3 Banques en Ligne',
              description: 'Recherchez et comparez les fonctionnalités de 3 options bancaires en ligne',
              difficulty: 'medium',
              xp: 100,
              timeEstimate: '20 min',
              verificationMethod: 'self_report',
              reflection: 'Quelle banque offre les meilleurs taux et les frais les plus bas ?'
            },
            {
              id: 'banking_action_3',
              title: '🏆 Mode Boss : Passez à un Meilleur Compte',
              description: 'Ouvrez un nouveau compte avec de meilleures conditions ou changez de compte existant',
              difficulty: 'hard',
              xp: 200,
              timeEstimate: '30-45 min',
              tools: ['Accès bancaire en ligne', 'Documents d\'identité'],
              bonus: 'Partagez votre calcul d\'économies pour 50 XP bonus !'
            }
          ]
        }
      }
    }
  ],

  // Analytics et métriques
  analytics: {
    trackingEvents: ['quest_started', 'step_completed', 'action_completed'],
    kpis: {
      targetCompletionRate: 0.85,
      targetSatisfaction: 4.5
    }
  }
};

// Helper function spécifique à cette quête
export const getBasicBankingHelpers = () => ({
  calculateFeeSavings: (currentFees, newFees) => {
    return currentFees - newFees;
  },
  getNextStep: (currentStep) => {
    // Logique spécifique
  }
}); 