# Bank AI

A polished, phone-width AI chat app for a fictional bank — a spinning brand orb, topic cards, per-topic welcome screens, and an assistant whose replies render rich markdown, charts, and interactive follow-up pills. Everything runs off a mock API (MSW); there is **no real backend or LLM**. Assistant replies are canned markdown strings, revealed with a fake typewriter "stream".

## Tech stack

- **Vite 8** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first — no `tailwind.config.js`; theme lives in `src/index.css`)
- **React Router 7** — two routes, `/` and `/chat`
- **TanStack Query 5** — server data (topics, insights)
- **Zustand 5** — chat state, persisted to `sessionStorage`
- **MSW 2** — mock API at the Service Worker layer
- **Zod 4** — validates the JSON for custom reply "blocks"
- **Recharts 3** — charts in assistant replies (code-split)
- **react-markdown** + remark-gfm + remark-directive — rich reply rendering
- **sonner** (toasts), **lucide-react** (icons)

## Getting started

```bash
npm install
npm run dev      # http://localhost:9999
```

The dev server starts the MSW mock worker automatically (DEV only). Production builds never load it.

## Scripts

Run from the repo root; workspace scripts are delegated to the right package.

```bash
npm run dev       # Vite dev server (mock API) on http://localhost:9999
npm run dev:real  # Hono server (:8787) + Vite (:9999, MSW off) together
npm run server    # just the Hono backend
npm run build     # tsc -b (typecheck all packages) then vite build → dist/
npm run lint      # oxlint (whole repo)
npm run preview   # serve the production build
```

There is no test runner; `npm run build` is the typecheck gate.

## How it works

- **Routes** — `/` (`WelcomePage`) shows the orb, brand mark, and topic grid; submitting the input starts a fresh "general" conversation and goes to `/chat`. `/chat` (`ChatPage`) picks its thread from the URL (`?topic=<id>`, else `general`) and shows a bespoke welcome screen when a topic thread is empty.
- **Mock API** — `src/mocks/handlers.ts` serves `GET /api/topics`, `GET /api/insights`, and `POST /api/chat`. The chat endpoint returns a full canned markdown reply keyed by thread.
- **Chat state** — `src/store/chatStore.ts` (Zustand) holds one message list per thread and a single `pending` lock, persisted to `sessionStorage`.
- **Fake streaming** — `useTypewriter` reveals the reply progressively, snapping past custom-block fences and highlight directives so raw syntax never flashes.
- **Rich replies** — replies use GFM markdown plus two custom affordances: inline highlights `:hl[text]{tone=…}` and code-split "blocks" authored as `` ```bank:<name>``` `` JSON fences (charts, action cards, suggestion pills). Blocks are validated with Zod and live in `src/components/blocks/`. Raw HTML in replies is intentionally not rendered.

## Project layout

An **npm-workspaces monorepo** (`apps/*` + `packages/*`):

```
apps/
  ai-shell/     the React + Vite AI frontend host (@bank-poc/ai-shell)
    src/
      api/          fetch wrappers (topics, insights, chat)
      components/   UI; blocks/ = custom reply blocks, welcome/ = per-topic screens
      hooks/        useTopics, useInsights, useTypewriter
      mocks/        MSW worker + handlers (all seed + reply data)
      pages/        WelcomePage, ChatPage, DocsPage
      store/        chatStore (Zustand)
      index.css     Tailwind v4 theme tokens, keyframes, utilities
  mobile-shell/ the mobile app host (@bank-poc/mobile-shell)
  mfe-ai-blocks-spend/      MF remote — spend blocks (@bank-poc/mfe-ai-blocks-spend)
  mfe-ai-blocks-portfolio/  MF remote — portfolio blocks (@bank-poc/mfe-ai-blocks-portfolio)
  mfe-ai-blocks-wealth/     MF remote — wealth blocks (@bank-poc/mfe-ai-blocks-wealth)
  mfe-mobile-promo-carousel/ MF remote — promo carousel (@bank-poc/mfe-mobile-promo-carousel)
  server/       the Hono backend (@bank-poc/server) — real LLM mode
packages/
  shared/       @bank-poc/shared — domain types + block Zod schemas
                (the contract shared by web and server; raw TS, no build)
```

See [`CLAUDE.md`](./CLAUDE.md) for a deeper architecture tour.
