
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
  base: '/',
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
        manualChunks: (id) => {
          // React core - pour toutes les pages
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          // Supabase - chargé seulement quand nécessaire
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }
          // Admin editor - chargé seulement pour l'admin
          if (id.includes('@tinymce/tinymce-react')) {
            return 'admin-editor';
          }
          // Date utilities - utilisées sur plusieurs pages
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          // UI utilities - utilisées partout
          if (id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'ui-utils';
          }
          // Form utilities - principalement admin
          if (id.includes('@hookform/resolvers') || id.includes('zod') || id.includes('react-hook-form')) {
            return 'form';
          }
          // Markdown parser - utilisé sur pages d'articles
          if (id.includes('marked') || id.includes('dompurify')) {
            return 'markdownParser';
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
    // ✅ CORRIGÉ : Condition plus propre pour éviter les types boolean dans plugins
    ...(mode === 'development' ? [componentTagger()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
