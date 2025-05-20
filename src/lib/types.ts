
export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar_url: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  // Ajouter les propriétés manquantes
  slug: string;
  parent_id?: string; // Optionnel car toutes les catégories n'ont pas de parent
  updated_at?: string; // Optionnel pour la compatibilité avec les données existantes
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  seo_description: string;
  keywords: string[];
  category: string;
  author_id: string;
  slug: string;
  read_time: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  author?: Author;
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
