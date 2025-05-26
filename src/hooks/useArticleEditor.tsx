
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

  const handleTagsChange = (tags: string[]) => {
    const tagObjects = tags.map(tag => ({
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

  // MODIFIÉ : Gestion correcte du mode de publication
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

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setArticle(prev => ({ ...prev, title: newTitle }));
    
    if (!article.slug || article.slug === "") {
      const newSlug = await generateUniqueSlug(newTitle, article.id);
      setArticle(prev => ({ ...prev, slug: newSlug }));
    }
  };

  const handleCategoriesChange = (categories: string[]) => {
    console.log("Nouvelles catégories sélectionnées:", categories);
    setArticle(prev => ({ ...prev, categories }));
  };

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
    if (date && publishMode === "schedule") {
      setArticle(prev => ({ 
        ...prev, 
        scheduled_for: date.toISOString() 
      }));
    }
  };

  // MODIFIÉ : Sauvegarde avec gestion correcte des modes
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!article.title || !article.content) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Préparer l'article selon le mode de publication
      const articleToSave = { ...article };
      
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
