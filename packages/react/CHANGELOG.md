# signflow

## 0.0.2

### Patch Changes

- bd93d38: Fix `<SignaturePad />` rendering and expand its API.

  The canvas now tracks its rendered size and `devicePixelRatio` via a
  ResizeObserver, so strokes no longer draw offset from the pointer under CSS
  scaling and stay sharp on HiDPI displays — `width`/`height` are applied as CSS
  rather than as the bitmap size. Stroke color is resolved from the new
  `strokeColor` prop or the element's computed CSS `color`, replacing an invalid
  `strokeStyle = 'currentColor'` assignment that Canvas 2D silently discarded,
  which forced every signature to render black. Strokes are also corrected for
  the element's border and padding, and a tap with no movement now renders a dot
  so the canvas matches the submitted SVG path.

  Adds `onChange` (fires once per completed stroke), `strokeColor`, `lineWidth`,
  and pass-through of standard canvas attributes including `style`. The
  imperative handle gains `toSvgPath`, `getDeviceData`, `getStrokes`,
  `getCanvas`, and `redraw`. `submit()` now resolves with the `SignatureRecord`,
  always calls `onError` before rethrowing — including for empty signatures, via
  the new exported `SignatureEmptyError` — and de-dupes concurrent calls so a
  double-clicked button cannot submit twice.

- Updated dependencies [bd93d38]
  - signflow-core@0.0.7
