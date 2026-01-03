# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with code in this repository.

## Project Overview

**Moniyo** (formerly FinanceQuest) is a gamified personal finance learning app built as a React PWA. Users complete interactive "quests" to learn financial skills, earn XP, level up, and track their financial impact.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 7
- **Styling**: Tailwind CSS 3.4 with custom "Onyx & Volt" dark theme
- **State**: Zustand for local state
- **Backend**: Firebase (Auth, Firestore)
- **Payments**: Stripe (subscriptions)
- **i18n**: i18next with namespaced translations (fr/en)
- **PWA**: Vite PWA plugin with Workbox

## Common Commands

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Architecture

The project follows a **LEGO + MODULE + CARTE** pattern:

```
src/
├── components/          # Reusable UI components (Design System)
│   ├── ui/             # Button, Card, Badge, Input, etc.
│   └── layout/         # BottomNav, AppBackground, AuthLayout
├── features/           # Feature modules (self-contained)
│   ├── dashboard/      # Main dashboard view + components
│   ├── quests/         # Quest system (core gameplay)
│   │   ├── registry.ts # Quest registry mapping
│   │   ├── shared/     # Common quest components
│   │   ├── pilotage/   # Budget & cashflow quests
│   │   ├── defense/    # Savings quests
│   │   ├── growth/     # Investment quests
│   │   └── strategy/   # Long-term strategy quests
│   ├── gamification/   # XP, levels, badges
│   ├── identity/       # Profile, subscription
│   ├── impact/         # Financial impact tracking
│   └── onboarding/     # New user flow
├── contexts/           # React contexts (AuthContext, BackgroundContext)
├── config/             # Firebase, i18n configuration
├── services/           # Firebase services
├── hooks/              # Global hooks
├── stores/             # Zustand stores
└── locales/            # i18n translations (fr/, en/)
```

## Key Patterns

### Path Aliases

Use `@/` prefix for imports from src:
```typescript
import { Button } from '@/components/ui';
import { useGamification } from '@/features/gamification/hooks/useGamification';
```

### Quest Structure

Each quest follows this pattern:
```
features/quests/[category]/[quest-name]/
├── index.ts              # Exports
├── metadata.ts           # Quest metadata (id, title, xp, category)
├── insightData.ts        # Quest content/steps data
├── [QuestName]Flow.tsx   # Main flow component
└── screens/
    ├── ProtocolScreen.tsx    # Step 1: Instructions
    ├── ExecutionScreen.tsx   # Step 2: User actions
    └── DebriefScreen.tsx     # Step 3: Summary/completion
```

### Design System Components

Always use existing UI components from `@/components/ui`:
```typescript
import { Button, Card, Badge, Input, SectionTitle } from '@/components/ui';
```

Button variants: `primary`, `secondary`, `ghost`, `danger`
Card variants: With `glow`, `hover`, `padding` props

### Translations

Use namespaced translations:
```typescript
const { t } = useTranslation(['dashboard', 'common']);
t('dashboard:categories.pilotage.title')
t('common:actions.save')
```

## API Endpoints (Cloudflare Pages Functions)

Located in `/api/`:
- `check-subscription-status.js` - Check user's Stripe subscription
- `create-checkout-session.js` - Create Stripe checkout
- `create-portal-session.js` - Stripe customer portal
- `recalculate-impact.js` - Recalculate financial impact metrics
- `webhook.js` - Stripe webhook handler

## Firebase

- **Auth**: Email/password authentication
- **Firestore Collections**:
  - `users/` - User profiles, subscription status
  - `users/{uid}/progress/` - Quest progress
  - `users/{uid}/savings/` - Logged savings

## Important Files

- `src/AppRouter.tsx` - Route definitions
- `src/features/quests/registry.ts` - Quest component registry
- `src/config/gamification.ts` - XP, levels, badges config
- `firestore.rules` - Database security rules
- `firebase.json` - Firebase hosting config

## Development Notes

- The app is mobile-first (PWA optimized for portrait mode)
- Dark theme only ("Onyx & Volt" design language)
- No tests currently configured
- French (fr) is the primary language, English (en) secondary
- Console logs are dropped in production builds
