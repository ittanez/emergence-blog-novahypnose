
import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Article, Category } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAllCategories, saveArticle, generateUniqueSlug } from "@/lib/services/articleService";
import { useAuth } from "@/lib/contexts/AuthContext";

const AdminArticleEditor = () => {
  const { id } = useParams();
  const isEditing = id !== "new";
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [article, setArticle] = useState<Partial<Article>>({
    title: "",
    content: "",
    excerpt: "",
    image_url: "",
    published: false,
    category: "",
    slug: ""
  });

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
      if (!isEditing) return;
      
      try {
        setIsLoading(true);
        
        const { data: response, error } = await fetch(`/api/articles/${id}`).then(res => res.json());
        
        if (error) {
          throw error;
        }

        console.log("Article récupéré:", response);
        setArticle(response);
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

  const handleSwitchChange = (checked: boolean) => {
    setArticle(prev => ({ ...prev, published: checked }));
  };

  const handleCategoryChange = (value: string) => {
    setArticle(prev => ({ ...prev, category: value }));
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

  // Sauvegarder l'article
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!article.title || !article.content) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setIsSaving(true);
      
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
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/articles')}
          >
            Retour à la liste
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              name="title"
              value={article.title}
              onChange={handleTitleChange}
              placeholder="Titre de l'article"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug URL</Label>
              <Input
                id="slug"
                name="slug"
                value={article.slug || ''}
                onChange={handleChange}
                placeholder="titre-de-larticle"
              />
              <p className="text-sm text-gray-500">
                Identifiant unique dans l'URL de l'article
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select 
                value={article.category || ''} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Non catégorisé</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image_url">URL de l'image</Label>
            <Input
              id="image_url"
              name="image_url"
              value={article.image_url || ''}
              onChange={handleChange}
              placeholder="https://exemple.com/image.jpg"
            />
            <p className="text-sm text-gray-500">
              Laissez vide pour utiliser l'image par défaut
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="excerpt">Extrait</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={article.excerpt || ''}
              onChange={handleChange}
              placeholder="Bref résumé de l'article"
              className="h-20"
            />
            <p className="text-sm text-gray-500">
              Si non renseigné, les 150 premiers caractères du contenu seront utilisés
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Contenu *</Label>
            <Textarea
              id="content"
              name="content"
              value={article.content}
              onChange={handleChange}
              placeholder="Contenu de l'article en texte brut"
              className="min-h-[300px]"
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={article.published || false}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="published">Publier l'article</Label>
          </div>
          
          <div className="pt-4">
            <Button
              type="submit"
              className="brand-gradient"
              disabled={isSaving}
            >
              {isSaving ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Publier"}
            </Button>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminArticleEditor;
