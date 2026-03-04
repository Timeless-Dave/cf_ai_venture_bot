import { Suspense, useCallback, useState, useEffect, useRef } from "react";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import type { UIMessage } from "ai";
import type { MCPServersState } from "agents";
import { Button, Empty, Surface } from "@cloudflare/kumo";
import { Toasty, useKumoToastManager } from "@cloudflare/kumo/components/toast";
import { Streamdown } from "streamdown";
import { ChatCircleDotsIcon, GearIcon, XIcon } from "@phosphor-icons/react";

import { Header } from "./components/Header";
import { MessageItem } from "./components/MessageItem";
import { ChatInput } from "./components/ChatInput";

function Chat() {
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toasts = useKumoToastManager();
  const [mcpState, setMcpState] = useState<MCPServersState>({
    prompts: [],
    resources: [],
    servers: {},
    tools: []
  });

  const [planResult, setPlanResult] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const agent = useAgent({
    agent: "ChatAgent",
    onOpen: useCallback(() => setConnected(true), []),
    onClose: useCallback(() => setConnected(false), []),
    onError: useCallback(
      (error: Event) => console.error("WebSocket error:", error),
      []
    ),
    onMcpUpdate: useCallback((state: MCPServersState) => {
      setMcpState(state);
    }, []),
    onMessage: useCallback(
      (message: MessageEvent) => {
        try {
          const data = JSON.parse(String(message.data));
          if (data.type === "scheduled-task") {
            toasts.add({
              title: "Scheduled task completed",
              description: data.description,
              timeout: 0
            });
          }
        } catch {
          // Not JSON or not our event
        }
      },
      [toasts]
    )
  });

  const handleAddServer = async (name: string, url: string) => {
    try {
      await agent.call("addServer", [name, url, window.location.origin]);
    } catch (e) {
      console.error("Failed to add MCP server:", e);
      throw e;
    }
  };

  const handleRemoveServer = async (serverId: string) => {
    try {
      await agent.call("removeServer", [serverId]);
    } catch (e) {
      console.error("Failed to remove MCP server:", e);
    }
  };

  const handleGeneratePlan = useCallback(async () => {
    setPlanLoading(true);
    setPlanResult(null);
    setShowPlanModal(true);
    try {
      const plan = (await agent.call("generatePlan", [])) as string;
      setPlanResult(plan);
    } catch (e) {
      console.error("Failed to generate plan:", e);
      setPlanResult("**Error generating plan.** Please try again.");
    } finally {
      setPlanLoading(false);
    }
  }, [agent]);

  const {
    messages,
    sendMessage,
    clearHistory,
    addToolApprovalResponse,
    stop,
    status
  } = useAgentChat({
    agent
  });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Re-focus the input after streaming ends
  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage({ role: "user", parts: [{ type: "text", text }] });
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isStreaming, sendMessage]);

  return (
    <div className="flex flex-col h-screen bg-transparent relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay z-0 hidden dark:block"></div>
      {/* Header */}
      <Header
        connected={connected}
        showDebug={showDebug}
        setShowDebug={setShowDebug}
        mcpState={mcpState}
        onAddServer={handleAddServer}
        onRemoveServer={handleRemoveServer}
        onClearHistory={clearHistory}
        onGeneratePlan={handleGeneratePlan}
        planLoading={planLoading}
      />

      {/* Plan modal */}
      {showPlanModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowPlanModal(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowPlanModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Business plan"
        >
          <Surface
            className="max-w-3xl w-full max-h-[85vh] overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col border border-white/10 dark:border-white/5 bg-kumo-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-kumo-line/50 bg-kumo-base/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/20">
                  <GearIcon size={22} weight="duotone" />
                </div>
                <span className="font-bold tracking-tight text-lg text-kumo-default">
                  Your Business Plan
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                shape="square"
                aria-label="Close"
                icon={<XIcon size={18} />}
                onClick={() => setShowPlanModal(false)}
                className="hover:bg-kumo-line/50 rounded-full transition-colors"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-gradient-to-b from-transparent to-kumo-base/30 stylish-scrollbar">
              {planLoading ? (
                <div className="flex flex-col items-center justify-center h-56 gap-5 text-kumo-subtle animate-in fade-in duration-500">
                  <div className="relative">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full w-14 h-14 -mx-1 -my-1"></div>
                    <GearIcon
                      size={48}
                      className="animate-spin text-indigo-500 relative z-10"
                      weight="duotone"
                    />
                  </div>
                  <span className="font-semibold tracking-wide text-base">
                    Synthesizing your plan…
                  </span>
                </div>
              ) : planResult ? (
                <Streamdown
                  className="sd-theme prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-500 hover:prose-a:text-indigo-600 prose-img:rounded-xl prose-img:shadow-md"
                  controls={false}
                  isAnimating={false}
                >
                  {planResult}
                </Streamdown>
              ) : null}
            </div>
          </Surface>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto stylish-scrollbar pb-10 scroll-smooth relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {messages.length === 0 && (
            <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-700">
              <Empty
                icon={
                  <div className="relative group">
                    <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-all duration-1000 animate-pulse"></div>
                    <ChatCircleDotsIcon
                      size={80}
                      weight="duotone"
                      className="text-indigo-500 relative z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                }
                title="What's your next big idea?"
                contents={
                  <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl w-full">
                    {[
                      "I have an app idea I want to validate",
                      "My target audience is small business owners",
                      "Here's how I'd make money: subscription and ads",
                      "The problem I'm solving is scheduling for remote teams"
                    ].map((prompt, i) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        size="base"
                        disabled={isStreaming}
                        className={`h-auto py-5 px-6 text-left justify-start whitespace-normal hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 ring-1 ring-kumo-line/40 hover:ring-indigo-500/50 bg-kumo-base/60 backdrop-blur-md rounded-2xl group relative overflow-hidden`}
                        style={{ animationDelay: `${i * 100}ms` }}
                        onClick={() => {
                          sendMessage({
                            role: "user",
                            parts: [{ type: "text", text: prompt }]
                          });
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <span className="relative z-10 font-semibold text-[15px] text-kumo-default group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-relaxed">
                          {prompt}
                        </span>
                      </Button>
                    ))}
                  </div>
                }
              />
            </div>
          )}

          {messages.map((message: UIMessage, index: number) => {
            const isLastAssistant =
              message.role === "assistant" && index === messages.length - 1;

            return (
              <MessageItem
                key={message.id}
                message={message}
                isLastAssistant={isLastAssistant}
                isStreaming={isStreaming}
                showDebug={showDebug}
                addToolApprovalResponse={addToolApprovalResponse}
              />
            );
          })}

          <div ref={messagesEndRef} className="h-6" />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        ref={textareaRef}
        input={input}
        setInput={setInput}
        isStreaming={isStreaming}
        connected={connected}
        onSend={send}
        onStop={stop}
      />
    </div>
  );
}

export default function App() {
  return (
    <Toasty>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center h-screen gap-6 bg-kumo-base">
            <div className="relative">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-[spin_3s_linear_infinite] w-16 h-16 -mx-2 -my-2"></div>
              <ChatCircleDotsIcon
                size={48}
                className="text-indigo-500 animate-pulse relative z-10 drop-shadow-xl"
                weight="duotone"
              />
            </div>
            <span className="text-kumo-subtle font-bold tracking-[0.2em] uppercase text-sm animate-pulse">
              Initializing VentureBot...
            </span>
          </div>
        }
      >
        <Chat />
      </Suspense>
    </Toasty>
  );
}
