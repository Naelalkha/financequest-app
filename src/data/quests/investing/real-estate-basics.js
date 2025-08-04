import { FaHome, FaLightbulb, FaCheckCircle } from 'react-icons/fa';

export const realEstateBasics = {
  id: 'real-estate-basics',
  category: 'investing',
  difficulty: 'intermediate',
  duration: 40,
  xp: 170,
  isPremium: false,
  order: 8,
  
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['real-estate', 'investing', 'intermediate'],
    relatedQuests: ['investing-basics', 'crypto-intro'],
    averageCompletionTime: 22,
    completionRate: 0.72,
    userRating: 4.2,
    featured: false
  },

  icons: {
    main: FaHome,
    steps: [FaLightbulb, FaCheckCircle]
  },
  
  colors: {
    primary: '#059669',
    secondary: '#10B981',
    accent: '#F59E0B'
  },

  content: {
    en: {
      title: 'Real Estate Basics',
      description: 'Learn the fundamentals of real estate investing',
      longDescription: 'Understand real estate investment strategies, property analysis, and how to start building wealth through real estate.',
      objectives: [
        'Understand real estate investment types',
        'Learn property analysis basics',
        'Know financing options',
        'Start real estate research'
      ],
      prerequisites: ['Basic investing knowledge', 'Good credit score'],
      whatYouWillLearn: [
        'Different types of real estate investments',
        'How to analyze property values',
        'Financing options for real estate',
        'Risk management in real estate'
      ],
      realWorldApplication: 'You\'ll understand real estate investing and be able to start researching potential investment properties.'
    },
    fr: {
      title: 'Bases de l\'Immobilier',
      description: 'Apprenez les fondamentaux de l\'investissement immobilier',
      longDescription: 'Comprenez les stratégies d\'investissement immobilier, l\'analyse de propriétés et comment commencer à construire votre richesse grâce à l\'immobilier.',
      objectives: [
        'Comprendre les types d\'investissements immobiliers',
        'Apprendre les bases de l\'analyse de propriétés',
        'Connaître les options de financement',
        'Commencer la recherche immobilière'
      ],
      prerequisites: ['Connaissance de base de l\'investissement', 'Bon score de crédit'],
      whatYouWillLearn: [
        'Différents types d\'investissements immobiliers',
        'Comment analyser les valeurs de propriétés',
        'Options de financement pour l\'immobilier',
        'Gestion des risques dans l\'immobilier'
      ],
      realWorldApplication: 'Vous comprendrez l\'investissement immobilier et pourrez commencer à rechercher des propriétés d\'investissement potentielles.'
    }
  },

  rewards: {
    badge: {
      id: 'real_estate_basics_badge',
      name: { en: 'Real Estate Explorer', fr: 'Explorateur Immobilier' },
      description: {
        en: 'You\'ve entered the world of real estate investing!',
        fr: 'Vous êtes entré dans le monde de l\'investissement immobilier !'
      },
      rarity: 'common',
      imageUrl: '/badges/real-estate-basics.png'
    },
    unlocks: ['money-mindset', 'retirement-planning'],
    bonusXP: {
      firstTime: 45,
      speedBonus: 20,
      perfectScore: 25
    }
  },

  steps: [
    {
      id: 'real-estate-intro',
      type: 'info',
      title: { en: 'What is Real Estate Investing?', fr: 'Qu\'est-ce que l\'Investissement Immobilier ?' },
      content: {
        en: {
          text: 'Real estate investing involves purchasing property to generate income or profit.',
          funFact: 'Real estate has historically been one of the most reliable long-term investments!'
        },
        fr: {
          text: 'L\'investissement immobilier consiste à acheter des propriétés pour générer des revenus ou des profits.',
          funFact: 'L\'immobilier a historiquement été l\'un des investissements à long terme les plus fiables !'
        }
      },
      xp: 15
    },
    {
      id: 'investment-strategies',
      type: 'multiple_choice',
      title: { en: 'Real Estate Investment Strategies', fr: 'Stratégies d\'Investissement Immobilier' },
      question: { 
        en: 'What is the main benefit of rental properties as an investment?', 
        fr: 'Quel est l\'avantage principal des propriétés locatives comme investissement ?' 
      },
      options: {
        en: [
          'Quick profits from flipping',
          'Regular passive income stream',
          'No maintenance required',
          'Guaranteed appreciation'
        ],
        fr: [
          'Profits rapides de la revente',
          'Flux de revenus passifs réguliers',
          'Aucun entretien requis',
          'Appréciation garantie'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Rental properties provide consistent monthly income through rent payments, creating a passive income stream.',
        fr: 'Les propriétés locatives fournissent des revenus mensuels constants grâce aux paiements de loyer, créant un flux de revenus passifs.'
      },
      hint: {
        en: 'Think about what tenants pay every month...',
        fr: 'Pensez à ce que les locataires paient chaque mois...'
      },
      xp: 20
    },
    {
      id: 'financing-basics',
      type: 'multiple_choice',
      title: { en: 'Real Estate Financing', fr: 'Financement Immobilier' },
      question: { 
        en: 'What is typically required as a down payment for an investment property?', 
        fr: 'Quel est généralement requis comme mise de fonds pour une propriété d\'investissement ?' 
      },
      options: {
        en: [
          '0-5% down payment',
          '10-15% down payment',
          '20-25% down payment',
          '50% down payment'
        ],
        fr: [
          '0-5% de mise de fonds',
          '10-15% de mise de fonds',
          '20-25% de mise de fonds',
          '50% de mise de fonds'
        ]
      },
      correct: 2,
      explanation: {
        en: 'Investment properties typically require 20-25% down payment, higher than primary residences (which can be 3-5%).',
        fr: 'Les propriétés d\'investissement nécessitent généralement 20-25% de mise de fonds, plus que les résidences principales (3-5%).'
      },
      hint: {
        en: 'Investment properties have stricter lending requirements...',
        fr: 'Les propriétés d\'investissement ont des exigences de prêt plus strictes...'
      },
      xp: 20
    },
    {
      id: 'cash-flow-analysis',
      type: 'quiz',
      title: { en: 'Cash Flow Analysis', fr: 'Analyse de Flux de Trésorerie' },
      question: { 
        en: 'If rent is $1,500/month and expenses are $1,200/month, what is the monthly cash flow?', 
        fr: 'Si le loyer est 1500€/mois et les dépenses sont 1200€/mois, quel est le flux de trésorerie mensuel ?' 
      },
      correctAnswer: { en: '$300', fr: '300€' },
      acceptedAnswers: {
        en: ['300', '$300', '300 dollars', 'three hundred'],
        fr: ['300', '300€', '300 euros', 'trois cents']
      },
      explanation: {
        en: 'Cash flow = Income - Expenses. $1,500 - $1,200 = $300 positive monthly cash flow.',
        fr: 'Flux de trésorerie = Revenus - Dépenses. 1500€ - 1200€ = 300€ de flux de trésorerie mensuel positif.'
      },
      hint: {
        en: 'Subtract total expenses from rental income...',
        fr: 'Soustrayez les dépenses totales des revenus locatifs...'
      },
      xp: 25
    },
    {
      id: 'location-factors',
      type: 'checklist',
      title: { en: 'Key Location Factors', fr: 'Facteurs Clés de Localisation' },
      items: {
        en: [
          'Proximity to schools and amenities',
          'Job market and economic growth',
          'Crime rates and safety',
          'Future development plans',
          'Transportation and accessibility'
        ],
        fr: [
          'Proximité des écoles et commodités',
          'Marché du travail et croissance économique',
          'Taux de criminalité et sécurité',
          'Plans de développement futurs',
          'Transport et accessibilité'
        ]
      },
      explanation: {
        en: 'Location is crucial in real estate - these factors determine property value, rental demand, and long-term appreciation.',
        fr: 'La localisation est cruciale en immobilier - ces facteurs déterminent la valeur de la propriété, la demande locative et l\'appréciation à long terme.'
      },
      xp: 25
    },
    {
      id: 'reits-vs-direct',
      type: 'multiple_choice',
      title: { en: 'REITs vs Direct Investment', fr: 'REIT vs Investissement Direct' },
      question: { 
        en: 'What is the main advantage of REITs over direct property ownership?', 
        fr: 'Quel est l\'avantage principal des REIT par rapport à la propriété directe ?' 
      },
      options: {
        en: [
          'Higher returns guaranteed',
          'No property management needed',
          'Better tax benefits',
          'More control over properties'
        ],
        fr: [
          'Rendements plus élevés garantis',
          'Aucune gestion immobilière nécessaire',
          'Meilleurs avantages fiscaux',
          'Plus de contrôle sur les propriétés'
        ]
      },
      correct: 1,
      explanation: {
        en: 'REITs (Real Estate Investment Trusts) offer real estate exposure without the hassles of property management, maintenance, or tenant issues.',
        fr: 'Les REIT (Fonds de Placement Immobilier) offrent une exposition immobilière sans les tracas de gestion, maintenance ou problèmes de locataires.'
      },
      hint: {
        en: 'Think about what you don\'t have to deal with...',
        fr: 'Pensez à ce avec quoi vous n\'avez pas à composer...'
      },
      xp: 20
    },
    {
      id: 'action-challenge',
      type: 'action',
      title: { en: 'Real Estate Basics Action Challenge', fr: 'Défi Action Bases Immobilier' },
      content: {
        en: {
          description: 'Start your real estate investment journey!',
          actions: [
            {
              id: 'real-estate-basics_action_1',
              title: 'Research local markets',
              description: 'Research real estate markets in your area',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'real-estate-basics_action_2',
              title: 'Calculate potential returns',
              description: 'Learn to calculate ROI and cash flow on properties',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'real-estate-basics_action_3',
              title: 'Explore financing options',
              description: 'Research mortgage and financing options for real estate',
              verification: 'manual',
              xp: 15
            }
          ]
        },
        fr: {
          description: 'Commencez votre parcours d\'investissement immobilier !',
          actions: [
            {
              id: 'real-estate-basics_action_1',
              title: 'Rechercher les marchés locaux',
              description: 'Recherchez les marchés immobiliers dans votre région',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'real-estate-basics_action_2',
              title: 'Calculer les rendements potentiels',
              description: 'Apprenez à calculer le ROI et le cash flow sur les propriétés',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'real-estate-basics_action_3',
              title: 'Explorer les options de financement',
              description: 'Recherchez les options de prêt hypothécaire et de financement pour l\'immobilier',
              verification: 'manual',
              xp: 15
            }
          ]
        }
      },
      validation: (data) => {
        const { marketResearch, calculationsDone, financingExplored } = data;
        if (marketResearch && calculationsDone && financingExplored) {
          return { isValid: true, message: 'Great real estate start!' };
        }
        return { isValid: false, message: 'Keep learning about real estate investing' };
      },
      xp: 20
    }
  ],

  analytics: {
    completionRate: 0.72,
    averageTime: 22,
    difficultyRating: 3.2,
    userSatisfaction: 4.2,
    retryRate: 0.25,
    dropoffPoints: ['real-estate-intro', 'action-challenge'],
    popularFeatures: ['market-analysis', 'roi-calculations', 'financing-options']
  }
};

export const getrealEstateBasicsHelpers = () => ({
  calculateROI: (annualRent, propertyValue, expenses) => {
    const netIncome = annualRent - expenses;
    return (netIncome / propertyValue) * 100;
  },
  
  calculateCashFlow: (monthlyRent, monthlyExpenses, monthlyMortgage) => {
    return monthlyRent - monthlyExpenses - monthlyMortgage;
  },
  
  estimatePropertyValue: (comparableSales, adjustments) => {
    return comparableSales.reduce((sum, sale) => sum + sale.price, 0) / comparableSales.length + adjustments;
  }
}); 