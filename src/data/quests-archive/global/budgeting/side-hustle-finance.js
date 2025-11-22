import { FaBriefcase, FaChartLine, FaCalculator } from 'react-icons/fa';

export const sideHustleFinance = {
  id: 'side-hustle-finance',
  category: 'budgeting',
  difficulty: 'intermediate',
  duration: 40,
  xp: 240,
  isPremium: true,
  order: 14,
  
  // Métadonnées enrichies
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['income', 'business', 'entrepreneurship'],
    relatedQuests: ['business-scaling', 'freelance-taxes'],
    averageCompletionTime: 22,
    completionRate: 0.78,
    userRating: 4.7
  },

  // Icônes spécifiques
  icons: {
    main: FaBriefcase,
    steps: [FaChartLine, FaCalculator]
  },
  
  // Couleurs thématiques
  colors: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#10B981'
  },

  // Contenu localisé structuré
  content: {
    en: {
      title: 'Side Hustle Financial Management',
      description: 'Manage finances for your side income streams',
      longDescription: 'Learn to properly manage multiple income sources, understand self-employment taxes, separate business and personal finances, and scale your side hustle effectively.',
      objectives: [
        'Track multiple income sources',
        'Understand self-employment taxes',
        'Separate business and personal finances',
        'Plan for irregular income',
        'Scale your side hustle'
      ],
      prerequisites: ['Basic budgeting', 'Some side income'],
      whatYouWillLearn: [
        'Multiple income stream management',
        'Self-employment tax obligations',
        'Business vs personal finance separation',
        'Irregular income planning',
        'Side hustle scaling strategies'
      ],
      realWorldApplication: 'Apply these principles to manage your side hustle finances professionally and prepare for business growth.'
    },
    fr: {
      title: 'Gestion Financière Side Business',
      description: 'Gérer les finances de vos revenus secondaires',
      longDescription: 'Apprenez à gérer correctement plusieurs sources de revenus, comprendre les taxes auto-entrepreneur, séparer finances business et personnelles, et faire croître votre side hustle efficacement.',
      objectives: [
        'Suivre multiples sources de revenus',
        'Comprendre taxes auto-entrepreneur',
        'Séparer finances business et personnelles',
        'Planifier revenus irréguliers',
        'Faire croître votre side business'
      ],
      prerequisites: ['Budget de base', 'Quelques revenus secondaires'],
      whatYouWillLearn: [
        'Gestion de multiples flux de revenus',
        'Obligations fiscales auto-entrepreneur',
        'Séparation finances business vs personnelles',
        'Planification revenus irréguliers',
        'Stratégies de croissance side hustle'
      ],
      realWorldApplication: 'Appliquez ces principes pour gérer vos finances side hustle professionnellement et préparer la croissance de votre business.'
    }
  },

  // Rewards enrichis
  rewards: {
    badge: {
      id: 'hustle_hero',
      name: { en: 'Hustle Hero', fr: 'Héros du Hustle' },
      description: { 
        en: 'Mastered side hustle financial management and scaling',
        fr: 'Maîtrisé la gestion financière et la croissance du side hustle'
      },
      rarity: 'rare',
      imageUrl: '/badges/hustle-hero.png'
    },
    unlocks: ['business-scaling', 'freelance-taxes'],
    bonusXP: {
      firstTime: 75,
      speedBonus: 35,
      perfectScore: 40
    }
  },

  // Steps avec ACTION CHALLENGE
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
      hint_fr: 'Souvenez-vous que vous payez les parts employeur et employé...',
      difficulty: 'medium',
      points: 15
    },
    {
      id: 'business-structure',
      type: 'multiple_choice',
      title: { en: 'Business Structure for Side Hustles', fr: 'Structure d\'Entreprise pour Activités Parallèles' },
      question: { 
        en: 'Which business structure is simplest for most side hustles?', 
        fr: 'Quelle structure d\'entreprise est la plus simple pour la plupart des activités parallèles ?' 
      },
      options: {
        en: [
          'Corporation',
          'Sole Proprietorship',
          'Partnership',
          'LLC'
        ],
        fr: [
          'Corporation',
          'Entreprise individuelle',
          'Partenariat',
          'SARL'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Sole proprietorship is the simplest structure - you report income on your personal tax return and have minimal paperwork.',
        fr: 'L\'entreprise individuelle est la structure la plus simple - vous déclarez les revenus sur votre déclaration personnelle avec un minimum de paperasserie.'
      },
      hint: {
        en: 'Think about the structure with the least complexity and paperwork...',
        fr: 'Pensez à la structure avec le moins de complexité et de paperasserie...'
      },
      xp: 20
    },
    {
      id: 'expense-tracking',
      type: 'checklist',
      title: { en: 'Deductible Side Hustle Expenses', fr: 'Dépenses Déductibles d\'Activité Parallèle' },
      items: {
        en: [
          'Home office expenses (percentage of rent/utilities)',
          'Equipment and supplies (computer, software, tools)',
          'Professional development and training',
          'Marketing and advertising costs',
          'Travel and transportation for business'
        ],
        fr: [
          'Dépenses de bureau à domicile (pourcentage loyer/services)',
          'Équipement et fournitures (ordinateur, logiciels, outils)',
          'Développement professionnel et formation',
          'Coûts de marketing et publicité',
          'Voyage et transport pour affaires'
        ]
      },
      explanation: {
        en: 'Tracking business expenses can significantly reduce your tax burden. Keep receipts and document business use.',
        fr: 'Suivre les dépenses d\'entreprise peut réduire significativement votre fardeau fiscal. Gardez les reçus et documentez l\'usage professionnel.'
      },
      xp: 25
    },
    {
      id: 'income-streams',
      type: 'multiple_choice',
      title: { en: 'Diversifying Side Hustle Income', fr: 'Diversifier les Revenus d\'Activité Parallèle' },
      question: { 
        en: 'Why is it important to diversify your side hustle income streams?', 
        fr: 'Pourquoi est-il important de diversifier vos sources de revenus d\'activité parallèle ?' 
      },
      options: {
        en: [
          'It\'s not important - focus on one thing',
          'Reduces risk and increases stability',
          'Makes taxes more complicated',
          'Requires more time investment'
        ],
        fr: [
          'Ce n\'est pas important - concentrez-vous sur une chose',
          'Réduit le risque et augmente la stabilité',
          'Complique les impôts',
          'Demande plus d\'investissement temps'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Diversifying income streams reduces dependency on a single source and provides more stable overall income.',
        fr: 'Diversifier les sources de revenus réduit la dépendance à une seule source et procure un revenu global plus stable.'
      },
      hint: {
        en: 'Think about the principle of "not putting all eggs in one basket"...',
        fr: 'Pensez au principe de "ne pas mettre tous ses œufs dans le même panier"...'
      },
      xp: 20
    },
    {
      id: 'scaling-strategies',
      type: 'quiz',
      title: { en: 'Scaling Your Side Hustle', fr: 'Faire Grandir Votre Activité Parallèle' },
      question: { 
        en: 'What percentage of side hustle income should you reinvest for growth?', 
        fr: 'Quel pourcentage des revenus d\'activité parallèle devriez-vous réinvestir pour la croissance ?' 
      },
      correctAnswer: { en: '20-30%', fr: '20-30%' },
      acceptedAnswers: {
        en: ['20-30%', '20%', '25%', '30%', 'twenty to thirty percent'],
        fr: ['20-30%', '20%', '25%', '30%', 'vingt à trente pour cent']
      },
      explanation: {
        en: 'Reinvesting 20-30% of profits into marketing, equipment, or skill development helps grow your side hustle sustainably.',
        fr: 'Réinvestir 20-30% des profits dans le marketing, équipement ou développement de compétences aide à faire grandir votre activité de façon durable.'
      },
      hint: {
        en: 'Think about a balance between growth and taking profits...',
        fr: 'Pensez à un équilibre entre croissance et prise de profits...'
      },
      xp: 25
    },
    {
      id: 'action-challenge',
      type: 'action',
      duration: 20,
      content: {
        en: {
          title: '💼 Side Hustle Action Challenge',
          subtitle: 'Professionalize your side income!',
          description: 'Take real actions to set up proper financial management for your side hustle',
          timeLimit: 72, // hours
          actions: [
            {
              id: 'hustle_action_1',
              title: '📱 Quick Win: Track your side hustle income',
              description: 'Create a simple spreadsheet to track all side hustle income for the past month',
              difficulty: 'easy',
              xp: 75,
              timeEstimate: '15 min',
              tips: [
                'Include all income sources',
                'Note payment dates',
                'Track payment methods used'
              ],
              verificationMethod: 'screenshot',
              successCriteria: 'Show completed income tracking spreadsheet'
            },
            {
              id: 'hustle_action_2',
              title: '💰 Set up business banking',
              description: 'Open a separate business bank account or create a dedicated savings account',
              difficulty: 'medium',
              xp: 150,
              timeEstimate: '30 min',
              verificationMethod: 'self_report',
              reflection: 'How will this separation help your financial organization?'
            },
            {
              id: 'hustle_action_3',
              title: '🏆 Boss Mode: Create a side hustle budget',
              description: 'Develop a comprehensive budget including expenses, tax savings, and growth fund',
              difficulty: 'hard',
              xp: 300,
              timeEstimate: '45-60 min',
              tools: ['Spreadsheet software', 'Income records'],
              bonus: 'Share your budget breakdown for 75 bonus XP!'
            }
          ]
        },
        fr: {
          title: '💼 Défi Action Side Hustle',
          subtitle: 'Professionnalisez vos revenus secondaires !',
          description: 'Prenez des actions réelles pour mettre en place une gestion financière appropriée pour votre side hustle',
          timeLimit: 72, // heures
          actions: [
            {
              id: 'hustle_action_1',
              title: '📱 Victoire Rapide : Suivez vos revenus side hustle',
              description: 'Créez un simple tableau pour suivre tous les revenus side hustle du mois dernier',
              difficulty: 'easy',
              xp: 75,
              timeEstimate: '15 min',
              tips: [
                'Incluez toutes les sources de revenus',
                'Notez les dates de paiement',
                'Suivez les méthodes de paiement utilisées'
              ],
              verificationMethod: 'screenshot',
              successCriteria: 'Montrer le tableau de suivi des revenus complété'
            },
            {
              id: 'hustle_action_2',
              title: '💰 Configurez la banque business',
              description: 'Ouvrez un compte bancaire business séparé ou créez un compte épargne dédié',
              difficulty: 'medium',
              xp: 150,
              timeEstimate: '30 min',
              verificationMethod: 'self_report',
              reflection: 'Comment cette séparation aidera votre organisation financière ?'
            },
            {
              id: 'hustle_action_3',
              title: '🏆 Mode Boss : Créez un budget side hustle',
              description: 'Développez un budget complet incluant dépenses, épargne fiscale, et fonds de croissance',
              difficulty: 'hard',
              xp: 300,
              timeEstimate: '45-60 min',
              tools: ['Logiciel de tableau', 'Registres de revenus'],
              bonus: 'Partagez votre répartition budgétaire pour 75 XP bonus !'
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
      targetCompletionRate: 0.78,
      targetSatisfaction: 4.7
    }
  }
};

// Helper function spécifique à cette quête
export const getSideHustleFinanceHelpers = () => ({
  calculateTaxSavings: (grossIncome, taxRate) => {
    return grossIncome * (taxRate / 100);
  },
  getNextStep: (currentStep) => {
    // Logique spécifique
  }
}); 