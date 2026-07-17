import { Logo } from "@/components/ui/Logo";

const FOOTER_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#quickstart", label: "Quick start" },
  { href: "/demo", label: "Live demo" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "https://github.com/Ubaton/sign-flow", label: "GitHub" },
  { href: "https://www.npmjs.com/settings/ubaton-ray/packages", label: "npm" },
];

export function Footer() {
  return (
    <footer className="border-t border-line px-4 pb-[env(safe-area-inset-bottom)] pt-12 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-12">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <a href="/" className="inline-flex min-h-11 items-center">
              <Logo />
            </a>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-mist">
              Self-hosted e-signature SDK. Own your data, verify server-side.
            </p>
          </div>

          {/* Two columns of full-height tap targets on phones; a single
              wrapping row from sm up. */}
          <nav className="grid grid-cols-2 gap-x-8 text-xs sm:flex sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center text-mist transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:min-h-0"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-line pt-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono-tight">© {new Date().getFullYear()} SignFlow</span>
          <span>Self-hosted · PostgreSQL</span>
        </div>
      </div>
    </footer>
  );
}
