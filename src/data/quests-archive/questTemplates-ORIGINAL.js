export const questTemplates = [
  // ========== FREE QUESTS (7) ==========
  
  // 1. Budget Basics (Optimized)
  {
    id: 'budget-basics',
    category: 'budgeting',
    difficulty: 'beginner',
    duration: 15,
    xp: 100,
    isPremium: false,
    order: 1,
    title_en: 'Budget Basics',
    title_fr: 'Bases du Budget',
    description_en: 'Master the fundamentals of budgeting and take control of your money',
    description_fr: 'Maîtrisez les fondamentaux du budget et prenez le contrôle de votre argent',
    objectives_en: [
      'Understand what a budget is and why it matters',
      'Learn the 50/30/20 budgeting rule',
      'Create your first simple budget'
    ],
    objectives_fr: [
      'Comprendre ce qu\'est un budget et pourquoi c\'est important',
      'Apprendre la règle budgétaire 50/30/20',
      'Créer votre premier budget simple'
    ],
    prerequisites_en: ['None - perfect for beginners!'],
    prerequisites_fr: ['Aucun - parfait pour les débutants !'],
    rewards: {
      badge: 'budget_beginner',
      unlocks: ['emergency-fund-101', 'expense-tracking']
    },
    steps: [
      {
        type: 'info',
        title_en: 'What is a Budget?',
        title_fr: 'Qu\'est-ce qu\'un Budget ?',
        content_en: 'A budget is simply a plan for your money. It helps you decide how to spend your income wisely.',
        content_fr: 'Un budget est simplement un plan pour votre argent. Il vous aide à décider comment dépenser vos revenus intelligemment.',
        funFact_en: 'Did you know? Only 32% of people maintain a monthly budget, yet those who do save 20% more on average!',
        funFact_fr: 'Le saviez-vous ? Seulement 32% des gens tiennent un budget mensuel, mais ceux qui le font économisent 20% de plus en moyenne !'
      },
      {
        type: 'multiple_choice',
        question_en: 'What is the 50/30/20 rule?',
        question_fr: 'Qu\'est-ce que la règle 50/30/20 ?',
        options_en: [
          '50% savings, 30% needs, 20% wants',
          '50% needs, 30% wants, 20% savings',
          '50% wants, 30% savings, 20% needs',
          '50% needs, 30% savings, 20% wants'
        ],
        options_fr: [
          '50% épargne, 30% besoins, 20% envies',
          '50% besoins, 30% envies, 20% épargne',
          '50% envies, 30% épargne, 20% besoins',
          '50% besoins, 30% épargne, 20% envies'
        ],
        correct: 1,
        explanation_en: 'The 50/30/20 rule suggests spending 50% on needs (rent, food), 30% on wants (entertainment), and 20% on savings and debt repayment.',
        explanation_fr: 'La règle 50/30/20 suggère de dépenser 50% pour les besoins (loyer, nourriture), 30% pour les envies (divertissement), et 20% pour l\'épargne et le remboursement des dettes.',
        hint_en: 'Think about what takes up the biggest portion of most people\'s income...',
        hint_fr: 'Pensez à ce qui prend la plus grande partie du revenu de la plupart des gens...'
      },
      {
        type: 'multiple_choice',
        question_en: 'Which of the following is typically a fixed expense?',
        question_fr: 'Laquelle des dépenses suivantes est typiquement fixe ?',
        options_en: [
          'Groceries',
          'Rent or mortgage',
          'Dining out',
          'Entertainment subscriptions'
        ],
        options_fr: [
          'Courses',
          'Loyer ou hypothèque',
          'Restaurants',
          'Abonnements divertissement'
        ],
        correct: 1,
        explanation_en: 'Fixed expenses stay constant each month, like rent or mortgage.',
        explanation_fr: 'Les dépenses fixes restent constantes chaque mois, comme le loyer ou l\'hypothèque.',
        hint_en: 'Think about bills that never change...',
        hint_fr: 'Pensez aux factures qui ne changent jamais...',
        difficulty: 'easy',
        points: 10
      },
      {
        type: 'multiple_choice',
        question_en: 'If you earn $2,500 after tax, how much goes to "wants" under the 50/30/20 rule?',
        question_fr: 'Si vous gagnez 2 500€ après impôt, combien va aux "envies" selon 50/30/20 ?',
        options_en: [
          '$500',
          '$750',
          '$1,250',
          '$1,000'
        ],
        options_fr: [
          '500€',
          '750€',
          '1 250€',
          '1 000€'
        ],
        correct: 1,
        explanation_en: '30% of $2,500 is $750.',
        explanation_fr: '30% de 2 500€ est 750€.',
        hint_en: 'Calculate 30 percent of the income.',
        hint_fr: 'Calculez 30 pour cent du revenu.',
        difficulty: 'easy',
        points: 10
      },
      {
        type: 'checklist',
        title_en: 'Create Your First Budget',
        title_fr: 'Créez Votre Premier Budget',
        items_en: [
          'List all your monthly income sources',
          'Track your expenses for one week',
          'Categorize expenses into needs and wants',
          'Calculate if you\'re following 50/30/20'
        ],
        items_fr: [
          'Listez toutes vos sources de revenus mensuels',
          'Suivez vos dépenses pendant une semaine',
          'Catégorisez les dépenses en besoins et envies',
          'Calculez si vous suivez le 50/30/20'
        ],
        explanation_en: 'Taking these simple steps will give you a clear picture of your financial situation.',
        explanation_fr: 'Ces étapes simples vous donneront une image claire de votre situation financière.'
      }
    ]
  },

  // 2. Emergency Fund 101 (Optimized)
  {
    id: 'emergency-fund-101',
    category: 'saving',
    difficulty: 'beginner',
    duration: 20,
    xp: 100,
    isPremium: false,
    order: 2,
    title_en: 'Emergency Fund 101',
    title_fr: 'Fonds d\'Urgence 101',
    description_en: 'Learn why you need an emergency fund and how to build one',
    description_fr: 'Apprenez pourquoi vous avez besoin d\'un fonds d\'urgence et comment en créer un',
    objectives_en: [
      'Understand the importance of emergency funds',
      'Calculate your ideal emergency fund size',
      'Learn strategies to build your fund quickly',
      'Know where to keep your emergency money'
    ],
    objectives_fr: [
      'Comprendre l\'importance des fonds d\'urgence',
      'Calculer la taille idéale de votre fonds',
      'Apprendre des stratégies pour construire rapidement',
      'Savoir où garder votre argent d\'urgence'
    ],
    prerequisites_en: ['Basic understanding of budgeting'],
    prerequisites_fr: ['Compréhension de base du budget'],
    rewards: {
      badge: 'safety_net',
      unlocks: ['saving-strategies', 'investing-basics']
    },
    steps: [
      {
        type: 'info',
        title_en: 'Why Emergency Funds Matter',
        title_fr: 'Pourquoi les Fonds d\'Urgence Importent',
        content_en: 'An emergency fund protects you from unexpected expenses like medical bills, car repairs, or job loss.',
        content_fr: 'Un fonds d\'urgence vous protège des dépenses imprévues comme les frais médicaux, réparations auto, ou perte d\'emploi.',
        funFact_en: 'Fun fact: 40% of Americans can\'t cover a $400 emergency expense!',
        funFact_fr: 'Fait amusant : 40% des Américains ne peuvent pas couvrir une dépense d\'urgence de 400$ !'
      },
      {
        type: 'multiple_choice',
        question_en: 'How much should your emergency fund typically be?',
        question_fr: 'Combien devrait typiquement être votre fonds d\'urgence ?',
        options_en: [
          '1 month of expenses',
          '3-6 months of expenses',
          '1 year of expenses',
          '$1,000 flat amount'
        ],
        options_fr: [
          '1 mois de dépenses',
          '3-6 mois de dépenses',
          '1 an de dépenses',
          '1000€ montant fixe'
        ],
        correct: 1,
        explanation_en: 'Most experts recommend 3-6 months of living expenses. Start with 3 months if you have stable income, 6 months if freelancing.',
        explanation_fr: 'La plupart des experts recommandent 3-6 mois de dépenses. Commencez avec 3 mois si revenu stable, 6 mois si freelance.',
        hint_en: 'Think about how long you might need to find a new job...',
        hint_fr: 'Pensez au temps nécessaire pour trouver un nouvel emploi...'
      },
      {
        type: 'interactive_challenge',
        title_en: 'Calculate Your Emergency Fund',
        title_fr: 'Calculez Votre Fonds d\'Urgence',
        instructions_en: 'Add up your essential monthly expenses and multiply by your target months.',
        instructions_fr: 'Additionnez vos dépenses mensuelles essentielles et multipliez par vos mois cibles.',
        challenge_type: 'calculator',
        explanation_en: 'Remember to include only essential expenses like rent, utilities, food, and transportation.',
        explanation_fr: 'N\'incluez que les dépenses essentielles comme loyer, services publics, nourriture et transport.'
      },
      {
        type: 'checklist',
        title_en: 'Building Your Fund',
        title_fr: 'Construire Votre Fonds',
        items_en: [
          'Open a separate high-yield savings account',
          'Set up automatic transfers ($50-100/month)',
          'Save any windfalls (tax refunds, bonuses)',
          'Track progress monthly'
        ],
        items_fr: [
          'Ouvrir un compte épargne séparé à haut rendement',
          'Configurer des virements automatiques (50-100€/mois)',
          'Épargner les aubaines (remboursements, bonus)',
          'Suivre les progrès mensuellement'
        ],
        explanation_en: 'Even small amounts add up! $50/month becomes $600/year.',
        explanation_fr: 'Même les petits montants s\'accumulent ! 50€/mois devient 600€/an.'
      }
    ]
  },

  // 3. Credit Score Basics (New)
  {
    id: 'credit-score-basics',
    category: 'debt',
    difficulty: 'beginner',
    duration: 15,
    xp: 100,
    isPremium: false,
    order: 3,
    title_en: 'Credit Score Basics',
    title_fr: 'Bases du Score de Crédit',
    description_en: 'Understand credit scores and how to improve yours',
    description_fr: 'Comprendre les scores de crédit et comment améliorer le vôtre',
    objectives_en: [
      'Learn what a credit score is',
      'Understand the 5 factors that affect your score',
      'Discover simple ways to improve your credit'
    ],
    objectives_fr: [
      'Apprendre ce qu\'est un score de crédit',
      'Comprendre les 5 facteurs qui affectent votre score',
      'Découvrir des moyens simples d\'améliorer votre crédit'
    ],
    prerequisites_en: ['None'],
    prerequisites_fr: ['Aucun'],
    rewards: {
      badge: 'credit_smart',
      unlocks: ['debt-avalanche', 'credit-cards-101']
    },
    steps: [
      {
        type: 'info',
        title_en: 'What is a Credit Score?',
        title_fr: 'Qu\'est-ce qu\'un Score de Crédit ?',
        content_en: 'A credit score is a 3-digit number (300-850) that shows lenders how reliable you are at paying back money.',
        content_fr: 'Un score de crédit est un nombre à 3 chiffres (300-850) qui montre aux prêteurs votre fiabilité de remboursement.',
        funFact_en: 'The average credit score in the US is 716, which is considered "good"!',
        funFact_fr: 'Le score de crédit moyen aux États-Unis est de 716, considéré comme "bon" !'
      },
      {
        type: 'multiple_choice',
        question_en: 'Which factor has the BIGGEST impact on your credit score?',
        question_fr: 'Quel facteur a le PLUS GRAND impact sur votre score ?',
        options_en: [
          'Income level',
          'Payment history',
          'Age of credit',
          'Number of credit cards'
        ],
        options_fr: [
          'Niveau de revenu',
          'Historique de paiement',
          'Âge du crédit',
          'Nombre de cartes de crédit'
        ],
        correct: 1,
        explanation_en: 'Payment history makes up 35% of your score. Always pay at least the minimum on time!',
        explanation_fr: 'L\'historique de paiement représente 35% de votre score. Payez toujours au moins le minimum à temps !',
        hint_en: 'Think about what lenders care about most...',
        hint_fr: 'Pensez à ce qui importe le plus aux prêteurs...'
      },
      {
        type: 'checklist',
        title_en: 'Quick Credit Wins',
        title_fr: 'Victoires Crédit Rapides',
        items_en: [
          'Set up automatic payments',
          'Keep credit card use below 30%',
          'Check your free credit report annually',
          'Don\'t close old credit cards'
        ],
        items_fr: [
          'Configurer les paiements automatiques',
          'Garder l\'utilisation sous 30%',
          'Vérifier votre rapport gratuit annuellement',
          'Ne pas fermer les vieilles cartes'
        ],
        explanation_en: 'These simple actions can boost your score by 50+ points in 3-6 months!',
        explanation_fr: 'Ces actions simples peuvent augmenter votre score de 50+ points en 3-6 mois !'
      }
    ]
  },

  // 4. Expense Tracking (New)
  {
    id: 'expense-tracking',
    category: 'budgeting',
    difficulty: 'beginner',
    duration: 20,
    xp: 100,
    isPremium: false,
    order: 4,
    title_en: 'Smart Expense Tracking',
    title_fr: 'Suivi Intelligent des Dépenses',
    description_en: 'Master the art of tracking where your money goes',
    description_fr: 'Maîtrisez l\'art de suivre où va votre argent',
    objectives_en: [
      'Learn different tracking methods',
      'Identify spending patterns',
      'Find areas to cut costs',
      'Build better spending habits'
    ],
    objectives_fr: [
      'Apprendre différentes méthodes de suivi',
      'Identifier les habitudes de dépenses',
      'Trouver où réduire les coûts',
      'Créer de meilleures habitudes'
    ],
    prerequisites_en: ['Basic budgeting knowledge'],
    prerequisites_fr: ['Connaissance basique du budget'],
    rewards: {
      badge: 'expense_detective',
      unlocks: ['saving-strategies', 'money-mindset']
    },
    steps: [
      {
        type: 'info',
        title_en: 'Why Track Expenses?',
        title_fr: 'Pourquoi Suivre les Dépenses ?',
        content_en: 'You can\'t manage what you don\'t measure. Tracking reveals surprising spending patterns!',
        content_fr: 'On ne peut pas gérer ce qu\'on ne mesure pas. Le suivi révèle des habitudes surprenantes !',
        funFact_en: 'People who track expenses save an average of $500/month just by being aware!',
        funFact_fr: 'Les gens qui suivent leurs dépenses économisent en moyenne 500€/mois juste en étant conscients !'
      },
      {
        type: 'multiple_choice',
        question_en: 'What\'s the "latte factor" in personal finance?',
        question_fr: 'Qu\'est-ce que le "facteur latte" en finance personnelle ?',
        options_en: [
          'Coffee addiction costs',
          'Small daily expenses that add up',
          'Morning routine expenses',
          'Caffeine budget category'
        ],
        options_fr: [
          'Coûts d\'addiction au café',
          'Petites dépenses quotidiennes qui s\'accumulent',
          'Dépenses de routine matinale',
          'Catégorie budget caféine'
        ],
        correct: 1,
        explanation_en: 'The "latte factor" refers to small, recurring expenses that seem insignificant but add up to large amounts over time.',
        explanation_fr: 'Le "facteur latte" désigne les petites dépenses récurrentes qui semblent insignifiantes mais s\'accumulent avec le temps.',
        hint_en: 'It\'s not just about coffee...',
        hint_fr: 'Ce n\'est pas juste à propos du café...'
      },
      {
        type: 'interactive_challenge',
        title_en: 'Find Your Money Leaks',
        title_fr: 'Trouvez Vos Fuites d\'Argent',
        instructions_en: 'Review your last month\'s spending and identify 3 areas where you spent more than expected.',
        instructions_fr: 'Examinez vos dépenses du mois dernier et identifiez 3 domaines où vous avez dépensé plus que prévu.',
        challenge_type: 'reflection',
        explanation_en: 'Common money leaks: subscriptions, dining out, impulse shopping, convenience fees.',
        explanation_fr: 'Fuites communes : abonnements, restaurants, achats impulsifs, frais de commodité.'
      }
    ]
  },

  // 5. Saving Strategies (New)
  {
    id: 'saving-strategies',
    category: 'saving',
    difficulty: 'beginner',
    duration: 25,
    xp: 100,
    isPremium: false,
    order: 5,
    title_en: 'Saving Strategies That Work',
    title_fr: 'Stratégies d\'Épargne Efficaces',
    description_en: 'Discover proven methods to save more money effortlessly',
    description_fr: 'Découvrez des méthodes éprouvées pour économiser plus facilement',
    objectives_en: [
      'Learn the "pay yourself first" principle',
      'Master automatic saving techniques',
      'Understand different savings challenges',
      'Find the right savings account'
    ],
    objectives_fr: [
      'Apprendre le principe "se payer en premier"',
      'Maîtriser les techniques d\'épargne automatique',
      'Comprendre différents défis d\'épargne',
      'Trouver le bon compte épargne'
    ],
    prerequisites_en: ['Emergency Fund 101'],
    prerequisites_fr: ['Fonds d\'Urgence 101'],
    rewards: {
      badge: 'savings_master',
      unlocks: ['investing-basics', 'compound-interest']
    },
    steps: [
      {
        type: 'info',
        title_en: 'Pay Yourself First',
        title_fr: 'Payez-vous en Premier',
        content_en: 'Before paying any bills, set aside money for savings. Treat it like a non-negotiable expense.',
        content_fr: 'Avant de payer les factures, mettez de l\'argent de côté. Traitez-le comme une dépense non négociable.',
        funFact_en: 'Warren Buffett says: "Don\'t save what\'s left after spending; spend what\'s left after saving!"',
        funFact_fr: 'Warren Buffett dit : "N\'épargnez pas ce qui reste après avoir dépensé ; dépensez ce qui reste après avoir épargné !"'
      },
      {
        type: 'checklist',
        title_en: 'Automatic Saving Setup',
        title_fr: 'Configuration Épargne Automatique',
        items_en: [
          'Set up direct deposit split',
          'Schedule automatic transfers',
          'Round up purchases to save change',
          'Increase savings by 1% every 3 months'
        ],
        items_fr: [
          'Configurer le dépôt direct divisé',
          'Programmer des virements automatiques',
          'Arrondir les achats pour épargner',
          'Augmenter l\'épargne de 1% tous les 3 mois'
        ],
        explanation_en: 'Automation removes the temptation to skip saving "just this month".',
        explanation_fr: 'L\'automatisation supprime la tentation de sauter l\'épargne "juste ce mois-ci".'
      },
      {
        type: 'multiple_choice',
        question_en: 'Which savings challenge helps you save $1,378 in a year?',
        question_fr: 'Quel défi d\'épargne vous aide à économiser 1 378€ en un an ?',
        options_en: [
          '$5 daily challenge',
          '52-week challenge',
          'No-spend month',
          'Penny challenge'
        ],
        options_fr: [
          'Défi 5€ par jour',
          'Défi 52 semaines',
          'Mois sans dépenses',
          'Défi du centime'
        ],
        correct: 1,
        explanation_en: 'The 52-week challenge: save $1 week 1, $2 week 2, up to $52 week 52. Total: $1,378!',
        explanation_fr: 'Le défi 52 semaines : économisez 1€ semaine 1, 2€ semaine 2, jusqu\'à 52€ semaine 52. Total : 1 378€ !',
        hint_en: 'Think about a challenge that increases gradually...',
        hint_fr: 'Pensez à un défi qui augmente graduellement...'
      }
    ]
  },

  // 6. Money Mindset (New)
  {
    id: 'money-mindset',
    category: 'planning',
    difficulty: 'beginner',
    duration: 15,
    xp: 100,
    isPremium: false,
    order: 6,
    title_en: 'Money Mindset Makeover',
    title_fr: 'Transformation Mentalité Argent',
    description_en: 'Transform your relationship with money for lasting success',
    description_fr: 'Transformez votre relation avec l\'argent pour un succès durable',
    objectives_en: [
      'Identify limiting money beliefs',
      'Develop abundance thinking',
      'Create positive money habits'
    ],
    objectives_fr: [
      'Identifier les croyances limitantes',
      'Développer une pensée d\'abondance',
      'Créer des habitudes positives'
    ],
    prerequisites_en: ['None'],
    prerequisites_fr: ['Aucun'],
    rewards: {
      badge: 'mindset_master',
      unlocks: ['goal-setting', 'wealth-building']
    },
    steps: [
      {
        type: 'info',
        title_en: 'Your Money Story',
        title_fr: 'Votre Histoire d\'Argent',
        content_en: 'Our beliefs about money often come from childhood experiences and societal messages.',
        content_fr: 'Nos croyances sur l\'argent viennent souvent d\'expériences d\'enfance et messages sociétaux.',
        funFact_en: 'Studies show 90% of our money decisions are emotional, not logical!',
        funFact_fr: 'Les études montrent que 90% de nos décisions d\'argent sont émotionnelles, pas logiques !'
      },
      {
        type: 'interactive_challenge',
        title_en: 'Belief Check',
        title_fr: 'Vérification des Croyances',
        instructions_en: 'Write down 3 things you believe about money. Are they helping or limiting you?',
        instructions_fr: 'Écrivez 3 choses que vous croyez sur l\'argent. Vous aident-elles ou vous limitent-elles ?',
        challenge_type: 'journal',
        explanation_en: 'Common limiting beliefs: "Money is evil", "I\'m bad with money", "Rich people are greedy".',
        explanation_fr: 'Croyances limitantes communes : "L\'argent est mal", "Je suis nul avec l\'argent", "Les riches sont avides".'
      },
      {
        type: 'checklist',
        title_en: 'Mindset Shifts',
        title_fr: 'Changements de Mentalité',
        items_en: [
          'Replace "I can\'t afford it" with "How can I afford it?"',
          'Celebrate small financial wins',
          'Learn from money mistakes without shame',
          'View money as a tool for good'
        ],
        items_fr: [
          'Remplacer "Je ne peux pas me le permettre" par "Comment puis-je me le permettre ?"',
          'Célébrer les petites victoires financières',
          'Apprendre des erreurs sans honte',
          'Voir l\'argent comme un outil pour le bien'
        ],
        explanation_en: 'Small mindset shifts lead to big behavioral changes over time.',
        explanation_fr: 'De petits changements de mentalité mènent à de grands changements comportementaux.'
      }
    ]
  },

  // 7. Basic Banking (New)
  {
    id: 'basic-banking',
    category: 'budgeting',
    difficulty: 'beginner',
    duration: 20,
    xp: 100,
    isPremium: false,
    order: 7,
    title_en: 'Banking Basics & Account Types',
    title_fr: 'Bases Bancaires & Types de Comptes',
    description_en: 'Navigate the banking system like a pro',
    description_fr: 'Naviguez le système bancaire comme un pro',
    objectives_en: [
      'Understand different account types',
      'Learn about banking fees and how to avoid them',
      'Choose the right bank for your needs',
      'Master online banking safety'
    ],
    objectives_fr: [
      'Comprendre les différents types de comptes',
      'Apprendre sur les frais bancaires et comment les éviter',
      'Choisir la bonne banque pour vos besoins',
      'Maîtriser la sécurité bancaire en ligne'
    ],
    prerequisites_en: ['None'],
    prerequisites_fr: ['Aucun'],
    rewards: {
      badge: 'banking_basics',
      unlocks: ['credit-score-basics', 'investment-accounts']
    },
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
        hint_fr: 'Pensez aux coûts des banques traditionnelles que les banques en ligne n\'ont pas...'
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
      }
    ]
  },

  // ========== PREMIUM QUESTS (8) ==========

  // 8. Investing Basics (Optimized)
  {
    id: 'investing-basics',
    category: 'investing',
    difficulty: 'intermediate',
    duration: 30,
    xp: 150,
    isPremium: true,
    order: 8,
    title_en: 'Investing Basics',
    title_fr: 'Bases de l\'Investissement',
    description_en: 'Start your investing journey with confidence',
    description_fr: 'Commencez votre parcours d\'investissement avec confiance',
    objectives_en: [
      'Understand stocks, bonds, and mutual funds',
      'Learn about risk and diversification',
      'Know the power of compound interest',
      'Choose your first investment account',
      'Create a simple investment strategy'
    ],
    objectives_fr: [
      'Comprendre actions, obligations, et fonds mutuels',
      'Apprendre sur le risque et la diversification',
      'Connaître le pouvoir des intérêts composés',
      'Choisir votre premier compte d\'investissement',
      'Créer une stratégie d\'investissement simple'
    ],
    prerequisites_en: ['Emergency fund established', 'Basic budgeting knowledge'],
    prerequisites_fr: ['Fonds d\'urgence établi', 'Connaissance budgétaire de base'],
    rewards: {
      badge: 'investor_rookie',
      unlocks: ['stock-market-101', 'index-fund-strategy', 'retirement-planning']
    },
    steps: [
      {
        type: 'info',
        title_en: 'What is Investing?',
        title_fr: 'Qu\'est-ce que l\'Investissement ?',
        content_en: 'Investing is putting money to work to potentially grow over time. Unlike saving, investing involves some risk but offers higher potential returns.',
        content_fr: 'Investir c\'est faire travailler l\'argent pour potentiellement croître. Contrairement à l\'épargne, investir implique du risque mais offre des rendements potentiels plus élevés.',
        funFact_en: 'If you invested $1,000 in the S&P 500 in 1990, it would be worth over $20,000 today!',
        funFact_fr: 'Si vous aviez investi 1000€ dans le S&P 500 en 1990, cela vaudrait plus de 20 000€ aujourd\'hui !'
      },
      {
        type: 'multiple_choice',
        question_en: 'What is diversification in investing?',
        question_fr: 'Qu\'est-ce que la diversification en investissement ?',
        options_en: [
          'Investing all money in one stock',
          'Spreading investments across different assets',
          'Only buying bonds',
          'Timing the market perfectly'
        ],
        options_fr: [
          'Investir tout dans une action',
          'Répartir les investissements entre différents actifs',
          'Acheter seulement des obligations',
          'Timer le marché parfaitement'
        ],
        correct: 1,
        explanation_en: 'Diversification reduces risk by spreading investments across different assets, sectors, and regions.',
        explanation_fr: 'La diversification réduit le risque en répartissant les investissements entre différents actifs, secteurs et régions.',
        hint_en: 'Think about the saying "Don\'t put all your eggs in one basket"...',
        hint_fr: 'Pensez au dicton "Ne mettez pas tous vos œufs dans le même panier"...'
      },
      {
        type: 'interactive_challenge',
        title_en: 'Compound Interest Calculator',
        title_fr: 'Calculateur d\'Intérêts Composés',
        instructions_en: 'See how $100/month invested at 7% annual return grows over 30 years.',
        instructions_fr: 'Voyez comment 100€/mois investis à 7% de rendement annuel croissent sur 30 ans.',
        challenge_type: 'calculator',
        explanation_en: 'Result: $121,997! You invested $36,000 but earned $85,997 in growth.',
        explanation_fr: 'Résultat : 121 997€ ! Vous avez investi 36 000€ mais gagné 85 997€ en croissance.'
      },
      {
        type: 'checklist',
        title_en: 'Start Investing Checklist',
        title_fr: 'Checklist Commencer à Investir',
        items_en: [
          'Pay off high-interest debt first',
          'Build 3-month emergency fund',
          'Open investment account (IRA/401k)',
          'Start with index funds',
          'Invest consistently every month'
        ],
        items_fr: [
          'Rembourser les dettes à intérêt élevé',
          'Construire 3 mois de fonds d\'urgence',
          'Ouvrir compte investissement',
          'Commencer avec fonds indiciels',
          'Investir régulièrement chaque mois'
        ],
        explanation_en: 'Following these steps sets you up for long-term investing success.',
        explanation_fr: 'Suivre ces étapes vous prépare pour un succès d\'investissement à long terme.'
      }
    ]
  },

  // 9. Debt Avalanche (Optimized)
  {
    id: 'debt-avalanche',
    category: 'debt',
    difficulty: 'intermediate',
    duration: 25,
    xp: 150,
    isPremium: true,
    order: 9,
    title_en: 'Debt Avalanche Strategy',
    title_fr: 'Stratégie Avalanche de Dettes',
    description_en: 'Learn the mathematically optimal way to pay off debt',
    description_fr: 'Apprenez la façon mathématiquement optimale de rembourser les dettes',
    objectives_en: [
      'Understand debt avalanche vs snowball methods',
      'Calculate interest savings',
      'Create your debt payoff plan',
      'Stay motivated during payoff'
    ],
    objectives_fr: [
      'Comprendre avalanche vs boule de neige',
      'Calculer les économies d\'intérêts',
      'Créer votre plan de remboursement',
      'Rester motivé pendant le remboursement'
    ],
    prerequisites_en: ['Basic understanding of interest rates'],
    prerequisites_fr: ['Compréhension basique des taux d\'intérêt'],
    rewards: {
      badge: 'debt_destroyer',
      unlocks: ['debt-snowball', 'credit-optimization']
    },
    steps: [
      {
        type: 'info',
        title_en: 'The Avalanche Method',
        title_fr: 'La Méthode Avalanche',
        content_en: 'Pay minimums on all debts, then attack the highest interest rate debt first. This saves the most money!',
        content_fr: 'Payez les minimums sur toutes les dettes, puis attaquez la dette au taux le plus élevé. Cela économise le plus !',
        funFact_en: 'The avalanche method can save thousands in interest compared to paying debts randomly!',
        funFact_fr: 'La méthode avalanche peut économiser des milliers en intérêts comparé au paiement aléatoire !'
      },
      {
        type: 'multiple_choice',
        question_en: 'You have 3 debts: Card A (22% APR, $2,000), Card B (18% APR, $5,000), Loan C (6% APR, $10,000). Which do you pay first with avalanche?',
        question_fr: 'Vous avez 3 dettes : Carte A (22% TAP, 2000€), Carte B (18% TAP, 5000€), Prêt C (6% TAP, 10000€). Laquelle payez-vous en premier ?',
        options_en: [
          'Card B (highest balance)',
          'Loan C (biggest debt)',
          'Card A (highest interest rate)',
          'Split equally among all'
        ],
        options_fr: [
          'Carte B (solde le plus élevé)',
          'Prêt C (plus grosse dette)',
          'Carte A (taux d\'intérêt le plus élevé)',
          'Diviser également entre tous'
        ],
        correct: 2,
        explanation_en: 'Always pay the highest interest rate first with the avalanche method, regardless of balance size.',
        explanation_fr: 'Payez toujours le taux d\'intérêt le plus élevé en premier avec la méthode avalanche, peu importe la taille du solde.',
        hint_en: 'Which debt is costing you the most per dollar owed?',
        hint_fr: 'Quelle dette vous coûte le plus par euro dû ?'
      },
      {
        type: 'interactive_challenge',
        title_en: 'Calculate Your Savings',
        title_fr: 'Calculez Vos Économies',
        instructions_en: 'List your debts by interest rate and see how much you\'ll save using avalanche method.',
        instructions_fr: 'Listez vos dettes par taux d\'intérêt et voyez combien vous économiserez avec la méthode avalanche.',
        challenge_type: 'debt_calculator',
        explanation_en: 'Even small extra payments make a huge difference when applied strategically!',
        explanation_fr: 'Même de petits paiements supplémentaires font une énorme différence appliqués stratégiquement !'
      },
      {
        type: 'checklist',
        title_en: 'Avalanche Action Plan',
        title_fr: 'Plan d\'Action Avalanche',
        items_en: [
          'List all debts with rates and balances',
          'Order by interest rate (highest first)',
          'Pay minimums on all debts',
          'Put ALL extra money toward top debt',
          'Celebrate each debt eliminated!'
        ],
        items_fr: [
          'Lister toutes dettes avec taux et soldes',
          'Ordonner par taux (plus élevé d\'abord)',
          'Payer minimums sur toutes dettes',
          'Mettre TOUT extra vers dette principale',
          'Célébrer chaque dette éliminée !'
        ],
        explanation_en: 'Stay disciplined and you\'ll be debt-free faster than you think!',
        explanation_fr: 'Restez discipliné et vous serez libre de dettes plus vite que vous pensez !'
      }
    ]
  },

  // 10. Retirement Planning (New)
  {
    id: 'retirement-planning',
    category: 'planning',
    difficulty: 'advanced',
    duration: 30,
    xp: 200,
    isPremium: true,
    order: 10,
    title_en: 'Retirement Planning Essentials',
    title_fr: 'Essentiels de Planification Retraite',
    description_en: 'Never too early to plan for financial freedom',
    description_fr: 'Jamais trop tôt pour planifier la liberté financière',
    objectives_en: [
      'Calculate retirement needs',
      'Understand 401(k), IRA, and Roth accounts',
      'Learn about employer matching',
      'Create age-based investment strategy',
      'Plan for healthcare in retirement'
    ],
    objectives_fr: [
      'Calculer les besoins de retraite',
      'Comprendre les comptes retraite',
      'Apprendre sur la contribution employeur',
      'Créer stratégie d\'investissement par âge',
      'Planifier les soins de santé'
    ],
    prerequisites_en: ['Investing Basics', 'Steady income'],
    prerequisites_fr: ['Bases de l\'Investissement', 'Revenu stable'],
    rewards: {
      badge: 'future_planner',
      unlocks: ['fire-movement', 'tax-optimization']
    },
    steps: [
      {
        type: 'info',
        title_en: 'The Power of Starting Early',
        title_fr: 'Le Pouvoir de Commencer Tôt',
        content_en: 'Starting at 25 vs 35 can double your retirement savings due to compound interest!',
        content_fr: 'Commencer à 25 vs 35 ans peut doubler votre épargne retraite grâce aux intérêts composés !',
        funFact_en: 'A 25-year-old saving $200/month can retire with $1 million at 65!',
        funFact_fr: 'Un jeune de 25 ans épargnant 200€/mois peut prendre sa retraite avec 1 million€ à 65 ans !'
      },
      {
        type: 'multiple_choice',
        question_en: 'What\'s the biggest advantage of a Roth IRA?',
        question_fr: 'Quel est le plus grand avantage d\'un compte Roth ?',
        options_en: [
          'Tax deduction now',
          'Tax-free withdrawals in retirement',
          'Higher contribution limits',
          'Guaranteed returns'
        ],
        options_fr: [
          'Déduction fiscale maintenant',
          'Retraits sans impôts à la retraite',
          'Limites de contribution plus élevées',
          'Rendements garantis'
        ],
        correct: 1,
        explanation_en: 'Roth accounts are funded with after-tax money, but all withdrawals in retirement are tax-free!',
        explanation_fr: 'Les comptes Roth sont financés avec de l\'argent après impôts, mais tous les retraits sont sans impôts !',
        hint_en: 'Think about when you pay taxes...',
        hint_fr: 'Pensez à quand vous payez les impôts...'
      },
      {
        type: 'interactive_challenge',
        title_en: 'Retirement Calculator',
        title_fr: 'Calculateur Retraite',
        instructions_en: 'Calculate how much you need to save monthly to retire comfortably.',
        instructions_fr: 'Calculez combien épargner mensuellement pour une retraite confortable.',
        challenge_type: 'retirement_calc',
        explanation_en: 'Rule of thumb: You need 25x your annual expenses to retire (4% rule).',
        explanation_fr: 'Règle générale : Vous avez besoin de 25x vos dépenses annuelles pour la retraite (règle des 4%).'
      },
      {
        type: 'checklist',
        title_en: 'Retirement Action Steps',
        title_fr: 'Étapes Action Retraite',
        items_en: [
          'Contribute to get full employer match',
          'Max out IRA contributions',
          'Increase 401(k) by 1% annually',
          'Review and rebalance yearly',
          'Plan for healthcare costs'
        ],
        items_fr: [
          'Contribuer pour match employeur complet',
          'Maximiser contributions IRA',
          'Augmenter 401(k) de 1% annuellement',
          'Réviser et rééquilibrer annuellement',
          'Planifier coûts de santé'
        ],
        explanation_en: 'These steps ensure you\'re on track for a comfortable retirement.',
        explanation_fr: 'Ces étapes assurent que vous êtes sur la bonne voie pour une retraite confortable.'
      }
    ]
  },

  // 11. Crypto Introduction (New)
  {
    id: 'crypto-intro',
    category: 'investing',
    difficulty: 'intermediate',
    duration: 25,
    xp: 150,
    isPremium: true,
    order: 11,
    title_en: 'Cryptocurrency Introduction',
    title_fr: 'Introduction aux Cryptomonnaies',
    description_en: 'Understand crypto basics and invest safely',
    description_fr: 'Comprendre les bases crypto et investir en sécurité',
    objectives_en: [
      'Learn what cryptocurrency is',
      'Understand blockchain technology',
      'Know the risks and volatility',
      'Learn security best practices',
      'Create a balanced crypto strategy'
    ],
    objectives_fr: [
      'Apprendre ce qu\'est la cryptomonnaie',
      'Comprendre la technologie blockchain',
      'Connaître les risques et volatilité',
      'Apprendre les meilleures pratiques sécurité',
      'Créer une stratégie crypto équilibrée'
    ],
    prerequisites_en: ['Investing Basics', 'Risk tolerance assessment'],
    prerequisites_fr: ['Bases de l\'Investissement', 'Évaluation tolérance au risque'],
    rewards: {
      badge: 'crypto_explorer',
      unlocks: ['defi-basics', 'nft-guide']
    },
    steps: [
      {
        type: 'info',
        title_en: 'What is Cryptocurrency?',
        title_fr: 'Qu\'est-ce que la Cryptomonnaie ?',
        content_en: 'Digital or virtual currency secured by cryptography, operating independently of central banks.',
        content_fr: 'Monnaie numérique ou virtuelle sécurisée par cryptographie, opérant indépendamment des banques centrales.',
        funFact_en: 'If you bought $100 of Bitcoin in 2010, it would be worth over $50 million today!',
        funFact_fr: 'Si vous aviez acheté 100€ de Bitcoin en 2010, cela vaudrait plus de 50 millions€ aujourd\'hui !'
      },
      {
        type: 'multiple_choice',
        question_en: 'What percentage of your portfolio should crypto typically be?',
        question_fr: 'Quel pourcentage de votre portefeuille devrait être en crypto ?',
        options_en: [
          '50-75% for high returns',
          '5-10% as speculative investment',
          '100% YOLO',
          '0% - too risky'
        ],
        options_fr: [
          '50-75% pour hauts rendements',
          '5-10% comme investissement spéculatif',
          '100% YOLO',
          '0% - trop risqué'
        ],
        correct: 1,
        explanation_en: 'Most experts recommend 5-10% in crypto as it\'s highly volatile and speculative.',
        explanation_fr: 'La plupart des experts recommandent 5-10% en crypto car c\'est très volatil et spéculatif.',
        hint_en: 'Think about risk management...',
        hint_fr: 'Pensez à la gestion du risque...'
      },
      {
        type: 'checklist',
        title_en: 'Crypto Security Essentials',
        title_fr: 'Essentiels Sécurité Crypto',
        items_en: [
          'Use hardware wallet for large amounts',
          'Enable 2FA on all exchanges',
          'Never share private keys',
          'Research before investing',
          'Only invest what you can lose'
        ],
        items_fr: [
          'Utiliser wallet matériel pour gros montants',
          'Activer 2FA sur tous les échanges',
          'Ne jamais partager clés privées',
          'Rechercher avant d\'investir',
          'Investir seulement ce qu\'on peut perdre'
        ],
        explanation_en: 'Security is paramount in crypto - many have lost fortunes to hacks and scams.',
        explanation_fr: 'La sécurité est primordiale en crypto - beaucoup ont perdu des fortunes aux hacks et arnaques.'
      },
      {
        type: 'interactive_challenge',
        title_en: 'Risk Assessment',
        title_fr: 'Évaluation du Risque',
        instructions_en: 'Calculate how crypto volatility affects a $1,000 investment.',
        instructions_fr: 'Calculez comment la volatilité crypto affecte un investissement de 1000€.',
        challenge_type: 'volatility_simulator',
        explanation_en: 'Crypto can gain or lose 50% in days. Only invest money you won\'t need soon!',
        explanation_fr: 'La crypto peut gagner ou perdre 50% en jours. Investissez seulement l\'argent dont vous n\'aurez pas besoin bientôt !'
      }
    ]
  },

  // 12. Tax Optimization (New)
  {
    id: 'tax-optimization',
    category: 'planning',
    themeColor: '#6B5B95', // purple for planning
    difficulty: 'expert',
    duration: 30,
    xp: 200,
    isPremium: true,
    order: 12,
    title_en: 'Tax Optimization Strategies',
    title_fr: 'Stratégies d\'Optimisation Fiscale',
    description_en: 'Legal ways to reduce your tax burden',
    description_fr: 'Moyens légaux de réduire votre charge fiscale',
    objectives_en: [
      'Understand tax brackets',
      'Learn about deductions vs credits',
      'Maximize retirement contributions',
      'Use tax-advantaged accounts',
      'Plan for capital gains'
    ],
    objectives_fr: [
      'Comprendre les tranches d\'imposition',
      'Apprendre déductions vs crédits',
      'Maximiser contributions retraite',
      'Utiliser comptes avantageux fiscalement',
      'Planifier les plus-values'
    ],
    prerequisites_en: ['Income source', 'Basic investing knowledge'],
    prerequisites_fr: ['Source de revenu', 'Connaissance investissement basique'],
    rewards: {
      badge: 'tax_strategist',
      unlocks: ['business-taxes', 'estate-planning']
    },
    steps: [
      {
        type: 'info',
        title_en: 'Tax Basics',
        title_fr: 'Bases Fiscales',
        content_en: 'Understanding taxes helps you keep more of what you earn through legal optimization.',
        content_fr: 'Comprendre les impôts vous aide à garder plus de ce que vous gagnez par optimisation légale.',
        funFact_en: 'The average person spends 30+ hours on taxes but only 2 hours learning to save on them!',
        funFact_fr: 'La personne moyenne passe 30+ heures sur les impôts mais seulement 2 heures à apprendre à économiser !'
      },
      {
        type: 'multiple_choice',
        question_en: 'Which reduces your taxes more: a $1,000 deduction or $1,000 credit?',
        question_fr: 'Qu\'est-ce qui réduit plus vos impôts : déduction 1000€ ou crédit 1000€ ?',
        options_en: [
          'Deduction (reduces taxable income)',
          'Credit (reduces tax owed)',
          'They\'re the same',
          'Depends on income'
        ],
        options_fr: [
          'Déduction (réduit revenu imposable)',
          'Crédit (réduit impôt dû)',
          'C\'est pareil',
          'Dépend du revenu'
        ],
        correct: 1,
        explanation_en: 'Credits reduce taxes dollar-for-dollar, while deductions only reduce taxable income.',
        explanation_fr: 'Les crédits réduisent les impôts euro pour euro, les déductions réduisent seulement le revenu imposable.',
        hint_en: 'One directly reduces what you owe...',
        hint_fr: 'L\'un réduit directement ce que vous devez...'
      },
      {
        type: 'checklist',
        title_en: 'Tax-Saving Checklist',
        title_fr: 'Checklist Économies Fiscales',
        items_en: [
          'Max out 401(k)/IRA contributions',
          'Use HSA for medical expenses',
          'Track charitable donations',
          'Harvest investment losses',
          'Time income and deductions'
        ],
        items_fr: [
          'Maximiser contributions retraite',
          'Utiliser HSA pour dépenses médicales',
          'Suivre dons charitables',
          'Récolter pertes d\'investissement',
          'Timer revenus et déductions'
        ],
        explanation_en: 'These strategies can save thousands in taxes legally every year.',
        explanation_fr: 'Ces stratégies peuvent économiser des milliers en impôts légalement chaque année.'
      }
    ]
  },

  // 13. Real Estate Basics (New)
  {
    id: 'real-estate-basics',
    category: 'investing',
    difficulty: 'advanced',
    duration: 30,
    xp: 200,
    isPremium: true,
    order: 13,
    title_en: 'Real Estate Investment Basics',
    title_fr: 'Bases de l\'Investissement Immobilier',
    description_en: 'Build wealth through property investment',
    description_fr: 'Construire la richesse par l\'investissement immobilier',
    objectives_en: [
      'Understand real estate as investment',
      'Learn about rental income',
      'Calculate ROI on properties',
      'Know financing options',
      'Understand REITs alternative'
    ],
    objectives_fr: [
      'Comprendre l\'immobilier comme investissement',
      'Apprendre sur les revenus locatifs',
      'Calculer ROI sur propriétés',
      'Connaître options de financement',
      'Comprendre l\'alternative REITs'
    ],
    prerequisites_en: ['Good credit score', 'Emergency fund', 'Investment basics'],
    prerequisites_fr: ['Bon score crédit', 'Fonds urgence', 'Bases investissement'],
    rewards: {
      badge: 'property_mogul',
      unlocks: ['rental-management', 'house-flipping']
    },
    steps: [
      {
        type: 'info',
        title_en: 'Why Real Estate?',
        title_fr: 'Pourquoi l\'Immobilier ?',
        content_en: 'Real estate provides passive income, appreciation, tax benefits, and inflation hedge.',
        content_fr: 'L\'immobilier fournit revenu passif, appréciation, avantages fiscaux, et protection inflation.',
        funFact_en: '90% of millionaires built wealth through real estate investing!',
        funFact_fr: '90% des millionnaires ont construit leur richesse par l\'investissement immobilier !'
      },
      {
        type: 'multiple_choice',
        question_en: 'What\'s the "1% rule" in rental property?',
        question_fr: 'Qu\'est-ce que la "règle du 1%" en location ?',
        options_en: [
          'Property tax should be 1%',
          'Monthly rent should be 1% of purchase price',
          'Down payment is 1%',
          'Annual appreciation of 1%'
        ],
        options_fr: [
          'Taxe foncière devrait être 1%',
          'Loyer mensuel devrait être 1% du prix d\'achat',
          'Acompte est 1%',
          'Appréciation annuelle de 1%'
        ],
        correct: 1,
        explanation_en: 'The 1% rule helps identify potentially profitable rentals: $200,000 property should rent for $2,000/month.',
        explanation_fr: 'La règle du 1% aide à identifier les locations rentables : propriété 200 000€ devrait louer 2000€/mois.',
        hint_en: 'It\'s about cash flow...',
        hint_fr: 'C\'est à propos du flux de trésorerie...'
      },
      {
        type: 'interactive_challenge',
        title_en: 'ROI Calculator',
        title_fr: 'Calculateur ROI',
        instructions_en: 'Calculate return on a rental property including all costs.',
        instructions_fr: 'Calculez le rendement d\'une propriété locative incluant tous les coûts.',
        challenge_type: 'roi_property',
        explanation_en: 'Don\'t forget: mortgage, taxes, insurance, maintenance, vacancy, and management fees!',
        explanation_fr: 'N\'oubliez pas : hypothèque, taxes, assurance, maintenance, vacance, et frais de gestion !'
      }
    ]
  },

  // 14. Side Hustle Finance (New)
  {
    id: 'side-hustle-finance',
    category: 'budgeting',
    difficulty: 'intermediate',
    duration: 25,
    xp: 150,
    isPremium: true,
    order: 14,
    title_en: 'Side Hustle Financial Management',
    title_fr: 'Gestion Financière Side Business',
    description_en: 'Manage finances for your side income streams',
    description_fr: 'Gérer les finances de vos revenus secondaires',
    objectives_en: [
      'Track multiple income sources',
      'Understand self-employment taxes',
      'Separate business and personal finances',
      'Plan for irregular income',
      'Scale your side hustle'
    ],
    objectives_fr: [
      'Suivre multiples sources de revenus',
      'Comprendre taxes auto-entrepreneur',
      'Séparer finances business et personnelles',
      'Planifier revenus irréguliers',
      'Faire croître votre side business'
    ],
    prerequisites_en: ['Basic budgeting', 'Some side income'],
    prerequisites_fr: ['Budget de base', 'Quelques revenus secondaires'],
    rewards: {
      badge: 'hustle_hero',
      unlocks: ['business-scaling', 'freelance-taxes']
    },
    steps: [
      {
        type: 'info',
        title_en: 'The Side Hustle Economy',
        title_fr: 'L\'Économie du Side Hustle',
        content_en: 'Over 45% of workers have side hustles. Managing the finances properly is crucial for growth.',
        content_fr: 'Plus de 45% des travailleurs ont un side hustle. Gérer les finances correctement est crucial pour la croissance.',
        funFact_en: 'The average side hustler earns $1,122 extra per month!',
        funFact_fr: 'Le side hustler moyen gagne 1122€ extra par mois !'
      },
      {
        type: 'checklist',
        title_en: 'Side Hustle Setup',
        title_fr: 'Configuration Side Hustle',
        items_en: [
          'Open separate business bank account',
          'Track all income and expenses',
          'Save 25-30% for taxes',
          'Invoice and payment system',
          'Monthly profit calculation'
        ],
        items_fr: [
          'Ouvrir compte bancaire business séparé',
          'Suivre tous revenus et dépenses',
          'Épargner 25-30% pour impôts',
          'Système de facturation et paiement',
          'Calcul profit mensuel'
        ],
        explanation_en: 'Treating your side hustle like a real business sets you up for success.',
        explanation_fr: 'Traiter votre side hustle comme un vrai business vous prépare au succès.'
      },
      {
        type: 'multiple_choice',
        question_en: 'As a freelancer, what percentage should you save for taxes?',
        question_fr: 'En tant que freelance, quel pourcentage épargner pour impôts ?',
        options_en: [
          '5-10%',
          '15-20%',
          '25-35%',
          '40-50%'
        ],
        options_fr: [
          '5-10%',
          '15-20%',
          '25-35%',
          '40-50%'
        ],
        correct: 2,
        explanation_en: 'Self-employment tax plus income tax typically requires saving 25-35% of gross income.',
        explanation_fr: 'Charges sociales plus impôt sur le revenu nécessitent typiquement d\'épargner 25-35% du revenu brut.',
        hint_en: 'Remember you pay both employer and employee portions...',
        hint_fr: 'Souvenez-vous que vous payez les parts employeur et employé...'
      }
    ]
  },

  // 15. Insurance Essentials (New)
  {
    id: 'insurance-essentials',
    category: 'planning',
    difficulty: 'intermediate',
    duration: 25,
    xp: 150,
    isPremium: true,
    order: 15,
    title_en: 'Insurance Essentials & Protection',
    title_fr: 'Essentiels d\'Assurance & Protection',
    description_en: 'Protect your wealth with smart insurance choices',
    description_fr: 'Protégez votre richesse avec des choix d\'assurance intelligents',
    objectives_en: [
      'Understand types of insurance needed',
      'Calculate appropriate coverage amounts',
      'Learn to compare policies effectively',
      'Avoid over-insurance pitfalls',
      'Know when to update coverage'
    ],
    objectives_fr: [
      'Comprendre types d\'assurance nécessaires',
      'Calculer montants de couverture appropriés',
      'Apprendre à comparer polices efficacement',
      'Éviter pièges de sur-assurance',
      'Savoir quand mettre à jour couverture'
    ],
    prerequisites_en: ['Basic financial literacy', 'Understanding of assets'],
    prerequisites_fr: ['Littératie financière de base', 'Compréhension des actifs'],
    rewards: {
      badge: 'protection_pro',
      unlocks: ['estate-planning', 'wealth-preservation']
    },
    steps: [
      {
        type: 'info',
        title_en: 'Insurance: Your Financial Safety Net',
        title_fr: 'Assurance : Votre Filet de Sécurité Financier',
        content_en: 'Insurance protects your wealth from catastrophic losses. It\'s not about everything going wrong, but being prepared if it does.',
        content_fr: 'L\'assurance protège votre richesse des pertes catastrophiques. Ce n\'est pas tout qui va mal, mais être préparé si c\'est le cas.',
        funFact_en: 'The average American is underinsured by $250,000 in life insurance!',
        funFact_fr: 'L\'Américain moyen est sous-assuré de 250 000$ en assurance vie !'
      },
      {
        type: 'multiple_choice',
        question_en: 'How much life insurance do you typically need?',
        question_fr: 'Combien d\'assurance vie avez-vous typiquement besoin ?',
        options_en: [
          '1x annual income',
          '3-5x annual income',
          '10x annual income',
          '$100,000 flat amount'
        ],
        options_fr: [
          '1x revenu annuel',
          '3-5x revenu annuel',
          '10x revenu annuel',
          '100 000€ montant fixe'
        ],
        correct: 2,
        explanation_en: 'Most experts recommend 10x annual income to cover debts, expenses, and provide for dependents.',
        explanation_fr: 'La plupart des experts recommandent 10x le revenu annuel pour couvrir dettes, dépenses, et subvenir aux besoins des dépendants.',
        hint_en: 'Think about long-term family needs...',
        hint_fr: 'Pensez aux besoins familiaux à long terme...'
      },
      {
        type: 'checklist',
        title_en: 'Essential Insurance Checklist',
        title_fr: 'Checklist Assurance Essentielle',
        items_en: [
          'Health insurance with good coverage',
          'Auto insurance (liability + comprehensive)',
          'Renters/Homeowners insurance',
          'Life insurance if dependents',
          'Disability insurance for income protection'
        ],
        items_fr: [
          'Assurance santé avec bonne couverture',
          'Assurance auto (responsabilité + complète)',
          'Assurance locataire/propriétaire',
          'Assurance vie si dépendants',
          'Assurance invalidité pour protection revenu'
        ],
        explanation_en: 'These five types form the foundation of financial protection.',
        explanation_fr: 'Ces cinq types forment la fondation de la protection financière.'
      },
      {
        type: 'interactive_challenge',
        title_en: 'Coverage Calculator',
        title_fr: 'Calculateur de Couverture',
        instructions_en: 'Calculate your life insurance needs based on debts, income replacement, and future expenses.',
        instructions_fr: 'Calculez vos besoins d\'assurance vie basés sur dettes, remplacement de revenu, et dépenses futures.',
        challenge_type: 'insurance_calc',
        explanation_en: 'Remember: It\'s better to be slightly over-insured than risk leaving loved ones in financial hardship.',
        explanation_fr: 'Souvenez-vous : Mieux vaut être légèrement sur-assuré que risquer de laisser les proches en difficulté financière.'
      }
    ]
  },

  // 16. FIRE Movement (New – Advanced Planning)
  {
    id: 'fire-movement',
    category: 'planning',
    difficulty: 'advanced',
    duration: 30,
    xp: 200,
    isPremium: true,
    order: 16,
    title_en: 'Financial Independence & Early Retirement (FIRE)',
    title_fr: 'Indépendance financière & Retraite anticipée (FIRE)',
    description_en: 'Design a roadmap to retire decades early through aggressive saving and smart investing',
    description_fr: 'Élaborez une feuille de route pour prendre votre retraite des décennies plus tôt grâce à une épargne agressive et des investissements avisés',
    objectives_en: [
      'Calculate your FIRE number',
      'Understand LeanFIRE vs FatFIRE',
      'Optimize savings rate above 50%',
      'Choose tax‑efficient investment vehicles',
      'Plan withdrawal strategies using the 4% rule'
    ],
    objectives_fr: [
      'Calculer votre nombre FIRE',
      'Comprendre LeanFIRE vs FatFIRE',
      'Optimiser un taux d\'épargne supérieur à 50%',
      'Choisir des véhicules d\'investissement fiscalement efficaces',
      'Planifier les retraits avec la règle des 4%'
    ],
    prerequisites_en: ['Retirement Planning Essentials'],
    prerequisites_fr: ['Essentiels de Planification Retraite'],
    rewards: {
      badge: 'firestarter',
      unlocks: ['geo-arbitrage', 'barista-fi']
    },
    icon: 'mdi-fire',
    themeColor: '#FF6F61',
    steps: [
      {
        type: 'info',
        title_en: 'What is FIRE?',
        title_fr: 'Qu\'est-ce que le FIRE ?',
        content_en: 'FIRE is a movement focused on extreme saving and investing to achieve financial independence and retire early.',
        content_fr: 'Le FIRE est un mouvement axé sur une épargne et un investissement extrêmes pour atteindre l\'indépendance financière et prendre une retraite anticipée.',
        funFact_en: 'Some FIRE followers save 70%+ of their income to retire in their 30s!',
        funFact_fr: 'Certains adeptes du FIRE épargnent plus de 70% de leur revenu pour partir à la retraite dans la trentaine !'
      },
      {
        type: 'interactive_challenge',
        challenge_type: 'fire_calc',
        title_en: 'Find Your FIRE Number',
        title_fr: 'Trouvez Votre Nombre FIRE',
        instructions_en: 'Multiply your desired annual expenses by 25 to estimate the nest egg needed.',
        instructions_fr: 'Multipliez vos dépenses annuelles souhaitées par 25 pour estimer le capital nécessaire.'
      },
      {
        type: 'checklist',
        title_en: 'FIRE Action Plan',
        title_fr: 'Plan d\'Action FIRE',
        items_en: [
          'Track every expense for accuracy',
          'Increase income via side hustles',
          'Cut non‑essential spending ruthlessly',
          'Invest in low‑fee index funds',
          'Review progress quarterly'
        ],
        items_fr: [
          'Suivre chaque dépense',
          'Augmenter les revenus via side hustles',
          'Réduire les dépenses non essentielles',
          'Investir dans des fonds indiciels à faibles frais',
          'Réviser les progrès chaque trimestre'
        ],
        explanation_en: 'Small consistent changes compound into massive results over a decade.',
        explanation_fr: 'De petits changements cohérents se transforment en résultats massifs sur une décennie.'
      }
    ]
  },
];

/**
 * Get quest by ID with language support
 */
export const getQuestById = (questId, lang = 'en') => {
  const quest = questTemplates.find(q => q.id === questId);
  if (!quest) return null;
  
  return localizeQuest(quest, lang);
};

/**
 * Get quests by category
 */
export const getQuestsByCategory = (category, lang = 'en') => {
  return questTemplates
    .filter(quest => quest.category === category)
    .map(quest => localizeQuest(quest, lang))
    .sort((a, b) => a.order - b.order);
};

/**
 * Get free quests only
 */
export const getFreeQuests = (lang = 'en') => {
  return questTemplates
    .filter(quest => !quest.isPremium)
    .map(quest => localizeQuest(quest, lang));
};

/**
 * Get premium quests only
 */
export const getPremiumQuests = (lang = 'en') => {
  return questTemplates
    .filter(quest => quest.isPremium)
    .map(quest => localizeQuest(quest, lang));
};

/**
 * Get recommended quests based on user progress
 */
export const getRecommendedQuests = (completedQuestIds, userLevel, lang = 'en') => {
  const difficultyMap = {
    'Novice': 'beginner',
    'Apprentice': 'beginner',
    'Explorer': 'intermediate',
    'Adventurer': 'intermediate',
    'Expert': 'advanced',
    'Master': 'expert',
    'Legend': 'expert'
  };
  
  const userDifficulty = difficultyMap[userLevel] || 'beginner';
  
  return questTemplates
    .filter(quest => 
      !completedQuestIds.includes(quest.id) &&
      (quest.difficulty === userDifficulty || 
       quest.difficulty === 'beginner') // Always show beginner quests
    )
    .map(quest => localizeQuest(quest, lang))
    .slice(0, 3); // Return top 3 recommendations
};

/**
 * Localize quest object based on language
 */
export const localizeQuest = (quest, lang) => {
  const localizedQuest = {
    ...quest,
    title: quest[`title_${lang}`] || quest.title_en,
    description: quest[`description_${lang}`] || quest.description_en,
    objectives: quest[`objectives_${lang}`] || quest.objectives_en,
    prerequisites: quest[`prerequisites_${lang}`] || quest.prerequisites_en,
    steps: quest.steps.map(step => {
      const localizedStep = {
        ...step,
        title: step[`title_${lang}`] || step.title_en || step.title,
        content: step[`content_${lang}`] || step.content_en || step.content,
        question: step[`question_${lang}`] || step.question_en || step.question,
        instruction: step[`instruction_${lang}`] || step.instruction_en || step.instruction,
        description: step[`description_${lang}`] || step.description_en || step.description,
        explanation: step[`explanation_${lang}`] || step.explanation_en || step.explanation,
        hint: step[`hint_${lang}`] || step.hint_en || step.hint,
        funFact: step[`funFact_${lang}`] || step.funFact_en || step.funFact
      };
      
      // Gérer les options selon le type
      if (step.options_en && step.options_fr) {
        // Format séparé pour les langues
        localizedStep.options = step[`options_${lang}`] || step.options_en;
      } else if (step.options && Array.isArray(step.options)) {
        // Format avec objets ou strings
        localizedStep.options = step.options.map(opt => {
          if (typeof opt === 'object' && (opt[lang] || opt.en || opt.fr)) {
            return opt[lang] || opt.en || opt.fr;
          }
          return opt;
        });
      }

      // Gérer les tâches pour les checklists
      if (step.tasks) {
        localizedStep.tasks = step.tasks.map(task => {
          if (typeof task === 'object') {
            return {
              ...task,
              text: task[lang] || task.en || task.fr || task.text,
              tips: task[`tips_${lang}`] || task.tips_en || task.tips
            };
          }
          return task;
        });
      }
      
      return localizedStep;
    })
  };
  
  // Nettoyer l'objet
  Object.keys(localizedQuest).forEach(key => {
    if (key.includes('_en') || key.includes('_fr')) {
      delete localizedQuest[key];
    }
  });
  
  return localizedQuest;
};

/**
 * Get quest statistics
 */
export const getQuestStats = () => {
  const total = questTemplates.length;
  const free = questTemplates.filter(q => !q.isPremium).length;
  const premium = questTemplates.filter(q => q.isPremium).length;
  
  const byCategory = questTemplates.reduce((acc, quest) => {
    acc[quest.category] = (acc[quest.category] || 0) + 1;
    return acc;
  }, {});
  
  const byDifficulty = questTemplates.reduce((acc, quest) => {
    acc[quest.difficulty] = (acc[quest.difficulty] || 0) + 1;
    return acc;
  }, {});
  
  return {
    total,
    free,
    premium,
    byCategory,
    byDifficulty
  };
};

/**
 * Calculate estimated completion time for multiple quests
 */
export const calculateTotalTime = (questIds) => {
  const totalMinutes = questIds.reduce((total, questId) => {
    const quest = questTemplates.find(q => q.id === questId);
    return total + (quest?.duration || 0);
  }, 0);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return { hours, minutes, totalMinutes };
};

/**
 * Export quest data for Firestore seeding
 */
export const exportForFirestore = () => {
  return questTemplates.map(quest => ({
    ...quest,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    active: true
  }));
};