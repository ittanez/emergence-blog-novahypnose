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
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Article } from '@/lib/types';

// Import simple hook
import { useAdminArticles } from '@/hooks/useAdminArticles';

// Fonction pour déterminer le statut de l'article
const getArticleStatus = (article: Article) => {
  if (article.scheduled_for && new Date(article.scheduled_for) > new Date()) {
    return 'scheduled';
  }
  if (article.published) {
    return 'published';
  }
  return 'draft';
};

const AdminArticles = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const {
    articles,
    allArticlesCount,
    isLoading,
    deleteDialogOpen,
    selectedArticle,
    currentPage,
    totalPages,
    sortField,
    sortDirection,
    articlesPerPage,
    setDeleteDialogOpen,
    handleDeleteClick,
    confirmDelete,
    handleFiltersChange,
    handlePageChange,
    handleSort
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

  // Render sort icon
  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-30" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Render status badge
  const renderStatusBadge = (article: Article) => {
    const status = getArticleStatus(article);

    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            🕐 Programmé
          </Badge>
        );
      case 'published':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">
            ✓ Publié
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            📝 Brouillon
          </Badge>
        );
    }
  };

  const startIndex = (currentPage - 1) * articlesPerPage + 1;
  const endIndex = Math.min(currentPage * articlesPerPage, allArticlesCount);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p>Chargement...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestion des articles</h1>
            <p className="text-gray-600 text-sm mt-1">
              {allArticlesCount > 0 ? (
                <>
                  Affichage de <span className="font-medium">{startIndex}</span> à <span className="font-medium">{endIndex}</span> sur <span className="font-medium">{allArticlesCount}</span> article{allArticlesCount > 1 ? 's' : ''}
                </>
              ) : (
                'Aucun article'
              )}
            </p>
          </div>
          <Button onClick={handleNewArticle}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel article
          </Button>
        </div>

        {/* Simple search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher par titre..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleFiltersChange({ search: e.target.value, category: '' });
            }}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    Titre
                    {renderSortIcon('title')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    Date de création
                    {renderSortIcon('created_at')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('published_at')}
                >
                  <div className="flex items-center">
                    Date de publication
                    {renderSortIcon('published_at')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Statut
                    {renderSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead>Catégories</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="max-w-xs truncate" title={article.title}>
                      {article.title}
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {formatDate(article.created_at)}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {article.scheduled_for && new Date(article.scheduled_for) > new Date() ? (
                      <span className="text-blue-600">
                        🕐 {formatDate(article.scheduled_for)}
                      </span>
                    ) : article.published ? (
                      formatDate(article.published_at)
                    ) : (
                      '-'
                    )}
                  </TableCell>

                  <TableCell>
                    {renderStatusBadge(article)}
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
                  
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewArticle(article.slug)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => handleEditArticle(article.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => handleDeleteClick(article)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>

              {/* Page numbers */}
              <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {articles.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500 border rounded-lg bg-gray-50">
            <p className="text-lg font-medium mb-2">Aucun article trouvé</p>
            <p className="text-sm">Essayez de modifier vos critères de recherche</p>
          </div>
        )}

        {/* Simple Delete Confirmation */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md">
              <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer l'article "{selectedArticle?.title}" ?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminArticles;