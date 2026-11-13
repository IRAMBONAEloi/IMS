import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const backend = 'https://ims-a15g.onrender.com';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': { target: backend, changeOrigin: true, secure: true },
      '/uploads': { target: backend, changeOrigin: true, secure: true },
    },
  },
});
