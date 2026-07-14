'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SNIPPET = `import { SignaturePad } from 'signflow';

export function AgreementPage() {
  return (
    <SignaturePad
      publicKey="pk_live_9f2c..."
      pageName="master-services-agreement"
      signerId="client@example.com"
      collectLocation
      onSubmit={(record) => console.log(record.id)}
    />
  );
}`;

const LINES = SNIPPET.split('\n');

export function CodeShowcase() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lines = ref.current?.querySelectorAll('.code-line');
    if (!lines?.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lines,
        { opacity: 0, x: -12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.045,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 75%',
          },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="overflow-x-auto rounded-none border border-line bg-neutral-950 p-6 font-mono-tight text-sm leading-relaxed"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
        <span className="ml-3 text-xs text-mist">AgreementPage.tsx</span>
      </div>
      {LINES.map((line, i) => (
        <div key={i} className="code-line whitespace-pre text-paper/90">
          {line || ' '}
        </div>
      ))}
    </div>
  );
}
