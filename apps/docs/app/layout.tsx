import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

// viewport-fit=cover lets sticky bars pad with env(safe-area-inset-*) on
// notch/home-indicator devices instead of sitting under the hardware.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Falls back to the real production domain, not localhost — a missing env
// var must never silently break canonical/OG URLs in a live deployment.
// Override with NEXT_PUBLIC_SITE_URL for previews/staging.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://sign-flow-docs.vercel.app'
    : 'http://localhost:3000');

const title = 'SignFlow — self-hosted e-signature SDK for developers';
const description =
  'SignFlow is a developer-first, self-hosted e-signature SDK. Drop a signature pad into your app, capture pressure-accurate strokes as vector data, and verify signatures server-side — own your data end to end.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s · SignFlow',
  },
  description,
  applicationName: 'SignFlow',
  keywords: [
    'SignFlow',
    'e-signature SDK',
    'electronic signature API',
    'self-hosted e-signature',
    'signature pad component',
    'React signature pad',
    'digital signature capture',
    'DocuSign alternative',
    'HelloSign alternative',
  ],
  authors: [{ name: 'SignFlow' }],
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'SignFlow',
    title,
    description,
    // Image comes from app/opengraph-image.tsx (Next's file convention) —
    // generated dynamically, not a static asset that can silently go stale.
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SignFlow',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  description,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
