 // src/lib/types.ts - VERSION COMPLÈTE CORRIGÉE

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  excerpt?: string;
  author?: string | Author; // ✅ Peut être string ou objet Author
  author_id?: string; // ✅ AJOUTÉ pour compatibilité mock
  categories: string[];
  category?: string; // ✅ AJOUTÉ pour compatibilité DB
  tags: (Tag | string)[]; // ✅ CORRIGÉ - Peut être Tag ou string
  published: boolean;
  featured?: boolean; // ✅ AJOUTÉ
  created_at: string;
  updated_at: string;
  slug: string;
  scheduled_for?: string;
  storage_image_url?: string; // ✅ AJOUTÉ
  keywords?: string[];
  meta_description?: string; // ✅ AJOUTÉ pour DB
  seo_description?: string; // ✅ Garder pour le code
  read_time?: number; // ✅ AJOUTÉ
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Newsletter {
  id: string;
  email: string;
  subscribed: boolean;
  created_at: string;
  updated_at: string;
}
