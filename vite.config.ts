import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Heavy clinic data lives in its own chunk so the rest of the
          // bundle can update without invalidating the large cache.
          if (id.includes('src/data/clinics')) return 'clinic-data'

          // Routes that aren't on the entry path get their own chunks
          // (router lazy-loads them via react-router's automatic split).
          if (id.includes('src/pages/ClinicPage')) return 'page-clinic'
          if (id.includes('src/pages/CityPage')) return 'page-city'
          if (id.includes('src/pages/MethodePage')) return 'page-methode'
          if (id.includes('src/pages/MethodenQuiz')) return 'page-quiz'
          if (id.includes('src/pages/ratgeber/')) return 'page-ratgeber'

          // Split node_modules into focused vendor bundles so a small
          // dependency change (e.g. lucide icon update) doesn't bust the
          // 235 KB react chunk.
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) return 'vendor-react'
            return 'vendor'
          }
        },
      },
    },
  },
})
