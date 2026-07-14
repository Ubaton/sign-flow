import { CodeShowcase } from '@/components/CodeShowcase';
import { FeatureGrid } from '@/components/FeatureGrid';
import { Footer } from '@/components/Footer';
import { NavBar } from '@/components/NavBar';
import { RepoStats } from '@/components/RepoStats';
import { SignatureHero } from '@/components/SignatureHero';

export default function Home() {
  return (
    <>
      <NavBar />

      <main>
        <section className="grid-backdrop relative overflow-hidden border-b border-line px-6 py-28">
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
              <a
                href="#quickstart"
                className="border border-accent bg-accent px-5 py-2.5 font-mono-tight text-sm text-ink transition-transform hover:-translate-y-0.5"
              >
                npm install signflow-core
              </a>
              <a
                href="#features"
                className="border border-line px-5 py-2.5 font-mono-tight text-sm text-paper transition-colors hover:border-accent hover:text-accent"
              >
                See capabilities
              </a>
            </div>

            <div className="mt-6 w-full border border-line bg-neutral-950/60 p-8">
              <SignatureHero />
            </div>
          </div>
        </section>

        <section id="features" className="px-6 py-24">
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

        <section id="quickstart" className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-mono-tight text-sm uppercase tracking-[0.2em] text-mist">
              Quick start
            </h2>
            <p className="mt-3 text-2xl text-paper">
              A few lines to capture and submit a signature.
            </p>
            <div className="mt-10">
              <CodeShowcase />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
