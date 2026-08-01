import { describe, it, expect, vi } from 'vitest';
import type { Stroke, StrokePoint } from 'signflow-core';
import {
  computeBufferSize,
  defaultLineWidth,
  drawStroke,
  measure,
  resolveLineWidth,
  resolveStrokeColor,
} from './canvas.js';

const point = (x: number, y: number, pressure = 0.5): StrokePoint => ({ x, y, pressure, t: 0 });
const stroke = (...points: StrokePoint[]): Stroke => ({ points });

function fakeCtx() {
  return {
    lineWidth: 0,
    strokeStyle: '',
    fillStyle: '',
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
  } as unknown as CanvasRenderingContext2D & {
    beginPath: ReturnType<typeof vi.fn>;
    moveTo: ReturnType<typeof vi.fn>;
    lineTo: ReturnType<typeof vi.fn>;
    arc: ReturnType<typeof vi.fn>;
    fill: ReturnType<typeof vi.fn>;
  };
}

describe('resolveLineWidth', () => {
  it('returns a constant width unchanged, whatever the pressure', () => {
    expect(resolveLineWidth(7, 0)).toBe(7);
    expect(resolveLineWidth(7, 1)).toBe(7);
  });

  it('applies a function form to the pressure', () => {
    expect(resolveLineWidth((p) => p * 10, 0.25)).toBe(2.5);
  });

  it('falls back to the default curve, matching the pre-existing 1 + p * 3', () => {
    expect(resolveLineWidth(undefined, 0)).toBe(1);
    expect(resolveLineWidth(undefined, 0.5)).toBe(2.5);
    expect(resolveLineWidth(undefined, 1)).toBe(4);
    expect(defaultLineWidth(0.5)).toBe(2.5);
  });
});

describe('computeBufferSize', () => {
  it('scales by the device pixel ratio and rounds', () => {
    expect(computeBufferSize(300, 1)).toBe(300);
    expect(computeBufferSize(300, 2)).toBe(600);
    expect(computeBufferSize(300, 3)).toBe(900);
    expect(computeBufferSize(100.4, 2)).toBe(201);
  });

  it('never returns a zero-sized buffer', () => {
    expect(computeBufferSize(0, 2)).toBe(1);
    expect(computeBufferSize(-5, 1)).toBe(1);
  });
});

describe('resolveStrokeColor', () => {
  const computed = (color: string) => ({ color }) as CSSStyleDeclaration;

  it('prefers an explicit override', () => {
    expect(resolveStrokeColor(computed('rgb(255, 0, 0)'), '#0f0')).toBe('#0f0');
  });

  it('falls back to the computed CSS color', () => {
    expect(resolveStrokeColor(computed('rgb(255, 0, 0)'))).toBe('rgb(255, 0, 0)');
  });

  it('treats a transparent inherited color as unusable', () => {
    expect(resolveStrokeColor(computed('rgba(0, 0, 0, 0)'))).toBe('#000');
    expect(resolveStrokeColor(computed('transparent'))).toBe('#000');
    expect(resolveStrokeColor(computed(''))).toBe('#000');
  });
});

describe('measure', () => {
  it('subtracts border and padding, and reports them as the content-box offset', () => {
    const el = document.createElement('div');
    el.style.borderStyle = 'solid';
    el.style.borderLeftWidth = '2px';
    el.style.borderRightWidth = '3px';
    el.style.borderTopWidth = '4px';
    el.style.borderBottomWidth = '5px';
    el.style.paddingLeft = '10px';
    el.style.paddingRight = '20px';
    el.style.paddingTop = '30px';
    el.style.paddingBottom = '40px';
    el.getBoundingClientRect = () => ({ width: 200, height: 300 }) as DOMRect;
    document.body.appendChild(el);

    const geometry = measure(el);
    expect(geometry.contentWidth).toBe(200 - 2 - 3 - 10 - 20);
    expect(geometry.contentHeight).toBe(300 - 4 - 5 - 30 - 40);
    expect(geometry.offsetX).toBe(12);
    expect(geometry.offsetY).toBe(34);

    el.remove();
  });
});

describe('drawStroke', () => {
  it('issues one moveTo/lineTo pair per segment', () => {
    const ctx = fakeCtx();
    drawStroke(ctx, stroke(point(0, 0), point(1, 1), point(2, 2), point(3, 3)), undefined);

    expect(ctx.moveTo).toHaveBeenCalledTimes(3);
    expect(ctx.lineTo).toHaveBeenCalledTimes(3);
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it('draws a no-movement tap as a filled dot, not a zero-length line', () => {
    const ctx = fakeCtx();
    drawStroke(ctx, stroke(point(5, 5), point(5, 5)), undefined);

    expect(ctx.arc).toHaveBeenCalledTimes(1);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
    expect(ctx.lineTo).not.toHaveBeenCalled();
  });

  it('draws a single-point stroke as a dot sized from its pressure', () => {
    const ctx = fakeCtx();
    drawStroke(ctx, stroke(point(5, 5, 1)), undefined);

    expect(ctx.arc).toHaveBeenCalledWith(5, 5, 2, 0, Math.PI * 2);
  });

  it('sizes each segment from the destination point pressure', () => {
    const ctx = fakeCtx();
    const widths: number[] = [];
    ctx.stroke = vi.fn(() => widths.push(ctx.lineWidth));

    drawStroke(ctx, stroke(point(0, 0, 0), point(1, 1, 1), point(2, 2, 0)), undefined);

    expect(widths).toEqual([4, 1]);
  });

  it('ignores an empty stroke', () => {
    const ctx = fakeCtx();
    drawStroke(ctx, stroke(), undefined);
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });
});
