import { FaHome, FaPiggyBank, FaEuroSign, FaCalculator } from 'react-icons/fa';

export const pel = {
  id: 'pel',
  category: 'budgeting',
  country: 'fr-FR',
  difficulty: 'intermediate',
  duration: 25,
  xp: 200,
  isPremium: false,
  order: 2,
  
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['france', 'savings', 'pel', 'housing', 'intermediate'],
    relatedQuests: ['livret-a', 'retraite-france'],
    averageCompletionTime: 20,
    completionRate: 0.75,
    userRating: 4.6,
    featured: true
  },

  icons: {
    main: FaHome,
    steps: [FaPiggyBank, FaEuroSign, FaCalculator]
  },
  
  colors: {
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#FBBF24'
  },

  content: {
    en: {
      title: 'PEL: French Housing Savings Plan',
      description: 'Learn about the Plan Épargne Logement and how to use it for your future home purchase',
      longDescription: 'Discover the PEL (Plan Épargne Logement), a French savings product designed specifically for future home purchases. Learn about interest rates, borrowing conditions, and tax advantages.',
      objectives: [
        'Understand what a PEL is and its purpose',
        'Learn about current interest rates and conditions',
        'Know how to open and manage a PEL',
        'Understand when to use PEL vs other savings options'
      ],
      prerequisites: ['Basic understanding of savings', 'Interest in home ownership'],
      whatYouWillLearn: [
        'The purpose and benefits of PEL',
        'Current interest rates and borrowing conditions',
        'Deposit requirements and withdrawal rules',
        'Tax advantages and borrowing benefits'
      ],
      realWorldApplication: 'You\'ll be able to open a PEL account, understand when it\'s beneficial for your home purchase goals, and make informed decisions about your French housing savings strategy.'
    },
    fr: {
      title: 'PEL : Plan Épargne Logement',
      description: 'Découvrez le Plan Épargne Logement et comment l\'utiliser pour votre future acquisition immobilière',
      longDescription: 'Découvrez le PEL (Plan Épargne Logement), un produit d\'épargne français conçu spécifiquement pour les futures acquisitions immobilières. Apprenez les taux d\'intérêt, conditions d\'emprunt et avantages fiscaux.',
      objectives: [
        'Comprendre ce qu\'est un PEL et son but',
        'Apprendre les taux d\'intérêt actuels et conditions',
        'Savoir comment ouvrir et gérer un PEL',
        'Comprendre quand utiliser le PEL vs d\'autres options d\'épargne'
      ],
      prerequisites: ['Compréhension de base de l\'épargne', 'Intérêt pour l\'accession à la propriété'],
      whatYouWillLearn: [
        'Le but et les avantages du PEL',
        'Les taux d\'intérêt actuels et conditions d\'emprunt',
        'Les exigences de dépôt et règles de retrait',
        'Les avantages fiscaux et bénéfices d\'emprunt'
      ],
      realWorldApplication: 'Vous pourrez ouvrir un compte PEL, comprendre quand il est bénéfique pour vos objectifs d\'acquisition immobilière, et prendre des décisions éclairées sur votre stratégie d\'épargne immobilière française.'
    }
  },

  rewards: {
    badge: {
      id: 'pel_expert',
      name: { en: 'PEL Expert', fr: 'Expert PEL' },
      description: { 
        en: 'You\'ve mastered France\'s housing savings plan!', 
        fr: 'Vous maîtrisez le plan d\'épargne logement français !' 
      },
      rarity: 'uncommon',
      imageUrl: '/badges/pel-expert.png'
    },
    unlocks: ['retraite-france', 'real-estate-basics'],
    bonusXP: {
      firstTime: 40,
      speedBonus: 20,
      perfectScore: 30
    }
  },

  steps: [
    {
      id: 'pel-intro',
      type: 'info',
      title: { en: 'What is a PEL?', fr: 'Qu\'est-ce qu\'un PEL ?' },
      content: {
        en: {
          text: 'PEL (Plan Épargne Logement) is a French savings product designed to help you save for a home purchase while earning interest and gaining access to favorable mortgage rates.',
          funFact: 'Did you know? The PEL was created in 1965 to help French families save for home ownership!'
        },
        fr: {
          text: 'Le PEL (Plan Épargne Logement) est un produit d\'épargne français conçu pour vous aider à épargner pour l\'achat d\'un logement tout en gagnant des intérêts et en obtenant accès à des taux de crédit favorables.',
          funFact: 'Le saviez-vous ? Le PEL a été créé en 1965 pour aider les familles françaises à épargner pour l\'accession à la propriété !'
        }
      },
      xp: 10
    },
    {
      id: 'pel-rates',
      type: 'quiz',
      title: { en: 'Current Interest Rates', fr: 'Taux d\'Intérêt Actuels' },
      content: {
        en: {
          question: 'What is the current interest rate for PEL accounts opened in 2024?',
          options: [
            '1.0%',
            '1.5%',
            '2.0%',
            '2.5%'
          ],
          correctAnswer: 0,
          explanation: 'PEL accounts opened in 2024 earn 1.0% interest. The rate is fixed for the life of the account.',
          hint: 'The rate is lower than Livret A but offers other benefits...'
        },
        fr: {
          question: 'Quel est le taux d\'intérêt actuel pour les comptes PEL ouverts en 2024 ?',
          options: [
            '1,0%',
            '1,5%',
            '2,0%',
            '2,5%'
          ],
          correctAnswer: 0,
          explanation: 'Les comptes PEL ouverts en 2024 rapportent 1,0% d\'intérêt. Le taux est fixe pour la durée du compte.',
          hint: 'Le taux est plus bas que le Livret A mais offre d\'autres avantages...'
        }
      },
      xp: 25
    },
    {
      id: 'pel-requirements',
      type: 'multiple_choice',
      title: { en: 'Account Requirements', fr: 'Exigences du Compte' },
      question: { 
        en: 'What is the minimum monthly deposit required for a PEL?', 
        fr: 'Quel est le dépôt mensuel minimum requis pour un PEL ?' 
      },
      options: {
        en: [
          '€25',
          '€45',
          '€75',
          '€100'
        ],
        fr: [
          '25€',
          '45€',
          '75€',
          '100€'
        ]
      },
      correct: 1,
      explanation: {
        en: 'The minimum monthly deposit for a PEL is €45. You can deposit more, but this is the minimum required to keep the account active.',
        fr: 'Le dépôt mensuel minimum pour un PEL est de 45€. Vous pouvez déposer plus, mais c\'est le minimum requis pour maintenir le compte actif.'
      },
      hint: {
        en: 'Think about a reasonable monthly amount for housing savings...',
        fr: 'Pensez à un montant mensuel raisonnable pour l\'épargne immobilière...'
      },
      xp: 20
    },
    {
      id: 'pel-borrowing',
      type: 'quiz',
      title: { en: 'Borrowing Benefits', fr: 'Avantages d\'Emprunt' },
      content: {
        en: {
          question: 'What is the maximum loan amount you can get with a PEL after 4 years?',
          options: [
            '€50,000',
            '€75,000',
            '€92,000',
            '€100,000'
          ],
          correctAnswer: 2,
          explanation: 'After 4 years, you can borrow up to €92,000 with a PEL loan, regardless of your savings balance.',
          hint: 'The amount is fixed and doesn\'t depend on your savings...'
        },
        fr: {
          question: 'Quel est le montant maximum d\'emprunt que vous pouvez obtenir avec un PEL après 4 ans ?',
          options: [
            '50 000€',
            '75 000€',
            '92 000€',
            '100 000€'
          ],
          correctAnswer: 2,
          explanation: 'Après 4 ans, vous pouvez emprunter jusqu\'à 92 000€ avec un prêt PEL, quel que soit votre solde d\'épargne.',
          hint: 'Le montant est fixe et ne dépend pas de votre épargne...'
        }
      },
      xp: 25
    },
    {
      id: 'pel-taxes',
      type: 'multiple_choice',
      title: { en: 'Tax Treatment', fr: 'Traitement Fiscal' },
      question: { 
        en: 'Are PEL interest earnings taxable?', 
        fr: 'Les intérêts du PEL sont-ils imposables ?' 
      },
      options: {
        en: [
          'Yes, fully taxable',
          'Yes, but with deductions',
          'No, completely tax-free',
          'Only after 12 years'
        ],
        fr: [
          'Oui, entièrement imposables',
          'Oui, mais avec des déductions',
          'Non, complètement exonérés d\'impôts',
          'Seulement après 12 ans'
        ]
      },
      correct: 1,
      explanation: {
        en: 'PEL interest is taxable but with deductions. You can deduct €1,200 per year for single filers or €2,400 for couples.',
        fr: 'Les intérêts du PEL sont imposables mais avec des déductions. Vous pouvez déduire 1 200€ par an pour les célibataires ou 2 400€ pour les couples.'
      },
      hint: {
        en: 'Think about the difference with Livret A...',
        fr: 'Pensez à la différence avec le Livret A...'
      },
      xp: 20
    },
    {
      id: 'pel-strategy',
      type: 'action',
      title: { en: 'PEL Strategy', fr: 'Stratégie PEL' },
      content: {
        en: {
          description: 'Create your PEL savings strategy for home ownership',
          actions: [
            {
              id: 'pel_action_1',
              title: 'Calculate your home purchase timeline',
              description: 'Determine when you plan to buy and how much you need to save',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'pel_action_2',
              title: 'Set up automatic monthly deposits',
              description: 'Configure €45+ monthly transfers to your PEL',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'pel_action_3',
              title: 'Research PEL loan conditions',
              description: 'Compare PEL loan rates with regular mortgages',
              verification: 'manual',
              xp: 10
            }
          ]
        },
        fr: {
          description: 'Créez votre stratégie d\'épargne PEL pour l\'accession à la propriété',
          actions: [
            {
              id: 'pel_action_1',
              title: 'Calculez votre calendrier d\'achat immobilier',
              description: 'Déterminez quand vous prévoyez d\'acheter et combien vous devez épargner',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'pel_action_2',
              title: 'Configurez des dépôts mensuels automatiques',
              description: 'Configurez des virements mensuels de 45€+ vers votre PEL',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'pel_action_3',
              title: 'Recherchez les conditions de prêt PEL',
              description: 'Comparez les taux de prêt PEL avec les prêts hypothécaires classiques',
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
    dropoffPoints: ['pel-borrowing', 'pel-strategy'],
    popularFeatures: ['borrowing-benefits', 'housing-focus', 'french-specific']
  }
}; 