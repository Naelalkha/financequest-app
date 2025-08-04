import { FaCreditCard, FaChartLine, FaCheckCircle } from 'react-icons/fa';

export const creditScoreBasics = {
  id: 'credit-score-basics',
  category: 'debt',
  difficulty: 'beginner',
  duration: 45,
  xp: 200,
  isPremium: false,
  order: 3,
  
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['credit', 'debt', 'beginner-friendly'],
    relatedQuests: ['budget-basics', 'debt-avalanche'],
    averageCompletionTime: 14,
    completionRate: 0.85,
    userRating: 4.6,
    featured: false
  },

  icons: {
    main: FaCreditCard,
    steps: [FaChartLine, FaCheckCircle]
  },
  
  colors: {
    primary: '#DC2626',
    secondary: '#EF4444',
    accent: '#F59E0B'
  },

  content: {
    en: {
      title: 'Credit Score Basics',
      description: 'Understand how credit scores work and how to improve yours',
      longDescription: 'Learn the fundamentals of credit scores, what affects them, and proven strategies to build and maintain a good credit score.',
      objectives: [
        'Understand what a credit score is',
        'Learn what affects your credit score',
        'Know how to check your credit score',
        'Learn strategies to improve your score'
      ],
      prerequisites: ['Basic understanding of budgeting'],
      whatYouWillLearn: [
        'The five factors that affect credit scores',
        'How to read your credit report',
        'Strategies to build credit history',
        'Common credit score myths'
      ],
      realWorldApplication: 'You\'ll understand your credit score and have a plan to improve it for better loan terms and financial opportunities.'
    },
    fr: {
      title: 'Bases du Score de Crédit',
      description: 'Comprenez comment fonctionnent les scores de crédit et comment améliorer le vôtre',
      longDescription: 'Apprenez les fondamentaux des scores de crédit, ce qui les affecte, et des stratégies éprouvées pour construire et maintenir un bon score de crédit.',
      objectives: [
        'Comprendre ce qu\'est un score de crédit',
        'Apprendre ce qui affecte votre score',
        'Savoir comment vérifier votre score',
        'Apprendre des stratégies pour l\'améliorer'
      ],
      prerequisites: ['Compréhension de base du budget'],
      whatYouWillLearn: [
        'Les cinq facteurs qui affectent les scores de crédit',
        'Comment lire votre rapport de crédit',
        'Stratégies pour construire l\'historique de crédit',
        'Mythes courants sur les scores de crédit'
      ],
      realWorldApplication: 'Vous comprendrez votre score de crédit et aurez un plan pour l\'améliorer pour de meilleures conditions de prêt et opportunités financières.'
    }
  },

  rewards: {
    badge: {
      id: 'credit_smart',
      name: { en: 'Credit Smart', fr: 'Intelligent Crédit' },
      description: {
        en: 'You\'ve mastered credit score basics!',
        fr: 'Vous avez maîtrisé les bases du score de crédit !'
      },
      rarity: 'common',
      imageUrl: '/badges/credit-smart.png'
    },
    unlocks: ['debt-avalanche', 'investing-basics'],
    bonusXP: {
      firstTime: 40,
      speedBonus: 20,
      perfectScore: 25
    }
  },

  steps: [
    {
      id: 'credit-intro',
      type: 'info',
      title: { en: 'What is a Credit Score?', fr: 'Qu\'est-ce qu\'un Score de Crédit ?' },
      content: {
        en: {
          text: 'A credit score is a number that represents your creditworthiness to lenders.',
          funFact: 'The average credit score in the US is 714, and scores range from 300 to 850!'
        },
        fr: {
          text: 'Un score de crédit est un nombre qui représente votre solvabilité aux yeux des prêteurs.',
          funFact: 'Le score de crédit moyen aux US est de 714, et les scores vont de 300 à 850 !'
        }
      },
      xp: 15
    },
    {
      id: 'credit-factors',
      type: 'quiz',
      title: { en: 'Credit Score Factors', fr: 'Facteurs du Score de Crédit' },
      content: {
        en: {
          question: 'Which factor has the biggest impact on your credit score?',
          options: [
            'Payment history',
            'Credit utilization',
            'Length of credit history',
            'Types of credit used'
          ],
          correctAnswer: 0,
          explanation: 'Payment history (35%) has the biggest impact on your credit score.',
          hint: 'Think about what lenders care about most...'
        },
        fr: {
          question: 'Quel facteur a le plus grand impact sur votre score de crédit ?',
          options: [
            'Historique des paiements',
            'Utilisation du crédit',
            'Durée de l\'historique de crédit',
            'Types de crédit utilisés'
          ],
          correctAnswer: 0,
          explanation: 'L\'historique des paiements (35%) a le plus grand impact sur votre score de crédit.',
          hint: 'Pensez à ce qui importe le plus aux prêteurs...'
        }
      },
      xp: 25
    },
    {
      id: 'credit-utilization',
      type: 'multiple_choice',
      title: { en: 'Credit Utilization Ratio', fr: 'Ratio d\'Utilisation du Crédit' },
      question: { 
        en: 'What is the ideal credit utilization ratio to maintain a good credit score?', 
        fr: 'Quel est le ratio d\'utilisation du crédit idéal pour maintenir un bon score de crédit ?' 
      },
      options: {
        en: [
          'Under 30%',
          'Under 10%',
          'Exactly 50%',
          '90% or higher'
        ],
        fr: [
          'Moins de 30%',
          'Moins de 10%',
          'Exactement 50%',
          '90% ou plus'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Keeping credit utilization under 10% is ideal for the best credit scores, though under 30% is generally acceptable.',
        fr: 'Garder l\'utilisation du crédit sous 10% est idéal pour les meilleurs scores, bien que moins de 30% soit généralement acceptable.'
      },
      hint: {
        en: 'Lower utilization shows you\'re not dependent on credit...',
        fr: 'Une utilisation plus faible montre que vous ne dépendez pas du crédit...'
      },
      xp: 20
    },
    {
      id: 'credit-report-errors',
      type: 'checklist',
      title: { en: 'Common Credit Report Errors', fr: 'Erreurs Communes des Rapports de Crédit' },
      items: {
        en: [
          'Incorrect personal information',
          'Accounts that don\'t belong to you',
          'Incorrect payment history',
          'Closed accounts shown as open',
          'Wrong credit limits or balances'
        ],
        fr: [
          'Informations personnelles incorrectes',
          'Comptes qui ne vous appartiennent pas',
          'Historique de paiements incorrect',
          'Comptes fermés montrés comme ouverts',
          'Limites de crédit ou soldes incorrects'
        ]
      },
      explanation: {
        en: 'About 20% of credit reports contain errors. Regular monitoring helps catch and dispute these mistakes.',
        fr: 'Environ 20% des rapports de crédit contiennent des erreurs. La surveillance régulière aide à détecter et contester ces erreurs.'
      },
      xp: 25
    },
    {
      id: 'credit-score-ranges',
      type: 'quiz',
      title: { en: 'Credit Score Ranges', fr: 'Plages de Score de Crédit' },
      question: { 
        en: 'What credit score is generally considered "excellent"?', 
        fr: 'Quel score de crédit est généralement considéré comme "excellent" ?' 
      },
      correctAnswer: { en: '800+', fr: '800+' },
      acceptedAnswers: {
        en: ['800', '800+', '800 or higher', 'above 800', '750+', 'over 800'],
        fr: ['800', '800+', '800 ou plus', 'plus de 800', '750+', 'au-dessus de 800']
      },
      explanation: {
        en: 'Credit scores of 800+ are considered excellent. 740+ is very good, 670-739 is good, 580-669 is fair, below 580 is poor.',
        fr: 'Les scores de crédit de 800+ sont considérés excellents. 740+ est très bien, 670-739 est bien, 580-669 est passable, moins de 580 est pauvre.'
      },
      hint: {
        en: 'Think of the highest tier in scoring systems...',
        fr: 'Pensez au niveau le plus élevé dans les systèmes de notation...'
      },
      xp: 25
    },
    {
      id: 'credit-building-strategies',
      type: 'multiple_choice',
      title: { en: 'Credit Building Strategies', fr: 'Stratégies de Construction de Crédit' },
      question: { 
        en: 'What\'s the fastest way to improve a damaged credit score?', 
        fr: 'Quelle est la façon la plus rapide d\'améliorer un score de crédit endommagé ?' 
      },
      options: {
        en: [
          'Pay off all credit card debt',
          'Close old credit accounts',
          'Apply for multiple new cards',
          'Use credit repair companies'
        ],
        fr: [
          'Rembourser toutes les dettes de carte de crédit',
          'Fermer les anciens comptes de crédit',
          'Demander plusieurs nouvelles cartes',
          'Utiliser des compagnies de réparation de crédit'
        ]
      },
      correct: 0,
      explanation: {
        en: 'Paying off credit card debt dramatically reduces utilization ratio, which can improve your score within 30-60 days.',
        fr: 'Rembourser les dettes de carte de crédit réduit drastiquement le ratio d\'utilisation, ce qui peut améliorer votre score en 30-60 jours.'
      },
      hint: {
        en: 'Think about what has the biggest immediate impact...',
        fr: 'Pensez à ce qui a le plus grand impact immédiat...'
      },
      xp: 20
    },
    {
      id: 'credit-monitoring',
      type: 'multiple_choice',
      title: { en: 'Credit Monitoring', fr: 'Surveillance du Crédit' },
      question: { 
        en: 'How often can you check your credit report for free without affecting your score?', 
        fr: 'À quelle fréquence pouvez-vous vérifier votre rapport de crédit gratuitement sans affecter votre score ?' 
      },
      options: {
        en: [
          'Once per year',
          'Once per month',
          'As often as you want',
          'Only when applying for credit'
        ],
        fr: [
          'Une fois par an',
          'Une fois par mois',
          'Aussi souvent que vous voulez',
          'Seulement quand vous demandez du crédit'
        ]
      },
      correct: 2,
      explanation: {
        en: 'Checking your own credit report is a "soft inquiry" and doesn\'t affect your score. You can check as often as you want.',
        fr: 'Vérifier votre propre rapport de crédit est une "enquête douce" et n\'affecte pas votre score. Vous pouvez vérifier aussi souvent que vous voulez.'
      },
      hint: {
        en: 'Think about the difference between you checking vs. lenders checking...',
        fr: 'Pensez à la différence entre vous qui vérifiez vs. les prêteurs qui vérifient...'
      },
      xp: 20
    },
    {
      id: 'action-challenge',
      type: 'action',
      title: { en: 'Credit Score Action Challenge', fr: 'Défi Action Score de Crédit' },
      content: {
        en: {
          description: 'Take action to improve your credit score!',
          actions: [
            {
              id: 'credit_action_1',
              title: 'Check your credit report',
              description: 'Get your free annual credit report from AnnualCreditReport.com',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'credit_action_2',
              title: 'Set up payment reminders',
              description: 'Set up automatic payment reminders for all your bills',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'credit_action_3',
              title: 'Reduce credit utilization',
              description: 'Pay down credit card balances to below 30% of your limit',
              verification: 'manual',
              xp: 15
            }
          ]
        },
        fr: {
          description: 'Passez à l\'action pour améliorer votre score de crédit !',
          actions: [
            {
              id: 'credit_action_1',
              title: 'Vérifier votre rapport de crédit',
              description: 'Obtenez votre rapport de crédit annuel gratuit sur AnnualCreditReport.com',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'credit_action_2',
              title: 'Configurer des rappels de paiement',
              description: 'Configurez des rappels de paiement automatiques pour toutes vos factures',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'credit_action_3',
              title: 'Réduire l\'utilisation du crédit',
              description: 'Remboursez les soldes de cartes de crédit à moins de 30% de votre limite',
              verification: 'manual',
              xp: 15
            }
          ]
        }
      },
      validation: (data) => {
        const { creditReportChecked, paymentRemindersSet, utilizationReduced } = data;
        if (creditReportChecked && paymentRemindersSet && utilizationReduced) {
          return { isValid: true, message: 'Great credit score work!' };
        }
        return { isValid: false, message: 'Keep working on your credit score goals' };
      },
      xp: 20
    }
  ],

  analytics: {
    completionRate: 0.85,
    averageTime: 14,
    difficultyRating: 2.1,
    userSatisfaction: 4.6,
    retryRate: 0.14,
    dropoffPoints: ['credit-factors', 'action-challenge'],
    popularFeatures: ['credit-factors', 'credit-report', 'payment-reminders']
  }
};

export const getCreditScoreHelpers = () => ({
  calculateCreditUtilization: (totalBalance, totalLimit) => {
    return (totalBalance / totalLimit) * 100;
  },
  
  suggestCreditImprovements: (creditScore) => {
    const suggestions = [];
    if (creditScore < 580) {
      suggestions.push('Focus on making all payments on time');
    } else if (creditScore < 670) {
      suggestions.push('Work on reducing credit utilization');
    } else if (creditScore < 740) {
      suggestions.push('Consider diversifying your credit mix');
    }
    return suggestions;
  },
  
  estimateScoreImpact: (action) => {
    const impacts = {
      'on-time-payment': 10,
      'reduce-utilization': 15,
      'new-credit': -5,
      'credit-mix': 5
    };
    return impacts[action] || 0;
  }
}); 