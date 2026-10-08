"use client";

import type { UIMessage } from "ai";

import { cn } from "@/lib/utils";

interface Props {
  message: UIMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  const text =
    message.parts
      ?.filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join("") ?? "";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-foreground text-background"
            : "border border-white/10 bg-white/5 text-foreground"
        )}
      >
        <span className="whitespace-pre-wrap">{text}</span>
        {isStreaming && !isUser && (
          <span className="ml-0.5 inline-block h-3.5 w-[3px] translate-y-0.5 animate-pulse bg-foreground" />
        )}
      </div>
    </div>
  );
}
