import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { CalendarIcon, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Article, Category, Tag } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RichTextEditor from "@/components/RichTextEditor";
import TagInput from "@/components/TagInput";
import ArticlePreview from "@/components/ArticlePreview";
import CategoryMultiSelect from "@/components/CategoryMultiSelect";
import { getAllCategories, saveArticle, generateUniqueSlug, getArticleById } from "@/lib/services/articleService";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const AdminArticleEditor = () => {
  const { id } = useParams();
  const isEditing = id !== "new";
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
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

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getAllCategories();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setCategories(data);
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement des catégories:", error);
        toast.error("Impossible de charger les catégories", {
          description: error.message
        });
      }
    };
    
    fetchCategories();
  }, []);

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
      // Retirer les balises HTML et limiter à 150 caractères
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
      
      // Trier par fréquence et prendre les 5 premiers mots
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
    // Convertir les chaînes de caractères en objets Tag
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
    
    // Mettre à jour l'état de publication de l'article
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
    
    // Ne générer un slug que si l'utilisateur n'en a pas déjà saisi un manuellement
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

  // Sauvegarder l'article
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!article.title || !article.content) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Mettre à jour l'état de publication en fonction du mode choisi
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          Chargement de l'article...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {isEditing ? "Modifier l'article" : "Nouvel article"}
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2"
            >
              <Eye size={16} />
              Aperçu
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/articles')}
            >
              Retour à la liste
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Section principale - Contenu */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={article.title}
                    onChange={handleTitleChange}
                    placeholder="Titre de l'article"
                    required
                    className="text-xl font-medium"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <CategoryMultiSelect
                      selectedCategories={article.categories || []}
                      onChange={handleCategoriesChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL personnalisée (slug)</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={article.slug || ''}
                      onChange={handleChange}
                      placeholder="titre-de-larticle"
                    />
                    <p className="text-xs text-gray-500">
                      Identifiant unique dans l'URL de l'article
                    </p>
                  </div>
                </div>
              
                <div className="space-y-2">
                  <RichTextEditor
                    label="Contenu *"
                    value={article.content || ""}
                    onChange={handleContentChange}
                    height={500}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Extrait / Résumé</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={article.excerpt || ''}
                    onChange={handleChange}
                    placeholder="Bref résumé de l'article"
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500">
                    Affiché sur la page d'accueil. Si non renseigné, les premiers caractères du contenu seront utilisés.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Image principale</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="max-w-md"
                    />
                    {article.image_url && (
                      <div className="w-16 h-16 rounded overflow-hidden">
                        <img 
                          src={article.image_url} 
                          alt="Aperçu" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Format recommandé: 1200x630px
                  </p>
                </div>
              </div>

              <Separator className="my-6" />
              
              {/* Section Tags et Publication */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <TagInput
                    label="Tags"
                    tags={article.tags?.map(tag => typeof tag === 'string' ? tag : tag.name) || []}
                    onChange={handleTagsChange}
                    placeholder="Ajouter un tag..."
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Publication</h3>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="draft"
                        name="publishMode"
                        checked={publishMode === "draft"}
                        onChange={() => handlePublishModeChange("draft")}
                      />
                      <Label htmlFor="draft" className="cursor-pointer">
                        Enregistrer comme brouillon
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="publish"
                        name="publishMode"
                        checked={publishMode === "publish"}
                        onChange={() => handlePublishModeChange("publish")}
                      />
                      <Label htmlFor="publish" className="cursor-pointer">
                        Publier immédiatement
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="schedule"
                        name="publishMode"
                        checked={publishMode === "schedule"}
                        onChange={() => handlePublishModeChange("schedule")}
                      />
                      <Label htmlFor="schedule" className="cursor-pointer">
                        Programmer la publication
                      </Label>
                      
                      {publishMode === "schedule" && (
                        <div className="ml-6">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] justify-start text-left font-normal",
                                  !scheduledDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {scheduledDate ? format(scheduledDate, "PPP", { locale: fr }) : "Choisir une date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={scheduledDate}
                                onSelect={(date) => {
                                  setScheduledDate(date);
                                  if (date) {
                                    setArticle(prev => ({ 
                                      ...prev, 
                                      scheduled_for: date.toISOString() 
                                    }));
                                  }
                                }}
                                initialFocus
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* Section SEO */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Référencement (SEO)</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="seo_description">Méta-description</Label>
                  <Textarea
                    id="seo_description"
                    name="seo_description"
                    value={article.seo_description || ''}
                    onChange={handleChange}
                    placeholder="Description pour les moteurs de recherche"
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500">
                    Recommandation: 150-160 caractères maximum
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Mots-clés SEO</Label>
                  <TagInput
                    tags={article.keywords || []}
                    onChange={handleKeywordsChange}
                    placeholder="Ajouter un mot-clé..."
                  />
                  <p className="text-xs text-gray-500">
                    5-10 mots-clés pertinents pour votre article
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="pt-6">
            <Button
              type="submit"
              className="brand-gradient"
              disabled={isSaving}
            >
              {isSaving 
                ? "Enregistrement..." 
                : publishMode === "draft" 
                ? "Enregistrer comme brouillon" 
                : publishMode === "schedule" 
                ? "Programmer la publication" 
                : "Publier"}
            </Button>
          </div>
        </form>
      </main>
      
      {/* Aperçu de l'article */}
      <ArticlePreview
        article={{
          ...article,
          tags: getTagsForPreview(),
          created_at: article.created_at || new Date().toISOString()
        }}
        open={showPreview}
        onClose={() => setShowPreview(false)}
      />
      
      <Footer />
    </div>
  );
};

export default AdminArticleEditor;
