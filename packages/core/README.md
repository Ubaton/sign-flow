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

> **`SignatureCapture` records strokes — it never draws them.** It is a class,
> constructed against a live element, not a component you can render. Rendering,
> canvas sizing, and `devicePixelRatio` handling are the caller's job. If you're
> in React, use [`signflow`](https://www.npmjs.com/package/signflow) instead —
> it does all of that for you (see [Using it in React](#using-it-in-react)).

## Using it in React

```bash
npm install signflow
```

```tsx
import { SignaturePad } from 'signflow';

<SignaturePad
  publicKey="pk_test_..."
  signerId="client@example.com"
  pageName="agreement"
  onChange={(e) => console.log(e.svgPath)}
/>
```

`<SignaturePad />` wraps this package: it owns the canvas, draws each stroke as
it is captured, tracks size and DPR, resolves ink color from your CSS, and
exposes `submit()` / `clear()` through a ref. Full documentation in the
[`signflow` README](https://www.npmjs.com/package/signflow).

## API

### `SignatureCapture`

Constructed with `{ element, onStrokeStart?, onStrokeUpdate?, onStrokeEnd? }`.
Pointer listeners attach immediately, and the element's `touch-action` is set to
`none`.

| Method | Returns | Description |
|---|---|---|
| `toSvgPath()` | `string` | The captured stroke(s) as SVG path data |
| `getStrokes()` | `Stroke[]` | Raw stroke data — each point carries `x`, `y`, `pressure`, and a stroke-relative `t` |
| `getDeviceData()` | `{ userAgent, inputType, pressureSupported }` | Input context captured during the stroke |
| `isEmpty()` | `boolean` | Whether anything has been drawn yet |
| `clear()` | `void` | Discards all recorded strokes. Does **not** clear canvas pixels — repaint those yourself |
| `destroy()` | `void` | Removes the pointer listeners. One-way: construct a new instance to capture again |

### `SignClient`

Constructed with `{ apiKey, baseUrl? }`. `baseUrl` defaults to the hosted API —
pass your own origin when [self-hosting](https://sign-flow-docs.vercel.app/docs/self-hosting),
or submissions will silently go to the default backend. Keys are sent as
`Authorization: Bearer <key>`.

| Method | Returns | Key | Description |
|---|---|---|---|
| `submitSignature(payload)` | `Promise<SignatureRecord>` | public | Submits a signature, scoped to the project behind the key |
| `getSignature(id)` | `Promise<SignatureRecord>` | secret | Fetches one record |
| `listSignatures(projectId)` | `Promise<SignatureRecord[]>` | secret | Lists a project's records |
| `deleteSignature(id)` | `Promise<void>` | secret | Deletes a record (right-to-erasure) |

Secret keys (`sk_...`) are server-only — never ship one to the browser.

### Helpers

| Export | Description |
|---|---|
| `strokesToPath(strokes)` | Serializes strokes to SVG path data (what `toSvgPath()` uses) |
| `strokesToPressureArray(strokes)` | Flattens per-point pressure, e.g. for a pressure curve |
| `requestGeolocation(options?)` | Resolves a `GeoLocation` or `null`. Never rejects — a declined prompt is `null` |

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