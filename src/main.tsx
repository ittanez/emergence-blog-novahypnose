
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

createRoot(document.getElementById("root")!).render(<App />);
