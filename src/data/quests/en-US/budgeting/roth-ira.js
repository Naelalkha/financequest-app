import { FaPiggyBank, FaDollarSign, FaChartLine, FaCalculator } from 'react-icons/fa';

export const rothIra = {
  id: 'roth-ira',
  category: 'budgeting',
  country: 'en-US',
  difficulty: 'intermediate',
  duration: 25,
  xp: 200,
  isPremium: false,
  order: 1,
  
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['usa', 'retirement', 'roth-ira', 'intermediate'],
    relatedQuests: ['401k-basics', 'investing-basics'],
    averageCompletionTime: 20,
    completionRate: 0.75,
    userRating: 4.6,
    featured: true
  },

  icons: {
    main: FaPiggyBank,
    steps: [FaDollarSign, FaChartLine, FaCalculator]
  },
  
  colors: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#FBBF24'
  },

  content: {
    en: {
      title: 'Roth IRA: Tax-Free Retirement',
      description: 'Learn about Roth IRAs and how to use them for tax-free retirement income',
      longDescription: 'Discover the Roth IRA, a powerful retirement savings tool that offers tax-free growth and withdrawals. Learn about contribution limits, eligibility, and when to choose Roth vs Traditional IRA.',
      objectives: [
        'Understand what a Roth IRA is and its benefits',
        'Learn about contribution limits and eligibility',
        'Know how to open and manage a Roth IRA',
        'Understand when to choose Roth vs Traditional IRA'
      ],
      prerequisites: ['Basic understanding of retirement planning'],
      whatYouWillLearn: [
        'The tax advantages of Roth IRAs',
        'Contribution limits and income restrictions',
        'Investment options and withdrawal rules',
        'Roth vs Traditional IRA comparison'
      ],
      realWorldApplication: 'You\'ll be able to open a Roth IRA account, understand when it\'s beneficial for your retirement strategy, and make informed decisions about your US retirement planning.'
    },
    fr: {
      title: 'Roth IRA : Retraite Sans Impôts',
      description: 'Découvrez les Roth IRA et comment les utiliser pour des revenus de retraite sans impôts',
      longDescription: 'Découvrez le Roth IRA, un outil puissant d\'épargne retraite qui offre une croissance et des retraits sans impôts. Apprenez les limites de cotisation, l\'éligibilité, et quand choisir Roth vs IRA traditionnel.',
      objectives: [
        'Comprendre ce qu\'est un Roth IRA et ses avantages',
        'Apprendre les limites de cotisation et l\'éligibilité',
        'Savoir comment ouvrir et gérer un Roth IRA',
        'Comprendre quand choisir Roth vs IRA traditionnel'
      ],
      prerequisites: ['Compréhension de base de la planification de retraite'],
      whatYouWillLearn: [
        'Les avantages fiscaux des Roth IRA',
        'Les limites de cotisation et restrictions de revenus',
        'Les options d\'investissement et règles de retrait',
        'Comparaison Roth vs IRA traditionnel'
      ],
      realWorldApplication: 'Vous pourrez ouvrir un compte Roth IRA, comprendre quand il est bénéfique pour votre stratégie de retraite, et prendre des décisions éclairées sur votre planification de retraite américaine.'
    }
  },

  rewards: {
    badge: {
      id: 'roth_ira_expert',
      name: { en: 'Roth IRA Expert', fr: 'Expert Roth IRA' },
      description: { 
        en: 'You\'ve mastered tax-free retirement planning!', 
        fr: 'Vous maîtrisez la planification de retraite sans impôts !' 
      },
      rarity: 'uncommon',
      imageUrl: '/badges/roth-ira-expert.png'
    },
    unlocks: ['401k-basics', 'investing-basics'],
    bonusXP: {
      firstTime: 40,
      speedBonus: 20,
      perfectScore: 30
    }
  },

  steps: [
    {
      id: 'roth-intro',
      type: 'info',
      title: { en: 'What is a Roth IRA?', fr: 'Qu\'est-ce qu\'un Roth IRA ?' },
      content: {
        en: {
          text: 'A Roth IRA is a retirement account where you contribute after-tax dollars, but all future growth and withdrawals are tax-free.',
          funFact: 'Did you know? The Roth IRA was created in 1997 and named after Senator William Roth!'
        },
        fr: {
          text: 'Un Roth IRA est un compte de retraite où vous cotisez avec des dollars après impôts, mais toute croissance future et retraits sont sans impôts.',
          funFact: 'Le saviez-vous ? Le Roth IRA a été créé en 1997 et nommé d\'après le Sénateur William Roth !'
        }
      },
      xp: 10
    },
    {
      id: 'roth-contributions',
      type: 'quiz',
      title: { en: 'Contribution Limits', fr: 'Limites de Cotisation' },
      content: {
        en: {
          question: 'What is the annual contribution limit for Roth IRA in 2024?',
          options: [
            '$5,500',
            '$6,000',
            '$6,500',
            '$7,000'
          ],
          correctAnswer: 3,
          explanation: 'The 2024 Roth IRA contribution limit is $7,000 for those under 50, and $8,000 for those 50 and older.',
          hint: 'The limit increases periodically to keep up with inflation...'
        },
        fr: {
          question: 'Quelle est la limite de cotisation annuelle pour Roth IRA en 2024 ?',
          options: [
            '5 500$',
            '6 000$',
            '6 500$',
            '7 000$'
          ],
          correctAnswer: 3,
          explanation: 'La limite de cotisation Roth IRA 2024 est de 7 000$ pour ceux de moins de 50 ans, et 8 000$ pour ceux de 50 ans et plus.',
          hint: 'La limite augmente périodiquement pour suivre l\'inflation...'
        }
      },
      xp: 25
    },
    {
      id: 'roth-eligibility',
      type: 'multiple_choice',
      title: { en: 'Income Eligibility', fr: 'Éligibilité de Revenus' },
      question: { 
        en: 'What is the income limit for full Roth IRA contributions in 2024?', 
        fr: 'Quelle est la limite de revenus pour les cotisations complètes Roth IRA en 2024 ?' 
      },
      options: {
        en: [
          '$100,000 for single filers',
          '$125,000 for single filers',
          '$150,000 for single filers',
          '$200,000 for single filers'
        ],
        fr: [
          '100 000$ pour les célibataires',
          '125 000$ pour les célibataires',
          '150 000$ pour les célibataires',
          '200 000$ pour les célibataires'
        ]
      },
      correct: 2,
      explanation: {
        en: 'For 2024, single filers can contribute the full amount if their modified adjusted gross income is under $146,000.',
        fr: 'Pour 2024, les célibataires peuvent cotiser le montant complet si leur revenu brut ajusté modifié est inférieur à 146 000$.'
      },
      hint: {
        en: 'The limit is adjusted annually for inflation...',
        fr: 'La limite est ajustée annuellement pour l\'inflation...'
      },
      xp: 20
    },
    {
      id: 'roth-withdrawals',
      type: 'quiz',
      title: { en: 'Withdrawal Rules', fr: 'Règles de Retrait' },
      content: {
        en: {
          question: 'When can you withdraw Roth IRA contributions without penalty?',
          options: [
            'Never',
            'After age 59.5',
            'Anytime',
            'After 5 years'
          ],
          correctAnswer: 2,
          explanation: 'You can withdraw your Roth IRA contributions anytime without penalty or taxes, since you already paid taxes on them.',
          hint: 'Think about what you\'ve already paid taxes on...'
        },
        fr: {
          question: 'Quand pouvez-vous retirer les cotisations Roth IRA sans pénalité ?',
          options: [
            'Jamais',
            'Après 59,5 ans',
            'N\'importe quand',
            'Après 5 ans'
          ],
          correctAnswer: 2,
          explanation: 'Vous pouvez retirer vos cotisations Roth IRA n\'importe quand sans pénalité ou impôts, puisque vous avez déjà payé des impôts dessus.',
          hint: 'Pensez à ce sur quoi vous avez déjà payé des impôts...'
        }
      },
      xp: 25
    },
    {
      id: 'roth-vs-traditional',
      type: 'multiple_choice',
      title: { en: 'Roth vs Traditional IRA', fr: 'Roth vs IRA Traditionnel' },
      question: { 
        en: 'When might you choose a Roth IRA over a Traditional IRA?', 
        fr: 'Quand pourriez-vous choisir un Roth IRA plutôt qu\'un IRA traditionnel ?' 
      },
      options: {
        en: [
          'When you expect to be in a higher tax bracket in retirement',
          'When you want immediate tax deductions',
          'When you need to reduce current taxable income',
          'When you\'re close to retirement age'
        ],
        fr: [
          'Quand vous vous attendez à être dans une tranche d\'imposition plus élevée à la retraite',
          'Quand vous voulez des déductions fiscales immédiates',
          'Quand vous devez réduire le revenu imposable actuel',
          'Quand vous êtes proche de l\'âge de retraite'
        ]
      },
      correct: 0,
      explanation: {
        en: 'Choose Roth IRA when you expect to be in a higher tax bracket in retirement, as you\'ll pay taxes now at a lower rate.',
        fr: 'Choisissez Roth IRA quand vous vous attendez à être dans une tranche d\'imposition plus élevée à la retraite, car vous paierez des impôts maintenant à un taux plus bas.'
      },
      hint: {
        en: 'Think about tax rates now vs. in retirement...',
        fr: 'Pensez aux taux d\'imposition maintenant vs. à la retraite...'
      },
      xp: 20
    },
    {
      id: 'roth-strategy',
      type: 'action',
      title: { en: 'Roth IRA Strategy', fr: 'Stratégie Roth IRA' },
      content: {
        en: {
          description: 'Create your Roth IRA retirement strategy',
          actions: [
            {
              id: 'roth_action_1',
              title: 'Check your eligibility',
              description: 'Verify your income and eligibility for Roth IRA contributions',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'roth_action_2',
              title: 'Choose a provider',
              description: 'Research and select a Roth IRA provider (Vanguard, Fidelity, etc.)',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'roth_action_3',
              title: 'Set up automatic contributions',
              description: 'Configure monthly contributions to maximize your Roth IRA',
              verification: 'manual',
              xp: 10
            }
          ]
        },
        fr: {
          description: 'Créez votre stratégie de retraite Roth IRA',
          actions: [
            {
              id: 'roth_action_1',
              title: 'Vérifiez votre éligibilité',
              description: 'Vérifiez vos revenus et éligibilité pour les cotisations Roth IRA',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'roth_action_2',
              title: 'Choisissez un fournisseur',
              description: 'Recherchez et sélectionnez un fournisseur Roth IRA (Vanguard, Fidelity, etc.)',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'roth_action_3',
              title: 'Configurez des cotisations automatiques',
              description: 'Configurez des cotisations mensuelles pour maximiser votre Roth IRA',
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
    completionRate: 0.75,
    averageTime: 20,
    difficultyRating: 2.3,
    userSatisfaction: 4.6,
    retryRate: 0.18,
    dropoffPoints: ['roth-eligibility', 'roth-strategy'],
    popularFeatures: ['tax-free-growth', 'flexible-withdrawals', 'us-specific']
  }
}; 