export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      article_redirects: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: number
          new_slug: string
          old_slug: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: number
          new_slug: string
          old_slug: string
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: number
          new_slug?: string
          old_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_redirects_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
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
          keywords: string[] | null
          meta_description: string | null
          published: boolean | null
          published_at: string | null
          read_time: number | null
          scheduled_for: string | null
          seo_description: string | null
          slug: string | null
          storage_image_url: string | null
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
          keywords?: string[] | null
          meta_description?: string | null
          published?: boolean | null
          published_at?: string | null
          read_time?: number | null
          scheduled_for?: string | null
          seo_description?: string | null
          slug?: string | null
          storage_image_url?: string | null
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
          keywords?: string[] | null
          meta_description?: string | null
          published?: boolean | null
          published_at?: string | null
          read_time?: number | null
          scheduled_for?: string | null
          seo_description?: string | null
          slug?: string | null
          storage_image_url?: string | null
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
      avion_email_sequences: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          email_subject: string | null
          email_template: string | null
          email_type: string | null
          id: string
          opened_at: string | null
          profile_type: string | null
          resend_message_id: string | null
          response_id: string | null
          scheduled_at: string | null
          sent_at: string | null
          sequence_step: number | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email_subject?: string | null
          email_template?: string | null
          email_type?: string | null
          id?: string
          opened_at?: string | null
          profile_type?: string | null
          resend_message_id?: string | null
          response_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sequence_step?: number | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email_subject?: string | null
          email_template?: string | null
          email_type?: string | null
          id?: string
          opened_at?: string | null
          profile_type?: string | null
          resend_message_id?: string | null
          response_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sequence_step?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "avion_email_sequences_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "avion_quiz_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      avion_profiles: {
        Row: {
          color_code: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          max_score: number | null
          min_score: number | null
          name: string
          program_name: string | null
          program_price: number | null
          recommendation: string | null
        }
        Insert: {
          color_code?: string | null
          description?: string | null
          icon?: string | null
          id: string
          is_active?: boolean | null
          max_score?: number | null
          min_score?: number | null
          name: string
          program_name?: string | null
          program_price?: number | null
          recommendation?: string | null
        }
        Update: {
          color_code?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_score?: number | null
          min_score?: number | null
          name?: string
          program_name?: string | null
          program_price?: number | null
          recommendation?: string | null
        }
        Relationships: []
      }
      avion_quiz_question_responses: {
        Row: {
          created_at: string | null
          dimension: string
          id: string
          question_id: number
          quiz_response_id: string | null
          timestamp: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          dimension: string
          id?: string
          question_id: number
          quiz_response_id?: string | null
          timestamp?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          dimension?: string
          id?: string
          question_id?: number
          quiz_response_id?: string | null
          timestamp?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "avion_quiz_question_responses_quiz_response_id_fkey"
            columns: ["quiz_response_id"]
            isOneToOne: false
            referencedRelation: "avion_quiz_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      avion_quiz_questions: {
        Row: {
          created_at: string | null
          dimension: string | null
          id: number
          is_active: boolean | null
          question_order: number | null
          question_text: string
          response_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dimension?: string | null
          id: number
          is_active?: boolean | null
          question_order?: number | null
          question_text: string
          response_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dimension?: string | null
          id?: number
          is_active?: boolean | null
          question_order?: number | null
          question_text?: string
          response_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      avion_quiz_responses: {
        Row: {
          answers: Json | null
          behavioral_score: number | null
          cognitive_score: number | null
          completion_time: number | null
          conversion_date: string | null
          converted: boolean | null
          created_at: string | null
          dimension_scores: Json | null
          email: string
          email_consent: boolean | null
          email_sent: boolean | null
          first_name: string | null
          id: string
          ip_address: unknown | null
          marketing_consent: boolean | null
          physical_score: number | null
          profile_id: string | null
          profile_name: string | null
          profile_type: string | null
          quiz_completed: boolean | null
          referrer: string | null
          social_score: number | null
          total_score: number | null
          updated_at: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          answers?: Json | null
          behavioral_score?: number | null
          cognitive_score?: number | null
          completion_time?: number | null
          conversion_date?: string | null
          converted?: boolean | null
          created_at?: string | null
          dimension_scores?: Json | null
          email: string
          email_consent?: boolean | null
          email_sent?: boolean | null
          first_name?: string | null
          id?: string
          ip_address?: unknown | null
          marketing_consent?: boolean | null
          physical_score?: number | null
          profile_id?: string | null
          profile_name?: string | null
          profile_type?: string | null
          quiz_completed?: boolean | null
          referrer?: string | null
          social_score?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          answers?: Json | null
          behavioral_score?: number | null
          cognitive_score?: number | null
          completion_time?: number | null
          conversion_date?: string | null
          converted?: boolean | null
          created_at?: string | null
          dimension_scores?: Json | null
          email?: string
          email_consent?: boolean | null
          email_sent?: boolean | null
          first_name?: string | null
          id?: string
          ip_address?: unknown | null
          marketing_consent?: boolean | null
          physical_score?: number | null
          profile_id?: string | null
          profile_name?: string | null
          profile_type?: string | null
          quiz_completed?: boolean | null
          referrer?: string | null
          social_score?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
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
      fear_flight_tests: {
        Row: {
          created_at: string | null
          email: string
          email_sent_at: string | null
          fear_level: string
          id: number
          test_responses: Json
        }
        Insert: {
          created_at?: string | null
          email: string
          email_sent_at?: string | null
          fear_level: string
          id?: number
          test_responses: Json
        }
        Update: {
          created_at?: string | null
          email?: string
          email_sent_at?: string | null
          fear_level?: string
          id?: number
          test_responses?: Json
        }
        Relationships: []
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
      inscriptions: {
        Row: {
          commentaires: string | null
          created_at: string | null
          email: string
          email_confirmation_sent: boolean | null
          id: string
          nom: string
          prenom: string
          session_date: string | null
          session_id: number | null
          telephone: string | null
        }
        Insert: {
          commentaires?: string | null
          created_at?: string | null
          email: string
          email_confirmation_sent?: boolean | null
          id?: string
          nom: string
          prenom: string
          session_date?: string | null
          session_id?: number | null
          telephone?: string | null
        }
        Update: {
          commentaires?: string | null
          created_at?: string | null
          email?: string
          email_confirmation_sent?: boolean | null
          id?: string
          nom?: string
          prenom?: string
          session_date?: string | null
          session_id?: number | null
          telephone?: string | null
        }
        Relationships: []
      }
      package_orders: {
        Row: {
          amount: number
          created_at: string | null
          email: string
          expires_at: string
          id: number
          reference_code: string
          status: string | null
          stripe_session_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          email: string
          expires_at: string
          id?: number
          reference_code: string
          status?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: number
          reference_code?: string
          status?: string | null
          stripe_session_id?: string | null
        }
        Relationships: []
      }
      peur_avion_test_results: {
        Row: {
          answers: Json
          created_at: string | null
          email: string
          fear_level: string
          first_name: string
          id: string
          percentage: number
          recommendations: string
          total_score: number
        }
        Insert: {
          answers: Json
          created_at?: string | null
          email: string
          fear_level: string
          first_name: string
          id?: string
          percentage: number
          recommendations: string
          total_score: number
        }
        Update: {
          answers?: Json
          created_at?: string | null
          email?: string
          fear_level?: string
          first_name?: string
          id?: string
          percentage?: number
          recommendations?: string
          total_score?: number
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
      questionnaire_avion_pre_accompagnement: {
        Row: {
          age: number | null
          anxiolytiques: string | null
          approches_educatives: string[] | null
          approches_medicales: string[] | null
          aspect_plus_peur: string | null
          aspects_physiques: string[] | null
          aspects_psychologiques: string[] | null
          aspects_techniques: string[] | null
          autres_pensees: string | null
          autres_phobies: string[] | null
          axes_therapeutiques: string[] | null
          bequilles_voyage: string[] | null
          bilan_detaille: string | null
          canal_sensoriel: string | null
          comment_surmontes: string | null
          comportements_evitement: string[] | null
          contexte_precise: string | null
          created_at: string
          croyance_changement: number | null
          date_remplissage: string | null
          defis_surmontes: string | null
          deja_pris_avion: boolean | null
          dernier_vol: string | null
          destination_reve: string | null
          echecs_details: string | null
          email: string
          email_sent_at: string | null
          etat_sante: string[] | null
          evenements_stressants: string | null
          experience_globale: string | null
          gestion_stress: string[] | null
          id: string
          imagination_apres_peur: string | null
          informations_supplementaires: string | null
          intensite_symptomes: string | null
          medicaments_anxiete: boolean | null
          medicaments_details: string | null
          motivation_niveau: number | null
          motivation_principale: string[] | null
          niveau_stress_general: number | null
          nom: string | null
          nombre_vols: number | null
          objectif_principal: string[] | null
          origine_peur: string[] | null
          pensees_automatiques: string[] | null
          peur_aeroport: number | null
          peur_altitude: number | null
          peur_atterrissage: number | null
          peur_decollage: number | null
          peur_embarquer: number | null
          peur_fermeture_portes: number | null
          peur_liee_aspects: string[] | null
          peur_mot_avion: number | null
          peur_progressive: string[] | null
          peur_reserver: number | null
          peur_roulage: number | null
          peur_transmise: string[] | null
          peur_turbulences: number | null
          peur_voir_photo: number | null
          peur_voir_reel: number | null
          phobies_specifiques: string[] | null
          pratique_hypnose: string | null
          premiere_peur: string | null
          prenom: string | null
          profession: string | null
          profil_principal: string | null
          pronostic: string | null
          questions_preoccupations: string | null
          realisation_incroyable: string | null
          receptivite_hypnose: string | null
          resultats_tentatives: string | null
          situation_personnelle: string[] | null
          situation_professionnelle: string[] | null
          sources_confiance: string[] | null
          symptomes_physiques: string[] | null
          techniques_recommandees: string[] | null
          telephone: string | null
          tentatives_anterieures: string[] | null
          therapies_alternatives: string[] | null
          traumatisme_direct: string[] | null
          traumatisme_indirect: string[] | null
          troubles_anxieux: string[] | null
          updated_at: string
          vol_marquant_contexte: string | null
          vol_marquant_impact: string | null
          voyage_date: string | null
          voyage_prevu: boolean | null
        }
        Insert: {
          age?: number | null
          anxiolytiques?: string | null
          approches_educatives?: string[] | null
          approches_medicales?: string[] | null
          aspect_plus_peur?: string | null
          aspects_physiques?: string[] | null
          aspects_psychologiques?: string[] | null
          aspects_techniques?: string[] | null
          autres_pensees?: string | null
          autres_phobies?: string[] | null
          axes_therapeutiques?: string[] | null
          bequilles_voyage?: string[] | null
          bilan_detaille?: string | null
          canal_sensoriel?: string | null
          comment_surmontes?: string | null
          comportements_evitement?: string[] | null
          contexte_precise?: string | null
          created_at?: string
          croyance_changement?: number | null
          date_remplissage?: string | null
          defis_surmontes?: string | null
          deja_pris_avion?: boolean | null
          dernier_vol?: string | null
          destination_reve?: string | null
          echecs_details?: string | null
          email: string
          email_sent_at?: string | null
          etat_sante?: string[] | null
          evenements_stressants?: string | null
          experience_globale?: string | null
          gestion_stress?: string[] | null
          id?: string
          imagination_apres_peur?: string | null
          informations_supplementaires?: string | null
          intensite_symptomes?: string | null
          medicaments_anxiete?: boolean | null
          medicaments_details?: string | null
          motivation_niveau?: number | null
          motivation_principale?: string[] | null
          niveau_stress_general?: number | null
          nom?: string | null
          nombre_vols?: number | null
          objectif_principal?: string[] | null
          origine_peur?: string[] | null
          pensees_automatiques?: string[] | null
          peur_aeroport?: number | null
          peur_altitude?: number | null
          peur_atterrissage?: number | null
          peur_decollage?: number | null
          peur_embarquer?: number | null
          peur_fermeture_portes?: number | null
          peur_liee_aspects?: string[] | null
          peur_mot_avion?: number | null
          peur_progressive?: string[] | null
          peur_reserver?: number | null
          peur_roulage?: number | null
          peur_transmise?: string[] | null
          peur_turbulences?: number | null
          peur_voir_photo?: number | null
          peur_voir_reel?: number | null
          phobies_specifiques?: string[] | null
          pratique_hypnose?: string | null
          premiere_peur?: string | null
          prenom?: string | null
          profession?: string | null
          profil_principal?: string | null
          pronostic?: string | null
          questions_preoccupations?: string | null
          realisation_incroyable?: string | null
          receptivite_hypnose?: string | null
          resultats_tentatives?: string | null
          situation_personnelle?: string[] | null
          situation_professionnelle?: string[] | null
          sources_confiance?: string[] | null
          symptomes_physiques?: string[] | null
          techniques_recommandees?: string[] | null
          telephone?: string | null
          tentatives_anterieures?: string[] | null
          therapies_alternatives?: string[] | null
          traumatisme_direct?: string[] | null
          traumatisme_indirect?: string[] | null
          troubles_anxieux?: string[] | null
          updated_at?: string
          vol_marquant_contexte?: string | null
          vol_marquant_impact?: string | null
          voyage_date?: string | null
          voyage_prevu?: boolean | null
        }
        Update: {
          age?: number | null
          anxiolytiques?: string | null
          approches_educatives?: string[] | null
          approches_medicales?: string[] | null
          aspect_plus_peur?: string | null
          aspects_physiques?: string[] | null
          aspects_psychologiques?: string[] | null
          aspects_techniques?: string[] | null
          autres_pensees?: string | null
          autres_phobies?: string[] | null
          axes_therapeutiques?: string[] | null
          bequilles_voyage?: string[] | null
          bilan_detaille?: string | null
          canal_sensoriel?: string | null
          comment_surmontes?: string | null
          comportements_evitement?: string[] | null
          contexte_precise?: string | null
          created_at?: string
          croyance_changement?: number | null
          date_remplissage?: string | null
          defis_surmontes?: string | null
          deja_pris_avion?: boolean | null
          dernier_vol?: string | null
          destination_reve?: string | null
          echecs_details?: string | null
          email?: string
          email_sent_at?: string | null
          etat_sante?: string[] | null
          evenements_stressants?: string | null
          experience_globale?: string | null
          gestion_stress?: string[] | null
          id?: string
          imagination_apres_peur?: string | null
          informations_supplementaires?: string | null
          intensite_symptomes?: string | null
          medicaments_anxiete?: boolean | null
          medicaments_details?: string | null
          motivation_niveau?: number | null
          motivation_principale?: string[] | null
          niveau_stress_general?: number | null
          nom?: string | null
          nombre_vols?: number | null
          objectif_principal?: string[] | null
          origine_peur?: string[] | null
          pensees_automatiques?: string[] | null
          peur_aeroport?: number | null
          peur_altitude?: number | null
          peur_atterrissage?: number | null
          peur_decollage?: number | null
          peur_embarquer?: number | null
          peur_fermeture_portes?: number | null
          peur_liee_aspects?: string[] | null
          peur_mot_avion?: number | null
          peur_progressive?: string[] | null
          peur_reserver?: number | null
          peur_roulage?: number | null
          peur_transmise?: string[] | null
          peur_turbulences?: number | null
          peur_voir_photo?: number | null
          peur_voir_reel?: number | null
          phobies_specifiques?: string[] | null
          pratique_hypnose?: string | null
          premiere_peur?: string | null
          prenom?: string | null
          profession?: string | null
          profil_principal?: string | null
          pronostic?: string | null
          questions_preoccupations?: string | null
          realisation_incroyable?: string | null
          receptivite_hypnose?: string | null
          resultats_tentatives?: string | null
          situation_personnelle?: string[] | null
          situation_professionnelle?: string[] | null
          sources_confiance?: string[] | null
          symptomes_physiques?: string[] | null
          techniques_recommandees?: string[] | null
          telephone?: string | null
          tentatives_anterieures?: string[] | null
          therapies_alternatives?: string[] | null
          traumatisme_direct?: string[] | null
          traumatisme_indirect?: string[] | null
          troubles_anxieux?: string[] | null
          updated_at?: string
          vol_marquant_contexte?: string | null
          vol_marquant_impact?: string | null
          voyage_date?: string | null
          voyage_prevu?: boolean | null
        }
        Relationships: []
      }
      quiz_prise_parole_responses: {
        Row: {
          created_at: string
          email: string
          id: string
          message_resultat: string
          niveau_peur: string
          nom: string | null
          prenom: string
          reponses: Json
          score_total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message_resultat: string
          niveau_peur: string
          nom?: string | null
          prenom: string
          reponses: Json
          score_total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message_resultat?: string
          niveau_peur?: string
          nom?: string | null
          prenom?: string
          reponses?: Json
          score_total?: number
          updated_at?: string
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
      quizaqualibre: {
        Row: {
          created_at: string
          email: string
          id: string
          message_resultat: string
          niveau_aquaphobie: string
          prenom: string
          reponses: Json
          score_total: number
          sessions_recommandees: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message_resultat: string
          niveau_aquaphobie: string
          prenom: string
          reponses: Json
          score_total: number
          sessions_recommandees: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message_resultat?: string
          niveau_aquaphobie?: string
          prenom?: string
          reponses?: Json
          score_total?: number
          sessions_recommandees?: string
          updated_at?: string
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
      generate_clean_slug: {
        Args: { title: string }
        Returns: string
      }
      generate_promo_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_article_by_slug: {
        Args: { input_slug: string }
        Returns: {
          author: string
          canonical_slug: string
          categories: string[]
          category: string
          content: string
          created_at: string
          excerpt: string
          featured: boolean
          id: string
          image_url: string
          is_redirect: boolean
          published: boolean
          scheduled_for: string
          slug: string
          storage_image_url: string
          tags: string[]
          title: string
          updated_at: string
        }[]
      }
      get_article_id_by_slug: {
        Args: { slug_param: string }
        Returns: string
      }
      has_role: {
        Args: { required_role: string; user_id: string }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
