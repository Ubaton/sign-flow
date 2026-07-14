import type { Metadata } from 'next';
import './globals.css';

// Set this to the real production domain before deploying — it's used to
// build absolute canonical/OG URLs. Falls back to localhost for local builds.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

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
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'SignFlow' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.png'],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
