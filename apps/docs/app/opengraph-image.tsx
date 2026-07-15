import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SignFlow — self-hosted e-signature SDK for developers';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#0a0a0a',
          backgroundImage:
            'linear-gradient(rgba(250,250,249,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,249,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="48" height="48" viewBox="0 0 32 32">
            <rect x="0" y="0" width="32" height="32" rx="8" fill="#1a1a1a" />
            <path
              d="M6 20 Q11 8 16 20 T26 8"
              fill="none"
              stroke="#c8ff5c"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 600, color: '#fafaf9' }}>
            Sign<span style={{ color: '#c8ff5c' }}>Flow</span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: 56,
            fontWeight: 600,
            lineHeight: 1.15,
            color: '#fafaf9',
            maxWidth: 900,
          }}
        >
          Capture legally-relevant signatures, not just a scribble.
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 32,
            fontSize: 28,
            color: '#8a8a86',
          }}
        >
          Self-hosted e-signature SDK for developers
        </div>
      </div>
    ),
    { ...size },
  );
}
