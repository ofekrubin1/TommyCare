import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  // Pre-bundle the lazily loaded PDF libraries, so the dev server doesn't reload mid-export.
  optimizeDeps: { include: ['html2canvas', 'jspdf'] },
  build: {
    target: 'es2022', // top-level await picks the data backend
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
