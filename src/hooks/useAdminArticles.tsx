
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Article } from "@/lib/types";
import { getAllArticles, deleteArticle, getAllCategories } from "@/lib/services/articleService";
import { notifySubscribersOfNewArticle } from "@/lib/services/notificationService";

export const useAdminArticles = () => {
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

  const articlesPerPage = 50;

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getAllCategories();
        if (error) throw error;
        if (data) {
          setCategories(data.map(cat => ({ name: cat.name || cat })));
        }
      } catch (error: any) {
        console.error("Erreur lors de la récupération des catégories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Charger les articles avec filtres et pagination (INCLURE LES BROUILLONS)
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        console.log("Récupération des articles avec les filtres:", {
          search: filters.search,
          category: filters.category,
          page: currentPage,
          limit: articlesPerPage,
          includeDrafts: true
        });
        
        // Récupérer TOUS les articles (publiés ET brouillons)
        const { data, error, count } = await getAllArticles(currentPage, articlesPerPage);
          
        if (error) {
          console.error("Erreur lors de la récupération des articles:", error);
          throw error;
        }

        console.log("Articles récupérés:", data);
        console.log("Nombre total d'articles:", count);
        
        if (data) {
          // Log pour vérifier les statuts des articles
          data.forEach(article => {
            console.log(`Article "${article.title}": published=${article.published}, scheduled_for=${article.scheduled_for}`);
          });
          
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

  const handleFiltersChange = (newFilters: { search: string; category: string }) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
      const { data, error: fetchError, count } = await getAllArticles(currentPage, articlesPerPage);
      
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

  return {
    articles,
    categories,
    isLoading,
    deleteDialogOpen,
    selectedArticle,
    isNotifying,
    filters,
    currentPage,
    totalPages,
    totalCount,
    setDeleteDialogOpen,
    handleFiltersChange,
    handlePageChange,
    handleDeleteClick,
    confirmDelete,
    handleNotifySubscribers
  };
};
