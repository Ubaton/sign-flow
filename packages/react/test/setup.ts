import { vi, beforeEach } from 'vitest';

/**
 * jsdom gaps that have to be filled before <SignaturePad /> can run at all.
 * Lives outside `src` so the `tsc` build never sees it.
 */

export interface FakeContext {
  calls: { method: string; args: unknown[] }[];
  strokeStyle: string;
  fillStyle: string;
  lineWidth: number;
  lineCap: string;
  lineJoin: string;
  setTransform: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
}

export function createFakeContext(): FakeContext {
  const calls: { method: string; args: unknown[] }[] = [];
  const record =
    (method: string) =>
    (...args: unknown[]) => {
      calls.push({ method, args });
    };

  return {
    calls,
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    setTransform: vi.fn(record('setTransform')),
    clearRect: vi.fn(record('clearRect')),
    beginPath: vi.fn(record('beginPath')),
    moveTo: vi.fn(record('moveTo')),
    lineTo: vi.fn(record('lineTo')),
    stroke: vi.fn(record('stroke')),
    arc: vi.fn(record('arc')),
    fill: vi.fn(record('fill')),
  };
}

/** The context handed to the most recently mounted canvas. */
export let lastContext: FakeContext | null = null;

/** Manually-driven ResizeObserver stub. */
export class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  callback: ResizeObserverCallback;
  observed: Element[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }
  observe(target: Element): void {
    this.observed.push(target);
  }
  unobserve(): void {}
  disconnect(): void {}

  /** Fire the observer as the browser would after a layout change. */
  trigger(): void {
    this.callback([], this as unknown as ResizeObserver);
  }
}

/** Sets the box the canvas reports, so `measure()` has real numbers. */
export function setElementBox(
  el: HTMLElement,
  box: { width: number; height: number },
): void {
  el.getBoundingClientRect = () =>
    ({
      width: box.width,
      height: box.height,
      top: 0,
      left: 0,
      right: box.width,
      bottom: box.height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
}

beforeEach(() => {
  MockResizeObserver.instances = [];
  lastContext = null;
});

// jsdom returns null from getContext without the optional `canvas` package.
// The context is cached per canvas so repeated getContext('2d') calls return
// the same object the component is drawing into — as a real browser does.
const contexts = new WeakMap<HTMLCanvasElement, FakeContext>();
HTMLCanvasElement.prototype.getContext = function getContext(this: HTMLCanvasElement) {
  let ctx = contexts.get(this);
  if (!ctx) {
    ctx = createFakeContext();
    contexts.set(this, ctx);
  }
  lastContext = ctx;
  return ctx as unknown as CanvasRenderingContext2D;
} as HTMLCanvasElement['getContext'];

// SignatureCapture calls setPointerCapture on every pointerdown; jsdom has
// neither method, so without these every stroke throws a TypeError.
Element.prototype.setPointerCapture = function setPointerCapture() {};
Element.prototype.releasePointerCapture = function releasePointerCapture() {};

globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
