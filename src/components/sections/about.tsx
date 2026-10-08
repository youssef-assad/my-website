"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { useReducedMotion } from "@/lib/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

const HEADING = "About";

const CURRENTLY = [
  "Primesay — Web Dev & AI Integration",
  "Casablanca, Morocco",
  "Stack — TS, React, Next, Postgres, K8s",
  "Open to interesting problems",
];

const STATS = [
  { value: "11.6×", label: "Translation throughput under load" },
  { value: "24", label: "Languages in the translation API" },
  { value: "4", label: "TTS engines in one voice studio" },
];

export function About() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      gsap.set(".about-eyebrow", { y: 20, opacity: 0 });
      gsap.set(".about-letter", { y: 60, opacity: 0, filter: "blur(10px)" });
      gsap.set(".about-body", { y: 30, opacity: 0 });
      gsap.set(".about-panel", { x: 40, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
        defaults: { ease: "power3.out" },
      });

      tl.to(".about-eyebrow", { y: 0, opacity: 0.6, duration: 0.5 }, 0);
      tl.to(
        ".about-letter",
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.6,
          stagger: 0.03,
        },
        0.2
      );
      tl.to(
        ".about-body",
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.15 },
        0.7
      );
      tl.to(".about-panel", { x: 0, opacity: 1, duration: 0.8 }, 0.7);
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full px-6 py-32 md:py-40"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-[3fr_2fr] lg:gap-20">
        <div>
          <p className="about-eyebrow text-[10px] uppercase tracking-[0.25em] text-foreground/50 will-change-transform">
            02 / Who I am
          </p>
          <h2 className="mt-6 font-display text-5xl font-medium leading-[0.95] tracking-tight lg:text-7xl">
            {HEADING.split("").map((char, i) => (
              <span
                key={i}
                className="about-letter inline-block will-change-transform"
                style={{ willChange: "transform, opacity, filter" }}
              >
                {char === " " ? " " : char}
              </span>
            ))}
          </h2>

          <div className="mt-12 space-y-6 text-base leading-relaxed text-foreground/75 md:text-lg">
            <p className="about-body will-change-transform">
              I&apos;m a full-stack developer at Primesay, where I focus on the
              parts of an AI feature that aren&apos;t the prompt — the
              streaming, the surfaces, the rate-limits, and the deploys
              that quietly keep things up.
            </p>
            <p className="about-body will-change-transform">
              I care about building tools that feel inevitable rather than
              impressive. AI is a material to me, not a feature: the best
              integrations don&apos;t announce themselves, they just make
              something that already worked feel a little sharper.
            </p>
            <p className="about-body will-change-transform">
              Right now I&apos;m shipping internal AI tooling at Primesay,
              building TrendPoll on the side, and exploring the boundary where
              agents stop being chatbots and start being collaborators.
            </p>
          </div>
        </div>

        <aside className="about-panel h-fit border border-white/10 p-8 will-change-transform">
          <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">
            Currently
          </p>
          <ul className="mt-6 space-y-4 text-sm text-foreground/80">
            {CURRENTLY.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden className="text-foreground/40">
                  —
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <dl className="about-body mx-auto mt-20 grid w-full max-w-6xl grid-cols-3 gap-6 border-t border-white/10 pt-10 will-change-transform md:mt-28">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse justify-end">
            <dt className="mt-2 text-[10px] uppercase leading-relaxed tracking-[0.2em] text-foreground/50 md:text-xs">
              {stat.label}
            </dt>
            <dd className="font-display text-4xl font-medium tracking-tight md:text-6xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
