"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";

import { RoleCycler } from "@/components/sections/role-cycler";

const NAME = "Youssef";

export function Hero() {
  const containerRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const dividerRef = useRef<HTMLSpanElement | null>(null);
  const leftEyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const rightEyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const targets = [
        videoRef.current,
        dividerRef.current,
        leftEyebrowRef.current,
        rightEyebrowRef.current,
        titleRef.current,
        scrollIndicatorRef.current,
      ];

      if (reduced) {
        gsap.set(targets, { clearProps: "all" });
        gsap.set(".letter", { clearProps: "all" });
        return;
      }

      gsap.set(".letter", { y: 100, opacity: 0, filter: "blur(12px)" });
      gsap.set(videoRef.current, { opacity: 0, scale: 1.05 });
      gsap.set(dividerRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
      });
      gsap.set([leftEyebrowRef.current, rightEyebrowRef.current], {
        opacity: 0,
        y: 10,
      });
      gsap.set(titleRef.current, { opacity: 0, x: 40 });
      gsap.set(scrollIndicatorRef.current, { opacity: 0, y: 10 });

      const tl = gsap.timeline({
        delay: 0.2,
        defaults: { ease: "power3.out" },
      });

      tl.to(
        videoRef.current,
        { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" },
        0
      );

      tl.to(
        [leftEyebrowRef.current, rightEyebrowRef.current],
        { opacity: 0.6, y: 0, duration: 0.6, stagger: 0.1 },
        0.4
      );

      tl.to(
        ".letter",
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          stagger: 0.04,
          ease: "power3.out",
        },
        0.5
      );

      tl.to(
        dividerRef.current,
        { scaleX: 1, duration: 0.7, ease: "power2.inOut" },
        1.2
      );

      tl.to(titleRef.current, { opacity: 1, x: 0, duration: 0.7 }, 0.9);

      tl.to(
        scrollIndicatorRef.current,
        { opacity: 0.5, y: 0, duration: 0.5 },
        1.6
      );

      gsap.to(scrollIndicatorRef.current?.querySelector(".arrow") ?? null, {
        y: 8,
        duration: 1.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 2.2,
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative min-h-screen w-full overflow-hidden bg-background"
    >
      <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 pt-24 pb-32 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-12 lg:py-0">
        <div className="flex flex-col items-center text-center lg:items-end lg:pr-10 lg:text-right">
          <h1
            ref={nameRef}
            className="font-display text-7xl font-medium leading-[0.9] tracking-tight lg:text-8xl xl:text-9xl"
          >
            {NAME.split("").map((char, i) => (
              <span
                key={i}
                className="letter inline-block will-change-transform"
                style={{ willChange: "transform, opacity, filter" }}
              >
                {char}
              </span>
            ))}
          </h1>
          <span
            ref={dividerRef}
            aria-hidden
            className="mt-6 block h-px w-20 bg-white/15 lg:ml-auto"
          />
          <p
            ref={leftEyebrowRef}
            className="mt-3 text-[10px] uppercase tracking-[0.25em] text-foreground/50"
          >
            01 / Portfolio 2026
          </p>
        </div>

        <video
          ref={videoRef}
          className="aspect-[3/4] w-[220px] object-cover sm:w-[260px] md:w-[360px] lg:w-[420px] xl:w-[480px] will-change-transform"
          src="/hero-bg.mp4"
          poster="/hero-bg-poster.jpg"
          preload="auto"
          autoPlay
          loop
          muted
          playsInline
        />

        <div className="flex flex-col items-center text-center lg:items-start lg:pl-10 lg:text-left">
          <p
            ref={rightEyebrowRef}
            className="mb-3 text-[10px] uppercase tracking-[0.25em] text-foreground/50"
          >
            Based in Casablanca
          </p>
          <div ref={titleRef} className="w-full will-change-transform">
            <RoleCycler className="w-full font-display text-4xl font-medium tracking-tight lg:text-5xl xl:text-6xl" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div ref={scrollIndicatorRef} className="text-foreground/60">
          <span className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.2em]">
            Scroll
            <ArrowDown className="arrow h-4 w-4" />
          </span>
        </div>
      </div>
    </section>
  );
}
