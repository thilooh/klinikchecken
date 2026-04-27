import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'besenreiser-check-logo5.png'],
      manifest: {
        name: 'Besenreiser-Check.de',
        short_name: 'Besenreiser-Check',
        description: 'Geprüfte Besenreiser-Praxen in deiner Stadt',
        theme_color: '#003399',
        background_color: '#F4F4F4',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/besenreiser-check-logo5.png', sizes: 'any', type: 'image/png' },
        ],
      },
      workbox: {
        // Don't precache the giant clinic-data JSON or the 600+ images —
        // they're cached at runtime instead so the SW install stays small.
        globPatterns: ['**/*.{js,css,html,svg,woff2,ico}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          // Clinic data — refreshed every 3 days, serve cached + revalidate
          {
            urlPattern: /\/data\/clinics\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'clinics-data',
              expiration: { maxEntries: 1, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          // Clinic logos / streetviews / maps — cache aggressively, including
          // Netlify Image CDN transforms.
          {
            urlPattern: ({ url }: { url: URL }) =>
              /\/images\/clinic-\d+\//.test(url.pathname) ||
              (url.pathname === '/.netlify/images' && /clinic-\d+/.test(url.search)),
            handler: 'CacheFirst',
            options: {
              cacheName: 'clinic-images',
              expiration: { maxEntries: 1200, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          // Pre-fetched review JSONs
          {
            urlPattern: /\/reviews\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'reviews-data',
              expiration: { maxEntries: 300, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          // Google Fonts CSS + woff2 — cache for 1 year
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css', expiration: { maxEntries: 5, maxAgeSeconds: 365 * 24 * 60 * 60 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-files', expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 } },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/pages/ClinicPage')) return 'page-clinic'
          if (id.includes('src/pages/CityPage')) return 'page-city'
          if (id.includes('src/pages/MethodePage')) return 'page-methode'
          if (id.includes('src/pages/MethodenQuiz')) return 'page-quiz'
          if (id.includes('src/pages/ratgeber/')) return 'page-ratgeber'

          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) return 'vendor-react'
            if (id.includes('workbox')) return 'vendor-workbox'
            return 'vendor'
          }
        },
      },
    },
  },
})
