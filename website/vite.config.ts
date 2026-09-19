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
        pwExtensions: resolve(__dirname, 'pw-extensions.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
