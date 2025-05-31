import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les grosses dépendances
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          // Séparer les contextes et utilitaires
          utils: ['@/lib/utils'],
          services: ['@/lib/services/articleService'],
        }
      }
    },
    // Optimiser la taille des chunks
    chunkSizeWarningLimit: 500,
    // Minification agressive
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      mangle: {
        safari10: true
      }
    },
    // Optimiser les assets
    assetsInlineLimit: 4096,
    cssCodeSplit: true
  },
  // Optimisations pour le développement
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  }
})
