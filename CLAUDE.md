# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common commands

- Install deps: `yarn install`
- Local dev (runs mask watcher + Next dev): `yarn dev`
- Build (standalone): `yarn build`
- Start production server: `yarn start`
- Lint: `yarn lint`
- Export build (static/app mode): `yarn export`
- Desktop app dev (Tauri): `yarn app:dev`
- Desktop app build (Tauri): `yarn app:build`
- Tests (watch): `yarn test`
- Tests (CI): `yarn test:ci`

### Required local env

Create `.env.local` at repo root with at least:

```
OPENAI_API_KEY=<your api key>
```

(Optional) `BASE_URL` can be used as a proxy endpoint (see README).

## High-level architecture

- **Next.js app router**: The UI is a Next.js 14 app under `app/` using the app router. Entry points are `app/layout.tsx` (global layout/metadata/config injection) and `app/page.tsx` (renders the main `Home` UI).

- **Client UI + routing**: The main client shell is `app/components/home.tsx`. It is a client component that wires a `HashRouter` (from `react-router-dom`) and lazily loads major views (chat, settings, plugins, masks, artifacts, SD, auth). Shared UI building blocks live under `app/components/`.

- **State management**: Client state uses Zustand stores in `app/store/` (e.g., `chat`, `config`, `access`, `plugin`, `mask`). `app/store/chat.ts` handles sessions, history, summarization, MCP actions, and persistence.

- **Provider/model integrations**:
  - Client-side API abstractions live in `app/client/`. `app/client/api.ts` maps provider enums to concrete platform adapters in `app/client/platforms/` (OpenAI, Anthropic, Gemini, Azure, DeepSeek, xAI, etc.).
  - Server-side API routes live in `app/api/`, including provider routes and a dynamic proxy route at `app/api/[provider]/[...path]/route.ts`.

- **Config flow**: Build/runtime config is in `app/config/` (`build.ts`, `server.ts`, `client.ts`). Server config is serialized into the layout via a `<meta name="config">` for client consumption.

- **MCP support**: Model Context Protocol logic is under `app/mcp/` and referenced from the chat store and UI.

- **Desktop app**: Tauri integration lives in `src-tauri/` with scripts `yarn app:dev` / `yarn app:build`.

- **Masks/prompts build**: The `yarn mask` / `yarn mask:watch` scripts run `app/masks/build.ts` to build prompt templates used in the UI.
