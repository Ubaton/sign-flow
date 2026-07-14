'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BoltIcon, KeyIcon, LocationIcon, PressureIcon, ShieldIcon, VectorIcon } from './icons';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: PressureIcon,
    title: 'Pressure-accurate capture',
    body: 'Pointer events record x, y, pressure, and timing per stroke — touch, pen, and mouse all normalized into one model.',
  },
  {
    icon: VectorIcon,
    title: 'Vector, not raster',
    body: 'Signatures store as SVG path data with a replayable pressure array — small, scalable, and animatable on playback.',
  },
  {
    icon: ShieldIcon,
    title: 'Server-stamped timestamps',
    body: 'The signing date is assigned by the API, never trusted from the client, closing the door on backdated records.',
  },
  {
    icon: LocationIcon,
    title: 'Opt-in geolocation',
    body: 'Location is requested through explicit consent UI and defaults to null on decline — built for GDPR / POPIA.',
  },
  {
    icon: KeyIcon,
    title: 'Scoped key pairs',
    body: 'Every project gets a public key for capture and a secret key for retrieval. Rotate either one, instantly invalidating the old.',
  },
  {
    icon: BoltIcon,
    title: 'WASM stroke smoothing',
    body: 'An optional Rust-compiled WASM module smooths pressure and velocity curves client-side — no network hop required.',
  },
];

export function FeatureGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.feature-card');
    if (!cards?.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
          },
        },
      );
    }, gridRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={gridRef} className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map(({ icon: Icon, title, body }) => (
        <div
          key={title}
          className="feature-card group bg-ink p-8 transition-colors hover:bg-neutral-950"
        >
          <Icon className="h-8 w-8 text-accent transition-transform duration-300 group-hover:-translate-y-0.5" />
          <h3 className="mt-6 font-mono-tight text-lg text-paper">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-mist">{body}</p>
        </div>
      ))}
    </div>
  );
}
