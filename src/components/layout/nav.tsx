"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-background/40 px-5 py-2.5 backdrop-blur-xl">
        <Link
          href="/"
          className="font-display text-xl font-medium tracking-tight"
        >
          YA.
        </Link>

        <ul className="hidden items-center gap-7 text-sm text-foreground/70 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 text-xs uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground md:hidden"
            >
              Menu
              <Menu className="h-3.5 w-3.5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            showCloseButton={false}
            className="w-full gap-0 border-0 bg-background/95 p-0 text-foreground backdrop-blur-2xl sm:max-w-none"
          >
            <SheetTitle className="sr-only">Menu</SheetTitle>

            <div className="flex items-center justify-between px-8 pt-8">
              <span className="font-display text-xl font-medium tracking-tight">
                YA.
              </span>
              <SheetClose asChild>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 text-xs uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground"
                >
                  Close
                  <X className="h-3.5 w-3.5" />
                </button>
              </SheetClose>
            </div>

            <nav className="mt-16 flex flex-1 flex-col px-8">
              {links.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${150 + i * 80}ms` }}
                  className="group flex items-baseline gap-4 border-b border-white/10 py-6 animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500"
                >
                  <span className="text-[10px] tabular-nums tracking-[0.25em] text-foreground/40">
                    0{i + 1}
                  </span>
                  <span className="font-display text-5xl font-medium tracking-tight text-foreground/80 transition-all group-hover:translate-x-1 group-hover:text-foreground">
                    {link.label}
                  </span>
                </a>
              ))}
            </nav>

            <div className="px-8 pb-10 text-[10px] uppercase tracking-[0.25em] text-foreground/40">
              Youssef Assad · Casablanca
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
