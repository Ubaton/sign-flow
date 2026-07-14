import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import {
  SignatureCapture,
  requestGeolocation,
  SignClient,
  type SignatureRecord,
  type Stroke,
} from 'signflow-core';

export interface SignaturePadProps {
  /** Project public key (pk_live_... / pk_test_...). */
  publicKey: string;
  apiBaseUrl?: string;
  /** Identifier for the person signing, e.g. their email. */
  signerId: string;
  pageName: string;
  /** Ask for geolocation before submit. Defaults to false (opt-in). */
  collectLocation?: boolean;
  width?: number;
  height?: number;
  className?: string;
  onSubmit?: (record: SignatureRecord) => void;
  onError?: (error: Error) => void;
}

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
  submit: () => Promise<void>;
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad(props, ref) {
    const {
      publicKey,
      apiBaseUrl,
      signerId,
      pageName,
      collectLocation = false,
      width = 500,
      height = 200,
      className,
    } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const captureRef = useRef<SignatureCapture | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const capture = new SignatureCapture({
        element: canvas,
        onStrokeUpdate: (stroke: Stroke) => drawStroke(ctx, stroke),
      });
      captureRef.current = capture;

      return () => capture.destroy();
    }, []);

    useImperativeHandle(ref, () => ({
      clear() {
        captureRef.current?.clear();
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      },
      isEmpty() {
        return captureRef.current?.isEmpty() ?? true;
      },
      async submit() {
        const capture = captureRef.current;
        if (!capture || capture.isEmpty()) {
          throw new Error('Signature is empty');
        }

        const location = collectLocation ? await requestGeolocation() : null;
        const client = new SignClient({ apiKey: publicKey, baseUrl: apiBaseUrl });

        try {
          const record = await client.submitSignature({
            signature: capture.toSvgPath(),
            location,
            deviceData: capture.getDeviceData(),
            siteUrl: typeof window !== 'undefined' ? window.location.href : '',
            pageName,
            createdBy: signerId,
          });
          props.onSubmit?.(record);
        } catch (err) {
          props.onError?.(err as Error);
          throw err;
        }
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={{ touchAction: 'none', border: '1px solid currentColor' }}
      />
    );
  },
);

function drawStroke(ctx: CanvasRenderingContext2D | null | undefined, stroke: Stroke): void {
  if (!ctx || stroke.points.length < 2) return;
  const points = stroke.points;
  const from = points[points.length - 2]!;
  const to = points[points.length - 1]!;

  ctx.lineWidth = 1 + to.pressure * 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'currentColor';
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}
