export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  liveUrl: string;
  internal?: boolean;
  repoUrl?: string;
  accentColor: string;
  year: number;
  suggestedQuestions: string[];
  image?: string;
}

export const projects: Project[] = [
  {
    id: "content-moderation",
    name: "Content Moderation",
    tagline: "Kafka-orchestrated moderation for text, images, audio and video.",
    description:
      "An event-driven pipeline that moderates every post by fanning it out over Kafka to specialised ML services — a safety LLM for text, vision classifiers for images, Whisper plus sound-event detection for audio, and keyframe analysis for video — then folds the results into one fail-safe recommendation. Stateless workers, retries with dead-letter recovery, and a worst-signal-wins verdict.",
    stack: [
      "Kafka",
      "Python",
      "FastAPI",
      "Llama Guard 3",
      "Whisper",
      "PyTorch",
      "ffmpeg",
      "Docker",
    ],
    liveUrl: "#",
    internal: true,
    accentColor: "#10b981",
    year: 2026,
    suggestedQuestions: [
      "Why does the worst signal win?",
      "Why is the orchestrator stateless?",
      "Why not block a video on a single frame?",
      "What happens when a service is down?",
    ],
  },
  {
    id: "trendpoll",
    name: "TrendPoll",
    tagline: "AI-curated US news with built-in civic voting.",
    description:
      "Full-stack platform that ingests US-only news, ranks and summarizes stories with a locally-served Mistral 7B via Ollama, and lets readers register opinions on a per-story civic poll. Streams updates to the client over SSE.",
    stack: [
      "React",
      "Vite",
      "Express",
      "Node.js",
      "PostgreSQL",
      "Prisma",
      "Ollama",
      "Mistral 7B",
      "SSE",
    ],
    liveUrl: "https://trendpoll.v0.primesay.com",
    accentColor: "#2563eb",
    year: 2026,
    suggestedQuestions: [
      "Why Mistral 7B and not GPT-4?",
      "How does the anonymous voting work?",
      "What was the hardest bug you fixed?",
      "What are TrendPoll's biggest limitations?",
    ],
    image: "/projects/trendpoll.png",
  },
  {
    id: "primesay-ai",
    name: "Primesay AI",
    tagline: "Self-hosted voice studio bundling four TTS engines and Whisper.",
    description:
      "An internal voice studio that puts four text-to-speech engines (Edge TTS, XTTS, Chatterbox, Kokoro), Whisper speech-to-text, and voice cloning behind a single UI. Lazy-loaded GPU models with explicit VRAM management between engines.",
    stack: ["FastAPI", "Python", "React", "Vite", "PyTorch", "Whisper", "Docker"],
    liveUrl: "#",
    internal: true,
    accentColor: "#f97316",
    year: 2026,
    suggestedQuestions: [
      "Why bundle four TTS engines?",
      "How does the Chatterbox GPU swap work?",
      "Why function-based engines instead of classes?",
      "What are the known limitations?",
    ],
    image: "/projects/primesay-ai.png",
  },
  {
    id: "primesay-translation",
    name: "Primesay Translation",
    tagline: "Self-hosted translation API on Hy-MT2, served with vLLM.",
    description:
      "An internal Primesay translation service handling 24 languages with GPU-accelerated inference. Built around Tencent's Hy-MT2-1.8B (Apache-2.0) and served with vLLM's continuous batching: 11.6× the throughput under 16 concurrent users with no quality regression (COMET 87.88 vs 87.87 on FLORES-200). Preserves emojis, @mentions, hashtags, and URLs, and a benchmark-found fix stops long texts from being silently truncated.",
    stack: [
      "FastAPI",
      "Python",
      "Hy-MT2",
      "vLLM",
      "FastText",
      "PyTorch",
      "CUDA",
      "Docker",
    ],
    liveUrl: "#",
    internal: true,
    accentColor: "#a855f7",
    year: 2026,
    image: "/projects/primesay-translation.png",
    suggestedQuestions: [
      "Why move from M2M-100 to Hy-MT2 and vLLM?",
      "What was the silent truncation bug?",
      "How do emojis and @mentions survive translation?",
      "What are the known limitations?",
    ],
  },
];
