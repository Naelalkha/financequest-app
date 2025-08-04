import { FaChartPie, FaSearchDollar, FaCheckCircle } from 'react-icons/fa';

export const expenseTracking = {
  id: 'expense-tracking',
  category: 'budgeting',
  difficulty: 'beginner',
  duration: 40,
  xp: 205,
  isPremium: false,
  order: 4,
  
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['tracking', 'budgeting', 'beginner-friendly', 'practical'],
    relatedQuests: ['budget-basics', 'saving-strategies', 'money-mindset'],
    averageCompletionTime: 16,
    completionRate: 0.84,
    userRating: 4.6,
    featured: false
  },

  icons: {
    main: FaChartPie,
    steps: [FaSearchDollar, FaCheckCircle]
  },
  
  colors: {
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#F59E0B'
  },

  content: {
    en: {
      title: 'Smart Expense Tracking',
      description: 'Master the art of tracking where your money goes',
      longDescription: 'Learn different methods to track your expenses, identify spending patterns, and build better financial habits.',
      objectives: [
        'Learn different tracking methods',
        'Identify spending patterns',
        'Find areas to cut costs',
        'Build better spending habits'
      ],
      prerequisites: ['Basic budgeting knowledge'],
      whatYouWillLearn: [
        'How to use apps and spreadsheets for tracking',
        'How to spot spending leaks',
        'How to set up a tracking routine',
        'How to analyze your spending data'
      ],
      realWorldApplication: 'You will be able to track your expenses and use the data to make smarter financial decisions.'
    },
    fr: {
      title: 'Suivi Intelligent des Dépenses',
      description: 'Maîtrisez l\'art de suivre où va votre argent',
      longDescription: 'Apprenez différentes méthodes pour suivre vos dépenses, identifier les habitudes et créer de meilleures routines financières.',
      objectives: [
        'Apprendre différentes méthodes de suivi',
        'Identifier les habitudes de dépenses',
        'Trouver où réduire les coûts',
        'Créer de meilleures habitudes'
      ],
      prerequisites: ['Connaissance basique du budget'],
      whatYouWillLearn: [
        'Utiliser des apps et tableurs pour le suivi',
        'Repérer les fuites de dépenses',
        'Mettre en place une routine de suivi',
        'Analyser vos données de dépenses'
      ],
      realWorldApplication: 'Vous pourrez suivre vos dépenses et utiliser les données pour prendre de meilleures décisions.'
    }
  },

  rewards: {
    badge: {
      id: 'expense_detective',
      name: { en: 'Expense Detective', fr: 'Détective des Dépenses' },
      description: {
        en: 'You\'ve mastered expense tracking!',
        fr: 'Vous avez maîtrisé le suivi des dépenses !'
      },
      rarity: 'common',
      imageUrl: '/badges/expense-detective.png'
    },
    unlocks: ['saving-strategies', 'money-mindset'],
    bonusXP: {
      firstTime: 40,
      speedBonus: 20,
      perfectScore: 25
    }
  },

  steps: [
    {
      id: 'tracking-intro',
      type: 'info',
      title: { en: 'Why Track Expenses?', fr: 'Pourquoi Suivre les Dépenses ?' },
      content: {
        en: {
          text: 'You can\'t manage what you don\'t measure. Tracking reveals surprising spending patterns!',
          funFact: 'People who track expenses save an average of $500/month just by being aware!'
        },
        fr: {
          text: 'On ne peut pas gérer ce qu\'on ne mesure pas. Le suivi révèle des habitudes surprenantes !',
          funFact: 'Les gens qui suivent leurs dépenses économisent en moyenne 500€/mois juste en étant conscients !'
        }
      },
      xp: 15
    },
    {
      id: 'latte-factor',
      type: 'quiz',
      title: { en: 'The Latte Factor', fr: 'Le Facteur Latte' },
      content: {
        en: {
          question: 'What\'s the "latte factor" in personal finance?',
          options: [
            'Coffee addiction costs',
            'Small daily expenses that add up',
            'Morning routine expenses',
            'Caffeine budget category'
          ],
          correctAnswer: 1,
          explanation: 'The "latte factor" refers to small, recurring expenses that seem insignificant but add up to large amounts over time.',
          hint: 'It\'s not just about coffee...'
        },
        fr: {
          question: 'Qu\'est-ce que le "facteur latte" en finance personnelle ?',
          options: [
            'Coûts d\'addiction au café',
            'Petites dépenses quotidiennes qui s\'accumulent',
            'Dépenses de routine matinale',
            'Catégorie budget caféine'
          ],
          correctAnswer: 1,
          explanation: 'Le "facteur latte" désigne les petites dépenses récurrentes qui semblent insignifiantes mais s\'accumulent avec le temps.',
          hint: 'Ce n\'est pas juste à propos du café...'
        }
      },
      xp: 25
    },
    {
      id: 'money-leaks',
      type: 'interactive',
      title: { en: 'Find Your Money Leaks', fr: 'Trouvez Vos Fuites d\'Argent' },
      content: {
        en: {
          instructions: 'Review your last month\'s spending and identify 3 areas where you spent more than expected.',
          items: [
            { name: 'Subscriptions', category: 'leak' },
            { name: 'Dining Out', category: 'leak' },
            { name: 'Impulse Shopping', category: 'leak' },
            { name: 'Convenience Fees', category: 'leak' },
            { name: 'Essential Groceries', category: 'necessary' },
            { name: 'Transportation', category: 'necessary' }
          ],
          explanation: 'Common money leaks: subscriptions, dining out, impulse shopping, convenience fees.'
        },
        fr: {
          instructions: 'Examinez vos dépenses du mois dernier et identifiez 3 domaines où vous avez dépensé plus que prévu.',
          items: [
            { name: 'Abonnements', category: 'leak' },
            { name: 'Restaurants', category: 'leak' },
            { name: 'Achats Impulsifs', category: 'leak' },
            { name: 'Frais de Commodité', category: 'leak' },
            { name: 'Épicerie Essentielle', category: 'necessary' },
            { name: 'Transport', category: 'necessary' }
          ],
          explanation: 'Fuites communes : abonnements, restaurants, achats impulsifs, frais de commodité.'
        }
      },
      xp: 25
    },
    {
      id: 'tracking-methods',
      type: 'multiple_choice',
      title: { en: 'Best Tracking Methods', fr: 'Meilleures Méthodes de Suivi' },
      question: { 
        en: 'Which expense tracking method is most effective for beginners?', 
        fr: 'Quelle méthode de suivi des dépenses est la plus efficace pour les débutants ?' 
      },
      options: {
        en: [
          'Manual spreadsheet tracking',
          'Mobile app with bank sync',
          'Cash envelope system only',
          'Memory-based tracking'
        ],
        fr: [
          'Suivi manuel sur tableur',
          'App mobile avec sync bancaire',
          'Système d\'enveloppes seulement',
          'Suivi basé sur la mémoire'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Mobile apps with bank sync automatically categorize transactions, making tracking effortless and accurate.',
        fr: 'Les apps mobiles avec sync bancaire catégorisent automatiquement les transactions, rendant le suivi sans effort et précis.'
      },
      hint: {
        en: 'Think about what requires the least manual effort...',
        fr: 'Pensez à ce qui demande le moins d\'effort manuel...'
      },
      xp: 20
    },
    {
      id: 'spending-categories',
      type: 'checklist',
      title: { en: 'Essential Spending Categories', fr: 'Catégories de Dépenses Essentielles' },
      items: {
        en: [
          'Housing (rent, mortgage, utilities)',
          'Transportation (car, gas, public transit)',
          'Food (groceries, dining out)',
          'Healthcare and insurance',
          'Entertainment and discretionary spending'
        ],
        fr: [
          'Logement (loyer, hypothèque, services)',
          'Transport (voiture, essence, transport public)',
          'Nourriture (épicerie, restaurants)',
          'Santé et assurances',
          'Divertissement et dépenses discrétionnaires'
        ]
      },
      explanation: {
        en: 'These five categories capture 80-90% of most people\'s spending and provide a clear overview of where money goes.',
        fr: 'Ces cinq catégories capturent 80-90% des dépenses de la plupart des gens et donnent un aperçu clair d\'où va l\'argent.'
      },
      xp: 25
    },
    {
      id: 'weekly-review',
      type: 'multiple_choice',
      title: { en: 'Weekly Expense Review', fr: 'Révision Hebdomadaire des Dépenses' },
      question: { 
        en: 'How often should you review your expenses for best results?', 
        fr: 'À quelle fréquence devriez-vous réviser vos dépenses pour de meilleurs résultats ?' 
      },
      options: {
        en: [
          'Daily',
          'Weekly',
          'Monthly',
          'Only when problems arise'
        ],
        fr: [
          'Quotidiennement',
          'Hebdomadairement',
          'Mensuellement',
          'Seulement quand des problèmes surviennent'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Weekly reviews are the sweet spot - frequent enough to catch issues early but not so often it becomes overwhelming.',
        fr: 'Les révisions hebdomadaires sont le point idéal - assez fréquentes pour détecter les problèmes tôt mais pas trop pour éviter la surcharge.'
      },
      hint: {
        en: 'Think about a sustainable routine...',
        fr: 'Pensez à une routine soutenable...'
      },
      xp: 20
    },
    {
      id: 'expense-psychology',
      type: 'quiz',
      title: { en: 'Psychology of Spending', fr: 'Psychologie des Dépenses' },
      question: { 
        en: 'What psychological effect makes people spend more with credit cards?', 
        fr: 'Quel effet psychologique fait que les gens dépensent plus avec les cartes de crédit ?' 
      },
      correctAnswer: { en: 'pain of payment', fr: 'douleur du paiement' },
      acceptedAnswers: {
        en: ['pain of payment', 'reduced pain', 'less tangible', 'abstract', 'no physical cash'],
        fr: ['douleur du paiement', 'douleur réduite', 'moins tangible', 'abstrait', 'pas d\'argent physique']
      },
      explanation: {
        en: 'Credit cards reduce the "pain of payment" - we don\'t feel the immediate loss like with cash, leading to higher spending.',
        fr: 'Les cartes de crédit réduisent la "douleur du paiement" - on ne ressent pas la perte immédiate comme avec l\'argent liquide, menant à plus de dépenses.'
      },
      hint: {
        en: 'Think about how paying with cash feels different...',
        fr: 'Pensez à comment payer avec de l\'argent liquide se ressent différemment...'
      },
      xp: 25
    },
    {
      id: 'action-challenge',
      type: 'action',
      title: { en: 'Expense Tracking Action Challenge', fr: 'Défi Action Suivi des Dépenses' },
      content: {
        en: {
          description: 'Track, analyze, and optimize your spending!',
          actions: [
            {
              id: 'expense_action_1',
              title: 'Log Every Expense',
              description: 'Record every single expense for one day in your chosen tool.',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'expense_action_2',
              title: 'Analyze Your Categories',
              description: 'Review your expenses and group them into categories.',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'expense_action_3',
              title: 'Find a Quick Win',
              description: 'Identify one area to cut back and set a goal for next week.',
              verification: 'manual',
              xp: 15
            }
          ]
        },
        fr: {
          description: 'Suivez, analysez et optimisez vos dépenses !',
          actions: [
            {
              id: 'expense_action_1',
              title: 'Notez Chaque Dépense',
              description: 'Enregistrez chaque dépense pendant une journée dans l\'outil de votre choix.',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'expense_action_2',
              title: 'Analysez Vos Catégories',
              description: 'Regroupez vos dépenses par catégorie.',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'expense_action_3',
              title: 'Trouvez un Quick Win',
              description: 'Identifiez un poste à réduire et fixez-vous un objectif pour la semaine suivante.',
              verification: 'manual',
              xp: 15
            }
          ]
        }
      },
      validation: (data) => {
        const { expenses, categories, goal } = data;
        if (expenses && categories && goal) {
          return { isValid: true, message: 'Great tracking work!' };
        }
        return { isValid: false, message: 'Please complete all tracking steps' };
      },
      xp: 20
    }
  ],

  analytics: {
    completionRate: 0.84,
    averageTime: 16,
    difficultyRating: 2.3,
    userSatisfaction: 4.6,
    retryRate: 0.18,
    dropoffPoints: ['money-leaks', 'action-challenge'],
    popularFeatures: ['interactive-tracking', 'latte-factor', 'money-leaks']
  }
};

export const getExpenseTrackingHelpers = () => ({
  calculateSpendingByCategory: (expenses) => {
    const categories = {};
    expenses.forEach(expense => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += expense.amount;
    });
    return categories;
  },
  
  identifyTopSpendingCategories: (expenses, limit = 5) => {
    const categories = this.calculateSpendingByCategory(expenses);
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
  },
  
  suggestSavingsOpportunities: (expenses) => {
    const suggestions = [];
    const categories = this.calculateSpendingByCategory(expenses);
    
    if (categories['dining-out'] > 200) {
      suggestions.push('Consider reducing dining out expenses');
    }
    if (categories['subscriptions'] > 50) {
      suggestions.push('Review and cancel unused subscriptions');
    }
    if (categories['entertainment'] > 150) {
      suggestions.push('Look for free entertainment alternatives');
    }
    
    return suggestions;
  }
}); 