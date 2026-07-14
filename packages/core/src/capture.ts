import type { DeviceData, InputType, Stroke, StrokePoint } from './types.js';
import { strokesToPath } from './svg.js';

export interface SignatureCaptureOptions {
  /** Element to attach pointer listeners to (e.g. a <canvas> or <svg>). */
  element: HTMLElement;
  onStrokeStart?: (stroke: Stroke) => void;
  onStrokeUpdate?: (stroke: Stroke) => void;
  onStrokeEnd?: (stroke: Stroke) => void;
}

/**
 * Captures pointer/touch/pen input as a series of strokes with pressure
 * and timing data. Framework-agnostic — wrap this in a React/Vue/etc.
 * component for a ready-made widget.
 */
export class SignatureCapture {
  private readonly element: HTMLElement;
  private readonly strokes: Stroke[] = [];
  private activeStroke: Stroke | null = null;
  private strokeStartTime = 0;
  private inputType: InputType = 'mouse';
  private pressureSupported = false;
  private readonly options: SignatureCaptureOptions;

  constructor(options: SignatureCaptureOptions) {
    this.options = options;
    this.element = options.element;
    this.attach();
  }

  private attach(): void {
    this.element.addEventListener('pointerdown', this.handlePointerDown);
    this.element.addEventListener('pointermove', this.handlePointerMove);
    this.element.addEventListener('pointerup', this.handlePointerUp);
    this.element.addEventListener('pointercancel', this.handlePointerUp);
    this.element.style.touchAction = 'none';
  }

  destroy(): void {
    this.element.removeEventListener('pointerdown', this.handlePointerDown);
    this.element.removeEventListener('pointermove', this.handlePointerMove);
    this.element.removeEventListener('pointerup', this.handlePointerUp);
    this.element.removeEventListener('pointercancel', this.handlePointerUp);
  }

  private handlePointerDown = (e: PointerEvent): void => {
    this.element.setPointerCapture(e.pointerId);
    this.inputType = toInputType(e.pointerType);
    this.pressureSupported = e.pressure !== 0.5 && e.pressure !== 0;
    this.strokeStartTime = performance.now();

    this.activeStroke = { points: [this.pointFromEvent(e)] };
    this.strokes.push(this.activeStroke);
    this.options.onStrokeStart?.(this.activeStroke);
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (!this.activeStroke) return;
    if (e.pressure && e.pressure !== 0.5) this.pressureSupported = true;
    this.activeStroke.points.push(this.pointFromEvent(e));
    this.options.onStrokeUpdate?.(this.activeStroke);
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (!this.activeStroke) return;
    this.activeStroke.points.push(this.pointFromEvent(e));
    this.options.onStrokeEnd?.(this.activeStroke);
    this.activeStroke = null;
  };

  private pointFromEvent(e: PointerEvent): StrokePoint {
    const rect = this.element.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
      t: performance.now() - this.strokeStartTime,
    };
  }

  getStrokes(): Stroke[] {
    return this.strokes;
  }

  isEmpty(): boolean {
    return this.strokes.length === 0;
  }

  clear(): void {
    this.strokes.length = 0;
    this.activeStroke = null;
  }

  toSvgPath(): string {
    return strokesToPath(this.strokes);
  }

  getDeviceData(): DeviceData {
    return {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      inputType: this.inputType,
      pressureSupported: this.pressureSupported,
    };
  }
}

function toInputType(pointerType: string): InputType {
  if (pointerType === 'touch') return 'touch';
  if (pointerType === 'pen') return 'pen';
  return 'mouse';
}
