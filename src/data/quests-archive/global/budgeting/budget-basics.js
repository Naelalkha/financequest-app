import { FaCalculator, FaLightbulb, FaChartPie, FaCheckCircle } from 'react-icons/fa';

export const budgetBasics = {
  id: 'budget-basics',
  category: 'budgeting',
  difficulty: 'beginner',
  duration: 35,
  xp: 190,
  isPremium: false,
  order: 1,
  
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['essential', 'quick-win', 'most-popular', 'beginner-friendly'],
    relatedQuests: ['expense-tracking', 'emergency-fund-101', 'saving-strategies'],
    averageCompletionTime: 12,
    completionRate: 0.89,
    userRating: 4.8,
    featured: true
  },

  icons: {
    main: FaCalculator,
    steps: [FaLightbulb, FaChartPie, FaCheckCircle]
  },
  
  colors: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#FBBF24'
  },

  content: {
    en: {
      title: 'Budget Basics',
      description: 'Master the fundamentals of budgeting and take control of your money',
      longDescription: 'Learn the essential principles of budgeting, including the famous 50/30/20 rule, and discover how to create a simple but effective budget that works for your lifestyle.',
      objectives: [
        'Understand what a budget is and why it matters',
        'Learn the 50/30/20 budgeting rule',
        'Create your first simple budget',
        'Apply budgeting principles to real life'
      ],
      prerequisites: ['None - perfect for beginners!'],
      whatYouWillLearn: [
        'The psychology behind successful budgeting',
        'How to categorize expenses effectively',
        'Tools and apps to help you budget',
        'Common budgeting mistakes to avoid'
      ],
      realWorldApplication: 'You\'ll be able to create a personal budget, track your spending, and make informed financial decisions that align with your goals.'
    },
    fr: {
      title: 'Bases du Budget',
      description: 'Maîtrisez les fondamentaux du budget et prenez le contrôle de votre argent',
      longDescription: 'Apprenez les principes essentiels du budget, y compris la célèbre règle 50/30/20, et découvrez comment créer un budget simple mais efficace qui fonctionne pour votre style de vie.',
      objectives: [
        'Comprendre ce qu\'est un budget et pourquoi c\'est important',
        'Apprendre la règle budgétaire 50/30/20',
        'Créer votre premier budget simple',
        'Appliquer les principes budgétaires à la vie réelle'
      ],
      prerequisites: ['Aucun - parfait pour les débutants !'],
      whatYouWillLearn: [
        'La psychologie derrière un budget réussi',
        'Comment catégoriser les dépenses efficacement',
        'Outils et applications pour vous aider à budgéter',
        'Erreurs budgétaires courantes à éviter'
      ],
      realWorldApplication: 'Vous pourrez créer un budget personnel, suivre vos dépenses et prendre des décisions financières éclairées qui correspondent à vos objectifs.'
    }
  },

  rewards: {
    badge: {
      id: 'budget_beginner',
      name: { en: 'Budget Beginner', fr: 'Débutant Budget' },
      description: { 
        en: 'You\'ve taken your first step towards financial freedom!', 
        fr: 'Vous avez fait votre premier pas vers la liberté financière !' 
      },
      rarity: 'common',
      imageUrl: '/badges/budget-beginner.png'
    },
    unlocks: ['emergency-fund-101', 'expense-tracking'],
    bonusXP: {
      firstTime: 50,
      speedBonus: 25,
      perfectScore: 30
    }
  },

  steps: [
    {
      id: 'budget-intro',
      type: 'info',
      title: { en: 'What is a Budget?', fr: 'Qu\'est-ce qu\'un Budget ?' },
      content: {
        en: {
          text: 'A budget is simply a plan for your money. It helps you decide how to spend your income wisely.',
          funFact: 'Did you know? Only 32% of people maintain a monthly budget, yet those who do save 20% more on average!'
        },
        fr: {
          text: 'Un budget est simplement un plan pour votre argent. Il vous aide à décider comment dépenser vos revenus intelligemment.',
          funFact: 'Le saviez-vous ? Seulement 32% des gens tiennent un budget mensuel, mais ceux qui le font économisent 20% de plus en moyenne !'
        }
      },
      xp: 10
    },
    {
      id: 'budget-rule',
      type: 'quiz',
      title: { en: 'The 50/30/20 Rule', fr: 'La Règle 50/30/20' },
      content: {
        en: {
          question: 'What is the 50/30/20 rule?',
          options: [
            '50% savings, 30% needs, 20% wants',
            '50% needs, 30% wants, 20% savings',
            '50% wants, 30% savings, 20% needs',
            '50% needs, 30% savings, 20% wants'
          ],
          correctAnswer: 1,
          explanation: 'The 50/30/20 rule suggests spending 50% on needs (rent, food), 30% on wants (entertainment), and 20% on savings and debt repayment.',
          hint: 'Think about what takes up the biggest portion of most people\'s income...'
        },
        fr: {
          question: 'Qu\'est-ce que la règle 50/30/20 ?',
          options: [
            '50% épargne, 30% besoins, 20% envies',
            '50% besoins, 30% envies, 20% épargne',
            '50% envies, 30% épargne, 20% besoins',
            '50% besoins, 30% épargne, 20% envies'
          ],
          correctAnswer: 1,
          explanation: 'La règle 50/30/20 suggère de dépenser 50% pour les besoins (loyer, nourriture), 30% pour les envies (divertissement), et 20% pour l\'épargne et le remboursement des dettes.',
          hint: 'Pensez à ce qui prend la plus grande partie du revenu de la plupart des gens...'
        }
      },
      xp: 25
    },
    {
      id: 'budget-practice',
      type: 'interactive',
      title: { en: 'Create Your Budget', fr: 'Créez Votre Budget' },
      content: {
        en: {
          instructions: 'Drag and drop expenses into the correct categories: Needs, Wants, or Savings',
          items: [
            { name: 'Rent', category: 'needs' },
            { name: 'Netflix', category: 'wants' },
            { name: 'Emergency Fund', category: 'savings' },
            { name: 'Groceries', category: 'needs' },
            { name: 'Vacation', category: 'wants' },
            { name: 'Retirement', category: 'savings' }
          ]
        },
        fr: {
          instructions: 'Glissez et déposez les dépenses dans les bonnes catégories : Besoins, Envies ou Épargne',
          items: [
            { name: 'Loyer', category: 'needs' },
            { name: 'Netflix', category: 'wants' },
            { name: 'Fonds d\'urgence', category: 'savings' },
            { name: 'Épicerie', category: 'needs' },
            { name: 'Vacances', category: 'wants' },
            { name: 'Retraite', category: 'savings' }
          ]
        }
      },
      xp: 25
    },
    {
      id: 'budget-methods',
      type: 'multiple_choice',
      title: { en: 'Budget Methods Comparison', fr: 'Comparaison des Méthodes de Budget' },
      question: { 
        en: 'Which budgeting method involves allocating every dollar before spending?', 
        fr: 'Quelle méthode de budget implique d\'allouer chaque euro avant de le dépenser ?' 
      },
      options: {
        en: [
          '50/30/20 rule',
          'Zero-based budgeting',
          'Envelope method',
          'Pay yourself first'
        ],
        fr: [
          'Règle 50/30/20',
          'Budget base zéro',
          'Méthode des enveloppes',
          'Se payer en premier'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Zero-based budgeting means every dollar has a job before you spend it - income minus expenses should equal zero.',
        fr: 'Le budget base zéro signifie que chaque euro a un rôle avant que vous le dépensiez - revenus moins dépenses devrait égaler zéro.'
      },
      hint: {
        en: 'Think about starting from zero and assigning every dollar...',
        fr: 'Pensez à commencer de zéro et assigner chaque euro...'
      },
      xp: 20
    },
    {
      id: 'budget-tracking',
      type: 'multiple_choice',
      title: { en: 'Budget Tracking Tools', fr: 'Outils de Suivi de Budget' },
      question: { 
        en: 'What is the most important factor in choosing a budget tracking method?', 
        fr: 'Quel est le facteur le plus important pour choisir une méthode de suivi de budget ?' 
      },
      options: {
        en: [
          'It has the most features',
          'It costs the most money',
          'You will actually use it consistently',
          'It has the best reviews'
        ],
        fr: [
          'Elle a le plus de fonctionnalités',
          'Elle coûte le plus cher',
          'Vous l\'utiliserez réellement de façon constante',
          'Elle a les meilleures critiques'
        ]
      },
      correct: 2,
      explanation: {
        en: 'The best budget method is the one you\'ll stick to. Consistency matters more than complexity.',
        fr: 'La meilleure méthode de budget est celle à laquelle vous vous tiendrez. La constance importe plus que la complexité.'
      },
      hint: {
        en: 'Think about what makes habits stick...',
        fr: 'Pensez à ce qui fait tenir les habitudes...'
      },
      xp: 20
    },
    {
      id: 'budget-adjustments',
      type: 'quiz',
      title: { en: 'Budget Adjustments', fr: 'Ajustements de Budget' },
      question: { 
        en: 'If your income is $4,000/month using 50/30/20, how much should go to savings?', 
        fr: 'Si vos revenus sont 4000€/mois avec 50/30/20, combien devrait aller à l\'épargne ?' 
      },
      correctAnswer: { en: '$800', fr: '800€' },
      acceptedAnswers: {
        en: ['800', '$800', '800 dollars', 'eight hundred'],
        fr: ['800', '800€', '800 euros', 'huit cents']
      },
      explanation: {
        en: '20% of $4,000 = $800 for savings and debt repayment. This builds your financial foundation.',
        fr: '20% de 4000€ = 800€ pour l\'épargne et remboursement de dettes. Cela construit votre fondation financière.'
      },
      hint: {
        en: 'Calculate 20% of your total income...',
        fr: 'Calculez 20% de vos revenus totaux...'
      },
      xp: 25
    },
    {
      id: 'budget-psychology',
      type: 'checklist',
      title: { en: 'Budget Success Factors', fr: 'Facteurs de Succès du Budget' },
      items: {
        en: [
          'Start with realistic, achievable amounts',
          'Review and adjust monthly',
          'Include small amounts for fun spending',
          'Track actual vs. planned spending',
          'Celebrate small wins and improvements'
        ],
        fr: [
          'Commencer avec des montants réalistes et atteignables',
          'Réviser et ajuster mensuellement',
          'Inclure de petits montants pour le plaisir',
          'Suivre les dépenses réelles vs. planifiées',
          'Célébrer les petites victoires et améliorations'
        ]
      },
      explanation: {
        en: 'Successful budgeting is more about psychology than math. Start small, be consistent, and adjust as needed.',
        fr: 'Le budget réussi concerne plus la psychologie que les mathématiques. Commencez petit, soyez constant, et ajustez au besoin.'
      },
      xp: 25
    },
    {
      id: 'action-challenge',
      type: 'action',
      title: { en: 'Budget Action Challenge', fr: 'Défi Action Budget' },
      content: {
        en: {
          description: 'Create your first real budget using the 50/30/20 rule',
          actions: [
            {
              id: 'budget_action_1',
              title: 'Calculate your monthly income',
              description: 'Add up all your sources of income for one month',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'budget_action_2',
              title: 'List your essential expenses',
              description: 'Identify and list all your needs (50% of income)',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'budget_action_3',
              title: 'Plan your wants and savings',
              description: 'Allocate 30% to wants and 20% to savings',
              verification: 'manual',
              xp: 10
            }
          ]
        },
        fr: {
          description: 'Créez votre premier vrai budget en utilisant la règle 50/30/20',
          actions: [
            {
              id: 'budget_action_1',
              title: 'Calculez vos revenus mensuels',
              description: 'Additionnez toutes vos sources de revenus pour un mois',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'budget_action_2',
              title: 'Listez vos dépenses essentielles',
              description: 'Identifiez et listez tous vos besoins (50% des revenus)',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'budget_action_3',
              title: 'Planifiez vos envies et épargne',
              description: 'Allouez 30% aux envies et 20% à l\'épargne',
              verification: 'manual',
              xp: 10
            }
          ]
        }
      },
      validation: (data) => {
        const { income, needs, wants, savings } = data;
        const total = needs + wants + savings;
        const needsPercent = (needs / income) * 100;
        const wantsPercent = (wants / income) * 100;
        const savingsPercent = (savings / income) * 100;
        
        if (Math.abs(needsPercent - 50) <= 5 && 
            Math.abs(wantsPercent - 30) <= 5 && 
            Math.abs(savingsPercent - 20) <= 5) {
          return { isValid: true, message: 'Budget is balanced!' };
        }
        return { isValid: false, message: 'Budget needs adjustment' };
      },
      xp: 25
    }
  ],

  analytics: {
    completionRate: 0.89,
    averageTime: 12,
    difficultyRating: 2.1,
    userSatisfaction: 4.8,
    retryRate: 0.15,
    dropoffPoints: ['budget-rule', 'action-challenge'],
    popularFeatures: ['interactive-budget', '50-30-20-rule', 'real-world-application']
  }
};

export const getBudgetBasicsHelpers = () => ({
  validateBudget: (income, needs, wants, savings) => {
    const total = needs + wants + savings;
    if (Math.abs(total - income) > 0.01) {
      return { isValid: false, message: 'Total must equal income' };
    }
    return { isValid: true, message: 'Budget is valid' };
  },
  
  calculatePercentages: (income, needs, wants, savings) => ({
    needsPercent: (needs / income) * 100,
    wantsPercent: (wants / income) * 100,
    savingsPercent: (savings / income) * 100
  }),
  
  suggestAdjustments: (income, needs, wants, savings) => {
    const percentages = (income, needs, wants, savings);
    const suggestions = [];
    
    if (percentages.needsPercent > 55) {
      suggestions.push('Consider reducing essential expenses or increasing income');
    }
    if (percentages.wantsPercent > 35) {
      suggestions.push('Try to reduce discretionary spending');
    }
    if (percentages.savingsPercent < 15) {
      suggestions.push('Aim to increase savings for better financial security');
    }
    
    return suggestions;
  }
}); 