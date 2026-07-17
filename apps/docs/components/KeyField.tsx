'use client';

import { useState } from 'react';

export function KeyField({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
  const [revealed, setRevealed] = useState(!secret);
  const [copied, setCopied] = useState(false);

  const displayValue = revealed ? value : maskKey(value);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs text-mist">
        <span>{label}</span>
        {secret && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="inline-flex min-h-11 items-center px-2 text-mist transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {revealed ? 'hide' : 'reveal'}
          </button>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2 border border-line bg-ink px-3 py-1">
        <code className="flex-1 overflow-x-auto whitespace-nowrap py-1 font-mono-tight text-sm text-paper">
          {displayValue}
        </code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center px-2 font-mono-tight text-xs text-mist transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
    </div>
  );
}

function maskKey(value: string): string {
  const parts = value.split('_');
  const suffix = parts.pop() ?? '';
  return `${parts.join('_')}_${'•'.repeat(Math.min(suffix.length, 24))}`;
}
