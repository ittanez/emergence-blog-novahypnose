
import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Article, Tag } from "@/lib/types";
import { saveArticle, generateUniqueSlug, getArticleById } from "@/lib/services/articleService";
import { useAuth } from "@/lib/contexts/AuthContext";

export const useArticleEditor = () => {
  const { id } = useParams();
  const isEditing = id !== "new";
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
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

  // Rediriger si l'utilisateur n'est pas administrateur
  useEffect(() => {
    if (isAdmin === false) {
      toast.error("Accès non autorisé", {
        description: "Vous devez être administrateur pour accéder à cette page"
      });
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // Charger l'article si on est en mode édition
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
        
        // Si l'article a une date de publication future
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

  // Mettre à jour les champs de l'article
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setArticle(prev => ({ ...prev, [name]: value }));
  };

  // Mettre à jour le contenu riche de l'article et générer automatiquement le SEO
  const handleContentChange = (content: string) => {
    setArticle(prev => ({ ...prev, content }));
    
    // Si l'extrait est vide, générer automatiquement à partir du contenu
    if (!article.excerpt || article.excerpt === "") {
      const plainText = content.replace(/<[^>]*>/g, '');
      const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
      setArticle(prev => ({ ...prev, excerpt }));
    }
    
    // Générer automatiquement la description SEO si elle est vide
    if (!article.seo_description || article.seo_description === "") {
      const plainText = content.replace(/<[^>]*>/g, '');
      const seoDescription = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
      setArticle(prev => ({ ...prev, seo_description: seoDescription }));
    }
    
    // Estimer le temps de lecture (environ 200 mots par minute)
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    setArticle(prev => ({ ...prev, read_time: readTime }));
    
    // Extraire des mots-clés potentiels si la liste est vide
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

  // Mettre à jour les tags
  const handleTagsChange = (tags: string[]) => {
    const tagObjects = tags.map(tag => ({
      id: tag.toLowerCase().replace(/\s+/g, '-'),
      name: tag,
      slug: tag.toLowerCase().replace(/\s+/g, '-'),
      created_at: new Date().toISOString(),
    }));
    
    setArticle(prev => ({ ...prev, tags: tagObjects }));
  };

  // Mettre à jour les keywords SEO
  const handleKeywordsChange = (keywords: string[]) => {
    setArticle(prev => ({ ...prev, keywords }));
  };

  const handlePublishModeChange = (mode: "draft" | "publish" | "schedule") => {
    setPublishMode(mode);
    
    if (mode === "publish") {
      setArticle(prev => ({ ...prev, published: true, scheduled_for: undefined }));
    } else if (mode === "draft") {
      setArticle(prev => ({ ...prev, published: false, scheduled_for: undefined }));
    } else if (mode === "schedule" && scheduledDate) {
      setArticle(prev => ({ 
        ...prev, 
        published: false, 
        scheduled_for: scheduledDate.toISOString() 
      }));
    }
  };

  // Générer un slug automatique lorsque le titre change
  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setArticle(prev => ({ ...prev, title: newTitle }));
    
    if (!article.slug || article.slug === "") {
      const newSlug = await generateUniqueSlug(newTitle, article.id);
      setArticle(prev => ({ ...prev, slug: newSlug }));
    }
  };

  // Mettre à jour les catégories
  const handleCategoriesChange = (categories: string[]) => {
    console.log("Nouvelles catégories sélectionnées:", categories);
    setArticle(prev => ({ ...prev, categories }));
  };

  // Gérer l'upload d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setArticle(prev => ({ ...prev, image_url: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleScheduledDateChange = (date: Date | undefined) => {
    setScheduledDate(date);
    if (date) {
      setArticle(prev => ({ 
        ...prev, 
        scheduled_for: date.toISOString() 
      }));
    }
  };

  // Sauvegarder l'article
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!article.title || !article.content) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setIsSaving(true);
      
      if (publishMode === "schedule" && scheduledDate) {
        article.scheduled_for = scheduledDate.toISOString();
        article.published = false;
      } else {
        article.published = publishMode === "publish";
        article.scheduled_for = undefined;
      }
      
      console.log("Sauvegarde de l'article avec catégories:", article.categories);
      const { data, error } = await saveArticle(article);
      
      if (error) throw error;
      if (!data) throw new Error("Aucune donnée n'a été retournée lors de l'enregistrement");
      
      toast.success(isEditing ? "Article mis à jour avec succès" : "Article créé avec succès");
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

  // Conversion des tags pour l'aperçu
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
