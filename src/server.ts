import { createWorkersAI } from "workers-ai-provider";
import { routeAgentRequest, callable } from "agents";
import { AIChatAgent, type OnChatMessageOptions } from "@cloudflare/ai-chat";
import {
  streamText,
  convertToModelMessages,
  pruneMessages,
  tool,
  generateText
} from "ai";
import { z } from "zod";

export type IdeaProfile = {
  problem?: string;
  solution?: string;
  audience?: string;
  monetization?: string;
};

export type VentureBotState = {
  ideaProfile: IdeaProfile;
};

const LLAMA_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const VENTURE_SYSTEM_PROMPT = `You are a friendly startup advisor helping the user validate and refine their business idea. Your goal is to gather structured information to build a monetization plan.

Rules:
1. Ask ONE question at a time. Wait for the user's answer before moving on.
2. Cover these four areas in order: (1) the problem they're solving, (2) their solution/product, (3) target audience, (4) how they plan to make money.
3. When the user gives you an answer that fits one of these areas, call the recordIdeaField tool immediately with the appropriate field name and a concise summary of their answer. Then ask the next question.
4. Be conversational and encouraging. If they give multiple pieces of info at once, record each part with recordIdeaField and then ask about any missing area.
5. If the user says they want to "generate my plan" or "generate plan", tell them they can use the "Generate my plan" button to get a full business plan from what we've discussed.
6. Keep responses brief (2-4 sentences) so the conversation flows.`;

export class ChatAgent extends AIChatAgent<Env, VentureBotState> {
  initialState: VentureBotState = {
    ideaProfile: {}
  };

  waitForMcpConnections = true;

  onStart() {
    this.mcp.configureOAuthCallback({
      customHandler: (result) => {
        if (result.authSuccess) {
          return new Response("<script>window.close();</script>", {
            headers: { "content-type": "text/html" },
            status: 200
          });
        }
        return new Response(
          `Authentication Failed: ${result.authError || "Unknown error"}`,
          { headers: { "content-type": "text/plain" }, status: 400 }
        );
      }
    });
  }

  @callable()
  async addServer(name: string, url: string, host: string) {
    return await this.addMcpServer(name, url, { callbackHost: host });
  }

  @callable()
  async removeServer(serverId: string) {
    await this.removeMcpServer(serverId);
  }

  @callable()
  async generatePlan(): Promise<string> {
    const workersai = createWorkersAI({ binding: this.env.AI });
    const profile = this.state?.ideaProfile ?? {};
    const hasAny =
      profile.problem ||
      profile.solution ||
      profile.audience ||
      profile.monetization;

    if (!hasAny) {
      return '**No idea profile yet.**\n\nChat with the advisor first and answer a few questions about your problem, solution, target audience, and monetization. Then click "Generate my plan" again.';
    }

    const profileText = `
Problem: ${profile.problem ?? "(not provided)"}
Solution: ${profile.solution ?? "(not provided)"}
Target audience: ${profile.audience ?? "(not provided)"}
Monetization: ${profile.monetization ?? "(not provided)"}
`.trim();

    const { text } = await generateText({
      model: workersai(LLAMA_MODEL),
      system: `You are a startup advisor. Given a brief idea profile, write a short, actionable business/monetization plan in markdown. Include: (1) Executive summary, (2) Problem & solution, (3) Target audience, (4) Revenue model, (5) Next steps (3-5 concrete actions). Keep it concise and practical. Output only the markdown, no preamble.`,
      prompt: `Idea profile:\n${profileText}\n\nWrite the business plan in markdown.`
    });

    return text ?? "";
  }

  async onChatMessage(_onFinish: unknown, options?: OnChatMessageOptions) {
    const mcpTools = this.mcp.getAITools();
    const workersai = createWorkersAI({ binding: this.env.AI });

    const result = streamText({
      model: workersai(LLAMA_MODEL),
      system: VENTURE_SYSTEM_PROMPT,
      messages: pruneMessages({
        messages: await convertToModelMessages(this.messages),
        toolCalls: "before-last-2-messages"
      }),
      tools: {
        ...mcpTools,

        recordIdeaField: tool({
          description:
            "Record one piece of the user's idea into the profile. Call this whenever the user answers a question about their problem, solution, target audience, or monetization. Use the exact field names: problem, solution, audience, monetization.",
          inputSchema: z.object({
            field: z
              .enum(["problem", "solution", "audience", "monetization"])
              .describe("Which part of the idea profile to update"),
            value: z.string().describe("Concise summary of what the user said")
          }),
          execute: async ({ field, value }) => {
            const current = this.state?.ideaProfile ?? {};
            const next: IdeaProfile = { ...current, [field]: value };
            this.setState({
              ...this.state,
              ideaProfile: next
            });
            return `Recorded "${field}". You can ask about the next topic or wrap up.`;
          }
        })
      },
      abortSignal: options?.abortSignal
    });

    return result.toUIMessageStreamResponse();
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
