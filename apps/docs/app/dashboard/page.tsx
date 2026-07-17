'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ProjectCard } from '@/components/ProjectCard';
import {
  ApiError,
  type CurrentUser,
  type KeyEnv,
  type Project,
  createProject,
  getCurrentUser,
  listProjects,
  rotateProjectKeys,
} from '@/lib/api';

type LoadState = 'loading' | 'unauthenticated' | 'ready' | 'error';

export default function DashboardPage() {
  const [state, setState] = useState<LoadState>('loading');
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getCurrentUser();
        setUser(me);
        const projectList = await listProjects();
        setProjects(projectList);
        setState('ready');
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = '/login';
          return;
        }
        setState('error');
      }
    })();
  }, []);

  useEffect(() => {
    if (state !== 'ready' || !listRef.current) return;
    const cards = listRef.current.querySelectorAll('.project-card');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out' },
    );
  }, [state, projects.length]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreating(true);
    try {
      const project = await createProject(newProjectName.trim());
      setProjects((prev) => [...prev, project]);
      setNewProjectName('');
    } finally {
      setCreating(false);
    }
  }

  async function handleRotate(id: string, env: KeyEnv) {
    const updated = await rotateProjectKeys(id, env);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  if (state === 'loading') {
    return (
      <main className="flex flex-1 items-center justify-center py-24">
        <span className="font-mono-tight text-sm text-mist">loading…</span>
      </main>
    );
  }

  if (state === 'error') {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <span className="font-mono-tight text-sm text-mist">
          Couldn&apos;t reach the API. Is it running?
        </span>
      </main>
    );
  }

  return (
    <main className="px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div>
          <h1 className="text-2xl text-paper">Dashboard</h1>
          <p className="mt-1 text-sm text-mist">Signed in as {user?.name ?? user?.email}</p>
        </div>

        <section className="mt-12">
          <h2 className="font-mono-tight text-sm uppercase tracking-[0.2em] text-mist">
            Install the package
          </h2>
          <div className="mt-4 flex flex-col gap-2 border border-line bg-ink p-4 font-mono-tight text-sm sm:p-6">
            <span className="text-paper">npm install signflow-core</span>
            <span className="break-words text-mist">
              published from{' '}
              <a
                href="https://www.npmjs.com/package/signflow-core"
                className="text-accent transition-colors hover:underline"
              >
                https://www.npmjs.com/package/signflow-core
              </a>
            </span>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-mono-tight text-sm uppercase tracking-[0.2em] text-mist">
              Projects
            </h2>
          </div>

          <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="project name"
              className="min-h-11 flex-1 border border-line bg-ink px-4 font-mono-tight text-base text-paper placeholder:text-mist focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={creating || !newProjectName.trim()}
              className="inline-flex min-h-11 items-center justify-center border border-accent bg-accent px-5 font-mono-tight text-sm text-ink transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
            >
              {creating ? 'creating…' : 'new project'}
            </button>
          </form>

          <div ref={listRef} className="mt-8 flex flex-col gap-4">
            {projects.length === 0 && (
              <p className="text-sm text-mist">
                No projects yet — create one to get a public/secret key pair.
              </p>
            )}
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onRotate={handleRotate} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
