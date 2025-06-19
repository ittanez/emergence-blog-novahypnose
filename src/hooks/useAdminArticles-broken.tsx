import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Article } from "@/lib/types";
import { getAllArticles, getAllCategories } from "@/lib/services/articleService";

export const useAdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [filters, setFilters] = useState({ 
    search: '', 
    category: '', 
    status: '', 
    sortBy: 'created_at', 
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getAllCategories();
        if (!error && data) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Erreur catégories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Charger les articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getAllArticles(1, 100);
        
        if (!error && data) {
          setArticles(data);
        } else {
          setArticles([]);
        }
      } catch (error) {
        console.error("Erreur articles:", error);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleDeleteClick = (article: Article) => {
    setSelectedArticle(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedArticle) {
      setArticles(prev => prev.filter(a => a.id !== selectedArticle.id));
      setDeleteDialogOpen(false);
      setSelectedArticle(null);
      toast.success("Article supprimé");
    }
  };

  return {
    articles,
    categories,
    isLoading,
    deleteDialogOpen,
    selectedArticle,
    isNotifying: null,
    filters,
    currentPage: 1,
    totalPages: 1,
    totalCount: articles.length,
    setDeleteDialogOpen,
    handleFiltersChange,
    handlePageChange: () => {},
    handleDeleteClick,
    confirmDelete,
    handleNotifySubscribers: () => {}
  };
};