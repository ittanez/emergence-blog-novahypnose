
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ✅ OPTIMISATION PERFORMANCE : Préchargement intelligent des polices
const preloadCriticalFonts = () => {
  const fontUrls = [
    'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2',
    'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFiD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiunDYbtXK-F2qO0isEw.woff2'
  ];

  fontUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = url;
    
    if (!document.querySelector(`link[href="${url}"]`)) {
      document.head.appendChild(link);
    }
  });
};

// ✅ OPTIMISATION PERFORMANCE : Préchargement des ressources critiques
const preloadCriticalResources = () => {
  // Préconnexion Supabase si pas déjà fait
  if (!document.querySelector('link[href="https://akrlyzmfszumibwgocae.supabase.co"]')) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://akrlyzmfszumibwgocae.supabase.co';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
};

// Initialiser les optimisations de performance
preloadCriticalFonts();
preloadCriticalResources();

// Make setupDatabase available in the global window object for debugging
import { setupDatabase, setupStorageBucket, setupArticleFunctions } from './lib/services/dbSetup.ts'
if (import.meta.env.DEV) {
  // @ts-ignore - This is for debugging purposes
  window.setupDatabase = setupDatabase;
  // @ts-ignore - This is for debugging purposes
  window.setupStorageBucket = setupStorageBucket;
  // @ts-ignore - This is for debugging purposes
  window.setupArticleFunctions = setupArticleFunctions;
}

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
