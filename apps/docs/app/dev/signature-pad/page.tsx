// Route: /dev/signature-pad — internal harness for verifying the published
// <SignaturePad /> in a real browser. Unlinked and noindex; not part of the
// marketing site's IA.

import type { Metadata } from 'next';
import { SignaturePadHarness } from './SignaturePadHarness';

export const metadata: Metadata = {
  title: 'SignaturePad harness',
  robots: { index: false, follow: false },
};

export default function SignaturePadDevPage() {
  return <SignaturePadHarness />;
}
