import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Article } from "@/lib/types";
import { getAllArticles, getAllCategories } from "@/lib/services/articleService";
import { notifySubscribersOfNewArticle } from "@/lib/services/notificationService";

type SortField = 'title' | 'created_at' | 'published_at' | 'status';
type SortDirection = 'asc' | 'desc';

export const useAdminArticles = () => {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isNotifying, setIsNotifying] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const articlesPerPage = 10;

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getAllCategories();
        if (error) throw error;
        if (data) {
          setCategories(data);
        }
      } catch (error: any) {
        console.error("Erreur lors de la récupération des catégories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Charger les articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        console.log("Récupération des articles pour l'admin...");
        
        const { data, error, count } = await getAllArticles(currentPage, articlesPerPage);
          
        if (error) {
          console.error("Erreur lors de la récupération des articles:", error);
          throw error;
        }

        console.log("Articles récupérés pour l'admin:", data?.length || 0);

        if (data) {
          setAllArticles(data);
          setTotalCount(count || 0);
          setTotalPages(Math.ceil((count || 0) / articlesPerPage));
        } else {
          setAllArticles([]);
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
  }, [currentPage]);

  // Filtrer et trier les articles côté client
  useEffect(() => {
    let filtered = allArticles;

    // Filtrage par recherche
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(query))
      );
    }

    // Filtrage par catégorie
    if (filters.category) {
      filtered = filtered.filter(article =>
        article.categories && article.categories.includes(filters.category)
      );
    }

    // Tri
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'published_at':
          const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
          const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'status':
          // Ordre: Programmé > Brouillon > Publié
          const getStatus = (article: Article) => {
            if (article.scheduled_for && new Date(article.scheduled_for) > new Date()) return 0;
            if (!article.published) return 1;
            return 2;
          };
          comparison = getStatus(a) - getStatus(b);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setArticles(sorted);
    setTotalPages(Math.ceil(sorted.length / articlesPerPage));
  }, [allArticles, filters, sortField, sortDirection, articlesPerPage]);

  const handleFiltersChange = (newFilters: { search: string; category: string }) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc for dates, asc for title
      setSortField(field);
      setSortDirection(field === 'title' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  const handleDeleteClick = (article: Article) => {
    setSelectedArticle(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedArticle) return;
    
    try {
      setIsLoading(true);
      console.log("Suppression de l'article:", selectedArticle.id);

      // Simuler la suppression pour l'instant
      setAllArticles(allArticles.filter(a => a.id !== selectedArticle.id));
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

  // Obtenir les articles de la page actuelle
  const getPaginatedArticles = () => {
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    return articles.slice(startIndex, endIndex);
  };

  return {
    articles: getPaginatedArticles(),
    allArticlesCount: articles.length,
    categories,
    isLoading,
    deleteDialogOpen,
    selectedArticle,
    isNotifying,
    filters,
    currentPage,
    totalPages,
    totalCount,
    sortField,
    sortDirection,
    articlesPerPage,
    setDeleteDialogOpen,
    handleFiltersChange,
    handlePageChange,
    handleSort,
    handleDeleteClick,
    confirmDelete,
    handleNotifySubscribers
  };
};