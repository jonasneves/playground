import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Determine base path:
// - Custom domain or root site: use '/'
// - Repo-based GitHub Pages: use '/repo-name/'
// Override with VITE_BASE_PATH env variable if needed
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze' && visualizer({ open: true, gzipSize: true })
  ].filter(Boolean),
  base,
  server: {
    open: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        manualChunks: (id) => {
          // Group by node_modules
          if (id.includes('node_modules')) {
            // Core React libraries
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Router
            if (id.includes('react-router')) {
              return 'router';
            }
            // Markdown renderer (heavy library)
            if (id.includes('marked')) {
              return 'markdown';
            }
            // Icons (large library)
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // State management
            if (id.includes('zustand')) {
              return 'state';
            }
            // Other vendor libraries
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
}));
