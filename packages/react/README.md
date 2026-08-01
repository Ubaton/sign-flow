# signflow

![SignFlow logo](https://raw.githubusercontent.com/Ubaton/sign-flow/main/apps/docs/public/signflow-white-logo.svg)

[![npm version](https://img.shields.io/npm/v/signflow.svg)](https://www.npmjs.com/package/signflow)
[![npm downloads](https://img.shields.io/npm/dw/signflow.svg)](https://www.npmjs.com/package/signflow)
[![bundle size](https://img.shields.io/bundlephobia/minzip/signflow)](https://bundlephobia.com/package/signflow)
[![license](https://img.shields.io/npm/l/signflow.svg)](./LICENSE)

React `<SignaturePad />` for SignFlow — a self-hosted e-signature SDK. Wraps the
framework-agnostic capture engine in [`signflow-core`](https://www.npmjs.com/package/signflow-core).

[Live demo](https://sign-flow-docs.vercel.app/demo) · [Documentation](https://sign-flow-docs.vercel.app/docs) · [API reference](https://sign-flow-docs.vercel.app/docs/api)

## Features

- **Vector, not raster** — strokes captured as SVG path data with per-point pressure, not a flattened image
- **Sharp on any display** — the canvas tracks its rendered size and `devicePixelRatio` automatically
- **Themeable** — ink defaults to the inherited CSS `color`, so it fits your design system with no configuration
- **Pressure-aware line width** — reads native pointer pressure, with a sensible fallback for mice
- **Touch, pen, and mouse** — one unified pointer model
- **Opt-in geolocation** — never collected unless you ask for it

## Install

```bash
npm install signflow
```

`react` (18 or 19) is a peer dependency. `signflow-core` is installed for you.

## Usage

```tsx
import { SignaturePad } from 'signflow';

export function AgreementPage() {
  return (
    <SignaturePad
      publicKey="pk_live_..."
      pageName="master-services-agreement"
      signerId="client@example.com"
      collectLocation
      onSubmit={(record) => console.log(record.id)}
    />
  );
}
```

Get a `publicKey` by creating a project in your dashboard. Use a **test key**
(`pk_test_...`) while developing — those submissions are scoped separately from
live data.

### Submitting

Submission is driven through a ref, so you control the button and its state:

```tsx
import { useRef, useState } from 'react';
import { SignaturePad, SignatureEmptyError, type SignaturePadHandle } from 'signflow';

export function SignForm() {
  const pad = useRef<SignaturePadHandle>(null);
  const [empty, setEmpty] = useState(true);

  async function handleSubmit() {
    try {
      const record = await pad.current?.submit();
      console.log('stored as', record?.id);
    } catch (err) {
      if (err instanceof SignatureEmptyError) return; // user drew nothing
      throw err;
    }
  }

  return (
    <>
      <SignaturePad
        ref={pad}
        publicKey="pk_test_..."
        signerId="client@example.com"
        pageName="agreement"
        onChange={(e) => setEmpty(e.isEmpty)}
      />
      <button onClick={() => pad.current?.clear()} disabled={empty}>Clear</button>
      <button onClick={handleSubmit} disabled={empty}>Submit</button>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `publicKey` | `string` | — | **Required.** Project public key (`pk_live_...` / `pk_test_...`) |
| `signerId` | `string` | — | **Required.** Who is signing, e.g. their email |
| `pageName` | `string` | — | **Required.** Label for what is being signed |
| `apiBaseUrl` | `string` | hosted API | Point at your own instance when self-hosting |
| `collectLocation` | `boolean` | `false` | Request geolocation before submitting |
| `width` | `number \| string` | `500` | CSS width; numbers are px |
| `height` | `number \| string` | `200` | CSS height; numbers are px |
| `strokeColor` | `string` | inherited `color` | Ink color |
| `lineWidth` | `number \| ((pressure: number) => number)` | `p => 1 + p * 3` | Constant width, or a pressure curve |
| `onChange` | `(e: SignatureChangeEvent) => void` | — | Fires when a stroke completes and on `clear()` |
| `onSubmit` | `(record: SignatureRecord) => void` | — | Fires after a successful submission |
| `onError` | `(error: Error) => void` | — | Fires on any submission failure |

Any other canvas attribute (`id`, `className`, `style`, `data-*`, `aria-*`) is
passed straight through.

`onChange` receives `{ svgPath, isEmpty, strokeCount }`. It fires **once per
completed stroke**, not on every pointer move — re-serializing the path on each
move is quadratic over a signature. For live per-move output, use
`signflow-core` directly.

## Imperative handle

| Method | Returns | Description |
|---|---|---|
| `submit()` | `Promise<SignatureRecord>` | Submits the signature. Rejects with `SignatureEmptyError` if nothing was drawn. Concurrent calls share one request |
| `clear()` | `void` | Clears strokes and pixels, then fires `onChange` |
| `isEmpty()` | `boolean` | Whether anything has been drawn |
| `toSvgPath()` | `string` | Current path data |
| `getStrokes()` | `Stroke[]` | A copy of the raw stroke/pressure data |
| `getDeviceData()` | `DeviceData \| null` | Input type, pressure support, user agent |
| `getCanvas()` | `HTMLCanvasElement \| null` | The canvas, e.g. for `toDataURL()` PNG export |
| `redraw()` | `void` | Repaint with freshly-read CSS (see Theming) |

## Sizing

The canvas is sized by CSS and tracks its own rendered box, so strokes stay
aligned with the pointer and stay sharp on HiDPI screens.

```tsx
<SignaturePad width={640} height={240} />        {/* fixed */}
<SignaturePad width="100%" height="100%" />      {/* fills a sized parent */}
```

> **Always leave the canvas with a CSS size.** `width`/`height` default to
> `500`/`200` precisely so this holds. If you override them to `undefined` and
> supply no CSS size of your own, the canvas falls back to its intrinsic size
> and the resize loop can feed itself.

## Theming

Ink defaults to the element's computed CSS `color`, so it inherits like any
text:

```tsx
<div className="text-emerald-600">
  <SignaturePad {...props} />          {/* draws emerald */}
</div>

<SignaturePad {...props} strokeColor="#e11d48" />   {/* explicit wins */}
```

Changing the color through React — the `strokeColor` prop, or a parent's own
`color` — repaints existing strokes automatically, so a theme toggle needs no
extra work.

The one case it can't detect is a theme that switches via **CSS alone**, with no
React render at all (a `dark` class toggled on `<html>` by an inline script, for
example). There is nothing to re-run the component, so call `redraw()` yourself:

```tsx
useEffect(() => { pad.current?.redraw(); }, [theme]);
```

## Accessibility

The canvas ships with `aria-label="Signature pad"` (override via the `aria-label`
prop). It is intentionally **not** focusable: a focusable control with no
keyboard operation fails WCAG 2.1.1. If you need an accessible path, offer a
type-your-name alternative alongside the pad.

## Requirements

- React 18 or 19
- Pointer Events API (all evergreen browsers; no IE11)
- ESM only — no build step beyond your existing bundler

## Related

- [`signflow-core`](https://www.npmjs.com/package/signflow-core) — the framework-agnostic capture engine underneath this package
- [Self-hosted backend](https://sign-flow-docs.vercel.app/docs/self-hosting) — NestJS + PostgreSQL on your own infrastructure
- [Security & Compliance](https://sign-flow-docs.vercel.app/docs/security) — timestamps, geolocation consent, key rotation

## License

See [LICENSE](./LICENSE)
