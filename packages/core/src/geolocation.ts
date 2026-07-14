import type { GeoLocation } from './types.js';

/**
 * Requests geolocation via the browser API. Returns null on denial, error,
 * or absence of support — callers must treat null as a valid, final answer,
 * never retry silently. Consent UI is the caller's responsibility.
 */
export function requestGeolocation(
  options: PositionOptions = { timeout: 5000 },
): Promise<GeoLocation | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => resolve(null),
      options,
    );
  });
}
