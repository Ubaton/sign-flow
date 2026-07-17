'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import { GithubMarkIcon, GoogleMarkIcon } from '@/components/icons';
import { githubLoginUrl, googleLoginUrl } from '@/lib/api';

export default function LoginPage() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
    );
  }, []);

  return (
    <main className="grid-backdrop flex min-h-screen items-center justify-center px-6">
      <div
        ref={cardRef}
        className="w-full max-w-sm border border-line bg-ink/80 p-6 backdrop-blur sm:p-8"
      >
        <a href="/">
          <Image src="/signflow-white-logo.svg" alt="SignFlow" width={120} height={40} />
        </a>

        <h1 className="mt-8 text-xl text-paper">Sign in to your dashboard</h1>
        <p className="mt-2 text-sm text-mist">
          No passwords — authenticate with an account you already trust.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href={githubLoginUrl()}
            className="flex items-center justify-center gap-3 border border-line px-4 py-3 font-mono-tight text-sm text-paper transition-colors hover:border-accent hover:text-accent"
          >
            <GithubMarkIcon className="h-4 w-4" />
            Continue with GitHub
          </a>
          <a
            href={googleLoginUrl()}
            className="flex items-center justify-center gap-3 border border-line px-4 py-3 font-mono-tight text-sm text-paper transition-colors hover:border-accent hover:text-accent"
          >
            <GoogleMarkIcon className="h-4 w-4" />
            Continue with Google
          </a>
        </div>

        <p className="mt-8 text-xs text-mist">
          Every project you create gets its own public/secret key pair, scoped
          to your account.
        </p>
      </div>
    </main>
  );
}
