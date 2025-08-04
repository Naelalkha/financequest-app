import { FaPiggyBank, FaChartLine, FaCalculator } from 'react-icons/fa';

export const retirementPlanning = {
  id: 'retirement-planning',
  category: 'planning',
  difficulty: 'advanced',
  duration: 30,
  xp: 200,
  isPremium: true,
  order: 10,
  
  // Métadonnées enrichies
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['retirement', 'long-term', 'advanced'],
    relatedQuests: ['fire-movement', 'tax-optimization'],
    averageCompletionTime: 28,
    completionRate: 0.72,
    userRating: 4.8
  },

  // Icônes spécifiques
  icons: {
    main: FaPiggyBank,
    steps: [FaChartLine, FaCalculator]
  },
  
  // Couleurs thématiques
  colors: {
    primary: '#6B5B95',
    secondary: '#8B7BB8',
    accent: '#FBBF24'
  },

  // Contenu localisé structuré
  content: {
    en: {
      title: 'Retirement Planning Essentials',
      description: 'Never too early to plan for financial freedom',
      longDescription: 'Learn to calculate your retirement needs, understand different retirement accounts (401(k), IRA, Roth), maximize employer matching, and create an age-based investment strategy.',
      objectives: [
        'Calculate retirement needs',
        'Understand 401(k), IRA, and Roth accounts',
        'Learn about employer matching',
        'Create age-based investment strategy',
        'Plan for healthcare in retirement'
      ],
      prerequisites: ['Investing Basics', 'Steady income'],
      whatYouWillLearn: [
        'Retirement needs calculation',
        'Tax-advantaged retirement accounts',
        'Employer matching strategies',
        'Age-based asset allocation',
        'Healthcare cost planning'
      ],
      realWorldApplication: 'Apply retirement planning principles to secure your financial future and achieve the retirement lifestyle you desire.'
    },
    fr: {
      title: 'Essentiels de Planification Retraite',
      description: 'Jamais trop tôt pour planifier la liberté financière',
      longDescription: 'Apprenez à calculer vos besoins de retraite, comprendre les différents comptes retraite (401(k), IRA, Roth), maximiser les contributions employeur, et créer une stratégie d\'investissement par âge.',
      objectives: [
        'Calculer les besoins de retraite',
        'Comprendre les comptes retraite',
        'Apprendre sur la contribution employeur',
        'Créer stratégie d\'investissement par âge',
        'Planifier les soins de santé'
      ],
      prerequisites: ['Bases de l\'Investissement', 'Revenu stable'],
      whatYouWillLearn: [
        'Calcul des besoins de retraite',
        'Comptes retraite avantageux fiscalement',
        'Stratégies de contribution employeur',
        'Allocation d\'actifs par âge',
        'Planification des coûts de santé'
      ],
      realWorldApplication: 'Appliquez les principes de planification retraite pour sécuriser votre avenir financier et atteindre le style de vie de retraite que vous désirez.'
    }
  },

  // Rewards enrichis
  rewards: {
    badge: {
      id: 'future_planner',
      name: { en: 'Future Planner', fr: 'Planificateur d\'Avenir' },
      description: { 
        en: 'Mastered retirement planning and long-term financial strategy',
        fr: 'Maîtrisé la planification retraite et la stratégie financière à long terme'
      },
      rarity: 'epic',
      imageUrl: '/badges/future-planner.png'
    },
    unlocks: ['fire-movement', 'tax-optimization'],
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
      hint_fr: 'Pensez à quand vous payez les impôts...',
      difficulty: 'medium',
      points: 20
    },
    {
      type: 'multiple_choice',
      question_en: 'What is the "4% rule" in retirement planning?',
      question_fr: 'Qu\'est-ce que la "règle des 4%" en planification retraite ?',
      options_en: [
        'Save 4% of your income',
        'Retire at 4% interest rate',
        'Withdraw 4% of portfolio annually',
        'Invest 4% in bonds'
      ],
      options_fr: [
        'Épargner 4% de vos revenus',
        'Prendre retraite à 4% taux intérêt',
        'Retirer 4% du portefeuille annuellement',
        'Investir 4% en obligations'
      ],
      correct: 2,
      explanation_en: 'The 4% rule suggests you can safely withdraw 4% of your portfolio each year in retirement.',
      explanation_fr: 'La règle des 4% suggère que vous pouvez retirer en sécurité 4% de votre portefeuille chaque année à la retraite.',
      hint_en: 'Think about withdrawal rates, not contribution rates...',
      hint_fr: 'Pensez aux taux de retrait, pas aux taux de contribution...',
      difficulty: 'medium',
      points: 25
    },
    {
      type: 'multiple_choice',
      question_en: 'At what age can you withdraw from a 401(k) without penalties?',
      question_fr: 'À quel âge pouvez-vous retirer d\'un 401(k) sans pénalités ?',
      options_en: [
        '55',
        '59½',
        '62',
        '65'
      ],
      options_fr: [
        '55',
        '59½',
        '62',
        '65'
      ],
      correct: 1,
      explanation_en: 'You can withdraw from most retirement accounts without penalties starting at age 59½.',
      explanation_fr: 'Vous pouvez retirer de la plupart des comptes retraite sans pénalités à partir de 59½ ans.',
      hint_en: 'It\'s before traditional retirement age...',
      hint_fr: 'C\'est avant l\'âge traditionnel de retraite...',
      difficulty: 'easy',
      points: 15
    },
    {
      type: 'multiple_choice',
      question_en: 'What is the main advantage of starting retirement savings early?',
      question_fr: 'Quel est l\'avantage principal de commencer tôt l\'épargne retraite ?',
      options_en: [
        'Higher salary when young',
        'Compound interest over time',
        'Lower living expenses',
        'Better investment options'
      ],
      options_fr: [
        'Salaire plus élevé quand jeune',
        'Intérêts composés dans le temps',
        'Dépenses de vie plus basses',
        'Meilleures options d\'investissement'
      ],
      correct: 1,
      explanation_en: 'Starting early gives compound interest more time to work, potentially doubling or tripling your retirement savings.',
      explanation_fr: 'Commencer tôt donne plus de temps aux intérêts composés de fonctionner, pouvant doubler ou tripler votre épargne retraite.',
      hint_en: 'Think about the power of time in investing...',
      hint_fr: 'Pensez au pouvoir du temps en investissement...',
      difficulty: 'easy',
      points: 20
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
    },
    {
      id: 'action-challenge',
      type: 'action',
      duration: 25,
      content: {
        en: {
          title: '🏖️ Retirement Action Challenge',
          subtitle: 'Build your retirement foundation!',
          description: 'Take real actions to set up and optimize your retirement planning',
          timeLimit: 96, // hours
          actions: [
            {
              id: 'retirement_action_1',
              title: '📱 Quick Win: Check your employer match',
              description: 'Review your current 401(k) or retirement plan to understand employer matching',
              difficulty: 'easy',
              xp: 100,
              timeEstimate: '15 min',
              tips: [
                'Log into your retirement account',
                'Check the matching percentage',
                'Verify you\'re contributing enough'
              ],
              verificationMethod: 'screenshot',
              successCriteria: 'Show current contribution rate and employer match details'
            },
            {
              id: 'retirement_action_2',
              title: '💰 Calculate your retirement number',
              description: 'Use the 4% rule to calculate how much you need to retire comfortably',
              difficulty: 'medium',
              xp: 200,
              timeEstimate: '30 min',
              verificationMethod: 'self_report',
              reflection: 'How does this number compare to your current savings?'
            },
            {
              id: 'retirement_action_3',
              title: '🏆 Boss Mode: Optimize your retirement accounts',
              description: 'Increase contributions, open new accounts, or rebalance your portfolio',
              difficulty: 'hard',
              xp: 400,
              timeEstimate: '60-90 min',
              tools: ['Retirement account access', 'Financial calculator'],
              bonus: 'Share your retirement strategy for 100 bonus XP!'
            }
          ]
        },
        fr: {
          title: '🏖️ Défi Action Retraite',
          subtitle: 'Construisez votre fondation de retraite !',
          description: 'Prenez des actions réelles pour mettre en place et optimiser votre planification retraite',
          timeLimit: 96, // heures
          actions: [
            {
              id: 'retirement_action_1',
              title: '📱 Victoire Rapide : Vérifiez votre contribution employeur',
              description: 'Examinez votre 401(k) ou plan retraite actuel pour comprendre la contribution employeur',
              difficulty: 'easy',
              xp: 100,
              timeEstimate: '15 min',
              tips: [
                'Connectez-vous à votre compte retraite',
                'Vérifiez le pourcentage de contribution',
                'Vérifiez que vous contribuez assez'
              ],
              verificationMethod: 'screenshot',
              successCriteria: 'Montrer le taux de contribution actuel et détails de la contribution employeur'
            },
            {
              id: 'retirement_action_2',
              title: '💰 Calculez votre nombre de retraite',
              description: 'Utilisez la règle des 4% pour calculer combien vous avez besoin pour une retraite confortable',
              difficulty: 'medium',
              xp: 200,
              timeEstimate: '30 min',
              verificationMethod: 'self_report',
              reflection: 'Comment ce nombre compare-t-il à votre épargne actuelle ?'
            },
            {
              id: 'retirement_action_3',
              title: '🏆 Mode Boss : Optimisez vos comptes retraite',
              description: 'Augmentez les contributions, ouvrez de nouveaux comptes, ou rééquilibrez votre portefeuille',
              difficulty: 'hard',
              xp: 400,
              timeEstimate: '60-90 min',
              tools: ['Accès compte retraite', 'Calculateur financier'],
              bonus: 'Partagez votre stratégie de retraite pour 100 XP bonus !'
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
      targetCompletionRate: 0.72,
      targetSatisfaction: 4.8
    }
  }
};

// Helper function spécifique à cette quête
export const getRetirementPlanningHelpers = () => ({
  calculateRetirementNumber: (annualExpenses) => {
    return annualExpenses * 25; // 4% rule
  },
  getNextStep: (currentStep) => {
    // Logique spécifique
  }
}); 