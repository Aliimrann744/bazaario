import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies /api -> backend so the client uses a single origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
