import { FaUserTie, FaPiggyBank, FaCalculator, FaChartLine } from 'react-icons/fa';

export const retraiteFrance = {
  id: 'retraite-france',
  category: 'planning',
  country: 'fr-FR',
  difficulty: 'intermediate',
  duration: 30,
  xp: 250,
  isPremium: false,
  order: 1,
  
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['france', 'retirement', 'pension', 'intermediate'],
    relatedQuests: ['livret-a', 'pel', 'fire-movement'],
    averageCompletionTime: 25,
    completionRate: 0.70,
    userRating: 4.5,
    featured: true
  },

  icons: {
    main: FaUserTie,
    steps: [FaPiggyBank, FaCalculator, FaChartLine]
  },
  
  colors: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#FBBF24'
  },

  content: {
    en: {
      title: 'French Retirement System',
      description: 'Understand France\'s retirement system and plan for your future',
      longDescription: 'Learn about the French retirement system, including the basic pension, supplementary pensions, and how to optimize your retirement planning in France.',
      objectives: [
        'Understand the French retirement system structure',
        'Learn about basic and supplementary pensions',
        'Know how to calculate your retirement benefits',
        'Plan for retirement optimization in France'
      ],
      prerequisites: ['Basic understanding of retirement planning'],
      whatYouWillLearn: [
        'The three-pillar French retirement system',
        'How to calculate your retirement age and benefits',
        'Supplementary pension options (PER, PERP)',
        'Tax optimization for retirement savings'
      ],
      realWorldApplication: 'You\'ll be able to understand your French retirement rights, calculate your expected benefits, and make informed decisions about your retirement planning strategy.'
    },
    fr: {
      title: 'Système de Retraite Français',
      description: 'Comprendre le système de retraite français et planifier votre avenir',
      longDescription: 'Apprenez le système de retraite français, y compris la retraite de base, les retraites complémentaires, et comment optimiser votre planification de retraite en France.',
      objectives: [
        'Comprendre la structure du système de retraite français',
        'Apprendre les retraites de base et complémentaires',
        'Savoir calculer vos droits à la retraite',
        'Planifier l\'optimisation de la retraite en France'
      ],
      prerequisites: ['Compréhension de base de la planification de retraite'],
      whatYouWillLearn: [
        'Le système de retraite français à trois piliers',
        'Comment calculer votre âge de retraite et vos droits',
        'Les options de retraite complémentaire (PER, PERP)',
        'L\'optimisation fiscale pour l\'épargne retraite'
      ],
      realWorldApplication: 'Vous pourrez comprendre vos droits à la retraite française, calculer vos prestations attendues, et prendre des décisions éclairées sur votre stratégie de planification de retraite.'
    }
  },

  rewards: {
    badge: {
      id: 'retraite_expert',
      name: { en: 'French Retirement Expert', fr: 'Expert Retraite Française' },
      description: { 
        en: 'You\'ve mastered France\'s retirement system!', 
        fr: 'Vous maîtrisez le système de retraite français !' 
      },
      rarity: 'uncommon',
      imageUrl: '/badges/retraite-expert.png'
    },
    unlocks: ['fire-movement', 'tax-optimization'],
    bonusXP: {
      firstTime: 50,
      speedBonus: 25,
      perfectScore: 35
    }
  },

  steps: [
    {
      id: 'retraite-intro',
      type: 'info',
      title: { en: 'French Retirement System Overview', fr: 'Aperçu du Système de Retraite Français' },
      content: {
        en: {
          text: 'France has a three-pillar retirement system: basic pension (CNAV), supplementary pensions (ARRCO/AGIRC), and individual savings (PER, PERP).',
          funFact: 'Did you know? The French retirement system was created in 1945 and is one of the most generous in the world!'
        },
        fr: {
          text: 'La France a un système de retraite à trois piliers : retraite de base (CNAV), retraites complémentaires (ARRCO/AGIRC), et épargne individuelle (PER, PERP).',
          funFact: 'Le saviez-vous ? Le système de retraite français a été créé en 1945 et est l\'un des plus généreux au monde !'
        }
      },
      xp: 10
    },
    {
      id: 'retraite-age',
      type: 'quiz',
      title: { en: 'Retirement Age', fr: 'Âge de Retraite' },
      content: {
        en: {
          question: 'What is the current full retirement age in France?',
          options: [
            '60 years',
            '62 years',
            '65 years',
            '67 years'
          ],
          correctAnswer: 1,
          explanation: 'The current full retirement age in France is 62 years. However, you need 43 years of contributions for a full pension.',
          hint: 'The age was increased from 60 to 62 in recent reforms...'
        },
        fr: {
          question: 'Quel est l\'âge de retraite actuel en France ?',
          options: [
            '60 ans',
            '62 ans',
            '65 ans',
            '67 ans'
          ],
          correctAnswer: 1,
          explanation: 'L\'âge de retraite actuel en France est de 62 ans. Cependant, vous avez besoin de 43 ans de cotisations pour une retraite complète.',
          hint: 'L\'âge a été augmenté de 60 à 62 ans dans les réformes récentes...'
        }
      },
      xp: 25
    },
    {
      id: 'retraite-calcul',
      type: 'multiple_choice',
      title: { en: 'Pension Calculation', fr: 'Calcul de Pension' },
      question: { 
        en: 'How is the basic French pension calculated?', 
        fr: 'Comment la retraite de base française est-elle calculée ?' 
      },
      options: {
        en: [
          '50% of your best 25 years',
          '50% of your average salary',
          '50% of your last salary',
          '50% of your total career earnings'
        ],
        fr: [
          '50% de vos 25 meilleures années',
          '50% de votre salaire moyen',
          '50% de votre dernier salaire',
          '50% de vos revenus totaux de carrière'
        ]
      },
      correct: 0,
      explanation: {
        en: 'The basic pension is calculated as 50% of your average salary from your best 25 years, adjusted for inflation.',
        fr: 'La retraite de base est calculée comme 50% de votre salaire moyen de vos 25 meilleures années, ajusté pour l\'inflation.'
      },
      hint: {
        en: 'Think about how to ensure a fair calculation...',
        fr: 'Pensez à comment assurer un calcul équitable...'
      },
      xp: 20
    },
    {
      id: 'retraite-per',
      type: 'quiz',
      title: { en: 'PER: Retirement Savings Plan', fr: 'PER : Plan d\'Épargne Retraite' },
      content: {
        en: {
          question: 'What is the main advantage of a PER (Plan d\'Épargne Retraite)?',
          options: [
            'Higher interest rates',
            'Tax deduction on contributions',
            'No withdrawal restrictions',
            'Government guarantee'
          ],
          correctAnswer: 1,
          explanation: 'The main advantage of PER is tax deduction on contributions. You can deduct up to 10% of your professional income.',
          hint: 'Think about the tax benefits...'
        },
        fr: {
          question: 'Quel est le principal avantage d\'un PER (Plan d\'Épargne Retraite) ?',
          options: [
            'Taux d\'intérêt plus élevés',
            'Déduction fiscale sur les cotisations',
            'Aucune restriction de retrait',
            'Garantie gouvernementale'
          ],
          correctAnswer: 1,
          explanation: 'Le principal avantage du PER est la déduction fiscale sur les cotisations. Vous pouvez déduire jusqu\'à 10% de vos revenus professionnels.',
          hint: 'Pensez aux avantages fiscaux...'
        }
      },
      xp: 25
    },
    {
      id: 'retraite-optimization',
      type: 'checklist',
      title: { en: 'Retirement Optimization', fr: 'Optimisation de la Retraite' },
      items: {
        en: [
          'Check your career history on the CNAV website',
          'Calculate your expected retirement age',
          'Consider opening a PER for tax optimization',
          'Plan for supplementary pension contributions',
          'Review your retirement strategy every 5 years'
        ],
        fr: [
          'Vérifiez votre carrière sur le site de la CNAV',
          'Calculez votre âge de retraite attendu',
          'Envisagez d\'ouvrir un PER pour l\'optimisation fiscale',
          'Planifiez vos cotisations de retraite complémentaire',
          'Révisez votre stratégie de retraite tous les 5 ans'
        ]
      },
      explanation: {
        en: 'Optimizing your French retirement requires regular monitoring and strategic planning. Start early and review regularly.',
        fr: 'Optimiser votre retraite française nécessite un suivi régulier et une planification stratégique. Commencez tôt et révisez régulièrement.'
      },
      xp: 25
    },
    {
      id: 'retraite-strategy',
      type: 'action',
      title: { en: 'Retirement Strategy', fr: 'Stratégie de Retraite' },
      content: {
        en: {
          description: 'Create your French retirement strategy',
          actions: [
            {
              id: 'retraite_action_1',
              title: 'Check your career history',
              description: 'Access your CNAV account and verify your career history',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'retraite_action_2',
              title: 'Calculate your retirement age',
              description: 'Use the CNAV simulator to estimate your retirement age',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'retraite_action_3',
              title: 'Research PER options',
              description: 'Compare different PER providers and their conditions',
              verification: 'manual',
              xp: 10
            }
          ]
        },
        fr: {
          description: 'Créez votre stratégie de retraite française',
          actions: [
            {
              id: 'retraite_action_1',
              title: 'Vérifiez votre carrière',
              description: 'Accédez à votre compte CNAV et vérifiez votre carrière',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'retraite_action_2',
              title: 'Calculez votre âge de retraite',
              description: 'Utilisez le simulateur CNAV pour estimer votre âge de retraite',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'retraite_action_3',
              title: 'Recherchez les options PER',
              description: 'Comparez différents fournisseurs PER et leurs conditions',
              verification: 'manual',
              xp: 10
            }
          ]
        }
      },
      xp: 25
    }
  ],

  analytics: {
    completionRate: 0.70,
    averageTime: 25,
    difficultyRating: 2.5,
    userSatisfaction: 4.5,
    retryRate: 0.20,
    dropoffPoints: ['retraite-calcul', 'retraite-strategy'],
    popularFeatures: ['french-system', 'tax-optimization', 'retirement-planning']
  }
}; 