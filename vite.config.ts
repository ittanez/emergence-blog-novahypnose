import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // Configuration pour génération statique optimisée
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    cssMinify: true,
    target: 'es2020',
    modulePreload: {
      polyfill: true
    },
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // TinyMCE - complètement séparé (admin only)
          if (id.includes('@tinymce') || id.includes('tinymce')) {
            return 'admin-editor';
          }
          
          // Admin pages - lazy loaded
          if (id.includes('/admin/') || id.includes('Admin')) {
            return 'admin';
          }
          
          // Core React - groupé ensemble
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react';
          }
          
          // React Router - séparé pour code splitting
          if (id.includes('react-router')) {
            return 'router';
          }
          
          // Supabase - séparé car utilisé conditionnellement
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          
          // Date utilities - utilisées seulement sur certaines pages
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          
          // Radix UI - groupé par usage
          if (id.includes('@radix-ui')) {
            return 'ui';
          }
          
          // Autres vendor libs
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));