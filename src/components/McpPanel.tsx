import { useState, useRef, useEffect } from "react";
import { Button, Surface } from "@cloudflare/kumo";
import {
  PlugsConnectedIcon,
  WrenchIcon,
  XIcon,
  PlusIcon,
  ShieldCheckIcon
} from "@phosphor-icons/react";
import type { MCPServersState } from "agents";

interface McpPanelProps {
  mcpState: MCPServersState;
  onAddServer: (name: string, url: string) => Promise<void>;
  onRemoveServer: (id: string) => Promise<void>;
}

export function McpPanel({
  mcpState,
  onAddServer,
  onRemoveServer
}: McpPanelProps) {
  const [showMcpPanel, setShowMcpPanel] = useState(false);
  const [mcpName, setMcpName] = useState("");
  const [mcpUrl, setMcpUrl] = useState("");
  const [isAddingServer, setIsAddingServer] = useState(false);
  const mcpPanelRef = useRef<HTMLDivElement>(null);

  const serverEntries = Object.entries(mcpState.servers);
  const mcpToolCount = mcpState.tools.length;

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
      await onAddServer(mcpName.trim(), mcpUrl.trim());
      setMcpName("");
      setMcpUrl("");
    } finally {
      setIsAddingServer(false);
    }
  };

  return (
    <div className="relative" ref={mcpPanelRef}>
      <Button
        variant="ghost"
        shape="square"
        icon={
          <ShieldCheckIcon
            size={18}
            weight={showMcpPanel ? "fill" : "regular"}
            className={
              showMcpPanel
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 dark:text-slate-400"
            }
          />
        }
        onClick={() => setShowMcpPanel(!showMcpPanel)}
        aria-label="Toggle Integrations"
        className={`w-9 h-9 transition-colors ${showMcpPanel ? "bg-indigo-50/50 dark:bg-indigo-500/10" : "hover:bg-slate-50 dark:hover:bg-white/5"}`}
      >
        {mcpToolCount > 0 && (
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1a1d24]" />
        )}
      </Button>

      {/* MCP Dropdown Panel */}
      {showMcpPanel && (
        <div className="absolute right-0 top-[120%] mt-2 w-[calc(100vw-2rem)] sm:w-[420px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <Surface className="rounded-[20px] ring-1 ring-slate-200 dark:ring-white/10 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.1)] p-5 sm:p-6 space-y-5 bg-white dark:bg-[#1a1d24]">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-baseline gap-2.5">
                <span className="text-[17px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                  Integrations
                </span>
                {serverEntries.length > 0 && (
                  <span className="text-sm font-medium text-slate-400 tracking-wide uppercase">
                    CONNECTED ({serverEntries.length})
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                shape="square"
                aria-label="Close MCP panel"
                icon={<XIcon size={16} />}
                onClick={() => setShowMcpPanel(false)}
                className="hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500"
              />
            </div>

            {/* Server List */}
            {serverEntries.length > 0 && (
              <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto stylish-scrollbar py-2">
                {serverEntries.map(([id, server]) => (
                  <div
                    key={id}
                    className="flex items-center justify-center relative group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-[#252830] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center transition-transform group-hover:-translate-y-1 group-hover:shadow-md cursor-pointer">
                      <PlugsConnectedIcon
                        size={24}
                        className={
                          server.state === "ready"
                            ? "text-indigo-500"
                            : "text-rose-500"
                        }
                        weight="duotone"
                      />
                    </div>

                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none drop-shadow-md z-10 font-medium">
                      {server.name}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45"></div>
                    </div>

                    <button
                      onClick={() => onRemoveServer(id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      <XIcon size={10} weight="bold" />
                    </button>
                  </div>
                ))}

                {/* Add Server Button Icon */}
                <div
                  className="w-12 h-12 rounded-full bg-white dark:bg-[#252830] border border-slate-200 dark:border-white/10 border-dashed hover:border-solid hover:border-emerald-500 shadow-sm flex items-center justify-center transition-all cursor-pointer text-slate-400 hover:text-emerald-500 group"
                  title="Add integration"
                  onClick={() => {
                    const form = document.getElementById("add-server-form");
                    if (form) form.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <PlusIcon
                    size={20}
                    weight="bold"
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
              </div>
            )}

            {/* Add Server Form */}
            <form
              id="add-server-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddServer();
              }}
              className="space-y-3 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-[16px] border border-slate-100 dark:border-white/5 transition-all mt-4"
            >
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <PlugsConnectedIcon size={16} />
                Add Custom Integration
              </div>
              <input
                type="text"
                value={mcpName}
                onChange={(e) => setMcpName(e.target.value)}
                placeholder="Integration Name"
                className="w-full px-4 py-2.5 text-[15px] font-medium rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1d24] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mcpUrl}
                  onChange={(e) => setMcpUrl(e.target.value)}
                  placeholder="wss://api..."
                  className="flex-1 px-4 py-2.5 text-[14px] rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1d24] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono transition-all shadow-sm"
                />
                <Button
                  type="submit"
                  variant="primary"
                  icon={<PlusIcon size={18} weight="bold" />}
                  disabled={isAddingServer || !mcpName.trim() || !mcpUrl.trim()}
                  className="shadow-sm bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 border-none rounded-xl px-4 font-medium"
                >
                  {isAddingServer ? "Adding..." : "Connect"}
                </Button>
              </div>
            </form>

            {/* Tool Summary */}
            {mcpToolCount > 0 && (
              <div className="pt-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <WrenchIcon
                    size={14}
                    weight="fill"
                    className="text-slate-400"
                  />
                  Synchronized Tools
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 rounded-full">
                  {mcpToolCount} active
                </span>
              </div>
            )}
          </Surface>
        </div>
      )}
    </div>
  );
}
