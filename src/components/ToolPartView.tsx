import { isToolUIPart, getToolName } from "ai";
import type { UIMessage } from "ai";
import { Badge, Button } from "@cloudflare/kumo";
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
        <div className="max-w-[85%] px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1d24] shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500">
              <GearIcon size={14} weight="bold" />
            </div>
            <span className="text-sm text-slate-900 dark:text-slate-100 font-semibold tracking-tight">
              {toolName}
            </span>
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-none px-2 py-0"
            >
              Done
            </Badge>
          </div>
          <div className="font-mono pt-1 text-slate-500 dark:text-slate-400">
            <span className="text-[13px] line-clamp-3 hover:line-clamp-none transition-all block">
              {JSON.stringify(part.output, null, 2)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Needs approval
  if ("approval" in part && part.state === "approval-requested") {
    const approvalId = (part.approval as { id?: string })?.id;
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] px-5 py-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <GearIcon size={18} className="text-amber-500" weight="duotone" />
            <span className="text-[15px] font-bold text-amber-700 dark:text-amber-500 tracking-tight">
              Action Required: {toolName}
            </span>
          </div>
          <div className="font-mono mb-4 p-3 bg-white dark:bg-[#1a1d24] border border-amber-100 dark:border-amber-500/10 rounded-lg shadow-sm">
            <span className="text-[13px] text-slate-600 dark:text-slate-300 line-clamp-3 hover:line-clamp-none transition-all block">
              {JSON.stringify(part.input, null, 2)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<CheckCircleIcon size={16} weight="bold" />}
              onClick={() => {
                if (approvalId) {
                  addToolApprovalResponse({ id: approvalId, approved: true });
                }
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-4 rounded-lg font-medium shadow-sm"
            >
              Approve
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<XCircleIcon size={16} weight="bold" />}
              onClick={() => {
                if (approvalId) {
                  addToolApprovalResponse({ id: approvalId, approved: false });
                }
              }}
              className="bg-white hover:bg-rose-50 text-rose-500 border border-rose-200 dark:bg-[#1a1d24] dark:border-rose-500/20 dark:hover:bg-rose-500/10 px-4 rounded-lg font-medium"
            >
              Reject
            </Button>
          </div>
        </div>
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
        <div className="max-w-[85%] px-5 py-3 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5">
          <div className="flex items-center gap-2">
            <XCircleIcon size={16} className="text-rose-500" weight="fill" />
            <span className="text-[14px] font-semibold text-rose-700 dark:text-rose-400">
              {toolName}
            </span>
            <Badge
              variant="secondary"
              className="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 border-none ml-2"
            >
              Rejected
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  // Executing
  if (part.state === "input-available" || part.state === "input-streaming") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] px-5 py-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5 transition-all shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500 shadow-inner">
              <GearIcon size={14} className="animate-spin" weight="bold" />
            </div>
            <span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-400 tracking-tight">
              Executing {toolName}...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
