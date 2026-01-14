import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fixHtmlPaths } from './vite-plugin-fix-html';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Mapas/',
  plugins: [react(), fixHtmlPaths()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Ensure all assets use the base path
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});
