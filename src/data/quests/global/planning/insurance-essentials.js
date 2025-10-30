import { FaShieldAlt, FaFileContract, FaCalculator } from 'react-icons/fa';

export const insuranceEssentials = {
  id: 'insurance-essentials',
  category: 'protect',
  difficulty: 'intermediate',
  duration: 25,
  xp: 150,
  isPremium: true,
  order: 15,
  
  // Métadonnées enrichies
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['insurance', 'protection', 'risk-management'],
    relatedQuests: ['estate-planning', 'wealth-preservation'],
    averageCompletionTime: 23,
    completionRate: 0.75,
    userRating: 4.6
  },

  // Icônes spécifiques
  icons: {
    main: FaShieldAlt,
    steps: [FaFileContract, FaCalculator]
  },
  
  // Couleurs thématiques
  colors: {
    primary: '#6B5B95',
    secondary: '#8B7BB8',
    accent: '#4CAF50'
  },

  // Contenu localisé structuré
  content: {
    en: {
      title: 'Insurance Essentials & Protection',
      description: 'Protect your wealth with smart insurance choices',
      longDescription: 'Learn to understand different types of insurance, calculate appropriate coverage amounts, compare policies effectively, and avoid over-insurance pitfalls.',
      objectives: [
        'Understand types of insurance needed',
        'Calculate appropriate coverage amounts',
        'Learn to compare policies effectively',
        'Avoid over-insurance pitfalls',
        'Know when to update coverage'
      ],
      prerequisites: ['Basic financial literacy', 'Understanding of assets'],
      whatYouWillLearn: [
        'Essential insurance types',
        'Coverage calculation methods',
        'Policy comparison strategies',
        'Over-insurance avoidance',
        'Coverage update timing'
      ],
      realWorldApplication: 'Apply insurance knowledge to protect your wealth and family from financial catastrophe while avoiding unnecessary costs.'
    },
    fr: {
      title: 'Essentiels d\'Assurance & Protection',
      description: 'Protégez votre richesse avec des choix d\'assurance intelligents',
      longDescription: 'Apprenez à comprendre les différents types d\'assurance, calculer les montants de couverture appropriés, comparer les polices efficacement, et éviter les pièges de sur-assurance.',
      objectives: [
        'Comprendre types d\'assurance nécessaires',
        'Calculer montants de couverture appropriés',
        'Apprendre à comparer polices efficacement',
        'Éviter pièges de sur-assurance',
        'Savoir quand mettre à jour couverture'
      ],
      prerequisites: ['Littératie financière de base', 'Compréhension des actifs'],
      whatYouWillLearn: [
        'Types d\'assurance essentiels',
        'Méthodes de calcul de couverture',
        'Stratégies de comparaison de polices',
        'Évitement de sur-assurance',
        'Timing de mise à jour de couverture'
      ],
      realWorldApplication: 'Appliquez les connaissances d\'assurance pour protéger votre richesse et votre famille de la catastrophe financière tout en évitant les coûts inutiles.'
    }
  },

  // Rewards enrichis
  rewards: {
    badge: {
      id: 'protection_pro',
      name: { en: 'Protection Pro', fr: 'Pro de la Protection' },
      description: { 
        en: 'Mastered insurance essentials and wealth protection strategies',
        fr: 'Maîtrisé les essentiels d\'assurance et les stratégies de protection de richesse'
      },
      rarity: 'rare',
      imageUrl: '/badges/protection-pro.png'
    },
    unlocks: ['estate-planning', 'wealth-preservation'],
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
      hint_fr: 'Pensez aux besoins familiaux à long terme...',
      difficulty: 'medium',
      points: 15
    },
    {
      type: 'multiple_choice',
      question_en: 'What is the primary purpose of term life insurance?',
      question_fr: 'Quel est l\'objectif principal de l\'assurance vie temporaire ?',
      options_en: ['Investment growth', 'Income replacement', 'Tax shelter', 'Retirement savings'],
      options_fr: ['Croissance d\'investissement', 'Remplacement de revenu', 'Abri fiscal', 'Épargne retraite'],
      correct: 1,
      explanation_en: 'Term life insurance provides income replacement for dependents if you die during the term.',
      explanation_fr: 'L\'assurance vie temporaire fournit un remplacement de revenu pour les dépendants si vous décédez pendant la période.',
      hint_en: 'Think about protecting those who depend on your income...',
      hint_fr: 'Pensez à protéger ceux qui dépendent de vos revenus...',
      difficulty: 'easy',
      points: 20
    },
    {
      type: 'multiple_choice',
      question_en: 'What does disability insurance protect against?',
      question_fr: 'Contre quoi l\'assurance invalidité protège-t-elle ?',
      options_en: ['Death', 'Loss of income due to inability to work', 'Medical bills', 'Property damage'],
      options_fr: ['Décès', 'Perte de revenu due à l\'incapacité de travailler', 'Factures médicales', 'Dommages à la propriété'],
      correct: 1,
      explanation_en: 'Disability insurance replaces a portion of your income if you become unable to work due to illness or injury.',
      explanation_fr: 'L\'assurance invalidité remplace une portion de votre revenu si vous devenez incapable de travailler à cause de maladie ou blessure.',
      hint_en: 'Think about what happens if you can\'t work...',
      hint_fr: 'Pensez à ce qui arrive si vous ne pouvez pas travailler...',
      difficulty: 'easy',
      points: 20
    },
    {
      type: 'multiple_choice',
      question_en: 'Which is typically more expensive: term or whole life insurance?',
      question_fr: 'Laquelle est généralement plus chère : assurance vie temporaire ou vie entière ?',
      options_en: ['Term life', 'Whole life', 'They cost the same', 'Depends on age only'],
      options_fr: ['Vie temporaire', 'Vie entière', 'Elles coûtent pareil', 'Dépend seulement de l\'âge'],
      correct: 1,
      explanation_en: 'Whole life insurance is much more expensive because it combines insurance with investment, while term is pure insurance.',
      explanation_fr: 'L\'assurance vie entière est beaucoup plus chère car elle combine assurance et investissement, tandis que temporaire est de l\'assurance pure.',
      hint_en: 'Think about which has an investment component...',
      hint_fr: 'Pensez à laquelle a une composante d\'investissement...',
      difficulty: 'medium',
      points: 25
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
    },
    {
      id: 'action-challenge',
      type: 'action',
      duration: 20,
      content: {
        en: {
          title: '🛡️ Insurance Action Challenge',
          subtitle: 'Protect your financial future!',
          description: 'Take real actions to review and optimize your insurance coverage',
          timeLimit: 96, // hours
          actions: [
            {
              id: 'insurance_action_1',
              title: '📱 Quick Win: Review current insurance policies',
              description: 'Gather and review all your current insurance policies and coverage amounts',
              difficulty: 'easy',
              xp: 75,
              timeEstimate: '20 min',
              tips: [
                'Check policy expiration dates',
                'Review coverage limits',
                'Note premium costs'
              ],
              verificationMethod: 'screenshot',
              successCriteria: 'Show organized list of current policies'
            },
            {
              id: 'insurance_action_2',
              title: '💰 Compare insurance quotes',
              description: 'Get quotes from 3 different insurance providers for better rates',
              difficulty: 'medium',
              xp: 150,
              timeEstimate: '45 min',
              verificationMethod: 'self_report',
              reflection: 'How much could you save by switching providers?'
            },
            {
              id: 'insurance_action_3',
              title: '🏆 Boss Mode: Optimize your insurance portfolio',
              description: 'Adjust coverage amounts, add missing policies, or remove unnecessary coverage',
              difficulty: 'hard',
              xp: 300,
              timeEstimate: '60-90 min',
              tools: ['Insurance documents', 'Financial calculator'],
              bonus: 'Share your insurance optimization plan for 75 bonus XP!'
            }
          ]
        },
        fr: {
          title: '🛡️ Défi Action Assurance',
          subtitle: 'Protégez votre avenir financier !',
          description: 'Prenez des actions réelles pour examiner et optimiser votre couverture d\'assurance',
          timeLimit: 96, // heures
          actions: [
            {
              id: 'insurance_action_1',
              title: '📱 Victoire Rapide : Examinez vos polices d\'assurance actuelles',
              description: 'Rassemblez et examinez toutes vos polices d\'assurance actuelles et montants de couverture',
              difficulty: 'easy',
              xp: 75,
              timeEstimate: '20 min',
              tips: [
                'Vérifiez les dates d\'expiration',
                'Examinez les limites de couverture',
                'Notez les coûts de prime'
              ],
              verificationMethod: 'screenshot',
              successCriteria: 'Montrer la liste organisée des polices actuelles'
            },
            {
              id: 'insurance_action_2',
              title: '💰 Comparez les devis d\'assurance',
              description: 'Obtenez des devis de 3 fournisseurs d\'assurance différents pour de meilleurs taux',
              difficulty: 'medium',
              xp: 150,
              timeEstimate: '45 min',
              verificationMethod: 'self_report',
              reflection: 'Combien pourriez-vous économiser en changeant de fournisseur ?'
            },
            {
              id: 'insurance_action_3',
              title: '🏆 Mode Boss : Optimisez votre portefeuille d\'assurance',
              description: 'Ajustez les montants de couverture, ajoutez des polices manquantes, ou supprimez la couverture inutile',
              difficulty: 'hard',
              xp: 300,
              timeEstimate: '60-90 min',
              tools: ['Documents d\'assurance', 'Calculateur financier'],
              bonus: 'Partagez votre plan d\'optimisation d\'assurance pour 75 XP bonus !'
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
      targetCompletionRate: 0.75,
      targetSatisfaction: 4.6
    }
  }
};

// Helper function spécifique à cette quête
export const getInsuranceEssentialsHelpers = () => ({
  calculateLifeInsuranceNeeds: (annualIncome, debts, futureExpenses) => {
    return (annualIncome * 10) + debts + futureExpenses;
  },
  getNextStep: (currentStep) => {
    // Logique spécifique
  }
}); 