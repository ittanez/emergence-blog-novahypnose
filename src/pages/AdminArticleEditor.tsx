
import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminArticleEditor = () => {
  const { id } = useParams();
  const isEditing = id !== "new";
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [article, setArticle] = useState<Partial<Article>>({
    title: "",
    content: "",
    excerpt: "",
    image_url: "",
    published: false,
  });

  // Charger l'article si on est en mode édition
  useEffect(() => {
    const fetchArticle = async () => {
      if (!isEditing) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }

        console.log("Article récupéré:", data);
        
        // Transform the data to match our Article type
        const transformedData: Partial<Article> = {
          id: data.id,
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || "",
          image_url: data.image_url || "",
          published: data.published || false,
          slug: data.slug || "",
          category: "", // Default empty value
          author_id: typeof data.author === 'string' ? data.author : "",
          seo_description: "",
          keywords: [],
          read_time: 0,
          // Convert string[] tags to Tag[] if they exist
          tags: Array.isArray(data.tags) 
            ? data.tags.map(tag => ({ 
                id: "", 
                name: tag, 
                slug: tag.toLowerCase().replace(/\s+/g, '-'),
                created_at: new Date().toISOString()
              }))
            : undefined,
        };
        
        setArticle(transformedData);
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

  // Générer un slug à partir du titre
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
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
      
      // Générer un slug si nécessaire
      if (!article.slug) {
        article.slug = generateSlug(article.title);
      }
      
      let result;
      
      // Prepare data for Supabase (remove properties that don't exist in the articles table)
      const supabaseData = {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        image_url: article.image_url,
        published: article.published,
        updated_at: new Date().toISOString(),
        slug: article.slug,
        // Convert Tag[] to string[] if tags exist
        tags: article.tags ? article.tags.map(tag => tag.name) : undefined,
      };
      
      if (isEditing) {
        // Mise à jour d'un article existant
        result = await supabase
          .from('articles')
          .update(supabaseData)
          .eq('id', id);
      } else {
        // Création d'un nouvel article
        result = await supabase
          .from('articles')
          .insert({
            ...supabaseData,
            excerpt: article.excerpt || article.content.substring(0, 150) + '...',
          });
      }
      
      const { error } = result;
      
      if (error) throw error;
      
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
              onChange={handleChange}
              placeholder="Titre de l'article"
              required
            />
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
