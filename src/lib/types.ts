export interface Article {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  published: boolean;
  published_at?: string;
  scheduled_for?: string;
  categories: string[];
  tags: Tag[];
  keywords: string[];
  seo_description: string;
  meta_description: string;
  read_time: number;
  author: string;
  featured: boolean;
  storage_image_url: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string; // ✅ AJOUTÉ : Propriété parent_id manquante
  created_at: string;
}

export interface Redirect {
  id: string;
  from: string;
  to: string;
  created_at: string;
}
