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
        manualChunks: {
          // React et librairies core - stable ensemble
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // TinyMCE séparé (très lourd - admin seulement)
          'tinymce': ['@tinymce/tinymce-react'],
          // UI components
          'ui-vendor': ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-toast'],
          // Supabase backend
          'supabase': ['@supabase/supabase-js'],
          // Utilitaires
          'utils': ['date-fns', 'clsx', 'tailwind-merge'],
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