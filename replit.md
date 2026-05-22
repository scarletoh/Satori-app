# SATORI

A precision-crafted mental clarity mobile app. Track mood, journal freely, build daily routines, and gain insight into emotional patterns — all stored locally on device with no accounts or cloud sync.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) with Expo Router
- State: React Context + AsyncStorage (local-only, no backend)
- Fonts: Inter (400/500/600/700) via @expo-google-fonts/inter
- Icons: @expo/vector-icons (Feather)
- Animations: react-native-reanimated
- API: Express 5 (API server not used by mobile app currently)
- DB: PostgreSQL + Drizzle ORM (not used by mobile app currently)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/satori/` — Expo mobile app
- `artifacts/satori/app/(tabs)/` — 5 tab screens: Today, Mood, Journal, Routines, Insights
- `artifacts/satori/app/onboarding.tsx` — 5-step onboarding flow
- `artifacts/satori/app/journal-write.tsx` — Full-screen journal editor
- `artifacts/satori/app/breathe.tsx` — Guided breathing exercise (4-4-6-2)
- `artifacts/satori/app/settings.tsx` — Privacy & data controls
- `artifacts/satori/context/AppContext.tsx` — All state (mood entries, journal, routines, check-ins)
- `artifacts/satori/constants/colors.ts` — SATORI design tokens (light + dark)
- `artifacts/satori/components/` — MoodWheel, MoodCard, JournalCard, RoutineBlock, InsightCard, BreathingCircle

## Architecture decisions

- **Local-first, no accounts** — All data persisted via AsyncStorage on device. No servers, no cloud sync.
- **Context + AsyncStorage** — Single AppContext loads/saves full state on mount/update. Simple and reliable.
- **Dark + light themes** — Dark is the primary aesthetic (deep charcoal #0C0C0E), light uses warm parchment tones.
- **Onboarding gate** — `(tabs)/_layout.tsx` redirects to `/onboarding` if `isOnboarded` is false in context.
- **NativeTabs + liquid glass** — iOS 26 uses NativeTabs; older iOS/Android/web falls back to classic Tabs with BlurView.

## Product

5 core features:
1. **Today** — Home screen with greeting, mood/journal/routine status, breathe CTA
2. **Mood** — Log mood (1-5), emotion (15 options), energy, clarity, optional note. History timeline.
3. **Journal** — Distraction-free writing with guided prompts, word count, entry history
4. **Routines** — Build morning/evening/anytime routines with steps, streaks, completion tracking
5. **Insights** — Weekly mood bar chart, 30-day stats, top emotions, narrative summary

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `Inter_300Regular` is NOT available in the scaffold — use `Inter_400Regular` for light weight text
- The breathing circle uses React `Animated` (not reanimated) to avoid layout animation web crashes
- `useAnimatedStyle` must never be called inside loops — extract to individual components

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for mobile development guidelines
