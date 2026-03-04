import { Switch } from "@cloudflare/kumo";
import { CircleIcon, BugIcon } from "@phosphor-icons/react";
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
}

export function Header({
  connected,
  showDebug,
  setShowDebug,
  mcpState,
  onAddServer,
  onRemoveServer
}: HeaderProps) {
  return (
    <header className="px-5 sm:px-8 py-4 sm:py-5 w-full sticky top-0 z-20 bg-[#f4f6fb]/90 dark:bg-[#0f1115]/90 backdrop-blur-md transition-colors duration-300">
      <div className="flex items-center justify-between gap-4 h-12">
        {/* Left side empty for Sidebar spacing, or for Search bar later */}
        <div className="flex-1 md:pl-8 flex items-center">
          {/* Placeholder for top bar content later if needed */}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1a1d24] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-white/5 transition-all">
            <CircleIcon
              size={10}
              weight="fill"
              className={
                connected
                  ? "text-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"
                  : "text-rose-500"
              }
            />
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium tracking-wide first-letter:uppercase">
              {connected ? "Online" : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-[#1a1d24] px-2.5 py-1.5 rounded-[10px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-white/5 hidden sm:flex transition-all">
            <BugIcon
              size={16}
              className="text-slate-400 dark:text-slate-500 ml-1"
            />
            <Switch
              checked={showDebug}
              onCheckedChange={setShowDebug}
              size="sm"
              aria-label="Toggle debug mode"
              className="scale-90"
            />
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />

          <div className="bg-white dark:bg-[#1a1d24] rounded-[10px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-white/5 flex items-center p-0.5">
            <ThemeToggle />
          </div>

          <div className="bg-white dark:bg-[#1a1d24] rounded-[10px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-white/5 flex items-center p-0.5">
            <McpPanel
              mcpState={mcpState}
              onAddServer={onAddServer}
              onRemoveServer={onRemoveServer}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
