import { useState, useRef, useEffect } from "react";
import { Badge, Button, Surface } from "@cloudflare/kumo";
import {
  PlugsConnectedIcon,
  WrenchIcon,
  XIcon,
  PlusIcon,
  SignInIcon,
  TrashIcon
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
        variant="secondary"
        icon={
          <PlugsConnectedIcon
            size={16}
            weight={showMcpPanel ? "fill" : "regular"}
            className={showMcpPanel ? "text-indigo-500" : ""}
          />
        }
        onClick={() => setShowMcpPanel(!showMcpPanel)}
        className={`${showMcpPanel ? "bg-indigo-500/10 border-indigo-500/30" : "bg-kumo-elevated/70 border-kumo-line/50"} shadow-sm transition-all`}
      >
        <span className="hidden sm:inline">MCP</span>
        {mcpToolCount > 0 && (
          <Badge
            variant="primary"
            className="ml-1 sm:ml-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 border-none shadow-sm px-1.5 py-0"
          >
            <WrenchIcon size={10} className="sm:mr-0.5" weight="fill" />
            <span className="hidden sm:inline">{mcpToolCount}</span>
          </Badge>
        )}
      </Button>

      {/* MCP Dropdown Panel */}
      {showMcpPanel && (
        <div className="absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] sm:w-96 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <Surface className="rounded-2xl ring-1 ring-kumo-line/40 shadow-2xl p-4 sm:p-5 space-y-4 bg-kumo-elevated/95 backdrop-blur-2xl border-t border-white/10">
            {/* Panel Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <PlugsConnectedIcon size={18} weight="duotone" />
                </div>
                <span className="text-sm font-bold text-[15px] text-kumo-default">
                  MCP Servers
                </span>
                {serverEntries.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="shadow-sm bg-kumo-control border-none"
                  >
                    {serverEntries.length}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                shape="square"
                aria-label="Close MCP panel"
                icon={<XIcon size={16} />}
                onClick={() => setShowMcpPanel(false)}
                className="hover:bg-kumo-line/30 rounded-full"
              />
            </div>

            {/* Add Server Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddServer();
              }}
              className="space-y-3 bg-kumo-base/50 p-3 sm:p-4 rounded-xl border border-kumo-line/30 shadow-inner"
            >
              <input
                type="text"
                value={mcpName}
                onChange={(e) => setMcpName(e.target.value)}
                placeholder="Server name (e.g., Search API)"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-kumo-line/60 bg-kumo-base text-kumo-default placeholder:text-kumo-subtle focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all shadow-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mcpUrl}
                  onChange={(e) => setMcpUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-kumo-line/60 bg-kumo-base text-kumo-default placeholder:text-kumo-subtle focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 font-mono transition-all shadow-sm"
                />
                <Button
                  type="submit"
                  variant="primary"
                  icon={<PlusIcon size={16} weight="bold" />}
                  disabled={isAddingServer || !mcpName.trim() || !mcpUrl.trim()}
                  className="shadow-sm bg-indigo-600 hover:bg-indigo-700 border-none"
                >
                  {isAddingServer ? "..." : "Add"}
                </Button>
              </div>
            </form>

            {/* Server List */}
            {serverEntries.length > 0 && (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 stylish-scrollbar">
                {serverEntries.map(([id, server]) => (
                  <div
                    key={id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-kumo-line/40 bg-kumo-base/60 hover:bg-kumo-base transition-colors shadow-sm group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-kumo-default truncate tracking-tight">
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
                          className={
                            server.state === "ready"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "text-[10px] uppercase"
                          }
                        >
                          {server.state}
                        </Badge>
                      </div>
                      <span className="text-[11px] font-mono text-kumo-subtle/80 truncate block">
                        {server.server_url}
                      </span>
                      {server.state === "failed" && server.error && (
                        <span className="text-[11px] text-red-500 block mt-1.5 bg-red-500/10 p-2 rounded-md border border-red-500/20">
                          {server.error}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 sm:opacity-70 sm:group-hover:opacity-100 transition-opacity justify-end">
                      {server.state === "authenticating" && server.auth_url && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<SignInIcon size={14} />}
                          onClick={() =>
                            window.open(
                              server.auth_url as string,
                              "oauth",
                              "width=600,height=800"
                            )
                          }
                          className="bg-purple-600 hover:bg-purple-700 border-none"
                        >
                          Auth
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        shape="square"
                        aria-label="Remove server"
                        icon={<TrashIcon size={16} />}
                        className="text-kumo-subtle hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-lg"
                        onClick={() => onRemoveServer(id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tool Summary */}
            {mcpToolCount > 0 && (
              <div className="pt-4 border-t border-kumo-line/40 mt-2">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
                  <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500">
                    <WrenchIcon size={14} weight="fill" />
                  </div>
                  <span className="text-xs text-kumo-default font-medium">
                    <span className="text-indigo-500 dark:text-indigo-400 font-bold">
                      {mcpToolCount}
                    </span>{" "}
                    tool{mcpToolCount !== 1 ? "s" : ""} available from connected
                    servers
                  </span>
                </div>
              </div>
            )}
          </Surface>
        </div>
      )}
    </div>
  );
}
