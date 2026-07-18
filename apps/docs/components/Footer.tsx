import { Logo } from "@/components/ui/Logo";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#quickstart", label: "Quick start" },
      { href: "/demo", label: "Live demo" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    heading: "Docs",
    links: [
      { href: "/docs/self-hosting", label: "Self-hosted backend" },
      { href: "/docs/api", label: "API reference" },
      { href: "/docs/security", label: "Security & Compliance" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "https://github.com/Ubaton/sign-flow", label: "GitHub" },
      { href: "https://www.npmjs.com/package/signflow-core", label: "npm" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line px-4 pb-[env(safe-area-inset-bottom)] pt-12 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 pb-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
          <div>
            <a href="/" className="inline-flex min-h-11 items-center">
              <Logo />
            </a>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-mist">
              Self-hosted e-signature SDK. Own your data, verify server-side.
            </p>
          </div>

          {/* Labeled columns: stacked lists with full-height tap targets on
              phones, side by side from sm up. */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-3"
          >
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                <p className="font-mono-tight text-xs uppercase tracking-[0.2em] text-paper">
                  {column.heading}
                </p>
                <ul className="mt-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="inline-flex min-h-11 items-center text-xs text-mist transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:min-h-9"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
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
