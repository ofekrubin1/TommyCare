import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { icsFromQuery } from './src/lib/ics.js';

// Dev server copy of the Netlify "ics" function, so "add to iPhone calendar" works while testing on the phone.
const devIcs = {
  name: 'dev-ics',
  configureServer(server) {
    server.middlewares.use('/.netlify/functions/ics', (req, res) => {
      const q = new URL(req.url, 'http://localhost').searchParams;
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'inline; filename="tommycare.ics"');
      res.end(icsFromQuery(q));
    });
  },
};

export default defineConfig(({ mode }) => ({
  plugins: [react(), devIcs],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      // `vite --mode localdb` (port 5173) uses the local test database; everything else uses Firebase.
      '@backend': path.resolve(import.meta.dirname, mode === 'localdb' ? 'src/data/local/localBackend.js' : 'src/data/firebase/firebaseBackend.js'),
    },
  },
  // Pre-bundle the lazily loaded PDF libraries, so the dev server doesn't reload mid-export.
  optimizeDeps: { include: ['html2canvas', 'jspdf'] },
  build: {
    // The Firebase SDK alone is ~540 kB (its own cached chunk); everything else is far below this.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
}));
