import { FaPiggyBank, FaExclamationTriangle, FaCalculator, FaCheckCircle } from 'react-icons/fa';

export const emergencyFund101 = {
  id: 'emergency-fund-101',
  category: 'savings',
  difficulty: 'beginner',
  duration: 40,
  xp: 205,
  isPremium: false,
  order: 2,
  
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['essential', 'safety', 'beginner-friendly', 'foundation'],
    relatedQuests: ['budget-basics', 'saving-strategies', 'investing-basics'],
    averageCompletionTime: 18,
    completionRate: 0.87,
    userRating: 4.7,
    featured: true
  },

  icons: {
    main: FaPiggyBank,
    steps: [FaExclamationTriangle, FaCalculator, FaCheckCircle]
  },
  
  colors: {
    primary: '#059669',
    secondary: '#10B981',
    accent: '#F59E0B'
  },

  content: {
    en: {
      title: 'Emergency Fund 101',
      description: 'Learn why you need an emergency fund and how to build one',
      longDescription: 'Build your financial safety net by understanding emergency funds, calculating your target amount, and implementing strategies to reach your goal quickly.',
      objectives: [
        'Understand the importance of emergency funds',
        'Calculate your ideal emergency fund size',
        'Learn strategies to build your fund quickly',
        'Know where to keep your emergency money'
      ],
      prerequisites: ['Basic understanding of budgeting'],
      whatYouWillLearn: [
        'Why emergency funds are crucial for financial security',
        'How to calculate your personal emergency fund target',
        'Effective strategies to build your fund faster',
        'Best places to store your emergency money'
      ],
      realWorldApplication: 'You\'ll have a clear plan to build your emergency fund and protect yourself from financial emergencies.'
    },
    fr: {
      title: 'Fonds d\'Urgence 101',
      description: 'Apprenez pourquoi vous avez besoin d\'un fonds d\'urgence et comment en créer un',
      longDescription: 'Construisez votre filet de sécurité financier en comprenant les fonds d\'urgence, en calculant votre montant cible et en mettant en œuvre des stratégies pour atteindre votre objectif rapidement.',
      objectives: [
        'Comprendre l\'importance des fonds d\'urgence',
        'Calculer la taille idéale de votre fonds',
        'Apprendre des stratégies pour construire rapidement',
        'Savoir où garder votre argent d\'urgence'
      ],
      prerequisites: ['Compréhension de base du budget'],
      whatYouWillLearn: [
        'Pourquoi les fonds d\'urgence sont cruciaux pour la sécurité financière',
        'Comment calculer votre objectif personnel de fonds d\'urgence',
        'Stratégies efficaces pour construire votre fonds plus rapidement',
        'Meilleurs endroits pour stocker votre argent d\'urgence'
      ],
      realWorldApplication: 'Vous aurez un plan clair pour construire votre fonds d\'urgence et vous protéger des urgences financières.'
    }
  },

  rewards: {
    badge: {
      id: 'safety_net',
      name: { en: 'Safety Net', fr: 'Filet de Sécurité' },
      description: {
        en: 'You\'ve built your financial safety net!',
        fr: 'Vous avez construit votre filet de sécurité financier !'
      },
      rarity: 'common',
      imageUrl: '/badges/safety-net.png'
    },
    unlocks: ['saving-strategies', 'investing-basics'],
    bonusXP: {
      firstTime: 50,
      speedBonus: 25,
      perfectScore: 30
    }
  },

  steps: [
    {
      id: 'emergency-intro',
      type: 'info',
      title: { en: 'Why Emergency Funds Matter', fr: 'Pourquoi les Fonds d\'Urgence Importent' },
      content: {
        en: {
          text: 'An emergency fund protects you from unexpected expenses like medical bills, car repairs, or job loss.',
          funFact: 'Fun fact: 40% of Americans can\'t cover a $400 emergency expense!'
        },
        fr: {
          text: 'Un fonds d\'urgence vous protège des dépenses imprévues comme les frais médicaux, réparations auto, ou perte d\'emploi.',
          funFact: 'Fait amusant : 40% des Américains ne peuvent pas couvrir une dépense d\'urgence de 400$ !'
        }
      },
      xp: 15
    },
    {
      id: 'emergency-size',
      type: 'quiz',
      title: { en: 'How Much Do You Need?', fr: 'Combien Avez-vous Besoin ?' },
      content: {
        en: {
          question: 'How much should your emergency fund typically be?',
          options: [
            '1 month of expenses',
            '3-6 months of expenses',
            '1 year of expenses',
            '$1,000 flat amount'
          ],
          correctAnswer: 1,
          explanation: 'Most experts recommend 3-6 months of living expenses. Start with 3 months if you have stable income, 6 months if freelancing.',
          hint: 'Think about how long you might need to find a new job...'
        },
        fr: {
          question: 'Combien devrait typiquement être votre fonds d\'urgence ?',
          options: [
            '1 mois de dépenses',
            '3-6 mois de dépenses',
            '1 an de dépenses',
            '1000€ montant fixe'
          ],
          correctAnswer: 1,
          explanation: 'La plupart des experts recommandent 3-6 mois de dépenses. Commencez avec 3 mois si revenu stable, 6 mois si freelance.',
          hint: 'Pensez au temps nécessaire pour trouver un nouvel emploi...'
        }
      },
      xp: 25
    },
    {
      id: 'emergency-calculator',
      type: 'interactive',
      title: { en: 'Calculate Your Emergency Fund', fr: 'Calculez Votre Fonds d\'Urgence' },
      content: {
        en: {
          instructions: 'Add up your essential monthly expenses and multiply by your target months.',
          calculator: {
            fields: [
              { name: 'rent', label: 'Rent/Mortgage', type: 'number' },
              { name: 'utilities', label: 'Utilities', type: 'number' },
              { name: 'food', label: 'Food', type: 'number' },
              { name: 'transportation', label: 'Transportation', type: 'number' },
              { name: 'insurance', label: 'Insurance', type: 'number' },
              { name: 'months', label: 'Target Months (3-6)', type: 'number', min: 3, max: 6 }
            ],
            formula: '(rent + utilities + food + transportation + insurance) * months'
          },
          explanation: 'Remember to include only essential expenses like rent, utilities, food, and transportation.'
        },
        fr: {
          instructions: 'Additionnez vos dépenses mensuelles essentielles et multipliez par vos mois cibles.',
          calculator: {
            fields: [
              { name: 'rent', label: 'Loyer/Hypothèque', type: 'number' },
              { name: 'utilities', label: 'Services Publics', type: 'number' },
              { name: 'food', label: 'Nourriture', type: 'number' },
              { name: 'transportation', label: 'Transport', type: 'number' },
              { name: 'insurance', label: 'Assurance', type: 'number' },
              { name: 'months', label: 'Mois Cibles (3-6)', type: 'number', min: 3, max: 6 }
            ],
            formula: '(loyer + services + nourriture + transport + assurance) * mois'
          },
          explanation: 'N\'incluez que les dépenses essentielles comme loyer, services publics, nourriture et transport.'
        }
      },
      xp: 25
    },
    {
      id: 'emergency-priorities',
      type: 'multiple_choice',
      title: { en: 'Emergency Fund Priority', fr: 'Priorité du Fonds d\'Urgence' },
      question: { 
        en: 'When should you prioritize building an emergency fund?', 
        fr: 'Quand devriez-vous prioriser la construction d\'un fonds d\'urgence ?' 
      },
      options: {
        en: [
          'After paying off all debt',
          'Before investing in retirement',
          'Only after buying a house',
          'After building other investments'
        ],
        fr: [
          'Après avoir remboursé toutes les dettes',
          'Avant d\'investir pour la retraite',
          'Seulement après avoir acheté une maison',
          'Après avoir construit d\'autres investissements'
        ]
      },
      correct: 1,
      explanation: {
        en: 'An emergency fund should be your first financial priority (after high-interest debt) because it prevents you from going into debt for emergencies.',
        fr: 'Un fonds d\'urgence devrait être votre première priorité financière (après les dettes à haut intérêt) car il évite de s\'endetter pour les urgences.'
      },
      hint: {
        en: 'Think about what protects you from financial emergencies...',
        fr: 'Pensez à ce qui vous protège des urgences financières...'
      },
      xp: 20
    },
    {
      id: 'where-to-keep',
      type: 'multiple_choice',
      title: { en: 'Where to Keep Emergency Funds', fr: 'Où Garder les Fonds d\'Urgence' },
      question: { 
        en: 'Where is the best place to keep your emergency fund?', 
        fr: 'Où est le meilleur endroit pour garder votre fonds d\'urgence ?' 
      },
      options: {
        en: [
          'In the stock market for higher returns',
          'In a high-yield savings account',
          'Under your mattress in cash',
          'In cryptocurrency'
        ],
        fr: [
          'En bourse pour des rendements plus élevés',
          'Dans un compte d\'épargne à haut rendement',
          'Sous votre matelas en liquide',
          'En cryptomonnaie'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Emergency funds should be liquid and safe. High-yield savings accounts offer safety, liquidity, and modest returns.',
        fr: 'Les fonds d\'urgence doivent être liquides et sûrs. Les comptes d\'épargne à haut rendement offrent sécurité, liquidité et rendements modestes.'
      },
      hint: {
        en: 'Think about accessibility and safety, not high returns...',
        fr: 'Pensez à l\'accessibilité et la sécurité, pas aux hauts rendements...'
      },
      xp: 20
    },
    {
      id: 'emergency-scenarios',
      type: 'checklist',
      title: { en: 'Valid Emergency Scenarios', fr: 'Scénarios d\'Urgence Valides' },
      items: {
        en: [
          'Job loss or sudden income reduction',
          'Major medical expenses not covered by insurance',
          'Essential home repairs (roof, plumbing, heating)',
          'Car repairs needed for work commute',
          'Family emergency requiring travel'
        ],
        fr: [
          'Perte d\'emploi ou réduction soudaine de revenus',
          'Dépenses médicales majeures non couvertes',
          'Réparations essentielles de maison (toit, plomberie, chauffage)',
          'Réparations auto nécessaires pour le travail',
          'Urgence familiale nécessitant un voyage'
        ]
      },
      explanation: {
        en: 'True emergencies are unexpected, necessary, and urgent expenses. Vacations and wants don\'t qualify.',
        fr: 'Les vraies urgences sont des dépenses imprévues, nécessaires et urgentes. Les vacances et envies ne qualifient pas.'
      },
      xp: 25
    },
    {
      id: 'building-strategy',
      type: 'quiz',
      title: { en: 'Emergency Fund Building Strategy', fr: 'Stratégie de Construction de Fonds d\'Urgence' },
      question: { 
        en: 'If you can save $200/month, how long will it take to build a $6,000 emergency fund?', 
        fr: 'Si vous pouvez épargner 200€/mois, combien de temps faudra-t-il pour construire un fonds d\'urgence de 6000€ ?' 
      },
      correctAnswer: { en: '30 months', fr: '30 mois' },
      acceptedAnswers: {
        en: ['30', '30 months', 'thirty months', '2.5 years', '2 and half years'],
        fr: ['30', '30 mois', 'trente mois', '2,5 ans', '2 ans et demi']
      },
      explanation: {
        en: '$6,000 ÷ $200/month = 30 months (2.5 years). Start small and be consistent!',
        fr: '6000€ ÷ 200€/mois = 30 mois (2,5 ans). Commencez petit et soyez constant !'
      },
      hint: {
        en: 'Divide the total by monthly savings amount...',
        fr: 'Divisez le total par le montant d\'épargne mensuel...'
      },
      xp: 25
    },
    {
      id: 'action-challenge',
      type: 'action',
      title: { en: 'Emergency Fund Action Challenge', fr: 'Défi Action Fonds d\'Urgence' },
      content: {
        en: {
          description: 'Start building your emergency fund today!',
          actions: [
            {
              id: 'emergency_action_1',
              title: 'Open a dedicated savings account',
              description: 'Open a high-yield savings account specifically for your emergency fund',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'emergency_action_2',
              title: 'Set up automatic transfers',
              description: 'Set up automatic monthly transfers of $50-100 to your emergency fund',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'emergency_action_3',
              title: 'Save your first $500',
              description: 'Reach your first $500 milestone in your emergency fund',
              verification: 'manual',
              xp: 15
            }
          ]
        },
        fr: {
          description: 'Commencez à construire votre fonds d\'urgence aujourd\'hui !',
          actions: [
            {
              id: 'emergency_action_1',
              title: 'Ouvrir un compte épargne dédié',
              description: 'Ouvrez un compte épargne à haut rendement spécifiquement pour votre fonds d\'urgence',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'emergency_action_2',
              title: 'Configurer des virements automatiques',
              description: 'Configurez des virements mensuels automatiques de 50-100€ vers votre fonds d\'urgence',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'emergency_action_3',
              title: 'Épargner vos premiers 500€',
              description: 'Atteignez votre premier objectif de 500€ dans votre fonds d\'urgence',
              verification: 'manual',
              xp: 15
            }
          ]
        }
      },
      validation: (data) => {
        const { accountOpened, transfersSet, firstMilestone } = data;
        if (accountOpened && transfersSet && firstMilestone) {
          return { isValid: true, message: 'Great start on your emergency fund!' };
        }
        return { isValid: false, message: 'Keep working on your emergency fund goals' };
      },
      xp: 20
    }
  ],

  analytics: {
    completionRate: 0.87,
    averageTime: 18,
    difficultyRating: 2.0,
    userSatisfaction: 4.7,
    retryRate: 0.12,
    dropoffPoints: ['emergency-calculator', 'action-challenge'],
    popularFeatures: ['emergency-calculator', 'safety-net', 'automatic-savings']
  }
};

export const getEmergencyFundHelpers = () => ({
  calculateEmergencyFund: (monthlyExpenses, months = 6) => {
    return monthlyExpenses * months;
  },
  
  suggestSavingsRate: (targetAmount, currentSavings, timeframe = 12) => {
    const remaining = targetAmount - currentSavings;
    return Math.ceil(remaining / timeframe);
  },
  
  trackProgress: (currentAmount, targetAmount) => {
    const percentage = (currentAmount / targetAmount) * 100;
    return {
      percentage: Math.min(percentage, 100),
      remaining: Math.max(targetAmount - currentAmount, 0),
      status: percentage >= 100 ? 'complete' : percentage >= 50 ? 'halfway' : 'starting'
    };
  }
}); 