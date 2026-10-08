"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Mail } from "lucide-react";
import { useRef, type ComponentType, type SVGProps } from "react";

import { useReducedMotion } from "@/lib/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.11-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18a10.94 10.94 0 0 1 5.74 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56 4.56-1.52 7.85-5.83 7.85-10.91C23.5 5.74 18.27.5 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.22 0Z" />
    </svg>
  );
}

const HEADING = "Let's build something.";

const LINKS: { href: string; label: string; Icon: IconType }[] = [
  {
    href: "mailto:youssefassad158@gmail.com",
    label: "youssefassad158@gmail.com",
    Icon: Mail,
  },
  {
    href: "https://github.com/youssef-assad",
    label: "github.com/youssef-assad",
    Icon: GithubIcon,
  },
  {
    href: "https://www.linkedin.com/in/youssef-assad-a8204b289/",
    label: "linkedin.com/in/youssef-assad-a8204b289/",
    Icon: LinkedinIcon,
  },
];

export function Contact() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      gsap.set(".contact-eyebrow", { y: 20, opacity: 0 });
      gsap.set(".contact-letter", { y: 60, opacity: 0, filter: "blur(10px)" });
      gsap.set(".contact-body", { y: 20, opacity: 0 });
      gsap.set(".contact-link", { y: 20, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          once: true,
        },
        defaults: { ease: "power3.out" },
      });

      tl.to(".contact-eyebrow", { y: 0, opacity: 0.6, duration: 0.5 }, 0);
      tl.to(
        ".contact-letter",
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.7,
          stagger: 0.04,
        },
        0.2
      );
      tl.to(".contact-body", { y: 0, opacity: 1, duration: 0.6 }, 0.7);
      tl.to(
        ".contact-link",
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        0.85
      );
    },
    { scope: sectionRef, dependencies: [reduced] }
  );

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative flex min-h-screen w-full items-center justify-center px-6 py-32"
    >
      <div className="mx-auto w-full max-w-4xl">
        <p className="contact-eyebrow text-[10px] uppercase tracking-[0.25em] text-foreground/50 will-change-transform">
          04 / Contact
        </p>
        <h2 className="mt-6 font-display text-6xl font-medium leading-[0.95] tracking-tight lg:text-8xl">
          {HEADING.split("").map((char, i) => (
            <span
              key={i}
              className="contact-letter inline-block will-change-transform"
              style={{ willChange: "transform, opacity, filter" }}
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </h2>
        <p className="contact-body mt-8 max-w-xl text-base text-foreground/70 will-change-transform md:text-lg">
          Open to freelance, full-time, or a quick conversation. Email is
          fastest.
        </p>

        <ul className="mt-16 border-t border-white/10">
          {LINKS.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="contact-link group flex items-center justify-between gap-4 border-b border-white/10 py-6 text-2xl text-foreground/80 transition-colors hover:text-foreground will-change-transform md:text-3xl"
              >
                <span className="flex items-center gap-4">
                  <Icon className="h-5 w-5 text-foreground/40 transition-colors group-hover:text-foreground" />
                  {label}
                </span>
                <ArrowRight className="h-5 w-5 text-foreground/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
