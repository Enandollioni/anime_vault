import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { curatorPlugin } from './scripts/curatorVitePlugin.js';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), curatorPlugin()],
  base: '/anime_vault/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
