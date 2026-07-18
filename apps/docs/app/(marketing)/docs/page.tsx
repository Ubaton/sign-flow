// Route: /docs — index for the guide pages, and the landing target for the
// "Documentation" link in the published package README.

import Link from 'next/link';
import type { Metadata } from 'next';
import { DocsArticle } from '@/components/docs/primitives';

const description =
  'Guides for deploying and integrating SignFlow: self-hosted backend setup, the full API reference, and the security & compliance model.';

export const metadata: Metadata = {
  title: 'Documentation',
  description,
  alternates: {
    canonical: '/docs',
  },
  openGraph: {
    title: 'Documentation · SignFlow',
    description,
    url: '/docs',
  },
};

const GUIDES = [
  {
    href: '/docs/self-hosting',
    title: 'Self-hosted backend',
    description:
      'Deploy the SignFlow API on your own infrastructure: requirements, environment variables, and how to point the SDK at your own instance.',
  },
  {
    href: '/docs/api',
    title: 'API reference',
    description:
      'Every endpoint exposed by the SignFlow API: auth requirements, request/response shapes, and the SignatureRecord data model.',
  },
  {
    href: '/docs/security',
    title: 'Security & Compliance',
    description:
      'Timestamp integrity, geolocation consent, key rotation, and data retention — and what compliance posture that does and does not give you.',
  },
];

export default function DocsIndexPage() {
  return (
    <DocsArticle
      eyebrow="Docs"
      title="Documentation"
      lede="Everything beyond the quick start: running the backend yourself, the full API surface, and how signature records hold up as evidence."
    >
      <div className="mt-10 flex flex-col gap-4">
        {GUIDES.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="group border border-line bg-ink/60 p-5 transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <h2 className="text-lg font-medium tracking-tight text-paper transition-colors group-hover:text-accent">
              {guide.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-mist">{guide.description}</p>
            <span className="mt-4 inline-flex font-mono-tight text-xs uppercase tracking-[0.2em] text-accent">
              Read guide →
            </span>
          </Link>
        ))}
      </div>
    </DocsArticle>
  );
}
