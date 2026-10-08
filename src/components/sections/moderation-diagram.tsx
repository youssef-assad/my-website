import {
  ArrowDown,
  AudioLines,
  Image as ImageIcon,
  Type,
  Video,
} from "lucide-react";

const INPUTS = [
  { label: "Text", icon: Type },
  { label: "Image", icon: ImageIcon },
  { label: "Audio", icon: AudioLines },
  { label: "Video", icon: Video },
];

const VERDICTS = [
  { label: "safe", color: "#34d399" },
  { label: "flagged", color: "#fbbf24" },
  { label: "blocked", color: "#f87171" },
];

export function ModerationDiagram({ accent }: { accent: string }) {
  return (
    <div
      role="img"
      aria-label="Posts flow through Kafka to a worker that calls text, image, audio and video moderation services, then returns a safe, flagged or blocked verdict."
      className="relative flex aspect-[4/5] w-full max-w-md flex-col justify-between border bg-white/[0.02] p-6 sm:p-8"
      style={{ borderColor: `${accent}33` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 blur-3xl opacity-40"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${accent}22 0%, transparent 70%)`,
        }}
      />

      <div className="relative grid grid-cols-4 gap-2">
        {INPUTS.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 border border-white/10 bg-white/[0.03] py-3"
          >
            <Icon className="h-4 w-4" style={{ color: accent }} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/60">
              {label}
            </span>
          </div>
        ))}
      </div>

      <Connector accent={accent} />

      <div
        className="relative border px-4 py-3 text-center"
        style={{ borderColor: `${accent}55`, backgroundColor: `${accent}12` }}
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          Event stream
        </p>
        <p className="mt-1 font-display text-2xl">Kafka</p>
      </div>

      <Connector accent={accent} />

      <div className="relative border border-white/10 bg-white/[0.03] px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
          Stateless worker
        </p>
        <p className="mt-1 text-sm text-foreground/75">
          parallel checks · worst signal wins
        </p>
      </div>

      <Connector accent={accent} />

      <div className="relative flex items-center justify-center gap-2">
        {VERDICTS.map(({ label, color }) => (
          <span
            key={label}
            className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.15em]"
            style={{ borderColor: `${color}66`, color }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Connector({ accent }: { accent: string }) {
  return (
    <div aria-hidden className="relative flex justify-center">
      <ArrowDown className="h-4 w-4" style={{ color: `${accent}aa` }} />
    </div>
  );
}
