export type InputType = 'touch' | 'pen' | 'mouse';

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
  /** Milliseconds since the stroke started. */
  t: number;
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
  /** True if captured with a pk_test_/sk_test_ key. */
  isTest: boolean;
}
