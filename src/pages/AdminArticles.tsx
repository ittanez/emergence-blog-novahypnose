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
import { Eye, Pencil, Plus, Trash2, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminSearchFilters from "@/components/AdminSearchFilters";
import Pagination from "@/components/Pagination";
import { Article } from "@/lib/types";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAllArticles, deleteArticle, getAllCategories } from "@/lib/services/articleService";
import { notifySubscribersOfNewArticle } from "@/lib/services/notificationService";

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isNotifying, setIsNotifying] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const articlesPerPage = 10;

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getAllCategories();
        if (error) throw error;
        if (data) {
          setCategories(data.map(cat => ({ name: cat.name })));
        }
      } catch (error: any) {
        console.error("Erreur lors de la récupération des catégories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Charger les articles avec filtres et pagination
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const { data, error, totalCount: count } = await getAllArticles({
          search: filters.search,
          category: filters.category,
          page: currentPage,
          limit: articlesPerPage
        });
          
        if (error) {
          throw error;
        }

        console.log("Articles récupérés:", data);
        
        if (data) {
          setArticles(data);
          setTotalCount(count || 0);
          setTotalPages(Math.ceil((count || 0) / articlesPerPage));
        } else {
          setArticles([]);
          setTotalCount(0);
          setTotalPages(1);
        }
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
  }, [filters, currentPage]);

  // Gérer les changements de filtres
  const handleFiltersChange = (newFilters: { search: string; category: string }) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset à la première page lors du changement de filtres
  };

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Gérer la suppression d'un article
  const handleDeleteClick = (article: Article) => {
    setSelectedArticle(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedArticle) return;
    
    try {
      setIsLoading(true);
      const { success, error } = await deleteArticle(selectedArticle.id);
        
      if (!success || error) {
        throw error;
      }
      
      setArticles(articles.filter(a => a.id !== selectedArticle.id));
      toast.success("Article supprimé avec succès");
      
      // Recharger les articles pour mettre à jour la pagination
      const { data, error: fetchError, totalCount: count } = await getAllArticles({
        search: filters.search,
        category: filters.category,
        page: currentPage,
        limit: articlesPerPage
      });
      
      if (!fetchError && data) {
        setArticles(data);
        setTotalCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / articlesPerPage));
      }
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

  // Nouvelle fonction pour notifier les abonnés
  const handleNotifySubscribers = async (article: Article) => {
    if (!article.published) {
      toast.error("L'article doit être publié pour notifier les abonnés");
      return;
    }

    setIsNotifying(article.id);
    
    try {
      console.log('Envoi des notifications pour l\'article:', article.title);
      const { success, error } = await notifySubscribersOfNewArticle(
        article.id,
        article.title,
        article.slug,
        article.excerpt
      );
      
      if (!success || error) {
        throw new Error(error || "Erreur lors de l'envoi des notifications");
      }
      
      toast.success("Notifications envoyées avec succès aux abonnés !");
    } catch (error: any) {
      console.error("Erreur lors de l'envoi des notifications:", error);
      toast.error("Erreur lors de l'envoi des notifications", { 
        description: error.message 
      });
    } finally {
      setIsNotifying(null);
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
          <div>
            <h1 className="text-3xl font-bold">Gestion des articles</h1>
            <p className="text-gray-600 mt-1">
              {totalCount} article{totalCount > 1 ? 's' : ''} au total
            </p>
          </div>
          <Button 
            onClick={handleNewArticle}
            className="brand-gradient flex items-center gap-2"
          >
            <Plus size={16} />
            Nouvel article
          </Button>
        </div>

        <AdminSearchFilters 
          categories={categories}
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
        />
        
        {isLoading ? (
          <div className="text-center py-8">Chargement des articles...</div>
        ) : articles.length === 0 ? (
          <Alert className="mb-6">
            <AlertDescription>
              {filters.search || filters.category 
                ? "Aucun article ne correspond à vos critères de recherche."
                : "Aucun article n'a été créé. Créez votre premier article en cliquant sur \"Nouvel article\"."
              }
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead className="hidden md:table-cell">Date de création</TableHead>
                    <TableHead className="hidden md:table-cell">Statut</TableHead>
                    <TableHead className="hidden md:table-cell">Catégories</TableHead>
                    <TableHead className="hidden lg:table-cell">Temps de lecture</TableHead>
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
                      <TableCell className="hidden md:table-cell">
                        {article.categories && article.categories.length > 0 
                          ? article.categories.join(", ") 
                          : "Non catégorisé"
                        }
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {article.read_time} min
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

                        {article.published && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleNotifySubscribers(article)}
                            disabled={isNotifying === article.id}
                            className="text-blue-500 hover:text-blue-700"
                            title="Notifier les abonnés"
                          >
                            {isNotifying === article.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                            ) : (
                              <Send size={16} />
                            )}
                          </Button>
                        )}
                        
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
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
