import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    /** Distinct from admin-portal (5173) — open this URL for Checkitout, not 5173. */
    port: 5180,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5180,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
