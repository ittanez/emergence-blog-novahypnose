// src/hooks/useArticleEditor.tsx - VERSION MODIFIÉE

import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Article, Tag } from "@/lib/types";
import { saveArticle, generateUniqueSlug, getArticleById } from "@/lib/services/articleService";
import { useAuth } from "@/lib/contexts/AuthContext";
// ✅ AJOUT : Import Supabase
import { createClient } from '@supabase/supabase-js';

// ✅ AJOUT : Configuration Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export const useArticleEditor = () => {
  const { id } = useParams();
  const isEditing = id !== "new";
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  // ✅ AJOUT : État pour l'upload d'image
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [article, setArticle] = useState<Partial<Article>>({
    title: "",
    content: "",
    excerpt: "",
    image_url: "",
    published: false,
    categories: [],
    slug: "",
    tags: [],
    keywords: [],
    seo_description: "",
  });
  const [publishMode, setPublishMode] = useState<"draft" | "publish" | "schedule">("draft");

  // ... (tout le reste du code reste identique jusqu'à handleImageUpload)

  // 🚀 NOUVELLE VERSION : handleImageUpload avec Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast.error('L\'image ne peut pas dépasser 5MB');
      return;
    }

    setIsUploadingImage(true);
    
    try {
      console.log('🚀 Upload vers Supabase Storage...');
      
      // 1. Générer un nom de fichier unique
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      
      // Nom basé sur le titre de l'article ou ID temporaire
      const baseName = article.title 
        ? article.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 30)
        : 'article';
        
      const fileName = `${baseName}-${timestamp}-${random}.${fileExtension}`;

      // 2. Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog_images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Erreur upload:', uploadError);
        throw uploadError;
      }

      // 3. Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('blog_images')
        .getPublicUrl(fileName);

      console.log('✅ Image uploadée:', urlData.publicUrl);

      // 4. Mettre à jour le state local
      setArticle(prev => ({
        ...prev,
        image_url: urlData.publicUrl
      }));

      // 5. Si on modifie un article existant, mettre à jour la DB immédiatement
      if (isEditing && article.id) {
        try {
          const { error: updateError } = await supabase
            .from('articles')
            .update({ image_url: urlData.publicUrl })
            .eq('id', article.id);

          if (updateError) {
            console.warn('⚠️ Erreur mise à jour DB (non critique):', updateError);
          } else {
            console.log('✅ Base de données mise à jour');
          }
        } catch (dbError) {
          console.warn('⚠️ Erreur DB non critique:', dbError);
        }
      }

      toast.success('Image uploadée avec succès !');

    } catch (error: any) {
      console.error('❌ Erreur handleImageUpload:', error);
      toast.error('Erreur lors de l\'upload de l\'image', {
        description: error.message
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 🔄 FONCTION UTILITAIRE : Upload programmatique (pour usage futur)
  const uploadImageFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingImage(true);
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      
      const baseName = article.title 
        ? article.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 30)
        : 'article';
        
      const fileName = `${baseName}-${timestamp}-${random}.${fileExtension}`;

      const { data, error } = await supabase.storage
        .from('blog_images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('blog_images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erreur upload:', error);
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ... (tout le reste du code reste identique)

  return {
    isEditing,
    isLoading,
    isSaving,
    showPreview,
    setShowPreview,
    scheduledDate,
    article,
    publishMode,
    // ✅ AJOUT : Nouvel état pour l'upload
    isUploadingImage,
    handleChange,
    handleContentChange,
    handleTagsChange,
    handleKeywordsChange,
    handlePublishModeChange,
    handleTitleChange,
    handleCategoriesChange,
    handleImageUpload, // ✅ Fonction modifiée
    uploadImageFile,   // ✅ Nouvelle fonction utilitaire
    handleScheduledDateChange,
    handleSubmit,
    getTagsForPreview,
  };
};
