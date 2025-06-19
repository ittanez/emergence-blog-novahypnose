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

// Import simple hook
import { useAdminArticles } from '@/hooks/useAdminArticles';

const AdminArticles = () => {
  const navigate = useNavigate();
  
  const {
    articles,
    isLoading,
    deleteDialogOpen,
    selectedArticle,
    setDeleteDialogOpen,
    handleDeleteClick,
    confirmDelete
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
            <p className="text-gray-600">{articles.length} articles au total</p>
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
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Date de publication</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Catégories</TableHead>
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
                  
                  <TableCell className="text-sm text-gray-600">
                    {article.published ? formatDate(article.published_at) : '-'}
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={article.published ? "default" : "secondary"}>
                      {article.published ? "Publié" : "Brouillon"}
                    </Badge>
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

        {articles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun article trouvé
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