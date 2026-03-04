import type { UIMessage } from "ai";
import { isToolUIPart } from "ai";
import { Streamdown } from "streamdown";
import { ToolPartView } from "./ToolPartView";
import { BrainIcon, CaretDownIcon } from "@phosphor-icons/react";

interface MessageItemProps {
  message: UIMessage;
  isLastAssistant: boolean;
  isStreaming: boolean;
  showDebug: boolean;
  addToolApprovalResponse: (response: {
    id: string;
    approved: boolean;
  }) => void;
}

export function MessageItem({
  message,
  isLastAssistant,
  isStreaming,
  showDebug,
  addToolApprovalResponse
}: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {showDebug && (
        <pre className="text-[11px] text-kumo-subtle bg-kumo-control rounded-xl p-4 overflow-auto max-h-64 border border-kumo-line shadow-inner font-mono">
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
            <div key={`reason-${i}`} className="flex justify-start">
              <details className="max-w-[85%] w-full group" open={!isDone}>
                <summary className="flex items-center gap-2.5 cursor-pointer px-4 pt-2.5 pb-2.5 rounded-2xl bg-gradient-to-r from-purple-500/5 to-fuchsia-500/5 hover:from-purple-500/10 hover:to-fuchsia-500/10 border border-purple-500/10 text-sm select-none transition-all duration-300 shadow-sm">
                  <div className="p-1.5 rounded-lg bg-white/50 dark:bg-black/20 shadow-sm">
                    <BrainIcon
                      size={16}
                      weight="duotone"
                      className="text-purple-500"
                    />
                  </div>
                  <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400 tracking-wide">
                    Reasoning Process
                  </span>
                  {isDone ? (
                    <span className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider ml-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Complete
                    </span>
                  ) : (
                    <span className="text-[10px] text-purple-500 animate-pulse font-bold uppercase tracking-wider ml-1 bg-purple-500/10 px-2 py-0.5 rounded-full">
                      Thinking...
                    </span>
                  )}
                  <div className="ml-auto p-1 rounded-full bg-white/50 dark:bg-black/20 group-hover:bg-purple-500/10 transition-colors">
                    <CaretDownIcon
                      size={14}
                      className="text-purple-500 group-open:rotate-180 transition-transform duration-300"
                    />
                  </div>
                </summary>
                <div className="mt-2 p-5 rounded-2xl bg-kumo-base/50 backdrop-blur-sm border border-kumo-line/40 text-xs text-kumo-default whitespace-pre-wrap overflow-auto max-h-80 shadow-inner stylish-scrollbar leading-relaxed">
                  {reasoning.text}
                </div>
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
              <div key={`text-${i}`} className="flex justify-end group">
                <div className="max-w-[85%] px-5 py-4 rounded-[2rem] rounded-br-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white leading-relaxed shadow-md ring-1 ring-black/5 hover:shadow-lg transition-all group-hover:-translate-y-0.5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tl from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 text-[15px]">{text}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={`text-${i}`} className="flex justify-start">
              <div className="max-w-[90%] rounded-[2xl] rounded-bl-md bg-kumo-base/80 backdrop-blur-md text-kumo-default leading-relaxed shadow-sm ring-1 ring-kumo-line/40 transition-shadow hover:shadow-md border border-white/20 dark:border-white/5">
                <Streamdown
                  className="sd-theme rounded-[2xl] rounded-bl-md p-5 sm:p-6 prose sm:prose-base prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-500 hover:prose-a:text-indigo-600 prose-img:rounded-xl prose-img:shadow-md prose-pre:bg-kumo-control/80 prose-pre:border prose-pre:border-kumo-line/50 prose-pre:shadow-inner"
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
}
