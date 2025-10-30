import { FaBrain, FaLightbulb, FaCheckCircle } from 'react-icons/fa';

export const moneyMindset = {
  id: 'money-mindset',
  category: 'protect',
  difficulty: 'beginner',
  duration: 35,
  xp: 150,
  isPremium: false,
  order: 5,
  
  metadata: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'FinanceQuest Team',
    tags: ['mindset', 'psychology', 'beginner-friendly'],
    relatedQuests: ['budget-basics', 'saving-strategies'],
    averageCompletionTime: 18,
    completionRate: 0.85,
    userRating: 4.6,
    featured: false
  },

  icons: {
    main: FaBrain,
    steps: [FaLightbulb, FaCheckCircle]
  },
  
  colors: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#F59E0B'
  },

  content: {
    en: {
      title: 'Money Mindset',
      description: 'Develop a healthy relationship with money and build wealth psychology',
      longDescription: 'Transform your relationship with money by understanding your money mindset, identifying limiting beliefs, and developing positive financial habits.',
      objectives: [
        'Understand your money mindset',
        'Identify limiting beliefs about money',
        'Develop positive money habits',
        'Create a wealth-building mindset'
      ],
      prerequisites: ['Open mind and willingness to change'],
      whatYouWillLearn: [
        'How your childhood affects your money mindset',
        'Common money limiting beliefs',
        'Techniques to develop abundance mindset',
        'Habits of wealthy people'
      ],
      realWorldApplication: 'You\'ll develop a healthier relationship with money and be better equipped to build wealth.'
    },
    fr: {
      title: 'Mentalité d\'Argent',
      description: 'Développez une relation saine avec l\'argent et construisez la psychologie de la richesse',
      longDescription: 'Transformez votre relation avec l\'argent en comprenant votre mentalité d\'argent, en identifiant les croyances limitantes et en développant des habitudes financières positives.',
      objectives: [
        'Comprendre votre mentalité d\'argent',
        'Identifier les croyances limitantes sur l\'argent',
        'Développer des habitudes d\'argent positives',
        'Créer une mentalité de construction de richesse'
      ],
      prerequisites: ['Esprit ouvert et volonté de changer'],
      whatYouWillLearn: [
        'Comment votre enfance affecte votre mentalité d\'argent',
        'Croyances limitantes communes sur l\'argent',
        'Techniques pour développer une mentalité d\'abondance',
        'Habitudes des gens riches'
      ],
      realWorldApplication: 'Vous développerez une relation plus saine avec l\'argent et serez mieux équipé pour construire votre richesse.'
    }
  },

  rewards: {
    badge: {
      id: 'money_mindset_badge',
      name: { en: 'Money Mindset Master', fr: 'Maître de la Mentalité d\'Argent' },
      description: {
        en: 'You\'ve transformed your relationship with money!',
        fr: 'Vous avez transformé votre relation avec l\'argent !'
      },
      rarity: 'common',
      imageUrl: '/badges/money-mindset.png'
    },
    unlocks: ['retirement-planning', 'fire-movement'],
    bonusXP: {
      firstTime: 45,
      speedBonus: 20,
      perfectScore: 25
    }
  },

  steps: [
    {
      id: 'mindset-intro',
      type: 'info',
      title: { en: 'What is Money Mindset?', fr: 'Qu\'est-ce que la Mentalité d\'Argent ?' },
      content: {
        en: {
          text: 'Your money mindset is your beliefs, attitudes, and thoughts about money that influence your financial decisions.',
          funFact: 'Your money mindset is often formed by age 7 and can be changed with conscious effort!'
        },
        fr: {
          text: 'Votre mentalité d\'argent est vos croyances, attitudes et pensées sur l\'argent qui influencent vos décisions financières.',
          funFact: 'Votre mentalité d\'argent est souvent formée à l\'âge de 7 ans et peut être changée avec un effort conscient !'
        }
      },
      xp: 15
    },
    {
      id: 'scarcity-vs-abundance',
      type: 'multiple_choice',
      title: { en: 'Scarcity vs Abundance Mindset', fr: 'Mentalité de Rareté vs Abondance' },
      question: { 
        en: 'Which statement reflects an abundance mindset about money?', 
        fr: 'Quelle affirmation reflète une mentalité d\'abondance concernant l\'argent ?' 
      },
      options: {
        en: [
          'There\'s never enough money to go around',
          'Rich people took money from others',
          'I can create value and attract wealth',
          'Money is the root of all evil'
        ],
        fr: [
          'Il n\'y a jamais assez d\'argent pour tout le monde',
          'Les riches ont pris l\'argent des autres',
          'Je peux créer de la valeur et attirer la richesse',
          'L\'argent est la source de tous les maux'
        ]
      },
      correct: 2,
      explanation: {
        en: 'An abundance mindset believes you can create value and opportunities, rather than seeing money as limited.',
        fr: 'Une mentalité d\'abondance croit qu\'on peut créer de la valeur et des opportunités, plutôt que de voir l\'argent comme limité.'
      },
      hint: {
        en: 'Think positive and growth-oriented...',
        fr: 'Pensez positif et orienté croissance...'
      },
      xp: 20
    },
    {
      id: 'money-beliefs',
      type: 'quiz',
      title: { en: 'Identifying Money Beliefs', fr: 'Identifier les Croyances sur l\'Argent' },
      question: { 
        en: 'Complete this sentence: "Money is..."', 
        fr: 'Complétez cette phrase : "L\'argent est..."' 
      },
      correctAnswer: { en: 'a tool', fr: 'un outil' },
      acceptedAnswers: {
        en: ['a tool', 'tool', 'a resource', 'resource', 'energy', 'a means'],
        fr: ['un outil', 'outil', 'une ressource', 'ressource', 'énergie', 'un moyen']
      },
      explanation: {
        en: 'Money is best viewed as a neutral tool or resource that amplifies your values and enables your goals.',
        fr: 'L\'argent est mieux perçu comme un outil ou une ressource neutre qui amplifie vos valeurs et permet vos objectifs.'
      },
      hint: {
        en: 'Think of money as neutral, not good or bad...',
        fr: 'Pensez à l\'argent comme neutre, ni bon ni mauvais...'
      },
      xp: 25
    },
    {
      id: 'wealth-psychology',
      type: 'multiple_choice',
      title: { en: 'Wealth Psychology', fr: 'Psychologie de la Richesse' },
      question: { 
        en: 'What is the most important factor in building wealth according to psychology?', 
        fr: 'Quel est le facteur le plus important pour construire la richesse selon la psychologie ?' 
      },
      options: {
        en: [
          'High income',
          'Good luck',
          'Consistent habits and patience',
          'Taking big risks'
        ],
        fr: [
          'Revenu élevé',
          'Bonne chance',
          'Habitudes cohérentes et patience',
          'Prendre de gros risques'
        ]
      },
      correct: 2,
      explanation: {
        en: 'Research shows that consistent habits (saving, investing) and patience are more important than income level for building wealth.',
        fr: 'Les recherches montrent que les habitudes cohérentes (épargner, investir) et la patience sont plus importantes que le niveau de revenu pour construire la richesse.'
      },
      hint: {
        en: 'Think about what wealthy people do consistently...',
        fr: 'Pensez à ce que font les gens riches de manière cohérente...'
      },
      xp: 20
    },
    {
      id: 'money-emotions',
      type: 'checklist',
      title: { en: 'Managing Money Emotions', fr: 'Gérer les Émotions liées à l\'Argent' },
      items: {
        en: [
          'Recognize fear-based financial decisions',
          'Separate emotions from financial choices',
          'Practice gratitude for what you have',
          'Focus on long-term goals over short-term wants',
          'Celebrate financial wins, even small ones'
        ],
        fr: [
          'Reconnaître les décisions financières basées sur la peur',
          'Séparer les émotions des choix financiers',
          'Pratiquer la gratitude pour ce qu\'on a',
          'Se concentrer sur les objectifs long terme vs désirs court terme',
          'Célébrer les victoires financières, même petites'
        ]
      },
      explanation: {
        en: 'Managing emotions around money is crucial for making rational financial decisions and avoiding costly mistakes.',
        fr: 'Gérer les émotions autour de l\'argent est crucial pour prendre des décisions financières rationnelles et éviter des erreurs coûteuses.'
      },
      xp: 25
    },
    {
      id: 'wealthy-habits',
      type: 'multiple_choice',
      title: { en: 'Habits of the Wealthy', fr: 'Habitudes des Riches' },
      question: { 
        en: 'Which habit is most common among self-made millionaires?', 
        fr: 'Quelle habitude est la plus commune parmi les millionnaires autodidactes ?' 
      },
      options: {
        en: [
          'They work 80+ hours per week',
          'They read and continuously learn',
          'They take huge financial risks',
          'They spend lavishly to appear successful'
        ],
        fr: [
          'Ils travaillent 80+ heures par semaine',
          'Ils lisent et apprennent continuellement',
          'Ils prennent d\'énormes risques financiers',
          'Ils dépensent somptueusement pour paraître prospères'
        ]
      },
      correct: 1,
      explanation: {
        en: 'Studies show that self-made millionaires read an average of 2-3 books per month and invest heavily in learning.',
        fr: 'Les études montrent que les millionnaires autodidactes lisent en moyenne 2-3 livres par mois et investissent énormément dans l\'apprentissage.'
      },
      hint: {
        en: 'Think about what builds knowledge and skills...',
        fr: 'Pensez à ce qui développe les connaissances et compétences...'
      },
      xp: 20
    },
    {
      id: 'action-challenge',
      type: 'action',
      title: { en: 'Money Mindset Action Challenge', fr: 'Défi Action Mentalité d\'Argent' },
      content: {
        en: {
          description: 'Transform your money mindset!',
          actions: [
            {
              id: 'money-mindset_action_1',
              title: 'Identify your money story',
              description: 'Write down your earliest memories about money and how they affect you today',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'money-mindset_action_2',
              title: 'Challenge limiting beliefs',
              description: 'Identify and challenge one limiting belief about money',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'money-mindset_action_3',
              title: 'Practice gratitude',
              description: 'Start a daily gratitude practice for your financial situation',
              verification: 'manual',
              xp: 15
            }
          ]
        },
        fr: {
          description: 'Transformez votre mentalité d\'argent !',
          actions: [
            {
              id: 'money-mindset_action_1',
              title: 'Identifier votre histoire d\'argent',
              description: 'Écrivez vos premiers souvenirs sur l\'argent et comment ils vous affectent aujourd\'hui',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'money-mindset_action_2',
              title: 'Défier les croyances limitantes',
              description: 'Identifiez et défiez une croyance limitante sur l\'argent',
              verification: 'manual',
              xp: 15
            },
            {
              id: 'money-mindset_action_3',
              title: 'Pratiquer la gratitude',
              description: 'Commencez une pratique quotidienne de gratitude pour votre situation financière',
              verification: 'manual',
              xp: 15
            }
          ]
        }
      },
      validation: (data) => {
        const { moneyStory, beliefsChallenged, gratitudePractice } = data;
        if (moneyStory && beliefsChallenged && gratitudePractice) {
          return { isValid: true, message: 'Great mindset work!' };
        }
        return { isValid: false, message: 'Keep working on your money mindset' };
      },
      xp: 20
    }
  ],

  analytics: {
    completionRate: 0.85,
    averageTime: 18,
    difficultyRating: 2.0,
    userSatisfaction: 4.6,
    retryRate: 0.12,
    dropoffPoints: ['mindset-intro', 'action-challenge'],
    popularFeatures: ['money-story', 'limiting-beliefs', 'gratitude-practice']
  }
};

export const getmoneyMindsetHelpers = () => ({
  identifyMoneyPatterns: (moneyStory) => {
    const patterns = [];
    if (moneyStory.includes('scarcity')) patterns.push('scarcity mindset');
    if (moneyStory.includes('abundance')) patterns.push('abundance mindset');
    if (moneyStory.includes('fear')) patterns.push('fear-based decisions');
    return patterns;
  },
  
  suggestMindsetShifts: (currentMindset) => {
    const shifts = {
      'scarcity': 'Focus on abundance and opportunities',
      'fear': 'Practice financial education and planning',
      'guilt': 'Understand that money is a tool, not evil'
    };
    return shifts[currentMindset] || 'Continue positive mindset practices';
  },
  
  trackMindsetProgress: (beforeScore, afterScore) => {
    const improvement = ((afterScore - beforeScore) / beforeScore) * 100;
    return {
      improvement: Math.max(improvement, 0),
      status: improvement > 20 ? 'excellent' : improvement > 10 ? 'good' : 'needs-work'
    };
  }
}); 