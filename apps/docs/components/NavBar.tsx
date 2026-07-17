'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const NAV_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#quickstart', label: 'Quick start' },
  { href: '/demo', label: 'Live demo' },
];

export function NavBar() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <nav
      ref={ref}
      className="sticky top-0 z-10 border-b border-line bg-ink/80 pt-[env(safe-area-inset-top)] backdrop-blur"
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <a href="/" className="inline-flex min-h-11 items-center">
          <Logo />
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-2 text-sm text-mist md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center px-3 transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/dashboard"
            className="ml-2 inline-flex min-h-11 items-center border border-line px-4 font-mono-tight text-xs text-paper transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Dashboard
          </a>
          <ThemeToggle className="ml-1" />
        </div>

        {/* Mobile: Dashboard CTA stays reachable + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <a
            href="/dashboard"
            className="inline-flex min-h-11 items-center border border-line px-3 font-mono-tight text-xs text-paper transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Dashboard
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-11 w-11 items-center justify-center text-paper transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div id="mobile-nav" className="border-t border-line md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center px-6 text-sm text-mist transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
