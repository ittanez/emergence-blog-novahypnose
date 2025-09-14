
// src/hooks/useArticleEditor.tsx - VERSION COMPLÈTE CORRIGÉE

import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Article, Tag } from "@/lib/types";
import { saveArticle, generateUniqueSlug, getArticleById } from "@/lib/services/articleService";
import { useAuth } from "@/lib/contexts/AuthContext";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export const useArticleEditor = () => {
  const { id } = useParams();
  const isEditing = id !== "new";
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [article, setArticle] = useState<Partial<Article>>({
    title: "",
    content: "",
    excerpt: "",
    image_url: "",
    published: false,
    categories: [],
    slug: "",
    tags: [], // ✅ CORRIGÉ : Array de Tag[]
    keywords: [],
    seo_description: "",
    meta_description: "",
    read_time: 1,
    author: "",
    featured: false,
    storage_image_url: "",
  });
  const [publishMode, setPublishMode] = useState<"draft" | "publish" | "schedule">("draft");

  useEffect(() => {
    if (isAdmin === false) {
      toast.error("Accès non autorisé", {
        description: "Vous devez être administrateur pour accéder à cette page"
      });
      navigate("/");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!isEditing || !id) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await getArticleById(id);
        
        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Article non trouvé");
        }

        console.log("Article récupéré:", data);
        setArticle(data);
        
        if (data.scheduled_for) {
          setPublishMode("schedule");
          setScheduledDate(new Date(data.scheduled_for));
        } else if (data.published) {
          setPublishMode("publish");
        } else {
          setPublishMode("draft");
        }
      } catch (error: any) {
        console.error("Erreur lors de la récupération de l'article:", error);
        toast.error("Impossible de charger l'article", { 
          description: error.message 
        });
        navigate('/admin/articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setArticle(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setArticle(prev => ({ ...prev, content }));
    
    if (!article.excerpt || article.excerpt === "") {
      const plainText = content.replace(/<[^>]*>/g, '');
      const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
      setArticle(prev => ({ ...prev, excerpt }));
    }
    
    if (!article.seo_description || article.seo_description === "") {
      const plainText = content.replace(/<[^>]*>/g, '');
      const seoDescription = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
      setArticle(prev => ({ ...prev, seo_description: seoDescription }));
    }
    
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    setArticle(prev => ({ ...prev, read_time: readTime }));
    
    if (!article.keywords || article.keywords.length === 0) {
      const plainText = content.replace(/<[^>]*>/g, '');
      const words = plainText.toLowerCase().split(/\s+/);
      const commonWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'car', 'de', 'à', 'au', 'aux', 'en', 'dans', 'sur', 'pour', 'par', 'avec', 'sans']);
      const frequency: Record<string, number> = {};
      
      words.forEach(word => {
        if (word.length > 3 && !commonWords.has(word)) {
          frequency[word] = (frequency[word] || 0) + 1;
        }
      });
      
      const potentialKeywords = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
        
      if (potentialKeywords.length > 0) {
        setArticle(prev => ({ ...prev, keywords: potentialKeywords }));
      }
    }
  };

  // ✅ CORRIGÉ : Gestion des tags comme objets Tag
  const handleTagsChange = (tags: string[]) => {
    const tagObjects: Tag[] = tags.map(tag => ({
      id: tag.toLowerCase().replace(/\s+/g, '-'),
      name: tag,
      slug: tag.toLowerCase().replace(/\s+/g, '-'),
      created_at: new Date().toISOString(),
    }));
    
    setArticle(prev => ({ ...prev, tags: tagObjects }));
  };

  const handleKeywordsChange = (keywords: string[]) => {
    setArticle(prev => ({ ...prev, keywords }));
  };

  const handlePublishModeChange = (mode: "draft" | "publish" | "schedule") => {
    console.log("Changement de mode de publication:", mode);
    setPublishMode(mode);
    
    if (mode === "publish") {
      setArticle(prev => ({ 
        ...prev, 
        published: true, 
        scheduled_for: undefined 
      }));
    } else if (mode === "draft") {
      setArticle(prev => ({ 
        ...prev, 
        published: false, 
        scheduled_for: undefined 
      }));
    } else if (mode === "schedule") {
      setArticle(prev => ({ 
        ...prev, 
        published: false,
        scheduled_for: scheduledDate ? scheduledDate.toISOString() : undefined
      }));
    }
  };

  // ✅ CORRIGÉ : Gestion correcte du slug
  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setArticle(prev => ({ ...prev, title: newTitle }));
    
    if (!article.slug || article.slug === "") {
      const { slug: newSlug } = await generateUniqueSlug(newTitle, article.id);
      if (newSlug) {
        setArticle(prev => ({ ...prev, slug: newSlug }));
      }
    }
  };

  const handleCategoriesChange = (categories: string[]) => {
    console.log("Nouvelles catégories sélectionnées:", categories);
    setArticle(prev => ({ ...prev, categories }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne peut pas dépasser 5MB');
      return;
    }

    setIsUploadingImage(true);
    
    try {
      console.log('🚀 Upload vers Supabase Storage...');
      
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

      const { data: urlData } = supabase.storage
        .from('blog_images')
        .getPublicUrl(fileName);

      console.log('✅ Image uploadée:', urlData.publicUrl);

      setArticle(prev => ({
        ...prev,
        image_url: urlData.publicUrl,
        storage_image_url: urlData.publicUrl
      }));

      if (isEditing && article.id) {
        try {
          const { error: updateError } = await supabase
            .from('articles')
            .update({ 
              image_url: urlData.publicUrl,
              storage_image_url: urlData.publicUrl 
            })
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

  const handleScheduledDateChange = (date: Date | undefined) => {
    setScheduledDate(date);
    if (date && publishMode === "schedule") {
      setArticle(prev => ({ 
        ...prev, 
        scheduled_for: date.toISOString() 
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!article.title || !article.content) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setIsSaving(true);
      
      const articleToSave = { 
        ...article,
        meta_description: article.seo_description || article.meta_description || "",
        author: article.author || user?.email || 'Admin',
        featured: article.featured || false,
        read_time: article.read_time || 1,
        storage_image_url: article.storage_image_url || article.image_url || "",
      };
      
      if (publishMode === "schedule" && scheduledDate) {
        articleToSave.scheduled_for = scheduledDate.toISOString();
        articleToSave.published = false;
      } else if (publishMode === "publish") {
        articleToSave.published = true;
        articleToSave.scheduled_for = undefined;
      } else {
        articleToSave.published = false;
        articleToSave.scheduled_for = undefined;
      }
      
      console.log("Sauvegarde de l'article avec mode:", publishMode);
      console.log("Article à sauvegarder:", articleToSave);
      
      const { data, error } = await saveArticle(articleToSave);
      
      if (error) throw error;
      if (!data) throw new Error("Aucune donnée n'a été retournée lors de l'enregistrement");
      
      // Messages de succès personnalisés
      let successMessage = "";
      let description = "";
      
      if (publishMode === "draft") {
        successMessage = "Article enregistré comme brouillon";
        description = "L'article a été sauvegardé et pourra être publié plus tard.";
      } else if (publishMode === "schedule") {
        successMessage = "Article programmé avec succès";
        description = `L'article sera publié automatiquement le ${scheduledDate?.toLocaleDateString()}.`;
      } else {
        successMessage = "Article publié avec succès";
        description = "L'article est maintenant visible publiquement et synchronisé avec Firebase.";
      }
      
      // Affichage du toast de succès principal
      toast.success(successMessage, { description });
      
      // Si l'article est publié, ajouter un écouteur pour la synchronisation Firebase
      if (articleToSave.published) {
        // Écouter les événements de synchronisation Firebase
        const handleFirebaseSuccess = (event: CustomEvent) => {
          if (event.detail.articleId === data.id) {
            toast.success("🔥 Article synchronisé avec Firebase", {
              description: "L'article est maintenant disponible dans l'application mobile."
            });
            window.removeEventListener('firebase-sync-success', handleFirebaseSuccess);
            window.removeEventListener('firebase-sync-error', handleFirebaseError);
          }
        };
        
        const handleFirebaseError = (event: CustomEvent) => {
          if (event.detail.articleId === data.id) {
            console.warn('Firebase sync failed:', event.detail.error);
            toast.error("⚠️ Synchronisation Firebase échouée", {
              description: "L'article est publié mais n'a pas pu être synchronisé avec l'app mobile."
            });
            window.removeEventListener('firebase-sync-success', handleFirebaseSuccess);
            window.removeEventListener('firebase-sync-error', handleFirebaseError);
          }
        };
        
        window.addEventListener('firebase-sync-success', handleFirebaseSuccess);
        window.addEventListener('firebase-sync-error', handleFirebaseError);
        
        // Nettoyer les écouteurs après 10 secondes
        setTimeout(() => {
          window.removeEventListener('firebase-sync-success', handleFirebaseSuccess);
          window.removeEventListener('firebase-sync-error', handleFirebaseError);
        }, 10000);
      }
      
      navigate('/admin/articles');
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde de l'article:", error);
      toast.error("Erreur lors de la sauvegarde", { 
        description: error.message 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ CORRIGÉ : Typage correct pour éviter les erreurs 'never'
  const getTagsForPreview = (): Tag[] => {
    if (!article.tags) return [];
    
    return article.tags.map((tag: any) => {
      if (typeof tag === 'string') {
        return {
          id: tag.toLowerCase().replace(/\s+/g, '-'),
          name: tag,
          slug: tag.toLowerCase().replace(/\s+/g, '-'),
          created_at: new Date().toISOString()
        };
      }
      return tag as Tag;
    });
  };

  return {
    isEditing,
    isLoading,
    isSaving,
    showPreview,
    setShowPreview,
    scheduledDate,
    article,
    publishMode,
    isUploadingImage,
    handleChange,
    handleContentChange,
    handleTagsChange,
    handleKeywordsChange,
    handlePublishModeChange,
    handleTitleChange,
    handleCategoriesChange,
    handleImageUpload,
    handleScheduledDateChange,
    handleSubmit,
    getTagsForPreview,
  };
};
