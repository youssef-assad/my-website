"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { RotateCcw, Send } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Project } from "@/lib/projects";

import { MessageBubble } from "./message-bubble";
import { SuggestedQuestions } from "./suggested-questions";
import { useChatStorage } from "./use-chat-storage";

interface Props {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

export function ChatPanel({ project, open, onClose }: Props) {
  const projectId = project?.id ?? "";
  const { initialMessages, hydrated, persist, clear } =
    useChatStorage(projectId);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/chat/${projectId}`,
      }),
    [projectId]
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    id: projectId,
    transport,
    onError: (err) => {
      const m = err.message.toLowerCase();
      if (m.includes("rate limit") || m.includes("429")) {
        setError(
          "Slow down a moment — you've hit the rate limit. Try again in a bit."
        );
      } else {
        setError("Something went wrong. Try again, or refresh if it persists.");
      }
    },
  });

  useEffect(() => {
    if (hydrated && initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, projectId]);

  useEffect(() => {
    if (hydrated && messages.length > 0) {
      persist(messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, hydrated]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const isStreaming = status === "streaming" || status === "submitted";

  const handleSend = (text: string) => {
    if (!text.trim() || isStreaming) return;
    setError(null);
    sendMessage({ text });
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  };

  const handleReset = () => {
    setMessages([]);
    clear();
    setError(null);
  };

  if (!project) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-white/10 bg-background p-0 sm:max-w-[480px]"
      >
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: project.accentColor }}
            />
            <SheetTitle className="text-base font-medium">
              Talk to {project.name}
            </SheetTitle>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 gap-1.5 text-xs text-foreground/60 hover:text-foreground"
              aria-label="Reset conversation"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col gap-6">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/40">
                  About this agent
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  This is an AI agent built by Youssef to discuss{" "}
                  {project.name}. It only knows what&apos;s in the project
                  briefing — ask it about decisions, tradeoffs, or how things
                  work. It will tell you when something isn&apos;t in its
                  briefing.
                </p>
              </div>
              <SuggestedQuestions
                questions={project.suggestedQuestions}
                onSelect={handleSend}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  isStreaming={
                    isStreaming &&
                    i === messages.length - 1 &&
                    m.role === "assistant"
                  }
                />
              ))}
              {status === "submitted" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
                    <span className="flex gap-1">
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="border-t border-red-500/20 bg-red-500/5 px-5 py-3">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${project.name}...`}
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:border-white/30 focus:outline-none disabled:opacity-50"
              style={{ maxHeight: 160 }}
            />
            <Button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isStreaming}
              size="icon"
              className="h-10 w-10 shrink-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-wider text-foreground/30">
            Press Enter to send · Shift+Enter for newline
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
