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
  excerpt: string;
  image_url?: string;
  author: string;
  categories: string[];
  tags: string[];
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string; // ✅ NOUVEAU CHAMP
  slug: string;
  scheduled_for?: string;
  storage_image_url?: string;
  keywords?: string[];
  meta_description?: string;
  seo_description?: string;
  read_time?: number;
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
