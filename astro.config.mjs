// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false
  },
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      strategy: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
      },
      manifest: {
        name: 'oap',
        short_name: 'oap',
        description: 'Objectives APP - Track your weekly goals.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/oap.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/oap.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['recharts']
    },
    optimizeDeps: {
      include: ['recharts']
    }
  }
});