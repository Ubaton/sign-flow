// Route: /docs/api — static server component rendered in the marketing
// layout (NavBar/Footer come from the (marketing) route group).
//
// Per Technical Spec §6, this page is meant to be auto-generated from the
// OpenAPI spec exposed by apps/api, not hand-maintained indefinitely. Until
// that endpoint exists, it's hand-authored against the confirmed spec below —
// deliberately structured as a data array (ENDPOINTS) so swapping in a real
// parsed OpenAPI document later means replacing that array, not rewriting
// this file.

import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Callout,
  CodeBlock,
  DocsArticle,
  DocsSection,
  InlineCode,
} from '@/components/docs/primitives';

const description =
  'Every endpoint exposed by the SignFlow API: auth requirements, request/response shapes, and the SignatureRecord data model.';

export const metadata: Metadata = {
  title: 'API reference',
  description,
  alternates: {
    canonical: '/docs/api',
  },
  openGraph: {
    title: 'API reference · SignFlow',
    description,
    url: '/docs/api',
  },
};

type Auth = 'none' | 'session' | 'publicKey' | 'secretKey';

const AUTH_LABEL: Record<Auth, string> = {
  none: '—',
  session: 'Session (dashboard cookie)',
  publicKey: 'Public key (pk_live_ / pk_test_)',
  secretKey: 'Secret key (sk_live_ / sk_test_)',
};

interface Endpoint {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  auth: Auth;
  summary: string;
  request?: string;
  response?: string;
  /** Set when the shape below isn't defined in the spec and is illustrative only. */
  unconfirmed?: boolean;
}

const ENDPOINTS: { group: string; items: Endpoint[] }[] = [
  {
    group: 'Authentication',
    items: [
      { method: 'GET', path: '/auth/oauth/github', auth: 'none', summary: 'Start the GitHub OAuth flow.' },
      { method: 'GET', path: '/auth/oauth/google', auth: 'none', summary: 'Start the Google OAuth flow.' },
    ],
  },
  {
    group: 'Projects & keys',
    items: [
      {
        method: 'POST',
        path: '/projects',
        auth: 'session',
        summary: 'Create a new project. Returns its key pair — the secret key is only ever shown once.',
        response: `{
  "id": "proj_...",
  "name": "My project",
  "publicKey": "pk_live_...",
  "secretKey": "sk_live_...",
  "createdAt": "2026-07-18T09:12:00Z"
}`,
        unconfirmed: true,
      },
      {
        method: 'POST',
        path: '/projects/:id/keys/rotate',
        auth: 'session',
        summary: "Rotate a project's key pair. The old pair stops working immediately — no overlap window.",
        response: `{
  "publicKey": "pk_live_...",
  "secretKey": "sk_live_..."
}`,
        unconfirmed: true,
      },
    ],
  },
  {
    group: 'Signatures',
    items: [
      {
        method: 'POST',
        path: '/signatures',
        auth: 'publicKey',
        summary: 'Submit a captured signature and its metadata.',
        request: `{
  "signature": "M10 10 L90 90 ...",
  "location": null,
  "deviceData": {
    "userAgent": "...",
    "inputType": "touch",
    "pressureSupported": true
  },
  "siteUrl": "https://example.com/agreement",
  "pageName": "agreement",
  "createdBy": "signer@example.com"
}`,
        response: `{
  "id": "sig_...",
  "date": "2026-07-18T09:14:22Z",
  "projectId": "proj_...",
  "signature": "M10 10 L90 90 ...",
  "location": null,
  "deviceData": { "userAgent": "...", "inputType": "touch", "pressureSupported": true },
  "siteUrl": "https://example.com/agreement",
  "pageName": "agreement",
  "createdBy": "signer@example.com"
}`,
      },
      {
        method: 'GET',
        path: '/signatures/:id',
        auth: 'secretKey',
        summary: 'Retrieve a single signature record by ID.',
        response: '/* full SignatureRecord — see Data model below */',
      },
      {
        method: 'GET',
        path: '/signatures?projectId=',
        auth: 'secretKey',
        summary: 'List signatures for a project, paginated.',
        response: `{
  "data": [ /* SignatureRecord[] */ ],
  "nextCursor": "..."
}`,
        unconfirmed: true,
      },
      {
        method: 'DELETE',
        path: '/signatures/:id',
        auth: 'secretKey',
        summary: 'Permanently delete a record — used for right-to-erasure requests.',
        response: `{ "deleted": true }`,
        unconfirmed: true,
      },
    ],
  },
];

function MethodBadge({ method }: { method: Endpoint['method'] }) {
  const isDestructive = method === 'DELETE';
  return (
    <span
      className={[
        'border px-1.5 py-0.5 font-mono-tight text-[11px] font-semibold uppercase tracking-wide',
        isDestructive ? 'border-accent text-accent' : 'border-line text-paper',
      ].join(' ')}
    >
      {method}
    </span>
  );
}

export default function ApiReferencePage() {
  return (
    <DocsArticle
      title="API reference"
      lede={
        <>
          All paths below are relative to your API&apos;s base URL — the hosted default, or
          your own instance if you&apos;re self-hosting (see{' '}
          <Link
            href="/docs/self-hosting"
            className="text-paper underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          >
            Self-hosted backend
          </Link>
          ).
        </>
      }
    >
      <div className="mt-6">
        <Callout>
          Keys are passed as{' '}
          <InlineCode>Authorization: Bearer pk_live_...</InlineCode> — the header the
          official SDK&apos;s API client sends; mirror it from your own code. Response
          shapes marked <em>illustrative</em> further down aren&apos;t defined in the spec
          yet — confirm those against a running API. Everything else — the endpoint list,
          auth requirements, and the <InlineCode>SignatureRecord</InlineCode> shape — comes
          directly from the confirmed spec.
        </Callout>
      </div>

      <div className="mt-10 space-y-12">
        {ENDPOINTS.map((group) => (
          <DocsSection key={group.group} id={group.group.toLowerCase().replace(/[^a-z]+/g, '-')} title={group.group}>
            <div className="space-y-8">
              {group.items.map((ep) => (
                <div key={`${ep.method}-${ep.path}`} className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <MethodBadge method={ep.method} />
                    <code className="font-mono-tight text-sm text-paper">{ep.path}</code>
                  </div>
                  <p className="text-[15px] leading-relaxed text-mist">{ep.summary}</p>
                  <p className="text-xs text-mist">
                    Auth: <span className="text-paper">{AUTH_LABEL[ep.auth]}</span>
                  </p>
                  {ep.request && (
                    <div>
                      <p className="mb-1.5 font-mono-tight text-xs uppercase tracking-[0.15em] text-mist">
                        Request body
                      </p>
                      <CodeBlock>{ep.request}</CodeBlock>
                    </div>
                  )}
                  {ep.response && (
                    <div>
                      <p className="mb-1.5 font-mono-tight text-xs uppercase tracking-[0.15em] text-mist">
                        Response{ep.unconfirmed ? ' (illustrative — confirm against real API)' : ''}
                      </p>
                      <CodeBlock>{ep.response}</CodeBlock>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DocsSection>
        ))}

        <DocsSection id="data-model" title="Data model: SignatureRecord">
          <p>
            The confirmed shape from the technical spec — server-assigned fields are never
            accepted from the client on write.
          </p>
          <CodeBlock>{`interface SignatureRecord {
  id: string;                // UUID, server-assigned
  signature: string;         // SVG path data or base64 PNG
  date: string;               // ISO 8601, server-assigned — not client-trusted
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
  } | null;                  // null unless the signer opts in
  deviceData: {
    userAgent: string;
    inputType: 'touch' | 'pen' | 'mouse';
    pressureSupported: boolean;
  };
  siteUrl: string;
  pageName: string;
  projectId: string;          // inferred from the public key, not client-supplied
  createdBy: string;          // account email
}`}</CodeBlock>
        </DocsSection>

        <DocsSection id="errors" title="Errors">
          <p>
            Standard HTTP status codes apply (400 for malformed requests, 401/403 for auth
            failures, 404 for missing records). The exact error body shape isn&apos;t
            finalized in the spec yet — check the real response once the API is running
            rather than relying on this page for it.
          </p>
        </DocsSection>
      </div>
    </DocsArticle>
  );
}
