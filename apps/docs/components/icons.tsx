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

export function GithubMarkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 30 30" fill="currentColor" className={className} aria-hidden="true">
      <path d="M15,3c-6.627,0 -12,5.373 -12,12c0,5.623 3.872,10.328 9.092,11.63c-0.056,-0.162 -0.092,-0.35 -0.092,-0.583v-2.051c-0.487,0 -1.303,0 -1.508,0c-0.821,0 -1.551,-0.353 -1.905,-1.009c-0.393,-0.729 -0.461,-1.844 -1.435,-2.526c-0.289,-0.227 -0.069,-0.486 0.264,-0.451c0.615,0.174 1.125,0.596 1.605,1.222c0.478,0.627 0.703,0.769 1.596,0.769c0.433,0 1.081,-0.025 1.691,-0.121c0.328,-0.833 0.895,-1.6 1.588,-1.962c-3.996,-0.411 -5.903,-2.399 -5.903,-5.098c0,-1.162 0.495,-2.286 1.336,-3.233c-0.276,-0.94 -0.623,-2.857 0.106,-3.587c1.798,0 2.885,1.166 3.146,1.481c0.896,-0.307 1.88,-0.481 2.914,-0.481c1.036,0 2.024,0.174 2.922,0.483c0.258,-0.313 1.346,-1.483 3.148,-1.483c0.732,0.731 0.381,2.656 0.102,3.594c0.836,0.945 1.328,2.066 1.328,3.226c0,2.697 -1.904,4.684 -5.894,5.097c1.098,0.573 1.899,2.183 1.899,3.396v2.734c0,0.104 -0.023,0.179 -0.035,0.268c4.676,-1.639 8.035,-6.079 8.035,-11.315c0,-6.627 -5.373,-12 -12,-12z" />
    </svg>
  );
}

export function GoogleMarkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 50 50" fill="currentColor" className={className} aria-hidden="true">
      <path d="M25.99609,48c-12.68359,0 -23.00391,-10.31641 -23.00391,-23c0,-12.68359 10.32031,-23 23.00391,-23c5.74609,0 11.24609,2.12891 15.49219,5.99609l0.77344,0.70703l-7.58594,7.58594l-0.70312,-0.60156c-2.22656,-1.90625 -5.05859,-2.95703 -7.97656,-2.95703c-6.76562,0 -12.27344,5.50391 -12.27344,12.26953c0,6.76563 5.50781,12.26953 12.27344,12.26953c4.87891,0 8.73438,-2.49219 10.55078,-6.73828h-11.55078v-10.35547l22.55078,0.03125l0.16797,0.79297c1.17578,5.58203 0.23438,13.79297 -4.53125,19.66797c-3.94531,4.86328 -9.72656,7.33203 -17.1875,7.33203z" />
    </svg>
  );
}
