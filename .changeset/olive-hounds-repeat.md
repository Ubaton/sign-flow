---
'signflow-core': patch
---

Documentation only — no code changes.

Corrects the README's API tables against the actual implementation: `clear()`
discards recorded strokes but does **not** clear canvas pixels (it previously
claimed it reset the canvas), and the previously undocumented `getStrokes()`,
`destroy()`, `getSignature()`, `listSignatures()`, `deleteSignature()`,
`strokesToPath()`, `strokesToPressureArray()`, and `requestGeolocation()` are
now listed. Documents `SignClient`'s `baseUrl` option, which self-hosted
deployments must pass explicitly, and the `Authorization: Bearer` scheme.

Adds a "Using it in React" section pointing at `<SignaturePad />` from the
`signflow` package, and makes explicit that `SignatureCapture` records strokes
without ever drawing them — rendering, canvas sizing, and devicePixelRatio are
the caller's responsibility.
