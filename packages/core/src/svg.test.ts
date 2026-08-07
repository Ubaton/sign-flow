import { describe, expect, it } from 'vitest';
import { strokesToPath, strokesToPressureArray, strokesToSpeedArray } from './svg.js';

describe('strokesToPath', () => {
  it('returns empty string for no strokes', () => {
    expect(strokesToPath([])).toBe('');
  });

  it('renders a single point as a degenerate line', () => {
    const path = strokesToPath([{ points: [{ x: 1, y: 2, pressure: 0.5, t: 0, vx: 0, vy: 0, speed: 0 }] }]);
    expect(path).toBe('M 1 2 L 1 2');
  });

  it('renders a multi-point stroke with quadratic smoothing', () => {
    const path = strokesToPath([
      {
        points: [
          { x: 0, y: 0, pressure: 0.5, t: 0, vx: 0, vy: 0, speed: 0 },
          { x: 10, y: 10, pressure: 0.5, t: 10, vx: 0, vy: 0, speed: 0 },
          { x: 20, y: 0, pressure: 0.5, t: 20, vx: 0, vy: 0, speed: 0 },
        ],
      },
    ]);
    expect(path).toContain('M 0 0');
    expect(path).toContain('Q 10 10 15 5');
    expect(path).toContain('L 20 0');
  });

  it('joins multiple strokes as separate subpaths', () => {
    const path = strokesToPath([
      { points: [{ x: 0, y: 0, pressure: 0.5, t: 0, vx: 0, vy: 0, speed: 0 }] },
      { points: [{ x: 5, y: 5, pressure: 0.5, t: 0, vx: 0, vy: 0, speed: 0 }] },
    ]);
    expect(path).toBe('M 0 0 L 0 0 M 5 5 L 5 5');
  });
});

describe('strokesToPressureArray', () => {
  it('flattens pressure values in order', () => {
    const pressures = strokesToPressureArray([
      {
        points: [
          { x: 0, y: 0, pressure: 0.3, t: 0, vx: 0, vy: 0, speed: 0 },
          { x: 1, y: 1, pressure: 0.6, t: 1, vx: 0, vy: 0, speed: 0 },
        ],
      },
      { points: [{ x: 2, y: 2, pressure: 0.9, t: 0, vx: 0, vy: 0, speed: 0 }] },
    ]);
    expect(pressures).toEqual([0.3, 0.6, 0.9]);
  });
});

describe('strokesToSpeedArray', () => {
  it('flattens speed values in order', () => {
    const speeds = strokesToSpeedArray([
      {
        points: [
          { x: 0, y: 0, pressure: 0.3, t: 0, vx: 0, vy: 0, speed: 0 },
          { x: 10, y: 0, pressure: 0.3, t: 100, vx: 100, vy: 0, speed: 100 },
        ],
      },
      { points: [{ x: 15, y: 5, pressure: 0.4, t: 200, vx: 0, vy: 0, speed: 0 }] },
    ]);
    expect(speeds).toEqual([0, 100, 0]);
  });
});
