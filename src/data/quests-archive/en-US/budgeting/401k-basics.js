import { FaBuilding, FaDollarSign, FaChartLine, FaCalculator } from 'react-icons/fa';

export const fourZeroOneKBasics = {
  id: '401k-basics',
  category: 'budgeting',
  country: 'en-US',
  difficulty: 'intermediate',
  duration: 30,
  xp: 250,
  isPremium: false,
  order: 2,
  
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['usa', 'retirement', '401k', 'employer', 'intermediate'],
    relatedQuests: ['roth-ira', 'investing-basics'],
    averageCompletionTime: 25,
    completionRate: 0.80,
    userRating: 4.7,
    featured: true
  },

  icons: {
    main: FaBuilding,
    steps: [FaDollarSign, FaChartLine, FaCalculator]
  },
  
  colors: {
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#FBBF24'
  },

  content: {
    en: {
      title: '401(k) Basics: Employer Retirement Plans',
      description: 'Learn about 401(k) plans and how to maximize your employer-sponsored retirement savings',
      longDescription: 'Discover 401(k) plans, the most common employer-sponsored retirement plan in the US. Learn about contribution limits, employer matching, investment options, and how to optimize your retirement savings.',
      objectives: [
        'Understand what a 401(k) is and how it works',
        'Learn about contribution limits and employer matching',
        'Know how to choose and manage your investments',
        'Understand when to roll over your 401(k)'
      ],
      prerequisites: ['Basic understanding of retirement planning'],
      whatYouWillLearn: [
        'How 401(k) plans work and their benefits',
        'Contribution limits and employer matching strategies',
        'Investment options and asset allocation',
        'Rollover and distribution rules'
      ],
      realWorldApplication: 'You\'ll be able to enroll in your employer\'s 401(k) plan, maximize your contributions, choose appropriate investments, and make informed decisions about your retirement savings.'
    },
    fr: {
      title: '401(k) : Plans de Retraite d\'Employeur',
      description: 'Découvrez les plans 401(k) et comment maximiser votre épargne retraite parrainée par l\'employeur',
      longDescription: 'Découvrez les plans 401(k), le plan de retraite parrainé par l\'employeur le plus courant aux États-Unis. Apprenez les limites de cotisation, la contribution de l\'employeur, les options d\'investissement, et comment optimiser votre épargne retraite.',
      objectives: [
        'Comprendre ce qu\'est un 401(k) et comment il fonctionne',
        'Apprendre les limites de cotisation et la contribution de l\'employeur',
        'Savoir choisir et gérer vos investissements',
        'Comprendre quand transférer votre 401(k)'
      ],
      prerequisites: ['Compréhension de base de la planification de retraite'],
      whatYouWillLearn: [
        'Comment fonctionnent les plans 401(k) et leurs avantages',
        'Limites de cotisation et stratégies de contribution employeur',
        'Options d\'investissement et allocation d\'actifs',
        'Règles de transfert et de distribution'
      ],
      realWorldApplication: 'Vous pourrez vous inscrire au plan 401(k) de votre employeur, maximiser vos cotisations, choisir des investissements appropriés, et prendre des décisions éclairées sur votre épargne retraite.'
    }
  },

  rewards: {
    badge: {
      id: '401k_expert',
      name: { en: '401(k) Expert', fr: 'Expert 401(k)' },
      description: { 
        en: 'You\'ve mastered employer-sponsored retirement planning!', 
        fr: 'Vous maîtrisez la planification de retraite parrainée par l\'employeur !' 
      },
      rarity: 'uncommon',
      imageUrl: '/badges/401k-expert.png'
    },
    unlocks: ['roth-ira', 'investing-basics'],
    bonusXP: {
      firstTime: 50,
      speedBonus: 25,
      perfectScore: 35
    }
  },

  steps: [
    {
      id: '401k-intro',
      type: 'info',
      title: { en: 'What is a 401(k)?', fr: 'Qu\'est-ce qu\'un 401(k) ?' },
      content: {
        en: {
          text: 'A 401(k) is an employer-sponsored retirement plan that allows employees to save and invest a portion of their paycheck before taxes are taken out.',
          funFact: 'Did you know? The 401(k) was created in 1978 and named after section 401(k) of the Internal Revenue Code!'
        },
        fr: {
          text: 'Un 401(k) est un plan de retraite parrainé par l\'employeur qui permet aux employés d\'épargner et d\'investir une partie de leur salaire avant que les impôts soient prélevés.',
          funFact: 'Le saviez-vous ? Le 401(k) a été créé en 1978 et nommé d\'après la section 401(k) du Code des Revenus Internes !'
        }
      },
      xp: 10
    },
    {
      id: '401k-contributions',
      type: 'quiz',
      title: { en: 'Contribution Limits', fr: 'Limites de Cotisation' },
      content: {
        en: {
          question: 'What is the 2024 contribution limit for 401(k) plans?',
          options: [
            '$18,000',
            '$19,500',
            '$22,500',
            '$23,000'
          ],
          correctAnswer: 2,
          explanation: 'The 2024 401(k) contribution limit is $22,500 for those under 50, and $30,000 for those 50 and older (including catch-up contributions).',
          hint: 'The limit increases annually to keep up with inflation...'
        },
        fr: {
          question: 'Quelle est la limite de cotisation 2024 pour les plans 401(k) ?',
          options: [
            '18 000$',
            '19 500$',
            '22 500$',
            '23 000$'
          ],
          correctAnswer: 2,
          explanation: 'La limite de cotisation 401(k) 2024 est de 22 500$ pour ceux de moins de 50 ans, et 30 000$ pour ceux de 50 ans et plus (incluant les cotisations de rattrapage).',
          hint: 'La limite augmente annuellement pour suivre l\'inflation...'
        }
      },
      xp: 25
    },
    {
      id: '401k-matching',
      type: 'multiple_choice',
      title: { en: 'Employer Matching', fr: 'Contribution de l\'Employeur' },
      question: { 
        en: 'What is a common employer matching formula?', 
        fr: 'Quelle est une formule de contribution employeur courante ?' 
      },
      options: {
        en: [
          '50% match up to 3% of salary',
          '100% match up to 6% of salary',
          '25% match up to 10% of salary',
          '75% match up to 4% of salary'
        ],
        fr: [
          '50% de contribution jusqu\'à 3% du salaire',
          '100% de contribution jusqu\'à 6% du salaire',
          '25% de contribution jusqu\'à 10% du salaire',
          '75% de contribution jusqu\'à 4% du salaire'
        ]
      },
      correct: 1,
      explanation: {
        en: 'A common formula is 100% match up to 6% of salary. This means if you contribute 6% of your salary, your employer will contribute an additional 6%.',
        fr: 'Une formule courante est 100% de contribution jusqu\'à 6% du salaire. Cela signifie que si vous cotisez 6% de votre salaire, votre employeur contribuera 6% supplémentaires.'
      },
      hint: {
        en: 'Think about the most generous matching formula...',
        fr: 'Pensez à la formule de contribution la plus généreuse...'
      },
      xp: 20
    },
    {
      id: '401k-vesting',
      type: 'quiz',
      title: { en: 'Vesting Schedule', fr: 'Calendrier d\'Acquisition' },
      content: {
        en: {
          question: 'What does "vesting" mean in a 401(k) context?',
          options: [
            'The amount you can contribute',
            'Your ownership of employer contributions',
            'The investment options available',
            'The withdrawal age'
          ],
          correctAnswer: 1,
          explanation: 'Vesting refers to your ownership of employer contributions. You may need to work for a certain period before you fully own the employer\'s matching contributions.',
          hint: 'Think about ownership and time requirements...'
        },
        fr: {
          question: 'Que signifie "acquisition" dans le contexte d\'un 401(k) ?',
          options: [
            'Le montant que vous pouvez cotiser',
            'Votre propriété des contributions employeur',
            'Les options d\'investissement disponibles',
            'L\'âge de retrait'
          ],
          correctAnswer: 1,
          explanation: 'L\'acquisition fait référence à votre propriété des contributions employeur. Vous devrez peut-être travailler pendant une certaine période avant de posséder pleinement les contributions de l\'employeur.',
          hint: 'Pensez à la propriété et aux exigences de temps...'
        }
      },
      xp: 25
    },
    {
      id: '401k-investments',
      type: 'multiple_choice',
      title: { en: 'Investment Options', fr: 'Options d\'Investissement' },
      question: { 
        en: 'What is a target-date fund?', 
        fr: 'Qu\'est-ce qu\'un fonds à date cible ?' 
      },
      options: {
        en: [
          'A fund that guarantees a specific return',
          'A fund that automatically adjusts asset allocation based on your retirement date',
          'A fund that invests only in one type of asset',
          'A fund with no management fees'
        ],
        fr: [
          'Un fonds qui garantit un rendement spécifique',
          'Un fonds qui ajuste automatiquement l\'allocation d\'actifs selon votre date de retraite',
          'Un fonds qui investit seulement dans un type d\'actif',
          'Un fonds sans frais de gestion'
        ]
      },
      correct: 1,
      explanation: {
        en: 'A target-date fund automatically adjusts its asset allocation (stocks vs bonds) based on your expected retirement date, becoming more conservative as you approach retirement.',
        fr: 'Un fonds à date cible ajuste automatiquement son allocation d\'actifs (actions vs obligations) selon votre date de retraite prévue, devenant plus conservateur à l\'approche de la retraite.'
      },
      hint: {
        en: 'Think about automatic adjustment based on time...',
        fr: 'Pensez à l\'ajustement automatique basé sur le temps...'
      },
      xp: 20
    },
    {
      id: '401k-rollover',
      type: 'quiz',
      title: { en: 'Rollover Rules', fr: 'Règles de Transfert' },
      content: {
        en: {
          question: 'When can you roll over your 401(k) to an IRA?',
          options: [
            'Only after age 59.5',
            'Only when you leave your job',
            'Anytime you want',
            'Only after 5 years of employment'
          ],
          correctAnswer: 1,
          explanation: 'You can typically roll over your 401(k) to an IRA when you leave your job, retire, or if your plan allows in-service rollovers.',
          hint: 'Think about when you would want to move your money...'
        },
        fr: {
          question: 'Quand pouvez-vous transférer votre 401(k) vers un IRA ?',
          options: [
            'Seulement après 59,5 ans',
            'Seulement quand vous quittez votre emploi',
            'N\'importe quand vous voulez',
            'Seulement après 5 ans d\'emploi'
          ],
          correctAnswer: 1,
          explanation: 'Vous pouvez généralement transférer votre 401(k) vers un IRA quand vous quittez votre emploi, prenez votre retraite, ou si votre plan permet les transferts en service.',
          hint: 'Pensez à quand vous voudriez déplacer votre argent...'
        }
      },
      xp: 25
    },
    {
      id: '401k-strategy',
      type: 'action',
      title: { en: '401(k) Strategy', fr: 'Stratégie 401(k)' },
      content: {
        en: {
          description: 'Create your 401(k) optimization strategy',
          actions: [
            {
              id: '401k_action_1',
              title: 'Enroll in your 401(k)',
              description: 'Sign up for your employer\'s 401(k) plan and start contributing',
              verification: 'manual',
              xp: 10
            },
            {
              id: '401k_action_2',
              title: 'Maximize employer match',
              description: 'Contribute enough to get the full employer matching contribution',
              verification: 'manual',
              xp: 10
            },
            {
              id: '401k_action_3',
              title: 'Choose appropriate investments',
              description: 'Select target-date funds or create a diversified portfolio',
              verification: 'manual',
              xp: 10
            }
          ]
        },
        fr: {
          description: 'Créez votre stratégie d\'optimisation 401(k)',
          actions: [
            {
              id: '401k_action_1',
              title: 'Inscrivez-vous à votre 401(k)',
              description: 'Inscrivez-vous au plan 401(k) de votre employeur et commencez à cotiser',
              verification: 'manual',
              xp: 10
            },
            {
              id: '401k_action_2',
              title: 'Maximisez la contribution employeur',
              description: 'Cotisez assez pour obtenir la contribution employeur complète',
              verification: 'manual',
              xp: 10
            },
            {
              id: '401k_action_3',
              title: 'Choisissez des investissements appropriés',
              description: 'Sélectionnez des fonds à date cible ou créez un portefeuille diversifié',
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
    completionRate: 0.80,
    averageTime: 25,
    difficultyRating: 2.4,
    userSatisfaction: 4.7,
    retryRate: 0.15,
    dropoffPoints: ['401k-vesting', '401k-strategy'],
    popularFeatures: ['employer-matching', 'tax-advantages', 'us-specific']
  }
}; 