# VentureBot: Cloudflare AI Internship Assignment

VentureBot is an AI-powered idea validation and monetization agent. You pitch a raw idea in chat; the agent acts as a startup advisor, asks one question at a time (problem, solution, audience, monetization), and stores your answers in persistent state. When you click **Generate my plan**, it produces a structured, actionable business plan in markdown from everything you’ve shared.

## Architecture & requirements met

This application is built on the Cloudflare Developer Platform using the [Agents SDK](https://developers.cloudflare.com/agents/).

- **LLM:** Llama 3.3 (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) via [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/). No API key required.
- **Coordination:** [Cloudflare Agents SDK](https://developers.cloudflare.com/agents/) — the agent runs on a [Durable Object](https://developers.cloudflare.com/durable-objects/) with persistent state and WebSocket coordination.
- **User input:** Chat via [@cloudflare/ai-chat](https://developers.cloudflare.com/agents/api-reference/chat-agents/) and the `useAgentChat` React hook over WebSockets (real-time, with message persistence).
- **Memory/state:** The agent’s `IdeaProfile` (problem, solution, audience, monetization) is stored in the Durable Object and updated via the `recordIdeaField` tool as the user answers. Chat history is persisted in SQLite.

## Running instructions

### Prerequisites

- Node.js (v18+)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) with [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) configured (e.g. `wrangler login`)

### Local development

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cf_ai_venture_bot.git
   cd cf_ai_venture_bot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

Chat with the advisor (e.g. “I have an app idea I want to validate”), answer a few questions, then click **Generate my plan** to get a markdown business plan.

### Deploy

```bash
npm run deploy
```

Your agent will be available at a `*.workers.dev` URL. Use the same flow: chat to fill the idea profile, then **Generate my plan**.

## Project structure

- **`src/server.ts`** — VentureBot agent: `AIChatAgent` with `IdeaProfile` state, `recordIdeaField` tool, `generatePlan()` callable, and Llama 3.3 via Workers AI.
- **`src/app.tsx`** — React chat UI: `useAgentChat`, “Generate my plan” button, plan modal with markdown rendering.
- **`src/client.tsx`** — React entry point.
- **`src/styles.css`** — Tailwind + Kumo styles.
- **`wrangler.jsonc`** — Worker config: Durable Objects, Workers AI binding, assets.
- **`PROMPTS.md`** — AI prompts used during development (see this file for assignment compliance).

## AI-assisted development

AI-assisted coding was used to build this project. The prompts used are documented in [PROMPTS.md](./PROMPTS.md).

## License

MIT.
