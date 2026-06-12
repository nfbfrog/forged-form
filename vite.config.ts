import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Deploys under a sub-path on GitHub Pages (e.g. /forged-form/); defaults to root for local dev.
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  server: {
    port: 4175,
    strictPort: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.svg'],
      manifest: {
        name: 'Forged-Form',
        short_name: 'Forged-Form',
        description: 'A private, mobile-first body recomposition planner for women.',
        theme_color: '#143a36',
        background_color: '#f7f5ef',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'app-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
      devOptions: { enabled: true },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
