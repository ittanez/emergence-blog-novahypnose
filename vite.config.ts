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
      polyfill: false // Réduire le polyfill pour économiser des bytes
    },
    assetsInlineLimit: 16384, // Inliner CSS jusqu'à 16KB pour éliminer render blocking
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log', 'console.warn'],
        dead_code: true,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // React core - STABLE grouping
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // TinyMCE séparé pour admin
          'admin-editor': ['@tinymce/tinymce-react'],
          // Supabase backend
          'supabase': ['@supabase/supabase-js'],
          // Date utilities
          'date-utils': ['date-fns'],
          // UI utilities
          'ui-utils': ['clsx', 'tailwind-merge']
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  plugins: [
    react(),
    // Désactiver lovable-tagger en production pour éviter injection script dans XML
    false && mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));