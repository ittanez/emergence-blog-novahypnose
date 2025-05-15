
/// <reference types="vite/client" />

// Add interface declarations for env variables (even though we're not using them now)
interface ImportMetaEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
