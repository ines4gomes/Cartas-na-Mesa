# ENJUV Reflection Cards — PRD

## Vision
Mobile-first digital deck of cards for youth group dynamics (Portuguese/Portugal). Facilitates interaction and reflection through random age-based questions.

## Scope (v1 — Feb 2026)
- 100% offline app. No backend required. No authentication.
- 3 decks, strictly separated by age:
  - **12-15 Anos** — 13 cards (quebra-gelo, gratidão, progenitores, amor próprio, espiritualidade, tema).
  - **16-20 Anos** — 13 cards (progenitores, gratidão, amor próprio, identidade, mundo atual, espiritualidade, tema).
  - **21-30 Anos** — 13 cards (saúde mental, conversas difíceis, maturidade espiritual, tema).
- Content extracted from the official ENJUV PDF (Open⭕️_ENJUV.pdf).

## User Flow
1. Home: user picks one of the 3 decks.
2. Deck screen: large card covers most of the screen. Initial state shows "Toca para revelar".
3. First tap reveals a random question.
4. Device is passed, next person taps anywhere on the card to draw the next random question.
5. Progress pill shows `drawn / total` (e.g., `5 / 13`) and deck label.
6. When all cards have been drawn, the next tap shows "Baralho Concluído!" with options to **Reiniciar Baralho** or **Voltar ao Início**. Only then is the deck reshuffled.

## Core Logic
- On deck open: full question array is Fisher–Yates shuffled into a queue.
- Each tap pops the next item. A drawn question never reappears until the deck is reset.
- State is in-memory only — fully resets on app reopen (per user choice).

## Design
- Theme: Organic & Earthy (modern minimalist, light).
- Background `#FBF9F6`, text `#2D3A34`.
- Per-deck accent colors: `#E69F77` (12-15), `#8CA595` (16-20), `#6B7F8C` (21-30).
- Large, tappable card with soft shadow; haptic tap on mobile.

## Non-Goals (v1)
- No persistence between sessions.
- No favorites, sharing, multiplayer, or editing of questions.

## Tech
- Expo SDK 54, Expo Router (file-based), React Native, TypeScript.
- No external integrations. No API keys.
