'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const STROKES = [
  'M 20 90 C 40 20, 70 20, 78 60 C 84 90, 60 100, 55 70 C 50 40, 90 20, 110 55 C 125 80, 150 90, 165 55',
  'M 175 50 C 175 90, 175 100, 190 100 C 205 100, 205 60, 195 60 C 188 60, 188 100, 210 95',
  'M 220 40 L 220 100',
  'M 235 55 C 250 45, 270 45, 270 70 C 270 95, 245 100, 235 85',
];

export function SignatureHero() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const paths = svg.querySelectorAll<SVGPathElement>('.stroke-path');
    const lengths = Array.from(paths).map((p) => p.getTotalLength());

    paths.forEach((p, i) => {
      p.style.strokeDasharray = `${lengths[i]}`;
      p.style.strokeDashoffset = `${lengths[i]}`;
    });

    const tl = gsap.timeline({ delay: 0.3 });

    paths.forEach((p, i) => {
      tl.to(
        p,
        {
          strokeDashoffset: 0,
          duration: lengths[i]! / 260,
          ease: 'power1.inOut',
        },
        i === 0 ? 0 : '-=0.05',
      );
    });

    tl.fromTo(
      svg.querySelectorAll('.pressure-dot'),
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'back.out(3)' },
      '-=0.3',
    );

    tl.to(svg.querySelectorAll('.stroke-path'), {
      filter: 'drop-shadow(0 0 6px var(--color-accent))',
      duration: 0.5,
      yoyo: true,
      repeat: 1,
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 120"
      className="w-full max-w-xl"
      fill="none"
      aria-hidden="true"
    >
      {STROKES.map((d, i) => (
        <path
          key={i}
          d={d}
          className="stroke-path"
          stroke="var(--color-accent)"
          strokeWidth={3}
          strokeLinecap="round"
        />
      ))}
      <circle className="pressure-dot" cx={20} cy={90} r={3} fill="var(--color-accent)" />
      <circle className="pressure-dot" cx={110} cy={55} r={2.5} fill="var(--color-accent)" opacity={0.7} />
      <circle className="pressure-dot" cx={210} cy={95} r={2.5} fill="var(--color-accent)" opacity={0.7} />
      <circle className="pressure-dot" cx={270} cy={70} r={3} fill="var(--color-accent)" />
      <line
        x1={10}
        y1={108}
        x2={280}
        y2={108}
        stroke="var(--color-mist)"
        strokeWidth={1}
        strokeDasharray="2 4"
        opacity={0.5}
      />
    </svg>
  );
}
