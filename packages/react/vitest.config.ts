import { defineConfig } from 'vitest/config';

export default defineConfig({
  // `esbuild.jsx` rather than @vitejs/plugin-react — the repo has no bundler
  // dependencies and this is all the .tsx transform needs.
  esbuild: { jsx: 'automatic' },
  // The monorepo hoists react-dom to the root; without deduping, react and
  // react-dom can resolve to different copies and the renderer rejects the
  // elements outright.
  resolve: { dedupe: ['react', 'react-dom'] },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
