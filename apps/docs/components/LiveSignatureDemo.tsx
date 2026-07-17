'use client';

import { useEffect, useRef, useState } from 'react';
import { SignatureCapture, strokesToPressureArray, type Stroke } from 'signflow-core';
import { PressureSparkline } from './PressureSparkline';

function drawSegment(
  ctx: CanvasRenderingContext2D,
  from: Stroke['points'][number],
  to: Stroke['points'][number],
): void {
  ctx.lineWidth = 1 + to.pressure * 3;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

export function LiveSignatureDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureRef = useRef<SignatureCapture | null>(null);
  const [svgPath, setSvgPath] = useState('');
  const [pressures, setPressures] = useState<number[]>([]);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const capture = new SignatureCapture({
      element: canvas,
      onStrokeUpdate: (stroke) => {
        if (ctx && stroke.points.length >= 2) {
          const points = stroke.points;
          drawSegment(ctx, points[points.length - 2]!, points[points.length - 1]!);
        }
        setSvgPath(capture.toSvgPath());
        setPressures(strokesToPressureArray(capture.getStrokes()));
        setEmpty(false);
      },
    });
    captureRef.current = capture;

    // The capture engine records coordinates in CSS pixels relative to the
    // element, so the buffer must track the rendered size (× devicePixelRatio
    // for sharpness) — a fixed-size buffer stretched by CSS would draw strokes
    // offset from the pointer. Resizing the buffer resets canvas state, so
    // stroke style is reapplied and existing strokes redrawn each time.
    const resize = () => {
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue('--color-accent').trim();
      for (const stroke of capture.getStrokes()) {
        for (let i = 1; i < stroke.points.length; i++) {
          drawSegment(ctx, stroke.points[i - 1]!, stroke.points[i]!);
        }
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      capture.destroy();
    };
  }, []);

  function handleClear() {
    captureRef.current?.clear();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSvgPath('');
    setPressures([]);
    setEmpty(true);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <div className="flex min-h-11 items-center justify-between">
          <span className="font-mono-tight text-xs uppercase tracking-[0.15em] text-mist">
            Draw here
          </span>
          <button
            type="button"
            onClick={handleClear}
            disabled={empty}
            className="inline-flex min-h-11 items-center px-2 font-mono-tight text-xs text-mist transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
          >
            clear
          </button>
        </div>
        <canvas
          ref={canvasRef}
          aria-label="Draw your signature to see live capture output"
          className="mt-2 h-44 w-full touch-none border border-line bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          tabIndex={0}
        />
      </div>

      <div className="flex flex-col">
        <span className="flex min-h-11 items-center font-mono-tight text-xs uppercase tracking-[0.15em] text-mist">
          Live output
        </span>
        <div className="mt-2 max-h-48 flex-1 overflow-auto border border-line bg-ink p-3">
          <code className="block whitespace-pre-wrap break-all font-mono-tight text-2xs leading-relaxed text-paper/80">
            {empty ? '// draw a stroke to see the SVG path stream in' : svgPath}
          </code>
        </div>
        <div className="mt-3">
          <span className="font-mono-tight text-xs uppercase tracking-[0.15em] text-mist">
            Pressure curve
          </span>
          <div className="mt-1 border border-line bg-ink p-2">
            {pressures.length > 1 ? (
              <PressureSparkline pressures={pressures} />
            ) : (
              <div className="h-10" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
