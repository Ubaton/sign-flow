import Image from 'next/image';
import { logoutUrl } from '@/lib/api';

/**
 * App-shell for the authenticated dashboard: a slim sticky top bar (logo,
 * docs link, sign out) and a one-line footer. Deliberately distinct from
 * MarketingLayout — no marketing anchors in a logged-in view — but built
 * from the same design tokens so it reads as the same product.
 */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-ink/80 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <a href="/dashboard" className="inline-flex min-h-11 items-center">
            <Image src="/signflow-white-logo.svg" alt="SignFlow" width={120} height={40} />
          </a>
          <nav className="flex items-center gap-1 font-mono-tight text-xs">
            <a
              href="/"
              className="inline-flex min-h-11 items-center px-3 text-mist transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              docs
            </a>
            <a
              href={logoutUrl()}
              className="inline-flex min-h-11 items-center border border-line px-4 text-paper transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              sign out
            </a>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      <footer className="border-t border-line px-4 pb-[env(safe-area-inset-bottom)] sm:px-6">
        <div className="mx-auto flex min-h-11 max-w-5xl flex-wrap items-center justify-between gap-x-4 py-2 font-mono-tight text-xs text-mist">
          <span>© {new Date().getFullYear()} SignFlow</span>
          <span>Self-hosted · PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}
