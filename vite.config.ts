import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/atlas/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Bind IPv4 explicitly: the default 'localhost' resolves to [::1] on this
    // machine, and a network filter extension drops IPv6 loopback connections,
    // making the dev server unreachable from any browser.
    host: '127.0.0.1',
    port: 3000,
    open: true,
  },
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.archive/**',
    ],
    // The suite is full-simulation-heavy (many tests run 25-year engine sweeps, and every
    // AI-bearing run includes its zero-AI counterfactual twin). Under the vitest 4 scheduler
    // the 5s default flaked on matrix/sweep tests during full-suite contention while every
    // one of them passes in isolation — the budget reflects what the tests actually are.
    testTimeout: 120_000,
  },
});
