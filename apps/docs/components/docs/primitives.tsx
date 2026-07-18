// Shared building blocks for the /docs/* guide pages — one source for the
// typographic scale, panel treatment, and section chrome so the guides
// can't drift apart (each page previously carried its own copies).
// Panels follow the homepage pattern: square corners, border-line, bg-ink/60.

import type { ComponentType, ReactNode } from 'react';

export function DocsArticle({
  eyebrow = 'Guide',
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="font-mono-tight text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight text-paper sm:text-4xl">{title}</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-mist">{lede}</p>
      {children}
    </article>
  );
}

export function DocsSection({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-10">
      <h2 className="flex items-center gap-2.5 text-lg font-medium tracking-tight text-paper">
        {Icon && (
          <span aria-hidden="true" className="shrink-0 text-accent">
            <Icon size={18} />
          </span>
        )}
        {title}
      </h2>
      <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-mist">{children}</div>
    </section>
  );
}

export function DocsToc({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className="mt-10 border border-line bg-ink/60 p-4 sm:p-5">
      <p className="font-mono-tight text-xs uppercase tracking-[0.2em] text-mist">On this page</p>
      <ul className="mt-2">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="inline-flex min-h-11 items-center text-sm text-paper underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:min-h-9"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto border border-line bg-ink/60 p-4 text-[13px] leading-relaxed">
      <code className="font-mono-tight text-paper">{children}</code>
    </pre>
  );
}

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="border border-line bg-ink/60 px-1.5 py-0.5 font-mono-tight text-[13px] text-paper">
      {children}
    </code>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="border border-line border-l-2 border-l-accent bg-ink/60 p-4 text-sm leading-relaxed text-paper">
      {children}
    </div>
  );
}

/** Body-copy link with the docs underline treatment; works for hash and page hrefs. */
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-paper underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
    >
      {children}
    </a>
  );
}
