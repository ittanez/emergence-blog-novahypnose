export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string | null
          image_url: string | null
          seo_description: string | null
          keywords: string[] | null
          category: string | null
          author_id: string
          slug: string
          read_time: number | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string | null
          image_url?: string | null
          seo_description?: string | null
          keywords?: string[] | null
          category?: string | null
          author_id: string
          slug: string
          read_time?: number | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string | null
          image_url?: string | null
          seo_description?: string | null
          keywords?: string[] | null
          category?: string | null
          author_id?: string
          slug?: string
          read_time?: number | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      authors: {
        Row: {
          id: string
          name: string
          bio: string | null
          avatar_url: string | null
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          bio?: string | null
          avatar_url?: string | null
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          bio?: string | null
          avatar_url?: string | null
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
      }
      subscribers: {
        Row: {
          id: string
          email: string
          created_at: string
          verified: boolean
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          verified?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          verified?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_authors_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_categories_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_tags_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_articles_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_article_tags_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_subscribers_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
