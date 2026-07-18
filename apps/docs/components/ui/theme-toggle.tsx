'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { MoonIcon, SunIcon } from '@/components/icons';
import { THEME_STORAGE_KEY } from '@/lib/theme';

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

// The reference demo's curve family (GSAP power4.inOut ≈ easeInOutQuart),
// run a touch longer than the demo's 0.8s per earlier pacing feedback.
const RIPPLE_DURATION_MS = 1000;
const RIPPLE_EASING = 'cubic-bezier(0.76, 0, 0.24, 1)';

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, setIsDark } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const activeTransition = useRef<ViewTransition | null>(null);

  function handleToggle() {
    // Read the DOM class, not React state: the icon state is deliberately
    // held back until the reveal finishes (see below), so a click landing
    // mid-ripple would compute the wrong `next` from a stale `isDark`.
    const next: 'light' | 'dark' = document.documentElement.classList.contains('dark')
      ? 'light'
      : 'dark';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const button = buttonRef.current;

    if (reduceMotion || !button || !document.startViewTransition) {
      applyTheme(next);
      setIsDark(next === 'dark');
      return;
    }

    // A click while a ripple is still playing: jump the old transition to
    // its end state so the new one snapshots a settled page.
    activeTransition.current?.skipTransition();

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

    const transition = document.startViewTransition(() => {
      // Only the document class flips inside the snapshot callback. React
      // state (icon, aria-label) waits for `finished`, so the sun/moon
      // bounce plays live once the reveal lands — matching the reference
      // demo's onComplete swap — instead of being flattened invisibly
      // into the captured frame. flushSync makes the restyled page the
      // "after" snapshot rather than a frame-late paint.
      flushSync(() => applyTheme(next));
    });
    activeTransition.current = transition;

    transition.ready
      .then(() => {
        // The ripple must be a real animation on the transition's own
        // pseudo-element — WAAPI is the only API that can target one; GSAP
        // cannot. The browser keeps the transition (and the frozen
        // old-theme snapshot) alive exactly as long as animations on its
        // pseudos run. Tweening anything else (the previous CSS-variable
        // approach) let the transition finish on its default ~0.25s group
        // timeline, which cut the visible ripple off almost immediately.
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: RIPPLE_DURATION_MS,
            easing: RIPPLE_EASING,
            pseudoElement: '::view-transition-new(root)',
          },
        );
      })
      .catch(() => {
        // Transition was skipped (another toggle, a navigation) — the
        // theme class already flipped in the callback, nothing to animate.
      });

    transition.finished
      .catch(() => {})
      .finally(() => {
        if (activeTransition.current === transition) {
          activeTransition.current = null;
        }
        setIsDark(next === 'dark');
      });
  }

  return (
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
  );
}
