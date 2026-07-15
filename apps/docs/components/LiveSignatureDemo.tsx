'use client';

import { useEffect, useRef, useState } from 'react';
import { SignatureCapture, strokesToPressureArray, type Stroke } from 'signflow-core';
import { PressureSparkline } from './PressureSparkline';

function drawStroke(ctx: CanvasRenderingContext2D | null | undefined, stroke: Stroke): void {
  if (!ctx || stroke.points.length < 2) return;
  const points = stroke.points;
  const from = points[points.length - 2]!;
  const to = points[points.length - 1]!;

  ctx.lineWidth = 1 + to.pressure * 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#c8ff5c';
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
        drawStroke(ctx, stroke);
        setSvgPath(capture.toSvgPath());
        setPressures(strokesToPressureArray(capture.getStrokes()));
        setEmpty(false);
      },
    });
    captureRef.current = capture;

    return () => capture.destroy();
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
        <div className="flex items-center justify-between">
          <span className="font-mono-tight text-xs uppercase tracking-[0.15em] text-mist">
            Draw here
          </span>
          <button
            type="button"
            onClick={handleClear}
            disabled={empty}
            className="font-mono-tight text-xs text-mist transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
          >
            clear
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={400}
          height={180}
          aria-label="Draw your signature to see live capture output"
          className="mt-2 w-full touch-none border border-line bg-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          tabIndex={0}
        />
      </div>

      <div className="flex flex-col">
        <span className="font-mono-tight text-xs uppercase tracking-[0.15em] text-mist">
          Live output
        </span>
        <div className="mt-2 flex-1 overflow-auto border border-line bg-neutral-950 p-3">
          <code className="block whitespace-pre-wrap break-all font-mono-tight text-[11px] leading-relaxed text-paper/80">
            {empty ? '// draw a stroke to see the SVG path stream in' : svgPath}
          </code>
        </div>
        <div className="mt-3">
          <span className="font-mono-tight text-xs uppercase tracking-[0.15em] text-mist">
            Pressure curve
          </span>
          <div className="mt-1 border border-line bg-neutral-950 p-2">
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
