"use client";

import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

const ROLES = [
  "Web Developer",
  "AI Integrator",
  "Systems Thinker",
  "Problem Solver",
] as const;

const HOLD_MS = 3000;
const TRANSITION_S = 0.6;

type Props = { className?: string };

export function RoleCycler({ className }: Props) {
  const slotARef = useRef<HTMLSpanElement | null>(null);
  const slotBRef = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const a = slotARef.current;
    const b = slotBRef.current;
    if (!a || !b) return;

    let activeIsA = true;
    let index = 0;

    a.textContent = ROLES[0]!;
    b.textContent = "";
    gsap.set(a, { yPercent: 0, opacity: 1, filter: "blur(0px)" });
    gsap.set(b, { yPercent: 100, opacity: 0, filter: "blur(4px)" });

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const cycle = () => {
      const outgoing = activeIsA ? a : b;
      const incoming = activeIsA ? b : a;
      index = (index + 1) % ROLES.length;
      incoming.textContent = ROLES[index]!;

      gsap.set(incoming, { yPercent: 100, opacity: 0, filter: "blur(4px)" });

      gsap.to(outgoing, {
        yPercent: -100,
        opacity: 0,
        filter: "blur(4px)",
        duration: TRANSITION_S,
        ease: "power3.inOut",
      });
      gsap.to(incoming, {
        yPercent: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: TRANSITION_S,
        ease: "power3.out",
      });

      activeIsA = !activeIsA;
      schedule();
    };

    const schedule = () => {
      if (document.hidden) return;
      timeoutId = setTimeout(cycle, HOLD_MS);
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (timeoutId) clearTimeout(timeoutId);
      } else {
        schedule();
      }
    };

    schedule();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisibility);
      gsap.killTweensOf([a, b]);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <p className={cn("text-foreground/70", className)}>
        Web Developer / AI Integrator
      </p>
    );
  }

  return (
    <div
      className={cn(
        "relative h-[1.4em] overflow-hidden whitespace-nowrap",
        className
      )}
      role="text"
      aria-label={ROLES.join(" / ")}
    >
      <span className="sr-only">{ROLES.join(" / ")}</span>
      <span
        ref={slotARef}
        aria-hidden="true"
        className="absolute inset-0 inline-flex items-center whitespace-nowrap will-change-transform"
      />
      <span
        ref={slotBRef}
        aria-hidden="true"
        className="absolute inset-0 inline-flex items-center whitespace-nowrap will-change-transform"
      />
    </div>
  );
}
