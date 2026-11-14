import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        faq: resolve(__dirname, 'faq.html'),
        blog: resolve(__dirname, 'blog.html'),
        'blog/skip-silence': resolve(__dirname, 'blog/skip-silence.html'),
        'blog/constant-720p-hd': resolve(__dirname, 'blog/constant-720p-hd.html'),
        'blog/keyboard-shortcuts': resolve(__dirname, 'blog/keyboard-shortcuts.html'),
        'blog/focus-mode': resolve(__dirname, 'blog/focus-mode.html'),
        'blog/finish-clock': resolve(__dirname, 'blog/finish-clock.html'),
        'blog/padhle-dashboard': resolve(__dirname, 'blog/padhle-dashboard.html'),
        'blog/making-lectures-smoother': resolve(__dirname, 'blog/making-lectures-smoother.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
