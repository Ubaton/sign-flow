type IconProps = { className?: string };

export function PressureIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 24 C8 8, 12 8, 14 18 C16 26, 20 12, 24 12 C27 12, 28 20, 28 24"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="14" cy="18" r="2" fill="currentColor" />
      <circle cx="24" cy="12" r="1.4" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function VectorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 20 Q10 6 16 16 Q22 26 27 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="5" cy="20" r="1.6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="1.6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="27" cy="12" r="1.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function KeyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="16" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16 H28 M22 16 V21 M26 16 V19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 4 L27 8 V15 C27 22 22 27 16 29 C10 27 5 22 5 15 V8 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M11 16 L15 20 L22 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LocationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 28 C16 28 25 18.5 25 12 C25 7 21 3.5 16 3.5 C11 3.5 7 7 7 12 C7 18.5 16 28 16 28 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M18 3 L7 18 H15 L13 29 L25 13 H17 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Minimal line-art mark, not a reproduction of the GitHub logo. */
export function GithubMarkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 21 C12 18 12.5 17 11 15.5 C13.5 15 15 15.8 15.5 17 C16.5 16.7 17.5 16.7 18.5 17 C19 15.8 20.5 15 23 15.5 C21.5 17 22 18 22 21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Minimal line-art mark, not a reproduction of the Google logo. */
export function GoogleMarkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16 H24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 16 V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
