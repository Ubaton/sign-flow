'use client';

import { useState } from 'react';

export function CopyableCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group flex min-h-11 items-center gap-3 border border-line px-4 font-mono-tight text-sm text-paper transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      aria-label={`Copy command: ${command}`}
    >
      <code>{command}</code>
      <svg
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5 shrink-0 text-mist transition-colors group-hover:text-accent"
        aria-hidden="true"
      >
        {copied ? (
          <path
            d="M3 8.5 6.5 12 13 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <rect x="5" y="5" width="9" height="9" rx="1" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M3 11V3a1 1 0 0 1 1-1h8" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </>
        )}
      </svg>
    </button>
  );
}
