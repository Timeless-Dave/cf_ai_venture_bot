import { Suspense, useCallback, useState, useEffect, useRef } from "react";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import { isToolUIPart, getToolName } from "ai";
import type { UIMessage } from "ai";
import type { MCPServersState } from "agents";
import {
  Button,
  Badge,
  InputArea,
  Empty,
  Surface,
  Text
} from "@cloudflare/kumo";
import { Toasty, useKumoToastManager } from "@cloudflare/kumo/components/toast";
import { Streamdown } from "streamdown";
import { Switch } from "@cloudflare/kumo";
import {
  PaperPlaneRightIcon,
  StopIcon,
  TrashIcon,
  GearIcon,
  ChatCircleDotsIcon,
  CircleIcon,
  MoonIcon,
  SunIcon,
  CheckCircleIcon,
  XCircleIcon,
  BrainIcon,
  CaretDownIcon,
  BugIcon,
  PlugsConnectedIcon,
  PlusIcon,
  SignInIcon,
  XIcon,
  WrenchIcon,
  FileTextIcon
} from "@phosphor-icons/react";

// ── Small components ──────────────────────────────────────────────────

function ThemeToggle() {
  const [dark, setDark] = useState(
    () => document.documentElement.getAttribute("data-mode") === "dark"
  );

  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    const mode = next ? "dark" : "light";
    document.documentElement.setAttribute("data-mode", mode);
    document.documentElement.style.colorScheme = mode;
    localStorage.setItem("theme", mode);
  }, [dark]);

  return (
    <Button
      variant="secondary"
      shape="square"
      icon={dark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      onClick={toggle}
      aria-label="Toggle theme"
      className="transition-transform duration-300 hover:rotate-12 active:scale-95 bg-kumo-base/50 backdrop-blur-sm"
    />
  );
}

// ── Tool rendering ────────────────────────────────────────────────────

function ToolPartView({
  part,
  addToolApprovalResponse
}: {
  part: UIMessage["parts"][number];
  addToolApprovalResponse: (response: {
    id: string;
    approved: boolean;
  }) => void;
}) {
  if (!isToolUIPart(part)) return null;
  const toolName = getToolName(part);

  // Completed
  if (part.state === "output-available") {
    return (
      <div className="flex justify-start">
        <Surface className="max-w-[85%] px-4 py-2.5 rounded-xl ring ring-kumo-line">
          <div className="flex items-center gap-2 mb-1">
            <GearIcon size={14} className="text-kumo-inactive" />
            <Text size="xs" variant="secondary" bold>
              {toolName}
            </Text>
            <Badge variant="secondary">Done</Badge>
          </div>
          <div className="font-mono">
            <Text size="xs" variant="secondary">
              {JSON.stringify(part.output, null, 2)}
            </Text>
          </div>
        </Surface>
      </div>
    );
  }

  // Needs approval
  if ("approval" in part && part.state === "approval-requested") {
    const approvalId = (part.approval as { id?: string })?.id;
    return (
      <div className="flex justify-start">
        <Surface className="max-w-[85%] px-4 py-3 rounded-xl ring-2 ring-kumo-warning">
          <div className="flex items-center gap-2 mb-2">
            <GearIcon size={14} className="text-kumo-warning" />
            <Text size="sm" bold>
              Approval needed: {toolName}
            </Text>
          </div>
          <div className="font-mono mb-3">
            <Text size="xs" variant="secondary">
              {JSON.stringify(part.input, null, 2)}
            </Text>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<CheckCircleIcon size={14} />}
              onClick={() => {
                if (approvalId) {
                  addToolApprovalResponse({ id: approvalId, approved: true });
                }
              }}
            >
              Approve
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<XCircleIcon size={14} />}
              onClick={() => {
                if (approvalId) {
                  addToolApprovalResponse({ id: approvalId, approved: false });
                }
              }}
            >
              Reject
            </Button>
          </div>
        </Surface>
      </div>
    );
  }

  // Rejected / denied
  if (
    part.state === "output-denied" ||
    ("approval" in part &&
      (part.approval as { approved?: boolean })?.approved === false)
  ) {
    return (
      <div className="flex justify-start">
        <Surface className="max-w-[85%] px-4 py-2.5 rounded-xl ring ring-kumo-line">
          <div className="flex items-center gap-2">
            <XCircleIcon size={14} className="text-kumo-danger" />
            <Text size="xs" variant="secondary" bold>
              {toolName}
            </Text>
            <Badge variant="secondary">Rejected</Badge>
          </div>
        </Surface>
      </div>
    );
  }

  // Executing
  if (part.state === "input-available" || part.state === "input-streaming") {
    return (
      <div className="flex justify-start">
        <Surface className="max-w-[85%] px-4 py-2.5 rounded-xl ring ring-kumo-line">
          <div className="flex items-center gap-2">
            <GearIcon size={14} className="text-kumo-inactive animate-spin" />
            <Text size="xs" variant="secondary">
              Running {toolName}...
            </Text>
          </div>
        </Surface>
      </div>
    );
  }

  return null;
}

// ── Main chat ─────────────────────────────────────────────────────────

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
  const [showMcpPanel, setShowMcpPanel] = useState(false);
  const [mcpName, setMcpName] = useState("");
  const [mcpUrl, setMcpUrl] = useState("");
  const [isAddingServer, setIsAddingServer] = useState(false);
  const mcpPanelRef = useRef<HTMLDivElement>(null);
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

  // Close MCP panel when clicking outside
  useEffect(() => {
    if (!showMcpPanel) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        mcpPanelRef.current &&
        !mcpPanelRef.current.contains(e.target as Node)
      ) {
        setShowMcpPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMcpPanel]);

  const handleAddServer = async () => {
    if (!mcpName.trim() || !mcpUrl.trim()) return;
    setIsAddingServer(true);
    try {
      await agent.call("addServer", [
        mcpName.trim(),
        mcpUrl.trim(),
        window.location.origin
      ]);
      setMcpName("");
      setMcpUrl("");
    } catch (e) {
      console.error("Failed to add MCP server:", e);
    } finally {
      setIsAddingServer(false);
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

  const serverEntries = Object.entries(mcpState.servers);
  const mcpToolCount = mcpState.tools.length;

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
    <div className="flex flex-col h-screen bg-transparent">
      {/* Header */}
      <header className="px-3 sm:px-5 lg:px-8 py-3 sm:py-4 w-full sticky top-0 z-10 backdrop-blur-md bg-kumo-base/80 border-b border-kumo-line/50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-y-3">
          <div className="flex items-center gap-2 sm:gap-3 group">
            <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-500 hover:to-purple-500 transition-all duration-500">
              <span className="mr-1 sm:mr-2 inline-block transition-transform duration-300 group-hover:-rotate-12">🚀</span>VentureBot
            </h1>
            <Badge variant="secondary" className="shadow-sm backdrop-blur-sm bg-kumo-base/50 hidden xs:inline-flex">
              <ChatCircleDotsIcon size={12} weight="bold" className="mr-1" />
              AI Chat
            </Badge>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <div className="flex items-center gap-1.5">
              <CircleIcon
                size={8}
                weight="fill"
                className={connected ? "text-kumo-success" : "text-kumo-danger"}
              />
              <Text size="xs" variant="secondary">
                {connected ? "Connected" : "Disconnected"}
              </Text>
            </div>
            <div className="flex items-center gap-1.5">
              <BugIcon size={14} className="text-kumo-inactive" />
              <Switch
                checked={showDebug}
                onCheckedChange={setShowDebug}
                size="sm"
                aria-label="Toggle debug mode"
              />
            </div>
            <ThemeToggle />
            <div className="relative" ref={mcpPanelRef}>
              <Button
                variant="secondary"
                icon={<PlugsConnectedIcon size={16} className="transition-transform group-hover:scale-110 duration-300" />}
                onClick={() => setShowMcpPanel(!showMcpPanel)}
                className="transition-all active:scale-95 duration-200 bg-kumo-base/50 backdrop-blur-sm group"
              >
                MCP
                {mcpToolCount > 0 && (
                  <Badge variant="primary" className="ml-1.5 shadow-sm animate-in zoom-in duration-300">
                    <WrenchIcon size={10} className="mr-0.5" />
                    {mcpToolCount}
                  </Badge>
                )}
              </Button>

              {/* MCP Dropdown Panel */}
              {showMcpPanel && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-96 max-w-full z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <Surface className="rounded-xl ring ring-kumo-line shadow-2xl p-4 space-y-4">
                    {/* Panel Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlugsConnectedIcon
                          size={16}
                          className="text-kumo-accent"
                        />
                        <Text size="sm" bold>
                          MCP Servers
                        </Text>
                        {serverEntries.length > 0 && (
                          <Badge variant="secondary">
                            {serverEntries.length}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        shape="square"
                        aria-label="Close MCP panel"
                        icon={<XIcon size={14} className="transition-transform hover:rotate-90 duration-200" />}
                        onClick={() => setShowMcpPanel(false)}
                        className="hover:bg-kumo-line/50 transition-colors"
                      />
                    </div>

                    {/* Add Server Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddServer();
                      }}
                      className="space-y-2"
                    >
                      <input
                        type="text"
                        value={mcpName}
                        onChange={(e) => setMcpName(e.target.value)}
                        placeholder="Server name"
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-kumo-line bg-kumo-base text-kumo-default placeholder:text-kumo-inactive focus:outline-none focus:ring-1 focus:ring-kumo-accent"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={mcpUrl}
                          onChange={(e) => setMcpUrl(e.target.value)}
                          placeholder="https://mcp.example.com"
                          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-kumo-line bg-kumo-base text-kumo-default placeholder:text-kumo-inactive focus:outline-none focus:ring-1 focus:ring-kumo-accent font-mono"
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          icon={<PlusIcon size={14} />}
                          disabled={
                            isAddingServer || !mcpName.trim() || !mcpUrl.trim()
                          }
                        >
                          {isAddingServer ? "..." : "Add"}
                        </Button>
                      </div>
                    </form>

                    {/* Server List */}
                    {serverEntries.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {serverEntries.map(([id, server]) => (
                          <div
                            key={id}
                            className="flex items-start justify-between p-2.5 rounded-lg border border-kumo-line"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-kumo-default truncate">
                                  {server.name}
                                </span>
                                <Badge
                                  variant={
                                    server.state === "ready"
                                      ? "primary"
                                      : server.state === "failed"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {server.state}
                                </Badge>
                              </div>
                              <span className="text-xs font-mono text-kumo-subtle truncate block mt-0.5">
                                {server.server_url}
                              </span>
                              {server.state === "failed" && server.error && (
                                <span className="text-xs text-red-500 block mt-0.5">
                                  {server.error}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              {server.state === "authenticating" &&
                                server.auth_url && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<SignInIcon size={12} />}
                                    onClick={() =>
                                      window.open(
                                        server.auth_url as string,
                                        "oauth",
                                        "width=600,height=800"
                                      )
                                    }
                                  >
                                    Auth
                                  </Button>
                                )}
                              <Button
                                variant="ghost"
                                size="sm"
                                shape="square"
                                aria-label="Remove server"
                                icon={<TrashIcon size={12} />}
                                onClick={() => handleRemoveServer(id)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tool Summary */}
                    {mcpToolCount > 0 && (
                      <div className="pt-2 border-t border-kumo-line">
                        <div className="flex items-center gap-2">
                          <WrenchIcon size={14} className="text-kumo-subtle" />
                          <span className="text-xs text-kumo-subtle">
                            {mcpToolCount} tool
                            {mcpToolCount !== 1 ? "s" : ""} available from MCP
                            servers
                          </span>
                        </div>
                      </div>
                    )}
                  </Surface>
                </div>
              )}
            </div>
            <Button
              variant="primary"
              icon={<FileTextIcon size={16} className="transition-transform group-hover:scale-110 duration-300" />}
              onClick={handleGeneratePlan}
              disabled={!connected || planLoading}
              className="transition-all hover:-translate-y-0.5 active:scale-95 duration-200 shadow-sm hover:shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 border-0 group"
            >
              {planLoading ? "Generating…" : "Generate my plan"}
            </Button>
            <Button
              variant="secondary"
              icon={<TrashIcon size={16} className="transition-transform group-hover:text-red-500 duration-300" />}
              onClick={clearHistory}
              className="transition-all active:scale-95 duration-200 bg-kumo-base/50 backdrop-blur-sm group hover:border-red-500/30"
            >
              Clear
            </Button>
          </div>
        </div>
      </header>

      {/* Plan modal */}
      {showPlanModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowPlanModal(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowPlanModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Business plan"
        >
          <Surface
            className="max-w-2xl w-full max-h-[85vh] overflow-hidden rounded-xl shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-kumo-line bg-kumo-base/50 backdrop-blur-sm sticky top-0 z-10">
              <Text size="sm" bold className="bg-clip-text text-transparent bg-gradient-to-r from-kumo-brand to-kumo-accent">
                Your business plan
              </Text>
              <Button
                variant="ghost"
                size="sm"
                shape="square"
                aria-label="Close"
                icon={<XIcon size={16} />}
                onClick={() => setShowPlanModal(false)}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {planLoading ? (
                <div className="flex items-center gap-2 text-kumo-subtle">
                  <GearIcon size={18} className="animate-spin" />
                  <span>Generating your plan…</span>
                </div>
              ) : planResult ? (
                <Streamdown
                  className="sd-theme prose prose-sm max-w-none dark:prose-invert"
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
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="max-w-4xl mx-auto px-5 py-8 space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center min-h-[50vh] animate-in fade-in zoom-in duration-500">
              <Empty
                icon={<ChatCircleDotsIcon size={48} className="text-kumo-accent drop-shadow-lg" />}
                title={<span className="text-2xl font-bold tracking-tight">How can I help you validate your next big idea?</span>}
                contents={
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                    {[
                      "I have an app idea I want to validate",
                      "My target audience is small business owners",
                      "Here's how I'd make money: subscription and ads",
                      "The problem I'm solving is scheduling for remote teams"
                    ].map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        size="md"
                        disabled={isStreaming}
                        className="h-auto py-3 px-4 text-left justify-start whitespace-normal sm:whitespace-nowrap hover:-translate-y-1 hover:shadow-md transition-all duration-300 ring-1 ring-kumo-line/50 hover:ring-kumo-accent/50 bg-kumo-base/60 backdrop-blur-sm"
                        onClick={() => {
                          sendMessage({
                            role: "user",
                            parts: [{ type: "text", text: prompt }]
                          });
                        }}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                }
              />
            </div>
          )}

          {messages.map((message: UIMessage, index: number) => {
            const isUser = message.role === "user";
            const isLastAssistant =
              message.role === "assistant" && index === messages.length - 1;

            return (
              <div key={message.id} className="space-y-2">
                {showDebug && (
                  <pre className="text-[11px] text-kumo-subtle bg-kumo-control rounded-lg p-3 overflow-auto max-h-64">
                    {JSON.stringify(message, null, 2)}
                  </pre>
                )}

                {/* Tool parts */}
                {message.parts.filter(isToolUIPart).map((part) => (
                  <ToolPartView
                    key={part.toolCallId}
                    part={part}
                    addToolApprovalResponse={addToolApprovalResponse}
                  />
                ))}

                {/* Reasoning parts */}
                {message.parts
                  .filter(
                    (part) =>
                      part.type === "reasoning" &&
                      (part as { text?: string }).text?.trim()
                  )
                  .map((part, i) => {
                    const reasoning = part as {
                      type: "reasoning";
                      text: string;
                      state?: "streaming" | "done";
                    };
                    const isDone = reasoning.state === "done" || !isStreaming;
                    return (
                      <div key={i} className="flex justify-start">
                        <details className="max-w-[85%] w-full" open={!isDone}>
                          <summary className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm select-none">
                            <BrainIcon size={14} className="text-purple-400" />
                            <span className="font-medium text-kumo-default">
                              Reasoning
                            </span>
                            {isDone ? (
                              <span className="text-xs text-kumo-success">
                                Complete
                              </span>
                            ) : (
                              <span className="text-xs text-kumo-brand">
                                Thinking...
                              </span>
                            )}
                            <CaretDownIcon
                              size={14}
                              className="ml-auto text-kumo-inactive"
                            />
                          </summary>
                          <pre className="mt-2 px-3 py-2 rounded-lg bg-kumo-control text-xs text-kumo-default whitespace-pre-wrap overflow-auto max-h-64">
                            {reasoning.text}
                          </pre>
                        </details>
                      </div>
                    );
                  })}

                {/* Text parts */}
                {message.parts
                  .filter((part) => part.type === "text")
                  .map((part, i) => {
                    const text = (part as { type: "text"; text: string }).text;
                    if (!text) return null;

                    if (isUser) {
                      return (
                        <div key={i} className="flex justify-end animate-in slide-in-from-right-4 fade-in duration-300">
                          <div className="max-w-[85%] px-5 py-3.5 rounded-3xl rounded-br-sm bg-gradient-to-br from-kumo-contrast to-kumo-contrast/90 text-kumo-inverse leading-relaxed shadow-sm ring-1 ring-black/5">
                            {text}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={i} className="flex justify-start animate-in slide-in-from-left-4 fade-in duration-300">
                        <div className="max-w-[90%] rounded-3xl rounded-bl-sm bg-kumo-base/80 backdrop-blur-sm text-kumo-default leading-relaxed shadow-sm ring-1 ring-kumo-line/50 transition-shadow hover:shadow-md">
                          <Streamdown
                            className="sd-theme rounded-3xl rounded-bl-sm p-4 prose sm:prose-base prose-sm dark:prose-invert max-w-none"
                            controls={false}
                            isAnimating={isLastAssistant && isStreaming}
                          >
                            {text}
                          </Streamdown>
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 left-0 right-0 p-4 pb-6 sm:pb-8 bg-gradient-to-t from-kumo-elevated to-transparent pt-10 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="w-full relative"
          >
            <div className="flex items-end gap-3 rounded-2xl border border-kumo-line/60 bg-kumo-base/80 backdrop-blur-xl p-3 sm:p-4 shadow-lg focus-within:ring-2 focus-within:ring-kumo-brand/50 focus-within:border-kumo-brand transition-all duration-300 ease-out group">
              <InputArea
                ref={textareaRef}
                value={input}
                onValueChange={setInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
                placeholder="Send a message..."
                disabled={!connected || isStreaming}
                rows={1}
                className="flex-1 ring-0! focus:ring-0! shadow-none! bg-transparent! outline-none! resize-none max-h-40"
              />
              {isStreaming ? (
                <Button
                  type="button"
                  variant="secondary"
                  shape="square"
                  aria-label="Stop generation"
                  icon={<StopIcon size={18} />}
                  onClick={stop}
                  className="mb-0.5"
                />
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  shape="square"
                  aria-label="Send message"
                  disabled={!input.trim() || !connected}
                  icon={<PaperPlaneRightIcon size={18} />}
                  className="mb-0.5 rounded-xl shadow-md group-focus-within:-translate-y-0.5 group-focus-within:shadow-lg transition-all active:scale-95 duration-200 bg-gradient-to-br from-kumo-brand to-kumo-accent border-0"
                />
              )}
            </div>
          </form>
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
          <div className="flex items-center justify-center h-screen text-kumo-inactive">
            Loading...
          </div>
        }
      >
        <Chat />
      </Suspense>
    </Toasty>
  );
}
