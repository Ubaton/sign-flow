import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-line px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
          <a href="/">
                  <Image
                    src="/signflow-white-logo.svg"
                    alt="Logo"
                    width={120}
                    height={40}
                  />
                </a>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-mist">
              Self-hosted e-signature SDK. Own your data, verify server-side.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-xs">
            <a href="/#features" className="text-mist transition-colors hover:text-accent">
              Features
            </a>
            <a href="/#quickstart" className="text-mist transition-colors hover:text-accent">
              Quick start
            </a>
            <a href="/demo" className="text-mist transition-colors hover:text-accent">
              Live demo
            </a>
            <a href="/dashboard" className="text-mist transition-colors hover:text-accent">
              Dashboard
            </a>
            <a
              href="https://github.com/Ubaton/sign-flow"
              className="text-mist transition-colors hover:text-accent"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/settings/ubaton-ray/packages"
              className="text-mist transition-colors hover:text-accent"
            >
              npm
            </a>
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
