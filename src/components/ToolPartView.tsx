import { isToolUIPart, getToolName } from "ai";
import type { UIMessage } from "ai";
import { Badge, Button, Surface } from "@cloudflare/kumo";
import { GearIcon, CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";

export function ToolPartView({
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
        <Surface className="max-w-[85%] px-4 py-2.5 rounded-xl ring-1 ring-kumo-line/50 bg-kumo-base/80 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <GearIcon size={14} className="text-kumo-inactive" />
            <span className="text-xs text-kumo-subtle font-bold">
              {toolName}
            </span>
            <Badge variant="secondary" className="bg-kumo-line/30 border-none">
              Done
            </Badge>
          </div>
          <div className="font-mono pt-1">
            <span className="text-xs text-kumo-subtle line-clamp-3 hover:line-clamp-none transition-all block font-mono">
              {JSON.stringify(part.output, null, 2)}
            </span>
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
        <Surface className="max-w-[85%] px-4 py-3 rounded-xl ring-2 ring-orange-400/80 dark:ring-orange-500/60 bg-kumo-base/90 backdrop-blur-md shadow-lg animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <GearIcon size={14} className="text-orange-500" />
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
              Approval needed: {toolName}
            </span>
          </div>
          <div className="font-mono mb-3 p-2 bg-kumo-control/50 rounded-lg">
            <span className="text-xs text-kumo-default line-clamp-3 hover:line-clamp-none transition-all block">
              {JSON.stringify(part.input, null, 2)}
            </span>
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
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-500 border-none shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-white"
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
              className="hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 hover:scale-105 active:scale-95 transition-all"
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
        <Surface className="max-w-[85%] px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <XCircleIcon size={14} className="text-red-500" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400">
              {toolName}
            </span>
            <Badge
              variant="secondary"
              className="bg-red-500/10 text-red-600 border-none"
            >
              Rejected
            </Badge>
          </div>
        </Surface>
      </div>
    );
  }

  // Executing
  if (part.state === "input-available" || part.state === "input-streaming") {
    return (
      <div className="flex justify-start">
        <Surface className="max-w-[85%] px-4 py-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent w-[200%] animate-[shimmer_2s_infinite]" />
          <div className="flex items-center gap-2 relative z-10">
            <GearIcon size={14} className="text-indigo-500 animate-spin" />
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              Running {toolName}...
            </span>
          </div>
        </Surface>
      </div>
    );
  }

  return null;
}
