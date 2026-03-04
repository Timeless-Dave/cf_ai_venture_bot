import { Suspense, useCallback, useState, useEffect, useRef } from "react";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import type { UIMessage } from "ai";
import type { MCPServersState } from "agents";
import { Button, Surface } from "@cloudflare/kumo";
import { Toasty, useKumoToastManager } from "@cloudflare/kumo/components/toast";
import { Streamdown } from "streamdown";
import {
  XIcon,
  CardsIcon,
  LightbulbFilamentIcon,
  UsersIcon,
  PresentationChartIcon,
  FileTextIcon
} from "@phosphor-icons/react";

import { Header } from "./components/Header";
import { MessageItem } from "./components/MessageItem";
import { ChatInput } from "./components/ChatInput";
import { Sidebar } from "./components/Sidebar";

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

  const suggestions = [
    {
      text: "Analyze my last meeting notes",
      icon: <CardsIcon size={20} weight="duotone" className="text-indigo-500" />
    },
    {
      text: "Draft a product launch strategy",
      icon: (
        <LightbulbFilamentIcon
          size={20}
          weight="duotone"
          className="text-amber-500"
        />
      )
    },
    {
      text: "Schedule a team sync",
      icon: (
        <UsersIcon size={20} weight="duotone" className="text-emerald-500" />
      )
    },
    {
      text: "Generate weekly analytics report",
      icon: (
        <PresentationChartIcon
          size={20}
          weight="duotone"
          className="text-rose-500"
        />
      )
    }
  ];

  return (
    <div className="flex h-screen bg-[#f4f6fb] dark:bg-[#0f1115] overflow-hidden text-[#1a1e23] dark:text-[#f0f2f5] font-sans selection:bg-indigo-500/30 font-medium">
      {/* Sidebar Component */}
      <Sidebar
        onClearHistory={clearHistory}
        onGeneratePlan={handleGeneratePlan}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden bg-white dark:bg-[#15171c] sm:rounded-l-[2rem] shadow-[-8px_0_30px_-10px_rgba(0,0,0,0.04)] border-l border-slate-200/50 dark:border-white/[0.04] transition-colors duration-300">
        {/* Header */}
        <Header
          connected={connected}
          showDebug={showDebug}
          setShowDebug={setShowDebug}
          mcpState={mcpState}
          onAddServer={handleAddServer}
          onRemoveServer={handleRemoveServer}
        />

        {/* Plan modal */}
        {showPlanModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setShowPlanModal(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowPlanModal(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Business plan"
          >
            <Surface
              className="max-w-3xl w-full max-h-[85vh] overflow-hidden rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] flex flex-col border border-white/20 dark:border-white/10 bg-white dark:bg-[#1a1d24]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                    <FileTextIcon size={20} weight="fill" />
                  </div>
                  <span className="font-semibold tracking-tight text-lg text-slate-900 dark:text-white">
                    Generated Plan
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  shape="square"
                  aria-label="Close"
                  icon={<XIcon size={18} weight="bold" />}
                  onClick={() => setShowPlanModal(false)}
                  className="hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white dark:bg-[#15171c] stylish-scrollbar tracking-normal">
                {planLoading ? (
                  <div className="flex flex-col items-center justify-center h-56 gap-5 text-slate-400 animate-in fade-in duration-500">
                    <div className="relative">
                      <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full w-14 h-14 -mx-1 -my-1"></div>
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-indigo-500 relative z-10" />
                    </div>
                    <span className="font-medium tracking-wide text-sm uppercase text-slate-500">
                      Synthesizing plan...
                    </span>
                  </div>
                ) : planResult ? (
                  <Streamdown
                    className="sd-theme prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-img:rounded-2xl prose-img:shadow-md"
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

        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden stylish-scrollbar scroll-smooth">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-10 pb-4 space-y-10">
            {messages.length === 0 && (
              <div className="flex flex-col justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-700 max-w-2xl mx-auto mt-10">
                <h1 className="text-4xl sm:text-[44px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-4">
                  Welcome to VentureBot. <br />
                  <span className="text-slate-400 dark:text-slate-500 font-medium">
                    How can I help you today?
                  </span>
                </h1>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                  {suggestions.map((item, i) => (
                    <Button
                      key={item.text}
                      variant="ghost"
                      size="base"
                      disabled={isStreaming}
                      className="h-auto py-4 px-5 text-left justify-start items-center gap-3 whitespace-normal hover:-translate-y-1 transition-all duration-300 ring-1 ring-slate-200 dark:ring-white/10 hover:ring-indigo-500/30 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.05)] bg-white dark:bg-[#1a1d24] rounded-2xl group flex font-medium text-[14px] text-slate-700 dark:text-slate-300"
                      style={{ animationDelay: `${i * 50}ms` }}
                      onClick={() => {
                        sendMessage({
                          role: "user",
                          parts: [{ type: "text", text: item.text }]
                        });
                      }}
                    >
                      <div className="flex-shrink-0 p-2 rounded-xl bg-slate-50 dark:bg-[#252830] group-hover:bg-white group-hover:shadow-sm transition-all border border-slate-100 dark:border-transparent group-hover:border-slate-200">
                        {item.icon}
                      </div>
                      <span className="leading-snug">{item.text}</span>
                    </Button>
                  ))}
                </div>
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

            <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>

        {/* Chat Input — sticky at the bottom inside the flex column */}
        <div className="shrink-0">
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
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Toasty>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#f4f6fb] dark:bg-[#0f1115]">
            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-500" />
            <span className="text-slate-500 dark:text-slate-400 font-medium tracking-wide text-sm">
              Loading Workspace...
            </span>
          </div>
        }
      >
        <Chat />
      </Suspense>
    </Toasty>
  );
}
