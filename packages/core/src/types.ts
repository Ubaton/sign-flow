export type InputType = 'touch' | 'pen' | 'mouse';

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
  /** Milliseconds since the stroke started. */
  t: number;
  /** X velocity in pixels per second, derived from the previous point. */
  vx: number;
  /** Y velocity in pixels per second, derived from the previous point. */
  vy: number;
  /** Resultant speed in pixels per second. */
  speed: number;
}

export interface Stroke {
  points: StrokePoint[];
}

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface DeviceData {
  userAgent: string;
  inputType: InputType;
  pressureSupported: boolean;
}

/**
 * Payload submitted to POST /signatures. `date` and `projectId` are
 * assigned server-side — projectId is derived from the public key used
 * to authenticate the request.
 */
export interface SignatureSubmission {
  signature: string; // SVG path data
  location: GeoLocation | null;
  deviceData: DeviceData;
  siteUrl: string;
  pageName: string;
  createdBy: string;
  status?: string;
  statusTimeStamp?: string;
}

/** Full record as returned by the API. */
export interface SignatureRecord {
  id: string;
  signature: string;
  date: string;
  location: GeoLocation | null;
  deviceData: DeviceData;
  siteUrl: string;
  pageName: string;
  projectId: string;
  createdBy: string;
  status?: string;
  statusTimeStamp?: string;
  /** True if captured with a pk_test_/sk_test_ key. */
  isTest: boolean;
}
