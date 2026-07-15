/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lean, self-contained server bundle for Docker (Vercel ignores this and
  // uses its own build pipeline regardless).
  output: 'standalone',
  // Proxies /api/* to the backend server-side, so the browser only ever
  // talks to this app's own origin. Keeps the session cookie same-site —
  // cross-site cookies (different domain entirely, e.g. vercel.app vs
  // railway.app) get blocked by modern browsers' third-party cookie
  // policies regardless of SameSite=None; Secure.
  async rewrites() {
    const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:4254';
    return [{ source: '/api/:path*', destination: `${apiOrigin}/:path*` }];
  },
};

export default nextConfig;
