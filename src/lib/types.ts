
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
  slug: string;
  parent_id?: string | null; // Optionnel car toutes les catégories n'ont pas de parent
  updated_at?: string | null; // Optionnel pour la compatibilité avec les données existantes
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
  scheduled_for?: string;
  tags?: Tag[] | string[];
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

// Define a base category interface without children
export interface CategoryBase {
  id: string;
  name: string;
  description: string;
  created_at: string;
  slug: string;
  parent_id?: string | null;
  updated_at?: string | null;
}

// Define CategoryNode interface for the tree structure
// This breaks the infinite recursion by using an explicit type definition
export interface CategoryNode {
  id: string;
  name: string;
  description: string;
  created_at: string;
  slug: string;
  parent_id?: string | null;
  updated_at?: string | null;
  children: CategoryNode[]; // Array of child categories
}

// For backward compatibility
export type CategoryWithChildren = CategoryNode;
