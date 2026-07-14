# signflow-core

Framework-agnostic signature capture: pointer/touch/pen event handling with
pressure and timing, SVG path export, opt-in geolocation, and a typed API
client for the SignFlow backend.

## Install

```
npm install signflow-core
```

## Usage

```ts
import { SignatureCapture, SignClient } from 'signflow-core';

const capture = new SignatureCapture({ element: canvasEl });
// ...user draws...

const client = new SignClient({ apiKey: 'pk_live_...' });
await client.submitSignature({
  signature: capture.toSvgPath(),
  location: null,
  deviceData: capture.getDeviceData(),
  siteUrl: location.href,
  pageName: 'agreement',
  createdBy: 'signer@example.com',
});
```

Framework wrapper: [`signflow`](https://www.npmjs.com/package/signflow).
