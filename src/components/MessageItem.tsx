import type { UIMessage } from "ai";
import { isToolUIPart } from "ai";
import { Streamdown } from "streamdown";
import { ToolPartView } from "./ToolPartView";
import { SparkleIcon, CaretDownIcon } from "@phosphor-icons/react";

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
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {showDebug && (
        <pre className="text-[11px] text-slate-500 bg-slate-50 dark:bg-[#1a1d24] rounded-xl p-4 overflow-auto max-h-64 border border-slate-200 dark:border-white/5 font-mono">
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
              <details
                className="max-w-[95%] sm:max-w-2xl w-full group"
                open={!isDone}
              >
                <summary className="flex items-center gap-2 cursor-pointer text-[13px] select-none transition-all duration-300 w-fit group-open:mb-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <SparkleIcon
                    size={14}
                    weight="fill"
                    className={!isDone ? "animate-pulse text-indigo-500" : ""}
                  />
                  <span className="font-medium tracking-wide">
                    {isDone ? `Thought process` : `Thinking for 5 sec...`}
                  </span>
                  <div className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CaretDownIcon
                      size={12}
                      className="group-open:rotate-180 transition-transform duration-200"
                    />
                  </div>
                </summary>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[13px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap overflow-auto max-h-80 stylish-scrollbar leading-relaxed">
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
                {/* Stratify user message style: bold, clean background */}
                <div className="max-w-[85%] px-5 py-3.5 rounded-2xl rounded-tr-sm bg-[#e2e8f0] dark:bg-[#2a303c] text-slate-800 dark:text-slate-200 leading-relaxed shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-[15px] font-medium tracking-tight border border-slate-200 dark:border-white/5">
                  <span className="relative z-10">{text}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={`text-${i}`} className="flex justify-start">
              <div className="max-w-full lg:max-w-[90%] text-slate-800 dark:text-slate-200 leading-[1.7] text-[15px] sm:text-[16px] animate-in fade-in duration-300">
                <Streamdown
                  className="sd-theme prose sm:prose-base prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-md prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-slate-800 prose-ul:marker:text-slate-400 prose-strong:text-slate-900 dark:prose-strong:text-white"
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
