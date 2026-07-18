// Route: /docs/security — static server component rendered in the
// marketing layout (NavBar/Footer come from the (marketing) route group).

import { Clock, MapPin, KeyRound, Trash2, ShieldCheck, ScrollText } from 'lucide-react';
import type { Metadata } from 'next';
import {
  Callout,
  DocsArticle,
  DocsSection,
  DocsToc,
  InlineCode,
} from '@/components/docs/primitives';

const description =
  'How SignFlow handles timestamp integrity, geolocation consent, key rotation, and data retention — and what compliance posture that does and does not give you.';

export const metadata: Metadata = {
  title: 'Security & Compliance',
  description,
  alternates: {
    canonical: '/docs/security',
  },
  openGraph: {
    title: 'Security & Compliance · SignFlow',
    description,
    url: '/docs/security',
  },
};

const toc = [
  { href: '#timestamps', label: 'Timestamp integrity' },
  { href: '#geolocation', label: 'Opt-in geolocation' },
  { href: '#key-management', label: 'Key management & rotation' },
  { href: '#data-retention', label: 'Data retention & erasure' },
  { href: '#account-security', label: 'Account security' },
  { href: '#compliance-posture', label: 'Compliance posture' },
];

export default function SecurityCompliancePage() {
  return (
    <DocsArticle
      title={<>Security &amp; Compliance</>}
      lede="What SignFlow does at the protocol level to protect signature records, and what that does — and doesn't — mean for your own compliance obligations."
    >
      <DocsToc items={toc} />

      <div className="mt-10 space-y-10">
        <DocsSection id="timestamps" icon={Clock} title="Timestamp integrity">
          <p>
            Every signature record&apos;s <InlineCode>date</InlineCode> field is assigned by the
            API at the moment a signature is received — never read from the client. A
            signer&apos;s device clock, time zone, or a tampered request body has no way to
            influence it.
          </p>
          <p>
            This matters specifically for backdating: without a server-assigned timestamp,
            anyone with API access to the client key could submit a signature claiming it
            happened earlier than it did.
          </p>
        </DocsSection>

        <DocsSection id="geolocation" icon={MapPin} title="Opt-in geolocation">
          <p>
            Location is <InlineCode>null</InlineCode> by default. It&apos;s only populated if
            the signer is shown a consent prompt and explicitly agrees — the widget never
            requests location silently in the background.
          </p>
          <p>
            If consent is declined, the signature is still captured and submitted normally;
            location is simply omitted rather than the capture being blocked.
          </p>
        </DocsSection>

        <DocsSection id="key-management" icon={KeyRound} title="Key management & rotation">
          <p>
            Each project has a public key (safe to embed client-side, scopes submissions to
            that project) and a secret key (server-side only, used to read signature records
            back). They&apos;re separate on purpose: a leaked public key lets someone submit
            signatures into your project, not read existing ones.
          </p>
          <p>
            Rotating a key invalidates the old one immediately — there&apos;s no overlap
            window where both the old and new key work, so a rotation in response to a
            suspected leak takes effect right away.
          </p>
        </DocsSection>

        <DocsSection id="data-retention" icon={Trash2} title="Data retention & erasure">
          <p>
            Signature records persist until explicitly deleted. Deletion is available
            per-record through the API for cases where a right-to-erasure request applies.
          </p>
          <p>
            SignFlow doesn&apos;t impose a retention limit itself — how long you keep
            records, and under what policy, is a decision for your own data-retention policy
            to make, not something the package enforces for you.
          </p>
        </DocsSection>

        <DocsSection id="account-security" icon={ShieldCheck} title="Account security">
          <p>
            Dashboard accounts sign in through GitHub or Google OAuth only — there&apos;s no
            separate password to leak, phish, or reuse across services. Access to a
            project&apos;s keys is scoped to the account that created it.
          </p>
        </DocsSection>

        <DocsSection id="compliance-posture" icon={ScrollText} title="Compliance posture">
          <Callout>
            Server-assigned timestamps and opt-in-only geolocation are technical properties
            that support common signature-evidence requirements — they are not, by
            themselves, a certification that your use of SignFlow satisfies POPIA, GDPR, the
            U.S. ESIGN Act, or eIDAS. Requirements vary by jurisdiction and by what
            you&apos;re using the signature for. Whether you need additional signer identity
            verification beyond an OAuth email is a question for your own legal counsel, not
            something this guide can answer for you.
          </Callout>
          <p>
            What this page describes is what happens at the protocol level. Pair it with
            your own review of which evidentiary standard your use case actually needs to
            meet.
          </p>
        </DocsSection>
      </div>
    </DocsArticle>
  );
}
