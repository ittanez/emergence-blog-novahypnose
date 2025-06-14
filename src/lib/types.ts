
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
  parent_id?: string;
  created_at: string;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  verified: boolean;
  created_at: string;
}

export interface Redirect {
  id: string;
  from: string;
  to: string;
  created_at: string;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'auto' | 'high' | 'low';
  isHero?: boolean;
}
