
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register Service Worker for performance caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🚀 SW registered successfully', registration.scope);
      })
      .catch((error) => {
        console.log('❌ SW registration failed', error);
      });
  });
}

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
