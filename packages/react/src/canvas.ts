import type { Stroke, StrokePoint } from 'signflow-core';

/** Constant width, or a function mapping pointer pressure (0–1) to a width. */
export type LineWidth = number | ((pressure: number) => number);

/** Reproduces the pressure curve the component has always used. */
export const defaultLineWidth = (pressure: number): number => 1 + pressure * 3;

export function resolveLineWidth(lineWidth: LineWidth | undefined, pressure: number): number {
  if (typeof lineWidth === 'number') return lineWidth;
  return (lineWidth ?? defaultLineWidth)(pressure);
}

/**
 * Ink color, in precedence order: explicit prop, then the element's computed
 * CSS `color`, then black.
 *
 * Reading computed `color` is what gives the canvas real `currentColor`
 * semantics — it inherits and responds to a consumer's own CSS with no
 * design-system coupling. `getComputedStyle().color` always resolves to a
 * concrete `rgb()`/`rgba()`, never the literal keyword, so it is directly
 * assignable to `strokeStyle` (assigning `'currentColor'` is invalid and gets
 * silently discarded, which is what used to force every signature to black).
 *
 * A fully transparent inherited color falls through to black: invisible ink is
 * a worse failure than an opinionated default.
 */
export function resolveStrokeColor(computed: CSSStyleDeclaration, override?: string): string {
  if (override) return override;
  const color = computed.color;
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return '#000';
  return color;
}

export interface Geometry {
  /** Content-box size in CSS pixels. */
  contentWidth: number;
  contentHeight: number;
  /** Border + padding offset, in CSS pixels. */
  offsetX: number;
  offsetY: number;
  color: string;
}

const px = (value: string): number => parseFloat(value) || 0;

/**
 * Measures the canvas in one pass.
 *
 * The offsets matter because `SignatureCapture` reports coordinates relative to
 * the *border box* (`clientX - getBoundingClientRect().left`), while the bitmap
 * paints the *content box*. Without correcting for border and padding, every
 * stroke lands offset from the pointer by exactly that amount.
 */
export function measure(canvas: HTMLElement, colorOverride?: string): Geometry {
  const computed = getComputedStyle(canvas);
  const borderLeft = px(computed.borderLeftWidth);
  const borderTop = px(computed.borderTopWidth);
  const paddingLeft = px(computed.paddingLeft);
  const paddingTop = px(computed.paddingTop);
  const rect = canvas.getBoundingClientRect();

  return {
    contentWidth: Math.max(
      0,
      rect.width - borderLeft - px(computed.borderRightWidth) - paddingLeft - px(computed.paddingRight),
    ),
    contentHeight: Math.max(
      0,
      rect.height - borderTop - px(computed.borderBottomWidth) - paddingTop - px(computed.paddingBottom),
    ),
    offsetX: borderLeft + paddingLeft,
    offsetY: borderTop + paddingTop,
    color: resolveStrokeColor(computed, colorOverride),
  };
}

/** Bitmap size for a content-box size at a given device pixel ratio. */
export function computeBufferSize(
  contentSize: number,
  dpr: number,
): number {
  return Math.max(1, Math.round(contentSize * dpr));
}

export function drawSegment(
  ctx: CanvasRenderingContext2D,
  from: StrokePoint,
  to: StrokePoint,
  lineWidth: LineWidth | undefined,
): void {
  ctx.lineWidth = resolveLineWidth(lineWidth, to.pressure);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

const samePoint = (a: StrokePoint, b: StrokePoint): boolean => a.x === b.x && a.y === b.y;

/**
 * Draws a whole stroke.
 *
 * A tap with no movement is drawn as a filled dot rather than a zero-length
 * line — round line caps render those inconsistently across browsers, and
 * `strokesToPath` already emits `M x y L x y` for this case, so the canvas
 * would otherwise disagree with the submitted SVG path.
 */
export function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  lineWidth: LineWidth | undefined,
): void {
  const points = stroke.points;
  if (points.length === 0) return;

  const first = points[0]!;
  if (points.length === 1 || (points.length === 2 && samePoint(first, points[1]!))) {
    ctx.beginPath();
    ctx.arc(first.x, first.y, resolveLineWidth(lineWidth, first.pressure) / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  for (let i = 1; i < points.length; i++) {
    drawSegment(ctx, points[i - 1]!, points[i]!, lineWidth);
  }
}

/** Draws only the newest segment — the incremental path used while drawing. */
export function drawLastSegment(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  lineWidth: LineWidth | undefined,
): void {
  const points = stroke.points;
  if (points.length < 2) return;
  const from = points[points.length - 2]!;
  const to = points[points.length - 1]!;
  if (samePoint(from, to)) {
    // A no-movement tap: `onStrokeEnd` appends a duplicate point, so this is
    // the only chance to render the dot.
    if (points.length === 2) drawStroke(ctx, stroke, lineWidth);
    return;
  }
  drawSegment(ctx, from, to, lineWidth);
}

/**
 * Clears the bitmap and repaints every stroke.
 *
 * Assigning `canvas.width`/`height` resets all context state, so the transform
 * and stroke styles are (re)established here rather than once at setup.
 */
export function paintAll(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  geometry: Geometry,
  dpr: number,
  strokes: readonly Stroke[],
  lineWidth: LineWidth | undefined,
): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Scale to CSS pixels, then shift so capture's border-box coordinates land
  // correctly inside the content box.
  ctx.setTransform(dpr, 0, 0, dpr, -geometry.offsetX * dpr, -geometry.offsetY * dpr);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = geometry.color;
  ctx.fillStyle = geometry.color;
  for (const stroke of strokes) drawStroke(ctx, stroke, lineWidth);
}
