import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { LiveSignatureDemo } from '@/components/LiveSignatureDemo';
import { NavBar } from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Live demo',
  description:
    'Draw a signature and watch SignFlow capture pressure, velocity, and timing in real time — streaming the actual SVG path output as you draw.',
};

export default function DemoPage() {
  return (
    <>
      <NavBar />
      <main className="grid-backdrop min-h-screen px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <span className="font-mono-tight text-xs uppercase tracking-[0.2em] text-accent">
            Live demo
          </span>
          <h1 className="mt-4 text-3xl font-medium tracking-tight text-paper sm:text-4xl">
            Draw a signature, watch the data stream.
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-mist">
            This is the real <code className="font-mono-tight text-paper">signflow-core</code>{' '}
            capture engine running in your browser — not a mockup. Every stroke is normalized
            into pressure-accurate SVG path data on the right, live.
          </p>

          <div className="mt-12 border border-line bg-neutral-950/60 p-8">
            <LiveSignatureDemo />
          </div>

          <p className="mt-6 text-xs text-mist">
            Nothing you draw here is sent anywhere — this runs entirely client-side against the
            open-source capture library.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
