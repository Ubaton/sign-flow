import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
  type CanvasHTMLAttributes,
} from 'react';
import {
  SignatureCapture,
  requestGeolocation,
  SignClient,
  type DeviceData,
  type SignatureRecord,
  type Stroke,
} from 'signflow-core';
import {
  drawLastSegment,
  measure,
  computeBufferSize,
  paintAll,
  resolveStrokeColor,
  type Geometry,
  type LineWidth,
} from './canvas.js';
import { SignatureEmptyError } from './errors.js';

export interface SignatureChangeEvent {
  /** SVG path data — byte-identical to what `submit()` sends. */
  svgPath: string;
  isEmpty: boolean;
  strokeCount: number;
}

export interface SignaturePadProps
  extends Omit<
    CanvasHTMLAttributes<HTMLCanvasElement>,
    'width' | 'height' | 'onChange' | 'onSubmit' | 'onError' | 'children'
  > {
  /** Project public key (pk_live_... / pk_test_...). */
  publicKey: string;
  apiBaseUrl?: string;
  /** Identifier for the person signing, e.g. their email. */
  signerId: string;
  pageName: string;
  /** Optional sign status label, e.g. 'signed' or 'approved'. */
  status?: string;
  /** Optional status timestamp in string form, e.g. ISO 8601. */
  statusTimeStamp?: string;
  /** Ask for geolocation before submit. Defaults to false (opt-in). */
  collectLocation?: boolean;
  /** CSS width. Numbers are treated as px. Use '100%' to fill a sized parent. */
  width?: number | string;
  /** CSS height. Numbers are treated as px. */
  height?: number | string;
  /** Ink color. Defaults to the element's inherited CSS `color`. */
  strokeColor?: string;
  /** Constant width, or a pressure→width function. Defaults to `p => 1 + p * 3`. */
  lineWidth?: LineWidth;
  /** Fires when a stroke completes and when `clear()` is called. */
  onChange?: (event: SignatureChangeEvent) => void;
  onSubmit?: (record: SignatureRecord) => void;
  onError?: (error: Error) => void;
}

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
  submit: () => Promise<SignatureRecord>;
  toSvgPath: () => string;
  getDeviceData: () => DeviceData | null;
  /** Returns a copy — never the capture engine's internal array. */
  getStrokes: () => Stroke[];
  /** The underlying canvas, e.g. for `toDataURL()` PNG export. */
  getCanvas: () => HTMLCanvasElement | null;
  /** Repaint with freshly-read CSS. Needed after a CSS-only theme change. */
  redraw: () => void;
}

const toCssSize = (value: number | string): string =>
  typeof value === 'number' ? `${value}px` : value;

/** Collapses a function-valued lineWidth to a stable key so an inline arrow
 *  (new identity every render) doesn't look like a style change. */
const lineWidthKeyOf = (lineWidth: LineWidth | undefined): number | string =>
  typeof lineWidth === 'number' ? lineWidth : 'fn';

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad(props, ref) {
    const {
      publicKey,
      apiBaseUrl,
      signerId,
      pageName,
      status,
      statusTimeStamp,
      collectLocation = false,
      width = 500,
      height = 200,
      strokeColor,
      lineWidth,
      onChange,
      onSubmit,
      onError,
      style,
      ...rest
    } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const captureRef = useRef<SignatureCapture | null>(null);
    const inFlightRef = useRef<Promise<SignatureRecord> | null>(null);
    // What the currently-painted pixels were drawn with, so a restyle can be
    // detected without diffing props that don't capture inherited CSS.
    const paintedStyleRef = useRef<{ color: string; lineWidthKey: number | string } | null>(null);

    // Mirror of the current props, refreshed after every commit. This is what
    // lets the effects below use empty dep arrays without reading stale
    // values — assigning during render would not be concurrent-safe.
    const latest = useRef({
      publicKey,
      apiBaseUrl,
      signerId,
      pageName,
      status,
      statusTimeStamp,
      collectLocation,
      strokeColor,
      lineWidth,
      onChange,
      onSubmit,
      onError,
    });
    useEffect(() => {
      latest.current = {
        publicKey,
        apiBaseUrl,
        signerId,
        pageName,
        status,
        statusTimeStamp,
        collectLocation,
        strokeColor,
        lineWidth,
        onChange,
        onSubmit,
        onError,
      };
    });

    const emitChange = useCallback(() => {
      const capture = captureRef.current;
      if (!capture) return;
      latest.current.onChange?.({
        svgPath: capture.toSvgPath(),
        isEmpty: capture.isEmpty(),
        strokeCount: capture.getStrokes().length,
      });
    }, []);

    /** Re-measures and repaints without touching the bitmap size. */
    const redraw = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (!canvas || !ctx) return;
      const geometry = measure(canvas, latest.current.strokeColor);
      paintedStyleRef.current = { color: geometry.color, lineWidthKey: lineWidthKeyOf(latest.current.lineWidth) };
      paintAll(
        ctx,
        canvas,
        geometry,
        window.devicePixelRatio || 1,
        captureRef.current?.getStrokes() ?? [],
        latest.current.lineWidth,
      );
    }, []);

    // Create the capture engine and the size observer exactly once.
    //
    // The empty dep array is mandatory, not an optimization: SignatureCapture
    // attaches its pointer listeners synchronously in the constructor and
    // `destroy()` is one-way with no re-attach, and the strokes live inside
    // the instance — so recreating it when a callback or color prop changed
    // would silently erase the user's signature mid-stroke. Everything
    // prop-derived is read from `latest` at call time instead.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        latest.current.onError?.(new Error('Canvas 2D context is unavailable'));
        return;
      }
      ctxRef.current = ctx;

      const capture = new SignatureCapture({
        element: canvas,
        onStrokeUpdate: (stroke) => drawLastSegment(ctx, stroke, latest.current.lineWidth),
        onStrokeEnd: (stroke) => {
          // `handlePointerUp` appends a final point after the last
          // pointermove, so the closing segment is only drawable here.
          drawLastSegment(ctx, stroke, latest.current.lineWidth);
          emitChange();
        },
      });
      captureRef.current = capture;

      const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        const geometry: Geometry = measure(canvas, latest.current.strokeColor);
        const bufferWidth = computeBufferSize(geometry.contentWidth, dpr);
        const bufferHeight = computeBufferSize(geometry.contentHeight, dpr);

        // Assigning width/height always wipes the bitmap, even when assigning
        // the same value — so an idle observer tick must not reach that far.
        if (canvas.width === bufferWidth && canvas.height === bufferHeight) return;

        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
        paintedStyleRef.current = {
          color: geometry.color,
          lineWidthKey: lineWidthKeyOf(latest.current.lineWidth),
        };
        paintAll(ctx, canvas, geometry, dpr, capture.getStrokes(), latest.current.lineWidth);
      };

      resize();

      let observer: ResizeObserver | undefined;
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(resize);
        observer.observe(canvas);
      } else {
        window.addEventListener('resize', resize);
      }

      return () => {
        if (observer) observer.disconnect();
        else window.removeEventListener('resize', resize);
        capture.destroy();
        captureRef.current = null;
        ctxRef.current = null;
      };
    }, [emitChange]);

    // Already-painted pixels hold the old style, so a restyle needs a full
    // repaint. This runs after every commit and compares the *resolved* style
    // rather than the props: the ink color can come from inherited CSS, so a
    // parent changing its own `color` is a real change that no prop reflects.
    // The comparison makes it a no-op in the common case.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !ctxRef.current) return;
      const painted = paintedStyleRef.current;
      const color = resolveStrokeColor(getComputedStyle(canvas), latest.current.strokeColor);
      const key = lineWidthKeyOf(latest.current.lineWidth);
      if (painted && painted.color === color && painted.lineWidthKey === key) return;
      redraw();
    });

    // Deps can be empty because every prop is read through `latest`. The
    // previous version had no dep array at all, which rebuilt the handle on
    // every render and churned consumers' callback refs.
    useImperativeHandle(
      ref,
      (): SignaturePadHandle => ({
        clear() {
          captureRef.current?.clear();
          // Routing through redraw (with strokes now empty) keeps one paint
          // path and preserves the transform/style invariants.
          redraw();
          emitChange();
        },
        isEmpty() {
          return captureRef.current?.isEmpty() ?? true;
        },
        toSvgPath() {
          return captureRef.current?.toSvgPath() ?? '';
        },
        getDeviceData() {
          return captureRef.current?.getDeviceData() ?? null;
        },
        getStrokes() {
          const strokes = captureRef.current?.getStrokes() ?? [];
          return strokes.map((stroke) => ({ points: [...stroke.points] }));
        },
        getCanvas() {
          return canvasRef.current;
        },
        redraw,
        submit() {
          const pending = inFlightRef.current;
          // A double-clicked submit button must not post the signature twice.
          if (pending) return pending;

          const run = (async (): Promise<SignatureRecord> => {
            const {
              publicKey: key,
              apiBaseUrl: baseUrl,
              signerId: createdBy,
              pageName: page,
              status,
              statusTimeStamp,
              collectLocation: wantsLocation,
              onSubmit: handleSubmit,
              onError: handleError,
            } = latest.current;

            try {
              const capture = captureRef.current;
              if (!capture || capture.isEmpty()) throw new SignatureEmptyError();

              const location = wantsLocation ? await requestGeolocation() : null;
              const client = new SignClient({ apiKey: key, baseUrl });
              const record = await client.submitSignature({
                signature: capture.toSvgPath(),
                location,
                deviceData: capture.getDeviceData(),
                siteUrl: typeof window !== 'undefined' ? window.location.href : '',
                pageName: page,
                createdBy,
                status,
                statusTimeStamp,
              });
              handleSubmit?.(record);
              return record;
            } catch (err) {
              const error = err instanceof Error ? err : new Error(String(err));
              handleError?.(error);
              throw error;
            } finally {
              inFlightRef.current = null;
            }
          })();

          inFlightRef.current = run;
          return run;
        },
      }),
      [emitChange, redraw],
    );

    return (
      <canvas
        ref={canvasRef}
        aria-label="Signature pad"
        {...rest}
        style={{
          touchAction: 'none',
          border: '1px solid currentColor',
          ...style,
          // Width/height are CSS, not bitmap attributes: the ResizeObserver is
          // the single source of truth for geometry. They are applied after
          // `style` so the dedicated props always win, and an explicit CSS size
          // is always present — a canvas with none would take its intrinsic
          // size from the width attribute this component writes, and the
          // observer would feed itself.
          width: toCssSize(width),
          height: toCssSize(height),
        }}
      />
    );
  },
);
