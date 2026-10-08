"use client";

import type { UIMessage } from "ai";
import { useEffect, useState } from "react";

const KEY_PREFIX = "chat:";

export function useChatStorage(projectId: string) {
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setInitialMessages([]);
    setHydrated(false);
    if (!projectId) {
      setHydrated(true);
      return;
    }
    try {
      const raw = sessionStorage.getItem(`${KEY_PREFIX}${projectId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setInitialMessages(parsed as UIMessage[]);
        }
      }
    } catch {
      // ignore parse errors, start fresh
    }
    setHydrated(true);
  }, [projectId]);

  const persist = (messages: UIMessage[]) => {
    if (!projectId) return;
    try {
      sessionStorage.setItem(
        `${KEY_PREFIX}${projectId}`,
        JSON.stringify(messages)
      );
    } catch {
      // sessionStorage full or disabled — silently degrade
    }
  };

  const clear = () => {
    if (!projectId) return;
    try {
      sessionStorage.removeItem(`${KEY_PREFIX}${projectId}`);
    } catch {
      // ignore
    }
  };

  return { initialMessages, hydrated, persist, clear };
}
