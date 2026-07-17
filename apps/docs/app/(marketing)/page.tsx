import { CopyableCommand } from '@/components/CopyableCommand';
import { FeatureGrid } from '@/components/FeatureGrid';
import { RepoStats } from '@/components/RepoStats';
import { SignatureHero } from '@/components/SignatureHero';
import { TerminalDemo } from '@/components/TerminalDemo';

export default function Home() {
  return (
    <main>
      <section className="grid-backdrop relative overflow-hidden border-b border-line px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-10">
          <span className="font-mono-tight text-xs uppercase tracking-[0.2em] text-accent">
            SignFlow · e-signature sdk · self-hosted
          </span>

          <RepoStats />
          <h1 className="max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight text-paper sm:text-6xl">
            Capture legally-relevant signatures,{' '}
            <span className="text-mist">not just a scribble.</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-mist">
            A TypeScript widget that records pressure, velocity, and timing per
            stroke — then stores it as scalable, replayable vector data. Own
            your data, verify it server-side, ship it in an afternoon.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <CopyableCommand command="npm install signflow-core" />
            <a
              href="/demo"
              className="inline-flex min-h-11 items-center border border-accent bg-accent px-5 font-mono-tight text-sm text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Try the live demo
            </a>
            <a
              href="#features"
              className="inline-flex min-h-11 items-center border border-line px-5 font-mono-tight text-sm text-paper transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              See capabilities
            </a>
          </div>

          <div className="mt-6 w-full border border-line bg-ink/60 p-4 sm:p-8">
            <SignatureHero />
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-mono-tight text-sm uppercase tracking-[0.2em] text-mist">
            Capabilities
          </h2>
          <p className="mt-3 max-w-xl text-2xl text-paper">
            Everything the data model needs to hold up as evidence.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-5xl border border-line">
          <FeatureGrid />
        </div>
      </section>

      <section id="quickstart" className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-mono-tight text-sm uppercase tracking-[0.2em] text-mist">
            Quick start
          </h2>
          <p className="mt-3 text-2xl text-paper">
            A few lines to capture and submit a signature.
          </p>
          <div className="mt-10">
            <TerminalDemo />
          </div>
        </div>
      </section>
    </main>
  );
}
