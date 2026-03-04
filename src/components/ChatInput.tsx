import { forwardRef } from "react";
import { Button, InputArea } from "@cloudflare/kumo";
import { PaperPlaneRightIcon, StopIcon } from "@phosphor-icons/react";

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
      <div className="sticky bottom-0 left-0 right-0 p-4 pb-6 sm:pb-8 bg-gradient-to-t from-kumo-elevated via-kumo-elevated/90 to-transparent pt-16 pointer-events-none z-10">
        <div className="max-w-3xl mx-auto pointer-events-auto px-2 sm:px-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSend();
            }}
            className="w-full relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-md opacity-50 group-hover:opacity-100 transition duration-500 -z-10"></div>
            <div className="flex items-end gap-3 rounded-[24px] border border-kumo-line/30 bg-kumo-base/80 backdrop-blur-2xl p-2 sm:p-3 shadow-xl focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/30 transition-all duration-300 ease-out">
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
                placeholder="Ask VentureBot anything..."
                disabled={!connected || isStreaming}
                rows={1}
                className="flex-1 ring-0! focus:ring-0! shadow-none! bg-transparent! outline-none! resize-none max-h-40 py-2.5 px-4 text-[15px] placeholder:text-kumo-subtle/80 font-medium stylish-scrollbar"
              />
              {isStreaming ? (
                <Button
                  type="button"
                  variant="secondary"
                  shape="square"
                  aria-label="Stop generation"
                  icon={<StopIcon size={20} weight="fill" />}
                  onClick={onStop}
                  className="mb-1 mr-1 rounded-2xl bg-kumo-elevated/90 shadow-sm border border-kumo-line/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all h-12 w-12"
                />
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  shape="square"
                  aria-label="Send message"
                  disabled={!input.trim() || !connected}
                  icon={<PaperPlaneRightIcon size={20} weight="fill" />}
                  className={`mb-1 mr-1 rounded-2xl shadow-md border-0 transition-all duration-300 h-12 w-12 flex items-center justify-center ${
                    input.trim() && connected
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-purple-500 hover:to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-95 text-white"
                      : "bg-kumo-elevated/50 text-kumo-subtle/50 cursor-not-allowed"
                  }`}
                />
              )}
            </div>
          </form>
          <div className="text-center mt-3.5 text-[11px] text-kumo-subtle font-medium tracking-wide opacity-70">
            AI can be inaccurate. Always verify facts and research.
          </div>
        </div>
      </div>
    );
  }
);
ChatInput.displayName = "ChatInput";
