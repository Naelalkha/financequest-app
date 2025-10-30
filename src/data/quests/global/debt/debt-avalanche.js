import { FaChartLine, FaLightbulb, FaCheckCircle } from 'react-icons/fa';

export const debtAvalanche = {
  id: 'debt-avalanche',
  category: 'credit',
  difficulty: 'intermediate',
  duration: 45,
  xp: 225,
  isPremium: false,
  order: 4,
  
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['debt', 'strategy', 'intermediate'],
    relatedQuests: ['credit-score-basics', 'budget-basics'],
    averageCompletionTime: 18,
    completionRate: 0.78,
    userRating: 4.4,
    featured: false
  },

  icons: {
    main: FaChartLine,
    steps: [FaLightbulb, FaCheckCircle]
  },
  
  colors: {
    primary: '#DC2626',
    secondary: '#EF4444',
    accent: '#F59E0B'
  },

  content: {
    en: {
      title: 'Debt Avalanche Method',
      description: 'Learn the most efficient way to pay off multiple debts',
      longDescription: 'Master the debt avalanche method to pay off your debts in the most cost-effective way possible.',
      objectives: [
        'Understand the debt avalanche method',
        'Learn how to prioritize debts',
        'Create a debt payoff plan',
        'Track your progress effectively'
      ],
      prerequisites: ['Basic understanding of debt and interest'],
      whatYouWillLearn: [
        'How to calculate total interest costs',
        'Debt prioritization strategies',
        'Progress tracking methods',
        'Motivation techniques for debt payoff'
      ],
      realWorldApplication: 'You\'ll have a clear plan to pay off your debts efficiently and save money on interest.'
    },
    fr: {
      title: 'Méthode de l\'Avalanche de Dette',
      description: 'Apprenez la méthode la plus efficace pour rembourser plusieurs dettes',
      longDescription: 'Maîtrisez la méthode de l\'avalanche de dette pour rembourser vos dettes de la manière la plus rentable possible.',
      objectives: [
        'Comprendre la méthode de l\'avalanche de dette',
        'Apprendre comment prioriser les dettes',
        'Créer un plan de remboursement',
        'Suivre efficacement vos progrès'
      ],
      prerequisites: ['Compréhension de base de la dette et des intérêts'],
      whatYouWillLearn: [
        'Comment calculer les coûts totaux d\'intérêt',
        'Stratégies de priorisation des dettes',
        'Méthodes de suivi des progrès',
        'Techniques de motivation pour le remboursement'
      ],
      realWorldApplication: 'Vous aurez un plan clair pour rembourser vos dettes efficacement et économiser sur les intérêts.'
    }
  },

  rewards: {
    badge: {
      id: 'debt_avalanche_badge',
      name: { en: 'Debt Avalanche Master', fr: 'Maître de l\'Avalanche de Dette' },
      description: {
        en: 'You\'ve mastered the debt avalanche method!',
        fr: 'Vous avez maîtrisé la méthode de l\'avalanche de dette !'
      },
      rarity: 'common',
      imageUrl: '/badges/debt-avalanche.png'
    },
    unlocks: ['investing-basics', 'money-mindset'],
    bonusXP: {
      firstTime: 45,
      speedBonus: 20,
      perfectScore: 25
    }
  },

  steps: [
    {
      id: 'debt-intro',
      type: 'info',
      title: { en: 'What is Debt Avalanche?', fr: 'Qu\'est-ce que l\'Avalanche de Dette ?' },
      content: {
        en: {
          text: 'The debt avalanche method prioritizes paying off debts with the highest interest rates first.',
          funFact: 'Using the avalanche method can save you thousands in interest compared to minimum payments!'
        },
        fr: {
          text: 'La méthode de l\'avalanche de dette priorise le remboursement des dettes avec les taux d\'intérêt les plus élevés en premier.',
          funFact: 'Utiliser la méthode de l\'avalanche peut vous faire économiser des milliers en intérêts par rapport aux paiements minimums !'
        }
      },
      xp: 15
    },
    {
      id: 'avalanche-vs-snowball',
      type: 'multiple_choice',
      title: { en: 'Avalanche vs Snowball Method', fr: 'Méthode Avalanche vs Boule de Neige' },
      question: { 
        en: 'What is the main difference between debt avalanche and debt snowball methods?', 
        fr: 'Quelle est la principale différence entre les méthodes avalanche et boule de neige ?' 
      },
      options: {
        en: [
          'Avalanche targets highest interest rates, snowball targets smallest balances',
          'Avalanche targets smallest balances, snowball targets highest rates',
          'They are the same method',
          'Avalanche is for credit cards, snowball is for loans'
        ],
        fr: [
          'Avalanche cible les taux les plus élevés, boule de neige cible les plus petits soldes',
          'Avalanche cible les plus petits soldes, boule de neige cible les taux élevés',
          'C\'est la même méthode',
          'Avalanche pour cartes, boule de neige pour prêts'
        ]
      },
      correct: 0,
      explanation: {
        en: 'Debt avalanche prioritizes highest interest rates (saves more money), while debt snowball prioritizes smallest balances (provides psychological wins).',
        fr: 'L\'avalanche de dette priorise les taux d\'intérêt les plus élevés (économise plus d\'argent), tandis que la boule de neige priorise les plus petits soldes (procure des victoires psychologiques).'
      },
      hint: {
        en: 'Think about what saves the most money vs. what feels most motivating...',
        fr: 'Pensez à ce qui économise le plus d\'argent vs. ce qui est le plus motivant...'
      },
      xp: 20
    },
    {
      id: 'debt-prioritization',
      type: 'quiz',
      title: { en: 'Debt Prioritization', fr: 'Priorisation des Dettes' },
      question: { 
        en: 'You have: Credit Card A (18% APR, $2,000), Credit Card B (24% APR, $1,000), Student Loan (6% APR, $10,000). Which should you pay first with debt avalanche?', 
        fr: 'Vous avez: Carte A (18% TAP, 2000€), Carte B (24% TAP, 1000€), Prêt étudiant (6% TAP, 10000€). Laquelle payer en premier avec l\'avalanche ?' 
      },
      correctAnswer: { en: 'Credit Card B', fr: 'Carte B' },
      acceptedAnswers: {
        en: ['credit card b', 'card b', 'b', '24%', 'highest rate'],
        fr: ['carte b', 'carte de crédit b', 'b', '24%', 'taux le plus élevé']
      },
      explanation: {
        en: 'Credit Card B has the highest interest rate at 24%, so it should be prioritized first regardless of the balance amount.',
        fr: 'La Carte B a le taux d\'intérêt le plus élevé à 24%, donc elle devrait être priorisée en premier indépendamment du montant du solde.'
      },
      hint: {
        en: 'Look for the highest interest rate...',
        fr: 'Cherchez le taux d\'intérêt le plus élevé...'
      },
      xp: 25
    },
    {
      id: 'minimum-payments',
      type: 'multiple_choice',
      title: { en: 'Minimum Payment Strategy', fr: 'Stratégie de Paiement Minimum' },
      question: { 
        en: 'When using debt avalanche, what should you do with debts that are not your highest priority?', 
        fr: 'Quand vous utilisez l\'avalanche de dette, que devriez-vous faire avec les dettes qui ne sont pas votre priorité ?' 
      },
      options: {
        en: [
          'Stop paying them completely',
          'Pay only minimum payments',
          'Pay extra amounts randomly',
          'Close the accounts immediately'
        ],
        fr: [
          'Arrêter de les payer complètement',
          'Payer seulement les paiements minimums',
          'Payer des montants extra au hasard',
          'Fermer les comptes immédiatement'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Continue making minimum payments on all debts to avoid penalties, while putting all extra money toward the highest interest debt.',
        fr: 'Continuez à faire les paiements minimums sur toutes les dettes pour éviter les pénalités, tout en mettant tout l\'argent extra vers la dette à plus haut intérêt.'
      },
      hint: {
        en: 'Think about avoiding late fees while focusing extra payments...',
        fr: 'Pensez à éviter les frais de retard tout en concentrant les paiements extra...'
      },
      xp: 20
    },
    {
      id: 'avalanche-calculator',
      type: 'checklist',
      title: { en: 'Debt Avalanche Setup', fr: 'Configuration Avalanche de Dette' },
      items: {
        en: [
          'List all debts with current balances',
          'Record interest rates (APR) for each debt',
          'Note minimum payment amounts',
          'Calculate total available monthly payment',
          'Prioritize debts from highest to lowest rate'
        ],
        fr: [
          'Lister toutes les dettes avec soldes actuels',
          'Enregistrer les taux d\'intérêt (TAP) pour chaque dette',
          'Noter les montants de paiement minimum',
          'Calculer le paiement mensuel total disponible',
          'Prioriser les dettes du taux le plus élevé au plus bas'
        ]
      },
      explanation: {
        en: 'Proper setup is crucial for debt avalanche success. Having all the data organized helps you stay focused and track progress.',
        fr: 'Une configuration appropriée est cruciale pour le succès de l\'avalanche de dette. Avoir toutes les données organisées vous aide à rester concentré et suivre les progrès.'
      },
      xp: 25
    },
    {
      id: 'debt-consolidation',
      type: 'multiple_choice',
      title: { en: 'Debt Consolidation vs Avalanche', fr: 'Consolidation vs Avalanche' },
      question: { 
        en: 'When might debt consolidation be better than the debt avalanche method?', 
        fr: 'Quand la consolidation de dette pourrait-elle être meilleure que la méthode avalanche ?' 
      },
      options: {
        en: [
          'When you can get a much lower interest rate',
          'When you have too many payments to track',
          'When you qualify for a balance transfer',
          'All of the above'
        ],
        fr: [
          'Quand vous pouvez obtenir un taux beaucoup plus bas',
          'Quand vous avez trop de paiements à suivre',
          'Quand vous qualifiez pour un transfert de solde',
          'Toutes les réponses ci-dessus'
        ]
      },
      correct: 3,
      explanation: {
        en: 'Debt consolidation can be beneficial when it reduces complexity, lowers interest rates, or makes payments more manageable.',
        fr: 'La consolidation de dette peut être bénéfique quand elle réduit la complexité, diminue les taux d\'intérêt, ou rend les paiements plus gérables.'
      },
      hint: {
        en: 'Consider all the potential benefits of simplification...',
        fr: 'Considérez tous les avantages potentiels de la simplification...'
      },
      xp: 20
    },
    {
      id: 'psychological-factors',
      type: 'multiple_choice',
      title: { en: 'Psychology of Debt Repayment', fr: 'Psychologie du Remboursement de Dette' },
      question: { 
        en: 'What is the main psychological challenge of the debt avalanche method?', 
        fr: 'Quel est le principal défi psychologique de la méthode avalanche de dette ?' 
      },
      options: {
        en: [
          'It requires too much math',
          'Progress feels slow on large, high-interest debts',
          'It costs more than other methods',
          'It only works for credit cards'
        ],
        fr: [
          'Elle demande trop de mathématiques',
          'Les progrès semblent lents sur de grosses dettes à haut intérêt',
          'Elle coûte plus que d\'autres méthodes',
          'Elle ne fonctionne que pour les cartes de crédit'
        ]
      },
      correct: 1,
      explanation: {
        en: 'The avalanche method can feel discouraging because you might not see dramatic balance reductions quickly, especially on large debts.',
        fr: 'La méthode avalanche peut sembler décourageante car vous pourriez ne pas voir de réductions dramatiques de solde rapidement, surtout sur de grosses dettes.'
      },
      hint: {
        en: 'Think about what keeps people motivated during debt repayment...',
        fr: 'Pensez à ce qui garde les gens motivés pendant le remboursement de dette...'
      },
      xp: 20
    },
    {
      id: 'action-challenge',
      type: 'action',
      title: { en: 'Debt Avalanche Action Challenge', fr: 'Défi Action Avalanche de Dette' },
      content: {
        en: {
          description: 'Implement the debt avalanche method!',
          actions: [
            {
              id: 'debt-avalanche_action_1',
              title: 'List all your debts',
              description: 'Create a complete list of all your debts with balances and interest rates',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'debt-avalanche_action_2',
              title: 'Prioritize by interest rate',
              description: 'Order your debts from highest to lowest interest rate',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'debt-avalanche_action_3',
              title: 'Create payment plan',
              description: 'Set up extra payments on your highest interest debt',
              verification: 'manual',
              xp: 15
            }
          ]
        },
        fr: {
          description: 'Mettez en œuvre la méthode de l\'avalanche de dette !',
          actions: [
            {
              id: 'debt-avalanche_action_1',
              title: 'Lister toutes vos dettes',
              description: 'Créez une liste complète de toutes vos dettes avec soldes et taux d\'intérêt',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'debt-avalanche_action_2',
              title: 'Prioriser par taux d\'intérêt',
              description: 'Classez vos dettes du taux d\'intérêt le plus élevé au plus bas',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'debt-avalanche_action_3',
              title: 'Créer un plan de paiement',
              description: 'Configurez des paiements supplémentaires sur votre dette au taux le plus élevé',
              verification: 'manual',
              xp: 15
            }
          ]
        }
      },
      validation: (data) => {
        const { debtsListed, prioritized, paymentPlan } = data;
        if (debtsListed && prioritized && paymentPlan) {
          return { isValid: true, message: 'Great debt avalanche setup!' };
        }
        return { isValid: false, message: 'Keep working on your debt payoff plan' };
      },
      xp: 20
    }
  ],

  analytics: {
    completionRate: 0.78,
    averageTime: 18,
    difficultyRating: 2.8,
    userSatisfaction: 4.4,
    retryRate: 0.20,
    dropoffPoints: ['debt-intro', 'action-challenge'],
    popularFeatures: ['debt-prioritization', 'interest-calculator', 'payment-planning']
  }
};

export const getdebtAvalancheHelpers = () => ({
  calculateTotalInterest: (debts) => {
    return debts.reduce((total, debt) => {
      return total + (debt.balance * debt.interestRate / 100);
    }, 0);
  },
  
  prioritizeDebts: (debts) => {
    return debts.sort((a, b) => b.interestRate - a.interestRate);
  },
  
  estimatePayoffTime: (totalDebt, monthlyPayment, interestRate) => {
    // Simplified calculation
    const monthlyInterest = interestRate / 100 / 12;
    const months = Math.log(monthlyPayment / (monthlyPayment - totalDebt * monthlyInterest)) / Math.log(1 + monthlyInterest);
    return Math.ceil(months);
  }
}); 