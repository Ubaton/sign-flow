'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';


export function NavBar() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
    );
  }, []);

  return (
    <nav
      ref={ref}
      className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink/80 px-6 py-4 backdrop-blur"
    >
      <a href="/">
        <Image
          src="/signflow-white-logo.svg"
          alt="Logo"
          width={120}
          height={40}
        />
      </a>
      <div className="flex items-center gap-6 text-sm text-mist">
        <a href="/#features" className="transition-colors hover:text-paper">
          Features
        </a>
        <a href="/#quickstart" className="transition-colors hover:text-paper">
          Quick start
        </a>
        <a
          href="/dashboard"
          className="rounded-none border border-line px-3 py-1.5 font-mono-tight text-xs text-paper transition-colors hover:border-accent hover:text-accent"
        >
          Dashboard
        </a>
      </div>
    </nav>
  );
}
