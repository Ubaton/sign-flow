import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRef, act } from 'react';
import { render, cleanup } from '@testing-library/react';
import { SignaturePad, type SignaturePadHandle } from './SignaturePad.js';
import { SignatureEmptyError } from './errors.js';
import { MockResizeObserver, setElementBox, type FakeContext } from '../test/setup.js';

// Spy on the real class rather than replacing it: the tests exercise genuine
// stroke recording and SVG serialization, and only need construct/destroy
// call counts.
const constructSpy = vi.fn();
const destroySpy = vi.fn();

vi.mock('signflow-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('signflow-core')>();
  class SpiedCapture extends actual.SignatureCapture {
    constructor(options: ConstructorParameters<typeof actual.SignatureCapture>[0]) {
      super(options);
      constructSpy();
    }
    override destroy(): void {
      destroySpy();
      super.destroy();
    }
  }
  return { ...actual, SignatureCapture: SpiedCapture };
});

const BASE_PROPS = {
  publicKey: 'pk_test_abc',
  signerId: 'signer@example.com',
  pageName: 'agreement',
};

function getCanvas(): HTMLCanvasElement {
  const canvas = document.querySelector('canvas');
  if (!canvas) throw new Error('canvas not rendered');
  return canvas;
}

function ctxOf(canvas: HTMLCanvasElement): FakeContext {
  return canvas.getContext('2d') as unknown as FakeContext;
}

/**
 * jsdom has no PointerEvent constructor. SignatureCapture registers listeners
 * by type string, so a MouseEvent carrying the extra fields drives it fine.
 */
function pointer(type: string, x: number, y: number, pressure = 0.5): Event {
  const event = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true });
  Object.assign(event, { pointerId: 1, pointerType: 'pen', pressure });
  return event;
}

function draw(canvas: HTMLCanvasElement, points: [number, number][]): void {
  act(() => {
    const [first, ...rest] = points;
    canvas.dispatchEvent(pointer('pointerdown', first![0], first![1]));
    for (const [x, y] of rest) canvas.dispatchEvent(pointer('pointermove', x, y));
    const last = points[points.length - 1]!;
    canvas.dispatchEvent(pointer('pointerup', last[0], last[1]));
  });
}

beforeEach(() => {
  constructSpy.mockClear();
  destroySpy.mockClear();
  vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(2);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('capture lifecycle', () => {
  it('creates the capture engine once and never tears it down on prop changes', () => {
    // The load-bearing test for the effect design: recreating the instance
    // would silently erase the user's strokes, since they live inside it.
    const { rerender } = render(
      <SignaturePad {...BASE_PROPS} strokeColor="#f00" width={400} onChange={() => {}} />,
    );
    expect(constructSpy).toHaveBeenCalledTimes(1);

    rerender(
      <SignaturePad {...BASE_PROPS} strokeColor="#0f0" width={600} onChange={() => {}} />,
    );
    rerender(
      <SignaturePad {...BASE_PROPS} strokeColor="#00f" width={800} onChange={() => {}} />,
    );

    expect(constructSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).not.toHaveBeenCalled();
  });

  it('destroys the capture engine exactly once on unmount', () => {
    const { unmount } = render(<SignaturePad {...BASE_PROPS} />);
    unmount();
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  it('preserves strokes across a re-render', () => {
    const ref = createRef<SignaturePadHandle>();
    const { rerender } = render(<SignaturePad ref={ref} {...BASE_PROPS} strokeColor="#f00" />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });

    draw(canvas, [
      [10, 10],
      [20, 20],
    ]);
    expect(ref.current!.isEmpty()).toBe(false);

    rerender(<SignaturePad ref={ref} {...BASE_PROPS} strokeColor="#0f0" />);
    expect(ref.current!.isEmpty()).toBe(false);
  });
});

describe('sizing and DPR', () => {
  it('sets the bitmap from the content box scaled by devicePixelRatio', () => {
    render(<SignaturePad {...BASE_PROPS} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });

    act(() => MockResizeObserver.instances[0]!.trigger());

    // 1px default border on each side → 298 x 148 content box, at dpr 2.
    expect(canvas.width).toBe(596);
    expect(canvas.height).toBe(296);
  });

  it('applies width/height as CSS, never as the bitmap size', () => {
    render(<SignaturePad {...BASE_PROPS} width={640} height="50%" />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });
    act(() => MockResizeObserver.instances[0]!.trigger());

    expect(canvas.style.width).toBe('640px');
    expect(canvas.style.height).toBe('50%');
    // The bitmap tracks the measured content box × dpr — the `width` prop must
    // never become the buffer size, which is what broke DPR scaling before.
    expect(canvas.width).toBe(596);
    expect(canvas.width).not.toBe(640);
  });

  it('redraws every existing stroke after a resize', () => {
    render(<SignaturePad {...BASE_PROPS} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });
    const ctx = ctxOf(canvas);

    draw(canvas, [
      [10, 10],
      [20, 20],
      [30, 30],
      [40, 40],
      [50, 50],
    ]);

    ctx.calls.length = 0;
    setElementBox(canvas, { width: 500, height: 250 });
    act(() => MockResizeObserver.instances[0]!.trigger());

    // 5 pointer samples + the duplicate appended on pointerup → 5 segments.
    const lineTos = ctx.calls.filter((c) => c.method === 'lineTo');
    expect(lineTos.length).toBe(5);
    expect(ctx.calls.some((c) => c.method === 'clearRect')).toBe(true);
  });

  it('ignores an idle resize tick so a signature is never wiped', () => {
    render(<SignaturePad {...BASE_PROPS} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });
    const observer = MockResizeObserver.instances[0]!;

    act(() => observer.trigger());
    const ctx = ctxOf(canvas);
    ctx.calls.length = 0;

    act(() => observer.trigger()); // same size — must be a no-op
    expect(ctx.calls.filter((c) => c.method === 'clearRect')).toHaveLength(0);
  });

  it('offsets the transform by border and padding so ink lands under the pointer', () => {
    render(<SignaturePad {...BASE_PROPS} style={{ borderWidth: '4px', padding: '6px' }} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });

    act(() => MockResizeObserver.instances[0]!.trigger());

    const ctx = ctxOf(canvas);
    const transform = ctx.setTransform.mock.calls.at(-1);
    // dpr 2, offset 10px (4 border + 6 padding) → translate -20.
    expect(transform).toEqual([2, 0, 0, 2, -20, -20]);
  });
});

describe('stroke color', () => {
  it('uses the inherited computed CSS color when no strokeColor is given', () => {
    render(<SignaturePad {...BASE_PROPS} style={{ color: 'rgb(255, 0, 0)' }} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });

    act(() => MockResizeObserver.instances[0]!.trigger());

    expect(ctxOf(canvas).strokeStyle).toBe('rgb(255, 0, 0)');
  });

  it('lets an explicit strokeColor win over inherited color', () => {
    render(<SignaturePad {...BASE_PROPS} strokeColor="#0f0" style={{ color: 'rgb(255, 0, 0)' }} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });

    act(() => MockResizeObserver.instances[0]!.trigger());

    expect(ctxOf(canvas).strokeStyle).toBe('#0f0');
  });

  it('repaints when the color prop changes', () => {
    const { rerender } = render(<SignaturePad {...BASE_PROPS} strokeColor="#f00" />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });

    rerender(<SignaturePad {...BASE_PROPS} strokeColor="#00f" />);

    expect(ctxOf(canvas).strokeStyle).toBe('#00f');
  });

  it('repaints when the inherited CSS color changes, which no prop reflects', () => {
    // Regression: watching only `strokeColor` left both existing and new
    // strokes on the stale color when a themed parent changed `color`.
    const { rerender } = render(<SignaturePad {...BASE_PROPS} style={{ color: 'rgb(255, 0, 0)' }} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });
    act(() => MockResizeObserver.instances[0]!.trigger());
    expect(ctxOf(canvas).strokeStyle).toBe('rgb(255, 0, 0)');

    rerender(<SignaturePad {...BASE_PROPS} style={{ color: 'rgb(0, 128, 0)' }} />);

    expect(ctxOf(canvas).strokeStyle).toBe('rgb(0, 128, 0)');
  });

  it('does not repaint when nothing style-related changed', () => {
    const { rerender } = render(<SignaturePad {...BASE_PROPS} strokeColor="#f00" />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });
    act(() => MockResizeObserver.instances[0]!.trigger());

    const ctx = ctxOf(canvas);
    ctx.calls.length = 0;
    // A new inline arrow every render must not look like a style change.
    rerender(<SignaturePad {...BASE_PROPS} strokeColor="#f00" lineWidth={(p) => 1 + p} />);
    ctx.calls.length = 0;
    rerender(<SignaturePad {...BASE_PROPS} strokeColor="#f00" lineWidth={(p) => 1 + p} />);

    expect(ctx.calls.filter((c) => c.method === 'clearRect')).toHaveLength(0);
  });
});

describe('onChange', () => {
  it('fires once per completed stroke, not per pointermove', () => {
    const onChange = vi.fn();
    render(<SignaturePad {...BASE_PROPS} onChange={onChange} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });

    draw(canvas, [
      [10, 10],
      [20, 20],
      [30, 30],
      [40, 40],
    ]);

    expect(onChange).toHaveBeenCalledTimes(1);
    const event = onChange.mock.calls[0]![0];
    expect(event.isEmpty).toBe(false);
    expect(event.strokeCount).toBe(1);
    expect(event.svgPath).toMatch(/^M/);
  });

  it('reports the same path the handle would submit', () => {
    const onChange = vi.fn();
    const ref = createRef<SignaturePadHandle>();
    render(<SignaturePad ref={ref} {...BASE_PROPS} onChange={onChange} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });

    draw(canvas, [
      [10, 10],
      [20, 20],
    ]);

    expect(onChange.mock.calls[0]![0].svgPath).toBe(ref.current!.toSvgPath());
  });

  it('fires with an empty payload on clear()', () => {
    const onChange = vi.fn();
    const ref = createRef<SignaturePadHandle>();
    render(<SignaturePad ref={ref} {...BASE_PROPS} onChange={onChange} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });

    draw(canvas, [
      [10, 10],
      [20, 20],
    ]);
    onChange.mockClear();

    act(() => ref.current!.clear());

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0]).toEqual({ svgPath: '', isEmpty: true, strokeCount: 0 });
    expect(ref.current!.isEmpty()).toBe(true);
    expect(ctxOf(canvas).calls.some((c) => c.method === 'clearRect')).toBe(true);
  });
});

describe('imperative handle', () => {
  it('returns a copy of the strokes, not the engine internals', () => {
    const ref = createRef<SignaturePadHandle>();
    render(<SignaturePad ref={ref} {...BASE_PROPS} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });

    draw(canvas, [
      [10, 10],
      [20, 20],
    ]);

    const first = ref.current!.getStrokes();
    first.push({ points: [] });
    first[0]!.points.push({ x: 999, y: 999, pressure: 1, t: 0, vx: 0, vy: 0, speed: 0 });

    const second = ref.current!.getStrokes();
    expect(second).toHaveLength(1);
    expect(second[0]!.points.some((p) => p.x === 999)).toBe(false);
  });

  it('exposes the canvas element', () => {
    const ref = createRef<SignaturePadHandle>();
    render(<SignaturePad ref={ref} {...BASE_PROPS} />);
    expect(ref.current!.getCanvas()).toBe(getCanvas());
  });
});

describe('submit', () => {
  it('rejects with SignatureEmptyError and still notifies onError', async () => {
    const onError = vi.fn();
    const ref = createRef<SignaturePadHandle>();
    render(<SignaturePad ref={ref} {...BASE_PROPS} onError={onError} />);

    await expect(ref.current!.submit()).rejects.toBeInstanceOf(SignatureEmptyError);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toBeInstanceOf(SignatureEmptyError);
  });

  it('sends the latest props, not the ones captured at mount', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: 'sig_1' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const ref = createRef<SignaturePadHandle>();
    const { rerender } = render(<SignaturePad ref={ref} {...BASE_PROPS} signerId="a@example.com" />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });
    draw(canvas, [
      [10, 10],
      [20, 20],
    ]);

    rerender(<SignaturePad ref={ref} {...BASE_PROPS} signerId="b@example.com" />);
    await act(async () => {
      await ref.current!.submit();
    });

    const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
    expect(body.createdBy).toBe('b@example.com');
  });

  it('de-dupes concurrent calls so a double-click cannot double-post', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ id: 'sig_1' }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const ref = createRef<SignaturePadHandle>();
    render(<SignaturePad ref={ref} {...BASE_PROPS} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });
    draw(canvas, [
      [10, 10],
      [20, 20],
    ]);

    await act(async () => {
      await Promise.all([ref.current!.submit(), ref.current!.submit()]);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('resolves with the created record', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ id: 'sig_42' }), { status: 200 })),
    );

    const ref = createRef<SignaturePadHandle>();
    render(<SignaturePad ref={ref} {...BASE_PROPS} />);
    const canvas = getCanvas();
    setElementBox(canvas, { width: 300, height: 150 });
    draw(canvas, [
      [10, 10],
      [20, 20],
    ]);

    let record: { id: string } | undefined;
    await act(async () => {
      record = await ref.current!.submit();
    });
    expect(record!.id).toBe('sig_42');
  });
});
