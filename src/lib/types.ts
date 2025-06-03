 export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar_url: string;
  email: string;
  created_at: string;
  updated_at: string;
  role?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  slug: string;
  parent_id?: string | null;
  updated_at?: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// 🎯 INTERFACE ARTICLE MISE À JOUR AVEC TOUS LES CHAMPS SEO
export interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
  author: string;
  author_id?: string;
  
  // === IMAGES ===
  image_url?: string;
  storage_image_url?: string;
  
  // === CHAMPS SEO DISTINCTS ===
  excerpt: string;                    // 📖 Extrait visible aux lecteurs
  seo_description?: string;           // 🔍 Description SEO (existant - compatibilité)
  meta_description?: string;          // 🔍 NOUVEAU: Méta-description SEO distincte
  
  // === ORGANISATION ET NAVIGATION ===
  categories: string[];               // 📂 Catégories
  category?: string;                  // 📂 Catégorie principale
  tags?: Tag[] | string[];           // 🏷️ Tags de navigation visibles
  keywords?: string[];               // 🎯 NOUVEAU: Mots-clés SEO invisibles
  
  // === MÉTADONNÉES ===
  read_time?: number;
  
  // === ÉTATS DE PUBLICATION ===
  published: boolean;
  featured?: boolean;
  scheduled_for?: string;
  
  // === TIMESTAMPS ===
  created_at: string;
  updated_at: string;
}

export interface ArticleTag {
  article_id: string;
  tag_id: string;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
  verified: boolean;
}

export interface SortOption {
  label: string;
  value: string;
}

export interface CategoryBase {
  id: string;
  name: string;
  description: string;
  created_at: string;
  slug: string;
  parent_id?: string | null;
  updated_at?: string | null;
}

export interface CategoryNode {
  id: string;
  name: string;
  description: string;
  created_at: string;
  slug: string;
  parent_id?: string | null;
  updated_at?: string | null;
  children: CategoryNode[];
}

export type CategoryWithChildren = CategoryNode;
