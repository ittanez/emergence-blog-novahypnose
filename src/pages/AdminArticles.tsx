
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminSearchFilters from "@/components/AdminSearchFilters";
import Pagination from "@/components/Pagination";
import AdminArticlesHeader from "@/components/admin/AdminArticlesHeader";
import AdminArticlesTable from "@/components/admin/AdminArticlesTable";
import AdminArticlesDeleteDialog from "@/components/admin/AdminArticlesDeleteDialog";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminArticles } from "@/hooks/useAdminArticles";

const AdminArticles = () => {
  const {
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
  } = useAdminArticles();

  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

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
        <AdminArticlesHeader 
          totalCount={totalCount}
          onNewArticle={handleNewArticle}
        />

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
            <AdminArticlesTable
              articles={articles}
              isNotifying={isNotifying}
              onViewArticle={handleViewArticle}
              onEditArticle={handleEditArticle}
              onNotifySubscribers={handleNotifySubscribers}
              onDeleteClick={handleDeleteClick}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
      
      <AdminArticlesDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
      
      <Footer />
    </div>
  );
};

export default AdminArticles;
