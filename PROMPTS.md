# AI prompts used (Cloudflare AI assignment)

This file documents the prompts used to build VentureBot with AI-assisted coding, per the assignment requirement.

---

## Master prompt (core implementation)

Summary of the main prompt used to implement the Idea Validation Agent on top of the Cloudflare agents-starter:

- **Extend the `AIChatAgent` class** and keep the agent running on the existing Durable Object binding (`ChatAgent`).
- **Set initial state** to hold an `IdeaProfile` object with fields: `problem`, `solution`, `audience`, `monetization`. Use the agent’s built-in state (`this.state`, `this.setState()`) so it persists in the Durable Object.
- **System prompt:** Instruct the LLM (Llama 3.3) to act as a **startup advisor**. It should ask the user **one question at a time** to fill out the idea profile (problem, solution, target audience, monetization). Tell it to call a tool to record each answer so state stays in sync.
- **Add a server-side tool `recordIdeaField`** with parameters: `field` (one of `problem`, `solution`, `audience`, `monetization`) and `value` (string). In `execute`, update the agent’s state with the new value and return a short confirmation.
- **Add a `@callable()` method `generatePlan()`** that reads the current `ideaProfile` from state and calls the same Workers AI model with a dedicated “business plan” prompt. The model should output a single markdown string (executive summary, problem/solution, audience, monetization, next steps). Return that string to the client (no streaming for this call).
- **Switch the chat model** from the starter’s default to **Llama 3.3** on Workers AI (e.g. `@cf/meta/llama-3.3-70b-instruct-fp8-fast`).
- **Remove or simplify** the starter’s demo tools (weather, timezone, calculate, schedule) so the agent is focused on idea validation.
- **Frontend:** Replace “Agent Starter” with **VentureBot** in the header. Add a **“Generate my plan”** button that calls `agent.call("generatePlan", [])` and displays the returned markdown in a modal or expandable section (e.g. using Streamdown or another markdown renderer). Update the suggested prompts to idea-validation examples (e.g. “I have an app idea I want to validate”, “My target audience is…”, “Here’s how I’d make money…”).

---

## Follow-up / refinement prompts (summarized)

- **Use Llama 3.3:** Explicit instruction to use Llama 3.3 on Workers AI for the assignment requirement.
- **Add markdown rendering for the plan:** Render the string returned by `generatePlan()` as markdown in the UI (e.g. using the existing Streamdown component in a modal).
- **README and PROMPTS:** Add a README with architecture, requirements met, and running instructions; add PROMPTS.md documenting the AI prompts used for submission compliance.

---

## Assignment compliance

- Repository name is prefixed with `cf_ai_` (`cf_ai_venture_bot`).
- `README.md` includes project documentation and clear running instructions (local and deploy).
- `PROMPTS.md` (this file) documents the AI prompts used during development.
