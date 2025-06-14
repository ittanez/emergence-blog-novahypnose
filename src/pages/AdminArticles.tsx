
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

// Import new components
import AdminArticlesFilters from '@/components/admin/AdminArticlesFilters';
import AdminArticlesActions from '@/components/admin/AdminArticlesActions';
import AdminArticlesStatusBadge from '@/components/admin/AdminArticlesStatusBadge';
import AdminArticlesImageCell from '@/components/admin/AdminArticlesImageCell';
import AdminArticlesSortableHeader from '@/components/admin/AdminArticlesSortableHeader';
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
    <div className="container mx-auto p-6">
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

      {/* Filters */}
      <AdminArticlesFilters
        searchQuery={filters.search}
        onSearchChange={(search) => handleFiltersChange({ ...filters, search })}
      />

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Date de publication</TableHead>
              <TableHead>Programmée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Catégories</TableHead>
              <TableHead className="w-16">Temps de lecture</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <AdminArticlesImageCell 
                    imageUrl={article.image_url}
                    title={article.title}
                  />
                </TableCell>
                
                <TableCell className="font-medium">
                  <div className="max-w-xs truncate" title={article.title}>
                    {article.title}
                  </div>
                </TableCell>
                
                <TableCell className="text-sm text-gray-600">
                  {formatDate(article.created_at)}
                </TableCell>
                
                <TableCell className="text-sm text-gray-600">
                  {article.published ? formatDate(article.published_at) : '-'}
                </TableCell>
                
                <TableCell className="text-sm text-gray-600">
                  {article.scheduled_for ? (
                    <span className="text-orange-600 font-medium">
                      {formatDate(article.scheduled_for)}
                    </span>
                  ) : '-'}
                </TableCell>
                
                <TableCell>
                  <AdminArticlesStatusBadge article={article} />
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {article.categories?.slice(0, 2).map((category: string) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {(article.categories?.length || 0) > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{(article.categories?.length || 0) - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="text-sm text-gray-600">
                  {article.read_time || '-'} min
                </TableCell>
                
                <TableCell>
                  <AdminArticlesActions
                    article={article}
                    isDeleting={false}
                    onView={() => handleViewArticle(article.slug)}
                    onEdit={() => handleEditArticle(article.id)}
                    onDelete={() => handleDeleteClick(article)}
                    onShare={() => {}}
                  />
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
    </div>
  );
};

export default AdminArticles;
