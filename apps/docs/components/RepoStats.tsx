'use client';

import { useEffect, useState } from 'react';

const GITHUB_REPO = 'Ubaton/sign-flow';
// Preferred package first — falls back to the next one that's actually
// published, so this keeps working if `signflow` isn't live yet.
const NPM_PACKAGES = ['signflow', 'signflow-core'];

interface Stats {
  stars: number | null;
  version: string | null;
  npmPackage: string;
}

/** Formats large counts like GitHub does: 1234 -> "1.2k". */
function formatCount(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k`;
}

async function fetchFirstPublishedVersion(): Promise<{ name: string; version: string } | null> {
  for (const name of NPM_PACKAGES) {
    try {
      const res = await fetch(`https://registry.npmjs.org/${name}/latest`);
      if (res.ok) {
        const data = await res.json();
        return { name, version: data.version };
      }
    } catch {
      // try the next package
    }
  }
  return null;
}

export function RepoStats() {
  const [stats, setStats] = useState<Stats>({
    stars: null,
    version: null,
    npmPackage: NPM_PACKAGES[0]!,
  });

  useEffect(() => {
    let cancelled = false;

    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setStats((prev) => ({ ...prev, stars: data.stargazers_count }));
        }
      })
      .catch(() => {});

    fetchFirstPublishedVersion().then((result) => {
      if (!cancelled && result) {
        setStats((prev) => ({ ...prev, version: result.version, npmPackage: result.name }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3 font-mono-tight text-xs">
      <a
        href={`https://github.com/${GITHUB_REPO}`}
        className="flex items-center gap-1.5 border border-line px-3 py-1.5 text-mist transition-colors hover:border-accent hover:text-paper"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
          <path d="M8 .2a8 8 0 0 0-2.5 15.6c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4a3.1 3.1 0 0 1 .8-2.2c-.1-.2-.4-1 .1-2.2 0 0 .7-.2 2.2.8a7.6 7.6 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.2.2 2 .1 2.2a3.1 3.1 0 0 1 .8 2.2c0 3.1-1.9 3.8-3.6 4 .3.2.6.7.6 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 8 .2Z" />
        </svg>
        {stats.stars === null ? 'GitHub' : `${formatCount(stats.stars)} stars`}
      </a>
      <a
        href={`https://www.npmjs.com/package/${stats.npmPackage}`}
        className="flex items-center gap-1.5 border border-line px-3 py-1.5 text-mist transition-colors hover:border-accent hover:text-paper"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
          <path d="M0 3h16v10H8.5v1.5H5.5V13H0V3Zm1.5 1.5v7h2.5v-5.5H6v5.5h1.5v-7h-6Zm8.5 0v7h1.5v-5.5H13v4H11.5v1.5H14.5v-7H10Z" />
        </svg>
        {stats.version === null ? stats.npmPackage : `v${stats.version}`}
      </a>
    </div>
  );
}
