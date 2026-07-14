# signflow

A `<SignaturePad />` React component built on
[`signflow-core`](https://www.npmjs.com/package/signflow-core).

## Install

```
npm install signflow
```

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

Get a `publicKey` by creating a project in your dashboard — see the
[SignFlow](https://www.npmjs.com/package/signflow-core) docs.
