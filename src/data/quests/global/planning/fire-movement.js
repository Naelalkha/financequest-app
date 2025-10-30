import { FaFire, FaChartLine, FaCalculator } from 'react-icons/fa';

export const fireMovement = {
  id: 'fire-movement',
  category: 'protect',
  difficulty: 'advanced',
  duration: 30,
  xp: 200,
  isPremium: true,
  order: 16,
  
  // Métadonnées enrichies
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['fire', 'early-retirement', 'advanced'],
    relatedQuests: ['geo-arbitrage', 'barista-fi'],
    averageCompletionTime: 35,
    completionRate: 0.68,
    userRating: 4.9
  },

  // Icônes spécifiques
  icons: {
    main: FaFire,
    steps: [FaChartLine, FaCalculator]
  },
  
  // Couleurs thématiques
  colors: {
    primary: '#FF6F61',
    secondary: '#FF8A80',
    accent: '#FBBF24'
  },

  // Contenu localisé structuré
  content: {
    en: {
      title: 'Financial Independence & Early Retirement (FIRE)',
      description: 'Design a roadmap to retire decades early through aggressive saving and smart investing',
      longDescription: 'Learn to calculate your FIRE number, understand LeanFIRE vs FatFIRE strategies, optimize savings rates above 50%, choose tax-efficient investment vehicles, and plan withdrawal strategies using the 4% rule.',
      objectives: [
        'Calculate your FIRE number',
        'Understand LeanFIRE vs FatFIRE',
        'Optimize savings rate above 50%',
        'Choose tax‑efficient investment vehicles',
        'Plan withdrawal strategies using the 4% rule'
      ],
      prerequisites: ['Retirement Planning Essentials'],
      whatYouWillLearn: [
        'FIRE number calculation',
        'LeanFIRE vs FatFIRE strategies',
        'High savings rate optimization',
        'Tax-efficient investing for FIRE',
        '4% rule withdrawal planning'
      ],
      realWorldApplication: 'Apply FIRE principles to achieve financial independence and retire decades earlier than traditional retirement age.'
    },
    fr: {
      title: 'Indépendance financière & Retraite anticipée (FIRE)',
      description: 'Élaborez une feuille de route pour prendre votre retraite des décennies plus tôt grâce à une épargne agressive et des investissements avisés',
      longDescription: 'Apprenez à calculer votre nombre FIRE, comprendre les stratégies LeanFIRE vs FatFIRE, optimiser des taux d\'épargne supérieurs à 50%, choisir des véhicules d\'investissement fiscalement efficaces, et planifier les stratégies de retrait avec la règle des 4%.',
      objectives: [
        'Calculer votre nombre FIRE',
        'Comprendre LeanFIRE vs FatFIRE',
        'Optimiser un taux d\'épargne supérieur à 50%',
        'Choisir des véhicules d\'investissement fiscalement efficaces',
        'Planifier les retraits avec la règle des 4%'
      ],
      prerequisites: ['Essentiels de Planification Retraite'],
      whatYouWillLearn: [
        'Calcul du nombre FIRE',
        'Stratégies LeanFIRE vs FatFIRE',
        'Optimisation taux d\'épargne élevé',
        'Investissement fiscalement efficace pour FIRE',
        'Planification retraits règle des 4%'
      ],
      realWorldApplication: 'Appliquez les principes FIRE pour atteindre l\'indépendance financière et prendre votre retraite des décennies plus tôt que l\'âge de retraite traditionnel.'
    }
  },

  // Rewards enrichis
  rewards: {
    badge: {
      id: 'firestarter',
      name: { en: 'FIRE Starter', fr: 'Démarreur FIRE' },
      description: { 
        en: 'Mastered FIRE principles and early retirement strategies',
        fr: 'Maîtrisé les principes FIRE et les stratégies de retraite anticipée'
      },
      rarity: 'legendary',
      imageUrl: '/badges/firestarter.png'
    },
    unlocks: ['geo-arbitrage', 'barista-fi'],
    bonusXP: {
      firstTime: 100,
      speedBonus: 50,
      perfectScore: 60
    }
  },

  // Steps avec ACTION CHALLENGE
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
      instructions_fr: 'Multipliez vos dépenses annuelles souhaitées par 25 pour estimer le capital nécessaire.',
      explanation_en: 'This is based on the 4% rule - you can safely withdraw 4% of your portfolio annually.',
      explanation_fr: 'Ceci est basé sur la règle des 4% - vous pouvez retirer en toute sécurité 4% de votre portefeuille annuellement.'
    },
    {
      type: 'multiple_choice',
      question_en: 'What\'s the difference between LeanFIRE and FatFIRE?',
      question_fr: 'Quelle est la différence entre LeanFIRE et FatFIRE ?',
      options_en: [
        'Age of retirement',
        'Investment strategy',
        'Lifestyle spending level',
        'Geographic location'
      ],
      options_fr: [
        'Âge de retraite',
        'Stratégie d\'investissement',
        'Niveau de dépenses de style de vie',
        'Localisation géographique'
      ],
      correct: 2,
      explanation_en: 'LeanFIRE involves minimal spending ($25-40k/year), while FatFIRE allows for luxury lifestyle ($100k+/year).',
      explanation_fr: 'LeanFIRE implique des dépenses minimales (25-40k€/an), tandis que FatFIRE permet un style de vie luxueux (100k€+/an).',
      hint_en: 'Think about the lifestyle you want in retirement...',
      hint_fr: 'Pensez au style de vie que vous voulez à la retraite...',
      difficulty: 'medium',
      points: 20
    },
    {
      type: 'multiple_choice',
      question_en: 'What does FIRE stand for?',
      question_fr: 'Que signifie FIRE ?',
      options_en: ['Financial Independence, Retire Early', 'Fast Income, Real Estate', 'Fixed Interest, Risk Equity', 'Full Investment, Return Enhancement'],
      options_fr: ['Indépendance Financière, Retraite Anticipée', 'Revenu Rapide, Immobilier', 'Intérêt Fixe, Actions Risque', 'Investissement Complet, Amélioration Rendement'],
      correct: 0,
      explanation_en: 'FIRE stands for Financial Independence, Retire Early - achieving enough savings to retire before traditional age.',
      explanation_fr: 'FIRE signifie Indépendance Financière, Retraite Anticipée - atteindre assez d\'épargne pour prendre sa retraite avant l\'âge traditionnel.',
      hint_en: 'Think about the two main goals of the movement...',
      hint_fr: 'Pensez aux deux objectifs principaux du mouvement...',
      difficulty: 'easy',
      points: 15
    },
    {
      type: 'multiple_choice',
      question_en: 'What savings rate do most FIRE practitioners aim for?',
      question_fr: 'Quel taux d\'épargne la plupart des pratiquants FIRE visent-ils ?',
      options_en: ['10-20%', '25-50%', '60-80%', '90%+'],
      options_fr: ['10-20%', '25-50%', '60-80%', '90%+'],
      correct: 1,
      explanation_en: 'FIRE practitioners typically save 25-50% or more of their income to achieve early retirement.',
      explanation_fr: 'Les pratiquants FIRE épargnent typiquement 25-50% ou plus de leur revenu pour atteindre la retraite anticipée.',
      hint_en: 'Much higher than traditional retirement advice...',
      hint_fr: 'Beaucoup plus élevé que les conseils traditionnels de retraite...',
      difficulty: 'medium',
      points: 25
    },
    {
      type: 'multiple_choice',
      question_en: 'What is "lean FIRE"?',
      question_fr: 'Qu\'est-ce que le "lean FIRE" ?',
      options_en: ['Retiring with minimal expenses', 'Fast wealth building', 'Real estate focus', 'High-risk investing'],
      options_fr: ['Prendre retraite avec dépenses minimales', 'Construction rapide de richesse', 'Focus immobilier', 'Investissement haut risque'],
      correct: 0,
      explanation_en: 'Lean FIRE means retiring early with a lower nest egg by maintaining minimal living expenses.',
      explanation_fr: 'Lean FIRE signifie prendre sa retraite tôt avec un pécule plus bas en maintenant des dépenses de vie minimales.',
      hint_en: 'Think about expense levels...',
      hint_fr: 'Pensez aux niveaux de dépenses...',
      difficulty: 'medium',
      points: 20
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
    },
    {
      id: 'action-challenge',
      type: 'action',
      duration: 30,
      content: {
        en: {
          title: '🔥 FIRE Action Challenge',
          subtitle: 'Start your FIRE journey!',
          description: 'Take real actions to begin your Financial Independence, Retire Early journey',
          timeLimit: 168, // hours (1 week)
          actions: [
            {
              id: 'fire_action_1',
              title: '📱 Quick Win: Calculate your FIRE number',
              description: 'Use the 4% rule to calculate how much you need to achieve financial independence',
              difficulty: 'easy',
              xp: 100,
              timeEstimate: '15 min',
              tips: [
                'Estimate your annual expenses',
                'Multiply by 25 (4% rule)',
                'Add buffer for safety'
              ],
              verificationMethod: 'screenshot',
              successCriteria: 'Show FIRE number calculation with breakdown'
            },
            {
              id: 'fire_action_2',
              title: '💰 Optimize your savings rate',
              description: 'Analyze your current spending and identify ways to increase savings to 50%+',
              difficulty: 'medium',
              xp: 200,
              timeEstimate: '45 min',
              verificationMethod: 'self_report',
              reflection: 'What lifestyle changes are you willing to make for FIRE?'
            },
            {
              id: 'fire_action_3',
              title: '🏆 Boss Mode: Create your FIRE roadmap',
              description: 'Develop a comprehensive plan with timeline, milestones, and investment strategy',
              difficulty: 'hard',
              xp: 400,
              timeEstimate: '90-120 min',
              tools: ['Financial calculator', 'Investment research'],
              bonus: 'Share your FIRE timeline for 100 bonus XP!'
            }
          ]
        },
        fr: {
          title: '🔥 Défi Action FIRE',
          subtitle: 'Commencez votre voyage FIRE !',
          description: 'Prenez des actions réelles pour commencer votre voyage Indépendance Financière, Retraite Anticipée',
          timeLimit: 168, // heures (1 semaine)
          actions: [
            {
              id: 'fire_action_1',
              title: '📱 Victoire Rapide : Calculez votre nombre FIRE',
              description: 'Utilisez la règle des 4% pour calculer combien vous avez besoin pour l\'indépendance financière',
              difficulty: 'easy',
              xp: 100,
              timeEstimate: '15 min',
              tips: [
                'Estimez vos dépenses annuelles',
                'Multipliez par 25 (règle des 4%)',
                'Ajoutez une marge de sécurité'
              ],
              verificationMethod: 'screenshot',
              successCriteria: 'Montrer le calcul du nombre FIRE avec décomposition'
            },
            {
              id: 'fire_action_2',
              title: '💰 Optimisez votre taux d\'épargne',
              description: 'Analysez vos dépenses actuelles et identifiez des moyens d\'augmenter l\'épargne à 50%+',
              difficulty: 'medium',
              xp: 200,
              timeEstimate: '45 min',
              verificationMethod: 'self_report',
              reflection: 'Quels changements de style de vie êtes-vous prêt à faire pour FIRE ?'
            },
            {
              id: 'fire_action_3',
              title: '🏆 Mode Boss : Créez votre feuille de route FIRE',
              description: 'Développez un plan complet avec calendrier, étapes, et stratégie d\'investissement',
              difficulty: 'hard',
              xp: 400,
              timeEstimate: '90-120 min',
              tools: ['Calculateur financier', 'Recherche d\'investissement'],
              bonus: 'Partagez votre calendrier FIRE pour 100 XP bonus !'
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
      targetCompletionRate: 0.68,
      targetSatisfaction: 4.9
    }
  }
};

// Helper function spécifique à cette quête
export const getFireMovementHelpers = () => ({
  calculateFireNumber: (annualExpenses) => {
    return annualExpenses * 25; // 4% rule
  },
  calculateSavingsRate: (income, expenses) => {
    return ((income - expenses) / income) * 100;
  },
  getNextStep: (currentStep) => {
    // Logique spécifique
  }
}); 