'use client';

import { useRef, useState } from 'react';
import { SignaturePad, type SignaturePadHandle, type SignatureChangeEvent } from 'signflow';

const SWATCHES = ['#e11d48', '#0ea5e9', '#22c55e'] as const;

export function SignaturePadHarness() {
  const pad = useRef<SignaturePadHandle>(null);
  const [event, setEvent] = useState<SignatureChangeEvent | null>(null);
  const [strokeColor, setStrokeColor] = useState<string | undefined>(undefined);
  const [fluid, setFluid] = useState(false);
  const [inheritedColor, setInheritedColor] = useState('#f4f4f5');

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-paper">
      <h1 className="text-2xl font-medium tracking-tight">SignaturePad harness</h1>
      <p className="mt-2 text-sm text-mist">
        Verifies the published <code className="font-mono-tight">signflow</code> package: pointer
        alignment, DPR sharpness, resize persistence, and color resolution.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFluid((f) => !f)}
          className="min-h-11 border border-line px-3 font-mono-tight text-xs hover:border-accent hover:text-accent"
        >
          {fluid ? 'fixed 500×200' : 'fluid 100%'}
        </button>
        <button
          type="button"
          onClick={() => setStrokeColor(undefined)}
          className="min-h-11 border border-line px-3 font-mono-tight text-xs hover:border-accent hover:text-accent"
        >
          inherit color
        </button>
        {SWATCHES.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setStrokeColor(color)}
            style={{ borderColor: color, color }}
            className="min-h-11 border px-3 font-mono-tight text-xs"
          >
            {color}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setInheritedColor((c) => (c === '#f4f4f5' ? '#a3e635' : '#f4f4f5'))}
          className="min-h-11 border border-line px-3 font-mono-tight text-xs hover:border-accent hover:text-accent"
        >
          toggle inherited color
        </button>
        <button
          type="button"
          onClick={() => pad.current?.clear()}
          className="min-h-11 border border-line px-3 font-mono-tight text-xs hover:border-accent hover:text-accent"
        >
          clear
        </button>
      </div>

      <div
        className="mt-6 resize-x overflow-auto border border-dashed border-line p-4"
        style={{ color: inheritedColor, width: fluid ? '100%' : undefined }}
      >
        <SignaturePad
          ref={pad}
          publicKey="pk_test_harness"
          signerId="harness@example.com"
          pageName="dev-harness"
          strokeColor={strokeColor}
          width={fluid ? '100%' : 500}
          height={200}
          onChange={setEvent}
        />
      </div>

      <p className="mt-2 text-xs text-mist">
        The dashed box is horizontally resizable — drag its corner to confirm strokes persist and
        stay aligned.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-mono-tight text-xs uppercase tracking-[0.2em] text-mist">
            onChange payload
          </h2>
          <pre className="mt-2 max-h-40 overflow-auto border border-line bg-ink p-3 text-2xs">
            {event ? JSON.stringify({ ...event, svgPath: `${event.svgPath.slice(0, 120)}…` }, null, 2) : '// draw a stroke'}
          </pre>
        </div>

        <div>
          <h2 className="font-mono-tight text-xs uppercase tracking-[0.2em] text-mist">
            SVG replay of the submit payload
          </h2>
          {/* Renders the exact path submit() would send. If this shape doesn't
              match the canvas, what the server stores isn't what the signer saw. */}
          <div className="mt-2 border border-line bg-ink p-2">
            <svg viewBox="0 0 500 200" className="h-40 w-full" aria-label="SVG replay">
              <path
                d={event?.svgPath ?? ''}
                fill="none"
                stroke={strokeColor ?? inheritedColor}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
