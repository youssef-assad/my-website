"use client";

interface Props {
  questions: string[];
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ questions, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-wider text-foreground/40">
        Try asking
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSelect(q)}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-foreground/70 transition hover:border-white/30 hover:bg-white/10 hover:text-foreground"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
