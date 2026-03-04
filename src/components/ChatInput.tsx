import { forwardRef } from "react";
import { Button, InputArea } from "@cloudflare/kumo";
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
      <div className="sticky bottom-0 left-0 right-0 p-4 pb-6 sm:pb-8 bg-gradient-to-t from-[#f4f6fb] via-[#f4f6fb]/90 to-transparent dark:from-[#0f1115] dark:via-[#0f1115]/90 pt-16 pointer-events-none z-10 w-full max-w-4xl mx-auto flex justify-center">
        <div className="pointer-events-auto w-full px-2 sm:px-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSend();
            }}
            className="w-full relative group flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-full bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-white/5 transition-all duration-300 focus-within:shadow-[0_12px_45px_rgb(0,0,0,0.1)] focus-within:border-indigo-500/30"
          >
            {/* Sparkle Icon (Left Action) */}
            <div className="pl-4 pr-2 text-indigo-500">
              <SparkleIcon size={24} weight="duotone" />
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
                el.style.height = `${el.scrollHeight}px`;
              }}
              placeholder="Ask VentureBot or search for anything..."
              disabled={!connected || isStreaming}
              rows={1}
              className="flex-1 ring-0! focus:ring-0! shadow-none! bg-transparent! outline-none! resize-none max-h-40 py-4 px-2 text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-slate-900 dark:text-slate-100 placeholder:font-normal stylish-scrollbar leading-relaxed"
            />

            <div className="flex items-center gap-2 pr-3 pl-2 border-l border-slate-100 dark:border-white/5 py-2 my-2">
              {/* Mention / Command Hint */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-50 dark:bg-white/5 rounded-full mr-2">
                <AtIcon size={12} weight="bold" />
                tag file or doc
              </div>

              {isStreaming ? (
                <Button
                  type="button"
                  variant="ghost"
                  shape="square"
                  aria-label="Stop generation"
                  icon={<StopIcon size={20} weight="fill" />}
                  onClick={onStop}
                  className="rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all h-10 w-10 flex items-center justify-center shrink-0"
                />
              ) : (
                <Button
                  type="submit"
                  variant="ghost"
                  shape="square"
                  aria-label="Send message"
                  disabled={!input.trim() || !connected}
                  icon={<PaperPlaneRightIcon size={20} weight="fill" />}
                  className={`rounded-full transition-all duration-300 h-10 w-10 flex items-center justify-center shrink-0 ${
                    input.trim() && connected
                      ? "bg-slate-900 text-white hover:bg-indigo-600 hover:text-white dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400 shadow-sm"
                      : "bg-slate-100 text-slate-300 dark:bg-white/5 dark:text-slate-600 cursor-not-allowed"
                  }`}
                />
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }
);
ChatInput.displayName = "ChatInput";
