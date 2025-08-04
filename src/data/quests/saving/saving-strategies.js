import { FaPiggyBank, FaLightbulb, FaCheckCircle } from 'react-icons/fa';

export const savingStrategies = {
  id: 'saving-strategies',
  category: 'saving',
  difficulty: 'beginner',
  duration: 40,
  xp: 200,
  isPremium: false,
  order: 5,
  
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['saving', 'strategies', 'beginner-friendly'],
    relatedQuests: ['emergency-fund-101', 'budget-basics', 'money-mindset'],
    averageCompletionTime: 22,
    completionRate: 0.82,
    userRating: 4.5,
    featured: false
  },

  icons: {
    main: FaPiggyBank,
    steps: [FaLightbulb, FaCheckCircle]
  },
  
  colors: {
    primary: '#059669',
    secondary: '#10B981',
    accent: '#F59E0B'
  },

  content: {
    en: {
      title: 'Saving Strategies That Work',
      description: 'Discover proven methods to save more money effortlessly',
      longDescription: 'Learn effective saving strategies including the "pay yourself first" principle, automatic saving techniques, and various savings challenges.',
      objectives: [
        'Learn the "pay yourself first" principle',
        'Master automatic saving techniques',
        'Understand different savings challenges',
        'Find the right savings account'
      ],
      prerequisites: ['Basic understanding of budgeting'],
      whatYouWillLearn: [
        'How to automate your savings',
        'Different types of savings challenges',
        'High-yield savings account options',
        'Psychological tricks to save more'
      ],
      realWorldApplication: 'You\'ll implement automatic saving systems and use proven strategies to build wealth faster.'
    },
    fr: {
      title: 'Stratégies d\'Épargne Efficaces',
      description: 'Découvrez des méthodes éprouvées pour économiser plus facilement',
      longDescription: 'Apprenez des stratégies d\'épargne efficaces incluant le principe "se payer en premier", les techniques d\'épargne automatique et différents défis d\'épargne.',
      objectives: [
        'Apprendre le principe "se payer en premier"',
        'Maîtriser les techniques d\'épargne automatique',
        'Comprendre différents défis d\'épargne',
        'Trouver le bon compte épargne'
      ],
      prerequisites: ['Compréhension de base du budget'],
      whatYouWillLearn: [
        'Comment automatiser votre épargne',
        'Différents types de défis d\'épargne',
        'Options de comptes épargne à haut rendement',
        'Astuces psychologiques pour épargner plus'
      ],
      realWorldApplication: 'Vous mettrez en place des systèmes d\'épargne automatique et utiliserez des stratégies éprouvées pour construire votre richesse plus rapidement.'
    }
  },

  rewards: {
    badge: {
      id: 'savings_master',
      name: { en: 'Savings Master', fr: 'Maître de l\'Épargne' },
      description: {
        en: 'You\'ve mastered the art of saving!',
        fr: 'Vous avez maîtrisé l\'art de l\'épargne !'
      },
      rarity: 'common',
      imageUrl: '/badges/savings-master.png'
    },
    unlocks: ['money-mindset', 'investing-basics'],
    bonusXP: {
      firstTime: 45,
      speedBonus: 20,
      perfectScore: 25
    }
  },

  steps: [
    {
      id: 'pay-yourself-first',
      type: 'info',
      title: { en: 'Pay Yourself First', fr: 'Se Payer en Premier' },
      content: {
        en: {
          text: 'The "pay yourself first" principle means saving money before spending on anything else.',
          funFact: 'People who pay themselves first save 3x more than those who save what\'s left over!'
        },
        fr: {
          text: 'Le principe "se payer en premier" signifie épargner de l\'argent avant de dépenser pour autre chose.',
          funFact: 'Les gens qui se paient en premier épargnent 3x plus que ceux qui épargnent ce qui reste !'
        }
      },
      xp: 15
    },
    {
      id: 'automatic-savings',
      type: 'quiz',
      title: { en: 'Automatic Saving', fr: 'Épargne Automatique' },
      content: {
        en: {
          question: 'What percentage of your income should you save automatically?',
          options: [
            '5-10%',
            '10-20%',
            '20-30%',
            'Whatever you can afford'
          ],
          correctAnswer: 1,
          explanation: 'Most experts recommend saving 10-20% of your income automatically.',
          hint: 'Start with 10% and increase gradually'
        },
        fr: {
          question: 'Quel pourcentage de vos revenus devriez-vous épargner automatiquement ?',
          options: [
            '5-10%',
            '10-20%',
            '20-30%',
            'Ce que vous pouvez vous permettre'
          ],
          correctAnswer: 1,
          explanation: 'La plupart des experts recommandent d\'épargner 10-20% de vos revenus automatiquement.',
          hint: 'Commencez avec 10% et augmentez progressivement'
        }
      },
      xp: 25
    },
    {
      id: 'savings-accounts',
      type: 'multiple_choice',
      title: { en: 'Types of Savings Accounts', fr: 'Types de Comptes d\'Épargne' },
      question: { 
        en: 'Which type of savings account typically offers the highest interest rates?', 
        fr: 'Quel type de compte d\'épargne offre généralement les taux d\'intérêt les plus élevés ?' 
      },
      options: {
        en: [
          'Traditional savings account',
          'High-yield online savings',
          'Checking account',
          'Certificate of Deposit (CD)'
        ],
        fr: [
          'Compte d\'épargne traditionnel',
          'Épargne en ligne à haut rendement',
          'Compte courant',
          'Certificat de dépôt (CD)'
        ]
      },
      correct: 1,
      explanation: {
        en: 'High-yield online savings accounts typically offer 10-20x higher interest rates than traditional bank savings accounts.',
        fr: 'Les comptes d\'épargne en ligne à haut rendement offrent généralement des taux 10-20x plus élevés que les comptes d\'épargne bancaires traditionnels.'
      },
      hint: {
        en: 'Think about which has lower overhead costs...',
        fr: 'Pensez à celui qui a les coûts généraux les plus bas...'
      },
      xp: 20
    },
    {
      id: 'savings-goals',
      type: 'checklist',
      title: { en: 'Smart Savings Goals', fr: 'Objectifs d\'Épargne Intelligents' },
      items: {
        en: [
          'Emergency fund (3-6 months expenses)',
          'Vacation or travel fund',
          'Down payment for major purchase',
          'Retirement contributions',
          'Annual insurance premiums'
        ],
        fr: [
          'Fonds d\'urgence (3-6 mois de dépenses)',
          'Fonds de vacances ou voyage',
          'Mise de fonds pour achat majeur',
          'Contributions à la retraite',
          'Primes d\'assurance annuelles'
        ]
      },
      explanation: {
        en: 'Having specific savings goals helps maintain motivation and makes it easier to track progress toward financial objectives.',
        fr: 'Avoir des objectifs d\'épargne spécifiques aide à maintenir la motivation et facilite le suivi des progrès vers les objectifs financiers.'
      },
      xp: 25
    },
    {
      id: 'savings-psychology',
      type: 'multiple_choice',
      title: { en: 'Psychology of Saving', fr: 'Psychologie de l\'Épargne' },
      question: { 
        en: 'What psychological trick makes saving easier?', 
        fr: 'Quelle astuce psychologique rend l\'épargne plus facile ?' 
      },
      options: {
        en: [
          'Saving round numbers only',
          'Automating transfers so you don\'t see them',
          'Keeping cash in a jar',
          'Saving only when you feel like it'
        ],
        fr: [
          'Épargner seulement des nombres ronds',
          'Automatiser les virements pour ne pas les voir',
          'Garder de l\'argent dans un pot',
          'Épargner seulement quand on en a envie'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Automation removes the temptation to spend money you planned to save by making it "invisible" in your decision-making.',
        fr: 'L\'automatisation supprime la tentation de dépenser l\'argent qu\'on prévoyait épargner en le rendant "invisible" dans la prise de décision.'
      },
      hint: {
        en: 'Think about reducing the mental effort required...',
        fr: 'Pensez à réduire l\'effort mental requis...'
      },
      xp: 20
    },
    {
      id: 'compound-savings',
      type: 'quiz',
      title: { en: 'Compound Interest in Savings', fr: 'Intérêts Composés dans l\'Épargne' },
      question: { 
        en: 'If you save $100/month at 5% annual interest, how much will you have after 10 years?', 
        fr: 'Si vous épargnez 100€/mois à 5% d\'intérêt annuel, combien aurez-vous après 10 ans ?' 
      },
      correctAnswer: { en: '$15,500', fr: '15500€' },
      acceptedAnswers: {
        en: ['15500', '$15500', '$15,500', 'fifteen thousand five hundred', '15.5k'],
        fr: ['15500', '15500€', '15 500€', 'quinze mille cinq cents', '15.5k']
      },
      explanation: {
        en: 'With compound interest, $100/month for 10 years becomes approximately $15,528. You contribute $12,000 but earn $3,528 in interest.',
        fr: 'Avec les intérêts composés, 100€/mois pendant 10 ans devient approximativement 15 528€. Vous contribuez 12 000€ mais gagnez 3 528€ en intérêts.'
      },
      hint: {
        en: 'Consider both your contributions and the interest earned...',
        fr: 'Considérez à la fois vos contributions et les intérêts gagnés...'
      },
      xp: 25
    },
    {
      id: 'savings-challenges',
      type: 'multiple_choice',
      title: { en: 'Saving Challenges', fr: 'Défis d\'Épargne' },
      question: { 
        en: 'What is the "52-week savings challenge"?', 
        fr: 'Qu\'est-ce que le "défi d\'épargne de 52 semaines" ?' 
      },
      options: {
        en: [
          'Save $52 every week for a year',
          'Save week number in dollars (week 1: $1, week 52: $52)',
          'Save 52% of your income',
          'Save for 52 different goals'
        ],
        fr: [
          'Épargner 52€ chaque semaine pendant un an',
          'Épargner le numéro de la semaine en euros (semaine 1: 1€, semaine 52: 52€)',
          'Épargner 52% de vos revenus',
          'Épargner pour 52 objectifs différents'
        ]
      },
      correct: 1,
      explanation: {
        en: 'The 52-week challenge involves saving the dollar amount equal to the week number (week 1 = $1, week 52 = $52), totaling $1,378.',
        fr: 'Le défi de 52 semaines consiste à épargner le montant en euros égal au numéro de la semaine (semaine 1 = 1€, semaine 52 = 52€), totalisant 1 378€.'
      },
      hint: {
        en: 'Think about gradually increasing amounts...',
        fr: 'Pensez à des montants qui augmentent graduellement...'
      },
      xp: 20
    },
    {
      id: 'action-challenge',
      type: 'action',
      title: { en: 'Saving Strategies Action Challenge', fr: 'Défi Action Stratégies d\'Épargne' },
      content: {
        en: {
          description: 'Implement proven saving strategies!',
          actions: [
            {
              id: 'saving_action_1',
              title: 'Set up automatic transfers',
              description: 'Set up automatic monthly transfers to your savings account',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'saving_action_2',
              title: 'Start a savings challenge',
              description: 'Begin a 52-week or 365-day savings challenge',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'saving_action_3',
              title: 'Find a high-yield account',
              description: 'Research and open a high-yield savings account',
              verification: 'manual',
              xp: 15
            }
          ]
        },
        fr: {
          description: 'Mettez en œuvre des stratégies d\'épargne éprouvées !',
          actions: [
            {
              id: 'saving_action_1',
              title: 'Configurer des virements automatiques',
              description: 'Configurez des virements mensuels automatiques vers votre compte épargne',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'saving_action_2',
              title: 'Commencer un défi d\'épargne',
              description: 'Commencez un défi d\'épargne de 52 semaines ou 365 jours',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'saving_action_3',
              title: 'Trouver un compte à haut rendement',
              description: 'Recherchez et ouvrez un compte épargne à haut rendement',
              verification: 'manual',
              xp: 15
            }
          ]
        }
      },
      validation: (data) => {
        const { automaticTransfers, challengeStarted, highYieldAccount } = data;
        if (automaticTransfers && challengeStarted && highYieldAccount) {
          return { isValid: true, message: 'Excellent saving setup!' };
        }
        return { isValid: false, message: 'Keep working on your saving strategies' };
      },
      xp: 20
    }
  ],

  analytics: {
    completionRate: 0.82,
    averageTime: 22,
    difficultyRating: 2.2,
    userSatisfaction: 4.5,
    retryRate: 0.16,
    dropoffPoints: ['automatic-savings', 'action-challenge'],
    popularFeatures: ['pay-yourself-first', 'automatic-savings', 'savings-challenges']
  }
};

export const getSavingStrategiesHelpers = () => ({
  calculateSavingsGoal: (income, percentage = 20) => {
    return (income * percentage) / 100;
  },
  
  suggestSavingsChallenge: (currentSavings, goal) => {
    const remaining = goal - currentSavings;
    if (remaining <= 1000) {
      return '52-week challenge';
    } else if (remaining <= 5000) {
      return '365-day challenge';
    } else {
      return 'Percentage-based challenge';
    }
  },
  
  trackSavingsProgress: (current, goal) => {
    const percentage = (current / goal) * 100;
    return {
      percentage: Math.min(percentage, 100),
      remaining: Math.max(goal - current, 0),
      status: percentage >= 100 ? 'complete' : percentage >= 50 ? 'halfway' : 'starting'
    };
  }
}); 