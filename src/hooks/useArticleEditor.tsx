// src/hooks/useArticleEditor.tsx - VERSION COMPLÈTE AVEC SEO

import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Article, Tag } from "@/lib/types";
import { saveArticle, generateUniqueSlug, getArticleById } from "@/lib/services/articleService";
import { useAuth } from "@/lib/contexts/AuthContext";
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // 🎯 ÉTAT ARTICLE AVEC TOUS LES CHAMPS SEO
  const [article, setArticle] = useState<Partial<Article>>({
    title: "",
    content: "",
    excerpt: "",                    // 📖 Extrait visible aux lecteurs
    seo_description: "",           // 🔍 Description SEO (compatibilité)
    meta_description: "",          // 🔍 NOUVEAU: Méta-description SEO
    image_url: "",
    published: false,
    categories: [],
    slug: "",
    tags: [],                      // 🏷️ Tags de navigation
    keywords: [],                  // 🎯 NOUVEAU: Mots-clés SEO
  });
  
  const [publishMode, setPublishMode] = useState<"draft" | "publish" | "schedule">("draft");

  // Vérification des droits admin
  useEffect(() => {
    if (isAdmin === false) {
      toast.error("Accès non autorisé", {
        description: "Vous devez être administrateur pour accéder à cette page"
      });
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // Chargement de l'article existant
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
        
        // 🔄 Mapper les données pour assurer la compatibilité
        const mappedArticle = {
          ...data,
          excerpt: data.excerpt || '',
          seo_description: data.seo_description || '',
          meta_description: data.meta_description || data.seo_description || '', // Fallback
          keywords: data.keywords || [],
          tags: data.tags || []
        };
        
        setArticle(mappedArticle);
        
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

  // Gestion des changements de champs texte
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setArticle(prev => ({ ...prev, [name]: value }));
  };

  // 🎯 GESTION AMÉLIORÉE DU CONTENU AVEC AUTO-GÉNÉRATION SEO
  const handleContentChange = (content: string) => {
    setArticle(prev => ({ ...prev, content }));
    
    // Auto-génération de l'extrait (pour les lecteurs)
    if (!article.excerpt || article.excerpt === "") {
      const plainText = content.replace(/<[^>]*>/g, '');
      const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
      setArticle(prev => ({ ...prev, excerpt }));
    }
    
    // Auto-génération de la méta-description SEO (160 caractères max)
    if (!article.meta_description || article.meta_description === "") {
      const plainText = content.replace(/<[^>]*>/g, '');
      const metaDescription = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
      setArticle(prev => ({ ...prev, meta_description: metaDescription }));
    }
    
    // Maintenir la compatibilité avec seo_description
    if (!article.seo_description || article.seo_description === "") {
      const plainText = content.replace(/<[^>]*>/g, '');
      const seoDescription = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
      setArticle(prev => ({ ...prev, seo_description: seoDescription }));
    }
    
    // Auto-calcul du temps de lecture
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    setArticle(prev => ({ ...prev, read_time: readTime }));
    
    // Auto-génération des mots-clés SEO
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

  // Gestion des tags de navigation
  const handleTagsChange = (tags: string[]) => {
    const tagObjects = tags.map(tag => ({
      id: tag.toLowerCase().replace(/\s+/g, '-'),
      name: tag,
      slug: tag.toLowerCase().replace(/\s+/g, '-'),
      created_at: new Date().toISOString(),
    }));
    
    setArticle(prev => ({ ...prev, tags: tagObjects }));
  };

  // 🎯 NOUVELLE: Gestion des mots-clés SEO
  const handleKeywordsChange = (keywords: string[]) => {
    setArticle(prev => ({ ...prev, keywords }));
  };

  // 🆕 NOUVELLE: Gestion spécifique de la méta-description
  const handleMetaDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setArticle(prev => ({ ...prev, meta_description: value }));
    
    // Validation en temps réel
    if (value.length > 160) {
      console.warn('⚠️ Méta-description trop longue:', value.length, 'caractères');
    }
  };

  // Gestion du mode de publication
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

  // Gestion du changement de titre avec génération de slug
  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setArticle(prev => ({ ...prev, title: newTitle }));
    
    if (!article.slug || article.slug === "") {
      const { slug } = await generateUniqueSlug(newTitle, article.id);
      if (slug) {
        setArticle(prev => ({ ...prev, slug }));
      }
    }
  };

  // Gestion des catégories
  const handleCategoriesChange = (categories: string[]) => {
    console.log("Nouvelles catégories sélectionnées:", categories);
    setArticle(prev => ({ ...prev, categories }));
  };

  // Upload d'image vers Supabase Storage
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
      
      // Générer un nom de fichier unique
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

      // Upload vers Supabase Storage
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

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('blog_images')
        .getPublicUrl(fileName);

      console.log('✅ Image uploadée:', urlData.publicUrl);

      setArticle(prev => ({
        ...prev,
        image_url: urlData.publicUrl
      }));

      // Mise à jour immédiate de la DB si article existant
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

  // Gestion de la date de programmation
  const handleScheduledDateChange = (date: Date | undefined) => {
    setScheduledDate(date);
    if (date && publishMode === "schedule") {
      setArticle(prev => ({ 
        ...prev, 
        scheduled_for: date.toISOString() 
      }));
    }
  };

  // 🎯 SOUMISSION AVEC VALIDATION SEO COMPLÈTE
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!article.title || !article.content) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    // 🔍 VALIDATION SEO AVANCÉE
    const seoWarnings = [];
    
    if (article.meta_description) {
      if (article.meta_description.length > 160) {
        seoWarnings.push('⚠️ Méta-description trop longue (max 160 caractères)');
      } else if (article.meta_description.length < 120) {
        seoWarnings.push('💡 Méta-description un peu courte (120-160 recommandé)');
      }
    }
    
    if (article.excerpt && article.excerpt.length > 300) {
      seoWarnings.push('💡 Extrait un peu long (150-200 caractères recommandé)');
    }

    if (!article.keywords || article.keywords.length === 0) {
      seoWarnings.push('💡 Aucun mot-clé SEO défini');
    }

    if (!article.tags || article.tags.length === 0) {
      seoWarnings.push('💡 Aucun tag défini');
    }
    
    // Afficher les avertissements SEO
    seoWarnings.forEach(warning => toast.warning(warning));
    
    try {
      setIsSaving(true);
      
      // Préparer l'article selon le mode de publication
      const articleToSave = { 
        ...article,
        // S'assurer que tous les champs SEO sont définis
        excerpt: article.excerpt || '',
        meta_description: article.meta_description || '',
        seo_description: article.seo_description || article.meta_description || '',
        keywords: article.keywords || [],
        tags: article.tags || [],
        categories: article.categories || []
      };
      
      if (publishMode === "schedule" && scheduledDate) {
        articleToSave.scheduled_for = scheduledDate.toISOString();
        articleToSave.published = false;
      } else if (publishMode === "publish") {
        articleToSave.published = true;
        articleToSave.scheduled_for = undefined;
      } else { // draft
        articleToSave.published = false;
        articleToSave.scheduled_for = undefined;
      }
      
      console.log("Sauvegarde de l'article avec mode:", publishMode);
      console.log("Article à sauvegarder:", articleToSave);
      
      // 📊 Log des données SEO pour debug
      console.log("📊 Données SEO:", {
        excerpt_length: articleToSave.excerpt?.length || 0,
        meta_description_length: articleToSave.meta_description?.length || 0,
        seo_description_length: articleToSave.seo_description?.length || 0,
        tags_count: Array.isArray(articleToSave.tags) ? articleToSave.tags.length : 0,
        keywords_count: Array.isArray(articleToSave.keywords) ? articleToSave.keywords.length : 0
      });
      
      const { data, error } = await saveArticle(articleToSave);
      
      if (error) throw error;
      if (!data) throw new Error("Aucune donnée n'a été retournée lors de l'enregistrement");
      
      const successMessage = publishMode === "draft" 
        ? "Article enregistré comme brouillon" 
        : publishMode === "schedule" 
        ? "Article programmé avec succès" 
        : "Article publié avec succès";
      
      toast.success(successMessage);
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

  // Préparation des tags pour l'aperçu
  const getTagsForPreview = () => {
    if (!article.tags) return [];
    
    return article.tags.map(tag => {
      if (typeof tag === 'string') {
        return {
          id: tag.toLowerCase().replace(/\s+/g, '-'),
          name: tag,
          slug: tag.toLowerCase().replace(/\s+/g, '-'),
          created_at: new Date().toISOString()
        };
      }
      return tag;
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
    // 🆕 NOUVELLES FONCTIONS
    handleMetaDescriptionChange,
  };
};
