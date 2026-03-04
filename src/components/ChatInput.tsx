import { forwardRef } from "react";
import { InputArea } from "@cloudflare/kumo";
import {
  PaperPlaneRightIcon,
  StopIcon,
  SparkleIcon,
  AtIcon
} from "@phosphor-icons/react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isStreaming: boolean;
  connected: boolean;
  onSend: () => void;
  onStop: () => void;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ input, setInput, isStreaming, connected, onSend, onStop }, ref) => {
    return (
      /* Gradient fade from white/chat-bg to transparent upward */
      <div className="w-full px-4 pb-6 sm:pb-8 pt-12 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#15171c] dark:via-[#15171c]/95 pointer-events-none flex justify-center">
        <div className="pointer-events-auto w-full max-w-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSend();
            }}
            className="w-full relative flex items-center gap-0 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.3)] rounded-2xl bg-white dark:bg-[#1f2128] border border-slate-200/80 dark:border-white/[0.06] transition-all duration-300 focus-within:shadow-[0_12px_50px_-8px_rgba(99,102,241,0.15)] dark:focus-within:shadow-[0_12px_50px_-8px_rgba(99,102,241,0.12)] focus-within:border-indigo-300/60 dark:focus-within:border-indigo-500/20 overflow-hidden"
          >
            {/* Left sparkle icon */}
            <div className="pl-4 pr-1 py-4 text-indigo-400 dark:text-indigo-500 shrink-0 self-end pb-[18px]">
              <SparkleIcon size={20} weight="duotone" />
            </div>

            <InputArea
              ref={ref}
              value={input}
              onValueChange={setInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                const maxH = 200;
                el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
              }}
              placeholder="Ask VentureBot anything… Use @ to tag a file"
              disabled={!connected || isStreaming}
              rows={1}
              className="flex-1 min-w-0 bg-transparent! ring-0! shadow-none! outline-none! resize-none max-h-[200px] py-4 px-2 text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-500 font-normal text-slate-900 dark:text-slate-100 stylish-scrollbar leading-relaxed border-0!"
            />

            {/* Right action area */}
            <div className="flex items-center gap-2 px-3 py-3 shrink-0 self-end">
              {/* Hint badge */}
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5">
                <AtIcon size={11} weight="bold" />
                <span>tag</span>
              </div>

              {/* Send / Stop button */}
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  aria-label="Stop generation"
                  className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-all duration-200 shrink-0 border border-rose-100 dark:border-rose-500/20"
                >
                  <StopIcon size={18} weight="fill" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || !connected}
                  aria-label="Send message"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${
                    input.trim() && connected
                      ? "bg-slate-900 dark:bg-indigo-500 text-white hover:bg-indigo-600 dark:hover:bg-indigo-400 shadow-sm cursor-pointer"
                      : "bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <PaperPlaneRightIcon size={18} weight="fill" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }
);
ChatInput.displayName = "ChatInput";
