export function Footer() {
  return (
    <footer className="border-t border-line px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 text-xs text-mist sm:flex-row sm:items-center">
        <span className="font-mono-tight">© {new Date().getFullYear()} SignFlow</span>
        <span>Self-hosted · PostgreSQL</span>
      </div>
    </footer>
  );
}
