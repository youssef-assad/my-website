import { createGroq } from "@ai-sdk/groq";
import {
  convertToModelMessages,
  streamText,
  type ModelMessage,
  type UIMessage,
} from "ai";
import type { NextRequest } from "next/server";

import { loadKnowledgeBase } from "@/lib/knowledge-base";
import { checkDailyBudget, ipLimiter } from "@/lib/rate-limit";
import { buildSystemPrompt } from "@/lib/system-prompt";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "openai/gpt-oss-120b";
const MAX_INPUT_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 4000;

interface V6MessagePart {
  type: string;
  text?: string;
}

interface IncomingMessage {
  id?: string;
  role: string;
  content?: string;
  parts?: V6MessagePart[];
}

interface ChatBody {
  messages: IncomingMessage[];
}

function extractText(msg: IncomingMessage): string | null {
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter(
        (p): p is V6MessagePart & { text: string } =>
          p.type === "text" && typeof p.text === "string"
      )
      .map((p) => p.text)
      .join("");
  }
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const candidate = body as Partial<ChatBody> | null;
  if (
    !candidate ||
    !Array.isArray(candidate.messages) ||
    candidate.messages.length === 0
  ) {
    return Response.json(
      { error: "messages array required" },
      { status: 400 }
    );
  }

  for (const msg of candidate.messages) {
    if (!msg || typeof msg !== "object") {
      return Response.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }
    if (msg.role !== "user" && msg.role !== "assistant") {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }
    const text = extractText(msg);
    if (text === null) {
      return Response.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }
    if (text.length > MAX_MESSAGE_CHARS) {
      return Response.json({ error: "Message too long" }, { status: 400 });
    }
  }

  const knowledgeBase = await loadKnowledgeBase(projectId);
  if (!knowledgeBase) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const ipResult = await ipLimiter.limit(ip);
  if (!ipResult.success) {
    return Response.json(
      { error: "Rate limit exceeded. Try again in an hour." },
      {
        status: 429,
        headers: { "X-RateLimit-Reset": String(ipResult.reset) },
      }
    );
  }

  const budget = await checkDailyBudget();
  if (!budget.allowed) {
    return Response.json(
      { error: "Daily message budget exhausted. Please try again tomorrow." },
      { status: 429 }
    );
  }

  const trimmed = candidate.messages.slice(-MAX_INPUT_MESSAGES);

  const isV6 = trimmed.some((m) => Array.isArray(m.parts));

  let modelMessages: ModelMessage[];
  if (isV6) {
    modelMessages = await convertToModelMessages(
      trimmed as unknown as UIMessage[]
    );
  } else {
    modelMessages = trimmed.map((m) => ({
      role: m.role as "user" | "assistant",
      content: typeof m.content === "string" ? m.content : "",
    }));
  }

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

  const result = streamText({
    model: groq(MODEL),
    system: buildSystemPrompt(knowledgeBase),
    messages: modelMessages,
    temperature: 0.4,
    maxOutputTokens: 800,
  });

  return result.toUIMessageStreamResponse();
}
