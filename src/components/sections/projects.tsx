"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ExternalLink, Lock, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { ChatPanel } from "@/components/chat/chat-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModerationDiagram } from "@/components/sections/moderation-diagram";
import { projects, type Project } from "@/lib/projects";
import { useReducedMotion } from "@/lib/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export function Projects() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useGSAP(
    () => {
      if (reduced) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const track = trackRef.current;
        const pin = pinRef.current;
        if (!track || !pin) return;

        const distance = () => track.scrollWidth - window.innerWidth;

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${distance() * 0.55}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        const panels = track.querySelectorAll<HTMLElement>("[data-panel]");
        panels.forEach((panel, index) => {
          const targets =
            panel.querySelectorAll<HTMLElement>("[data-anim]");
          if (!targets.length) return;

          // The intro panel sits at scroll position 0 of the pin, so its
          // "left center" trigger is never crossed when the user jumps
          // straight to #work — it would stay invisible. Play it as soon as
          // the section nears the viewport instead.
          if (index === 0) {
            gsap.from(targets, {
              y: 40,
              opacity: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: pin,
                start: "top 85%",
                once: true,
              },
            });
            return;
          }

          gsap.from(targets, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: "left center",
              toggleActions: "play none none reverse",
            },
          });
        });

        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
      });

      mm.add("(max-width: 1023.98px)", () => {
        const cards =
          mobileRef.current?.querySelectorAll<HTMLElement>("[data-card]");
        cards?.forEach((card) => {
          const targets =
            card.querySelectorAll<HTMLElement>("[data-anim]");
          if (!targets.length) return;
          gsap.from(targets, {
            y: 30,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 75%",
              once: true,
            },
          });
        });
      });
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  return (
    <section ref={sectionRef} id="work" className="relative w-full">
      <div
        ref={pinRef}
        className="hidden h-screen w-full overflow-hidden motion-safe:lg:block"
      >
        <div ref={trackRef} className="flex h-full will-change-transform">
          <IntroPanel />
          {projects.map((project) => (
            <ProjectPanel
              key={project.id}
              project={project}
              onTalk={setActiveProject}
            />
          ))}
          <OutroPanel />
        </div>
      </div>

      <div
        ref={mobileRef}
        className="flex flex-col gap-24 px-6 py-32 motion-safe:lg:hidden"
      >
        <header data-card className="max-w-2xl">
          <p
            data-anim
            className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 will-change-transform"
          >
            03 / Selected Work
          </p>
          <h2
            data-anim
            className="mt-4 font-display text-5xl font-medium tracking-tight will-change-transform"
          >
            Things I&apos;ve built
          </h2>
        </header>

        {projects.map((project) => (
          <MobileCard
            key={project.id}
            project={project}
            onTalk={setActiveProject}
          />
        ))}

        <div data-card className="max-w-2xl">
          <p
            data-anim
            className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 will-change-transform"
          >
            More incoming
          </p>
          <h3
            data-anim
            className="mt-4 font-display text-3xl font-medium tracking-tight will-change-transform"
          >
            What&apos;s next
          </h3>
          <p
            data-anim
            className="mt-6 text-base text-foreground/70 will-change-transform"
          >
            More projects in flight. Try &ldquo;Talk to this project&rdquo; on
            any of them above.
          </p>
          <a
            data-anim
            href="#contact"
            className="mt-6 inline-flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-foreground will-change-transform"
          >
            Get in touch
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <ChatPanel
        project={activeProject}
        open={activeProject !== null}
        onClose={() => setActiveProject(null)}
      />
    </section>
  );
}

function IntroPanel() {
  return (
    <article
      data-panel
      className="flex h-full w-screen flex-shrink-0 flex-col justify-center px-16 xl:px-32"
    >
      <p
        data-anim
        className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 will-change-transform"
      >
        03 / Selected Work
      </p>
      <h2
        data-anim
        className="mt-6 font-display text-7xl font-medium leading-[0.95] tracking-tight xl:text-9xl will-change-transform"
      >
        Things I&apos;ve built
      </h2>
      <p
        data-anim
        className="mt-8 max-w-md text-base text-foreground/60 will-change-transform"
      >
        A few things I&apos;ve shipped. Scroll horizontally.
      </p>
      <div
        data-anim
        aria-hidden
        className="mt-10 inline-flex items-center gap-3 text-foreground/40 will-change-transform"
      >
        <ArrowRight className="h-6 w-6" />
      </div>
    </article>
  );
}

function ProjectPanel({
  project,
  onTalk,
}: {
  project: Project;
  onTalk: (project: Project) => void;
}) {
  return (
    <article
      data-panel
      className="flex h-full w-screen flex-shrink-0 items-center px-16 xl:px-32"
    >
      <div className="grid w-full grid-cols-2 gap-16 xl:gap-24">
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-3">
            <span
              data-anim
              aria-hidden
              className="h-2 w-2 rounded-full will-change-transform"
              style={{ backgroundColor: project.accentColor }}
            />
            <span
              data-anim
              className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 tabular-nums will-change-transform"
            >
              {project.year}
            </span>
          </div>
          <h3
            data-anim
            className="mt-4 font-display text-6xl font-medium leading-[0.95] tracking-tight xl:text-8xl will-change-transform"
          >
            {project.name}
          </h3>
          <p
            data-anim
            className="mt-6 text-xl text-foreground/75 will-change-transform"
          >
            {project.tagline}
          </p>
          <p
            data-anim
            className="mt-4 max-w-xl text-base leading-relaxed text-foreground/70 will-change-transform"
          >
            {project.description}
          </p>
          <div
            data-anim
            className="mt-8 flex flex-wrap gap-1.5 will-change-transform"
          >
            {project.stack.map((tech) => (
              <Badge key={tech} variant="secondary" className="font-normal">
                {tech}
              </Badge>
            ))}
          </div>
          <div
            data-anim
            className="mt-10 flex flex-wrap items-center gap-3 will-change-transform"
          >
            <LiveLink project={project} />
            <Button
              variant="outline"
              onClick={() => onTalk(project)}
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              Talk to this project
            </Button>
          </div>
        </div>

        <div
          data-anim
          className="flex items-center justify-center will-change-transform"
        >
          {project.image ? (
            <ScreenshotFrame project={project} />
          ) : project.id === "content-moderation" ? (
            <ModerationDiagram accent={project.accentColor} />
          ) : (
            <div
              className="flex aspect-[4/5] w-full items-center justify-center border bg-white/[0.02]"
              style={{ borderColor: `${project.accentColor}24` }}
            >
              <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/30">
                preview
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function LiveLink({
  project,
  size = "default",
}: {
  project: Project;
  size?: "default" | "sm";
}) {
  if (project.internal || project.liveUrl === "#") {
    return (
      <Badge
        variant="outline"
        className={size === "sm" ? "px-3 py-1.5" : "px-4 py-2 text-sm"}
      >
        <Lock aria-hidden />
        Internal project
      </Badge>
    );
  }
  return (
    <Button asChild variant="default" size={size}>
      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
        View Live
        <ExternalLink
          className={size === "sm" ? "ml-1 h-3.5 w-3.5" : "ml-1 h-4 w-4"}
        />
      </a>
    </Button>
  );
}

function OutroPanel() {
  return (
    <article
      data-panel
      className="flex h-full w-screen flex-shrink-0 flex-col justify-center px-16 xl:px-32"
    >
      <p
        data-anim
        className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 will-change-transform"
      >
        More incoming
      </p>
      <h2
        data-anim
        className="mt-6 font-display text-7xl font-medium leading-[0.95] tracking-tight xl:text-9xl will-change-transform"
      >
        What&apos;s next
      </h2>
      <p
        data-anim
        className="mt-8 max-w-xl text-base leading-relaxed text-foreground/70 will-change-transform"
      >
        More projects in flight. In the meantime, hit &ldquo;Talk to this
        project&rdquo; on any of them — the chat knows each project&apos;s
        decisions and trade-offs, and will tell you honestly where they fall
        short.
      </p>
      <a
        data-anim
        href="#contact"
        className="group mt-10 inline-flex w-fit items-center gap-3 text-base text-foreground/80 transition-colors hover:text-foreground will-change-transform"
      >
        Get in touch
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </a>
    </article>
  );
}

function MobileCard({
  project,
  onTalk,
}: {
  project: Project;
  onTalk: (project: Project) => void;
}) {
  return (
    <article data-card className="flex flex-col gap-6 border border-white/10 p-8">
      <div className="flex items-baseline justify-between">
        <h3
          data-anim
          className="font-display text-4xl font-medium tracking-tight will-change-transform"
        >
          {project.name}
        </h3>
        <span
          data-anim
          className="text-[10px] uppercase tracking-[0.25em] text-foreground/50 tabular-nums will-change-transform"
        >
          {project.year}
        </span>
      </div>
      {project.image && (
        <div data-anim className="w-full will-change-transform">
          <ScreenshotFrame project={project} compact />
        </div>
      )}
      {!project.image && project.id === "content-moderation" && (
        <div data-anim className="flex w-full justify-center will-change-transform">
          <ModerationDiagram accent={project.accentColor} />
        </div>
      )}
      <p
        data-anim
        className="text-base text-foreground/70 will-change-transform"
      >
        {project.tagline}
      </p>
      <p
        data-anim
        className="text-sm leading-relaxed text-foreground/60 will-change-transform"
      >
        {project.description}
      </p>
      <div
        data-anim
        className="flex flex-wrap gap-1.5 will-change-transform"
      >
        {project.stack.map((tech) => (
          <Badge key={tech} variant="secondary" className="font-normal">
            {tech}
          </Badge>
        ))}
      </div>
      <div
        data-anim
        className="flex flex-wrap items-center gap-3 will-change-transform"
      >
        <LiveLink project={project} size="sm" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTalk(project)}
        >
          <MessageSquare className="mr-1 h-3.5 w-3.5" />
          Talk to this project
        </Button>
      </div>
    </article>
  );
}

function ScreenshotFrame({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  if (!project.image) return null;
  return (
    <div className="relative w-full max-w-2xl">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute rounded-2xl blur-3xl ${
          compact ? "-inset-6 opacity-40" : "-inset-8 opacity-60"
        }`}
        style={{
          background: `radial-gradient(circle at center, ${project.accentColor}22 0%, transparent 70%)`,
        }}
      />
      <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/50">
        <Image
          src={project.image}
          alt={`${project.name} screenshot`}
          fill
          className="object-contain"
          sizes={compact ? "100vw" : "(max-width: 1024px) 100vw, 672px"}
          priority={project.id === "trendpoll" && !compact}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />
      </div>
    </div>
  );
}
