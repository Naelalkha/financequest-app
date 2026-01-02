import { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { useAuth } from '../contexts/AuthContext'

export const PAYWALL_VARIANTS = {
  A_DIRECT: 'A_direct',
  B_AFTER_3: 'B_after_3'
} as const

type PaywallVariant = typeof PAYWALL_VARIANTS[keyof typeof PAYWALL_VARIANTS]

interface QuestInput {
  id?: string
  isPremium?: boolean
  title?: string
}

export function usePaywall(quest: QuestInput | null) {
  const { user } = useAuth()
  const [variant, setVariant] = useState<PaywallVariant>(PAYWALL_VARIANTS.A_DIRECT)

  /* récupère la variante dès le premier rendu */
  useEffect(() => {
    const v = posthog.getFeatureFlag('paywall_variant')
    console.log('PostHog feature flag paywall_variant:', v)
    if (v && typeof v === 'string' && Object.values(PAYWALL_VARIANTS).includes(v as PaywallVariant)) {
      setVariant(v as PaywallVariant)
    }
  }, [])

  // Debug pour diagnostiquer le problème
  console.log('usePaywall Debug:', {
    user: user ? {
      isPremium: user.isPremium,
      completedQuests: user.completedQuests,
      uid: user.uid
    } : 'No user',
    quest: quest ? {
      id: quest.id,
      isPremium: quest.isPremium,
      title: quest.title
    } : 'No quest',
    variant,
    posthogAvailable: typeof posthog !== 'undefined'
  })

  /* règles */
  if (user?.isPremium) {
    console.log('Paywall not shown: user is premium')
    return { show: false, variant }
  }

  // Variante A : Paywall sur quête premium
  if (variant === PAYWALL_VARIANTS.A_DIRECT && quest?.isPremium) {
    console.log('Paywall A shown: premium quest clicked')
    return { show: true, variant }
  }

  // Variante B : Paywall après 3 quêtes complétées (seulement après completion, pas au chargement)
  if (variant === PAYWALL_VARIANTS.B_AFTER_3) {
    console.log('Paywall B check:', {
      completedQuests: user?.completedQuests || 0,
      shouldShow: false, // Ne jamais montrer au chargement pour la variante B
      note: 'Paywall B only shows after quest completion'
    })
    
    return { 
      show: false, // Variante B ne s'affiche qu'après completion via setShowPaywall(true)
      variant 
    }
  }

  return { show: false, variant }
} 