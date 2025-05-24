
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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
