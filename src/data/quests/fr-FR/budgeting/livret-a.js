import { FaPiggyBank, FaEuroSign, FaShieldAlt, FaCalculator } from 'react-icons/fa';

export const livretA = {
  id: 'livret-a',
  category: 'budgeting',
  country: 'fr-FR',
  difficulty: 'beginner',
  duration: 20,
  xp: 150,
  isPremium: false,
  order: 1,
  
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['france', 'savings', 'livret-a', 'beginner-friendly'],
    relatedQuests: ['pel', 'budget-basics'],
    averageCompletionTime: 15,
    completionRate: 0.85,
    userRating: 4.7,
    featured: true
  },

  icons: {
    main: FaPiggyBank,
    steps: [FaEuroSign, FaShieldAlt, FaCalculator]
  },
  
  colors: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#FBBF24'
  },

  content: {
    en: {
      title: 'Livret A: French Savings Account',
      description: 'Learn about France\'s most popular savings account and how to use it effectively',
      longDescription: 'Discover the Livret A, France\'s flagship savings account with guaranteed returns and tax-free interest. Learn how to open one, understand the rates, and maximize your savings.',
      objectives: [
        'Understand what a Livret A is and its benefits',
        'Learn about current interest rates and limits',
        'Know how to open and manage a Livret A',
        'Understand when to use Livret A vs other savings options'
      ],
      prerequisites: ['Basic understanding of savings'],
      whatYouWillLearn: [
        'The history and purpose of Livret A',
        'Current interest rates and how they change',
        'Deposit limits and withdrawal rules',
        'Tax advantages of Livret A'
      ],
      realWorldApplication: 'You\'ll be able to open a Livret A account, understand when to use it for your emergency fund, and make informed decisions about your French savings strategy.'
    },
    fr: {
      title: 'Livret A : Compte Épargne Français',
      description: 'Découvrez le compte épargne le plus populaire de France et comment l\'utiliser efficacement',
      longDescription: 'Découvrez le Livret A, le compte épargne phare de la France avec des rendements garantis et des intérêts exonérés d\'impôts. Apprenez comment en ouvrir un, comprendre les taux et maximiser votre épargne.',
      objectives: [
        'Comprendre ce qu\'est un Livret A et ses avantages',
        'Apprendre les taux d\'intérêt actuels et les limites',
        'Savoir comment ouvrir et gérer un Livret A',
        'Comprendre quand utiliser le Livret A vs d\'autres options d\'épargne'
      ],
      prerequisites: ['Compréhension de base de l\'épargne'],
      whatYouWillLearn: [
        'L\'historique et le but du Livret A',
        'Les taux d\'intérêt actuels et comment ils changent',
        'Les limites de dépôt et règles de retrait',
        'Les avantages fiscaux du Livret A'
      ],
      realWorldApplication: 'Vous pourrez ouvrir un compte Livret A, comprendre quand l\'utiliser pour votre fonds d\'urgence, et prendre des décisions éclairées sur votre stratégie d\'épargne française.'
    }
  },

  rewards: {
    badge: {
      id: 'livret_a_expert',
      name: { en: 'Livret A Expert', fr: 'Expert Livret A' },
      description: { 
        en: 'You\'ve mastered France\'s most popular savings account!', 
        fr: 'Vous maîtrisez le compte épargne le plus populaire de France !' 
      },
      rarity: 'common',
      imageUrl: '/badges/livret-a-expert.png'
    },
    unlocks: ['pel', 'retraite-france'],
    bonusXP: {
      firstTime: 30,
      speedBonus: 15,
      perfectScore: 20
    }
  },

  steps: [
    {
      id: 'livret-intro',
      type: 'info',
      title: { en: 'What is Livret A?', fr: 'Qu\'est-ce que le Livret A ?' },
      content: {
        en: {
          text: 'Livret A is France\'s most popular savings account, created in 1818. It offers guaranteed returns, tax-free interest, and is available to everyone.',
          funFact: 'Did you know? The Livret A was created to finance social housing and local development projects!'
        },
        fr: {
          text: 'Le Livret A est le compte épargne le plus populaire de France, créé en 1818. Il offre des rendements garantis, des intérêts exonérés d\'impôts, et est accessible à tous.',
          funFact: 'Le saviez-vous ? Le Livret A a été créé pour financer le logement social et les projets de développement local !'
        }
      },
      xp: 10
    },
    {
      id: 'livret-rates',
      type: 'quiz',
      title: { en: 'Current Interest Rates', fr: 'Taux d\'Intérêt Actuels' },
      content: {
        en: {
          question: 'What is the current interest rate for Livret A?',
          options: [
            '1.5%',
            '2.0%',
            '3.0%',
            '4.0%'
          ],
          correctAnswer: 2,
          explanation: 'The Livret A rate is currently 3.0% (as of 2024). This rate is reviewed twice a year by the French government.',
          hint: 'The rate was increased significantly in recent years due to inflation...'
        },
        fr: {
          question: 'Quel est le taux d\'intérêt actuel du Livret A ?',
          options: [
            '1,5%',
            '2,0%',
            '3,0%',
            '4,0%'
          ],
          correctAnswer: 2,
          explanation: 'Le taux du Livret A est actuellement de 3,0% (en 2024). Ce taux est révisé deux fois par an par le gouvernement français.',
          hint: 'Le taux a été augmenté significativement ces dernières années à cause de l\'inflation...'
        }
      },
      xp: 25
    },
    {
      id: 'livret-limits',
      type: 'multiple_choice',
      title: { en: 'Deposit Limits', fr: 'Limites de Dépôt' },
      question: { 
        en: 'What is the maximum amount you can have in a Livret A?', 
        fr: 'Quel est le montant maximum que vous pouvez avoir sur un Livret A ?' 
      },
      options: {
        en: [
          '€15,000',
          '€22,950',
          '€30,000',
          'No limit'
        ],
        fr: [
          '15 000€',
          '22 950€',
          '30 000€',
          'Pas de limite'
        ]
      },
      correct: 1,
      explanation: {
        en: 'The maximum balance for Livret A is €22,950. Beyond this amount, you can still earn interest on the first €22,950.',
        fr: 'Le solde maximum pour le Livret A est de 22 950€. Au-delà de ce montant, vous pouvez toujours gagner des intérêts sur les premiers 22 950€.'
      },
      hint: {
        en: 'Think about the current limit that was increased in recent years...',
        fr: 'Pensez à la limite actuelle qui a été augmentée ces dernières années...'
      },
      xp: 20
    },
    {
      id: 'livret-taxes',
      type: 'quiz',
      title: { en: 'Tax Advantages', fr: 'Avantages Fiscaux' },
      content: {
        en: {
          question: 'Are Livret A interest earnings taxable?',
          options: [
            'Yes, fully taxable',
            'Yes, partially taxable',
            'No, completely tax-free',
            'Only for high earners'
          ],
          correctAnswer: 2,
          explanation: 'Livret A interest is completely tax-free. You don\'t need to declare it on your tax return.',
          hint: 'This is one of the main advantages of Livret A...'
        },
        fr: {
          question: 'Les intérêts du Livret A sont-ils imposables ?',
          options: [
            'Oui, entièrement imposables',
            'Oui, partiellement imposables',
            'Non, complètement exonérés d\'impôts',
            'Seulement pour les hauts revenus'
          ],
          correctAnswer: 2,
          explanation: 'Les intérêts du Livret A sont complètement exonérés d\'impôts. Vous n\'avez pas besoin de les déclarer sur votre déclaration fiscale.',
          hint: 'C\'est l\'un des principaux avantages du Livret A...'
        }
      },
      xp: 25
    },
    {
      id: 'livret-opening',
      type: 'checklist',
      title: { en: 'How to Open a Livret A', fr: 'Comment Ouvrir un Livret A' },
      items: {
        en: [
          'Choose a bank or credit union',
          'Provide proof of identity (passport or ID card)',
          'Provide proof of address',
          'Fill out the application form',
          'Make your first deposit (minimum €1.50)',
          'Receive your account details'
        ],
        fr: [
          'Choisir une banque ou une caisse d\'épargne',
          'Fournir une pièce d\'identité (passeport ou carte d\'identité)',
          'Fournir un justificatif de domicile',
          'Remplir le formulaire de demande',
          'Effectuer votre premier dépôt (minimum 1,50€)',
          'Recevoir vos coordonnées de compte'
        ]
      },
      explanation: {
        en: 'Opening a Livret A is simple and can be done at any bank or credit union in France. The process usually takes about 15 minutes.',
        fr: 'Ouvrir un Livret A est simple et peut être fait dans n\'importe quelle banque ou caisse d\'épargne en France. Le processus prend généralement environ 15 minutes.'
      },
      xp: 25
    },
    {
      id: 'livret-strategy',
      type: 'action',
      title: { en: 'Livret A Strategy', fr: 'Stratégie Livret A' },
      content: {
        en: {
          description: 'Create your Livret A savings strategy',
          actions: [
            {
              id: 'livret_action_1',
              title: 'Calculate your emergency fund target',
              description: 'Determine how much you need for 3-6 months of expenses',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'livret_action_2',
              title: 'Plan your monthly deposits',
              description: 'Set up automatic transfers to your Livret A',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'livret_action_3',
              title: 'Research local banks',
              description: 'Compare Livret A offers from different banks',
              verification: 'manual',
              xp: 10
            }
          ]
        },
        fr: {
          description: 'Créez votre stratégie d\'épargne Livret A',
          actions: [
            {
              id: 'livret_action_1',
              title: 'Calculez votre objectif de fonds d\'urgence',
              description: 'Déterminez combien vous avez besoin pour 3-6 mois de dépenses',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'livret_action_2',
              title: 'Planifiez vos dépôts mensuels',
              description: 'Configurez des virements automatiques vers votre Livret A',
              verification: 'manual',
              xp: 10
            },
            {
              id: 'livret_action_3',
              title: 'Recherchez les banques locales',
              description: 'Comparez les offres Livret A de différentes banques',
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
    completionRate: 0.85,
    averageTime: 15,
    difficultyRating: 1.8,
    userSatisfaction: 4.7,
    retryRate: 0.12,
    dropoffPoints: ['livret-rates', 'livret-strategy'],
    popularFeatures: ['tax-advantages', 'easy-opening', 'french-specific']
  }
}; 