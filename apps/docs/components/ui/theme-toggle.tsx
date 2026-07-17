'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { AnimatePresence, motion } from 'motion/react';
import { MoonIcon, SunIcon } from '@/components/icons';
import { THEME_STORAGE_KEY } from '@/lib/theme';

// Mirrors the light/dark `--color-ink` values in globals.css. The ripple
// overlay has to paint the *incoming* theme's background while the rest of
// the page still renders the outgoing one via the CSS cascade — it can't
// read the custom property for a theme that isn't applied yet, so the
// values are duplicated here deliberately.
const RIPPLE_BG: Record<'light' | 'dark', string> = {
  light: '#fafaf9',
  dark: '#0a0a0a',
};

// useLayoutEffect warns when it runs during SSR; client components are
// still rendered to a string on the server, so this ternary is required,
// not defensive dead code.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private browsing, quota) — the theme
    // still applies for this page view, it just won't persist.
  }
}

/**
 * Tracks the theme already applied by the blocking head script. Each
 * consumer (Navbar, Dashboard topbar) reads the same DOM class and the
 * same localStorage key, so a full page navigation between the two always
 * lands on the last persisted choice — there's no separate state to drift.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  return { isDark, setIsDark };
}

const iconTransition = { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] as const };

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, setIsDark } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  // The overlay is portaled to <body> (see render below) instead of sitting
  // where this component happens to be mounted — the Navbar/Dashboard
  // header use backdrop-blur, which creates a containing block for
  // position:fixed descendants, trapping a same-tree overlay inside the
  // header's own (tiny) box instead of the viewport. Portaling needs
  // `document`, so it's deferred to a mount effect for SSR-safety.
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);

  function handleToggle() {
    const next: 'light' | 'dark' = isDark ? 'light' : 'dark';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const button = buttonRef.current;
    const overlay = overlayRef.current;

    if (reduceMotion || !button || !overlay) {
      applyTheme(next);
      setIsDark(next === 'dark');
      return;
    }

    // The button's own screen position, not the pointer's — keyboard
    // activation (Tab + Enter/Space) then originates the ripple correctly
    // since there's no click coordinate to fall back on.
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    overlay.style.background = RIPPLE_BG[next];
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    overlay.style.display = 'block';

    gsap.to(overlay, {
      clipPath: `circle(${maxRadius}px at ${x}px ${y}px)`,
      duration: 0.8,
      ease: 'power4.inOut',
      onComplete: () => {
        applyTheme(next);
        setIsDark(next === 'dark');
        overlay.style.display = 'none';
      },
    });
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`relative inline-flex h-11 w-11 items-center justify-center text-paper transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${className ?? ''}`}
      >
        <AnimatePresence initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
              transition={iconTransition}
            >
              <MoonIcon className="h-[18px] w-[18px]" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
              transition={iconTransition}
            >
              <SunIcon className="h-[18px] w-[18px]" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      {portalReady &&
        createPortal(
          <div
            ref={overlayRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[9999] hidden"
          />,
          document.body,
        )}
    </>
  );
}
