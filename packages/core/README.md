# signflow-core

![SignFlow logo](https://raw.githubusercontent.com/Ubaton/sign-flow/main/apps/docs/public/signflow-white-logo.svg)

[![npm version](https://img.shields.io/npm/v/signflow-core.svg)](https://www.npmjs.com/package/signflow-core)
[![npm downloads](https://img.shields.io/npm/dw/signflow-core.svg)](https://www.npmjs.com/package/signflow-core)
[![bundle size](https://img.shields.io/bundlephobia/minzip/signflow-core)](https://bundlephobia.com/package/signflow-core)
[![license](https://img.shields.io/npm/l/signflow-core.svg)](./LICENSE)

Framework-agnostic signature capture: pointer/touch/pen event handling with
pressure and timing, SVG path export, opt-in geolocation, and a typed API
client for the SignFlow backend.

[Live demo](https://sign-flow-docs.vercel.app) · [Documentation](https://sign-flow-docs.vercel.app/docs) · [React wrapper](https://www.npmjs.com/package/signflow)

## Features

- **Vector, not raster** — strokes captured as SVG path data with a per-point pressure array, not a flattened image
- **Pressure & velocity aware** — reads native pointer pressure where supported, falls back gracefully on mouse-only input
- **Server-stamped timestamps** — `date` is assigned by the API, never trusted from the client, so records can't be backdated
- **Opt-in geolocation** — `location` is `null` unless the signer explicitly consents; nothing is collected silently
- **Framework-agnostic** — plain DOM, React, Vue, or anything else; [`signflow`](https://www.npmjs.com/package/signflow) is a thin React wrapper on top of this package
- **Zero runtime dependencies**, tree-shakeable ESM

## Install

```bash
npm install signflow-core
```

## Usage

```ts
import { SignatureCapture, SignClient } from 'signflow-core';

const capture = new SignatureCapture({ element: canvasEl });
// ...user draws...

const client = new SignClient({ apiKey: 'pk_live_...' });

const record = await client.submitSignature({
  signature: capture.toSvgPath(),
  location: null,
  deviceData: capture.getDeviceData(),
  siteUrl: location.href,
  pageName: 'agreement',
  createdBy: 'signer@example.com',
});

// record.id and record.date are assigned by the server —
// never trust a client-provided timestamp for a signature record.
```

Use a **test key** (`pk_test_...`) while developing. Submissions against a test
key are scoped separately from live (`pk_live_...`) data and can be wiped
without touching production records.

## API

### `SignatureCapture`

| Method | Returns | Description |
|---|---|---|
| `toSvgPath()` | `string` | The captured stroke(s) as SVG path data |
| `getDeviceData()` | `{ userAgent, inputType, pressureSupported }` | Input context captured during the stroke |
| `clear()` | `void` | Resets the canvas and discards the current capture |
| `isEmpty()` | `boolean` | Whether anything has been drawn yet |

### `SignClient`

| Method | Returns | Description |
|---|---|---|
| `submitSignature(payload)` | `Promise<SignatureRecord>` | Submits a captured signature, scoped to the project behind the public key |

Full request/response types are exported from `signflow-core`. See the
[API reference](https://sign-flow-docs.vercel.app/docs/api) for the complete
`SignatureRecord` shape.

## Requirements

- Pointer Events API (all evergreen browsers; no IE11 support)
- No build step required beyond your existing bundler — ships as ESM

## Compliance

Server-assigned timestamps and opt-in-only geolocation are built in, and both
support common signature-evidence requirements (POPIA/GDPR, ESIGN Act,
eIDAS). Whether your specific use case needs anything further — e.g., signer
identity verification beyond OAuth email — depends on your jurisdiction and
use case; confirm with counsel rather than treating this package alone as a
compliance guarantee. See the
[Security & Compliance guide](https://sign-flow-docs.vercel.app/docs/security)
for what's covered out of the box.

## Related

- [`signflow`](https://www.npmjs.com/package/signflow) — React wrapper (`<SignaturePad />`) built on this package
- [Self-hosted backend](https://sign-flow-docs.vercel.app/docs/self-hosting) — NestJS + PostgreSQL, deployed on your own infrastructure

## License

See [LICENSE](./LICENSE)