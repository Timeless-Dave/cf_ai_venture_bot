import { Badge, Button, Switch } from "@cloudflare/kumo";
import {
  ChatCircleDotsIcon,
  CircleIcon,
  BugIcon,
  TrashIcon,
  FileTextIcon
} from "@phosphor-icons/react";
import { ThemeToggle } from "./ThemeToggle";
import { McpPanel } from "./McpPanel";
import type { MCPServersState } from "agents";

interface HeaderProps {
  connected: boolean;
  showDebug: boolean;
  setShowDebug: (val: boolean) => void;
  mcpState: MCPServersState;
  onAddServer: (name: string, url: string) => Promise<void>;
  onRemoveServer: (id: string) => Promise<void>;
  onClearHistory: () => void;
  onGeneratePlan: () => void;
  planLoading: boolean;
}

export function Header({
  connected,
  showDebug,
  setShowDebug,
  mcpState,
  onAddServer,
  onRemoveServer,
  onClearHistory,
  onGeneratePlan,
  planLoading
}: HeaderProps) {
  return (
    <header className="px-5 py-4 w-full sticky top-0 z-20 backdrop-blur-xl bg-kumo-base/70 border-b border-kumo-line/40 transition-colors duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 transition-all duration-700 cursor-default tracking-tight">
              <span className="mr-2 inline-block transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 logo-emoji">
                🚀
              </span>
              VentureBot
            </h1>
            <div className="absolute -inset-1 blur-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full -z-10" />
          </div>
          <Badge
            variant="secondary"
            className="shadow-sm backdrop-blur-md bg-kumo-elevated/50 border-kumo-line/50 hidden sm:flex"
          >
            <ChatCircleDotsIcon
              size={12}
              weight="bold"
              className="mr-1 text-kumo-brand"
            />
            AI Chat
          </Badge>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-kumo-elevated/70 backdrop-blur-md border border-kumo-line/50 shadow-sm">
            <CircleIcon
              size={8}
              weight="fill"
              className={
                connected
                  ? "text-green-500 animate-[pulse_2s_ease-in-out_infinite]"
                  : "text-red-500"
              }
            />
            <span className="text-xs text-kumo-subtle font-semibold tracking-wide uppercase text-[10px]">
              {connected ? "Online" : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-kumo-elevated/50 px-2 py-1 rounded-full border border-kumo-line/30 hidden sm:flex">
            <BugIcon size={14} className="text-kumo-subtle ml-1" />
            <Switch
              checked={showDebug}
              onCheckedChange={setShowDebug}
              size="sm"
              aria-label="Toggle debug mode"
              className="scale-90"
            />
          </div>

          <div className="h-6 w-px bg-kumo-line/50 mx-1 hidden sm:block" />

          <ThemeToggle />

          <McpPanel
            mcpState={mcpState}
            onAddServer={onAddServer}
            onRemoveServer={onRemoveServer}
          />

          <Button
            variant="primary"
            icon={<FileTextIcon size={16} weight="duotone" />}
            onClick={onGeneratePlan}
            disabled={!connected || planLoading}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-violet-600 hover:to-indigo-600 border-none shadow-md hover:shadow-indigo-500/25 dark:hover:shadow-indigo-900/40 transition-all font-medium"
          >
            {planLoading ? "Generating…" : "Plan"}
          </Button>

          <Button
            variant="secondary"
            icon={<TrashIcon size={16} />}
            onClick={onClearHistory}
            className="bg-kumo-elevated/70 hover:bg-red-500/10 hover:text-red-500 border border-kumo-line/50 hover:border-red-500/30 transition-all shadow-sm group"
            aria-label="Clear chat"
          >
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
