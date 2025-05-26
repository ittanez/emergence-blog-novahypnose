export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_requests: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      article_categories: {
        Row: {
          article_id: string
          category_id: string
        }
        Insert: {
          article_id: string
          category_id: string
        }
        Update: {
          article_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_categories_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string | null
          categories: string[] | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          published: boolean | null
          scheduled_for: string | null
          slug: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          categories?: string[] | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          scheduled_for?: string | null
          slug?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          categories?: string[] | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          scheduled_for?: string | null
          slug?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          email_type: string
          error_message: string | null
          id: string
          quiz_result_id: number | null
          recipient: string
          resend_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          email_type: string
          error_message?: string | null
          id?: string
          quiz_result_id?: number | null
          recipient: string
          resend_id?: string | null
          sent_at?: string | null
          status: string
        }
        Update: {
          email_type?: string
          error_message?: string | null
          id?: string
          quiz_result_id?: number | null
          recipient?: string
          resend_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_quiz_result_id_fkey"
            columns: ["quiz_result_id"]
            isOneToOne: false
            referencedRelation: "quiz_results"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          description: string | null
          height: number | null
          id: string
          mime_type: string | null
          name: string
          public_url: string
          size: number | null
          storage_path: string
          uploaded_at: string | null
          width: number | null
        }
        Insert: {
          description?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          name: string
          public_url: string
          size?: number | null
          storage_path: string
          uploaded_at?: string | null
          width?: number | null
        }
        Update: {
          description?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          public_url?: string
          size?: number | null
          storage_path?: string
          uploaded_at?: string | null
          width?: number | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          assigned_at: string | null
          code: string
          created_at: string
          expiration_date: string | null
          id: string
          is_assigned: boolean
          stripe_promo_code_id: string | null
          stripe_synced: boolean
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          code: string
          created_at?: string
          expiration_date?: string | null
          id?: string
          is_assigned?: boolean
          stripe_promo_code_id?: string | null
          stripe_synced?: boolean
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          code?: string
          created_at?: string
          expiration_date?: string | null
          id?: string
          is_assigned?: boolean
          stripe_promo_code_id?: string | null
          stripe_synced?: boolean
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          answers: Json
          category: string | null
          created_at: string
          dimension_scores: Json | null
          email_sent: boolean | null
          email_sent_at: string | null
          first_name: string | null
          firstname: string | null
          id: number
          last_name: string | null
          lastname: string | null
          pdf_url: string | null
          recommendations: string
          sense_dominant: string | null
          total_score: number
          user_email: string
          vakog_answers: string | null
        }
        Insert: {
          answers: Json
          category?: string | null
          created_at?: string
          dimension_scores?: Json | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          first_name?: string | null
          firstname?: string | null
          id?: number
          last_name?: string | null
          lastname?: string | null
          pdf_url?: string | null
          recommendations?: string
          sense_dominant?: string | null
          total_score: number
          user_email: string
          vakog_answers?: string | null
        }
        Update: {
          answers?: Json
          category?: string | null
          created_at?: string
          dimension_scores?: Json | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          first_name?: string | null
          firstname?: string | null
          id?: number
          last_name?: string | null
          lastname?: string | null
          pdf_url?: string | null
          recommendations?: string
          sense_dominant?: string | null
          total_score?: number
          user_email?: string
          vakog_answers?: string | null
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          account_id: string
          content: string
          created_at: string | null
          id: string
          media_urls: string[] | null
          scheduled_for: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          content: string
          created_at?: string | null
          id?: string
          media_urls?: string[] | null
          scheduled_for: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          content?: string
          created_at?: string | null
          id?: string
          media_urls?: string[] | null
          scheduled_for?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "social_media_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_accounts: {
        Row: {
          account_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          metadata: Json | null
          platform: string
          user_id: string
        }
        Insert: {
          account_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          metadata?: Json | null
          platform: string
          user_id: string
        }
        Update: {
          account_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          metadata?: Json | null
          platform?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          first_name: string | null
          id: number
          last_name: string | null
          role: string | null
          updated_at: string | null
          user_mail: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: number
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
          user_mail?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: number
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
          user_mail?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_get_article_id_by_slug_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_tables_if_not_exist: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_promo_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_article_id_by_slug: {
        Args: { slug_param: string }
        Returns: string
      }
      has_role: {
        Args: { user_id: string; required_role: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      random_string: {
        Args: { length: number }
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
