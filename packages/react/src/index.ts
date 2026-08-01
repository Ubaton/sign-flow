export { SignaturePad } from './SignaturePad.js';
export type {
  SignaturePadProps,
  SignaturePadHandle,
  SignatureChangeEvent,
} from './SignaturePad.js';
export { SignatureEmptyError } from './errors.js';
export type { LineWidth } from './canvas.js';

// Re-exported so consumers can type their handlers without reaching into a
// transitive dependency — `onSubmit` hands back a SignatureRecord, and the
// imperative handle returns Stroke/DeviceData.
export type {
  DeviceData,
  GeoLocation,
  InputType,
  SignatureRecord,
  SignatureSubmission,
  Stroke,
  StrokePoint,
} from 'signflow-core';
