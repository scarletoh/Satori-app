---
name: Single Stage Navigation Architecture
description: How SATORI replaced Expo Router tabs with a custom single-stage animated section switcher
---

## The rule
SATORI uses a "Single Stage" pattern — NOT standard tab navigation. All 5 sections (Home, Mood, Journal, Routines, Insights) live inside `app/(tabs)/index.tsx` as a single stateful component. The tab bar is completely hidden in `_layout.tsx` (`tabBarStyle: { display: 'none' }`).

## How to apply
- Section state: `activeSection: 'home' | 'mood' | 'journal' | 'routines' | 'insights'`
- Transitions: React `Animated` fade (opacity) + `useNativeDriver: true` — NOT reanimated
- Navigation: Custom `FloatingNav` pill using `BlurView`, absolutely positioned at bottom
- Deep focus: `isDeepFocus` boolean + animated `navAnim` (0→1 slides nav out, journal renders full-screen TextInput)
- Ambient glow: time-of-day + today's mood drives `getAmbientColor()` → colored circle View, `opacity: 0.045`
- Sections are REMOUNTED on switch (not lazily kept mounted) — form state resets when switching tabs

**Why:** User requested Apple-level cinematic experience. Rigid tab switching felt jarring. Glass-layer sliding is more emotionally consistent with the app's Zen aesthetic.

## Do NOT add back the standard tab bar
The individual tab files (`mood.tsx`, `journal.tsx`, etc.) still exist for potential direct navigation from stack screens (profile, AI insights push to these). But the primary UI entry is always `index.tsx` → `SingleStageScreen`.
