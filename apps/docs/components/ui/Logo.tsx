import Image from 'next/image';

/**
 * Renders both logo variants and lets the `dark:` CSS variant pick the
 * right one — a JS-conditional single <Image> would need to know the
 * theme at first paint, which either flashes the wrong logo or forces a
 * hydration-mismatch workaround. Both are tiny SVGs, so shipping both is
 * cheaper than either of those.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <>
      <Image
        src="/logo.svg"
        alt="SignFlow"
        width={120}
        height={40}
        priority
        className={`dark:hidden ${className ?? ''}`}
      />
      <Image
        src="/signflow-white-logo.svg"
        alt="SignFlow"
        width={120}
        height={40}
        priority
        className={`hidden dark:block ${className ?? ''}`}
      />
    </>
  );
}
