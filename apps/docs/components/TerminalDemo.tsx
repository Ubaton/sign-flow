'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CODE = `import { SignatureCapture, SignClient } from 'signflow-core';

const capture = new SignatureCapture({ element: canvasEl });
// ...user draws...

const client = new SignClient({ apiKey: 'pk_live_9f2c...' });
await client.submitSignature({
  signature: capture.toSvgPath(),
  location: null,
  deviceData: capture.getDeviceData(),
  siteUrl: location.href,
  pageName: 'master-services-agreement',
  createdBy: 'client@example.com',
});`;

const PREVIEW_STROKE =
  'M 8 55 C 16 20, 34 20, 38 40 C 42 58, 28 62, 26 46 C 24 30, 46 18, 58 38 C 66 52, 78 56, 88 38';

type Phase = 'idle' | 'typing' | 'saving' | 'preview';

export function TerminalDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLSpanElement>(null);
  const previewPathRef = useRef<SVGPathElement>(null);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [toast, setToast] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>>>([]);

  function clearTimers() {
    timers.current.forEach((t) => clearTimeout(t as ReturnType<typeof setTimeout>));
    timers.current = [];
  }

  function playPreviewDraw() {
    const path = previewPathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, { strokeDashoffset: 0, duration: 0.9, ease: 'power1.inOut' });
  }

  function runSaveSequence() {
    setPhase('saving');
    const cursor = cursorRef.current;
    const saveEl = saveRef.current;
    const root = rootRef.current;
    if (!cursor || !saveEl || !root) return;

    const rootRect = root.getBoundingClientRect();
    const btnRect = saveEl.getBoundingClientRect();
    const targetX = btnRect.left - rootRect.left + btnRect.width / 2 - 6;
    const targetY = btnRect.top - rootRect.top + btnRect.height / 2 - 6;

    gsap.set(cursor, { opacity: 1, x: 30, y: 220 });
    gsap.to(cursor, {
      x: targetX,
      y: targetY,
      duration: 0.85,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.to(cursor, { scale: 0.75, duration: 0.09, yoyo: true, repeat: 1 });
        setToast(true);
        const t = setTimeout(() => {
          gsap.to(cursor, { opacity: 0, duration: 0.25 });
          setPhase('preview');
          requestAnimationFrame(playPreviewDraw);
        }, 650);
        timers.current.push(t);
      },
    });
  }

  function play() {
    clearTimers();
    setToast(false);
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setTyped(CODE);
      setPhase('preview');
      requestAnimationFrame(playPreviewDraw);
      return;
    }

    setTyped('');
    setPhase('typing');

    let i = 0;
    const typeInterval = setInterval(() => {
      i += 2;
      setTyped(CODE.slice(0, i));
      if (i >= CODE.length) {
        clearInterval(typeInterval);
        setTyped(CODE);
        const t = setTimeout(runSaveSequence, 350);
        timers.current.push(t);
      }
    }, 10);
    timers.current.push(typeInterval);
  }

  useEffect(() => {
    if (!rootRef.current) return;
    const trigger = ScrollTrigger.create({
      trigger: rootRef.current,
      start: 'top 75%',
      once: true,
      onEnter: play,
    });

    return () => {
      trigger.kill();
      clearTimers();
    };
  }, []);

  const codeLines = typed.split('\n');

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-none border border-line bg-neutral-950 font-mono-tight text-sm leading-relaxed"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
          <span className="ml-3 text-xs text-mist">capture.ts</span>
        </div>
        <div className="flex items-center gap-2">
          {toast && <span className="font-mono-tight text-[10px] text-accent">Saved</span>}
          <span
            ref={saveRef}
            className={`rounded-none border px-2 py-1 text-[10px] uppercase tracking-wider transition-colors ${
              phase === 'saving' || toast
                ? 'border-accent text-accent'
                : 'border-line text-mist'
            }`}
          >
            Save
          </span>
        </div>
      </div>

      <div className="relative min-h-[280px] p-6">
        {phase !== 'preview' ? (
          <div>
            {codeLines.map((line, i) => (
              <div key={i} className="whitespace-pre text-paper/90">
                {line || ' '}
              </div>
            ))}
            {(phase === 'typing' || phase === 'idle') && (
              <span className="inline-block h-4 w-1.5 animate-pulse bg-accent align-text-bottom" />
            )}
          </div>
        ) : (
          <div
            className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            style={{ animation: 'terminal-fade-in 0.4s ease-out' }}
          >
            <svg viewBox="0 0 96 70" className="h-20 w-28 shrink-0" fill="none" aria-hidden="true">
              <path
                ref={previewPathRef}
                d={PREVIEW_STROKE}
                stroke="var(--color-accent)"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </svg>
            <div>
              <p className="flex items-center gap-2 text-paper">
                <span className="text-accent">✓</span> Signature captured
              </p>
              <p className="mt-1 text-xs text-mist">
                SVG path · pressure-accurate · verified server-side
              </p>
              <button
                type="button"
                onClick={play}
                className="mt-4 font-mono-tight text-xs text-mist transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                ↻ replay
              </button>
            </div>
          </div>
        )}

        <div
          ref={cursorRef}
          className="pointer-events-none absolute left-0 top-0 opacity-0"
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M2 1 L2 15 L5.5 11.8 L7.8 16.5 L9.6 15.6 L7.3 11 L12 11 Z"
              fill="var(--color-paper)"
              stroke="var(--color-ink)"
              strokeWidth="0.8"
            />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes terminal-fade-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
