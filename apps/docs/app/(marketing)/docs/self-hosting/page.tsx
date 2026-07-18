// Route: /docs/self-hosting — static server component rendered in the
// marketing layout (NavBar/Footer come from the (marketing) route group).

import {
  Server,
  Terminal,
  SlidersHorizontal,
  Link2,
  Lock,
  HardDrive,
  Scale,
} from 'lucide-react';
import type { Metadata } from 'next';
import {
  Callout,
  CodeBlock,
  DocsArticle,
  DocsSection,
  DocsToc,
  InlineCode,
  TextLink,
} from '@/components/docs/primitives';

const description =
  'Deploy the SignFlow API on your own infrastructure: requirements, environment variables, and how to point the SDK at your own instance.';

export const metadata: Metadata = {
  title: 'Self-hosted backend',
  description,
  alternates: {
    canonical: '/docs/self-hosting',
  },
  openGraph: {
    title: 'Self-hosted backend · SignFlow',
    description,
    url: '/docs/self-hosting',
  },
};

const toc = [
  { href: '#requirements', label: 'Requirements' },
  { href: '#quick-start', label: 'Quick start (Docker Compose)' },
  { href: '#environment', label: 'Environment variables' },
  { href: '#pointing-the-sdk', label: 'Pointing the SDK at your instance' },
  { href: '#reverse-proxy', label: 'Reverse proxy & TLS' },
  { href: '#backups', label: 'Backups & data ownership' },
  { href: '#when-to-self-host', label: 'Self-hosting vs. the hosted dashboard' },
];

const ENV_VARS: { name: string; required: string; description: string }[] = [
  { name: 'DATABASE_URL', required: 'Yes', description: 'PostgreSQL connection string' },
  {
    name: 'GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET',
    required: 'At least one provider',
    description: 'Your own GitHub OAuth App, scoped to your domain',
  },
  {
    name: 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET',
    required: 'At least one provider',
    description: 'Same, for Google OAuth',
  },
  {
    name: 'SESSION_SECRET',
    required: 'Yes',
    description: 'Random string used to sign session cookies',
  },
  {
    name: 'PUBLIC_APP_URL',
    required: 'Yes',
    description:
      'The public URL your instance is reachable at — used to build OAuth callback URLs',
  },
  {
    name: 'S3_ENDPOINT / S3_BUCKET / S3_ACCESS_KEY / S3_SECRET_KEY',
    required: 'Only for raster mode',
    description: 'Not needed when signatures are stored as SVG path data (the default)',
  },
];

export default function SelfHostingPage() {
  return (
    <DocsArticle
      title="Self-hosted backend"
      lede={
        <>
          The API (<InlineCode>apps/api</InlineCode>) is a standard NestJS service backed by
          PostgreSQL. Deploying it yourself means signature records never leave your
          infrastructure.
        </>
      }
    >
      <DocsToc items={toc} />

      <div className="mt-10 space-y-10">
        <DocsSection id="requirements" icon={Server} title="Requirements">
          <ul className="list-disc space-y-2 pl-5">
            <li>Node.js 20+ and PostgreSQL 14+</li>
            <li>
              A GitHub and/or Google OAuth app registered under your own domain — you
              can&apos;t reuse SignFlow&apos;s hosted OAuth app, since callback URLs are tied
              to a specific domain
            </li>
            <li>
              S3-compatible object storage — <strong className="text-paper">only</strong> if
              you store signatures as rasterized images. The default SVG-path capture mode
              stores everything directly in Postgres and needs no object storage at all.
            </li>
          </ul>
        </DocsSection>

        <DocsSection id="quick-start" icon={Terminal} title="Quick start (Docker Compose)">
          <p>
            A minimal starting point — adjust image tags and secrets before running this
            anywhere but locally.
          </p>
          <CodeBlock>{`services:
  api:
    build: ./apps/api
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgres://signflow:signflow@postgres:5432/signflow
      GITHUB_CLIENT_ID: \${GITHUB_CLIENT_ID}
      GITHUB_CLIENT_SECRET: \${GITHUB_CLIENT_SECRET}
      GOOGLE_CLIENT_ID: \${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: \${GOOGLE_CLIENT_SECRET}
      SESSION_SECRET: \${SESSION_SECRET}
      PUBLIC_APP_URL: https://your-domain.example.com
    depends_on:
      - postgres
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: signflow
      POSTGRES_PASSWORD: signflow
      POSTGRES_DB: signflow
    volumes:
      - signflow_pg:/var/lib/postgresql/data

volumes:
  signflow_pg:`}</CodeBlock>
          <p>
            Run migrations before first use — <InlineCode>npm run db:migrate</InlineCode>{' '}
            (adjust to whatever migration tooling <InlineCode>apps/api</InlineCode> actually
            ships with).
          </p>
          <p>
            Add a MinIO (or other S3-compatible) service to this file only if you&apos;re
            using rasterized signature storage — it&apos;s not required for the default
            SVG-path mode.
          </p>
        </DocsSection>

        <DocsSection id="environment" icon={SlidersHorizontal} title="Environment variables">
          {/* Reference table, not app data — block-level horizontal scroll is
              the same affordance the code blocks use on narrow viewports. */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 font-mono-tight text-xs font-medium uppercase tracking-[0.15em] text-mist">
                    Variable
                  </th>
                  <th className="py-2 pr-4 font-mono-tight text-xs font-medium uppercase tracking-[0.15em] text-mist">
                    Required
                  </th>
                  <th className="py-2 font-mono-tight text-xs font-medium uppercase tracking-[0.15em] text-mist">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="align-top text-mist">
                {ENV_VARS.map((v) => (
                  <tr key={v.name} className="border-b border-line last:border-b-0">
                    <td className="py-2.5 pr-4 font-mono-tight text-[13px] text-paper">
                      {v.name}
                    </td>
                    <td className="py-2.5 pr-4">{v.required}</td>
                    <td className="py-2.5">{v.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocsSection>

        <DocsSection id="pointing-the-sdk" icon={Link2} title="Pointing the SDK at your instance">
          <p>
            The widget and API client need to talk to your deployment instead of the hosted
            default:
          </p>
          <CodeBlock>{`const client = new SignClient({
  apiKey: 'pk_live_...',
  baseUrl: 'https://api.your-domain.example.com',
});`}</CodeBlock>
          <Callout>
            <InlineCode>baseUrl</InlineCode> is optional in{' '}
            <InlineCode>SignClient</InlineCode>&apos;s constructor and defaults to the hosted
            instance — a self-hosted deployment must always pass it explicitly, or
            submissions will silently go to the default backend instead of yours.
          </Callout>
        </DocsSection>

        <DocsSection id="reverse-proxy" icon={Lock} title="Reverse proxy & TLS">
          <p>
            The API doesn&apos;t terminate TLS itself — put it behind a reverse proxy
            (Caddy, Nginx, or Traefik all work fine) that handles certificates and forwards
            to the container&apos;s port. Make sure <InlineCode>PUBLIC_APP_URL</InlineCode>{' '}
            matches the externally-reachable HTTPS URL, since OAuth callback verification
            depends on it matching exactly.
          </p>
        </DocsSection>

        <DocsSection id="backups" icon={HardDrive} title="Backups & data ownership">
          <p>
            Signature records live in Postgres — back it up the way you would any production
            database (scheduled <InlineCode>pg_dump</InlineCode>, or your provider&apos;s
            point-in-time recovery). If you&apos;re using object storage for raster assets,
            back that up independently — it isn&apos;t covered by a Postgres backup.
          </p>
          <p>
            SignFlow doesn&apos;t enforce a retention policy — how long you keep records,
            and your deletion process for right-to-erasure requests, is entirely under your
            control once self-hosted (see the{' '}
            <TextLink href="/docs/security#data-retention">
              Security &amp; Compliance guide
            </TextLink>
            ).
          </p>
        </DocsSection>

        <DocsSection id="when-to-self-host" icon={Scale} title="Self-hosting vs. the hosted dashboard">
          <p>
            Self-host if data residency, retention control, or infrastructure ownership
            matters for your use case — you take on running Postgres and the API yourself in
            exchange for full control.
          </p>
          <p>
            Use the hosted dashboard flow instead if you&apos;d rather not run
            infrastructure at all — same API surface, same key model, just managed for you.
            Both point at the same client SDK; switching later is a matter of changing{' '}
            <InlineCode>baseUrl</InlineCode>, not rewriting integration code.
          </p>
        </DocsSection>
      </div>
    </DocsArticle>
  );
}
