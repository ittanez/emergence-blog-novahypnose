
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Import simple components
import AdminArticlesDeleteDialog from '@/components/admin/AdminArticlesDeleteDialog';

// Import hook
import { useAdminArticles } from '@/hooks/useAdminArticles';

const AdminArticles = () => {
  const navigate = useNavigate();
  
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

  const handleNewArticle = () => {
    navigate('/admin/article/new');
  };

  const handleViewArticle = (slug: string) => {
    window.open(`/article/${slug}`, '_blank');
  };

  const handleEditArticle = (articleId: string) => {
    navigate(`/admin/article/${articleId}`);
  };

  // Format date utility
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des articles</h1>
          <p className="text-gray-600">{totalCount} articles au total</p>
        </div>
        <Button onClick={handleNewArticle}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Search only for now */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Rechercher par titre..."
            value={filters.search}
            onChange={(e) => handleFiltersChange({ search: e.target.value, category: filters.category })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">
                  <div className="max-w-xs truncate" title={article.title}>
                    {article.title}
                  </div>
                </TableCell>
                
                <TableCell className="text-sm text-gray-600">
                  {formatDate(article.created_at)}
                </TableCell>
                
                <TableCell>
                  <Badge variant={article.published ? "default" : "secondary"}>
                    {article.published ? "Publié" : "Brouillon"}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <button
                    onClick={() => handleEditArticle(article.id)}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => handleDeleteClick(article)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {articles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun article trouvé
        </div>
      )}

      {/* Delete Dialog */}
      <AdminArticlesDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        articleTitle={selectedArticle?.title || ''}
        onConfirm={confirmDelete}
        isDeleting={isLoading}
      />
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminArticles;
