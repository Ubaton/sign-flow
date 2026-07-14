import type { Stroke, StrokePoint } from './types.js';

/**
 * Converts strokes into a single SVG path `d` string using quadratic
 * midpoint smoothing between points, one subpath (M..Q..) per stroke.
 */
export function strokesToPath(strokes: Stroke[]): string {
  const subpaths: string[] = [];

  for (const stroke of strokes) {
    const pts = stroke.points;
    if (pts.length === 0) continue;

    if (pts.length === 1) {
      const p = pts[0]!;
      subpaths.push(`M ${fmt(p.x)} ${fmt(p.y)} L ${fmt(p.x)} ${fmt(p.y)}`);
      continue;
    }

    let d = `M ${fmt(pts[0]!.x)} ${fmt(pts[0]!.y)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const curr = pts[i]!;
      const next = pts[i + 1]!;
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;
      d += ` Q ${fmt(curr.x)} ${fmt(curr.y)} ${fmt(midX)} ${fmt(midY)}`;
    }
    const last = pts[pts.length - 1]!;
    d += ` L ${fmt(last.x)} ${fmt(last.y)}`;
    subpaths.push(d);
  }

  return subpaths.join(' ');
}

/** Extracts the pressure curve alongside the path, in stroke/point order. */
export function strokesToPressureArray(strokes: Stroke[]): number[] {
  const pressures: number[] = [];
  for (const stroke of strokes) {
    for (const p of stroke.points) pressures.push(p.pressure);
  }
  return pressures;
}

function fmt(n: number): string {
  return Math.round(n * 100) / 100 + '';
}

export type { StrokePoint };
