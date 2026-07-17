'use client';

import { useState } from 'react';
import type { KeyEnv, Project } from '@/lib/api';
import { KeyField } from './KeyField';

export function ProjectCard({
  project,
  onRotate,
}: {
  project: Project;
  onRotate: (id: string, env: KeyEnv) => Promise<void>;
}) {
  const [env, setEnv] = useState<KeyEnv>('test');
  const [rotating, setRotating] = useState(false);

  async function handleRotate() {
    if (
      !confirm(
        `Rotate ${env} keys for "${project.name}"? The old ${env} keys stop working immediately.`,
      )
    )
      return;
    setRotating(true);
    try {
      await onRotate(project.id, env);
    } finally {
      setRotating(false);
    }
  }

  const publicKey = env === 'test' ? project.testPublicKey : project.publicKey;
  const secretKey = env === 'test' ? project.testSecretKey : project.secretKey;

  return (
    <div className="project-card border border-line bg-ink p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h3 className="min-w-0 break-words font-mono-tight text-base text-paper">
          {project.name}
        </h3>
        <button
          type="button"
          onClick={handleRotate}
          disabled={rotating}
          className="inline-flex min-h-11 items-center font-mono-tight text-xs text-mist transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
        >
          {rotating ? 'rotating…' : `rotate ${env} keys`}
        </button>
      </div>

      <div className="mt-4 inline-flex border border-line font-mono-tight text-xs">
        <button
          type="button"
          onClick={() => setEnv('test')}
          className={`inline-flex min-h-11 items-center px-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
            env === 'test' ? 'bg-accent text-ink' : 'text-mist hover:text-paper'
          }`}
        >
          Test
        </button>
        <button
          type="button"
          onClick={() => setEnv('live')}
          className={`inline-flex min-h-11 items-center border-l border-line px-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
            env === 'live' ? 'bg-accent text-ink' : 'text-mist hover:text-paper'
          }`}
        >
          Live
        </button>
      </div>

      {env === 'test' && (
        <p className="mt-3 text-xs text-mist">
          Test keys accept signatures for integration testing — they're stored
          separately from live data and never mixed into production retrieval.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-4">
        <KeyField label={`${env === 'test' ? 'Test' : 'Live'} public key`} value={publicKey} />
        <KeyField label={`${env === 'test' ? 'Test' : 'Live'} secret key`} value={secretKey} secret />
      </div>
    </div>
  );
}
