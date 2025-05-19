
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/lib/types";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Helper function to transform Supabase data to our Article type
const transformArticleData = (data: any): Article => {
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    excerpt: data.excerpt || "",
    image_url: data.image_url || "",
    seo_description: "",
    keywords: [],
    category: "",
    author_id: typeof data.author === 'string' ? data.author : "",
    slug: data.slug || "",
    read_time: 0,
    published: data.published || false,
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at,
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
};

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Charger les articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }

        console.log("Articles récupérés:", data);
        
        // Transform each article to match our Article type
        const transformedArticles = data.map(transformArticleData);
        setArticles(transformedArticles);
      } catch (error: any) {
        console.error("Erreur lors de la récupération des articles:", error);
        toast.error("Impossible de charger les articles", { 
          description: error.message 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Gérer la suppression d'un article
  const handleDeleteClick = (article: Article) => {
    setSelectedArticle(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedArticle) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', selectedArticle.id);
        
      if (error) throw error;
      
      setArticles(articles.filter(a => a.id !== selectedArticle.id));
      toast.success("Article supprimé avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'article:", error);
      toast.error("Erreur lors de la suppression", { 
        description: error.message 
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedArticle(null);
      setIsLoading(false);
    }
  };

  // Navigation
  const handleNewArticle = () => {
    navigate("/admin/article/new");
  };

  const handleEditArticle = (id: string) => {
    navigate(`/admin/article/${id}`);
  };

  const handleViewArticle = (slug: string) => {
    if (slug) {
      window.open(`/article/${slug}`, '_blank');
    } else {
      toast.error("Cet article n'a pas de lien accessible");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestion des articles</h1>
          <Button 
            onClick={handleNewArticle}
            className="brand-gradient flex items-center gap-2"
          >
            <Plus size={16} />
            Nouvel article
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Chargement des articles...</div>
        ) : articles.length === 0 ? (
          <Alert className="mb-6">
            <AlertDescription>
              Aucun article n'a été créé. Créez votre premier article en cliquant sur "Nouvel article".
            </AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead className="hidden md:table-cell">Date de création</TableHead>
                  <TableHead className="hidden md:table-cell">Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map(article => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(article.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {article.published ? 
                        <span className="text-green-500">Publié</span> : 
                        <span className="text-gray-500">Brouillon</span>
                      }
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewArticle(article.slug)}
                        title="Voir l'article"
                      >
                        <Eye size={16} />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditArticle(article.id)}
                        title="Modifier l'article"
                      >
                        <Pencil size={16} />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteClick(article)}
                        className="text-red-500 hover:text-red-700"
                        title="Supprimer l'article"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 text-white hover:bg-red-600" 
              onClick={confirmDelete}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
};

export default AdminArticles;
